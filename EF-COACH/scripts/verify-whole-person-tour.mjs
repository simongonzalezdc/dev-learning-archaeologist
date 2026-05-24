#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const requiredText = [
  "Whole-Person Judge Tour",
  "whole-person executive-function accessibility coach",
  "not a coding helper, productivity article, or work-output extractor",
  "Food And Body",
  "Calendar And Inbox",
  "Messages And Shame",
  "Home And Admin Loops",
  "Capture And Re-Entry",
  "Closure And Recovery",
  "My inbox and calendar are a mess and I do not know what is real.",
  "time, money, safety, legal, relationship, or another person",
  "one quoted sentence plus one literal ask",
  "one surface touched, opened, moved, or marked",
  "one parked note or one restart breadcrumb",
  "one closed loop, parked loop, return handle, or body reset",
  "life surfaces, not productivity categories",
  "portable executive function for the whole human",
];

const forbiddenText = [
  ["/", "Users", "/"].join(""),
  ["PRIVATE", "_"].join(""),
  ["Cloak", "Browser"].join(""),
  "I will read your inbox",
  "I will edit your calendar",
  "I will send the reply",
];

export function verifyWholePersonTour(root = process.cwd()) {
  const file = "demo/whole-person-tour.md";
  const filePath = path.join(root, file);
  const failures = [];

  if (!fs.existsSync(filePath)) {
    failures.push(`Missing ${file}.`);
  }

  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const stops = [...content.matchAll(/^## Stop \d+:/gm)].length;
  const promptBlocks = [...content.matchAll(/^```text$/gm)].length;
  const proofChecks = [...content.matchAll(/^Proof check:/gm)].length;
  const failChecks = [...content.matchAll(/^Immediate fail:/gm)].length;

  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`${file} is missing required text: ${text}`);
    }
  }

  for (const text of forbiddenText) {
    if (content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${file} contains forbidden text: ${text}`);
    }
  }

  if (stops !== 6) {
    failures.push(`Expected 6 whole-person tour stops, found ${stops}.`);
  }

  if (promptBlocks !== 6) {
    failures.push(`Expected 6 pasteable prompt blocks, found ${promptBlocks}.`);
  }

  if (proofChecks !== 6) {
    failures.push(`Expected 6 proof checks, found ${proofChecks}.`);
  }

  if (failChecks !== 6) {
    failures.push(`Expected 6 immediate-fail checks, found ${failChecks}.`);
  }

  return {
    checked: true,
    stops,
    promptBlocks,
    proofChecks,
    failChecks,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyWholePersonTour();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
