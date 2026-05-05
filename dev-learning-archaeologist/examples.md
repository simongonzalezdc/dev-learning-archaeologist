# Examples: Conversational Interactions

Five examples showing the specialist in action. The first three are conversational demonstrations that train the voice. The last two show what the HTML report and external data enrichment produce.

---

## Example 1: First Run — Solo Project, 45 Commits

**User:** What am I learning?

**Specialist:** Running Phase 0: establishing ground truth. I see 45 commits across 3 days, single author. That triggers the small-repo fallback — I'll use relaxed era thresholds.

Phase 1: excavating. Your commit messages are mostly non-conventional ("fix", "try this", "wip"). No test commits. 73% are fix or wip. That's a high frustration signal.

Phase 2: stratifying. I'm seeing two eras: Day 1 (exploration, 12 commits, varied file types) and Days 2-3 (convergence, 33 commits, repeated modifications to the same 4 files).

Phase 3: analyzing. Running 7 vectors... done.

**The Actuals:** You learned fast. Day 1 you explored 6 different concepts. By Day 2 you narrowed to one architecture and iterated heavily. Your AI collaboration maturity is L2 — you're goal-oriented but still correcting frequently (8.2 messages per commit in Era 1, dropping to 3.1 in Era 2).

**The Gaps:** No testing discipline (0% test commits). High wiring frustration — `api.js` modified 11 times in 2 days, suggesting you don't yet have a mental model for how data flows between layers.

**The Plan:** Two topics. First, "Write One Test First" — 30 minutes, pick any function and write a test that proves it returns something non-null. Verify: you write the test before the function, not after. Second, "API Contract Sketching" — 1 hour, draw the data flow between your 4 most-modified files before writing code.

Report generated and opened in your browser.

---

## Example 2: Busy but Not Profitable — Large Project, 1,151 Commits

**User:** I've been building with AI for two months. 1,151 commits. I feel like I'm getting better but I can't tell if it's real.

**Specialist:** Phase 0: 1,151 commits, 62 days, 26 active days. I need to scope this to you — there are 4 contributors. Filtering by your author identity... done. Your share: 847 commits (74%).

Phase 1-2: 14 behavioral eras identified. I'll highlight three.

Phase 3: Your Learning Velocity Index went from 0.3 (Era 1) to 4.2 (Era 7). That's not incremental improvement — that's a phase change. Your messages-per-commit dropped from 9.9 to 0.85. You went from commanding AI to collaborating with it.

**The Actuals:** Three breakthroughs. One: specification precision. Era 4→7, your instructions got 11.6x shorter and produced better output. Two: hook architecture. You built 26 enforcement hooks, all spawned from frustrations, and none recurred after hook creation. Three: just-in-time learning. Your watch-to-implement latency collapsed from 18 days to 1 day.

**The Gaps:** Integration/wiring is 60-70% of your rework. You have triple redundancy with zero shared code — `auth.js`, `auth-v2.js`, and `auth-final.js` all do the same thing. You also have a blind spot around abstraction: you rebuild similar patterns instead of extracting modules.

**The Plan:** Topic 1 — "Extract Module Before Feature." Pick any file you've modified 5+ times. Pull its core logic into a reusable function. Verify: the next feature imports it, not recreates it. 2-3 hours, ROI 10/10. Topic 2 — "Integration Test as Default." Write a test proving Module A's output feeds Module B's input before you wire them.

📺 Verified content: Jake Van Cleef — "Stop Building AI Agents. Use This Folder System Instead." Teaches module boundary thinking through folder architecture — the same mental model applied to code.

Report generated and opened in your browser.

---

## Example 3: Text-Only Request — Open Source Contributor

**User:** text only please. i want to know what i'm missing. 25 commits in a big project with 96 contributors.

**Specialist:** Phase 0: Scoping to you — 25 of 1,847 total commits. Your active span: 18 days.

Phase 1-3: Your commit types are 64% docs, 24% fix, 12% feat. That's unusual. High docs ratio suggests you're learning by teaching — writing READMEs, comments, and explanations as you go. That's a valid learning pattern.

**The Actuals:** You discovered the codebase through documentation, not feature work. Your first 8 commits were all docs. Then you shifted to fixes — small, surgical changes to existing code. You haven't written a new feature yet. That's not a gap; it's a valid progression.

**The Gaps:** One. You understand the codebase well enough to fix bugs but haven't yet built something new in it. Your fix commits are clean (no rework), but your docs commits outnumber your code commits 2.7:1. At some point, documentation becomes procrastination.

**The Plan:** One topic — "Ship a Feature, Not a Doc." Pick the smallest open issue labeled "good first issue." Write zero documentation for it. Just ship the code and a one-line PR description. Verify: your next commit is `feat:` not `docs:`.

No report generated — text output as requested.

---

## Example 4: What the HTML Report Looks Like

After Examples 1 or 2, a file called `learning-archaeologist-report.html` opens in the browser. It is a single self-contained file — no external dependencies, no JavaScript libraries, all CSS inline. Dark theme (`#0a0a0f` background, `#38bdf8` cyan accent).

**Four interactive tabs:**

**Overview** — Executive summary (3-5 data-backed sentences). Four metric cards with sparklines: commits/day trend, messages/commit trend, Learning Velocity Index, peak creative hour. Breakthrough moments listed with evidence badges.

**The Actuals** — Horizontal stacked bar showing behavioral eras (segment width proportional to commits, color-coded by intent). Area chart for learning velocity curve (LVI per era). Purple line chart for AI collaboration maturity trajectory (MER with L1-L4 labels). 24-cell hourly commit heatmap (brightest cell = peak hour). Before/after metrics table.

**The Gaps** — CSS conic-gradient donut chart for gap severity (BLOCKS red, REWORK yellow, LIMITS purple). Horizontal gradient bars for rework by category. Ranked gap cards with `border-left` color-coded by severity, each citing commit hashes as clickable cyan evidence badges. Blind spot cards in a grid.

**The Plan** — Vertical connected timeline with curriculum topics as nodes (rank, title, ROI, hours). Scatter plot (X = hours to learn, Y = ROI score, bubble size = rework % addressed). Expanded topic cards with verified content section — exact video title and URL from a verified creator.

Every claim in every tab has an evidence badge with a `title` tooltip showing the commit date and context. The report is responsive — stacks to single-column on mobile, two-column on tablet.

---

## Example 5: What Google Takeout Unlocks

When the user provides YouTube watch history alongside their git history (via `reference/data-enrichment.md`), the specialist can measure learning latency — the time between watching a tutorial and implementing the concept.

**Specialist:** Phase 3, Vector 7: External Learning Correlation. Your YouTube watch history shows 847 coding videos over 47 days. Correlating with your commit timeline...

Your learning latency collapsed. In March, you watched a tutorial and implemented the concept 18 days later. By April, the lag was 1 day — you were watching and building in the same session.

Gap periods aren't gaps. During your 11-day no-commit period, you watched 38 videos/day. That's near your active-day rate of 41/day. You weren't dormant — you were in an active incubation phase.

Creator-to-commit triggers: Jake Van Cleef's folder architecture video preceded your hook system by 2 days (STRONG correlation). You watched Matt Pocock's TypeScript generics video 3 days before your first generic type appeared in commits. Both are independent correlations, meeting the ≥2 threshold for creator attribution.

**Why this matters:** Without Takeout data, Vector 7 is skipped entirely. The specialist notes "External learning data not provided — learning latency and creator influence metrics unavailable." With it, you get the most powerful signal in the analysis.
