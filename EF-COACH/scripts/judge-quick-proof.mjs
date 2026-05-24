#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { verifyAdminOpsPlaybooks } from "./verify-admin-ops-playbooks.mjs";
import { verifyConsoleBehavior } from "./verify-console-behavior.mjs";
import { verifyEvalCoverage } from "./verify-eval-coverage.mjs";
import { verifyFirstReplyAcceptance } from "./verify-first-reply-acceptance.mjs";
import { verifyFirstReplyScorecard } from "./verify-first-reply-scorecard.mjs";
import { verifyFirstRun } from "./verify-first-run.mjs";
import { verifyIcmTrace } from "./verify-icm-trace.mjs";
import { verifyJudgeFaq } from "./verify-judge-faq.mjs";
import { verifyJudgeScorecard } from "./verify-judge-scorecard.mjs";
import { verifyJudgeBrief } from "./verify-judge-brief.mjs";
import { verifyModeRouter } from "./verify-mode-router.mjs";
import { verifyProductThesis } from "./verify-product-thesis.mjs";
import { verifySourceNotes } from "./verify-source-notes.mjs";
import { verifyStartHere } from "./verify-start-here.mjs";
import { verifySubmissionCopy } from "./verify-submission-copy.mjs";
import { verifyTranscriptPack } from "./verify-transcript-pack.mjs";
import { verifyWholePersonTour } from "./verify-whole-person-tour.mjs";

function addFailures(failures, label, result) {
  for (const failure of result.failures || []) {
    failures.push(`${label}: ${failure}`);
  }
}

export function judgeQuickProof(root = process.cwd()) {
  const failures = [];
  const startHere = verifyStartHere(root);
  const firstRun = verifyFirstRun(root);
  const firstReplyScorecard = verifyFirstReplyScorecard(root);
  const transcriptPack = verifyTranscriptPack(root);
  const wholePersonTour = verifyWholePersonTour(root);
  const firstReplyAcceptance = verifyFirstReplyAcceptance(root);
  const consoleBehavior = verifyConsoleBehavior(root);
  const evalCoverage = verifyEvalCoverage(root);
  const adminOpsPlaybooks = verifyAdminOpsPlaybooks(root);
  const modeRouter = verifyModeRouter(root);
  const sourceNotes = verifySourceNotes(root);
  const productThesis = verifyProductThesis(root);
  const icmTrace = verifyIcmTrace(root);
  const judgeFaq = verifyJudgeFaq(root);
  const judgeScorecard = verifyJudgeScorecard(root);
  const judgeBrief = verifyJudgeBrief(root);
  const submissionCopy = verifySubmissionCopy(root);

  addFailures(failures, "Start here", startHere);
  addFailures(failures, "First run", firstRun);
  addFailures(failures, "First-reply scorecard", firstReplyScorecard);
  addFailures(failures, "Transcript pack", transcriptPack);
  addFailures(failures, "Whole-person tour", wholePersonTour);
  addFailures(failures, "First-reply acceptance", firstReplyAcceptance);
  addFailures(failures, "Console behavior", consoleBehavior);
  addFailures(failures, "Eval coverage", evalCoverage);
  addFailures(failures, "Admin operations playbooks", adminOpsPlaybooks);
  addFailures(failures, "Mode router", modeRouter);
  addFailures(failures, "Source notes", sourceNotes);
  addFailures(failures, "Product thesis", productThesis);
  addFailures(failures, "ICM trace", icmTrace);
  addFailures(failures, "Judge FAQ", judgeFaq);
  addFailures(failures, "Judge scorecard", judgeScorecard);
  addFailures(failures, "Judge brief", judgeBrief);
  addFailures(failures, "Submission copy", submissionCopy);

  return {
    status: failures.length === 0 ? "pass" : "fail",
    publicationState: "not checked here; use final-review-smoke or verify-publication-ready for the final public URL gate",
    fastestColdPrompts: [
      "I need a coach to get started on this.",
      "My inbox and calendar are a mess and I do not know what is real.",
      "I need to pay the bill, eat something, and answer the text, but I am frozen.",
    ],
    evidence: {
      startHerePromptBlocks: startHere.promptBlocks,
      firstRunChecks: firstRun.checks,
      firstReplyScorecardChecks: firstReplyScorecard.checks,
      transcriptPackCases: transcriptPack.checkedCases,
      wholePersonTourStops: wholePersonTour.stops,
      wholePersonTourPromptBlocks: wholePersonTour.promptBlocks,
      firstReplyAcceptanceCases: firstReplyAcceptance.checkedCases,
      consoleBehaviorCases: consoleBehavior.checkedCases,
      demoPromptTabs: consoleBehavior.demoPromptTabs,
      redFaceTests: evalCoverage.redFaceTests,
      researchToBehaviorRows: evalCoverage.researchRows,
      adminOpsPlaybooks: adminOpsPlaybooks.playbooks,
      adminOpsCloseStatuses: adminOpsPlaybooks.closingStatuses,
      modeRouterStances: modeRouter.stances,
      modeRouterRules: modeRouter.routingRules,
      sourceNotesSections: sourceNotes.sections,
      sourceNotesDesignLineageBullets: sourceNotes.designLineageBullets,
      sourceNotesResearchRows: sourceNotes.researchRows,
      sourceNotesKeyDesignChoices: sourceNotes.keyDesignChoices,
      productThesisSections: productThesis.sections,
      icmTraceFitRows: icmTrace.fitRows,
      judgeFaqQuestions: judgeFaq.questions,
      judgeScorecardCriteriaRows: judgeScorecard.criteriaRows,
      judgeBriefSections: judgeBrief.sections,
      judgeBriefEvidenceRefs: judgeBrief.evidenceRefs,
      skoolCommentSentences: submissionCopy.sentenceCount,
      skoolCommentCharacters: submissionCopy.characterCount,
    },
    passMeaning:
      "The folder has a cold-start path, first-reply gate, transcript evidence, a whole-person judge tour, live-demo bridge, protocol behavior verifier, stress evals, admin operations playbooks, mode router, source-notes lineage proof, research-to-behavior proof, product thesis, ICM trace, judge FAQ, scorecard, and concise judge brief.",
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = judgeQuickProof();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
