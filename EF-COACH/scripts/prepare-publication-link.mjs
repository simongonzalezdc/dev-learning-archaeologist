#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { hasPublicGitHubUrl, isDisallowedSubmissionRepo } from "./verify-publication-ready.mjs";

const root = process.cwd();
const submissionPath = path.join(root, "docs/judging/SUBMISSION.md");

function usage() {
  return [
    "Usage:",
    "  node scripts/prepare-publication-link.mjs --url https://github.com/OWNER/REPO",
    "  node scripts/prepare-publication-link.mjs --url https://github.com/OWNER/REPO --write",
    "",
    "Default is dry-run. Use --write only after final approval and final public repo creation.",
    "After inserting the final link, run verify-github-public-url.mjs to prove the URL is publicly visible.",
  ].join("\n");
}

function parseArgs(argv) {
  const result = {
    url: "",
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      result.write = true;
    } else if (arg === "--url") {
      result.url = argv[index + 1] || "";
      index += 1;
    } else if (!result.url && /^https?:\/\//i.test(arg)) {
      result.url = arg;
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else {
      result.unknown = arg;
    }
  }

  return result;
}

function replaceGitHubLink(submission, url) {
  const nextBlock = `GitHub link:\n\n\`\`\`text\n${url}\n\`\`\``;
  const pattern = /GitHub link:\s*```text\s*[\s\S]*?```/i;
  if (!pattern.test(submission)) {
    throw new Error("Could not find the GitHub link block in docs/judging/SUBMISSION.md.");
  }
  return submission.replace(pattern, nextBlock);
}

const args = parseArgs(process.argv.slice(2));
const failures = [];

if (args.help) {
  console.log(usage());
  process.exit(0);
}

if (args.unknown) {
  failures.push(`Unknown argument: ${args.unknown}`);
}

if (!args.url) {
  failures.push("Missing --url https://github.com/OWNER/REPO.");
} else if (!hasPublicGitHubUrl(args.url)) {
  failures.push("URL must be a final public GitHub repository URL, for example https://github.com/OWNER/REPO.");
} else if (isDisallowedSubmissionRepo(args.url)) {
  failures.push("URL must be a clean Week 5 public repository, not the old Week 3 submission repo.");
}

if (!fs.existsSync(submissionPath)) {
  failures.push("Missing docs/judging/SUBMISSION.md.");
}

if (failures.length > 0) {
  console.log(JSON.stringify({ status: "blocked", failures, usage: usage() }, null, 2));
  process.exitCode = 1;
} else {
  const before = fs.readFileSync(submissionPath, "utf8");
  const after = replaceGitHubLink(before, args.url);
  const changed = before !== after;

  if (args.write && changed) {
    fs.writeFileSync(submissionPath, after);
  }

  console.log(JSON.stringify({
    status: args.write ? "written" : "dry-run",
    githubLink: args.url,
    changed,
    wrote: Boolean(args.write && changed),
    nextCommand: "node scripts/verify-publication-ready.mjs",
  }, null, 2));
}
