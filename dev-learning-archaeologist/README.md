# Dev Learning Archaeologist

Drop this folder into any project, open Claude Code, and ask: "What am I learning, what am I missing, and what should I study next?" Claude reads your git history and session logs from disk, runs a 5-phase archaeological analysis, and opens an HTML report in your browser with interactive charts — era timelines, velocity curves, heatmaps, and a personalized curriculum. Every claim cites a commit hash from your actual history. No setup, no copy-paste, no data entry. Text output available on request.

## What You Get

Three evidence-backed outputs, rendered as an auto-opening HTML report:

| Output | Question | What You Get |
|--------|----------|-------------|
| **The Actuals** | What am I learning? | Chronological learning narrative with velocity metrics, behavioral eras, breakthrough detection |
| **The Gaps** | What am I missing? | Ranked knowledge gaps backed by behavioral evidence — frustration patterns, rework analysis, blind spots |
| **The Plan** | What should I study next? | ROI-ranked personalized curriculum citing your own data, with hands-on exercises and verified video recommendations |

## What It Reads

| Data Source | Where It Finds It | Required? |
|-------------|-------------------|-----------|
| Git history | `.git/` in the current project | Yes — minimum viable input |
| Session logs | `.claude/` directory (Claude Code), `.cursor/` or Copilot exports | Optional — unlocks frustration detection, AI maturity scoring |
| Cross-repo history | Other local repos you point to | Optional — unlocks cross-domain transfer detection |
| External learning data | `data/` folder (Google Takeout, CSV exports) | Optional — unlocks learning latency, creator influence |

## Folder Structure

```
dev-learning-archaeologist/
├── identity.md              Who the specialist is — background, principles, scope
├── rules.md                 How it responds — behavioral rules + 5-phase pipeline + 7 analysis vectors
├── examples.md              Conversational examples showing the specialist in action
├── reference/
│   ├── README.md               Quick index — when to load each reference file
│   ├── signal-heuristics.md   Era classification, frustration levels, formulas, commit type taxonomy
│   ├── output-schemas.md      JSON schemas for structured outputs
│   ├── html-report-spec.md    HTML/CSS design system — dark theme, 8 chart types, responsive
│   ├── verified-creators.md   Five verified creators for learning plan recommendations
│   └── data-enrichment.md     Google Takeout setup, supported external data sources
└── README.md                This file
```

Each file does one job. This is the Interpretable Context Methodology (ICM) — folder structure as architecture. `identity.md` loads first, routes to `rules.md` for process, pulls from `reference/` as needed.

## License

MIT
