# Unstuck Coach Product Thesis

Unstuck Coach is designed as a folder, not an app, because the Week 5 object is a coach that can live inside a Claude Project and remain portable to other agent surfaces. The product surface is the context itself: identity, rules, examples, reference protocols, and proof artifacts that make the coach portable, inspectable, and easy to test cold.

The public cold test is first contact because it is the easiest moment for a judge to evaluate quickly. That does not define the whole product. The full coach covers whole-person executive-function accessibility: start, choose, hold context, sort brain dumps, capture ideas, manage inbox and calendar reality, regulate body state, use bounded activation fuel, transition, recover, and close with a re-entry trail.

## Design Principles

| Principle | Decision | Evidence |
| --- | --- | --- |
| Folder over app | The coach must be drop-in project knowledge, so the files are the interface across Claude Project, Codex, AI IDEs, and local-model contexts. | `coach/identity.md`, `coach/rules.md`, `coach/examples.md`, `reference/`, `coach/PROJECT_INSTRUCTIONS.md`, `coach/START_HERE.md` |
| Whole-person EF access | The coach supports task start, choice, working-memory hold, brain-dump sorting, inbox triage, calendar reality checks, capture, body-state routing, bounded activation fuel, transition, recovery, and closure. | `coach/identity.md`, `coach/rules.md`, `reference/coaching-protocols.md`, `reference/admin-ops-playbooks.md`, `reference/signal-map.md` |
| Mode routing | The coach shifts between ally support, strategy, execution, memory keeping, and recovery closure without making the user choose a mode. | `coach/identity.md`, `coach/rules.md`, `reference/mode-router.md`, `scripts/verify-mode-router.mjs` |
| First contact before productivity | The first reply should create one concrete move, not explain executive dysfunction. | `coach/START_HERE.md`, `coach/FIRST_RUN.md`, `demo/transcript-pack.md`, `scripts/verify-first-run.mjs`, `scripts/verify-first-reply-acceptance.mjs` |
| Interpretable context | The method is staged as state, friction, move, hold, check, close so a judge can inspect the loop. | `coach/rules.md`, `reference/coaching-protocols.md`, `docs/judging/ICM_TRACE.md`, `landing/index.html`, `scripts/verify-icm-trace.mjs` |
| Proof before persuasion | Every public claim points to a file or verifier that can disprove it. | `docs/evidence/RECEIPTS.md`, `docs/judging/JUDGE_SCORECARD.md`, `scripts/verify-public-bundle.mjs` |
| Boundaries are product quality | The coach avoids therapy, diagnosis, medication guidance, and crisis handling. | `reference/safety-boundaries.md`, `coach/HANDOFF_CARD.md` |

## Why The Folder Is The Product

The brief asks for a coach folder someone can drop into a Claude Project. Unstuck keeps that primary path, but does not make Claude Project the only usable surface. Codex, Antigravity-style project IDEs, and local models can all use the same operating files when they can read the folder or receive the core files in context. The landing page is only the judge door: it shows the thesis, makes the first run copy-ready, and points back to the files that actually shape the coach.

The folder structure creates an interpretable coaching system:

- `coach/identity.md` names the athlete, promise, voice, and limits.
- `coach/rules.md` defines the coaching loop and response constraints.
- `coach/examples.md` calibrates tone and behavior under realistic pressure.
- `reference/` holds reusable protocols, admin operations playbooks, signal maps, source notes, and safety boundaries.
- `coach/PROJECT_INSTRUCTIONS.md` turns the folder into paste-ready Claude Project setup.
- `coach/START_HERE.md` gives a cold judge the fastest possible first run, including non-Claude setup paths.
- `coach/FIRST_RUN.md` shows the exact cold-start prompt, expected first reply, and proof loop.

## Why First Contact Is The Demo, Not The Product

The target user is not someone who needs generic productivity education or moral pressure. They are a whole person who can often describe what matters and still lose the thread at predictable executive-function pressure points. First contact is the fastest demo because it is concrete enough to evaluate in a short competition window.

The product is broader than that demo. Unstuck also coaches:

- choosing one next action from competing tasks or life loops,
- holding context outside the user's working memory,
- triaging inbox and message piles by live obligation instead of inbox zero,
- making calendar reality visible with hard anchors, buffers, and explicit parking,
- recovering missed obligations through one calendar anchor and one inbox cue instead of panic-scanning everything,
- sorting raw brain dumps without making the user clean them up first,
- capturing raw ideas without opening a new loop,
- estimating time with setup and transition cost included,
- checking body state before forcing a plan,
- using one bounded dopamine-menu spark when activation fuel is missing,
- exiting hyperfocus without shame,
- re-entering after avoidance or interruption,
- closing or parking the loop with a visible breadcrumb.

Unstuck Coach should pass this cold test:

```text
I need a coach to get started on this.
```

A weak coach answers with encouragement, an article, or a menu. Unstuck should name the friction without blame, choose one concrete move, hold the rest, and ask for tiny proof.

## How The Method Maps To Behavior

The coaching loop is intentionally inspectable:

1. State: calibrate capacity before assigning action.
2. Friction: name the blocker without turning it into identity.
3. Move: choose one concrete next action.
4. Hold: keep the rest of the list outside working memory.
5. Check: ask for proof small enough to produce immediately.
6. Close: leave a re-entry breadcrumb when the session ends or energy drops.

This is the ICM fit in practical terms: the work becomes staged, editable, auditable context rather than a motivational monologue. `docs/judging/ICM_TRACE.md` makes that fit explicit by mapping each workflow responsibility to files and proof checks; `scripts/verify-icm-trace.mjs` keeps the claim tied to evidence. A judge can open the rules, examples, transcript pack, and verifiers to see whether the loop is actually represented.

## Where It Stops

Unstuck Coach is not a therapist, diagnostic tool, medication advisor, or autonomous execution engine. It should not decide clinical questions, contact other people, rewrite the user's life system, or promise that executive dysfunction is solved. Its job is bounded and strong: protect dignity, improve access, externalize executive function, reduce the next move, capture the loose thread, and keep re-entry visible.

## Judge Standard

The product thesis is successful only if it makes the folder easier to judge. A reader should be able to answer:

- Who is the coach for?
- What live moment does it coach?
- Why is a folder the right delivery surface?
- How is the coaching loop represented in files?
- What would count as failure?
- Which artifacts prove or disprove the claims?

If those answers are unclear, the entry is not yet winner-shaped.
