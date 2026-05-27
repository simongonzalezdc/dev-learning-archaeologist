#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { extractSkoolCommentDraft } from "./verify-submission-copy.mjs";

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function extractTextBlock(markdown, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escapedHeading}:\\s*\`\`\`text\\s*([\\s\\S]*?)\`\`\``, "i");
  const match = markdown.match(pattern);
  return match ? match[1].trim() : "";
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

export function verifySubmissionSurfaces(root = process.cwd()) {
  const failures = [];
  const submissionPath = path.join(root, "docs/judging/SUBMISSION.md");
  const landingPath = path.join(root, "landing", "index.html");

  if (!fs.existsSync(submissionPath)) {
    return {
      checked: false,
      skoolCommentCharacters: 0,
      landingVersionCharacters: 0,
      failures: ["Missing docs/judging/SUBMISSION.md."],
    };
  }

  if (!fs.existsSync(landingPath)) {
    return {
      checked: false,
      skoolCommentCharacters: 0,
      landingVersionCharacters: 0,
      failures: ["Missing landing/index.html."],
    };
  }

  const submission = read(root, "docs/judging/SUBMISSION.md");
  const landing = read(root, "landing/index.html");
  const skoolComment = extractSkoolCommentDraft(submission);
  const landingVersion = extractTextBlock(submission, "Landing-page version");
  const landingSection =
    landing.match(/<section\b[^>]*class="[^"]*\bsubmission-section\b[^"]*"[\s\S]*?<\/section>/i)?.[0] || "";
  const landingText = normalize(stripHtml(landingSection));
  const normalizedSkool = normalize(skoolComment);
  const normalizedLandingVersion = normalize(landingVersion);

  if (!skoolComment) {
    failures.push("docs/judging/SUBMISSION.md is missing the primary Skool comment draft.");
  }

  if (!landingVersion) {
    failures.push("docs/judging/SUBMISSION.md is missing the Landing-page version block.");
  }

  if (normalizedSkool && normalizedLandingVersion && normalizedSkool !== normalizedLandingVersion) {
    failures.push("Landing-page version in docs/judging/SUBMISSION.md must match the primary Skool comment draft.");
  }

  if (landingSection) {
    failures.push("landing/index.html should not render the Skool submission copy as a review panel.");
  }

  const requiredPhrases = [
    "whose bottleneck is not intelligence or effort",
    "calendar and inbox playbooks",
    "whole-person tour",
    "productivity extractor",
    "readable evidence",
    "source proof",
  ];

  for (const phrase of requiredPhrases) {
    if (!normalizedSkool.includes(phrase)) {
      failures.push(`Primary Skool comment draft missing phrase: ${phrase}`);
    }
    if (!normalizedLandingVersion.includes(phrase)) {
      failures.push(`Landing-page version block missing phrase: ${phrase}`);
    }
  }

  return {
    checked: true,
    skoolCommentCharacters: skoolComment.length,
    landingVersionCharacters: landingVersion.length,
    landingSectionCharacters: landingText.length,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifySubmissionSurfaces();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
