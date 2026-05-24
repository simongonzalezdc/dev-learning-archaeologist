#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function section(markdown, heading, nextHeading) {
  const after = markdown.split(heading)[1] || "";
  return nextHeading ? after.split(nextHeading)[0] || "" : after;
}

function tableRows(markdownSection) {
  return markdownSection
    .split("\n")
    .filter((line) => line.startsWith("| "))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("Week 5 requirement"))
    .filter((line) => !line.includes("Judging question"));
}

function bullets(markdownSection) {
  return markdownSection.split("\n").filter((line) => line.startsWith("- "));
}

export function verifyCompetitionRulesTrace(root = process.cwd()) {
  const file = path.join(root, "docs/judging/COMPETITION_RULES_TRACE.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      briefRequirementRows: 0,
      judgingQuestionRows: 0,
      aboveBriefProofBullets: 0,
      readyCheckBullets: 0,
      failures: ["Missing docs/judging/COMPETITION_RULES_TRACE.md."],
    };
  }

  const markdown = read(root, "docs/judging/COMPETITION_RULES_TRACE.md");
  const briefRequirementRows = tableRows(section(markdown, "## Brief Requirements", "## Judging Questions")).length;
  const judgingQuestionRows = tableRows(section(markdown, "## Judging Questions", "## Above-The-Brief Proof")).length;
  const aboveBriefProofBullets = bullets(section(markdown, "## Above-The-Brief Proof", "## Ready To Post Checks")).length;
  const readyCheckBullets = bullets(section(markdown, "## Ready To Post Checks")).length;

  const requiredText = [
    "This file maps the Week 5 brief to the exact artifact that satisfies each rule or judging question.",
    "Build a folder-based AI coach",
    "Pick a specific domain",
    "Make it portable into a Claude Project",
    "Coach, not knowledge base",
    "Submit a public GitHub repo link",
    "Include 2-3 sentences describing who the coach is and who it coaches",
    "Respect Premium/VIP eligibility",
    "Does it actually coach?",
    "Is the domain specific enough?",
    "Is the methodology clean and useful?",
    "Does the README make it easy for someone else to use?",
    "docs/judging/ICM_TRACE.md",
    "docs/judging/JUDGE_SCORECARD.md",
    "docs/judging/JUDGE_BRIEF.md",
    "docs/judging/JUDGE_FAQ.md",
    "scripts/verify-competition-rules-trace.mjs",
    "scripts/verify-judge-brief.mjs",
    "scripts/verify-publication-ready.mjs",
    "scripts/verify-github-public-url.mjs",
    "one-page above-the-brief case",
    "fast judge test",
    "ready publication state",
    "Eligibility is documented as confirmed before posting.",
    "Final public repository URL is inserted and verified through unauthenticated GitHub API access.",
    "Ready To Post Checks",
    "The approved public GitHub URL is present in `docs/judging/SUBMISSION.md`.",
  ];

  for (const text of requiredText) {
    if (!markdown.includes(text)) {
      failures.push(`docs/judging/COMPETITION_RULES_TRACE.md is missing required text: ${text}`);
    }
  }

  if (briefRequirementRows !== 12) {
    failures.push(`Expected 12 brief requirement rows, found ${briefRequirementRows}.`);
  }

  if (judgingQuestionRows !== 4) {
    failures.push(`Expected 4 judging question rows, found ${judgingQuestionRows}.`);
  }

  if (aboveBriefProofBullets < 13) {
    failures.push(`Expected at least 13 above-the-brief proof bullets, found ${aboveBriefProofBullets}.`);
  }

  if (readyCheckBullets !== 4) {
    failures.push(`Expected 4 ready-to-post check bullets, found ${readyCheckBullets}.`);
  }

  const staleLaunchText = [
    "Current Blockers",
    "blocked publication state",
    "Intentionally blocked until final approval",
    "placeholder in `docs/judging/SUBMISSION.md`",
    "folder owner must approve",
  ];

  for (const text of staleLaunchText) {
    if (markdown.includes(text)) {
      failures.push(`docs/judging/COMPETITION_RULES_TRACE.md contains stale pre-launch text: ${text}`);
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
      failures.push(`docs/judging/COMPETITION_RULES_TRACE.md contains public-unsafe local/private text: ${text}`);
    }
  }

  return {
    checked: true,
    briefRequirementRows,
    judgingQuestionRows,
    aboveBriefProofBullets,
    readyCheckBullets,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyCompetitionRulesTrace();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
