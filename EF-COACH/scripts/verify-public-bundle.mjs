#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { publicBundleDirs, publicBundleFiles } from "./public-bundle-files.mjs";
import { verifyAdminOpsPlaybooks } from "./verify-admin-ops-playbooks.mjs";
import { verifyConsoleBehavior } from "./verify-console-behavior.mjs";
import { verifyCompetitionRulesTrace } from "./verify-competition-rules-trace.mjs";
import { verifyFirstReplyAcceptance } from "./verify-first-reply-acceptance.mjs";
import { verifyFirstReplyScorecard } from "./verify-first-reply-scorecard.mjs";
import { verifyFirstRun } from "./verify-first-run.mjs";
import { verifyFinalPrivacyScan } from "./verify-final-privacy-scan.mjs";
import { verifyIcmTrace } from "./verify-icm-trace.mjs";
import { judgeQuickProof } from "./judge-quick-proof.mjs";
import { verifyJudgeFaq } from "./verify-judge-faq.mjs";
import { verifyJudgeScorecard } from "./verify-judge-scorecard.mjs";
import { verifyJudgeBrief } from "./verify-judge-brief.mjs";
import { verifyLandingAccessibility } from "./verify-landing-accessibility.mjs";
import { verifyLandingCopy } from "./verify-landing-copy.mjs";
import { verifyModeRouter } from "./verify-mode-router.mjs";
import { verifyEvalCoverage } from "./verify-eval-coverage.mjs";
import { verifyProductThesis } from "./verify-product-thesis.mjs";
import { verifySourceNotes } from "./verify-source-notes.mjs";
import { verifyStartHere } from "./verify-start-here.mjs";
import { verifySubmissionCopy } from "./verify-submission-copy.mjs";
import { verifySubmissionSurfaces } from "./verify-submission-surfaces.mjs";
import { verifyTranscriptPack } from "./verify-transcript-pack.mjs";
import { verifyWholePersonTour } from "./verify-whole-person-tour.mjs";

const root = process.cwd();

const binaryPublicBundleFiles = new Set([
  "landing/assets/unstuck-coach-logo.png",
  "landing/assets/unstuck-admin-bridge.jpg",
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

const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const unfinishedPresentationPatterns = [
  /\bTODO\s*:/,
];

const publishBlockers = [
  {
    file: "docs/judging/SUBMISSION.md",
    pattern: /Pending review|Do not publish/i,
    message: "Submission still contains review/publish placeholder text.",
  },
  {
    file: "docs/judging/SUBMISSION.md",
    pattern: /GitHub link:\s*\n\s*```text\s*\n\s*Pending review/im,
    message: "Final public GitHub link is not inserted yet.",
  },
];

const projectInstructionRequiredText = [
  "State -> Friction -> Move -> Hold -> Check -> Close.",
  "Ask one question at a time.",
  "If it gives a productivity article, it failed.",
  "reference/admin-ops-playbooks.md",
  "reference/mode-router.md",
  "stance portfolio",
  "First Reply Acceptance Test",
  "coach/FIRST_RUN.md shows the exact cold-start receipt and tiny proof loop.",
  "First-message routing:",
  "If the first user message already names a stuck signal, do not ask the traffic-light question first. Route it directly.",
  "Names the friction without blame.",
  "Gives one next move the user can do without decoding the system.",
  "Asks for tiny proof or one state signal.",
  "reference/safety-boundaries.md",
];

const startHereRequiredText = [
  "60-Second Path",
  "This is a review shortcut, not the product boundary",
  "whole-person executive-function access across body state, admin, inbox, calendar, messages, transitions, re-entry, and closure",
  "landing/index.html",
  "calendar/inbox operations band",
  "landing/index.html#admin-ops",
  "scripts/render-review-screenshots.mjs",
  "desktop, mobile, and narrow-mobile visual review captures",
  "coach/PROJECT_INSTRUCTIONS.md",
  "coach/FIRST_RUN.md",
  "coach/FIRST_REPLY_SCORECARD.md",
  "docs/judging/JUDGE_BRIEF.md",
  "one-page above-the-brief case",
  "docs/judging/JUDGE_FAQ.md",
  "I need a coach to get started on this.",
  "First Reply Acceptance Test",
  "If it gives a productivity article, it failed.",
  "scripts/verify-first-reply-acceptance.mjs",
  "scripts/verify-judge-brief.mjs",
  "scripts/judge-quick-proof.mjs",
];

const judgeScorecardRequiredText = [
  "Total: 18 points.",
  "Coach first, knowledge base second",
  "Product thesis",
  "docs/judging/ICM_TRACE.md",
  "docs/judging/JUDGE_FAQ.md",
  "docs/judging/JUDGE_BRIEF.md",
  "coach/FIRST_RUN.md",
  "calendar/inbox operations band",
  "Open `landing/index.html` and inspect the calendar/inbox operations band.",
  "shifting stance instead of giving one generic voice",
  "score it immediately without narrowing the whole-person product scope",
  "If the coach gives a productivity article",
  "reference/mode-router.md",
  "scripts/verify-mode-router.mjs",
  "scripts/verify-judge-scorecard.mjs",
  "scripts/verify-judge-brief.mjs",
  "scripts/judge-quick-proof.mjs",
  "scripts/verify-public-bundle.mjs",
];

const handoffCardRequiredText = [
  "If my first message is vague, ask one state-calibrating question.",
  "If I name a stuck signal, route it directly.",
  "First Reply Acceptance Test",
  "Names the friction without blame.",
  "Gives one next move the user can do without decoding the system.",
  "Asks for tiny proof or one state signal.",
  "Avoids articles, menus, moralizing, and vague continuations.",
];

const judgeWalkthroughRequiredText = [
  "docs/judging/ICM_TRACE.md",
  "docs/judging/JUDGE_FAQ.md",
  "docs/judging/JUDGE_BRIEF.md",
  "scripts/verify-icm-trace.mjs",
  "scripts/verify-judge-faq.mjs",
  "scripts/verify-judge-scorecard.mjs",
  "scripts/verify-judge-brief.mjs",
  "scripts/final-review-smoke.mjs --expect-ready --skip-build",
  "scripts/judge-quick-proof.mjs",
  "demo/whole-person-tour.md",
  "scripts/verify-whole-person-tour.mjs",
  "coach/FIRST_RUN.md",
  "winning case readable before the judge opens every source file",
  "First reply acceptance test",
  "Pass: names friction, gives one concrete move, asks for tiny proof or one state signal.",
  "Fail: article, long menu, moralizing, or vague continuation.",
  "6 whole-person tour stops",
  "the calendar/inbox operations band",
  "Calendar Reality, Inbox Live Obligation, Reply Debt Recovery, and the no-account-access safety boundary",
];

const receiptsRequiredText = [
  "The product thesis is explicit",
  "The operating surface is inspectable",
  "food/body, calendar/inbox, messages/shame, home/admin loops, capture/re-entry, and closure/recovery",
  "ICM fit is explicit and inspectable",
  "one-command final smoke gate",
  "submission surfaces stay synchronized",
  "The first run is a receipt",
  "The first reply is scoreable",
  "preserves original Liam calendar and inbox support",
  "preserves the original multi-mode coaching insight",
  "reference/mode-router.md",
  "scripts/verify-mode-router.mjs",
  "My inbox and calendar are a mess and I do not know what is real.",
  "It makes failure obvious quickly",
  "It is above the brief without hiding the folder",
  "docs/judging/JUDGE_BRIEF.md",
  "one-page winning argument",
  "scripts/verify-judge-brief.mjs",
  "judge brief",
  "first-reply acceptance test",
  "shortest answers to the Week 5 judging questions",
  "articles, menus, moralizing, or vague continuations",
  "unauthenticated proof that the final GitHub URL is public",
  "scripts/verify-github-public-url.mjs",
  "The fast judge proof is publication-independent",
  "scripts/judge-quick-proof.mjs",
];

const judgeFaqRequiredText = [
  "What is Unstuck Coach?",
  "Who exactly does it coach?",
  "Is this just an ADHD knowledge base?",
  "How should I cold-test it?",
  "What is an immediate fail?",
  "How does it fit ICM?",
  "What goes above the brief?",
  "one-page judge brief",
  "docs/judging/JUDGE_BRIEF.md",
  "six-stop whole-person tour",
  "What are the boundaries?",
  "the next move is small enough to test",
  "Unstuck is not therapy, medical advice, diagnosis, medication guidance, autonomous account access, or a promise to clean someone's life for them.",
];

const judgeBriefRequiredText = [
  "A one-page read",
  "human case before opening every source file",
  "not a generic ADHD/productivity folder",
  "whole-person executive-function accessibility coach",
  "Coding is one proof scenario.",
  "The folder gives the coach a stable job instead of a pile of advice.",
  "cold-start receipt",
  "first contact scoreable",
  "six life surfaces",
  "calendar reality, inbox live obligations, reply debt, missed obligations, and scheduling friction",
  "reference/mode-router.md",
  "ally, strategist, engineer/executor, keeper, and recovery stances",
  "I need a coach to get started on this.",
  "My inbox and calendar are a mess and I do not know what is real.",
  "article",
  "long menu",
  "moralizing",
  "vague continuation",
  "unsafe clinical advice",
  "ICM as practical workflow architecture",
  "visible context, editable decisions, bounded handoffs, and auditable proof",
  "The landing page should make the product clear first. The source files carry the proof:",
  "docs/judging/PRODUCT_THESIS.md",
  "docs/judging/ICM_TRACE.md",
  "docs/judging/COMPETITION_RULES_TRACE.md",
  "coach/FIRST_RUN.md",
  "coach/FIRST_REPLY_SCORECARD.md",
  "demo/whole-person-tour.md",
  "reference/admin-ops-playbooks.md",
  "reference/mode-router.md",
  "evals/red-face-tests.md",
  "Unstuck is a coaching scaffold.",
];

const publicationChecklistRequiredText = [
  "Verified Publication Requirements",
  "Use this as the final pre-submission audit.",
  "Premium/VIP eligibility is documented as confirmed.",
  "A clean public repository exists.",
  "The Kyanite VPS landing route is live at `https://unstuck.kyanitelabs.tech/`.",
  "The repository About homepage points to the landing page URL.",
  "`robots.txt`, `sitemap.xml`, and `llms.txt` are present in the public payload.",
  "The final public GitHub URL is rejected if it points at the old Week 3 repository.",
  "The final public GitHub URL is visible through unauthenticated GitHub API access.",
  "Operator Path",
  "Use the repo About homepage to reach the Kyanite landing page.",
  "Use speech-to-text, then send the inserted text.",
  "The live demo should show `Z.AI GLM-5.1 (medium reasoning)`",
  "node scripts/verify-public-bundle.mjs",
  "node scripts/final-review-smoke.mjs --expect-ready --skip-build",
  "node scripts/verify-publication-ready.mjs",
  "node scripts/verify-github-public-url.mjs",
  "node scripts/verify-final-privacy-scan.mjs",
  "verify-public-bundle.mjs` reports 84 required files, including the SEO/AEO/GEO discovery files.",
  "Keep the reviewed source folder as the canonical build copy",
  "Do not maintain two different `docs/judging/SUBMISSION.md` files.",
  "node scripts/stage-public-repo.mjs --target ../unstuck-coach --write --force --require-ready",
  "The `--require-ready` flag is for final publication staging.",
  "refuses to stage if the reviewed source folder still has the placeholder URL or fails `verify-publication-ready.mjs`",
];

const signalMapRequiredText = [
  "Operating Surface Map",
  "Unstuck is a whole-person coach.",
  "Food and body",
  "Calendar and inbox",
  "Messages and shame",
  "Home and admin loops",
  "Capture and re-entry",
  "Closure and recovery",
  "One hard anchor or one live item.",
  "One parked note or one restart breadcrumb.",
  "Food/body can outrank planning.",
  "Calendar/inbox reality can outrank cleanup.",
  "Shame sorting can outrank reply drafting.",
];

const rulesTraceRequiredText = [
  "Brief Requirements",
  "Coach, not knowledge base",
  "ICM fit",
  "docs/judging/ICM_TRACE.md",
  "docs/judging/JUDGE_FAQ.md",
  "docs/judging/JUDGE_BRIEF.md",
  "scripts/verify-competition-rules-trace.mjs",
  "scripts/verify-judge-scorecard.mjs",
  "scripts/verify-judge-brief.mjs",
  "scripts/verify-judge-faq.mjs",
  "Include 2-3 sentences describing who the coach is and who it coaches",
  "Ready To Post Checks",
  "Eligibility is documented as confirmed before posting.",
  "scripts/verify-publication-ready.mjs",
  "scripts/verify-github-public-url.mjs",
  "one-page above-the-brief case",
  "fast judge test",
  "ready publication state",
];

const transcriptPackRequiredText = [
  "Getting Started",
  "I need a coach to get started on this.",
  "Names the live friction without blame.",
  "Inbox And Calendar Reality",
  "My inbox and calendar are a mess and I do not know what is real.",
  "Reply with the anchor only.",
  "Three Failed Attempts",
  "Body-First Recovery",
  "scripts/verify-transcript-pack.mjs",
  "scripts/verify-first-reply-acceptance.mjs",
];

const wholePersonTourRequiredText = [
  "Whole-Person Judge Tour",
  "Food And Body",
  "Calendar And Inbox",
  "Messages And Shame",
  "Home And Admin Loops",
  "Capture And Re-Entry",
  "Closure And Recovery",
  "life surfaces, not productivity categories",
  "portable executive function for the whole human",
];

const evalCoverageRequiredText = [
  "Test 9: Calendar And Inbox Reality",
  "Opens the calendar first for the next hard anchor.",
  "Chooses one inbox item tied to time, money, safety, relationship, or another person.",
  "Inbox and calendar noise hides live obligations",
  "live-obligation rescue",
  "reference/admin-ops-playbooks.md",
  "scripts/verify-eval-coverage.mjs",
];

const adminOpsPlaybooksRequiredText = [
  "Admin Operations Playbooks",
  "Playbook: Calendar Reality Pass",
  "Playbook: Inbox Live-Obligation Pass",
  "Playbook: Reply Debt Micro-Ledger",
  "Playbook: Missed Obligation Recovery",
  "Playbook: Scheduling Friction",
  "Close The Admin Pass",
  "Unstuck Coach does not read mail, edit calendars, send replies, or schedule events autonomously.",
];

const judgeQuickProofRequiredText = [
  "publicationState",
  "fastestColdPrompts",
  "passMeaning",
  "verifyAdminOpsPlaybooks",
  "verifyEvalCoverage",
  "verifySourceNotes",
  "verifyWholePersonTour",
  "verifyJudgeBrief",
  "verifySubmissionCopy",
  "concise judge brief",
  "My inbox and calendar are a mess and I do not know what is real.",
];

const finalPrivacyScanRequiredText = [
  "verifyFinalPrivacyScan",
  "publicBundleFiles",
  "guardScriptFiles",
  "disallowedLiteralFragments",
  "unfinishedPresentationPatterns",
  "skippedGuardScripts",
  "Private/provenance pattern",
];

const stagingHelperRequiredText = [
  "--target",
  "--write",
  "--require-ready",
  "Target must be outside this working folder.",
  "Use --require-ready only for final publication staging after the reviewed source folder has the final public URL.",
  "verify-publication-ready.mjs",
  "verify-public-bundle.mjs",
];

const renderReviewScreenshotsRequiredText = [
  "Playwright is required.",
  "unstuck-review-landing-desktop",
  "unstuck-review-landing-mobile",
  "unstuck-review-landing-narrow",
  "unstuck-review-admin-desktop",
  "unstuck-review-admin-mobile",
  "unstuck-review-firstrun-desktop",
  "unstuck-review-firstrun-mobile",
  "unstuck-review-scorecard-desktop",
  "unstuck-review-scorecard-mobile",
  "unstuck-review-faq-desktop",
  "unstuck-review-faq-mobile",
  "Calendar and inbox are part of the life loop.",
  "No autonomous reading",
  "The first run is already scripted.",
  "First run",
  "FIRST-RUN BEHAVIOR",
  "Know whether the first reply is coaching.",
  "The coach helps with the next move, not someone else's life.",
  "Read boundaries",
  "horizontalOverflow",
  "consoleOrPageEvents",
];

const finalReviewSmokeRequiredText = [
  "--expect-blocked",
  "--expect-ready",
  "--skip-build",
  "--verbose",
  "verify-submission-surfaces.mjs",
  "verify-judge-faq.mjs",
  "verify-judge-scorecard.mjs",
  "verify-judge-brief.mjs",
  "verify-competition-rules-trace.mjs",
  "verify-publication-ready.mjs",
  "verify-github-public-url.mjs",
  "verify-icm-trace.mjs",
  "verify-source-notes.mjs",
  "verify-eval-coverage.mjs",
  "verify-admin-ops-playbooks.mjs",
  "verify-whole-person-tour.mjs",
  "verify-final-privacy-scan.mjs",
  "judge-quick-proof.mjs",
  "verify-clean-public-stage.mjs",
  "Expected publication gate to remain blocked before final public link insertion.",
  "Expected final GitHub URL to be publicly visible before publication.",
];

const publicationReadyRequiredText = [
  "verifyLandingAccessibility",
  "verifySourceNotes",
  "verifyWholePersonTour",
  "verifyModeRouter",
  "verifyFinalPrivacyScan",
  "Source notes",
  "Whole-person tour",
  "Landing accessibility",
  "Mode router",
  "Final privacy scan",
  "sourceNotesResearchRows",
  "wholePersonTourStops",
  "modeRouterStances",
  "landingAccessibilityImages",
  "finalPrivacyScanFiles",
];

const githubPublicUrlRequiredText = [
  "unauthenticated GitHub API access",
  "private review repo cannot pass as public",
  "hasPublicGitHubUrl",
  "isDisallowedSubmissionRepo",
  "GitHub repository was not visible through unauthenticated API access",
];

const cleanPublicStageRequiredText = [
  "unstuck-clean-public-stage-",
  "stage-public-repo.mjs",
  "verify-public-bundle.mjs",
  "Clean-stage target must be outside this working folder.",
  "targetRemoved",
];

const submissionSurfacesRequiredText = [
  "Landing-page version",
  "landing/index.html should not render the Skool submission copy as a review panel.",
  "Landing-page version block missing phrase",
  "whose bottleneck is not intelligence or effort",
  "readable evidence",
  "source proof",
];

const staleCodingFirstText = [
  {
    file: "coach/FIRST_RUN.md",
    text: "open the likely file",
  },
  {
    file: "coach/examples.md",
    text: "I know what bug to fix. I just cannot start.",
  },
  {
    file: "demo/transcript-pack.md",
    text: "Open the file, tab, doc, or issue",
  },
  {
    file: "coach/FIRST_REPLY_SCORECARD.md",
    text: "open the file, tab, doc, or issue",
  },
  {
    file: "reference/coaching-protocols.md",
    text: "Tell me when the file is open.",
  },
];

const staleWholePersonDriftText = [
  {
    file: "coach/rules.md",
    text: "Feedback And Message Armor",
  },
  {
    file: "reference/coaching-protocols.md",
    text: "Feedback And Message Armor",
  },
  {
    file: "reference/signal-map.md",
    text: "Feedback Threat",
  },
  {
    file: "landing/app.js",
    text: "Feedback or communication threat",
  },
  {
    file: "demo/transcript-pack.md",
    text: "fear of feedback",
  },
];

const staleShortcutScopeText = [
  {
    file: "README.md",
    text: "five-minute test",
  },
  {
    file: "coach/START_HERE.md",
    text: "five-minute judge path",
  },
  {
    file: "docs/judging/judge-walkthrough.md",
    text: "five-minute judge path",
  },
  {
    file: "landing/index.html",
    text: "Five-minute judge path",
  },
  {
    file: "landing/index.html",
    text: "first 5 minutes",
  },
  {
    file: "landing/index.html",
    text: "first five minutes",
  },
];

const staleDiagnosisScopeText = [
  {
    file: "coach/PROJECT_INSTRUCTIONS.md",
    text: "for people with ADHD, ADHD-like, or neurodivergent executive-function friction",
  },
  {
    file: "reference/source-notes.md",
    text: "for people with ADHD, ADHD-like, or neurodivergent executive-function friction",
  },
  {
    file: "reference/source-notes.md",
    text: "ADHD-friendly accessibility workflows",
  },
  {
    file: "reference/source-notes.md",
    text: "ADHD accessibility ergonomics",
  },
  {
    file: "coach/identity.md",
    text: "ADHD accessibility ergonomics",
  },
];

const readmeRequiredText = [
  "Unstuck Coach is a folder-based whole-person executive-function accessibility coach.",
  "The core idea: the folder is the product.",
  "Live Paths",
  "Live GLM 5.1 demo: `https://unstuck.kyanitelabs.tech/chat/`",
  "GitHub source: `https://github.com/simongonzalezdc/unstuck-coach`",
  "Repo Map",
  "`coach/` is the coach contract",
  "`docs/judging/` is the competition layer",
  "That is the ICM shape: staged context, visible decisions, editable documents, and auditable proof.",
  "Fast Judge Path",
  "Use The Folder",
  "Source Map",
  "Search And AI Discovery",
  "`robots.txt` exposes the sitemap.",
  "`sitemap.xml` lists the landing page and live chat demo URLs.",
  "`llms.txt` gives answer engines and AI search a concise citation path.",
  "If Unstuck gives a productivity article, it failed.",
  "This is a shortcut, not the product boundary.",
  "coach/PROJECT_INSTRUCTIONS.md` is the paste-ready coach contract.",
  "coach/FIRST_RUN.md` shows the cold-start behavior.",
  "coach/FIRST_REPLY_SCORECARD.md` makes the first reply pass/fail.",
  "docs/judging/JUDGE_BRIEF.md` gives the one-page winning case.",
  "docs/judging/COMPETITION_RULES_TRACE.md` maps the Week 5 rules to evidence.",
  "docs/judging/ICM_TRACE.md` maps the system to visible, editable, auditable workflow.",
  "GitHub contains the source files for anyone who wants to inspect the implementation.",
  "node scripts/final-review-smoke.mjs --expect-ready --skip-build",
  "node scripts/verify-github-public-url.mjs",
  "node scripts/verify-final-privacy-scan.mjs",
];

const documentationWordLimits = [
  { file: "README.md", maxWords: 1100 },
  { file: "docs/judging/PUBLICATION_CHECKLIST.md", maxWords: 700 },
  { file: "docs/judging/judge-walkthrough.md", maxWords: 1100 },
  { file: "coach/PROJECT_INSTRUCTIONS.md", maxWords: 1900 },
];

const seoDiscoveryRequiredText = [
  {
    file: "robots.txt",
    text: "Sitemap: https://unstuck.kyanitelabs.tech/sitemap.xml",
  },
  {
    file: "sitemap.xml",
    text: "<loc>https://unstuck.kyanitelabs.tech/</loc>",
  },
  {
    file: "sitemap.xml",
    text: "<loc>https://unstuck.kyanitelabs.tech/chat/</loc>",
  },
  {
    file: "llms.txt",
    text: "Unstuck Coach is a folder-based whole-person executive-function accessibility coach.",
  },
  {
    file: "llms.txt",
    text: "Fast cold test: \"I need a coach to get started on this.\"",
  },
  {
    file: "landing/index.html",
    text: "<link rel=\"canonical\" href=\"https://unstuck.kyanitelabs.tech/\">",
  },
  {
    file: "landing/index.html",
    text: "<meta property=\"og:title\" content=\"Unstuck Coach | Executive Function Accessibility Coach\">",
  },
  {
    file: "landing/index.html",
    text: "<script type=\"application/ld+json\">",
  },
];

const icmTraceRequiredText = [
  "This file makes the ICM fit inspectable instead of leaving it as a claim.",
  "practical workflow architecture",
  "visible context, editable decisions, bounded handoffs, and auditable proof",
  "What Would Fail The Fit",
  "scripts/verify-icm-trace.mjs",
];

const visualCssGuardrails = [
  {
    file: "landing/styles.css",
    pattern: /font-size\s*:\s*clamp\([^;]*vw/i,
    message: "uses viewport-scaled font-size clamp",
  },
  {
    file: "landing/styles.css",
    pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/i,
    message: "uses pure black rgba instead of project charcoal",
  },
  {
    file: "landing/styles.css",
    pattern: /#000(?:000)?\b/i,
    message: "uses pure black hex instead of project charcoal",
  },
];

const visualTextGuardrails = [
  {
    file: "landing/styles.css",
    pattern: /font-family\s*:[^;]*(?:Inter|Roboto|Arial|Open Sans|Helvetica)/i,
    message: "uses generic/banned font-family fallback in landing CSS",
  },
  {
    file: "landing/assets/unstuck-handoff-card.svg",
    pattern: /font-family="[^"]*(?:Inter|Roboto|Arial|Open Sans|Helvetica)/i,
    message: "uses generic/banned font-family fallback in handoff SVG",
  },
];

const visualCssRequiredText = [
  {
    file: "landing/styles.css",
    text: "--paper: #fff8ec",
    message: "missing warm-paper color token",
  },
  {
    file: "landing/styles.css",
    text: "--ink: #060910",
    message: "missing PuenteWorks black-structure token",
  },
  {
    file: "landing/styles.css",
    text: "--steel: #06434a",
    message: "missing deep bridge/teal structure token",
  },
  {
    file: "landing/styles.css",
    text: "--gold: #ffc018",
    message: "missing solar-yellow bridge signal token",
  },
  {
    file: "landing/styles.css",
    text: "--taste-coral: #ef724b",
    message: "missing coral transition signal token",
  },
  {
    file: "landing/styles.css",
    text: "--orange: #ff8b00",
    message: "missing production-orange bridge signal token",
  },
  {
    file: "landing/styles.css",
    text: "--cyan: #00d7e8",
    message: "missing reef/cyan signal token",
  },
  {
    file: "landing/styles.css",
    text: "--lime: #b7f10b",
    message: "missing lime signal token",
  },
  {
    file: "landing/styles.css",
    text: "--magenta: #ff147f",
    message: "missing magenta signal token",
  },
  {
    file: "landing/styles.css",
    text: ".mola-bridge",
    message: "missing simplified bridge motif",
  },
  {
    file: "landing/styles.css",
    text: '"PP Editorial New"',
    message: "missing editorial display typography",
  },
  {
    file: "landing/styles.css",
    text: 'font-family: "Avenir Next", "Plus Jakarta Sans", "Geist", "Satoshi", system-ui, sans-serif',
    message: "missing strong humanist/geometric page type stack",
  },
  {
    file: "landing/styles.css",
    text: "--motion-fast: 120ms",
    message: "missing calm motion duration token",
  },
  {
    file: "landing/styles.css",
    text: "body::before",
    message: "missing fixed paper/noise texture layer",
  },
  {
    file: "landing/styles.css",
    text: "body::after",
    message: "missing left-edge signal inlay",
  },
  {
    file: "landing/styles.css",
    text: ".site-nav",
    message: "missing detached navigation island styling",
  },
  {
    file: "landing/styles.css",
    text: "top: 1.15rem",
    message: "missing detached navigation offset",
  },
  {
    file: "landing/styles.css",
    text: ".nav-toggle",
    message: "missing mobile nav morph control",
  },
  {
    file: "landing/styles.css",
    text: ".reveal-item",
    message: "missing stable reveal baseline",
  },
  {
    file: "landing/styles.css",
    text: ".bridge-one",
    message: "missing primary bridge motif",
  },
  {
    file: "landing/styles.css",
    text: ".bridge-two",
    message: "missing secondary bridge motif",
  },
  {
    file: "landing/styles.css",
    text: "border: 2px solid var(--ink)",
    message: "missing black structural borders",
  },
  {
    file: "landing/styles.css",
    text: "linear-gradient(145deg, rgba(6, 9, 16, 0.98), rgba(6, 67, 74, 0.96))",
    message: "missing dark structural hero field",
  },
  {
    file: "landing/styles.css",
    text: "linear-gradient(90deg, var(--steel), var(--ink) 46%, #07101c)",
    message: "missing dark bridge-deck proof strip",
  },
  {
    file: "landing/styles.css",
    text: "border-top: 5px solid var(--magenta)",
    message: "missing saturated proof-card rail",
  },
  {
    file: "landing/app.js",
    text: 'scrollIntoView({ block: "start", behavior: "auto" })',
    message: "missing instant hash-navigation behavior",
  },
  {
    file: "landing/app.js",
    text: "cycleTimer = null",
    message: "missing no-auto-cycle demo guard",
  },
  {
    file: "landing/app.js",
    text: "optionalSelector",
    message: "missing verifier-safe optional DOM access",
  },
  {
    file: "landing/index.html",
    text: 'class="nav-toggle"',
    message: "missing mobile nav toggle markup",
  },
  {
    file: "landing/assets/unstuck-handoff-card.svg",
    text: 'font-family="Avenir Next, sans-serif"',
    message: "missing cleaned handoff-card SVG type stack",
  },
];

const landingRequiredText = [
  "External executive function for the whole human.",
  "Life loop",
  "body: hungry / yellow",
  "Food before planning",
  "Text without meaning-making",
  "Food, messages, bills, transitions, and re-entry all count as access work.",
  "Calendar blocks and inbox triage are not an add-on; they are where a lot of life becomes real again.",
  "Calendar/inbox",
  "Calendar hard anchor",
  "Inbox live item",
  "Reply without shame tax",
  "My inbox and calendar are a mess and I do not know what is real.",
  "Food/body",
  "Leave breadcrumb",
  "You do not need to make this clear first.",
  "What makes it Unstuck",
  "Whole person under executive load",
  "Whole-person operating surface",
  "The first move can be food, a text, a calendar anchor, or a bill.",
  "Unstuck does not turn accessibility support into more output for work.",
  "State -> friction -> one humane concrete move -> tiny proof -> re-entry trail.",
  "Calendar and inbox",
  "Hard anchors, live obligations, reply debt, missed commitments, scheduling friction.",
  "Messages and shame",
  "Home and admin loops",
  "Capture and re-entry",
  "The folder is the coach's operating surface.",
  "Test six life surfaces",
  "Calendar + inbox playbooks",
  "Calendar and inbox layer",
  "unstuck-admin-bridge.jpg",
  "read accounts or run the user's life",
  "Calendar and inbox are part of the life loop.",
  "turn calendar drift, inbox noise, reply debt, missed obligations, and",
  "Calendar reality",
  "Find the next hard anchor before rebuilding the week.",
  "Inbox live obligation",
  "Rescue consequence before cleanup.",
  "Reply debt recovery",
  "Repair trust without shame theater.",
  "No autonomous reading, sending, scheduling, or inbox-zero promises.",
  "Coach contract",
  "Operating loop",
  "Read rules",
  "Cold start",
  "Product thesis",
  "Open live demo",
  "Use the folder",
  "GitHub",
  "First run",
  "Try it",
  "Claude Project launch kit",
  "Codex path",
  "Antigravity / AI IDE path",
  "Local model path",
  "same coach contract",
  "First run",
  "It proves the coach by crossing one real threshold",
  "First reply behavior",
  "First-run behavior",
  "coach/PROJECT_INSTRUCTIONS.md` routes concrete stuck signals directly.",
  "The coach should not ask the traffic-light question first",
  "First reply preview",
  "Mobile whole-person life signal",
  "Food first",
  "body before plan",
  "Hard anchor",
  "calendar before cleanup",
  "Literal ask",
  "message before meaning",
  "Restart mark",
  "re-entry before shame",
  "Any three items.",
  "Know whether the first reply is coaching.",
  "Copy cold prompt 04",
  "Read boundaries",
  "The coach helps with the next move, not someone else's life.",
  "Names friction.",
  "Gives one move.",
  "Holds context.",
  "Asks for proof.",
  "Article, menu, moralizing, vague continuation, or unsafe clinical advice.",
  "Start before you read everything.",
  "Open `coach/START_HERE.md`.",
  "Paste `coach/PROJECT_INSTRUCTIONS.md`.",
  "Start here",
  "The first run is already scripted.",
  "You are Unstuck Coach. Read coach/identity.md, coach/rules.md, coach/examples.md, and reference/.",
  "If my first message is vague, ask one state-calibrating question.",
  "If I name a stuck signal, route it directly.",
  "I need a coach to get started on this.",
  "First reply pass condition",
  "Name the friction, give one concrete move, and ask for tiny proof.",
  "https://github.com/simongonzalezdc/unstuck-coach/blob/main/demo/transcript-pack.md",
  "https://github.com/simongonzalezdc/unstuck-coach/blob/main/coach/START_HERE.md",
  "https://github.com/simongonzalezdc/unstuck-coach",
  "https://github.com/simongonzalezdc/unstuck-coach/blob/main/coach/FIRST_RUN.md",
  "https://github.com/simongonzalezdc/unstuck-coach/blob/main/coach/FIRST_REPLY_SCORECARD.md",
  "https://github.com/simongonzalezdc/unstuck-coach/blob/main/coach/PROJECT_INSTRUCTIONS.md",
];

const landingForbiddenText = [
  "Release checks",
  "release checks",
  "The release lane is guarded",
  "Waiting on the approved public URL",
  "Publication gate",
  "proof-gate",
  "final-review-smoke",
  "judge-quick-proof",
  "judge",
  "Judge",
  "judging",
  "SUBMISSION SUMMARY",
  "Submission summary",
  "submission section",
  "verify-submission-surfaces",
  "Open questions",
  "obvious objections",
  ["Read", "source", "proof"].join(" "),
  ["Open", "tour", "evidence"].join(" "),
  ["Open", "admin", "evidence"].join(" "),
  ["Open", "first-run", "evidence"].join(" "),
  ["Open", "thesis", "evidence"].join(" "),
  ["Open", "score", "evidence"].join(" "),
  ["evidence", "reader"].join(" "),
  ["Evidence", "reader"].join(" "),
  ["rendered", "evidence"].join(" "),
  ["public", "proof", "room"].join(" "),
  ["./", "evidence", ".html"].join(""),
  ["https://unstuck.kyanitelabs.tech", "evidence"].join("/"),
];

const ignoredCandidatePrefixes = [
  ["docs", "plans"].join("/") + "/",
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function contentForPublicProvenanceScan(file, content) {
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

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function wordCount(content) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function documentationWordCounts() {
  return Object.fromEntries(
    documentationWordLimits
      .filter(({ file }) => exists(file))
      .map(({ file }) => [file, wordCount(read(file))]),
  );
}

function listFiles(dir = ".") {
  const absolute = path.join(root, dir);
  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(dir, entry.name).replace(/^\.\//, "");
    if (entry.name === ".git" || entry.name === ".omx" || entry.name === "output") {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...listFiles(relative));
    } else {
      files.push(relative);
    }
  }
  return files;
}

function isReviewedSourceWorkspace() {
  return exists("PRIVATE_COMPLETION_AUDIT.md") || exists("PRIVATE_APPROVAL_STATE.md");
}

function generatedOutputResidueFailures() {
  if (isReviewedSourceWorkspace() || !exists("output")) {
    return [];
  }

  return [
    "Public bundle workspace contains ignored generated output directory: output/. Remove it before publication.",
  ];
}

function localLinkTarget(href) {
  if (!href || href.startsWith("#")) return null;
  if (/^[a-z]+:/i.test(href)) return null;
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return null;
  return path.normalize(path.join("landing", clean));
}

function undefinedCssVarFailures(files) {
  const readableFiles = files.filter((file) => exists(file));
  const combined = readableFiles.map((file) => read(file)).join("\n");
  const definitions = new Set([...combined.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
  const cssFailures = [];

  for (const file of readableFiles) {
    const content = read(file);
    for (const match of content.matchAll(/var\(\s*--([a-z0-9-]+)([^)]*)\)/gi)) {
      const [, name, remainder] = match;
      if (!definitions.has(name) && !remainder.includes(",")) {
        cssFailures.push(`${file} uses undefined CSS custom property --${name}`);
      }
    }
  }

  return cssFailures;
}

const failures = [];
const warnings = [];

for (const failure of generatedOutputResidueFailures()) {
  failures.push(failure);
}

for (const dir of publicBundleDirs) {
  if (!exists(dir) || !fs.statSync(path.join(root, dir)).isDirectory()) {
    failures.push(`Missing required directory: ${dir}`);
  }
}

for (const file of publicBundleFiles) {
  if (!exists(file)) {
    failures.push(`Missing required file: ${file}`);
  }
}

const allFiles = listFiles().filter((file) => {
  if (ignoredCandidatePrefixes.some((prefix) => file.startsWith(prefix))) return false;
  if (file.startsWith("PRIVATE_")) return false;
  return publicBundleFiles.includes(file);
});

for (const file of allFiles) {
  if (binaryPublicBundleFiles.has(file)) {
    continue;
  }

  const content = contentForPublicProvenanceScan(file, read(file));
  if (emojiPattern.test(content)) {
    failures.push(`Emoji or symbol-range character found in public candidate: ${file}`);
  }
  if (!file.startsWith("scripts/")) {
    for (const pattern of unfinishedPresentationPatterns) {
      if (pattern.test(content)) {
        failures.push(`Unfinished presentation marker ${pattern} found in ${file}`);
      }
    }
  }
  for (const fragment of disallowedLiteralFragments) {
    if (content.toLowerCase().includes(fragment.toLowerCase())) {
      failures.push(`Disallowed local/provenance literal found in public candidate: ${file}`);
    }
  }
  for (const pattern of publicSafetyPatterns) {
    if (file.startsWith("scripts/")) continue;
    if (pattern.test(content)) {
      if (file === ".gitignore" && pattern.source.includes("PRIVATE_")) continue;
      failures.push(`Private/provenance pattern ${pattern} found in ${file}`);
    }
  }
}

const index = read("landing/index.html");
const hrefs = [...index.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
for (const href of hrefs) {
  const target = localLinkTarget(href);
  if (target && !exists(target)) {
    failures.push(`Landing local link does not resolve: ${href} -> ${target}`);
  }
}
for (const requiredText of landingRequiredText) {
  if (!index.includes(requiredText)) {
    failures.push(`landing/index.html is missing required text: ${requiredText}`);
  }
}
for (const forbiddenText of landingForbiddenText) {
  if (index.includes(forbiddenText)) {
    failures.push(`landing/index.html still contains process-leak text: ${forbiddenText}`);
  }
}

for (const blocker of publishBlockers) {
  if (exists(blocker.file) && blocker.pattern.test(read(blocker.file))) {
    warnings.push(blocker.message);
  }
}

if (exists("coach/PROJECT_INSTRUCTIONS.md")) {
  const projectInstructions = read("coach/PROJECT_INSTRUCTIONS.md");
  for (const requiredText of projectInstructionRequiredText) {
    if (!projectInstructions.includes(requiredText)) {
      failures.push(`coach/PROJECT_INSTRUCTIONS.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("coach/START_HERE.md")) {
  const startHere = read("coach/START_HERE.md");
  for (const requiredText of startHereRequiredText) {
    if (!startHere.includes(requiredText)) {
      failures.push(`coach/START_HERE.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/JUDGE_SCORECARD.md")) {
  const judgeScorecard = read("docs/judging/JUDGE_SCORECARD.md");
  for (const requiredText of judgeScorecardRequiredText) {
    if (!judgeScorecard.includes(requiredText)) {
      failures.push(`docs/judging/JUDGE_SCORECARD.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("coach/HANDOFF_CARD.md")) {
  const handoffCard = read("coach/HANDOFF_CARD.md");
  for (const requiredText of handoffCardRequiredText) {
    if (!handoffCard.includes(requiredText)) {
      failures.push(`coach/HANDOFF_CARD.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/judge-walkthrough.md")) {
  const judgeWalkthrough = read("docs/judging/judge-walkthrough.md");
  for (const requiredText of judgeWalkthroughRequiredText) {
    if (!judgeWalkthrough.includes(requiredText)) {
      failures.push(`docs/judging/judge-walkthrough.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/JUDGE_FAQ.md")) {
  const judgeFaq = read("docs/judging/JUDGE_FAQ.md");
  for (const requiredText of judgeFaqRequiredText) {
    if (!judgeFaq.includes(requiredText)) {
      failures.push(`docs/judging/JUDGE_FAQ.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/JUDGE_BRIEF.md")) {
  const judgeBrief = read("docs/judging/JUDGE_BRIEF.md");
  for (const requiredText of judgeBriefRequiredText) {
    if (!judgeBrief.includes(requiredText)) {
      failures.push(`docs/judging/JUDGE_BRIEF.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("reference/signal-map.md")) {
  const signalMap = read("reference/signal-map.md");
  for (const requiredText of signalMapRequiredText) {
    if (!signalMap.includes(requiredText)) {
      failures.push(`reference/signal-map.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/PUBLICATION_CHECKLIST.md")) {
  const publicationChecklist = read("docs/judging/PUBLICATION_CHECKLIST.md");
  for (const requiredText of publicationChecklistRequiredText) {
    if (!publicationChecklist.includes(requiredText)) {
      failures.push(`docs/judging/PUBLICATION_CHECKLIST.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/COMPETITION_RULES_TRACE.md")) {
  const rulesTrace = read("docs/judging/COMPETITION_RULES_TRACE.md");
  for (const requiredText of rulesTraceRequiredText) {
    if (!rulesTrace.includes(requiredText)) {
      failures.push(`docs/judging/COMPETITION_RULES_TRACE.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("docs/judging/ICM_TRACE.md")) {
  const icmTrace = read("docs/judging/ICM_TRACE.md");
  for (const requiredText of icmTraceRequiredText) {
    if (!icmTrace.includes(requiredText)) {
      failures.push(`docs/judging/ICM_TRACE.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("demo/transcript-pack.md")) {
  const transcriptPack = read("demo/transcript-pack.md");
  for (const requiredText of transcriptPackRequiredText) {
    if (!transcriptPack.includes(requiredText)) {
      failures.push(`demo/transcript-pack.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("demo/whole-person-tour.md")) {
  const wholePersonTourText = read("demo/whole-person-tour.md");
  for (const requiredText of wholePersonTourRequiredText) {
    if (!wholePersonTourText.includes(requiredText)) {
      failures.push(`demo/whole-person-tour.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("evals/red-face-tests.md") && exists("evals/research-to-behavior-checklist.md")) {
  const evalCoverageText = `${read("evals/red-face-tests.md")}\n${read("evals/research-to-behavior-checklist.md")}`;
  for (const requiredText of evalCoverageRequiredText) {
    if (!evalCoverageText.includes(requiredText)) {
      failures.push(`eval coverage files are missing required text: ${requiredText}`);
    }
  }
}

if (exists("reference/admin-ops-playbooks.md")) {
  const adminOpsPlaybooks = read("reference/admin-ops-playbooks.md");
  for (const requiredText of adminOpsPlaybooksRequiredText) {
    if (!adminOpsPlaybooks.includes(requiredText)) {
      failures.push(`reference/admin-ops-playbooks.md is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/judge-quick-proof.mjs")) {
  const judgeQuickProofScript = read("scripts/judge-quick-proof.mjs");
  for (const requiredText of judgeQuickProofRequiredText) {
    if (!judgeQuickProofScript.includes(requiredText)) {
      failures.push(`scripts/judge-quick-proof.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/stage-public-repo.mjs")) {
  const stagingHelper = read("scripts/stage-public-repo.mjs");
  for (const requiredText of stagingHelperRequiredText) {
    if (!stagingHelper.includes(requiredText)) {
      failures.push(`scripts/stage-public-repo.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/render-review-screenshots.mjs")) {
  const renderReviewScreenshots = read("scripts/render-review-screenshots.mjs");
  for (const requiredText of renderReviewScreenshotsRequiredText) {
    if (!renderReviewScreenshots.includes(requiredText)) {
      failures.push(`scripts/render-review-screenshots.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/final-review-smoke.mjs")) {
  const finalReviewSmoke = read("scripts/final-review-smoke.mjs");
  for (const requiredText of finalReviewSmokeRequiredText) {
    if (!finalReviewSmoke.includes(requiredText)) {
      failures.push(`scripts/final-review-smoke.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/verify-final-privacy-scan.mjs")) {
  const finalPrivacyScanScript = read("scripts/verify-final-privacy-scan.mjs");
  for (const requiredText of finalPrivacyScanRequiredText) {
    if (!finalPrivacyScanScript.includes(requiredText)) {
      failures.push(`scripts/verify-final-privacy-scan.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/verify-publication-ready.mjs")) {
  const publicationReady = read("scripts/verify-publication-ready.mjs");
  for (const requiredText of publicationReadyRequiredText) {
    if (!publicationReady.includes(requiredText)) {
      failures.push(`scripts/verify-publication-ready.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/verify-github-public-url.mjs")) {
  const githubPublicUrl = read("scripts/verify-github-public-url.mjs");
  for (const requiredText of githubPublicUrlRequiredText) {
    if (!githubPublicUrl.includes(requiredText)) {
      failures.push(`scripts/verify-github-public-url.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/verify-clean-public-stage.mjs")) {
  const cleanPublicStage = read("scripts/verify-clean-public-stage.mjs");
  for (const requiredText of cleanPublicStageRequiredText) {
    if (!cleanPublicStage.includes(requiredText)) {
      failures.push(`scripts/verify-clean-public-stage.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("scripts/verify-submission-surfaces.mjs")) {
  const submissionSurfaces = read("scripts/verify-submission-surfaces.mjs");
  for (const requiredText of submissionSurfacesRequiredText) {
    if (!submissionSurfaces.includes(requiredText)) {
      failures.push(`scripts/verify-submission-surfaces.mjs is missing required text: ${requiredText}`);
    }
  }
}

if (exists("README.md")) {
  const readme = read("README.md");
  for (const requiredText of readmeRequiredText) {
    if (!readme.includes(requiredText)) {
      failures.push(`README.md is missing required text: ${requiredText}`);
    }
  }
  for (const requirement of seoDiscoveryRequiredText) {
    if (!read(requirement.file).includes(requirement.text)) {
      failures.push(`${requirement.file} is missing SEO/AEO/GEO discovery text: ${requirement.text}`);
    }
  }
}

for (const { file, maxWords } of documentationWordLimits) {
  if (!exists(file)) continue;
  const count = wordCount(read(file));
  if (count > maxWords) {
    failures.push(`${file} is too verbose for public review: ${count} words exceeds ${maxWords}.`);
  }
}

for (const stale of staleCodingFirstText) {
  if (exists(stale.file) && read(stale.file).includes(stale.text)) {
    failures.push(`${stale.file} still contains stale coding-first text: ${stale.text}`);
  }
}

for (const stale of staleWholePersonDriftText) {
  if (exists(stale.file) && read(stale.file).includes(stale.text)) {
    failures.push(`${stale.file} still contains stale whole-person positioning text: ${stale.text}`);
  }
}

for (const stale of staleShortcutScopeText) {
  if (exists(stale.file) && read(stale.file).includes(stale.text)) {
    failures.push(`${stale.file} still contains stale shortcut-as-scope text: ${stale.text}`);
  }
}

for (const stale of staleDiagnosisScopeText) {
  if (exists(stale.file) && read(stale.file).includes(stale.text)) {
    failures.push(`${stale.file} still contains stale diagnosis-as-scope text: ${stale.text}`);
  }
}

for (const guardrail of visualCssGuardrails) {
  if (exists(guardrail.file) && guardrail.pattern.test(read(guardrail.file))) {
    failures.push(`${guardrail.file} ${guardrail.message}.`);
  }
}

for (const guardrail of visualTextGuardrails) {
  if (exists(guardrail.file) && guardrail.pattern.test(read(guardrail.file))) {
    failures.push(`${guardrail.file} ${guardrail.message}.`);
  }
}

for (const requirement of visualCssRequiredText) {
  const content = exists(requirement.file) ? read(requirement.file) : "";
  if (!content.includes(requirement.text)) {
    failures.push(`${requirement.file} ${requirement.message}: ${requirement.text}`);
  }
}

for (const failure of undefinedCssVarFailures(["landing/styles.css"])) {
  failures.push(failure);
}

const consoleBehavior = verifyConsoleBehavior(root);
for (const failure of consoleBehavior.failures) {
  failures.push(`Console behavior check failed: ${failure}`);
}

const productThesis = verifyProductThesis(root);
for (const failure of productThesis.failures) {
  failures.push(`Product thesis check failed: ${failure}`);
}

const competitionRulesTrace = verifyCompetitionRulesTrace(root);
for (const failure of competitionRulesTrace.failures) {
  failures.push(`Competition rules trace check failed: ${failure}`);
}

const icmTrace = verifyIcmTrace(root);
for (const failure of icmTrace.failures) {
  failures.push(`ICM trace check failed: ${failure}`);
}

const firstRun = verifyFirstRun(root);
for (const failure of firstRun.failures) {
  failures.push(`First-run check failed: ${failure}`);
}

const firstReplyScorecard = verifyFirstReplyScorecard(root);
for (const failure of firstReplyScorecard.failures) {
  failures.push(`First-reply scorecard check failed: ${failure}`);
}

const startHere = verifyStartHere(root);
for (const failure of startHere.failures) {
  failures.push(`Start-here check failed: ${failure}`);
}

const landingCopy = verifyLandingCopy(root);
for (const failure of landingCopy.failures) {
  failures.push(`Landing copy check failed: ${failure}`);
}

const landingAccessibility = verifyLandingAccessibility(root);
for (const failure of landingAccessibility.failures) {
  failures.push(`Landing accessibility check failed: ${failure}`);
}

const transcriptPack = verifyTranscriptPack(root);
for (const failure of transcriptPack.failures) {
  failures.push(`Transcript pack check failed: ${failure}`);
}

const wholePersonTour = verifyWholePersonTour(root);
for (const failure of wholePersonTour.failures) {
  failures.push(`Whole-person tour check failed: ${failure}`);
}

const firstReplyAcceptance = verifyFirstReplyAcceptance(root);
for (const failure of firstReplyAcceptance.failures) {
  failures.push(`First-reply acceptance check failed: ${failure}`);
}

const evalCoverage = verifyEvalCoverage(root);
for (const failure of evalCoverage.failures) {
  failures.push(`Eval coverage check failed: ${failure}`);
}

const adminOpsPlaybooks = verifyAdminOpsPlaybooks(root);
for (const failure of adminOpsPlaybooks.failures) {
  failures.push(`Admin operations playbooks check failed: ${failure}`);
}

const modeRouter = verifyModeRouter(root);
for (const failure of modeRouter.failures) {
  failures.push(`Mode router check failed: ${failure}`);
}

const sourceNotes = verifySourceNotes(root);
for (const failure of sourceNotes.failures) {
  failures.push(`Source notes check failed: ${failure}`);
}

const judgeQuick = judgeQuickProof(root);
for (const failure of judgeQuick.failures) {
  failures.push(`Judge quick proof check failed: ${failure}`);
}

const submissionCopy = verifySubmissionCopy(root);
for (const failure of submissionCopy.failures) {
  failures.push(`Submission copy check failed: ${failure}`);
}

const submissionSurfaces = verifySubmissionSurfaces(root);
for (const failure of submissionSurfaces.failures) {
  failures.push(`Submission surfaces check failed: ${failure}`);
}

const judgeFaq = verifyJudgeFaq(root);
for (const failure of judgeFaq.failures) {
  failures.push(`Judge FAQ check failed: ${failure}`);
}

const judgeScorecard = verifyJudgeScorecard(root);
for (const failure of judgeScorecard.failures) {
  failures.push(`Judge scorecard check failed: ${failure}`);
}

const judgeBrief = verifyJudgeBrief(root);
for (const failure of judgeBrief.failures) {
  failures.push(`Judge brief check failed: ${failure}`);
}

const finalPrivacyScan = verifyFinalPrivacyScan(root);
for (const failure of finalPrivacyScan.failures) {
  failures.push(`Final privacy scan failed: ${failure}`);
}

const summary = {
  requiredFiles: publicBundleFiles.length,
  checkedFiles: allFiles.length,
  landingLocalRefs: hrefs.filter(localLinkTarget).length,
  consoleBehaviorCases: consoleBehavior.checkedCases,
  demoPromptTabs: consoleBehavior.demoPromptTabs,
  productThesisSections: productThesis.sections,
  productThesisEvidenceRefs: productThesis.evidenceRefs,
  competitionRulesTraceBriefRows: competitionRulesTrace.briefRequirementRows,
  competitionRulesTraceJudgingRows: competitionRulesTrace.judgingQuestionRows,
  competitionRulesTraceProofBullets: competitionRulesTrace.aboveBriefProofBullets,
  competitionRulesTraceReadyChecks: competitionRulesTrace.readyCheckBullets,
  icmTraceSections: icmTrace.sections,
  icmTraceEvidenceRefs: icmTrace.evidenceRefs,
  icmTraceRows: icmTrace.fitRows,
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
  modeRouterStances: modeRouter.stances,
  modeRouterRules: modeRouter.routingRules,
  sourceNotesSections: sourceNotes.sections,
  sourceNotesDesignLineageBullets: sourceNotes.designLineageBullets,
  sourceNotesResearchRows: sourceNotes.researchRows,
  sourceNotesKeyDesignChoices: sourceNotes.keyDesignChoices,
  sourceNotesPortabilityBullets: sourceNotes.portabilityBullets,
  judgeQuickProofStatus: judgeQuick.status,
  judgeQuickProofPromptCount: judgeQuick.fastestColdPrompts.length,
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
  documentationWordCounts: documentationWordCounts(),
  failures,
  warnings,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
