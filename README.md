# Skool Competition Entries

## Weekly Comp #3: The Specialist

**Entry:** [AI-Native Learning Archaeologist](./ai-native-learning-archaeologist/)

An ICM specialist folder that turns git history into a learning diagnostic for people who code with AI.

### What It Does

Drop it into any Claude project and it analyzes your commits, sessions, and behavioral patterns to produce three evidence-backed outputs:

1. **The Actuals** — What are you learning? Chronological learning narrative with velocity metrics, behavioral eras, and breakthrough detection.
2. **The Gaps** — What are you missing? Ranked knowledge gaps backed by behavioral evidence — frustration patterns, rework analysis, blind spots.
3. **The Plan** — What should you study next? ROI-ranked curriculum citing your own commit data, with hands-on exercises from your codebase.

### Quick Start

```bash
git clone https://github.com/Pastorsimon1798/skool-competitions.git
cp -r skool-competitions/ai-native-learning-archaeologist /path/to/your/project/
cd /path/to/your/project && claude
```

Then paste:
```
Analyze this repository's git history using the AI-Native Learning Archaeologist
methodology. Start with Phase 0 (ground truth), then proceed through all 5 phases.
```

Full documentation in the [specialist README](./ai-native-learning-archaeologist/README.md).

### Methodology

Built on the [Interpretable Context Methodology](https://arxiv.org/abs/2603.16021) — folder structure as agent architecture. 5-phase archaeological pipeline, 7 parallel analysis vectors, 3 output modes. Every claim cites a commit hash, session ID, or date.

### Author

Simon Gonzalez de Cruz — [KyaniteLabs](https://github.com/KyaniteLabs)
