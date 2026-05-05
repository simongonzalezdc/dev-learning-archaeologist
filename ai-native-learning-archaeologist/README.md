# AI-Native Learning Archaeologist

An ICM specialist that turns git history into a learning diagnostic for people who code with AI. Drop this folder into any project, open Claude Code, and ask a single question. The specialist reads your commits, sessions, and behavioral patterns from disk and produces an evidence-backed analysis — no data entry, no copy-paste, no setup.

## How To Use

**One-step setup:**

```bash
# Copy the specialist into the project you want analyzed
cp -r ai-native-learning-archaeologist /path/to/your/project/

# Open Claude Code in that project
cd /path/to/your/project
claude
```

**Then say anything.** The specialist knows what to do.

```
What am I learning, what am I missing, and what should I study next?
```

Claude reads the specialist files, extracts your git history, finds session logs, and runs the full 5-phase pipeline automatically. Every claim cites a commit hash or date from your actual history.

---

**What you get back:**

An HTML report auto-opens in your browser with four interactive tabs:

- **Overview** — Executive summary, key metrics with sparklines, breakthrough moments
- **The Actuals** — Era timeline (stacked bar), learning velocity curve (area chart), AI maturity trajectory, hourly commit heatmap
- **The Gaps** — Severity donut chart, rework breakdown (horizontal bars), ranked gap cards with evidence badges
- **The Plan** — Curriculum timeline, ROI scatter plot, hands-on exercises with verify criteria

Every claim is backed by a clickable evidence badge showing the commit hash. All charts are CSS-only — no external dependencies, loads instantly, works offline.

> **Example insight from a real report:** "You discovered testing in Era 3 (`a1b2c3d` → `e4f5g6h`). Before that, 0% of commits included tests. After, 23% do. Your commit messages shifted from 'fix again' to 'add validation hook.'"

## What It Does

Claude reads your local repository data to produce three evidence-backed outputs, then renders them as a beautiful HTML report with interactive data visualizations:

| Output | Question | What You Get |
|--------|----------|-------------|
| **The Actuals** | What am I learning? | Chronological learning narrative with velocity metrics, behavioral eras, and breakthrough detection |
| **The Gaps** | What am I missing? | Ranked knowledge gaps backed by behavioral evidence — frustration patterns, rework analysis, blind spots |
| **The Plan** | What should I study next? | ROI-ranked personalized curriculum citing your own commit data, with hands-on exercises from your codebase |

**All delivered as a self-contained HTML report** — dark theme, responsive, CSS-only charts (velocity curves, heatmaps, donut charts, scatter plots), evidence badges, and interactive tabs. Opens automatically in your browser. Text output available on request.

## What the Specialist Reads Automatically

| Data Source | Where It Finds It | Unlocks |
|-------------|-------------------|---------|
| Git history | `.git/` in the current project — `git log` output | All outputs. Minimum viable input. |
| Session logs | `.claude/` directory (Claude Code), `.cursor/` or Copilot exports | Frustration detection, AI maturity scoring |
| Cross-repo history | Other local repos you point to | Cross-domain transfer detection |
| External learning signals | `data/` folder if you add Google Takeout or CSV exports | Learning latency, creator influence, pipeline direction |

The specialist works with whatever is available. If session logs or external data aren't present, it proceeds with git-only analysis and notes what's missing. Never fabricates.

## Folder Structure

```
ai-native-learning-archaeologist/
├── identity.md                Who the specialist is, principles, routing table
├── rules.md                   5-phase pipeline, 7 analysis vectors, HTML report generation
├── examples.md                Sterilized real data showing all 3 output modes
├── reference/
│   ├── README.md              Index of reference materials — when to use each
│   ├── signal-heuristics.md   Era classification, frustration levels, formulas, taxonomy
│   ├── output-schemas.md      JSON schemas for structured outputs
│   ├── html-report-spec.md    HTML/CSS design system — 8 chart types, dark theme, responsive
│   └── data-enrichment.md     Google Takeout setup, supported external sources
└── README.md                  This file
```

This maps to the Interpretable Context Methodology (ICM) layer system ([arxiv.org/abs/2603.16021](https://arxiv.org/abs/2603.16021)):

| ICM Layer | File | Role | Token Budget |
|-----------|------|------|-------------|
| Layer 0 — Always loaded | `identity.md` | Who, what, principles, routing | ~600 tokens |
| Layer 1/2 — Process contracts | `rules.md` | Pipeline phases, analysis vectors, output modes | ~1,700 tokens |
| Layer 3 — Selective loading | `examples.md`, `reference/` | Demos, formulas, schemas, enrichment guides | Loaded per task |

## Methodology

The specialist uses a 5-phase archaeological pipeline:

| Phase | Purpose | Key Output |
|-------|---------|-----------|
| 0. Ground Truth | Verify baseline numbers, consolidate identities, deduplicate | Verified commit count, active days, span |
| 1. Excavate | Mine behavioral signals from git, sessions, cross-repo data | Structured commit data, temporal patterns |
| 2. Stratify | Divide timeline into behavioral eras (not calendar dates) | Era boundaries with documented reasons |
| 3. Analyze | Run 7 analysis vectors in parallel | Per-vector metrics and findings |
| 4. Synthesize | Cross-reference vectors, resolve contradictions | Meta-patterns spanning multiple vectors |
| 5. Deliver | Produce output modes (Actuals, Gaps, Plan) | Evidence-backed deliverables |

**The 7 analysis vectors:**

1. **Learning Velocity** — How fast are new concepts being absorbed? Tracks concepts per era, exposure-to-implementation latency.
2. **Frustration Detection** — Where is the developer stuck? Identifies repeated file modifications, fix chains, and abandoned approaches.
3. **AI Collaboration Maturity** — How is the developer's relationship with AI evolving? Measures autonomy levels from L1 (Directed) to L4 (Supervisory).
4. **Knowledge Gaps** — What fundamentals are missing? Detects reinvented wheels, missing test discipline, conceptual holes.
5. **Temporal Behavior** — When does the developer do their best work? Peak hours, burst-gap cycles, active-day ratios.
6. **Cross-Domain Transfer** — Are skills from other domains showing up in code? Metaphorical naming, structural analogs.
7. **External Learning Correlation** — What outside learning feeds into the code? (Requires Google Takeout or equivalent.) Learning latency, creator influence, watch-to-build pipeline direction.

## Who This Is For

People learning to code with AI assistants — Claude Code, Cursor, Copilot, Windsurf. If you've been building with AI and want to know *"am I actually getting better?"* — this answers that with data, not self-assessment.

Works with any repo size. Battle-tested against:
- **Solo projects** (45 commits, 3 days) — uses small-repo fallback with relaxed era thresholds
- **Open-source contributions** (25 commits in a 96-contributor project) — multi-author scoping filters to one developer
- **Large AI-assisted projects** (1,151 commits, 62 days) — full statistical analysis with batch merge detection, multi-tool MER decomposition, and bot/agent author classification

## Why It Works

Git history doesn't lie about what you know and what you don't. Commit frequency reveals engagement. Fix-to-feature ratios reveal understanding gaps. Session depth reveals AI trust evolution. Timing reveals cognitive rhythms. Frustration signatures reveal missing fundamentals. Every claim in the output cites a commit hash, session ID, or date — no unsupported assertions.

## Built For

**Weekly Comp #3: The Specialist** — [Clief Notes](https://www.skool.com/quantum-quill-lyceum-1116) community. Demonstrates the Interpretable Context Methodology (ICM) published at [arxiv.org/abs/2603.16021](https://arxiv.org/abs/2603.16021).

## Go Further

This specialist delivers the methodology manually — one project at a time. For automated pipeline execution with 6 parallel analysis agents, SQLite storage, and 57+ deliverable types, see [devarch-framework](https://github.com/KyaniteLabs/devarch-framework).

## License

MIT
