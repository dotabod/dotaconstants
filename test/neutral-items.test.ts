import assert from "node:assert/strict";
import test from "node:test";
import vdfparser from "vdf-parser";

import { getNeutralItemNameTierMap } from "../tasks/util.ts";

test("reads flat neutral tiers and preserves recipe aliases", () => {
  const data = vdfparser.parse(`
    "neutral_items" {
      "neutral_tiers" {
        "1" { "items" { "item_occult_bracelet" "1" } }
        "2" { "items" { "item_recipe_pogo_stick" "1" } }
      }
    }
  `);

  assert.deepEqual(getNeutralItemNameTierMap(data.neutral_items), {
    item_occult_bracelet: 1,
    item_recipe_pogo_stick: 2,
    item_pogo_stick: 2,
  });
});

test("reads neutral items across the pools introduced in Dota 7.42", () => {
  const data = vdfparser.parse(`
    "neutral_items" {
      "neutral_tiers" {
        "1" {
          "item_pools" {
            "pool_a" { "options" "1" "items" { "item_chipped_vest" "1" } }
            "pool_b" { "options" "1" "items" { "item_red_ledger" "1" } }
            "pool_d" { "options" "1" "items" { "item_pogo_stick" "1" } }
          }
          "enhancements" { "global" { "item_enhancement_vital" "1" } }
        }
        "2" {
          "item_pools" {
            "pool_a" { "options" "1" "items" { "item_mana_draught" "1" } }
          }
        }
      }
    }
  `);

  assert.deepEqual(getNeutralItemNameTierMap(data.neutral_items), {
    item_chipped_vest: 1,
    item_red_ledger: 1,
    item_pogo_stick: 1,
    item_mana_draught: 2,
  });
});

test("fails loudly when a neutral tier has no recognized item lists", () => {
  assert.throws(
    () => getNeutralItemNameTierMap({ neutral_tiers: { "1": {} } }),
    /No item list for neutral tier 1/,
  );
});
