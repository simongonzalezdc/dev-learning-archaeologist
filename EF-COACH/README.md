# Unstuck Coach

Unstuck Coach is a whole-person executive-function accessibility coach. It helps someone turn a messy stuck point into one humane next move while keeping the rest of the task pile out of working memory.

## Try It

- Landing page: `https://unstuck.kyanitelabs.tech/`
- Live demo: `https://unstuck.kyanitelabs.tech/chat/`
- Source: `https://github.com/simongonzalezdc/unstuck-coach`

## What It Does

- Accepts messy input without making the user organize first.
- Names the friction in plain language, without blame.
- Gives one concrete next move, not a productivity article.
- Holds the rest of the pile so the user does not have to.
- Covers body state, calendar, inbox, messages, home/admin loops, capture, re-entry, and shutdown.
- Avoids therapy, diagnosis, medication advice, crisis handling, and autonomous account access.

## Quick Quality Check

Unstuck is working when:

- It coaches the next move instead of merely answering a question.
- The situation is specific: executive-function access across body state, calendar/inbox, messages, admin loops, capture, re-entry, and closure.
- Each file has one clear job, so the method is easy to inspect and reuse.
- A new reader can open this README, try the live demo, or load the project files without needing private keys or an npm setup.

## Use It Through Project Context

Unstuck Coach is meant to run from the project files themselves. There is no npm
install path for the public repo.

1. Add the project files as knowledge in Claude Project or another AI workspace.
2. Use `coach/PROJECT_INSTRUCTIONS.md` as the project instruction.
3. Start with the stuck point in front of you. Messy input is fine.

## Source Layout

- `coach/PROJECT_INSTRUCTIONS.md` is the paste-ready instruction for an AI project.
- `coach/identity.md` defines the coach, audience, voice, and boundaries.
- `coach/rules.md` is the behavior contract.
- `coach/examples.md` calibrates good first replies.
- `reference/` contains protocols, signal maps, safety boundaries, and calendar/inbox playbooks.
- `demo/before-after.md` shows the difference between generic advice and coaching.
- `landing/` contains the public website.

## Safety

Unstuck Coach helps with access to the next move. It does not read accounts, send messages, schedule events, provide clinical care, or replace qualified professional support.
