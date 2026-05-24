#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { publicBundleFiles } from "./public-bundle-files.mjs";

const binaryPublicBundleFiles = new Set([
  "landing/assets/unstuck-coach-logo.png",
  "landing/assets/unstuck-admin-bridge.jpg",
]);

const guardScriptFiles = new Set([
  "scripts/build-public-bundle.mjs",
  "scripts/verify-final-privacy-scan.mjs",
  "scripts/verify-public-bundle.mjs",
  "scripts/verify-source-notes.mjs",
]);

const publicSafetyPatterns = [
  /PRIVATE_[A-Z0-9_]*\.md/i,
  /\/Users\/[^/\s)'"`]+/i,
  /\/private\/(?:tmp|var)\//i,
  /\b(?:Desktop|Downloads|Documents)\/[^\s)'"`]+/i,
  /\bworkspaces\/[^\s)'"`]+/i,
  /\b(?:api[_-]?key|secret|token|password)\b\s*[:=]/i,
  /\b[A-Za-z0-9_.-]+\.(?:sqlite|db|jsonl)\b/i,
  /\b(?:phone|sms|email|account|credential)s?\s*[:=]\s*[^\s]+/i,
];

const disallowedLiteralFragments = [
  ["source", "Branch"].join(""),
  ["codex", "unstuck"].join("/"),
  ["skool", "competitions"].join("_"),
  ["EF", "COACH"].join("-"),
  ["si", "mon", "gonzalez"].join(""),
  ["Si", "mon"].join(""),
  ["Mac", "Mini"].join(" "),
  ["KyaniteLabs", "dev-learning"].join("/"),
  ["Desktop", "liam-private"].join("/"),
  ["workspaces", "liam"].join("/"),
  ["Cloak", "Browser"].join(""),
  [".cloak", "browser"].join(""),
  ["Skool", "comment", "sweep"].join(" "),
  ["Tw", "ilio"].join(""),
  ["Tele", "gram"].join(""),
  ["patterns", "db"].join("."),
  ["calls", "jsonl"].join("."),
  ["para", "sqlite"].join("."),
];

const unfinishedPresentationPatterns = [
  /\bTODO\s*:/,
];

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(root, file) {
  return fs.existsSync(path.join(root, file));
}

function isScript(file) {
  return file.startsWith("scripts/");
}

function isPresentationFile(file) {
  return !isScript(file) && file !== ".gitignore";
}

function contentForPrivacyScan(file, content) {
  const withoutRepoUrls = content.replace(
    /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/)?/gi,
    "https://github.com/OWNER/REPO",
  ).replace(
    /https:\/\/[A-Za-z0-9_.-]+\.github\.io\/[^\s)"'<>]+/gi,
    "https://OWNER.github.io/REPO/",
  );
  if (file !== "docs/judging/SUBMISSION.md") return withoutRepoUrls;
  return withoutRepoUrls.replace(
    /GitHub link:\s*```text\s*[\s\S]*?```/i,
    "GitHub link:\n\n```text\nhttps://github.com/OWNER/REPO\n```",
  );
}

export function verifyFinalPrivacyScan(root = process.cwd()) {
  const failures = [];
  let scannedTextFiles = 0;
  let skippedBinaryFiles = 0;
  let skippedGuardScripts = 0;

  for (const file of publicBundleFiles) {
    if (!exists(root, file)) {
      failures.push(`Missing public bundle file: ${file}`);
      continue;
    }

    if (binaryPublicBundleFiles.has(file)) {
      skippedBinaryFiles += 1;
      continue;
    }

    const content = contentForPrivacyScan(file, read(root, file));
    scannedTextFiles += 1;

    if (guardScriptFiles.has(file)) {
      skippedGuardScripts += 1;
      continue;
    }

    for (const fragment of disallowedLiteralFragments) {
      if (content.toLowerCase().includes(fragment.toLowerCase())) {
        failures.push(`Disallowed private/local literal found in ${file}: ${fragment}`);
      }
    }

    if (isPresentationFile(file)) {
      for (const pattern of publicSafetyPatterns) {
        if (file === ".gitignore" && pattern.source.includes("PRIVATE_")) continue;
        if (pattern.test(content)) {
          failures.push(`Private/provenance pattern ${pattern} found in ${file}`);
        }
      }

      for (const pattern of unfinishedPresentationPatterns) {
        if (pattern.test(content)) {
          failures.push(`Unfinished presentation marker ${pattern} found in ${file}`);
        }
      }
    }
  }

  return {
    status: failures.length === 0 ? "pass" : "fail",
    checkedFiles: publicBundleFiles.length,
    scannedTextFiles,
    skippedBinaryFiles,
    skippedGuardScripts,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyFinalPrivacyScan();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
