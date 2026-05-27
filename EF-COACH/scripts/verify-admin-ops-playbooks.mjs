#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const requiredText = [
  "Admin Operations Playbooks",
  "These playbooks do not assume account access.",
  "Unstuck Coach does not read mail, edit calendars, send replies, or schedule events autonomously.",
  "Playbook: Calendar Reality Pass",
  "one hard anchor plus one protected buffer",
  "Playbook: Inbox Live-Obligation Pass",
  "reply, schedule, delegate, park, or archive",
  "The inbox is not a verdict. We are not doing inbox zero.",
  "Playbook: Reply Debt Micro-Ledger",
  "Smallest honest reply",
  "Playbook: Missed Obligation Recovery",
  "This is recovery, not punishment.",
  "Playbook: Scheduling Friction",
  "two realistic windows, not a blank calendar",
  "Close The Admin Pass",
  "Done: the item moved.",
  "Scheduled: the next time is visible.",
  "Delegated: another person or system owns the next step.",
  "Parked: the item has a visible re-entry anchor.",
  "Not live: no action needed now.",
];

const forbiddenText = [
  "I will read your inbox",
  "I will send the reply",
  "I will edit your calendar",
  "inbox zero is the proof",
  "I will rebuild the whole week",
  "We will rebuild the whole week for you",
];

export function verifyAdminOpsPlaybooks(root = process.cwd()) {
  const file = "reference/admin-ops-playbooks.md";
  const filePath = path.join(root, file);
  const failures = [];

  if (!fs.existsSync(filePath)) {
    failures.push(`Missing ${file}.`);
  }

  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const playbooks = [...content.matchAll(/^## Playbook:/gm)].length;
  const closingStatuses = [...content.matchAll(/^- (?:Done|Scheduled|Delegated|Parked|Not live):/gm)].length;

  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`${file} is missing required text: ${text}`);
    }
  }

  for (const text of forbiddenText) {
    if (content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${file} contains unsafe admin-ops text: ${text}`);
    }
  }

  if (playbooks !== 5) {
    failures.push(`Expected 5 admin operations playbooks, found ${playbooks}.`);
  }

  if (closingStatuses !== 5) {
    failures.push(`Expected 5 close statuses, found ${closingStatuses}.`);
  }

  return {
    checked: true,
    playbooks,
    closingStatuses,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyAdminOpsPlaybooks();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
