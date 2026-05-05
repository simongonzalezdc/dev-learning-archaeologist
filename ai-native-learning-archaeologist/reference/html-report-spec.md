# HTML Report Specification

After completing Phase 5 (Deliver), render the findings as a self-contained HTML file and open it automatically in the user's browser. The HTML is a visual presentation of the same Actuals, Gaps, and Plan data — nothing is invented, everything is already produced by the pipeline.

## When to Generate

**Default:** After every completed analysis, unless the user explicitly says "text only" or "no HTML."

**File name:** `learning-archaeologist-report.html` (written to project root)

**Auto-open command:**
```bash
open learning-archaeologist-report.html
```

If the user is not on macOS, note the file path and suggest they open it manually.

## Design System

All CSS is inline inside a single `<style>` tag. No external files, no CDNs, no dependencies.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0a0a0f` | Page background |
| `--surface` | `#14141f` | Cards, panels |
| `--surface-elevated` | `#1a1a28` | Elevated cards on hover |
| `--border` | `#1e1e2e` | Dividers, borders |
| `--text` | `#e2e8f0` | Primary text |
| `--text-secondary` | `#94a3b8` | Labels, captions |
| `--accent` | `#38bdf8` | Links, highlights, active tabs, velocity |
| `--accent-dim` | `#0ea5e9` | Hover states |
| `--accent-glow` | `rgba(56, 189, 248, 0.15)` | Glow effects |
| `--red` | `#f87171` | BLOCKS severity |
| `--red-soft` | `rgba(248, 113, 113, 0.12)` | BLOCKS backgrounds |
| `--yellow` | `#fbbf24` | REWORK severity |
| `--yellow-soft` | `rgba(251, 191, 36, 0.12)` | REWORK backgrounds |
| `--green` | `#34d399` | HEALTHY, breakthroughs |
| `--green-soft` | `rgba(52, 211, 153, 0.12)` | HEALTHY backgrounds |
| `--purple` | `#a78bfa` | AI maturity, meta-patterns |
| `--purple-soft` | `rgba(167, 139, 250, 0.12)` | Pattern backgrounds |
| `--grid-line` | `rgba(30, 30, 46, 0.8)` | Chart grid lines |

### Typography

- Base: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
- Headings: `font-weight: 600; letter-spacing: -0.02em;`
- Mono (commit hashes, metrics): `font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 0.85em;`
- Base size: `16px` desktop, `15px` mobile
- Line height: `1.6`

### Layout

- Max width: `1100px`, centered
- Card style: `background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px;`
- Section spacing: `margin-bottom: 32px;`
- Subtle card hover: `transition: all 0.2s ease;` → `background: var(--surface-elevated);`

---

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning Archaeologist Report — [Project Name]</title>
  <style>
    /* All CSS inline — see Design System and Component Specifications below */
  </style>
</head>
<body>

  <header class="report-header">
    <div class="header-badge">🔮 Learning Archaeologist</div>
    <h1>[Project Name]</h1>
    <p class="subtitle">[Commit count] commits · [Active days] active days · [Era count] behavioral eras · [Span days]-day span</p>
    <p class="meta">Analyzed [date] · ICM v1.0</p>
  </header>

  <nav class="tab-nav">
    <button class="tab-btn active" data-tab="overview">Overview</button>
    <button class="tab-btn" data-tab="actuals">The Actuals</button>
    <button class="tab-btn" data-tab="gaps">The Gaps</button>
    <button class="tab-btn" data-tab="plan">The Plan</button>
  </nav>

  <main class="report-body">

    <!-- OVERVIEW TAB -->
    <section id="overview" class="tab-panel active">
      <div class="card">
        <h2>Executive Summary</h2>
        <p class="summary-text">[3-5 sentence data-backed overview]</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-sparkline" id="velocity-sparkline"></div>
          <span class="metric-value">[early] → [late]</span>
          <span class="metric-label">Commits / Day</span>
          <span class="metric-change [positive|negative]">[change]x</span>
        </div>
        <div class="metric-card">
          <div class="metric-sparkline" id="mer-sparkline"></div>
          <span class="metric-value">[early] → [late]</span>
          <span class="metric-label">Messages / Commit</span>
          <span class="metric-change [positive|negative]">[change]%</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">[LVI]</span>
          <span class="metric-label">Learning Velocity Index</span>
          <span class="metric-trend">[accelerating|linear|plateauing]</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">[hour]:00</span>
          <span class="metric-label">Peak Creative Hour</span>
          <span class="metric-trend">[pct]% of commits</span>
        </div>
      </div>

      <div class="card">
        <h2>Breakthrough Moments</h2>
        <div class="breakthrough-list">
          <!-- Each breakthrough -->
        </div>
      </div>
    </section>

    <!-- ACTUALS TAB -->
    <section id="actuals" class="tab-panel">
      <div class="card">
        <h2>Behavioral Era Timeline</h2>
        <div class="era-timeline-chart">
          <!-- Horizontal stacked bar: each era segment proportional to commits -->
        </div>
        <div class="era-legend">
          <!-- Era name + date range + intent label per segment -->
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <h2>Learning Velocity Curve</h2>
          <div class="velocity-chart">
            <!-- Area chart: eras on X, LVI on Y -->
          </div>
        </div>
        <div class="card">
          <h2>AI Collaboration Maturity</h2>
          <div class="maturity-chart">
            <!-- Trust trajectory line chart -->
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Commit Activity Heatmap</h2>
        <div class="hourly-heatmap">
          <!-- 24-hour heatmap grid -->
        </div>
        <div class="heatmap-legend">
          <span>Low</span>
          <div class="heatmap-gradient-bar"></div>
          <span>High</span>
        </div>
      </div>

      <div class="card">
        <h2>Before & After</h2>
        <table class="data-table">
          <!-- Metrics from earliest vs latest era -->
        </table>
      </div>
    </section>

    <!-- GAPS TAB -->
    <section id="gaps" class="tab-panel">
      <div class="two-col">
        <div class="card">
          <h2>Gap Severity Distribution</h2>
          <div class="severity-donut">
            <!-- CSS conic-gradient donut chart -->
          </div>
          <div class="severity-legend">
            <!-- Labels with counts -->
          </div>
        </div>
        <div class="card">
          <h2>Rework by Category</h2>
          <div class="rework-chart">
            <!-- Horizontal bar chart: frustration categories -->
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Knowledge Gap Inventory</h2>
        <div class="gap-list">
          <!-- Ranked gap cards -->
        </div>
      </div>

      <div class="card">
        <h2>Blind Spots</h2>
        <div class="blindspot-grid">
          <!-- Evidence-of-absence cards -->
        </div>
      </div>
    </section>

    <!-- PLAN TAB -->
    <section id="plan" class="tab-panel">
      <div class="card">
        <h2>Curriculum Roadmap</h2>
        <div class="curriculum-timeline">
          <!-- Vertical timeline with topics as nodes -->
        </div>
      </div>

      <div class="card">
        <h2>ROI vs Time Investment</h2>
        <div class="roi-scatter">
          <!-- Scatter plot: X = hours, Y = ROI score, bubble size = rework addressed -->
        </div>
      </div>

      <div class="card">
        <h2>Topic Details</h2>
        <div class="curriculum-list">
          <!-- Expanded curriculum cards -->
        </div>
      </div>
    </section>

  </main>

  <footer class="report-footer">
    <p>Generated by AI-Native Learning Archaeologist · <a href="https://arxiv.org/abs/2603.16021">ICM Methodology</a> · <a href="https://github.com/KyaniteLabs/devarch-framework">devarch-framework</a></p>
  </footer>

  <script>
    // Minimal tab switcher
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
  </script>

</body>
</html>
```

---

## Data Visualization Specifications

### 1. Era Timeline Chart (Horizontal Stacked Bar)

A single horizontal bar divided into segments. Each segment = one era. Width proportional to era's commit count.

**CSS:**
```css
.era-timeline-chart {
  display: flex;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  gap: 3px;
}
.era-segment {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
  font-weight: 600;
  color: #e2e8f0;
  min-width: 40px;
  position: relative;
  transition: all 0.2s ease;
}
.era-segment:hover {
  filter: brightness(1.2);
  transform: scaleY(1.05);
  z-index: 2;
}
```

**Segment colors (cycle through):**
- Era 1, 5, 9...: `#1e4d6b` (deep cyan)
- Era 2, 6, 10...: `#2d4a3e` (deep green)
- Era 3, 7, 11...: `#3d3a6b` (deep purple)
- Era 4, 8, 12...: `#6b4a1e` (deep amber)

**Segment tooltip (title attribute):**
```html
<div class="era-segment" style="width: [pct]%" title="Era [n]: [name]&#10;[date range]&#10;[commits] commits · [intent]">
  [short name]
</div>
```

### 2. Learning Velocity Curve (Area Chart)

Eras on X-axis, LVI on Y-axis. Filled area under the curve with gradient.

**HTML structure:**
```html
<div class="velocity-chart">
  <div class="chart-grid">
    <!-- Horizontal grid lines -->
    <div class="grid-line" style="bottom: 0%"></div>
    <div class="grid-line" style="bottom: 25%"></div>
    <div class="grid-line" style="bottom: 50%"></div>
    <div class="grid-line" style="bottom: 75%"></div>
    <div class="grid-line" style="bottom: 100%"></div>
  </div>
  <div class="area-fill" style="clip-path: polygon([points])"></div>
  <div class="line-points">
    <!-- One dot per era, positioned absolutely -->
    <div class="data-point" style="left: [pct]%; bottom: [LVI-pct]%" title="Era [n]: LVI [value]"></div>
  </div>
  <div class="chart-labels-x">
    <span style="left: [pct]%">E1</span>
    <span style="left: [pct]%">E2</span>
    <!-- ... -->
  </div>
</div>
```

**CSS:**
```css
.velocity-chart {
  position: relative;
  height: 220px;
  padding: 20px 0 30px 0;
}
.chart-grid {
  position: absolute;
  inset: 20px 0 30px 0;
}
.grid-line {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: var(--grid-line);
}
.area-fill {
  position: absolute;
  inset: 20px 0 30px 0;
  background: linear-gradient(to top, rgba(56,189,248,0.3), rgba(56,189,248,0.05));
  border-radius: 4px;
}
.data-point {
  position: absolute;
  width: 10px; height: 10px;
  background: #38bdf8;
  border: 2px solid #0a0a0f;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  box-shadow: 0 0 8px rgba(56,189,248,0.4);
}
.chart-labels-x {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 24px;
}
.chart-labels-x span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75em;
  color: var(--text-secondary);
}
```

**Clip-path polygon generation:**
The polygon starts at bottom-left `(0% 100%)`, goes through each era point `([x]% [100-y]%)`, then closes at bottom-right `(100% 100%)`.

Example for 4 eras with LVI [0.5, 1.2, 2.8, 3.5] (max = 4.0):
```css
clip-path: polygon(0% 100%, 0% 87.5%, 25% 70%, 50% 30%, 75% 12.5%, 100% 100%);
```

### 3. AI Collaboration Maturity (Trust Trajectory Line Chart)

Same structure as velocity chart but:
- Line color: `#a78bfa` (purple)
- Area fill: `rgba(167,139,250,0.15)`
- Y-axis: MER (Message Efficiency Ratio) 0 → 1.0+
- Points labeled with autonomy level (L1, L2, L3, L4)

**Data point label:**
```html
<div class="data-point maturity" style="left: [pct]%; bottom: [MER-pct]%">
  <span class="point-label">L3</span>
</div>
```

**CSS:**
```css
.data-point.maturity {
  background: #a78bfa;
  box-shadow: 0 0 8px rgba(167,139,250,0.4);
}
.point-label {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65em;
  font-weight: 600;
  color: #a78bfa;
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(167,139,250,0.3);
  white-space: nowrap;
}
```

### 4. Hourly Commit Heatmap

24-column grid. Cell opacity = commit percentage for that hour, normalized to the peak hour.

**HTML:**
```html
<div class="hourly-heatmap">
  <div class="heatmap-cell" style="background: rgba(56,189,248,[opacity])" title="00:00 — [commits] commits ([pct]%)">
    <span class="cell-hour">00</span>
  </div>
  <!-- ... 24 cells ... -->
</div>
```

**CSS:**
```css
.hourly-heatmap {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 3px;
  padding: 4px;
  background: var(--surface);
  border-radius: 8px;
}
.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6em;
  font-weight: 600;
  color: rgba(226,232,240,0.6);
  transition: all 0.15s ease;
  min-height: 28px;
}
.heatmap-cell:hover {
  transform: scale(1.15);
  z-index: 2;
  box-shadow: 0 0 12px rgba(56,189,248,0.3);
  border: 1px solid rgba(56,189,248,0.5);
}
```

**Opacity calculation:** `opacity = (hour_commits / peak_hour_commits) * 0.85 + 0.05` (min 0.05 so empty cells still visible)

**Heatmap legend bar:**
```css
.heatmap-gradient-bar {
  width: 120px; height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, rgba(56,189,248,0.05), rgba(56,189,248,0.9));
}
```

### 5. Gap Severity Donut Chart

CSS `conic-gradient` donut showing count or impact percentage per severity.

**HTML:**
```html
<div class="severity-donut">
  <div class="donut-ring" style="background: conic-gradient(
    #f87171 [blocks-pct]%,
    #fbbf24 [blocks+pct]%,
    #a78bfa [blocks+rework+pct]%,
    #94a3b8 100%
  )">
    <div class="donut-hole">
      <span class="donut-total">[total gaps]</span>
      <span class="donut-label">gaps found</span>
    </div>
  </div>
</div>
```

**CSS:**
```css
.severity-donut {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.donut-ring {
  width: 180px; height: 180px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.donut-hole {
  width: 120px; height: 120px;
  background: var(--surface);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-total {
  font-size: 2em;
  font-weight: 700;
  color: var(--text);
}
.donut-label {
  font-size: 0.75em;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 6. Rework by Category (Horizontal Bar Chart)

**HTML:**
```html
<div class="rework-chart">
  <div class="rework-bar-row">
    <span class="rework-label">Integration</span>
    <div class="rework-bar-track">
      <div class="rework-bar" style="width: [pct]%">
        <span class="rework-value">[count]</span>
      </div>
    </div>
  </div>
</div>
```

**CSS:**
```css
.rework-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.rework-label {
  width: 100px;
  font-size: 0.85em;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
}
.rework-bar-track {
  flex: 1;
  height: 28px;
  background: var(--bg);
  border-radius: 6px;
  overflow: hidden;
}
.rework-bar {
  height: 100%;
  background: linear-gradient(to right, #f87171, #fbbf24);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  min-width: 36px;
  transition: width 0.6s ease;
}
.rework-value {
  font-size: 0.8em;
  font-weight: 600;
  color: #0a0a0f;
}
```

### 7. ROI Scatter Plot (Plan Tab)

X = hours to learn, Y = ROI score (0-10), bubble size = rework % addressed.

**HTML:**
```html
<div class="roi-scatter">
  <div class="scatter-grid">
    <div class="grid-line-h" style="bottom: [pct]%"></div>
    <div class="grid-line-v" style="left: [pct]%"></div>
  </div>
  <div class="scatter-point" style="left: [hours-pct]%; bottom: [roi-pct]%">
    <div class="bubble" style="width: [size]px; height: [size]px"></div>
    <span class="bubble-label">[topic]</span>
  </div>
</div>
```

**CSS:**
```css
.roi-scatter {
  position: relative;
  height: 300px;
  padding: 20px 30px 40px 50px;
}
.scatter-grid {
  position: absolute;
  inset: 20px 30px 40px 50px;
  border-left: 1px solid var(--grid-line);
  border-bottom: 1px solid var(--grid-line);
}
.grid-line-h {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: var(--grid-line);
  border-top: 1px dashed rgba(30,30,46,0.5);
}
.grid-line-v {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--grid-line);
  border-left: 1px dashed rgba(30,30,46,0.5);
}
.scatter-point {
  position: absolute;
  transform: translate(-50%, 50%);
}
.bubble {
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #34d399, #059669);
  opacity: 0.85;
  transition: all 0.2s ease;
}
.bubble:hover {
  opacity: 1;
  transform: scale(1.2);
  box-shadow: 0 0 16px rgba(52,211,153,0.4);
}
.bubble-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7em;
  color: var(--text-secondary);
  white-space: nowrap;
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 4px;
}
```

**Bubble size:** `size = 20 + (rework_pct / 100) * 40` (range 20-60px)

### 8. Curriculum Timeline (Vertical)

Topics arranged vertically with connecting line. Each topic is a node.

**HTML:**
```html
<div class="curriculum-timeline">
  <div class="timeline-line"></div>
  <div class="timeline-node">
    <div class="node-marker">1</div>
    <div class="node-card">
      <h4>[Topic title]</h4>
      <p>[hours] hrs · ROI [score]/10 · Addresses [pct]% of rework</p>
    </div>
  </div>
</div>
```

**CSS:**
```css
.curriculum-timeline {
  position: relative;
  padding-left: 32px;
}
.timeline-line {
  position: absolute;
  left: 15px;
  top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #38bdf8, #34d399);
  border-radius: 1px;
}
.timeline-node {
  position: relative;
  margin-bottom: 24px;
}
.node-marker {
  position: absolute;
  left: -32px;
  top: 0;
  width: 32px; height: 32px;
  background: var(--surface);
  border: 2px solid #38bdf8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 700;
  color: #38bdf8;
}
.node-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  margin-left: 16px;
}
.node-card h4 {
  margin: 0 0 6px 0;
  font-size: 1em;
}
.node-card p {
  margin: 0;
  font-size: 0.85em;
  color: var(--text-secondary);
}
```

---

## Shared Components

### Evidence Badge
```html
<span class="evidence-badge" title="[date] · [context]">[hash]</span>
```
```css
.evidence-badge {
  display: inline-block;
  background: var(--accent-glow);
  color: var(--accent);
  font-family: monospace;
  font-size: 0.78em;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  margin: 0 3px;
  cursor: help;
}
```

### Severity Badge
```css
.severity-badge {
  display: inline-block;
  font-size: 0.65em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 4px;
}
.severity-badge.blocks { background: var(--red-soft); color: var(--red); }
.severity-badge.rework { background: var(--yellow-soft); color: var(--yellow); }
.severity-badge.limits { background: var(--purple-soft); color: var(--purple); }
.severity-badge.cosmetic { background: rgba(148,163,184,0.12); color: var(--text-secondary); }
```

### Data Table
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}
.data-table tr:hover td {
  background: var(--accent-glow);
}
.data-table .metric-name { color: var(--text-secondary); }
.data-table .metric-value { font-family: monospace; font-weight: 600; }
.data-table .metric-change.positive { color: var(--green); }
.data-table .metric-change.negative { color: var(--red); }
```

---

## Data Population Rules

1. **Never invent data.** Every number, hash, and metric in the HTML comes directly from the Phase 5 output.
2. **Preserve evidence.** Every claim gets an `.evidence-badge` with the commit hash or date.
3. **Preserve confidence.** `[UNVERIFIED]` findings get `opacity: 0.65` and a `border-left: 2px dashed var(--text-secondary)`.
4. **Preserve era flags.** `[LOW-CONFIDENCE]` eras get a `⚠️` tooltip and muted segment color.
5. **Anonymize.** Personal info stripped in the analysis stays stripped in the HTML.
6. **All charts are CSS-only.** No JavaScript charting libraries. No external dependencies.

## Responsive Behavior

At `max-width: 700px`:
- Tab nav: `grid-template-columns: 1fr 1fr; gap: 8px;`
- Metrics grid: `grid-template-columns: 1fr 1fr;`
- Two-col layouts: `flex-direction: column;`
- Velocity chart height: `160px`
- Hourly heatmap: `grid-template-columns: repeat(12, 1fr);` (2 rows of 12)
- Era timeline: `height: 44px; font-size: 0.65em;`
- Cards: `padding: 20px; border-radius: 12px;`

## Accessibility

- `:focus-visible` styles on all interactive elements
- `title` attributes on all data points for tooltips
- Color never sole indicator — severity badges have text labels
- Sufficient contrast (tested against WCAG AA)
- Reduced motion: `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`
