# Unstuck Coach

Unstuck Coach is a whole-person executive-function accessibility coach. It helps someone turn a messy stuck point into one humane next move while keeping the rest of the task pile out of working memory.

## Try It

- Landing page: `https://unstuck.kyanitelabs.tech/`
- Live GLM 5.1 demo: `https://unstuck.kyanitelabs.tech/chat/`
- Source: `https://github.com/simongonzalezdc/unstuck-coach`

## What It Does

- Accepts messy input without making the user organize first.
- Names the friction in plain language, without blame.
- Gives one concrete next move, not a productivity article.
- Holds the rest of the pile so the user does not have to.
- Covers body state, calendar, inbox, messages, home/admin loops, capture, re-entry, and shutdown.
- Avoids therapy, diagnosis, medication advice, crisis handling, and autonomous account access.

## Use It In Claude Project

1. Add the project files as knowledge.
2. Paste `coach/PROJECT_INSTRUCTIONS.md` into the project instructions.
3. Start a new chat with:

```text
I need a coach to get started on this.
```

The coach should answer with one plain next move and one tiny check the user can answer immediately.

## Source Layout

- `coach/` contains the coach identity, rules, examples, and setup instructions.
- `reference/` contains coaching protocols, signal mapping, safety boundaries, and calendar/inbox playbooks.
- `demo/` contains examples of better coaching behavior.
- `landing/` contains the public website.
- `live-demo/` contains the hosted chat demo.

## Run Locally

```bash
npm test
npm run live-demo
```

Then open `http://localhost:3000/chat/`.

## Safety

Unstuck Coach helps with access to the next move. It does not read accounts, send messages, schedule events, provide clinical care, or replace qualified professional support.
