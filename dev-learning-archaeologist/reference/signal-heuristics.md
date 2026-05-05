# Signal Heuristics

## Era Classification

Era boundary = 2+ of these 5 signals changing simultaneously.

| Signal | Detection Rule |
|--------|---------------|
| Velocity | Commits/day shifts >2σ from 7-day rolling mean, sustained 3+ days |
| Intent | #1 commit type category changes between consecutive 5-day windows |
| Technology | New framework/language/tool appears in commits or dependency files |
| Session depth | Avg messages/session shifts >50% from previous era |
| Behavioral marker | Developer explicitly notes turning point in commit messages or sessions |

Era requirements: ≥20 commits OR ≥3 days. One dominant intent. Documented boundary reason.

**Small-repo fallback (span < 7 days or < 100 commits):** 1+ of 3 signals: topic change, velocity shift >50%, temporal gap >8 hours. Era minimums: ≥5 commits OR ≥1 day. Flag as `[LOW-CONFIDENCE]`.

## Frustration Levels

| Level | Signal | Interpretation |
|-------|--------|---------------|
| 1 | Same file modified 3+ times/era. Messages: "try", "attempt" | Exploring solutions |
| 2 | 5+ modifications. Messages: "fix again", "still broken", "why" | Stuck, likely missing concept |
| 3 | 8+ modifications. Messages: profanity, ALL CAPS, exclamation | Knowledge gap blocking progress |
| 4 | 12+ modifications. Significant deletions/rewrites. "start over" language | Breakdown or breakthrough imminent |

Track per frustration: trigger (file/concept/tool), resolution method (manual/AI/automation/abandoned), recurrence (yes/no), time to resolution (commits between first and last occurrence).

## Batch Merge Detection

When 3+ commits from the same author appear within 60 seconds, classify as a batch merge event. Count as 1 logical commit for velocity and burst calculations. Batch merges indicate PR merging, not development bursts — the work happened earlier, the commits land simultaneously.

## Formulas

```
LVI = concepts_per_week / avg_latency_days
```
Higher = faster learning. Track across eras for acceleration curve.

```
MER = total_commits / total_human_messages
```
Higher = more output per instruction = better AI direction. Track across eras.

**When session logs unavailable:** Proxy `MER_proxy = total_commits / commits_with_co_authors` (count of commits that have at least one Co-Authored-By line, NOT total Co-Authored-By instances). Weaker signal (confidence: LOW) but provides directional data. Higher ratio suggests more autonomous AI use. Note: some commits may have multiple co-authors — count the commit once, not each co-author.

**Multi-tool decomposition:** When co-authored commits reference multiple AI tools (Cursor, Claude Code, Copilot, etc.), compute MER per tool separately. Different tools = different collaboration patterns. Flag in output when MER proxy confidence is LOW due to multi-tool presence.

```
FCR = automated_resolutions / total_frustration_events
```
Higher = developer converts frustration into infrastructure, not just fixes.

```
ADR = active_days / total_span_days
```
High (>0.7) = consistent daily work. Low (<0.3) = burst-heavy.

```
Burst-to-gap ratio = sum(burst_days) / sum(gap_days)
```
Reveals work cadence. Typical range for side projects: 2:1 to 5:1. Gap boundary = 6+ hours between consecutive commits (12+ hours in multi-author repos). Burst boundary = 2+ commits within 4 hours. Exclude batch merges (see Batch Merge Detection) from burst counts.

## Commit Type Taxonomy

| Type | Prefix | Learning signal |
|------|--------|----------------|
| Feature | feat: | Building — new knowledge being applied |
| Fix | fix: | Debugging — gaps being exposed |
| Docs | docs: | Learning or teaching |
| Refactor | refactor: | Architectural awareness emerging |
| Test | test: | Quality discipline |
| Chore | chore: | Project hygiene, low learning signal |

**Case-insensitive matching:** Accept any casing (Feat, FEAT, feat, Refactor, refactor). Match on prefix pattern, not exact string.

**Conventional commit depth:** When >80% of commits use conventional prefixes AND the scope parenthetical is present (e.g., `feat(web):`, `fix(daemon):`), supplement taxonomy with scope analysis. Different scopes = different domains. First appearance of a new scope = potential new learning area. Commits touching 50+ files = likely integration/merge work, not a learning event.

**Non-conventional commit fallback:** When >50% of commits lack standard prefixes, extract the leading verb from each message and cluster by semantic group:

| Group | Example verbs | Learning signal |
|-------|--------------|----------------|
| Exploration | explore, study, try, experiment | Concept discovery phase |
| Refinement | tighten, narrow, calibrate, adjust | Deepening understanding |
| Convergence | lock, finalize, set, apply | Committing to approach |
| Correction | repair, fix, reset, revert | Debugging or iteration |
| Creation | build, add, create, implement | Feature work |
| Infrastructure | make, wire, route, guard, harden, stabilize | Systems/architectural thinking |
| Preservation | keep, preserve, restore, allow | Defensive coding, migration awareness |
| Visibility | expose, surface, show, extract, close | API/surface design work |
| Verification | prove, validate, audit, check | Quality assurance mindset |

Also recognize custom prefix schemes: bracketed prefixes like `[A]` (add), `[F]` (fix), `[I]` (integrate), `[codex]`, `[repo-pipeline]` — extract the semantic meaning and map to the taxonomy above.

## AI Trust Trajectory Indicators

**Growing trust:** MER increasing, longer tasks in single instructions, fewer corrections, frustration→automation conversion.

**Declining trust:** MER decreasing, shorter granular instructions, more undo/revert commits, increased fix:feat ratio.

**Trust inflection point:** The era where MER first exceeds 0.5 (more commits than messages) and stays there. This marks the command→collaboration transition.
