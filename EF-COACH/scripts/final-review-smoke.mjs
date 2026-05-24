#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = new Set(process.argv.slice(2));
const expectReady = args.has("--expect-ready");
const expectPrivateReady = args.has("--expect-private-ready");
const expectBlocked = args.has("--expect-blocked") || (!expectReady && !expectPrivateReady);
const skipBuild = args.has("--skip-build");
const verbose = args.has("--verbose");
const allowedArgs = new Set([
  "--expect-ready",
  "--expect-private-ready",
  "--expect-blocked",
  "--skip-build",
  "--verbose",
]);
const root = process.cwd();

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

const expectedStateCount = [expectReady, expectPrivateReady, args.has("--expect-blocked")].filter(Boolean).length;

if (expectedStateCount > 1) {
  console.error("Choose only one expected publication state.");
  process.exit(1);
}

const proofChecks = [
  "scripts/verify-submission-copy.mjs",
  "scripts/verify-submission-surfaces.mjs",
  "scripts/verify-judge-faq.mjs",
  "scripts/verify-judge-scorecard.mjs",
  "scripts/verify-judge-brief.mjs",
  "scripts/verify-landing-accessibility.mjs",
  "scripts/verify-source-notes.mjs",
  "scripts/verify-competition-rules-trace.mjs",
  "scripts/verify-product-thesis.mjs",
  "scripts/verify-icm-trace.mjs",
  "scripts/verify-first-run.mjs",
  "scripts/verify-first-reply-scorecard.mjs",
  "scripts/verify-start-here.mjs",
  "scripts/verify-landing-copy.mjs",
  "scripts/verify-transcript-pack.mjs",
  "scripts/verify-first-reply-acceptance.mjs",
  "scripts/verify-whole-person-tour.mjs",
  "scripts/verify-mode-router.mjs",
  "scripts/verify-console-behavior.mjs",
  "scripts/verify-eval-coverage.mjs",
  "scripts/verify-admin-ops-playbooks.mjs",
  "scripts/judge-quick-proof.mjs",
  "scripts/verify-public-bundle.mjs",
  "scripts/verify-final-privacy-scan.mjs",
  "scripts/verify-clean-public-stage.mjs",
];

function isReviewedSourceWorkspace() {
  return (
    fs.existsSync(path.join(root, "PRIVATE_COMPLETION_AUDIT.md")) ||
    fs.existsSync(path.join(root, "PRIVATE_APPROVAL_STATE.md"))
  );
}

function removePublicOutputResidue() {
  if (isReviewedSourceWorkspace()) {
    return false;
  }

  const outputDir = path.join(root, "output");
  if (!fs.existsSync(outputDir)) {
    return false;
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  return true;
}

function runNode(script, options = {}) {
  const commandArgs = Array.isArray(script) ? script : [script];
  const result = spawnSync(process.execPath, commandArgs, {
    encoding: "utf8",
  });

  if (options.echo !== false) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }

  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`${commandArgs.join(" ")} failed with exit ${result.status ?? 1}.`);
  }

  return result;
}

function parseJson(stdout, label) {
  try {
    return JSON.parse(stdout.trim());
  } catch (error) {
    throw new Error(`${label} did not print parseable JSON.`);
  }
}

export function finalReviewSmoke() {
  const failures = [];
  const ran = [];
  const cleanedOutputResidueBefore = removePublicOutputResidue();
  let cleanedOutputResidueAfterBuild = false;

  for (const script of proofChecks) {
    runNode(script, { echo: verbose });
    ran.push(script);
  }

  if (!skipBuild) {
    runNode("scripts/build-public-bundle.mjs", { echo: verbose });
    ran.push("scripts/build-public-bundle.mjs");
    cleanedOutputResidueAfterBuild = removePublicOutputResidue();
  }

  const publication = runNode("scripts/verify-publication-ready.mjs", {
    allowFailure: true,
    echo: verbose,
  });
  const publicationSummary = parseJson(publication.stdout, "Publication gate");
  ran.push("scripts/verify-publication-ready.mjs");

  if (expectReady || expectPrivateReady) {
    if (publication.status !== 0 || publicationSummary.status !== "ready") {
      failures.push("Expected publication gate to be ready after final public link insertion.");
    } else {
      const githubPublicUrl = runNode(
        ["scripts/verify-github-public-url.mjs", "--url", publicationSummary.githubLink],
        { allowFailure: true, echo: verbose },
      );
      const githubPublicUrlSummary = parseJson(githubPublicUrl.stdout, "GitHub public URL gate");
      ran.push("scripts/verify-github-public-url.mjs");

      if (expectReady && (githubPublicUrl.status !== 0 || githubPublicUrlSummary.status !== "pass")) {
        failures.push("Expected final GitHub URL to be publicly visible before publication.");
      } else if (
        expectPrivateReady &&
        (githubPublicUrl.status === 0 ||
          githubPublicUrlSummary.status !== "blocked" ||
          githubPublicUrlSummary.isPublic !== false)
      ) {
        failures.push("Expected final GitHub URL to remain private until the owner makes it public.");
      }
    }
  }

  if (expectBlocked) {
    if (publication.status === 0 || publicationSummary.status !== "blocked") {
      failures.push("Expected publication gate to remain blocked before final public link insertion.");
    }

    const expectedBlockers = [
      "docs/judging/SUBMISSION.md GitHub link is not a final public GitHub repository URL.",
      "docs/judging/SUBMISSION.md still contains review/publish placeholder text.",
    ];

    for (const blocker of expectedBlockers) {
      if (!publicationSummary.failures?.includes(blocker)) {
        failures.push(`Missing expected blocked-publication failure: ${blocker}`);
      }
    }
  }

  return {
    status: failures.length === 0 ? "pass" : "fail",
    expectedPublicationState: expectReady ? "ready" : expectPrivateReady ? "private-ready" : "blocked",
    skippedBuild: skipBuild,
    cleanedOutputResidueBefore,
    cleanedOutputResidueAfterBuild,
    verbose,
    ran,
    publicationStatus: publicationSummary.status,
    publicationFailures: publicationSummary.failures || [],
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const summary = finalReviewSmoke();
    console.log(JSON.stringify(summary, null, 2));
    if (summary.failures.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
