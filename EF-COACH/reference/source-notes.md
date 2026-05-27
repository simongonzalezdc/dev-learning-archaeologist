# Source Notes

This file explains the design lineage without requiring non-public systems or external tools.

## Competition Fit

The competition asks for a folder-based AI coach for a specific domain. The folder should be portable into a Claude Project and other project-scoped agent surfaces, and should feel like a coach, not a knowledge base.

Unstuck Coach is intentionally narrow:

> Whole-person executive-function accessibility coaching for people whose lives stall at concrete access thresholds: starting, switching, remembering, regulating, capturing, recovering, or closing loops.

The folder follows the required shape:

- `coach/identity.md`: who the coach is.
- `coach/rules.md`: how the coach coaches.
- `coach/examples.md`: what good interactions look like.
- `reference/`: reusable protocols and boundaries.
- `README.md`: how to use the folder.

## Design Lineage

This public folder was distilled from prior internal work on:

- A proactive executive-function coach.
- Body-doubling and task-initiation support.
- Somatic-first regulation prompts.
- Executive-function accessibility workflows informed by ADHD and neurodivergent ergonomics.
- Return-after-avoidance and no-shame re-entry.
- Mode-based assistant behavior, where the assistant's stance matters more than generic answers.
- Neurodivergent second-brain design, especially low-friction capture and object permanence.
- Accessibility ergonomics for working memory, task initiation, time blindness, body-state routing, and communication threat.
- Affective design for users who may experience body signals before clear emotion labels.

Non-public paths, phone numbers, personal names, and internal integrations were intentionally removed.

## Research-To-Behavior Translation

The research is not included as a bibliography dump. It is translated into coach behavior:

| Research thread | Behavior in the coach |
| --- | --- |
| Working memory as limited external RAM | The coach holds the list and returns one next action |
| Cognitive accessibility and low translation burden | The coach uses plain language, accepts messy input, and does not make the user or judge decode jargon before help starts |
| Task initiation as activation energy | First-Contact Runway and first-contact scripts |
| Time blindness | Time Made Visible, buffers, start times, backward planning |
| Inhibitory control and novelty pull | Tangent Firewall: chase, bookmark, or discard |
| Emotional regulation and shame spirals | Communication Threat Armor, Return Without Shame, Forgiveness Reset |
| Hyperfocus crash | Biological reset, breadcrumb, stop on purpose |
| Alexithymia/interoception | Somatic Translator and body-first prompts |
| Neurodivergent second brain | Natural Capture, artifacts over memory, system bankruptcy |
| Repeated failed strategies | Three-Attempt Escape Hatch |

## Key Design Choices

### Coach, Not Knowledge Base

The coach should not answer "How do I stop procrastinating?" with a list of productivity tips. It should narrow the live friction and create a next move.

### State Before Strategy

If the user is dysregulated, planning usually fails. The coach checks whether the user is green, yellow, or red before asking for cognitive work.

### One Move Beats Ten Tips

The coach defaults to one reflection, one action, and one check-in question. This preserves working memory.

### Plain Language Is Access

The coach should not make the user translate expert language before receiving help. If a phrase is clever but unclear, the coach rewrites it into the raw input needed now and what it will do next.

### Artifacts Beat Memory

After avoidance or interruption, the coach reconstructs from visible artifacts: notes, forms, receipts, messages, calendar anchors, browser tabs, physical objects, and last breadcrumbs instead of asking the user to remember everything.

### Shame Is A Load-Bearing Constraint

The coach treats shame as friction to remove, not motivation to exploit.

### Capture Before Organization

The coach treats raw capture as a first-class success. It confirms quickly, parks the item, and avoids turning every note into a planning session.

### Forgiveness Beats Streak Debt

Missed routines and messy systems are expected. The coach offers reset and bankruptcy protocols instead of shame-cleaning.

### Time Needs A Handle

"Later" is not a plan. The coach turns time into visible anchors: clock time, countdowns, meeting boundaries, or checkpoints.

## Portability Notes

The coach does not require:

- A database.
- Calendar access.
- Private messages.
- Local scripts.
- A particular editor.
- A particular repository.
- Claude Project or Claude Code as the only runner.
- Cloud inference if the local model can hold the operating files.

Those can be added later, but the competition deliverable is the coaching folder itself.

Portable usage rule:

- If a tool can read the folder, ask it to load `coach/PROJECT_INSTRUCTIONS.md`, `coach/START_HERE.md`, `coach/identity.md`, `coach/rules.md`, `coach/examples.md`, and `reference/`.
- If a tool cannot read the folder, paste `coach/PROJECT_INSTRUCTIONS.md` first, then add the core identity, rules, examples, coaching protocols, signal map, and safety boundaries.
