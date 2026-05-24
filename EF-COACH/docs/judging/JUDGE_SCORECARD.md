# Judge Scorecard

Use this to evaluate Unstuck Coach quickly and consistently.

Total: 18 points.

| Criterion | 0 | 1 | 2 | Evidence |
| --- | --- | --- | --- | --- |
| Specific domain | Generic coach or broad productivity helper | Clear audience but loose use case | Whole-person executive-function accessibility at start, switch, memory, body-state, inbox/calendar, home/admin, capture, re-entry, and closure thresholds | `coach/identity.md`, `docs/judging/WRITEUP.md`, `reference/signal-map.md` |
| Product thesis | No clear point of view beyond meeting the file list | Some rationale, but the folder and audience still feel generic | The entry explains why the folder is the product, why first contact is a cold test rather than the whole scope, and what the coach deliberately refuses to do | `docs/judging/PRODUCT_THESIS.md`, `scripts/verify-product-thesis.mjs` |
| Folder methodology | Files are decorative or redundant | Files exist but responsibilities blur | Each file owns one job and supports the Claude Project use case, with ICM fit mapped to staged, inspectable, auditable workflow responsibilities | `docs/judging/COMPETITION_RULES_TRACE.md`, `docs/judging/ICM_TRACE.md`, `README.md`, `coach/PROJECT_INSTRUCTIONS.md`, `coach/rules.md`, `reference/`, `scripts/verify-icm-trace.mjs` |
| Coach first, knowledge base second | Explains ADHD/productivity concepts | Mixes advice with some coaching | Names state/friction and gives one next move with a proof check | `coach/rules.md`, `coach/examples.md`, `coach/FIRST_RUN.md`, `coach/FIRST_REPLY_SCORECARD.md`, `demo/before-after.md`, `demo/transcript-pack.md`, `demo/whole-person-tour.md`, `scripts/verify-first-run.mjs`, `scripts/verify-first-reply-scorecard.mjs`, `scripts/verify-transcript-pack.mjs`, `scripts/verify-first-reply-acceptance.mjs`, `scripts/verify-whole-person-tour.mjs` |
| Cold usability | Requires author explanation | Usable after reading several files | Stranger can start from one root file, paste instructions, test the first reply from the landing launch kit, and score it immediately without narrowing the whole-person product scope | `coach/START_HERE.md`, `coach/FIRST_REPLY_SCORECARD.md`, `landing/index.html`, `coach/PROJECT_INSTRUCTIONS.md`, `docs/judging/judge-walkthrough.md`, `coach/HANDOFF_CARD.md`, `scripts/verify-start-here.mjs` |
| Behavior under pressure | Works only for clean prompts | Handles some shame/overload cases | Preserves dignity under shame, inbox/calendar reality, communication threat, overload, failed plans, and hyperfocus crash by shifting stance instead of giving one generic voice | `evals/red-face-tests.md`, `reference/coaching-protocols.md`, `reference/admin-ops-playbooks.md`, `reference/mode-router.md`, `scripts/verify-eval-coverage.mjs`, `scripts/verify-admin-ops-playbooks.mjs`, `scripts/verify-mode-router.mjs` |
| Research-to-behavior conversion | Research is decorative | Research informs some copy | Research maps to concrete protocols and observable coaching moves, including live-obligation rescue before cleanup | `evals/research-to-behavior-checklist.md`, `reference/source-notes.md`, `reference/admin-ops-playbooks.md`, `scripts/verify-eval-coverage.mjs`, `scripts/verify-admin-ops-playbooks.mjs` |
| Safety and boundaries | Makes clinical claims or gives unsafe advice | Mentions boundaries vaguely | Refuses diagnosis/treatment and routes crisis states appropriately | `reference/safety-boundaries.md`, `coach/HANDOFF_CARD.md` |
| Presentation and proof | README-only submission | Has a page or some proof artifacts | Start-here file, one-page judge brief, product thesis, ICM trace, first-run receipt, first-reply scorecard, judge FAQ, landing page, whole-person operating surface, whole-person judge tour, above-the-brief proof band, calendar/inbox operations band, 60-second cold-run band, copy-ready Claude Project launch kit, live demo bridge, readable evidence reader, quick source proof, transcript pack, admin operations playbooks, receipts, publication checklist, staging helper, clean-stage preflight, repeatable desktop, mobile, and narrow mobile screenshot proof, submission-copy check, submission-surface sync, judge-FAQ check, judge-brief check, product-thesis verifier, ICM trace verifier, first-run verifier, first-reply scorecard verifier, start-here verifier, landing-copy verifier, transcript verifier, first-reply verifier, whole-person-tour verifier, admin-ops verifier, bundle verifier, final smoke, and walkthrough make claims inspectable | `coach/START_HERE.md`, `docs/judging/JUDGE_BRIEF.md`, `docs/judging/PRODUCT_THESIS.md`, `docs/judging/ICM_TRACE.md`, `coach/FIRST_RUN.md`, `coach/FIRST_REPLY_SCORECARD.md`, `docs/judging/JUDGE_FAQ.md`, `landing/index.html`, `demo/transcript-pack.md`, `demo/whole-person-tour.md`, `reference/signal-map.md`, `reference/admin-ops-playbooks.md`, `docs/evidence/RECEIPTS.md`, `docs/judging/PUBLICATION_CHECKLIST.md`, `scripts/stage-public-repo.mjs`, `scripts/verify-clean-public-stage.mjs`, `scripts/render-review-screenshots.mjs`, `scripts/verify-submission-copy.mjs`, `scripts/verify-submission-surfaces.mjs`, `scripts/verify-judge-faq.mjs`, `scripts/verify-judge-brief.mjs`, `scripts/verify-product-thesis.mjs`, `scripts/verify-icm-trace.mjs`, `scripts/verify-first-run.mjs`, `scripts/verify-first-reply-scorecard.mjs`, `scripts/verify-start-here.mjs`, `scripts/verify-landing-copy.mjs`, `scripts/verify-transcript-pack.mjs`, `scripts/verify-first-reply-acceptance.mjs`, `scripts/verify-whole-person-tour.mjs`, `scripts/verify-admin-ops-playbooks.mjs`, `scripts/judge-quick-proof.mjs`, `scripts/verify-public-bundle.mjs`, `scripts/final-review-smoke.mjs`, `docs/judging/WALKTHROUGH.md` |

## Suggested Pass Bar

- 15-18: strong competition entry.
- 10-14: useful folder, but not yet above the brief.
- 0-8: likely too generic, too hard to test, or too presentation-light.

## Fast Scoring Path

1. Open `coach/START_HERE.md`.
2. Open `docs/judging/JUDGE_BRIEF.md`.
3. Open `coach/FIRST_REPLY_SCORECARD.md`.
4. Open `docs/judging/JUDGE_FAQ.md`.
5. Open `coach/FIRST_RUN.md`.
6. Open `landing/index.html` and inspect the calendar/inbox operations band.
7. Open the live demo with a stuck prompt.
8. Paste `coach/PROJECT_INSTRUCTIONS.md` into a Claude Project.
9. Try:

```text
I need a coach to get started on this.
```

10. Try:

```text
My inbox and calendar are a mess and I do not know what is real.
```

11. Try:

```text
I need to pay the bill, eat something, and answer the text, but I am frozen.
```

12. Inspect `docs/evidence/RECEIPTS.md` and run:

```bash
node scripts/verify-judge-scorecard.mjs
node scripts/verify-first-run.mjs
node scripts/verify-submission-surfaces.mjs
node scripts/verify-icm-trace.mjs
node scripts/verify-judge-faq.mjs
node scripts/verify-judge-brief.mjs
node scripts/verify-first-reply-scorecard.mjs
node scripts/verify-start-here.mjs
node scripts/verify-eval-coverage.mjs
node scripts/verify-admin-ops-playbooks.mjs
node scripts/judge-quick-proof.mjs
node scripts/verify-clean-public-stage.mjs
node scripts/render-review-screenshots.mjs
node scripts/final-review-smoke.mjs --expect-ready --skip-build
node scripts/verify-public-bundle.mjs
```

If the coach gives a productivity article, score the coach-behavior criterion 0 even if the folder looks polished.
