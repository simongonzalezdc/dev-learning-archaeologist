#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const maxSkoolCommentChars = 780;

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

export function extractSkoolCommentDraft(submission) {
  const block = submission.match(/Skool comment draft:\s*```text\s*([\s\S]*?)```/i);
  return block ? block[1].trim() : "";
}

export function countSentences(text) {
  const normalized = text
    .replace(/\b(?:md|mjs|html|css|js)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return (normalized.match(/[.!?](?=\s|$)/g) || []).length;
}

export function verifySubmissionCopy(root = process.cwd()) {
  const failures = [];
  const warnings = [];
  const submissionPath = path.join(root, "docs/judging/SUBMISSION.md");

  if (!fs.existsSync(submissionPath)) {
    failures.push("Missing docs/judging/SUBMISSION.md.");
    return {
      status: "blocked",
      sentenceCount: 0,
      characterCount: 0,
      failures,
      warnings,
    };
  }

  const submission = read(root, "docs/judging/SUBMISSION.md");
  const skoolCommentDraft = extractSkoolCommentDraft(submission);
  const sentenceCount = countSentences(skoolCommentDraft);
  const characterCount = skoolCommentDraft.length;

  if (!skoolCommentDraft) {
    failures.push("docs/judging/SUBMISSION.md does not contain a Skool comment draft code block.");
  }

  if (sentenceCount < 2 || sentenceCount > 3) {
    failures.push(`Skool comment draft should be 2-3 sentences; found ${sentenceCount}.`);
  }

  if (characterCount > maxSkoolCommentChars) {
    failures.push(
      `Skool comment draft should stay under ${maxSkoolCommentChars} characters; found ${characterCount}.`,
    );
  }

  const requiredPhrases = [
    /folder-based whole-person executive-function accessibility coach/i,
    /productivity extractor/i,
    /inboxes/i,
    /calendars/i,
    /calendar and inbox playbooks/i,
    /whole-person tour/i,
    /without shame/i,
    /coach/i,
    /readable evidence/i,
  ];

  for (const pattern of requiredPhrases) {
    if (!pattern.test(skoolCommentDraft)) {
      failures.push(`Skool comment draft is missing required idea: ${pattern}`);
    }
  }

  if (!/GitHub link:/i.test(submission)) {
    warnings.push("docs/judging/SUBMISSION.md does not expose the GitHub link block.");
  }

  return {
    status: failures.length === 0 ? "ready" : "blocked",
    sentenceCount,
    characterCount,
    failures,
    warnings,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifySubmissionCopy();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
