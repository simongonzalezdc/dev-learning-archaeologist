# Unstuck Coach

Unstuck Coach is a folder-based whole-person executive-function accessibility coach. It helps a person start, switch, remember, regulate, capture, recover, and close loops without having to carry the whole mess in working memory.

The core idea: the folder is the product. It externalizes state, friction, next action, safety boundaries, examples, and proof so an LLM can coach the live threshold moment instead of giving a productivity article.

## Live Paths

- Landing page: `https://unstuck.kyanitelabs.tech/`
- Live GLM 5.1 demo: `https://unstuck.kyanitelabs.tech/chat/`
- Evidence reader: `https://unstuck.kyanitelabs.tech/evidence`

## Repo Map

This repository is staged so a judge does not have to decode a flat file pile:

- `coach/` is the coach contract: setup instructions, identity, rules, examples, first-run receipt, and first-reply scorecard.
- `reference/` is the operating layer: coaching protocols, signal map, safety boundaries, mode router, and admin-ops playbooks.
- `demo/` and `evals/` are behavior proof: transcripts, before/after contrast, whole-person tour, and red-face tests.
- `docs/judging/` is the competition layer: judge brief, scorecard, FAQ, ICM trace, rules trace, writeup, walkthrough, checklist, and submission copy.
- `docs/evidence/` is the claim-to-file receipt map.
- `landing/` is the public website and rendered evidence room.
- `scripts/` is the verification layer.

That is the ICM shape: staged context, visible decisions, editable documents, and auditable proof.

## Fast Judge Path

1. Open `coach/START_HERE.md`.
2. Open `docs/judging/JUDGE_BRIEF.md`.
3. Try the live demo or load the folder into a Claude Project.
4. Test: `I need a coach to get started on this.`
5. Score the first reply with `coach/FIRST_REPLY_SCORECARD.md`.

This is a shortcut, not the product boundary. The full scope is whole-person executive-function access across work, home, body, admin, messages, inbox, calendar, capture, re-entry, and shutdown.

If Unstuck gives a productivity article, it failed. If it gives one state-aware next move, holds the rest of the pile, and asks for tiny proof, it is behaving like a coach.

## Use The Folder

### Claude Project

1. Add the folder as project knowledge.
2. Paste `coach/PROJECT_INSTRUCTIONS.md` into project instructions.
3. Start with `I need a coach to get started on this.`

### Codex Or AI IDE

Open this folder as the workspace. `AGENTS.md` tells coding agents how to load the coach contract before answering coaching prompts.

```bash
codex -C unstuck-coach "I need a coach to get started on this."
```

### Local Models

Use a runner with enough context for `coach/PROJECT_INSTRUCTIONS.md`, `coach/identity.md`, `coach/rules.md`, `coach/examples.md`, and the key files in `reference/`. If context is tight, start with `coach/PROJECT_INSTRUCTIONS.md` plus:

- `reference/coaching-protocols.md`
- `reference/signal-map.md`
- `reference/safety-boundaries.md`

## Evidence Map

- `coach/PROJECT_INSTRUCTIONS.md` is the paste-ready coach contract.
- `coach/FIRST_RUN.md` shows the cold-start behavior.
- `coach/FIRST_REPLY_SCORECARD.md` makes the first reply pass/fail.
- `docs/judging/JUDGE_BRIEF.md` gives the one-page winning case.
- `docs/judging/COMPETITION_RULES_TRACE.md` maps the Week 5 rules to evidence.
- `docs/judging/ICM_TRACE.md` maps the system to visible, editable, auditable workflow.
- `docs/evidence/RECEIPTS.md` maps claims to source files.
- `landing/evidence.html` renders the public proof room.

## Search And AI Discovery

- `robots.txt` exposes the sitemap.
- `sitemap.xml` lists the landing page, live chat demo, and evidence reader URLs.
- `llms.txt` gives answer engines and AI search a concise citation path.
- `landing/index.html` carries canonical URL, preview metadata, and structured data.

## Verification

```bash
node scripts/final-review-smoke.mjs --expect-ready --skip-build
node scripts/verify-github-public-url.mjs
node scripts/verify-final-privacy-scan.mjs
```

The full verifier list lives in `docs/judging/PUBLICATION_CHECKLIST.md` and `scripts/`.

## Safety

Unstuck is not therapy, diagnosis, medication advice, crisis care, or autonomous account access. It helps the user identify the next visible move; it does not secretly operate their inbox, calendar, files, or accounts.
