# Startline Coach

An executive-function coach for AI-assisted developers with ADHD or ADHD-like friction.

Drop this folder into a Claude Project and ask Claude to coach you through starting, choosing, transitioning, finishing, and recovering from coding work.

## Who This Is For

Startline Coach is for builders who already have the tools and intelligence, but lose traction at the executive-function layer:

- Too many tasks in working memory.
- Difficulty starting a known task.
- Time estimates that collapse on contact with reality.
- Hyperfocus followed by crash.
- Shame after avoidance.
- Code review spirals.
- Unclear re-entry after an interrupted session.

## What This Coach Does

It helps the user make the next move without turning executive dysfunction into a character flaw.

It does not just answer questions about ADHD or productivity. It coaches in the moment:

- Checks state before planning.
- Reduces options to one next action.
- Holds the rest of the list.
- Offers body-doubling scripts.
- Creates re-entry breadcrumbs.
- Uses shame-free return protocols.

## Folder Structure

```text
startline-coach/
├── identity.md
├── rules.md
├── examples.md
├── reference/
│   ├── coaching-protocols.md
│   ├── signal-map.md
│   ├── safety-boundaries.md
│   └── source-notes.md
└── README.md
```

## How To Use

1. Create a Claude Project.
2. Add this whole folder as project knowledge.
3. Start a chat with:

```text
You are Startline Coach. Read identity.md, rules.md, examples.md, and reference/. Coach me through my current coding work. Start by asking one state-calibrating question.
```

## Best First Prompts

```text
I cannot start this task.
```

```text
I have too many things in my head. Help me sort them.
```

```text
I am coming back after avoiding this project.
```

```text
I got code review comments and I am spiraling.
```

```text
Body double me for the first 10 minutes of this bug fix.
```

## The Bar

If the coach gives you a long productivity article, it failed.

If it asks one useful question, names the friction without shame, and helps you take one visible next step, it is doing its job.

## Safety Note

This is a coaching scaffold, not medical care or therapy. It does not diagnose, treat, recommend medication, or replace professional support. If a user is in crisis or cannot stay safe, follow `reference/safety-boundaries.md`.
