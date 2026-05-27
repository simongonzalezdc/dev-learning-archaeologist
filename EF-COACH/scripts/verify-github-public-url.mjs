#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { hasPublicGitHubUrl, isDisallowedSubmissionRepo } from "./verify-publication-ready.mjs";

const root = process.cwd();
const submissionPath = path.join(root, "docs/judging/SUBMISSION.md");

function usage() {
  return [
    "Usage:",
    "  node scripts/verify-github-public-url.mjs --url https://github.com/OWNER/REPO",
    "  node scripts/verify-github-public-url.mjs",
    "",
    "When --url is omitted, the script reads the GitHub link block from docs/judging/SUBMISSION.md.",
    "The check uses unauthenticated GitHub API access so a private review repo cannot pass as public.",
  ].join("\n");
}

function parseArgs(argv) {
  const result = { url: "", help: false, unknown: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--url") {
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

function extractGitHubLink(submission) {
  const block = submission.match(/GitHub link:\s*```text\s*([\s\S]*?)```/i);
  return block ? block[1].trim() : "";
}

function submissionUrl() {
  if (!fs.existsSync(submissionPath)) return "";
  return extractGitHubLink(fs.readFileSync(submissionPath, "utf8"));
}

export function parseGitHubRepoUrl(value) {
  if (!hasPublicGitHubUrl(value)) return null;
  const url = new URL(value);
  const [, owner, repo] = url.pathname.replace(/\/$/, "").split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
}

export async function verifyGithubPublicUrl(value) {
  const failures = [];
  const repo = parseGitHubRepoUrl(value);

  if (!value) {
    failures.push("Missing GitHub repository URL.");
  } else if (!repo) {
    failures.push("URL must be a GitHub repository URL in the form https://github.com/OWNER/REPO.");
  } else if (isDisallowedSubmissionRepo(value)) {
    failures.push("URL points at the old Week 3 repository, not the final Week 5 repository.");
  }

  if (failures.length > 0) {
    return {
      status: "blocked",
      url: value,
      httpStatus: null,
      isPublic: false,
      failures,
    };
  }

  const apiUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
  let response;
  let payload = null;

  try {
    response = await fetch(apiUrl, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "unstuck-publication-check",
      },
    });
    payload = await response.json().catch(() => null);
  } catch (error) {
    return {
      status: "blocked",
      url: value,
      apiUrl,
      httpStatus: null,
      isPublic: false,
      failures: [`Could not reach GitHub unauthenticated API: ${error.message}`],
    };
  }

  if (!response.ok) {
    failures.push(
      `GitHub repository was not visible through unauthenticated API access: HTTP ${response.status}.`,
    );
  } else if (payload?.private !== false) {
    failures.push("GitHub repository is not public.");
  } else if (payload?.html_url?.replace(/\/$/, "") !== value.replace(/\/$/, "")) {
    failures.push("GitHub API returned a different repository URL than the submission link.");
  }

  return {
    status: failures.length === 0 ? "pass" : "blocked",
    url: value,
    apiUrl,
    httpStatus: response.status,
    isPublic: failures.length === 0,
    repoName: payload?.full_name || "",
    defaultBranch: payload?.default_branch || "",
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  if (args.unknown) {
    console.log(JSON.stringify({
      status: "blocked",
      failures: [`Unknown argument: ${args.unknown}`],
      usage: usage(),
    }, null, 2));
    process.exit(1);
  }

  const summary = await verifyGithubPublicUrl(args.url || submissionUrl());
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
