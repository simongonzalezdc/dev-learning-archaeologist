# ICM Trace

This file makes the ICM fit inspectable instead of leaving it as a claim.

In this entry, ICM means practical workflow architecture: a messy human problem is staged into visible context, editable decisions, bounded handoffs, and auditable proof. Unstuck Coach applies that frame to whole-person executive-function accessibility.

## Practical Fit

| ICM need | Unstuck decision | Evidence |
| --- | --- | --- |
| Name the operating context | Define the athlete, promise, voice, boundaries, and refusal style before any coaching move. | `coach/identity.md`, `reference/safety-boundaries.md` |
| Stage the work | Route every response through state, friction, move, hold, check, and close. | `coach/rules.md`, `reference/coaching-protocols.md` |
| Make decisions inspectable | Show what counts as good or failed coaching before the judge reads the whole folder. | `coach/FIRST_REPLY_SCORECARD.md`, `coach/FIRST_RUN.md`, `docs/judging/JUDGE_SCORECARD.md` |
| Preserve context without overload | Hold the rest of the task list outside working memory while returning one concrete move. | `coach/rules.md`, `reference/signal-map.md`, `coach/HANDOFF_CARD.md` |
| Convert examples into behavior | Calibrate the coach under task-start friction, shame, communication threat, overload, capture, and recovery. | `coach/examples.md`, `demo/transcript-pack.md`, `evals/red-face-tests.md` |
| Separate source material from execution | Keep protocols, signals, safety, and source lineage in reference files instead of burying them in prompts. | `reference/` |
| Make the handoff portable | Give a stranger the exact Claude Project instructions and the shortest cold-run path. | `coach/PROJECT_INSTRUCTIONS.md`, `coach/START_HERE.md`, `docs/judging/judge-walkthrough.md` |
| Make proof executable | Pair claims with verifiers and a final smoke gate. | `docs/evidence/RECEIPTS.md`, `scripts/verify-icm-trace.mjs`, `scripts/final-review-smoke.mjs` |
| Keep publication auditable | Make the public posting state checkable: eligibility, clean repo, public URL, and final privacy checks are all explicit. | `docs/judging/PUBLICATION_CHECKLIST.md`, `scripts/verify-publication-ready.mjs`, `scripts/verify-github-public-url.mjs` |

## File Responsibilities

- `coach/identity.md`: who the coach serves, what it promises, how it speaks, and where it refuses.
- `coach/rules.md`: the staged behavior loop and routing policy.
- `coach/examples.md`: calibration pressure tests for live executive-function friction.
- `reference/`: reusable protocols, signal maps, safety boundaries, and source notes.
- `coach/PROJECT_INSTRUCTIONS.md`: the paste-ready Claude Project handoff.
- `coach/START_HERE.md`: the shortest judge path.
- `coach/FIRST_RUN.md`: the exact cold-start receipt.
- `coach/FIRST_REPLY_SCORECARD.md`: the first-response pass/fail gate.
- `docs/judging/JUDGE_SCORECARD.md`: the broader competition scoring frame.
- `docs/evidence/RECEIPTS.md`: claim-to-file proof.
- `landing/index.html`: the visual judge door, not a replacement for the folder.
- `scripts/verify-icm-trace.mjs`: executable guard that this trace stays present and evidence-backed.

## What Would Fail The Fit

- A generic ADHD or productivity knowledge base.
- A polished article with no first move.
- A folder where required files exist but do not own distinct responsibilities.
- A hidden app dependency that makes the folder hard to test in Claude Project.
- Vague claims about methodology without scorecards, receipts, or verifiers.
- Clinical advice, diagnosis, medication guidance, or crisis handling outside the safety boundary.
- A public submission path that leaks private review material or local provenance.

## Cold-Run Proof Path

1. Open `coach/START_HERE.md`.
2. Paste `coach/PROJECT_INSTRUCTIONS.md` into a Claude Project with the folder loaded as knowledge.
3. Try `I need a coach to get started on this.`
4. Score the first reply with `coach/FIRST_REPLY_SCORECARD.md`.
5. Inspect this trace, then run:

```bash
node scripts/verify-icm-trace.mjs
node scripts/final-review-smoke.mjs --expect-ready --skip-build
```

The first reply should name friction without shame, choose one concrete move, hold the rest, ask for tiny proof, and avoid an article or tactic menu.
