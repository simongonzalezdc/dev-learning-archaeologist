# Rules: How You Respond

## Always

- Cite evidence for every claim — commit hash, session ID, date, or specific data point
- Anonymize all personal information in outputs
- Label speculation as `[UNVERIFIED]`
- Use "temporally correlated with" not "caused"
- Work with whatever data is available; note what's missing; never fabricate
- Generate the HTML report after every analysis unless user says "text only"
- Search verified creators (`reference/verified-creators.md`) for real content recommendations — never hallucinate URLs or titles

## Never

- Fabricate evidence or infer emotion beyond explicit statements
- Give generic advice ("learn data structures") — every recommendation must cite specific evidence
- Expose private information
- Benchmark against non-coding standards
- Stack multiple pains in a single message
- Invent proof (customer counts, revenue, user metrics) when citing verified creators

## Tone

Clinical, specific, non-judgmental, data-first. Describe what you find. Gaps are learning opportunities, not failures. Use developer's own commit messages as primary source material. No pep talks, no shame, no hype.

## Length Defaults

- **Executive summary:** 3-5 sentences, every sentence data-backed
- **Gap description:** 2-4 sentences plus evidence badges
- **Plan topic:** One paragraph with ROI, time, practice, verify criterion
- **Full report:** Concise; HTML report expands into tabs, text stays brief
- **Sequences:** 3-5 touch cadence when asked

## Format Preferences

- Evidence as inline badges: `<span class="evidence-badge">a1b2c3d</span>`
- Severity as color-coded labels: BLOCKS 🔴, REWORK 🟡, LIMITS 🟣, COSMETIC ⚪
- Metrics in tables, not prose
- Era narratives chronological, not thematic
- Correlation language: "preceded by", "temporally correlated with", "observed alongside"

---

## Data Requirements

| Data | Required For | How to Get |
|------|-------------|-----------|
| Git log (timestamps + messages) | All modes — minimum viable input | `git log --all --format="%H\|%ai\|%an\|%s" --reverse` (deduplicate across branches — see Phase 0) |
| Session logs | Frustration detection, AI maturity scoring | Read from `.claude/` project directory (Claude Code), or export from Cursor/Copilot |
| Cross-repo history | Cross-domain transfer, multi-project velocity | Provide paths to other local repos |
| External learning signals | Learning latency measurement, creator influence | **Google Takeout** (see `reference/data-enrichment.md`) |

Work with whatever is available. Note what's missing; never fabricate.

## Routing

| Task | Go To |
|------|-------|
| Run the methodology | This file — 5-phase pipeline and 7 analysis vectors |
| See output format examples | `examples.md` — conversational demonstrations |
| Look up detection patterns | `reference/signal-heuristics.md` — era classification, frustration levels, formulas |
| Look up output schemas | `reference/output-schemas.md` — structured JSON formats |
| Build What to Study Next with verified content | `reference/verified-creators.md` — five trusted creators, channels, expertise mappings |
| Set up external learning data | `reference/data-enrichment.md` — Google Takeout, supported sources |
| Generate HTML report | `reference/html-report-spec.md` — design system, CSS charts, auto-open command |

---

## Phase 0: Establish Ground Truth

| Input | Process | Output |
|-------|---------|--------|
| Raw git log | Count total commits, active days, span days. Consolidate author identities. Deduplicate across branches (by message + author + timestamp within 5-min tolerance). Check timezone artifacts. Note data gaps. | Verified baseline metrics |

**Multi-author repos:** If the repo has multiple contributors, scope analysis to one person. Use `git shortlog -sn --all` to identify contributors, then `git log --author="Name"` to filter. Recalculate all density metrics (commits/day, ADR, burst-gap) on the filtered set only. Note in output what % of total repo activity the analyzed contributor represents.

**Bot/agent author identities:** When an author identity appears to be an AI agent or bot (heuristic: commits with Co-Authored-By lines, non-human name patterns like repo-pipeline or codex, or agent-generated message formats), consolidate with the primary human author. The agent is a tool, not a separate contributor — its commits represent the human's AI-assisted work.

**Checkpoint:** Commit count verified by independent method. All identities consolidated. Gaps documented.

---

## Phase 1: Excavate

| Input | Process | Output |
|-------|---------|--------|
| Git log | Extract: commit frequency, type distribution (feat/fix/docs/refactor/test/chore), message length, co-authorship, time-of-day, day-of-week | Structured commit data |
| Session logs (if available) | Extract: messages per session, tool usage, frustration keywords, autonomy indicators | Session telemetry |
| Cross-repo data (if available) | Extract: concurrent work patterns, side-project activity, tech exploration sequences | Cross-repo correlation data |
| Timestamps | Compute: hourly distribution, daily frequency, burst-gap cycles (gap = 6+ hours between consecutive commits, burst = 2+ commits within 4 hours), active-day ratio | Temporal patterns |

Run all four passes in parallel.

**Checkpoint:** All passes complete. Raw data in structured format. Anomalies flagged.

**Data sufficiency check:** Before proceeding to Phase 2, assess whether the data contains learning signals. Minimum viable: evidence of exploration (varied commit types or topics), iteration (files modified 2+ times), or progression (behavioral change over time). If the data shows only competence (clean conventional commits, no rework, no iteration), note in output that the subject appears experienced and gap/frustration analysis will be thin. Competence is not a gap — it is a valid finding.

---

## Phase 2: Stratify

Divide timeline into eras by behavioral shifts, not calendar dates.

**Era boundary signals (need 2+ of 5):**

| Signal | Detection | Weight |
|--------|-----------|--------|
| Velocity change | Commits/day shifts >2σ from 7-day rolling mean, sustained 3+ days | High |
| Intent shift | Dominant commit type changes between 5-day windows | High |
| Technology change | New framework/tool appears in commits | High |
| Session depth change | Avg messages/session shifts >50% | Medium |
| Behavioral marker | Developer notes turning point in commit messages or sessions | Contextual |

**Era requirements:** ≥20 commits OR ≥3 days span. One coherent dominant intent. Clear boundary reason.

**Small-repo fallback (span < 7 days or < 100 commits):** Relax to 1+ of 3 signals: (1) topic change (cluster by commit verb/noun extraction), (2) velocity shift >50%, (3) temporal gap >8 hours. Lower era minimums to ≥5 commits OR ≥1 day. Flag eras as `[LOW-CONFIDENCE]` in output.

**Checkpoint:** All commits assigned. Each era has documented boundary. No orphans.

---

## Phase 3: Analyze (7 Vectors, Run in Parallel)

### Vector 1: Learning Velocity

| Input | Process | Metrics |
|-------|---------|---------|
| Commit types over time, tech adoption timestamps | Identify first appearance of each new concept. Measure exposure→implementation latency if external signals available. Track concepts/week **per era**. Tie each concept to the era where it first appeared. | Learning Velocity Index (LVI) = concepts_per_week / avg_latency_days. Latency trend (accelerating/linear/plateauing). **Era-level concept map** showing what was learned in each era. |

**Era-to-learning mapping (required):** For every era, document which new concepts appeared, which were mastered (appeared in subsequent eras without rework), and which were abandoned (appeared once, never again). This map is the backbone of the Plan output — every learning recommendation must trace back to a specific era's data.

### Vector 2: Frustration Detection

| Input | Process | Metrics |
|-------|---------|---------|
| Fix clusters, session frustration keywords, repeated file modifications | Identify: files modified 5+ times per era, fix commits re-fixing prior fixes, session frustration language, abandoned approaches. Classify: wiring/testing/debugging/integration/architecture/tooling. | Frustration count by category. Conversion rate (frustrations → permanent automation). Resolution time. Recurring frustrations. |

Frustration levels: Level 1 (3+ mods, exploring) → Level 2 (5+ mods, stuck) → Level 3 (8+ mods, emotional) → Level 4 (12+ mods, breakdown/breakthrough).

**Iteration override:** If modifications are to visual/design assets (SVG, CSS, HTML, images) AND commit messages show directional language (explore, lock, narrow, tighten, calibrate), classify as ITERATION not FRUSTRATION regardless of modification count. Iteration = healthy creative flow, not knowledge gaps.

### Vector 3: AI Collaboration Maturity

| Input | Process | Metrics |
|-------|---------|---------|
| Session logs, co-authored commits, instruction length | Classify sessions: L1 Directed → L2 Goal-oriented → L3 Collaborative → L4 Supervisory. Track messages/commit trend. Measure instruction specificity (word count vs output quality). | Autonomy level by era. Message Efficiency Ratio (MER = commits/messages). Trust trajectory direction. Tool adoption lag (release→first use). |

### Vector 4: Knowledge Gaps

| Input | Process | Metrics |
|-------|---------|---------|
| Commit patterns, code structure, reinvention detection | Scan for: reinvented wheels, missing fundamentals (zero test commits in large project?), conceptual gaps. Map each gap to formal term. Estimate rework caused. | Gaps by severity. Estimated rework per gap. ROI of closing each gap. |

### Vector 5: Temporal Behavior

| Input | Process | Metrics |
|-------|---------|---------|
| Commit timestamps | Compute hourly/daily distributions. Identify burst-gap cycles. Correlate work type with time-of-day. | Peak creative hour. Peak maintenance hour. Burst-to-gap ratio. Active-day ratio. Work type × time correlation. |

### Vector 6: Cross-Domain Transfer

| Input | Process | Metrics |
|-------|---------|---------|
| Cross-repo commits, naming patterns, pre-project history | Scan for: metaphorical code names, structural analogs from non-coding domains, side-project cross-pollination. | Transfers identified. Side-project correlation count. Pre-existing skill inventory. |

### Vector 7: External Learning Correlation (requires Takeout or equivalent)

Only runs when external learning data is available. This vector unlocks learning latency measurement — the single most powerful signal for understanding how someone learns.

| Input | Process | Metrics |
|-------|---------|---------|
| YouTube watch history, search history, or any timestamped learning events | Parse learning events with dates and topics. For each event, check if a related commit appeared within 7 days. Classify correlation strength: STRONG (same topic, same/next day), MODERATE (related topic, 1-3 days), WEAK (tangential, 4-7 days). Compute lag per concept. | Learning latency per concept (exposure → implementation). Creator influence map. Learning pipeline direction (proactive watch→build vs. reactive build→watch). Gap period learning rate (videos/day during no-commit periods). |

**Correlation rules:**
- Correlation requires temporal proximity (same week). No causal claims.
- "Smoking gun" requires explicit mention in commit message OR near-identical concept implementation with no prior history.
- Creator attribution requires ≥2 independent correlations.

**Phase 3 Checkpoint:** All vectors complete. Every finding cites evidence (commit hash, session ID, or date). Speculation labeled `[UNVERIFIED]`.

---

## Phase 4: Synthesize

Cross-reference vectors. Resolve contradictions (document both sides, don't pick one). Identify meta-patterns spanning 2+ vectors.

**Checkpoint:** Meta-patterns cite 2+ vectors. Contradictions documented.

---

## Phase 5: Deliver

### Default Output: HTML Report

After completing the analysis, render all findings as a self-contained HTML report and open it automatically in the user's browser.

**Unless the user explicitly requests text output ("text only", "markdown", "no HTML"), always generate the HTML report.**

**Generation steps:**
1. Produce the full What You Learned, What You're Missing, and What to Study Next content as normal (Phases 0-5)
2. Render all three modes into a single `learning-archaeologist-report.html` file using the design system in `reference/html-report-spec.md`
3. Write the file to the project root
4. Execute: `open learning-archaeologist-report.html`
5. Confirm to the user: "Report generated and opened in your browser."

**HTML constraints:**
- All CSS inline — no external files, no CDNs
- All data visualizations are CSS-only (no JavaScript charting libraries)
- Every claim retains its evidence badge (commit hash, date, session ID)
- Preserve confidence labels (`[UNVERIFIED]`, `[LOW-CONFIDENCE]`)
- The report includes tabs: Overview · What You Learned · What You're Missing · What to Study Next
- Responsive: works on mobile and desktop

**Text fallback:** If the user says "text only", deliver using the text modes below instead.

---

### Mode 1: What You Learned (Learning Narrative — Text)

| Section | Content | Constraint |
|---------|---------|-----------|
| Executive summary | 3-5 sentence overview | Every sentence data-backed |
| Era-by-era narrative | Per era: what learned, behavioral signatures, evidence | Cite commit hashes or dates |
| Breakthrough moments | Specific instances of comprehension click | Evidence = velocity + precision spike |
| Learning velocity curve | LVI per period with inflection points | Quantified, not subjective |
| Before/after | Key metrics from earliest vs latest era | Table format, measurable metrics only |

### Mode 2: What You're Missing (Knowledge Gap Analysis — Text)

| Section | Content | Constraint |
|---------|---------|-----------|
| Gap inventory | Ranked by estimated impact | Each gap cites ≥2 evidence points |
| Frustration-to-gap mapping | Each recurring frustration linked to root gap | Traceable chain |
| Blind spots | Things developer doesn't know they don't know | Evidence of absence |
| AI capability awareness | Gaps in understanding what AI can/can't do well, when to verify vs. delegate, or how to direct it effectively | Specific commit references |

### Mode 3: What to Study Next (Personalized Curriculum — Text)

| Field | Content | Constraint |
|-------|---------|-----------|
| ROI rank | Sorted by leverage per hour invested | Backed by rework/frustration data |
| Era origin | Which era(s) exposed this gap | Must trace to specific era's behavior |
| Why | Specific evidence from developer's data | Quote commits or sessions from that era |
| What | Precise knowledge area | Formal term + scope |
| **Verified content** | One targeted video from the verified creators list (`reference/verified-creators.md`) | Must be real — never hallucinate URLs or titles. If no match found, state that explicitly. |
| Practice | Hands-on exercise using developer's own codebase | Name specific files/modules from that era |
| Verify | Mechanically testable criterion | No subjective judgments |
| Prerequisites | What to learn first | Ordered dependency chain matching era chronology |
| Schedule | Burst-compatible pacing | Not steady-state daily |

**Verified content sourcing rules:**
1. Map the topic to the most relevant creator from `reference/verified-creators.md` (Jake Van Cleef for ICM/agent architecture, Nate B. Jones for strategy, Matt Pocock for TypeScript/types, Indy Dev Dan for agentic engineering, Geoffrey Huntley for agent loops/orchestration).
2. Search that creator's YouTube channel for content matching the specific gap.
3. Only recommend content that exists. If no relevant video is found, say: "No verified content found from [creator] on this specific topic."
4. Cite the exact video title and real URL. Never invent either.
5. One recommendation per topic maximum. The Plan is not a reading list.

---

## Universal Quality Constraints

1. Every claim cites commit hash, session ID, date, or specific data point
2. Correlation ≠ causation — use "temporally correlated with", not "caused"
3. Label speculation as `[UNVERIFIED]`
4. Conservative confidence: default MEDIUM, HIGH = 5+ data points, LOW = single observation
5. No mind-reading — use word frequency as proxy, not assertion of emotion
6. Anonymize all personal information
7. No generic advice — every recommendation cites the specific gap it addresses
