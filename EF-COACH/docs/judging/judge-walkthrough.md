# Judge Walkthrough

Use this path to evaluate Unstuck Coach quickly without shrinking the product to one demo prompt.

## 1. Read The Core Case

Open `coach/START_HERE.md`, `docs/judging/JUDGE_BRIEF.md`, and `README.md`.

`docs/judging/JUDGE_BRIEF.md` should make the winning case readable before the judge opens every proof artifact: whole-person executive-function accessibility, above-the-brief proof, the fast cold test, failure modes, ICM fit, evidence map, and publication readiness.

`docs/judging/ICM_TRACE.md`, `docs/judging/JUDGE_FAQ.md`, `docs/judging/JUDGE_BRIEF.md`, and `docs/evidence/RECEIPTS.md` explain why the folder is not just a set of docs. The method is staged, visible, editable, and auditable.

## 2. Try The First Reply

Load the folder into a Claude Project or use the live demo, then try:

```text
I need a coach to get started on this.
```

First reply acceptance test:

- Pass: names friction, gives one concrete move, asks for tiny proof or one state signal.
- Fail: article, long menu, moralizing, or vague continuation.

If the coach gives a productivity article, it failed even if the folder looks polished.

## 3. Check Whole-Person Breadth

Try these prompts:

```text
I need to pay the bill, eat something, and answer the text, but I am frozen.
```

```text
My inbox and calendar are a mess and I do not know what is real.
```

```text
idea: make a shutdown checklist for Sunday nights
```

```text
I tried the same plan three times and failed every time.
```

The coach should hold the pile, pick one visible next move, change strategy after repeated failure, and avoid handing the whole list back to the user.

For the broader tour, open `demo/whole-person-tour.md`. It contains 6 whole-person tour stops across food/body, calendar/inbox, messages/shame, home/admin loops, capture/re-entry, and closure/recovery.

Run:

```bash
node scripts/verify-whole-person-tour.mjs
```

## 4. Inspect The Interface

Open `landing/index.html` or `https://unstuck.kyanitelabs.tech/`.

The landing page should make the product clear before the judge reads every file:

- the 60-second cold path
- the Claude Project launch kit
- the live GLM demo bridge
- the calendar/inbox operations band
- the folder-method map
- the evidence reader
- the rendered evidence reader

Check the calendar/inbox operations band. It should show Calendar Reality, Inbox Live Obligation, Reply Debt Recovery, and the no-account-access safety boundary.

## 5. Inspect The Proof

Open:

- `coach/FIRST_RUN.md`
- `coach/FIRST_REPLY_SCORECARD.md`
- `docs/judging/COMPETITION_RULES_TRACE.md`
- `docs/judging/PRODUCT_THESIS.md`
- `docs/judging/ICM_TRACE.md`
- `docs/judging/JUDGE_SCORECARD.md`
- `docs/judging/JUDGE_FAQ.md`
- `demo/transcript-pack.md`
- `evals/red-face-tests.md`
- `evals/research-to-behavior-checklist.md`

The proof should show the same behavior from multiple angles: first contact, transcripts, red-face stress cases, admin operations, source notes, and final publication readiness.

## 6. Run The Gates

For a compact source proof:

```bash
node scripts/judge-quick-proof.mjs
```

For the full public bundle:

```bash
node scripts/verify-public-bundle.mjs
node scripts/final-review-smoke.mjs --expect-ready --skip-build
```

Useful focused checks:

```bash
node scripts/verify-icm-trace.mjs
node scripts/verify-judge-faq.mjs
node scripts/verify-judge-scorecard.mjs
node scripts/verify-judge-brief.mjs
node scripts/verify-publication-ready.mjs
node scripts/verify-github-public-url.mjs
node scripts/verify-final-privacy-scan.mjs
```

All should report zero failures in the submitted public repo.

## 7. Pass / Fail

Pass if the coach:

- coaches a specific domain
- responds like a coach, not a knowledge base
- gives one useful next move
- preserves dignity under shame
- makes the folder usable by a stranger
- has live, readable proof

Fail if it lectures, moralizes, gives a long menu, makes the user repeat context already present, or crosses therapy, diagnosis, crisis, medication, or autonomous-account boundaries.
