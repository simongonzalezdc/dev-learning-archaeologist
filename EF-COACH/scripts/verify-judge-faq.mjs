#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

export function verifyJudgeFaq(root = process.cwd()) {
  const file = path.join(root, "docs/judging/JUDGE_FAQ.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      questions: 0,
      evidenceRefs: 0,
      failures: ["Missing docs/judging/JUDGE_FAQ.md."],
    };
  }

  const markdown = read(root, "docs/judging/JUDGE_FAQ.md");
  const questions = (markdown.match(/^## /gm) || []).length;
  const evidenceRefs = (markdown.match(/Evidence:/g) || []).length;

  const requiredText = [
    "What is Unstuck Coach?",
    "Who exactly does it coach?",
    "Is this just an ADHD knowledge base?",
    "How should I cold-test it?",
    "What is an immediate fail?",
    "How does it fit ICM?",
    "What goes above the brief?",
    "one-page judge brief",
    "docs/judging/JUDGE_BRIEF.md",
    "What are the boundaries?",
    "six-stop whole-person tour",
    "I need a coach to get started on this.",
    "state, friction, one humane concrete move, held context, proof, capture, body-state routing, transition, recovery, and closure",
    "the next move is small enough to test",
    "Unstuck is not therapy, medical advice, diagnosis, medication guidance, autonomous account access, or a promise to clean someone's life for them.",
  ];

  for (const text of requiredText) {
    if (!markdown.includes(text)) {
      failures.push(`docs/judging/JUDGE_FAQ.md is missing required text: ${text}`);
    }
  }

  if (questions !== 8) {
    failures.push(`Expected 8 FAQ questions, found ${questions}.`);
  }

  if (evidenceRefs < 8) {
    failures.push(`Expected at least 8 evidence references, found ${evidenceRefs}.`);
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
      failures.push(`docs/judging/JUDGE_FAQ.md contains public-unsafe local/private text: ${text}`);
    }
  }

  return {
    checked: true,
    questions,
    evidenceRefs,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyJudgeFaq();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
