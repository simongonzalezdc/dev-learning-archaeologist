const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const repoRoot = join(__dirname, "..");

test("root test command stays scoped to Dev Learning Archaeologist", () => {
  const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));

  assert.equal(pkg.name, "dev-learning-archaeologist");
  assert.equal(pkg.scripts.test, "node --test tests/*.test.js");
  assert.equal(existsSync(join(repoRoot, "EF-COACH")), false);
});
