import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { buildCoachInstructions, CONTEXT_FILES } from "../lib/context.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "../..");

test("buildCoachInstructions loads the coach contract from public project files", async () => {
  const instructions = await buildCoachInstructions({ rootDir });

  assert.ok(CONTEXT_FILES.includes("coach/PROJECT_INSTRUCTIONS.md"));
  assert.match(instructions, /You are Unstuck Coach/);
  assert.match(instructions, /Use the coaching loop/);
  assert.match(instructions, /I need a coach to get started on this/);
  assert.doesNotMatch(instructions, /PRIVATE_/);
  assert.ok(instructions.length > 10_000);
  assert.ok(instructions.length < 80_000);
});
