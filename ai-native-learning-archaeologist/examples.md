# Examples: Sterilized Behavioral Data Demonstrations

All numbers are real measurements from actual development projects. All identifying information removed.

---

## Example 1: Mode 1 Output — Actuals (Abbreviated)

**Data scope:** 1,818 commits, 26 active days, 47-day span, 14 eras.

**Before/after snapshot:**

| Metric | Era 1 | Era 7 | Change |
|--------|-------|-------|--------|
| Commits/day | 2.4 | 47.8 | 19.9x |
| Messages/commit | 3.86 | 0.85 | -78% |
| Learning latency | 18 days | 1 day | 18x faster |
| Enforcement hooks | 0 | 26 | All from frustrations |
| Test commits | 0% | 1.4% | First tests appearing |

**Breakthrough detection:**

| Breakthrough | Evidence | Impact |
|-------------|----------|--------|
| Specification precision | Messages/commit: 9.90 → 0.85 (Era 4→7) | 11.6x fewer correction cycles |
| Hook architecture | 26 hooks created, avg 12 hrs after triggering frustration | Zero recurrences after hook |
| Just-in-time learning | Latency: 18 days (March) → 1 day (April) | Watch-and-implement flow state |
| AI trust transition | Human-directed: ~80% (Era 4) → ~40% (Era 7) | Commanding → collaborating |

**Temporal patterns discovered:**

| Pattern | Data | Interpretation |
|---------|------|---------------|
| Peak creative hour | 21:00 (14.2% of all commits, 2.3x mean) | Best feature work when quiet |
| Peak creative day | Sunday (+28% vs avg) | Weekend-protected creative time |
| Burst-to-gap ratio | 3:1, avg gap 6.7 days | Hyperfocus → neurochemical recovery |
| Active-day ratio | 55% (26/47) | Burst-heavy, not daily-consistent |

---

## Example 2: Mode 2 Output — Gaps (Top 3)

**Gap 1: Integration/Wiring**
- Impact: 60-70% of all rework (125/696 intent signals)
- Evidence: 3 enforcement hooks for this single problem; architecture audit found triple redundancy with zero shared code
- Root cause: No mental model for dependency injection or module boundaries

**Gap 2: Test-First Discipline**
- Impact: Entire test suite broken for 80%+ of project lifespan
- Evidence: 1.4% test commits vs 49% feature commits; ">92% coverage" was scaffolding that rotted immediately
- Root cause: Tests treated as afterthought, not specification

**Gap 3: Model Capability Awareness**
- Impact: 6 documented hallucination patterns
- Evidence: 12+ AI tools used with no systematic task-model matching; adoption lags ranged from 0 to 50 months
- Root cause: No mental model for model size vs capability tradeoffs

**Blind spots:** Cache invalidation (iteration system defeated by LLM response caching), CI/CD (workflows removed, never restored), abstraction (triple redundancy undetected until audit).

---

## Example 3: Mode 3 Output — Plan (Top 2 Topics)

**Topic 1: Wiring Discipline — End-to-End Integration as Default**
- ROI: 10/10 | Time: 2-3 hrs | Prerequisites: none
- Why you: 3 hooks spawned, 18% of intents are wiring, triple redundancy in audit
- Learn: Dependency injection, module boundaries, interface contracts
- **Verified content:** Jake Van Cleef — "Stop Building AI Agents. Use This Folder System Instead." (youtube.com/watch?v=MkN-ss2Nl10). Why: teaches module boundary thinking through folder architecture — same mental model applied to code.
- Practice: Pick any unwired module. Write integration test proving Module A output feeds Module B input. See it fail. Wire it.
- Verify when: You write wire-up code BEFORE module code, not after.

**Topic 2: Test-First Discipline — Tests as Specifications**
- ROI: 10/10 | Time: 4-5 hrs | Prerequisites: Topic 1
- Why you: 1.4% test commits, entire suite broken, msg/commit went 9.90→0.85 when you started specifying
- Learn: Red-Green-Refactor, behavioral testing, mocking for AI-dependent code
- **Verified content:** Matt Pocock — "TypeScript Crash Course with Matt Pocock" (youtube.com/watch?v=p6dO9u0M7MQ). Why: specification-driven development through types — the same discipline applied to tests.
- Practice: Pick one module. Write 3 tests before code: valid input→non-empty, invalid→error, output matches schema. Watch fail. Make pass.
- Verify when: You feel wrong committing without a test.

---

## Example 4: AI Maturity Evolution

| Era | Autonomy | Evidence | Human-Directed % |
|-----|----------|----------|-----------------|
| 1 | L1 Directed | Agent executes at 10.5 commits/hr (machine speed) | ~95% |
| 4 | L2 Goal-oriented | 9.90 msgs/commit, heavy correction | ~60% |
| 7 | L3 Collaborative | 0.85 msgs/commit, 5-word instructions produce 13 files | ~40% |
| 10+ | L3→L4 Supervisory | Pipeline agents supervising other agents | ~25% |

**Trust inflection point:** Era where messages/commit dropped below 2.0 and stayed there — the transition from commanding AI to collaborating with it.

**Tool adoption pattern:** 0-3 month lag for actively researched tools vs. 25-50 month lag for passively discovered tools. Local model deployment was the adoption accelerator — removing API cost barriers enabled rapid experimentation.

---

## Example 5: What Google Takeout Unlocks (Sterilized)

The data below was produced when YouTube watch history was correlated with commit activity. Without Takeout, these insights are impossible.

**Learning latency collapse:**

| Month | Avg latency (watch → implement) | Interpretation |
|-------|-------------------------------|---------------|
| March, Week 1-2 | 18 days | Watch now, implement weeks later |
| March, Week 3-4 | 12 days | Accelerating — concepts absorbing faster |
| April, Week 1 | 1 day | Just-in-time learning — watch and build same session |
| April, Week 2 | 1 day | Sustained flow state |

**Gap period activity (days with zero commits):**

| Period | Gap days | Videos watched/day | vs. active days |
|--------|---------|-------------------|----------------|
| Gap 1 | 5 days | 35.2/day | Only 26% reduction from active days |
| Gap 2 | 11 days | 38.1/day | Near-active learning rate |
| Gap 3 | 4 days | 31.7/day | Active incubation, not dormancy |

**Creator-to-technology triggers:** Specific YouTube creators correlated with implementation bursts in specific technologies. Pattern: creator demonstrates technique → developer implements within 0-3 days. The top 5 influential creators accounted for 60% of all strong correlations.

**Learning pipeline direction:** MIXED — 55% proactive (watched before building) + 45% reactive (watched after encountering a problem). Proactive watches correlated with higher-quality first implementations (fewer fix commits within 48 hours).

---

## Example 6: HTML Report — What the Browser Opens

This is what the user sees after the analysis completes. A single HTML file (`learning-archaeologist-report.html`) auto-opens in the browser.

**Report structure (4 interactive tabs):**

### Overview Tab
- Header badge: "🔮 Learning Archaeologist"
- Project stats: 1,818 commits · 26 active days · 14 eras · 47-day span
- **Metrics grid:** 4 sparkline cards showing velocity, AI collaboration, LVI, peak creative hour
- **Breakthroughs list:** Specification precision (11.6x fewer corrections), Hook architecture (zero recurrences), Just-in-time learning (18 days → 1 day), AI trust transition (commanding → collaborating)

### The Actuals Tab
- **Era Timeline:** Horizontal stacked bar — 14 segments proportional to commits per era, color-coded by intent (cyan=building, green=deepening, purple=exploring, amber=integrating)
- **Learning Velocity Curve:** Area chart with `clip-path` polygon. Y = LVI per era. Shows acceleration from Era 1 (LVI 0.3) to Era 7 (LVI 4.2)
- **AI Maturity Trajectory:** Purple line chart. Y = MER. Labels L1→L2→L3 at each inflection point
- **Hourly Heatmap:** 24-cell grid. 21:00 glows brightest (14.2% of commits). Dead hours (09:00-17:00) are near-black
- **Before/After Table:** Side-by-side metrics with color-coded changes (green for positive, red for negative)

### The Gaps Tab
- **Severity Donut:** `conic-gradient` showing 1 BLOCKS (red, 60%), 1 REWORK (yellow, 30%), 1 LIMITS (purple, 10%)
- **Rework Breakdown:** Horizontal gradient bars — Integration 60%, Testing 25%, Tooling 10%, Architecture 5%
- **Gap Cards:** Each gap is a card with `border-left: 3px solid [severity-color]`. Evidence badges (`a1b2c3d`, `e4f5g6h`) are clickable cyan pills
- **Blind Spots Grid:** 3 cards in a row — Cache invalidation, CI/CD, Abstraction

### The Plan Tab
- **Curriculum Timeline:** Vertical connected timeline. Topic 1 (Wiring) → Topic 2 (Tests) → Topic 3 (Model awareness). Each node shows rank, title, ROI, hours
- **ROI Scatter Plot:** X = hours (2-5), Y = ROI (8-10), bubble size = rework % addressed. All bubbles in green quadrant
- **Topic Cards:** Expanded view with verified content section — exact video title, real YouTube URL, one-sentence fit explanation

**Technical details:**
- Single file, inline CSS, zero dependencies
- Dark theme (`#0a0a0f` background, `#38bdf8` cyan accent)
- Responsive: stacks to 2-column metrics on tablet, full-width cards on mobile
- All charts are CSS-only — no Chart.js, no D3, no external fonts
- Evidence badges have `title` tooltips showing commit date and context
- `[UNVERIFIED]` findings render at `opacity: 0.65` with dashed left border
