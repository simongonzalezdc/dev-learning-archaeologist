# Output Schemas

## Actuals (Learning Narrative)

```json
{
  "data_scope": { "total_commits": "int", "active_days": "int", "span_days": "int", "era_count": "int", "sessions_analyzed": "int|null", "data_sources": ["git_log|session_logs|cross_repo|external"] },
  "executive_summary": "3-5 sentences, every claim data-backed",
  "eras": [{ "name": "string", "dates": "range", "commits": "int", "intent": "string", "velocity": "float", "mer": "float|null", "signatures": ["string"], "events": ["string"] }],
  "breakthroughs": [{ "when": "date", "what": "string", "evidence": ["hash|session|date"], "impact": "string" }],
  "velocity": { "trend": "ACCELERATING|LINEAR|PLATEAUING|IRREGULAR", "inflections": [{ "date": "ISO", "direction": "UP|DOWN", "trigger": "string" }] },
  "before_after": [{ "metric": "string", "early": "string", "late": "string", "change": "string" }]
}
```

## Gaps (Knowledge Gap Analysis)

```json
{
  "gaps": [{ "id": "GAP-001", "title": "string", "severity": "BLOCKS|REWORK|LIMITS|COSMETIC", "impact_pct": "float 0-100", "evidence": [{ "type": "commit|session|timing", "ref": "string", "excerpt": "string" }], "root_cause": "string" }],
  "blind_spots": [{ "area": "string", "evidence_of_absence": "string", "potential_impact": "string" }],
  "ai_capability_gaps": [{ "area": "string", "evidence": "string", "impact": "string" }]
}
```

## Plan (Personalized Curriculum)

```json
{
  "developer_profile": { "learning_style": "string", "peak_hours": ["int"], "peak_days": ["string"], "trust_level": "1-4" },
  "curriculum": [{ "rank": "int", "title": "string", "roi": "float 0-10", "hours": "float", "prerequisites": ["string"], "gap": "GAP-XXX", "why_evidence": ["string"], "learn": ["string"], "practice": { "description": "string", "files": ["string"], "steps": ["string"] }, "verify": { "criterion": "string", "test": "string" } }],
  "schedule": { "pace": "string", "total_hours": "float", "tiers": [{ "name": "string", "topics": ["string"], "hours": "float", "addresses_rework_pct": "float" }] }
}
```

## Temporal Behavior

```json
{
  "hourly": [{ "hour": "int 0-23", "commits": "int", "pct": "float" }],
  "daily": [{ "day": "Mon-Sun", "commits": "int", "pct": "float", "vs_avg": "float" }],
  "bursts_gaps": [{ "type": "BURST|GAP", "start": "ISO", "end": "ISO", "days": "int", "commits": "int", "velocity": "float" }],
  "patterns": [{ "name": "string", "data": ["string"], "significance": "string", "confidence": "HIGH|MEDIUM|LOW" }]
}
```

## AI Maturity

```json
{
  "autonomy_evolution": [{ "era": "string", "level": "L1|L2|L3|L4", "evidence": ["string"], "human_pct": "float", "mer": "float" }],
  "tools": [{ "name": "string", "released": "ISO", "first_used": "ISO", "lag_months": "int", "role": "SCAFFOLDING|EXPANSION|ARCHITECTURE|QUALITY|STRATEGY|SUPERVISION" }],
  "trust": { "direction": "IMPROVING|STABLE|DECLINING", "inflection": { "era": "string", "mer_threshold": "float", "evidence": "string" } },
  "frustration_conversion": { "total": "int", "automated": "int", "rate": "float 0-1", "avg_hours": "float" }
}
```

## Validation Rules

- Every `evidence` array must have ≥1 entry
- Confidence: HIGH = 5+ data points, MEDIUM = 2-4, LOW = 1
- Percentages: 0-100 format
- Dates: ISO-8601
- Null acceptable for unavailable data — never fabricate
