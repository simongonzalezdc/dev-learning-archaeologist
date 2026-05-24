#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const requiredText = [
  "designed as a folder, not an app",
  "whole-person executive-function accessibility",
  "Folder over app",
  "Whole-person EF access",
  "Mode routing",
  "Interpretable context",
  "Proof before persuasion",
  "Boundaries are product quality",
  "state, friction, move, hold, check, close",
  "not a therapist, diagnostic tool, medication advisor, or autonomous execution engine",
  "Which artifacts prove or disprove the claims?",
];

const requiredEvidence = [
  "coach/PROJECT_INSTRUCTIONS.md",
  "coach/START_HERE.md",
  "coach/FIRST_RUN.md",
  "scripts/verify-first-run.mjs",
  "demo/transcript-pack.md",
  "scripts/verify-first-reply-acceptance.mjs",
  "docs/evidence/RECEIPTS.md",
  "docs/judging/JUDGE_SCORECARD.md",
  "scripts/verify-public-bundle.mjs",
  "reference/safety-boundaries.md",
  "reference/mode-router.md",
  "scripts/verify-mode-router.mjs",
];

export function verifyProductThesis(root = process.cwd()) {
  const file = path.join(root, "docs/judging/PRODUCT_THESIS.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      sections: 0,
      evidenceRefs: 0,
      failures: ["Missing docs/judging/PRODUCT_THESIS.md"],
    };
  }

  const content = fs.readFileSync(file, "utf8");
  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`docs/judging/PRODUCT_THESIS.md is missing required text: ${text}`);
    }
  }
  for (const evidence of requiredEvidence) {
    if (!content.includes(evidence)) {
      failures.push(`docs/judging/PRODUCT_THESIS.md is missing evidence reference: ${evidence}`);
    }
  }

  return {
    checked: true,
    sections: (content.match(/^## /gm) || []).length,
    evidenceRefs: requiredEvidence.filter((evidence) => content.includes(evidence)).length,
    failures,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = verifyProductThesis();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length > 0) {
    process.exitCode = 1;
  }
}
