const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const repoRoot = join(__dirname, "..");

test("root test command exposes the nested live-demo suite", () => {
  const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));

  assert.equal(pkg.scripts.test, "node --test tests/*.test.js && npm --prefix EF-COACH test");
  assert.ok(existsSync(join(repoRoot, "EF-COACH", "live-demo", "test", "server.test.mjs")));
  assert.ok(existsSync(join(repoRoot, "EF-COACH", "live-demo", "test", "chat-ui.test.mjs")));
  assert.ok(existsSync(join(repoRoot, "EF-COACH", "live-demo", "test", "compose.test.mjs")));
});
