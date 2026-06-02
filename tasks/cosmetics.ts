import fs from "node:fs";
import vdfparser from "vdf-parser";

// Builds build/cosmetics.json: a map of cosmetic item definition index (the
// `wearableN` values Dota sends over GSI) -> display metadata used to render a
// streamer's equipped loadout and link out to the Steam Community Market.
//
// Two sources are merged:
//  1. items_game.txt (+ items_english.txt) — the full universe of wearables,
//     giving name / equip slot / rarity for EVERY defindex, including items that
//     are not marketable.
//  2. Steam economy API (GetAssetPrices -> GetAssetClassInfo) — adds a working
//     CDN icon, the market_hash_name, and the marketable flag, but only covers
//     the ~6.5k items that have economy/store entries.
//
// Items whose prefab is not `wearable` (default_item base parts, couriers, etc.)
// are dropped so only the hero's equipped cosmetics remain.

const itemsGameUrl =
  "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/items/items_game.txt";
const itemsEnglishUrl =
  "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/localization/items_english.txt";

const STEAM_WEB_API = process.env.STEAM_WEB_API;
// Icon hashes resolve against this CDN host (the cloudflare host 301-redirects).
const ICON_BASE = "https://steamcommunity-a.akamaihd.net/economy/image/";

interface Cosmetic {
  name: string;
  slot: string;
  rarity?: string;
  marketHashName?: string;
  marketable: boolean;
  icon?: string;
}

async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} fetching ${url}`);
  return resp.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status} fetching ${url}`);
  return resp.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// defindex -> { classid, marketable, icon, market_hash_name } from the economy API.
async function fetchEconomy(): Promise<
  Map<string, { marketHashName: string; marketable: boolean; icon?: string }>
> {
  const out = new Map<
    string,
    { marketHashName: string; marketable: boolean; icon?: string }
  >();
  if (!STEAM_WEB_API) {
    console.warn(
      "STEAM_WEB_API not set — cosmetics.json will have names/slots but no icons or market data.",
    );
    return out;
  }

  const prices = await fetchJson<{
    result: { assets: { name: string; classid: string }[] };
  }>(
    `https://api.steampowered.com/ISteamEconomy/GetAssetPrices/v1/?key=${STEAM_WEB_API}&appid=570`,
  );
  const assets = prices.result?.assets ?? [];
  // classid -> defindex, so we can attribute GetAssetClassInfo rows back.
  const classToDef = new Map<string, string>();
  for (const a of assets) classToDef.set(a.classid, a.name);

  const classids = [...classToDef.keys()];
  const BATCH = 100;
  for (let i = 0; i < classids.length; i += BATCH) {
    const batch = classids.slice(i, i + BATCH);
    const params = batch
      .map((id, idx) => `classid${idx}=${id}`)
      .join("&");
    const info = await fetchJson<{ result: Record<string, any> }>(
      `https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/?key=${STEAM_WEB_API}&appid=570&language=english&class_count=${batch.length}&${params}`,
    );
    for (const [classid, val] of Object.entries(info.result ?? {})) {
      if (!val || typeof val !== "object" || !("classid" in val)) continue;
      const defindex = classToDef.get(classid);
      if (!defindex) continue;
      out.set(defindex, {
        marketHashName: (val as any).market_hash_name,
        marketable: (val as any).marketable === "1",
        icon: (val as any).icon_url
          ? ICON_BASE + (val as any).icon_url
          : undefined,
      });
    }
    await sleep(250); // be polite to the Steam API
  }
  return out;
}

async function buildCosmetics() {
  const [itemsGameRaw, itemsEnglishRaw, economy] = await Promise.all([
    fetchText(itemsGameUrl),
    fetchText(itemsEnglishUrl),
    fetchEconomy(),
  ]);

  const itemsGame: any = vdfparser.parse(itemsGameRaw);
  const itemsEnglish: any = vdfparser.parse(itemsEnglishRaw);

  const items = itemsGame.items_game?.items ?? {};
  const tokens: Record<string, string> = itemsEnglish.lang?.Tokens ?? {};
  // Localization tokens are case-insensitive; build a lowercase lookup.
  const locLower = new Map<string, string>();
  for (const [k, v] of Object.entries(tokens)) locLower.set(k.toLowerCase(), v);

  const localize = (token?: string, fallback = ""): string => {
    if (!token) return fallback;
    const key = token.replace(/^#/, "").toLowerCase();
    return locLower.get(key) ?? fallback;
  };

  const out: Record<string, Cosmetic> = {};
  for (const [defindex, raw] of Object.entries(items)) {
    const item = raw as any;
    if (!item || typeof item !== "object") continue;
    if (item.prefab !== "wearable") continue; // hero-equipped cosmetics only
    if (!/^\d+$/.test(defindex)) continue;

    const name = localize(item.item_name, item.name ?? "");
    if (!name) continue;

    const econ = economy.get(defindex);
    out[defindex] = {
      name,
      slot: item.item_slot ?? "misc",
      rarity: item.item_rarity,
      marketHashName: econ?.marketHashName ?? name,
      marketable: econ?.marketable ?? false,
      icon: econ?.icon,
    };
  }

  fs.writeFileSync("./build/cosmetics.json", `${JSON.stringify(out)}\n`);
  console.log(
    `Wrote build/cosmetics.json: ${Object.keys(out).length} wearables (${
      [...Object.values(out)].filter((c) => c.icon).length
    } with icons).`,
  );
}

buildCosmetics().catch((err) => {
  console.error(err);
  process.exit(1);
});
