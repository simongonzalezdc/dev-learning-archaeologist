#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const requiredText = [
  "The fastest way to tell whether Unstuck Coach is really a coach is to judge the first reply to a stuck prompt.",
  "I need a coach to get started on this.",
  "Names the stuck point",
  "Gives one move",
  "Holds context",
  "Asks for proof",
  "Immediate fail patterns",
  "A productivity article.",
  "A long menu.",
  "Moralizing avoidance.",
  "You do not need to make this clear before I can help.",
  "The Week 5 brief asks whether the artifact actually coaches.",
  "coach/FIRST_RUN.md",
  "scripts/verify-first-reply-acceptance.mjs",
  "reference/safety-boundaries.md",
];

export function verifyFirstReplyScorecard(root = process.cwd()) {
  const file = path.join(root, "coach/FIRST_REPLY_SCORECARD.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      checks: 0,
      failures: ["Missing coach/FIRST_REPLY_SCORECARD.md"],
    };
  }

  const content = fs.readFileSync(file, "utf8");
  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`coach/FIRST_REPLY_SCORECARD.md is missing required text: ${text}`);
    }
  }

  const tableRows = (content.match(/^\| .+ \|$/gm) || []).length;
  if (tableRows < 6) {
    failures.push(`coach/FIRST_REPLY_SCORECARD.md table is too small: ${tableRows} rows`);
  }

  return {
    checked: true,
    checks: requiredText.length,
    tableRows,
    failures,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = verifyFirstReplyScorecard();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length > 0) {
    process.exitCode = 1;
  }
}
