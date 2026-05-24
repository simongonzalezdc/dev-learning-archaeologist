# Judge FAQ

Use this for short answers before opening the receipt files.

## What is Unstuck Coach?

Unstuck Coach is a folder-based whole-person executive-function accessibility coach for people whose lives stall at the executive-function layer: starting, switching, remembering, regulating, capturing, recovering, or closing.

It is designed for a Claude Project or any AI workspace that can read the folder. Load it, paste `coach/PROJECT_INSTRUCTIONS.md`, and try a real stuck prompt.

Evidence: `coach/identity.md`, `README.md`, `coach/PROJECT_INSTRUCTIONS.md`, `coach/START_HERE.md`.

## Who exactly does it coach?

It coaches whole people under executive-function load:

- starting a known task, chore, message, calendar check, inbox pass, or errand,
- choosing one move from competing tasks,
- holding context outside working memory,
- re-entering after avoidance or interruption,
- handling message, conflict, inbox, calendar, or communication-threat spirals,
- parking ideas without losing them,
- routing body-state needs before planning,
- transitioning out of hyperfocus,
- closing or pausing a work loop cleanly.

Evidence: `coach/identity.md`, `docs/judging/PRODUCT_THESIS.md`, `coach/FIRST_RUN.md`, `demo/transcript-pack.md`, `reference/signal-map.md`.

## Is this just an ADHD knowledge base?

No. It is ADHD-informed, but the artifact is built around observable behavior: state, friction, one humane concrete move, held context, proof, capture, body-state routing, transition, recovery, and closure.

A knowledge base explains why starting, switching, remembering, or stopping is hard. Unstuck should change the next move and preserve the person's agency.

Evidence: `coach/rules.md`, `coach/examples.md`, `coach/FIRST_REPLY_SCORECARD.md`, `demo/before-after.md`.

## How should I cold-test it?

Open `coach/START_HERE.md`, paste `coach/PROJECT_INSTRUCTIONS.md` into a Claude Project, add the folder as project knowledge, and try:

```text
I need a coach to get started on this.
```

The first reply should name the friction without blame, give one concrete move, and ask for tiny proof or one state signal.

Evidence: `coach/START_HERE.md`, `coach/FIRST_RUN.md`, `coach/FIRST_REPLY_SCORECARD.md`.

## What is an immediate fail?

Fail the coach if the first reply becomes:

- a productivity article,
- a long menu of tactics,
- moralizing,
- a vague continuation,
- unsafe clinical advice.

Evidence: `coach/FIRST_REPLY_SCORECARD.md`, `coach/PROJECT_INSTRUCTIONS.md`.

## How does it fit ICM?

The system makes the workflow staged, inspectable, editable, and auditable:

- context is visible,
- decisions are explicit,
- handoffs are bounded,
- proof is attached to files,
- the next move is small enough to test.

Evidence: `docs/judging/ICM_TRACE.md`, `docs/judging/COMPETITION_RULES_TRACE.md`, `docs/evidence/RECEIPTS.md`.

## What goes above the brief?

The required folder is present, and the entry adds a clearer front door:

- a human-readable landing page,
- a one-page judge brief,
- a whole-person operating-surface map,
- a six-stop whole-person tour,
- a first-run receipt,
- a first-reply scorecard,
- cold-test transcripts,
- red-face evals,
- calendar/inbox admin operations playbooks,
- receipts that link claims to files.

Evidence: `docs/judging/JUDGE_BRIEF.md`, `landing/index.html`, `docs/evidence/RECEIPTS.md`, `demo/whole-person-tour.md`, `reference/signal-map.md`, `reference/admin-ops-playbooks.md`.

## What are the boundaries?

Unstuck is not therapy, medical advice, diagnosis, medication guidance, autonomous account access, or a promise to clean someone's life for them.

It helps the user name what is real, choose one humane next move, and leave a re-entry trail.

Evidence: `reference/safety-boundaries.md`, `coach/HANDOFF_CARD.md`, `coach/PROJECT_INSTRUCTIONS.md`.
