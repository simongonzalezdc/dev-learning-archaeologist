# Dev Learning Archaeologist

Drop this folder into any project, open Claude Code, and ask: "What am I learning, what am I missing, and what should I study next?" Claude reads your git history and session logs from disk, runs a 5-phase archaeological analysis, and opens an HTML report in your browser with interactive charts — era timelines, velocity curves, heatmaps, and a personalized curriculum. Every claim cites a commit hash from your actual history. No setup, no copy-paste, no data entry. Text output available on request.

## What You Get

Three evidence-backed outputs, rendered as an auto-opening HTML report:

| Output | Question | What You Get |
|--------|----------|-------------|
| **What You Learned** | What am I learning? | Chronological learning narrative with velocity metrics, behavioral eras, breakthrough detection |
| **What You're Missing** | What am I missing? | Ranked knowledge gaps backed by behavioral evidence — frustration patterns, rework analysis, blind spots |
| **What to Study Next** | What should I study next? | ROI-ranked personalized curriculum with hands-on exercises and verified video recommendations from real YouTube creators |

## Quick Start

```bash
git clone https://github.com/KyaniteLabs/dev-learning-archaeologist.git
cp -r dev-learning-archaeologist /path/to/your/project/
cd /path/to/your/project && claude
```

Then paste:
```
Analyze this repository's git history using the Dev Learning Archaeologist
methodology. Start with Phase 0 (ground truth), then proceed through all 5 phases.
```

## What It Reads

| Data Source | Where It Finds It | Required? |
|-------------|-------------------|-----------|
| Git history | `.git/` in the current project | Yes — minimum viable input |
| Session logs | `.claude/` directory (Claude Code), `.cursor/` or Copilot exports | Optional — unlocks frustration detection, AI maturity scoring |
| Cross-repo history | Other local repos you point to | Optional — unlocks cross-domain transfer detection |
| External learning data | `data/` folder (Google Takeout, CSV exports) | Optional — unlocks learning latency, creator influence |

## Methodology

Built on the [Interpretable Context Methodology](https://arxiv.org/abs/2603.16021) — folder structure as agent architecture. 5-phase archaeological pipeline, 7 parallel analysis vectors, 3 output modes. Every claim cites a commit hash, session ID, or date.

## Author

Simon Gonzalez de Cruz — [KyaniteLabs](https://github.com/KyaniteLabs)

## License

MIT
