# Reference Materials

Quick index of what's in this folder and when to load each file.

| File | When You Need It | What's Inside |
|------|-----------------|---------------|
| `signal-heuristics.md` | During any analysis — classification rules, formulas, thresholds | Era boundary signals (5 signals, weights), frustration levels (L1–L4), batch merge detection, formulas (LVI, MER, FCR, ADR, burst-to-gap), commit type taxonomy (conventional + non-conventional fallback), AI trust trajectory indicators |
| `output-schemas.md` | When you want structured JSON output instead of prose | JSON schemas for: Actuals (learning narrative), Gaps (knowledge gap analysis), Plan (personalized curriculum), Temporal Behavior, AI Maturity. Includes validation rules (confidence levels, date formats, null handling) |
| `data-enrichment.md` | When external learning data is available (optional) | Google Takeout setup instructions (YouTube watch/search history), supported alternative sources (Udemy, Coursera, Kindle, browser history), comparison table: what git-only can detect vs. what Takeout unlocks |

**Load order:**
1. `signal-heuristics.md` — Always relevant. Load when classifying eras, calculating metrics, or detecting frustration.
2. `output-schemas.md` — Load only when the user requests structured/JSON output. Default is prose.
3. `data-enrichment.md` — Load only when the user mentions external learning data (YouTube, courses) or asks about learning latency measurement.

All files are designed for selective loading per the ICM Layer 3 pattern. None are required for a basic git-only analysis.
