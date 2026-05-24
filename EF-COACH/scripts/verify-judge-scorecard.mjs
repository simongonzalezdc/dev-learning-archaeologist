#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function fastPathSteps(markdown) {
  const section = markdown.split("## Fast Scoring Path")[1]?.split("## ")[0] || "";
  return [...section.matchAll(/^(\d+)\. /gm)].map((match) => Number.parseInt(match[1], 10));
}

export function verifyJudgeScorecard(root = process.cwd()) {
  const file = path.join(root, "docs/judging/JUDGE_SCORECARD.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      criteriaRows: 0,
      fastPathSteps: 0,
      failures: ["Missing docs/judging/JUDGE_SCORECARD.md."],
    };
  }

  const markdown = read(root, "docs/judging/JUDGE_SCORECARD.md");
  const criteriaRows = [...markdown.matchAll(/^\| [^|-][^|]+\| [^|]+\| [^|]+\| [^|]+\| `[^`]+/gm)]
    .filter((match) => !match[0].includes("Criterion")).length;
  const steps = fastPathSteps(markdown);

  const requiredText = [
    "Total: 18 points.",
    "Specific domain",
    "Product thesis",
    "Folder methodology",
    "Coach first, knowledge base second",
    "Cold usability",
    "Behavior under pressure",
    "shifting stance instead of giving one generic voice",
    "Research-to-behavior conversion",
    "Safety and boundaries",
    "Presentation and proof",
    "repeatable desktop, mobile, and narrow mobile screenshot checks",
    "calendar/inbox operations band",
    "Open `landing/index.html` and inspect the calendar/inbox operations band.",
    "docs/judging/JUDGE_BRIEF.md",
    "one-page judge brief",
    "docs/judging/JUDGE_FAQ.md",
    "demo/whole-person-tour.md",
    "scripts/verify-judge-faq.mjs",
    "scripts/verify-judge-scorecard.mjs",
    "scripts/verify-judge-brief.mjs",
    "scripts/verify-eval-coverage.mjs",
    "scripts/verify-whole-person-tour.mjs",
    "scripts/render-review-screenshots.mjs",
    "reference/mode-router.md",
    "scripts/verify-mode-router.mjs",
    "node scripts/final-review-smoke.mjs --expect-ready --skip-build",
    "live-obligation rescue before cleanup",
    "If the coach gives a productivity article, score the coach-behavior criterion 0",
  ];

  for (const text of requiredText) {
    if (!markdown.includes(text)) {
      failures.push(`docs/judging/JUDGE_SCORECARD.md is missing required text: ${text}`);
    }
  }

  if (criteriaRows !== 9) {
    failures.push(`Expected 9 judge scorecard criteria rows, found ${criteriaRows}.`);
  }

  if (steps.length < 10) {
    failures.push(`Expected at least 10 fast scoring path steps, found ${steps.length}.`);
  }

  for (let index = 0; index < steps.length; index += 1) {
    const expected = index + 1;
    if (steps[index] !== expected) {
      failures.push(`Fast scoring path step ${index + 1} is numbered ${steps[index]}, expected ${expected}.`);
    }
  }

  const forbiddenText = [
    ["PRIVATE", "_"].join(""),
    [".cloak", "browser"].join(""),
    [".o", "mx"].join(""),
    ["docs", "plans"].join("/"),
    ["out", "put"].join("") + "/",
    ["/", "Users", "/"].join(""),
    ["Si", "mon"].join(""),
  ];

  for (const text of forbiddenText) {
    if (markdown.includes(text)) {
      failures.push(`docs/judging/JUDGE_SCORECARD.md contains public-unsafe local/private text: ${text}`);
    }
  }

  return {
    checked: true,
    criteriaRows,
    fastPathSteps: steps.length,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyJudgeScorecard();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
