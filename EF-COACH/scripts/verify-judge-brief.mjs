#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

export function verifyJudgeBrief(root = process.cwd()) {
  const file = path.join(root, "docs/judging/JUDGE_BRIEF.md");
  const failures = [];

  if (!fs.existsSync(file)) {
    return {
      checked: false,
      sections: 0,
      evidenceRefs: 0,
      fastTestSteps: 0,
      failures: ["Missing docs/judging/JUDGE_BRIEF.md."],
    };
  }

  const markdown = read(root, "docs/judging/JUDGE_BRIEF.md");
  const sections = (markdown.match(/^## /gm) || []).length;
  const evidenceRefs = (markdown.match(/`(?:[^`]+\.md|scripts\/[^`]+\.mjs|landing\/index\.html)`/g) || []).length;
  const fastTest =
    markdown.split("## Try It Quickly")[1]?.split("## ")[0] ||
    markdown.split("## Fast Judge Test")[1]?.split("## ")[0] ||
    "";
  const fastTestSteps = (fastTest.match(/^\d+\. /gm) || []).length;

  const requiredText = [
    "A one-page read",
    "human case before opening every source file",
    "not a generic ADHD/productivity folder",
    "whole-person executive-function accessibility coach",
    "Coding is one proof scenario.",
    "food/body, calendar/inbox, messages/shame, home/admin loops, capture/re-entry, transitions, hyperfocus recovery, and shutdown",
    "The folder gives the coach a stable job instead of a pile of advice.",
    "cold-start receipt",
    "first contact scoreable",
    "six life surfaces",
    "calendar reality, inbox live obligations, reply debt, missed obligations, and scheduling friction",
    "reference/mode-router.md",
    "ally, strategist, engineer/executor, keeper, and recovery stances",
    "I need a coach to get started on this.",
    "My inbox and calendar are a mess and I do not know what is real.",
    "article",
    "long menu",
    "moralizing",
    "vague continuation",
    "unsafe clinical advice",
    "ICM as practical workflow architecture",
    "visible context, editable decisions, bounded handoffs, and auditable proof",
    "The landing page should make the product clear first. The source files carry the proof:",
    "docs/judging/PRODUCT_THESIS.md",
    "docs/judging/ICM_TRACE.md",
    "docs/judging/COMPETITION_RULES_TRACE.md",
    "coach/FIRST_RUN.md",
    "coach/FIRST_REPLY_SCORECARD.md",
    "demo/whole-person-tour.md",
    "reference/admin-ops-playbooks.md",
    "reference/mode-router.md",
    "evals/red-face-tests.md",
    "Unstuck is a coaching scaffold.",
    "It does not diagnose, treat, recommend medication, replace professional support, read accounts, send messages, edit calendars, or promise inbox zero.",
  ];

  for (const text of requiredText) {
    if (!markdown.includes(text)) {
      failures.push(`docs/judging/JUDGE_BRIEF.md is missing required text: ${text}`);
    }
  }

  if (sections !== 7) {
    failures.push(`Expected 7 judge brief sections, found ${sections}.`);
  }

  if (evidenceRefs < 13) {
    failures.push(`Expected at least 13 evidence references, found ${evidenceRefs}.`);
  }

  if (fastTestSteps !== 5) {
    failures.push(`Expected 5 fast judge test steps, found ${fastTestSteps}.`);
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
      failures.push(`docs/judging/JUDGE_BRIEF.md contains public-unsafe local/private text: ${text}`);
    }
  }

  return {
    checked: true,
    sections,
    evidenceRefs,
    fastTestSteps,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyJudgeBrief();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
