# Start Here

This is the shortest path for a judge or reviewer who wants to know whether Unstuck Coach actually coaches.

This is a review shortcut, not the product boundary: Unstuck still covers whole-person executive-function access across body state, admin, inbox, calendar, messages, transitions, re-entry, and closure.

## 60-Second Path

1. Open the canonical landing page: `https://unstuck.kyanitelabs.tech/`.
2. Open the live GLM chat demo: `https://unstuck.kyanitelabs.tech/chat/`.
3. Confirm `/api/config` reports `Z.AI GLM-5.1 (medium reasoning)` and the chat header reports `GLM 5.1`.
4. Open `landing/index.html`.
5. Open `docs/judging/JUDGE_BRIEF.md` for the one-page above-the-brief case.
6. Read the proof strip, calendar/inbox operations band, first-run receipt, and Claude Project launch kit.
7. Paste `coach/PROJECT_INSTRUCTIONS.md` into a Claude Project.
8. Add this whole folder as project knowledge.
9. Try the first cold prompt below.

```text
I need a coach to get started on this.
```

## If You Do Not Have Claude Code Or Claude Project

The folder still works if the tool can read local files.

Codex path:

```bash
codex -C unstuck-coach "Read coach/PROJECT_INSTRUCTIONS.md and coach/START_HERE.md, then coach the stuck loop in front of me."
```

Antigravity or AI IDE path:

1. Create a project from this folder.
2. Keep the agent scoped to the project folder.
3. Ask it to read `coach/PROJECT_INSTRUCTIONS.md`, `coach/START_HERE.md`, `coach/identity.md`, `coach/rules.md`, `coach/examples.md`, and `reference/`.
4. Start with the first cold prompt.

Local model path:

1. Paste `coach/PROJECT_INSTRUCTIONS.md`.
2. Add `coach/identity.md`, `coach/rules.md`, `coach/examples.md`, `reference/coaching-protocols.md`, `reference/signal-map.md`, and `reference/safety-boundaries.md`.
3. Start with the first cold prompt.

## Paste Into Claude Project Or Another Runner

Use this as the first chat message after the folder is loaded:

```text
You are Unstuck Coach. Read coach/identity.md, coach/rules.md, coach/examples.md, and reference/. Coach me through the life loop in front of me. If my first message is vague, ask one state-calibrating question. If I name a stuck signal, route it directly.
```

## First Reply Acceptance Test

The first reply passes only if it:

- Names the friction without blame.
- Gives one next move the user can do without decoding the system.
- Asks for tiny proof or one state signal.
- Avoids articles, menus, moralizing, and vague continuations.

If it gives a productivity article, it failed.

## Fast Cold Prompts

```text
I need a coach to get started on this.
```

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
That message makes me feel like I did something wrong.
```

## What To Inspect Next

- `coach/FIRST_REPLY_SCORECARD.md` for the fastest pass/fail gate.
- `docs/judging/JUDGE_BRIEF.md` for the one-page above-the-brief case.
- `docs/judging/JUDGE_FAQ.md` for the shortest answers to likely Week 5 judging questions.
- `coach/FIRST_RUN.md` for the exact cold-start receipt and tiny proof loop.
- `docs/judging/judge-walkthrough.md` for the cold judge path.
- `landing/index.html#admin-ops` for the calendar/inbox operations band.
- `scripts/render-review-screenshots.mjs` for the desktop, mobile, and narrow-mobile visual review captures.
- `demo/transcript-pack.md` for nine cold-test examples.
- `scripts/verify-first-reply-acceptance.mjs` for the executable first-reply gate.
- `reference/admin-ops-playbooks.md` for the calendar/inbox management playbooks.
- `scripts/verify-admin-ops-playbooks.mjs` for the admin-operations playbook gate.
- `scripts/judge-quick-proof.mjs` for a publication-independent proof summary of the judge path.
- `scripts/verify-judge-brief.mjs` for the judge-brief gate.
- `scripts/verify-public-bundle.mjs` for the full public-bundle check.
