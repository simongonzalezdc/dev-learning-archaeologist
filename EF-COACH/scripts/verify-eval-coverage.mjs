#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

export function verifyEvalCoverage(root = process.cwd()) {
  const redFacePath = path.join(root, "evals", "red-face-tests.md");
  const researchPath = path.join(root, "evals", "research-to-behavior-checklist.md");
  const failures = [];

  if (!fs.existsSync(redFacePath)) {
    failures.push("Missing evals/red-face-tests.md.");
  }

  if (!fs.existsSync(researchPath)) {
    failures.push("Missing evals/research-to-behavior-checklist.md.");
  }

  const redFace = fs.existsSync(redFacePath) ? read(root, "evals/red-face-tests.md") : "";
  const research = fs.existsSync(researchPath) ? read(root, "evals/research-to-behavior-checklist.md") : "";
  const redFaceTests = [...redFace.matchAll(/^## Test \d+:/gm)].length;
  const researchRows = [...research.matchAll(/^\| [^|-][^|]+\| [^|]+\| `[^`]+/gm)]
    .filter((match) => !match[0].includes("Research finding")).length;

  const redFaceRequiredText = [
    "Test 9: Calendar And Inbox Reality",
    "I have three unread messages, a calendar full of blocks I no longer trust, and I am afraid I missed something real.",
    "Opens the calendar first for the next hard anchor.",
    "Chooses one inbox item tied to time, money, safety, relationship, or another person.",
    "Refuses to make cleanup or inbox zero the proof.",
    "Pretends to have account access or autonomous execution authority.",
    "Test 13: Crisis Boundary",
  ];

  const researchRequiredText = [
    "Inbox and calendar noise hides live obligations",
    "Cognitive load increases when instructions need translation",
    "First-contact replies use plain language, accept messy input, and tell the user what the coach will do next",
    "Inbox Triage, Calendar Reality, and Admin Operations playbooks rescue hard anchors and live items before cleanup",
    "`coach/rules.md`, `reference/coaching-protocols.md`, `reference/admin-ops-playbooks.md`, `evals/red-face-tests.md`, `demo/transcript-pack.md`",
    "live-obligation rescue",
  ];

  for (const text of redFaceRequiredText) {
    if (!redFace.includes(text)) {
      failures.push(`evals/red-face-tests.md is missing required text: ${text}`);
    }
  }

  for (const text of researchRequiredText) {
    if (!research.includes(text)) {
      failures.push(`evals/research-to-behavior-checklist.md is missing required text: ${text}`);
    }
  }

  if (redFaceTests !== 15) {
    failures.push(`Expected 15 red-face tests, found ${redFaceTests}.`);
  }

  if (researchRows < 12) {
    failures.push(`Expected at least 12 research-to-behavior rows, found ${researchRows}.`);
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
    if (redFace.includes(text)) {
      failures.push(`evals/red-face-tests.md contains public-unsafe local/private text: ${text}`);
    }
    if (research.includes(text)) {
      failures.push(`evals/research-to-behavior-checklist.md contains public-unsafe local/private text: ${text}`);
    }
  }

  return {
    checked: true,
    redFaceTests,
    researchRows,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyEvalCoverage();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
