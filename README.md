# Dev Learning Archaeologist

> **Drop this folder into any project, open Claude Code, and get a full forensic learning diagnostic in 60 seconds.**

<p align="center">
  <img src="https://img.shields.io/badge/Claude_Code-Compatible-38bdf8?style=flat-square" />
  <img src="https://img.shields.io/badge/Pipeline-5_phases-34d399?style=flat-square" />
  <img src="https://img.shields.io/badge/Vectors-7_analysis-a78bfa?style=flat-square" />
  <img src="https://img.shields.io/badge/Report-HTML_auto_open-fbbf24?style=flat-square" />
  <img src="https://img.shields.io/license/MIT-blue?style=flat-square" />
</p>

You know that feeling when you've been coding for months and can't tell if you're actually getting better?

**This tool reads your git history and tells you exactly what you learned, what you're missing, and what to study next.** Every claim cites a commit hash from your actual repo. No setup. No data entry. No subjective guesses.

---

## What You Get

An auto-opening HTML report with three sections:

| Output | The Question | What You Actually Get |
|--------|-------------|----------------------|
| **What You Learned** | "Am I improving?" | Chronological narrative with velocity metrics, behavioral eras, breakthrough detection |
| **What You're Missing** | "What's holding me back?" | Ranked knowledge gaps backed by behavioral evidence — frustration patterns, rework hotspots, blind spots |
| **What to Study Next** | "What should I learn?" | ROI-ranked curriculum with hands-on exercises and real video recommendations from verified creators |

The report includes **8 interactive visualizations**: era timelines, velocity curves, heatmaps, gap severity donuts, rework bars, and a curriculum roadmap — all in a single self-contained HTML file with zero dependencies.

---

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

That's it. The report opens in your browser automatically.

---

## How It Works

The archaeologist runs a **5-phase forensic pipeline** on your repo:

1. **Ground Truth** — Count commits, consolidate identities, establish baseline metrics
2. **Excavate** — Extract commit types, temporal patterns, burst-gap cycles, file hotspots
3. **Stratify** — Detect behavioral eras by velocity shifts, intent changes, and technology adoption
4. **Analyze** — Run 7 independent analysis vectors in parallel
5. **Deliver** — Generate a self-contained HTML report and open it in your browser

### The 7 Analysis Vectors

| # | Vector | What It Finds |
|---|--------|--------------|
| 1 | **Learning Velocity** | How fast you're learning new concepts, and whether it's accelerating |
| 2 | **Frustration Detection** | Files you keep revisiting, fix clusters, where you're stuck (not just iterating) |
| 3 | **AI Collaboration Maturity** | Your autonomy level (L1 Directed → L4 Supervisory) and trust trajectory |
| 4 | **Knowledge Gaps** | Reinvented wheels, missing fundamentals, and what's causing rework |
| 5 | **Temporal Behavior** | Peak creative hour, optimal work patterns, burst sustainability |
| 6 | **Cross-Domain Transfer** | Skills from non-coding domains showing up in your code |
| 7 | **External Learning** | YouTube watch history → commit correlation (with Google Takeout) |

Every finding cites a commit hash. Every recommendation traces back to evidence.

---

## What It Reads

| Data Source | Where It Looks | Required? |
|-------------|---------------|-----------|
| Git history | `.git/` in the current project | **Yes** — this is the minimum |
| Session logs | `.claude/` directory (Claude Code), `.cursor/` or Copilot exports | Optional — unlocks AI maturity scoring |
| Cross-repo history | Other local repos you point to | Optional — unlocks cross-domain transfer |
| YouTube history | `data/` folder (Google Takeout JSON) | Optional — unlocks learning latency measurement |

It works with **git history alone**. Everything else makes the analysis richer, but git is the only requirement.

---

## Built On ICM

This is an [Interpretable Context Methodology](https://arxiv.org/abs/2603.16021) specialist — folder structure as agent architecture. Each file has one job:

| File | Job |
|------|-----|
| `identity.md` | Who the specialist is — loads first |
| `rules.md` | The 5-phase pipeline, 7 vectors, output constraints |
| `examples.md` | Conversational demos showing the specialist in action |
| `reference/signal-heuristics.md` | Era classification, frustration levels, formulas |
| `reference/output-schemas.md` | JSON schemas for structured outputs |
| `reference/html-report-spec.md` | Design system — dark theme, 8 chart types, responsive |
| `reference/verified-creators.md` | Five trusted creators for learning plan recommendations |
| `reference/data-enrichment.md` | Google Takeout setup, supported data sources |

---

## Need the Full Engine?

This is the lightweight diagnostic — zero install, runs in a Claude Code conversation. For the full forensic pipeline with SQLite databases, Datasette inspection, multi-project sync, and automated audits, check out [**DevArch Framework**](https://github.com/KyaniteLabs/devarch-framework).

| | Learning Archaeologist | DevArch Framework |
|---|---|---|
| **Setup** | Drop in a folder | `pip install` |
| **Runs in** | Claude Code conversation | CLI / Python API |
| **Vectors** | 7 learning-focused | 6 + 14 opportunity analyzers |
| **Output** | HTML report | HTML + SQLite + Datasette + Markdown |
| **Best for** | "How am I doing?" | "Archaeologically analyze everything" |

---

## Who Made This

[Simon Gonzalez de Cruz](https://github.com/Pastorsimon1798) — [KyaniteLabs](https://github.com/KyaniteLabs). We build AI-native developer tools.

## License

MIT
