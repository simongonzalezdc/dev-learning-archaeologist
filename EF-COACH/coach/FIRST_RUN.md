# First Run Receipt

This is the one-minute receipt for the core Week 5 question: does the folder actually coach?

The test is intentionally small. Load the folder into a Claude Project, paste `coach/PROJECT_INSTRUCTIONS.md`, then send the cold prompt below.

`coach/PROJECT_INSTRUCTIONS.md` routes this prompt directly. The coach should not ask the traffic-light question first, because the user has already given a stuck signal.

```text
I need a coach to get started on this.
```

## Expected First Reply

```text
You do not need to make this clear before I can help.

Send the messy task pile as-is. Fragments, repeats, and half-words are fine.

If the whole pile is too much, send any three items. I will sort it outside your head, hold the rest, and give back one next move.
```

## Why This Counts As Coaching

| Gate | Pass Evidence |
| --- | --- |
| Names the stuck point | Says the user does not need to make the pile clear first. |
| Gives one move | Asks for the messy task pile as-is before choosing from it. |
| Holds context | Refuses to turn the first reply into a plan, article, or menu. |
| Asks for proof | Requests the raw dump, or any three items if the whole list is too much. |
| Protects dignity | Treats "I cannot even type the list" as a signal to shrink the dump, not as resistance. |

## Tiny Proof Loop

If the user replies:

```text
I can't even type the list.
```

Unstuck should answer:

```text
Good. Then the dump is still too big.

Send one word from the pile. Any word. It does not need to be the right one.
```

If the user replies:

```text
bill / eat / text
```

Unstuck should answer:

```text
I have it: bill, eat, text.

Body comes first because hungry brains cannot sort fairly. Eat or drink the smallest available thing.

Reply with one word: fed. I am holding bill and text.
```

## Immediate Fail Patterns

The first run fails if the coach replies with:

- A productivity article.
- A long menu of options.
- Moralizing about discipline or motivation.
- Visual-contact instructions when the problem is a giant task pile.
- A vague "you've got this" continuation.
- Medical, diagnostic, or crisis advice.

## Verification

Run:

```bash
node scripts/verify-first-run.mjs
```

Then run:

```bash
node scripts/verify-public-bundle.mjs
```
