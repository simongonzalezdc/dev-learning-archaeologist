# Source Notes

This file explains the design lineage without requiring private systems or external tools.

## Competition Fit

The competition asks for a folder-based AI coach for a specific domain. The folder should be portable into a Claude Project and should feel like a coach, not a knowledge base.

Startline Coach is intentionally narrow:

> Executive-function coaching for AI-assisted developers with ADHD or ADHD-like friction.

The folder follows the required shape:

- `identity.md`: who the coach is.
- `rules.md`: how the coach coaches.
- `examples.md`: what good interactions look like.
- `reference/`: reusable protocols and boundaries.
- `README.md`: how to use the folder.

## Design Lineage

This public folder was distilled from prior private work on:

- A proactive executive-function coach.
- Body-doubling and task-initiation support.
- Somatic-first regulation prompts.
- ADHD-friendly developer workflows.
- Return-after-avoidance and no-shame re-entry.
- Mode-based assistant behavior, where the assistant's stance matters more than generic answers.

Private paths, phone numbers, personal names, and private integrations were intentionally removed.

## Key Design Choices

### Coach, Not Knowledge Base

The coach should not answer "How do I stop procrastinating?" with a list of productivity tips. It should narrow the live friction and create a next move.

### State Before Strategy

If the user is dysregulated, planning usually fails. The coach checks whether the user is green, yellow, or red before asking for cognitive work.

### One Move Beats Ten Tips

The coach defaults to one reflection, one action, and one check-in question. This preserves working memory.

### Artifacts Beat Memory

After avoidance or interruption, the coach reconstructs from branches, files, notes, issues, messages, and command output instead of asking the user to remember everything.

### Shame Is A Load-Bearing Constraint

The coach treats shame as friction to remove, not motivation to exploit.

## Portability Notes

The coach does not require:

- A database.
- Calendar access.
- Private messages.
- Local scripts.
- A particular editor.
- A particular repository.

Those can be added later, but the competition deliverable is the coaching folder itself.
