#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { publicBundleFiles } from "./public-bundle-files.mjs";
import { verifyAdminOpsPlaybooks } from "./verify-admin-ops-playbooks.mjs";
import { verifyConsoleBehavior } from "./verify-console-behavior.mjs";
import { verifyCompetitionRulesTrace } from "./verify-competition-rules-trace.mjs";
import { verifyFirstReplyAcceptance } from "./verify-first-reply-acceptance.mjs";
import { verifyFirstReplyScorecard } from "./verify-first-reply-scorecard.mjs";
import { verifyFirstRun } from "./verify-first-run.mjs";
import { verifyIcmTrace } from "./verify-icm-trace.mjs";
import { verifyJudgeFaq } from "./verify-judge-faq.mjs";
import { verifyJudgeScorecard } from "./verify-judge-scorecard.mjs";
import { verifyJudgeBrief } from "./verify-judge-brief.mjs";
import { verifyLandingAccessibility } from "./verify-landing-accessibility.mjs";
import { verifyLandingCopy } from "./verify-landing-copy.mjs";
import { verifyModeRouter } from "./verify-mode-router.mjs";
import { verifyEvalCoverage } from "./verify-eval-coverage.mjs";
import { verifyFinalPrivacyScan } from "./verify-final-privacy-scan.mjs";
import { verifyProductThesis } from "./verify-product-thesis.mjs";
import { verifySourceNotes } from "./verify-source-notes.mjs";
import { verifyStartHere } from "./verify-start-here.mjs";
import { verifySubmissionCopy } from "./verify-submission-copy.mjs";
import { verifySubmissionSurfaces } from "./verify-submission-surfaces.mjs";
import { verifyTranscriptPack } from "./verify-transcript-pack.mjs";
import { verifyWholePersonTour } from "./verify-whole-person-tour.mjs";

const root = process.cwd();
const submissionPath = path.join(root, "docs/judging/SUBMISSION.md");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractGitHubLink(submission) {
  const block = submission.match(/GitHub link:\s*```text\s*([\s\S]*?)```/i);
  return block ? block[1].trim() : "";
}

export function hasPublicGitHubUrl(value) {
  return /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/)?$/i.test(value);
}

export function isDisallowedSubmissionRepo(value) {
  const oldOwner = ["Kyanite", "Labs"].join("");
  const oldRepo = ["dev", "learning", "archaeologist"].join("-");
  const normalized = value.trim().replace(/\/$/, "").toLowerCase();
  return normalized === `https://github.com/${oldOwner}/${oldRepo}`.toLowerCase();
}

function addVerifierFailures(failures, label, result) {
  for (const failure of result.failures || []) {
    failures.push(`${label} check failed: ${failure}`);
  }
}

export function verifyPublicationReady() {
  const failures = [];
  const warnings = [];
  const blockedManifestFragments = [
    "PRIVATE_",
    ["docs", "plans"].join("/"),
    "output/",
    ".omx/",
  ];

  if (!fs.existsSync(submissionPath)) {
    failures.push("Missing docs/judging/SUBMISSION.md.");
  }

  const submission = fs.existsSync(submissionPath) ? read(submissionPath) : "";
  const githubLink = extractGitHubLink(submission);

  if (!githubLink) {
    failures.push("docs/judging/SUBMISSION.md does not contain a GitHub link block.");
  } else if (!hasPublicGitHubUrl(githubLink)) {
    failures.push("docs/judging/SUBMISSION.md GitHub link is not a final public GitHub repository URL.");
  } else if (isDisallowedSubmissionRepo(githubLink)) {
    failures.push("docs/judging/SUBMISSION.md GitHub link still points at the old Week 3 repo, not a clean Week 5 public repository.");
  }

  if (/Pending review|Do not publish/i.test(submission)) {
    failures.push("docs/judging/SUBMISSION.md still contains review/publish placeholder text.");
  }

  if (blockedManifestFragments.some((fragment) => publicBundleFiles.join("\n").includes(fragment))) {
    failures.push("Public bundle manifest includes private/generated paths.");
  }

  const consoleBehavior = verifyConsoleBehavior(root);
  addVerifierFailures(failures, "Console behavior", consoleBehavior);

  const productThesis = verifyProductThesis(root);
  addVerifierFailures(failures, "Product thesis", productThesis);

  const sourceNotes = verifySourceNotes(root);
  addVerifierFailures(failures, "Source notes", sourceNotes);

  const competitionRulesTrace = verifyCompetitionRulesTrace(root);
  addVerifierFailures(failures, "Competition rules trace", competitionRulesTrace);

  const icmTrace = verifyIcmTrace(root);
  addVerifierFailures(failures, "ICM trace", icmTrace);

  const modeRouter = verifyModeRouter(root);
  addVerifierFailures(failures, "Mode router", modeRouter);

  const firstRun = verifyFirstRun(root);
  addVerifierFailures(failures, "First run", firstRun);

  const firstReplyScorecard = verifyFirstReplyScorecard(root);
  addVerifierFailures(failures, "First-reply scorecard", firstReplyScorecard);

  const startHere = verifyStartHere(root);
  addVerifierFailures(failures, "Start-here", startHere);

  const landingCopy = verifyLandingCopy(root);
  addVerifierFailures(failures, "Landing copy", landingCopy);

  const landingAccessibility = verifyLandingAccessibility(root);
  addVerifierFailures(failures, "Landing accessibility", landingAccessibility);

  const transcriptPack = verifyTranscriptPack(root);
  addVerifierFailures(failures, "Transcript pack", transcriptPack);

  const wholePersonTour = verifyWholePersonTour(root);
  addVerifierFailures(failures, "Whole-person tour", wholePersonTour);

  const firstReplyAcceptance = verifyFirstReplyAcceptance(root);
  addVerifierFailures(failures, "First-reply acceptance", firstReplyAcceptance);

  const evalCoverage = verifyEvalCoverage(root);
  addVerifierFailures(failures, "Eval coverage", evalCoverage);

  const adminOpsPlaybooks = verifyAdminOpsPlaybooks(root);
  addVerifierFailures(failures, "Admin operations playbooks", adminOpsPlaybooks);

  const submissionCopy = verifySubmissionCopy(root);
  addVerifierFailures(failures, "Submission copy", submissionCopy);

  const submissionSurfaces = verifySubmissionSurfaces(root);
  addVerifierFailures(failures, "Submission surfaces", submissionSurfaces);

  const judgeFaq = verifyJudgeFaq(root);
  addVerifierFailures(failures, "Judge FAQ", judgeFaq);

  const judgeScorecard = verifyJudgeScorecard(root);
  addVerifierFailures(failures, "Judge scorecard", judgeScorecard);

  const judgeBrief = verifyJudgeBrief(root);
  addVerifierFailures(failures, "Judge brief", judgeBrief);

  const finalPrivacyScan = verifyFinalPrivacyScan(root);
  addVerifierFailures(failures, "Final privacy scan", finalPrivacyScan);

  if (!/Skool comment draft:/i.test(submission)) {
    warnings.push("docs/judging/SUBMISSION.md does not expose the Skool comment draft heading.");
  }

  return {
    status: failures.length === 0 ? "ready" : "blocked",
    githubLink,
    consoleBehaviorCases: consoleBehavior.checkedCases,
    productThesisSections: productThesis.sections,
    sourceNotesSections: sourceNotes.sections,
    sourceNotesDesignLineageBullets: sourceNotes.designLineageBullets,
    sourceNotesResearchRows: sourceNotes.researchRows,
    sourceNotesKeyDesignChoices: sourceNotes.keyDesignChoices,
    sourceNotesPortabilityBullets: sourceNotes.portabilityBullets,
    competitionRulesTraceBriefRows: competitionRulesTrace.briefRequirementRows,
    competitionRulesTraceJudgingRows: competitionRulesTrace.judgingQuestionRows,
    competitionRulesTraceProofBullets: competitionRulesTrace.aboveBriefProofBullets,
    competitionRulesTraceReadyChecks: competitionRulesTrace.readyCheckBullets,
    icmTraceSections: icmTrace.sections,
    icmTraceEvidenceRefs: icmTrace.evidenceRefs,
    modeRouterStances: modeRouter.stances,
    modeRouterRules: modeRouter.routingRules,
    firstRunChecks: firstRun.checks,
    firstRunPromptBlocks: firstRun.promptBlocks,
    firstReplyScorecardChecks: firstReplyScorecard.checks,
    startHerePromptBlocks: startHere.promptBlocks,
    landingCopyButtons: landingCopy.checkedButtons,
    landingAccessibilityImages: landingAccessibility.images,
    landingAccessibilityButtons: landingAccessibility.buttons,
    landingAccessibilityLabelledSections: landingAccessibility.labelledSections,
    landingAccessibilityHashLinks: landingAccessibility.localHashLinks,
    transcriptPackCases: transcriptPack.checkedCases,
    wholePersonTourStops: wholePersonTour.stops,
    wholePersonTourPromptBlocks: wholePersonTour.promptBlocks,
    firstReplyAcceptanceCases: firstReplyAcceptance.checkedCases,
    redFaceTests: evalCoverage.redFaceTests,
    researchToBehaviorRows: evalCoverage.researchRows,
    adminOpsPlaybooks: adminOpsPlaybooks.playbooks,
    adminOpsCloseStatuses: adminOpsPlaybooks.closingStatuses,
    skoolCommentSentences: submissionCopy.sentenceCount,
    skoolCommentCharacters: submissionCopy.characterCount,
    submissionSurfaceCharacters: submissionSurfaces.landingSectionCharacters,
    judgeFaqQuestions: judgeFaq.questions,
    judgeFaqEvidenceRefs: judgeFaq.evidenceRefs,
    judgeScorecardCriteriaRows: judgeScorecard.criteriaRows,
    judgeScorecardFastPathSteps: judgeScorecard.fastPathSteps,
    judgeBriefSections: judgeBrief.sections,
    judgeBriefEvidenceRefs: judgeBrief.evidenceRefs,
    judgeBriefFastTestSteps: judgeBrief.fastTestSteps,
    finalPrivacyScanFiles: finalPrivacyScan.checkedFiles,
    finalPrivacyScanTextFiles: finalPrivacyScan.scannedTextFiles,
    finalPrivacyScanSkippedGuardScripts: finalPrivacyScan.skippedGuardScripts,
    failures,
    warnings,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyPublicationReady();
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
