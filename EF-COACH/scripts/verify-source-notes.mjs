#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceFile = "reference/source-notes.md";

const requiredSections = [
  "## Competition Fit",
  "## Design Lineage",
  "## Research-To-Behavior Translation",
  "## Key Design Choices",
  "## Portability Notes",
];

const requiredText = [
  "This file explains the design lineage without requiring non-public systems or external tools.",
  "Whole-person executive-function accessibility coaching for people whose lives stall at concrete access thresholds",
  "The folder follows the required shape:",
  "Executive-function accessibility workflows informed by ADHD and neurodivergent ergonomics.",
  "Non-public paths, phone numbers, personal names, and internal integrations were intentionally removed.",
  "The research is not included as a bibliography dump. It is translated into coach behavior:",
  "Working memory as limited external RAM",
  "Cognitive accessibility and low translation burden",
  "Plain Language Is Access",
  "does not make the user or judge decode jargon",
  "Task initiation as activation energy",
  "Time blindness",
  "Inhibitory control and novelty pull",
  "Communication Threat Armor, Return Without Shame, Forgiveness Reset",
  "Hyperfocus crash",
  "Somatic Translator and body-first prompts",
  "Natural Capture, artifacts over memory, system bankruptcy",
  "Three-Attempt Escape Hatch",
  "The coach should not answer \"How do I stop procrastinating?\" with a list of productivity tips.",
  "After avoidance or interruption, the coach reconstructs from visible artifacts",
  "The coach treats shame as friction to remove, not motivation to exploit.",
  "The coach does not require:",
];

const staleScopeText = [
  "for people with ADHD, ADHD-like, or neurodivergent executive-function friction",
  "ADHD-friendly accessibility workflows",
  "ADHD accessibility ergonomics",
  "first 5 minutes",
  "first five minutes",
  "only for coding",
  "coding-only coach",
];

const privateLeakFragments = [
  ["/", "Users", "/"].join(""),
  [".cloak", "browser"].join(""),
  ["PRIVATE", "_"].join(""),
  [".o", "mx"].join(""),
  ["docs", "plans"].join("/"),
  ["out", "put"].join("") + "/",
  ["Mac", "Mini"].join(" "),
  ["Cloak", "Browser"].join(""),
  ["skool", "competitions"].join("_"),
  ["EF", "COACH"].join("-"),
  ["Si", "mon"].join(""),
];

function sectionBody(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start === -1) return "";
  const afterHeading = start + heading.length;
  const next = markdown.slice(afterHeading).search(/\n## /);
  if (next === -1) return markdown.slice(afterHeading);
  return markdown.slice(afterHeading, afterHeading + next);
}

export function verifySourceNotes(root = process.cwd()) {
  const filePath = path.join(root, sourceFile);
  const failures = [];

  if (!fs.existsSync(filePath)) {
    failures.push(`Missing ${sourceFile}.`);
  }

  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      failures.push(`${sourceFile} is missing required section: ${section}`);
    }
  }

  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`${sourceFile} is missing required text: ${text}`);
    }
  }

  for (const text of staleScopeText) {
    if (content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${sourceFile} contains stale scope text: ${text}`);
    }
  }

  for (const fragment of privateLeakFragments) {
    if (content.includes(fragment)) {
      failures.push(`${sourceFile} contains public-unsafe private/local text: ${fragment}`);
    }
  }

  const designLineageBullets = [...sectionBody(content, "## Design Lineage").matchAll(/^- /gm)].length;
  const researchRows = [...sectionBody(content, "## Research-To-Behavior Translation").matchAll(/^\| [^|-][^|]+\| [^|]+\|$/gm)]
    .filter((match) => !match[0].includes("Research thread")).length;
  const keyDesignChoices = [...content.matchAll(/^### /gm)].length;
  const portabilityBullets = [...sectionBody(content, "## Portability Notes").matchAll(/^- /gm)].length;

  if (designLineageBullets < 9) {
    failures.push(`Expected at least 9 design-lineage bullets, found ${designLineageBullets}.`);
  }

  if (researchRows < 9) {
    failures.push(`Expected at least 9 research-to-behavior rows in ${sourceFile}, found ${researchRows}.`);
  }

  if (keyDesignChoices < 7) {
    failures.push(`Expected at least 7 key design choices, found ${keyDesignChoices}.`);
  }

  if (portabilityBullets < 6) {
    failures.push(`Expected at least 6 portability bullets, found ${portabilityBullets}.`);
  }

  return {
    checked: true,
    sections: requiredSections.length,
    designLineageBullets,
    researchRows,
    keyDesignChoices,
    portabilityBullets,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifySourceNotes();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
