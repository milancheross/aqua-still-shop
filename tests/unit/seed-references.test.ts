import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("seed references", () => {
  it("connects every seeded product to a subcategory that the seed creates", () => {
    const seed = readFileSync(new URL("../../prisma/seed.ts", import.meta.url), "utf8");
    const created = new Set([...seed.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]));
    const used = [...seed.matchAll(/subcategorySlug: "([^"]+)"/g)].map((match) => match[1]);
    const missing = [...new Set(used)].filter((slug) => !created.has(slug));
    assert.deepEqual(missing, []);
    assert.equal(used.includes("pumpe-za-vodu"), true);
    assert.equal(used.includes("slavine-i-baterije"), true);
  });
});
