#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const requiredText = [
  "public-safe stance portfolio",
  "Ally / Stabilize",
  "Strategist / Choose",
  "Engineer / Execute",
  "This is not coding-only",
  "Keeper / Remember",
  "Recovery / Close",
  "Body state can outrank planning.",
  "Live obligations can outrank cleanup.",
  "Shame sorting can outrank reply drafting.",
  "Capture can outrank categorization.",
  "Closure can outrank one more task.",
  "Turning mode routing into a visible menu.",
  "original memory-keeper behavior",
];

export function verifyModeRouter(root = process.cwd()) {
  const file = path.join(root, "reference/mode-router.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      stances: 0,
      routingRules: 0,
      failures: ["Missing reference/mode-router.md."],
    };
  }

  const markdown = fs.readFileSync(file, "utf8");

  for (const text of requiredText) {
    if (!markdown.includes(text)) {
      failures.push(`Mode router is missing required text: ${text}`);
    }
  }

  const stanceRows = [...markdown.matchAll(/^\| (Ally|Strategist|Engineer|Keeper|Recovery) \//gm)];
  const routingRules = [...markdown.matchAll(/^\d+\. /gm)];

  if (stanceRows.length !== 5) {
    failures.push(`Expected 5 stance rows, got ${stanceRows.length}.`);
  }

  if (routingRules.length < 5) {
    failures.push(`Expected at least 5 routing rules, got ${routingRules.length}.`);
  }

  if (/coding-only[^;\n.]*mode/i.test(markdown) && !markdown.includes("This is not coding-only")) {
    failures.push("Engineer stance must explicitly reject coding-only interpretation.");
  }

  return {
    checked: true,
    stances: stanceRows.length,
    routingRules: routingRules.length,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyModeRouter();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
