#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { publicBundleDirs, publicBundleFiles } from "./public-bundle-files.mjs";

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

const root = path.resolve(argValue("--root") || process.cwd());

const binaryPublicBundleFiles = new Set([
  "landing/assets/unstuck-coach-logo.png",
  "landing/assets/unstuck-admin-bridge.jpg",
]);

const publicFacingFiles = new Set([
  "README.md",
  "llms.txt",
  "landing/index.html",
  "coach/START_HERE.md",
  "coach/PROJECT_INSTRUCTIONS.md",
]);

const publicFacingFragments = [
  "judge",
  "scorecard",
  "first run",
  "first reply",
  "transcript pack",
  "proof",
  "evidence",
  "receipt",
  "competition",
  "week 5",
  "folder-based",
  "use the folder",
  "open the folder",
];

const forbiddenPublicPaths = [
  /^package\.json$/,
  /^live-demo\//,
  /^docs\/judging\//,
  /^scripts\/verify-/,
  /^scripts\/judge-/,
  /^scripts\/final-review-smoke\.mjs$/,
  /FIRST_RUN\.md$/,
  /FIRST_REPLY_SCORECARD\.md$/,
  /transcript-pack\.md$/,
  /JUDGE/i,
  /SCORECARD/i,
  /COMPETITION/i,
];

const requiredReadmeText = [
  "Unstuck Coach is a whole-person executive-function accessibility coach.",
  "Live demo",
  "Use It Through Project Context",
  "Source Layout",
  "There is no npm",
];

const requiredLandingText = [
  "External executive function for the whole human.",
  "Try the live coach",
  "Set it up",
  "View source",
  "Load the coach files.",
  "Know whether the coach is helping.",
  "Asks for a tiny check.",
  "The coach helps with the next move, not someone else's life.",
];

const requiredLlmsText = [
  "Unstuck Coach is a whole-person executive-function accessibility coach",
  "Live demo",
  "one humane next move",
  "one tiny check",
  "not an npm package",
];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function checkRequiredText(failures, file, requiredText) {
  const content = read(file);
  for (const text of requiredText) {
    if (!content.includes(text)) {
      failures.push(`${file} is missing required text: ${text}`);
    }
  }
}

function checkNoPublicProcessLeak(failures, file) {
  const normalized = read(file).toLowerCase();
  for (const fragment of publicFacingFragments) {
    if (normalized.includes(fragment)) {
      failures.push(`${file} contains public process leak text: ${fragment}`);
    }
  }
}

function verifyPublicBundle(targetRoot = root) {
  const failures = [];

  for (const file of publicBundleFiles) {
    if (forbiddenPublicPaths.some((pattern) => pattern.test(file))) {
      failures.push(`Public bundle includes internal/process file: ${file}`);
    }
    if (!fs.existsSync(path.join(targetRoot, file))) {
      failures.push(`Missing public bundle file: ${file}`);
    }
  }

  for (const dir of publicBundleDirs) {
    if (!fs.existsSync(path.join(targetRoot, dir))) {
      failures.push(`Missing public bundle directory: ${dir}`);
    }
  }

  if (exists("README.md")) checkRequiredText(failures, "README.md", requiredReadmeText);
  if (exists("landing/index.html")) checkRequiredText(failures, "landing/index.html", requiredLandingText);
  if (exists("llms.txt")) checkRequiredText(failures, "llms.txt", requiredLlmsText);

  for (const file of publicFacingFiles) {
    if (exists(file)) checkNoPublicProcessLeak(failures, file);
  }

  if (exists("sitemap.xml")) {
    const sitemap = read("sitemap.xml");
    for (const url of ["https://unstuck.kyanitelabs.tech/", "https://unstuck.kyanitelabs.tech/chat/"]) {
      if (!sitemap.includes(url)) failures.push(`sitemap.xml is missing ${url}`);
    }
    if (/source|check|proof|evidence|judge/i.test(sitemap.replace(/https:\/\/unstuck\.kyanitelabs\.tech\/chat\//g, ""))) {
      failures.push("sitemap.xml contains a non-product route.");
    }
  }

  if (exists("robots.txt") && !read("robots.txt").includes("Sitemap: https://unstuck.kyanitelabs.tech/sitemap.xml")) {
    failures.push("robots.txt is missing the sitemap URL.");
  }
  return {
    status: failures.length === 0 ? "pass" : "fail",
    root: targetRoot,
    fileCount: publicBundleFiles.length,
    failures,
    binaryFileCount: binaryPublicBundleFiles.size,
  };
}

const summary = verifyPublicBundle(root);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) process.exitCode = 1;
}

export { verifyPublicBundle };
