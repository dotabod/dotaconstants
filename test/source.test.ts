import assert from "node:assert/strict";
import test from "node:test";

import { createSourceReader, gameSourceUrl } from "../tasks/source.ts";

const revision = "a".repeat(40);
const url = "https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.txt";

test("all game resources use the detected source commit", () => {
  assert.equal(gameSourceUrl(url, revision), url.replace("/master/", `/${revision}/`));
  assert.equal(gameSourceUrl(gameSourceUrl(url, revision), revision), gameSourceUrl(url, revision));
  assert.equal(gameSourceUrl("https://www.dota2.com/datafeed/herodata", revision), "https://www.dota2.com/datafeed/herodata");
  assert.throws(() => gameSourceUrl(url, "not-a-commit"), /full commit SHA/);
});

test("duplicate resource requests are fetched only once", async () => {
  const requested: string[] = [];
  const read = createSourceReader(revision, async (input) => {
    requested.push(String(input));
    return new Response("hero data");
  });
  assert.deepEqual(await Promise.all([read(url), read(url)]), ["hero data", "hero data"]);
  assert.deepEqual(requested, [gameSourceUrl(url, revision)]);
});

test("HTTP failures fail regeneration instead of parsing an error page", async () => {
  const read = createSourceReader(revision, async () => new Response("Forbidden", { status: 403 }));
  await assert.rejects(read(url), /HTTP 403/);
});
