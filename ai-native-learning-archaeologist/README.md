# AI-Native Learning Archaeologist

An ICM specialist that turns git history into a learning diagnostic for people who code with AI.

## What It Does

Drop this folder into any Claude project. Claude reads your commits, sessions, and behavioral patterns and produces:

1. **The Actuals** — "What am I learning?" — Chronological learning narrative with velocity metrics
2. **The Gaps** — "What am I missing?" — Ranked knowledge gaps backed by behavioral evidence
3. **The Plan** — "What should I study next?" — ROI-ranked curriculum citing your own data

## How To Use

1. Clone or download this folder
2. Place it in your Claude project directory
3. Run:

```
Analyze this repository's git history using the AI-Native Learning Archaeologist
methodology. Start with Phase 0 (ground truth), then proceed through all 5 phases.
```

**Minimum data needed:** A git log with timestamps and commit messages.

**More data = richer analysis:** Session logs unlock frustration detection and AI maturity scoring. Cross-repo history enables cross-domain transfer detection.

## Folder Structure

```
ai-native-learning-archaeologist/
├── identity.md              Who the specialist is, what it does, routing table
├── rules.md                 5-phase pipeline, 7 analysis vectors, quality constraints
├── examples.md              Sterilized real data showing all 3 output modes
├── reference/
│   ├── signal-heuristics.md  Era classification, frustration levels, formulas
│   └── output-schemas.md     JSON schemas for all structured outputs
└── README.md                 This file
```

This maps to the Interpretable Context Methodology (ICM) layer system:
- `identity.md` = Layer 0 (always loaded, ~800 tokens)
- `rules.md` = Layer 1/2 (routing + process contracts)
- `examples.md` + `reference/` = Layer 3 (loaded selectively per task)

## Methodology

The specialist uses a 5-phase archaeological pipeline:

| Phase | Purpose |
|-------|---------|
| 0. Ground Truth | Verify baseline numbers before analyzing |
| 1. Excavate | Mine behavioral signals from git, sessions, cross-repo data |
| 2. Stratify | Divide timeline into behavioral eras (not calendar dates) |
| 3. Analyze | Run 7 analysis vectors in parallel |
| 4. Synthesize | Cross-reference vectors into coherent outputs |
| 5. Deliver | Produce the 3 output modes (Actuals, Gaps, Plan) |

The 7 analysis vectors: Learning Velocity, Frustration Detection, AI Collaboration Maturity, Knowledge Gaps, Temporal Behavior, Cross-Domain Transfer, External Learning Correlation.

## Who This Is For

People learning to code with AI assistants (Claude Code, Cursor, Copilot, Windsurf). If you've been building with AI and want to know "am I actually getting better?" — this answers that with data, not self-assessment.

## Why It Works

Git history doesn't lie about what you know and what you don't. Commit frequency reveals engagement. Fix/feature ratios reveal understanding gaps. Session depth reveals AI trust evolution. Timing reveals cognitive rhythms. Frustration signatures reveal missing fundamentals.

## Built For

**Weekly Comp #3: The Specialist** — Clief Notes community. Demonstrates the Interpretable Context Methodology (ICM) published at [arxiv.org/abs/2603.16021](https://arxiv.org/abs/2603.16021).

## Go Further

This specialist delivers the methodology manually — one project at a time. For automated pipeline execution with 6 parallel analysis agents, SQLite storage, and 57+ deliverable types, see [devarch-framework](https://github.com/KyaniteLabs/devarch-framework).

## License

MIT
