#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const markdownGroups = [
  {
    id: "judge-path",
    eyebrow: "Fast judge path",
    title: "Open these rendered files first.",
    sources: [
      ["start-here", "Quick start", "coach/START_HERE.md", "Fastest route through the folder and first cold-start prompt."],
      ["judge-walkthrough", "Walkthrough", "docs/judging/judge-walkthrough.md", "Browser-safe reading path with proof sequence in order."],
      ["readme", "Repository front door", "README.md", "Public folder entry and run instructions."],
      ["judge-brief", "One-page case", "docs/judging/JUDGE_BRIEF.md", "Above-the-brief argument without reverse-engineering the folder."],
      ["judge-scorecard", "Scoring rubric", "docs/judging/JUDGE_SCORECARD.md", "Criteria for coaching behavior, whole-person scope, evidence, and rule fit."],
      ["judge-faq", "Objections", "docs/judging/JUDGE_FAQ.md", "Short answers to likely judge concerns."],
    ],
  },
  {
    id: "behavior-proof",
    eyebrow: "Behavior proof",
    title: "Show the coach changing the next move.",
    sources: [
      ["first-run", "Cold start", "coach/FIRST_RUN.md", "Exact first-run receipt for a stuck prompt."],
      ["first-reply-scorecard", "First reply", "coach/FIRST_REPLY_SCORECARD.md", "Pass and fail behavior for the first response."],
      ["before-after", "Contrast", "demo/before-after.md", "Generic advice versus Unstuck next-action coaching."],
      ["transcript-pack", "Cold tests", "demo/transcript-pack.md", "Stuck-signal transcripts as inspectable behavior proof."],
      ["whole-person-tour", "Whole-person scope", "demo/whole-person-tour.md", "Body, admin, message, memory, recovery, and work loops as one coaching surface."],
      ["red-face-tests", "Stress tests", "evals/red-face-tests.md", "Shame, overload, inbox/calendar reality, and communication threat."],
    ],
  },
  {
    id: "research-rules",
    eyebrow: "Research and rules",
    title: "Connect the brief to the product decisions.",
    sources: [
      ["rules", "Coaching contract", "coach/rules.md", "Operating rules that keep Unstuck from becoming an article, menu, or pep talk."],
      ["competition-rules-trace", "Competition fit", "docs/judging/COMPETITION_RULES_TRACE.md", "Week 5 requirements mapped to concrete files."],
      ["product-thesis", "Product thesis", "docs/judging/PRODUCT_THESIS.md", "Why this is whole-person EF accessibility, not narrow productivity."],
      ["icm-trace", "ICM fit", "docs/judging/ICM_TRACE.md", "Staged, inspectable, editable, auditable workflow logic."],
      ["signal-map", "Signal routing", "reference/signal-map.md", "User signals the coach must route directly."],
      ["research-to-behavior-checklist", "Research conversion", "evals/research-to-behavior-checklist.md", "Proof that research became protocols, examples, and testable responses."],
      ["coaching-protocols", "Protocol layer", "reference/coaching-protocols.md", "The operating protocols behind the coach responses."],
      ["source-notes", "Source notes", "reference/source-notes.md", "Competition fit, design lineage, and portability notes."],
      ["mode-router", "Mode router", "reference/mode-router.md", "The stance portfolio that preserves the original multi-mode assistant insight."],
    ],
  },
  {
    id: "setup-handoff",
    eyebrow: "Setup and handoff",
    title: "Make the folder usable without a live explainer.",
    sources: [
      ["project-instructions", "Paste-ready setup", "coach/PROJECT_INSTRUCTIONS.md", "Claude Project instructions for recreating the coach behavior."],
      ["handoff-card", "Handoff", "coach/HANDOFF_CARD.md", "Shortest carry-forward operating artifact."],
      ["writeup", "Narrative", "docs/judging/WRITEUP.md", "Competition-facing story with evidence nearby."],
      ["publication-checklist", "Publication gate", "docs/judging/PUBLICATION_CHECKLIST.md", "Approval, final URL, and privacy release checklist."],
      ["walkthrough", "Presentation path", "docs/judging/WALKTHROUGH.md", "Readable path through demo and proof layer."],
      ["submission", "Skool draft", "docs/judging/SUBMISSION.md", "Current public-submission draft, still blocked until approval."],
    ],
  },
  {
    id: "safety-ops",
    eyebrow: "Safety and operations",
    title: "Keep it useful without overreaching.",
    sources: [
      ["admin-ops-playbooks", "Calendar and inbox", "reference/admin-ops-playbooks.md", "Calendar, inbox, and live obligations without fake account access."],
      ["safety-boundaries", "Safety", "reference/safety-boundaries.md", "Boundary between coaching, medical risk, crisis handling, and professional care."],
      ["receipts", "Proof map", "docs/evidence/RECEIPTS.md", "Claim-to-file proof map."],
      ["identity", "Identity", "coach/identity.md", "What Unstuck Coach is and is not."],
      ["examples", "Examples", "coach/examples.md", "Concrete response patterns."],
    ],
  },
];

const verificationScripts = [
  ["verify-start-here", "verify-start-here.mjs", "Checks the quick-start path and first prompt."],
  ["verify-product-thesis", "verify-product-thesis.mjs", "Checks thesis claims and product-language anchors."],
  ["verify-submission-surfaces", "verify-submission-surfaces.mjs", "Keeps public submission surfaces synchronized."],
  ["verify-icm-trace", "verify-icm-trace.mjs", "Checks ICM trace structure and public-safety boundaries."],
  ["verify-first-run", "verify-first-run.mjs", "Checks the cold-start receipt and required first-run signals."],
  ["verify-first-reply-scorecard", "verify-first-reply-scorecard.mjs", "Checks the first-response scorecard and fail criteria."],
  ["verify-landing-copy", "verify-landing-copy.mjs", "Checks landing-page copy blocks and copy-ready prompts."],
  ["verify-transcript-pack", "verify-transcript-pack.mjs", "Checks transcript coverage for stuck-signal examples."],
  ["verify-first-reply-acceptance", "verify-first-reply-acceptance.mjs", "Checks that first replies reject generic advice patterns."],
  ["verify-judge-scorecard", "verify-judge-scorecard.mjs", "Checks judge scorecard criteria and evidence references."],
  ["verify-judge-faq", "verify-judge-faq.mjs", "Checks that judge objections have short, concrete answers."],
  ["verify-judge-brief", "verify-judge-brief.mjs", "Checks that the one-page judge brief stays evidence-backed."],
  ["verify-landing-accessibility", "verify-landing-accessibility.mjs", "Checks accessibility mechanics and evidence-link routing."],
  ["verify-admin-ops-playbooks", "verify-admin-ops-playbooks.mjs", "Checks the calendar and inbox operations playbooks."],
  ["verify-whole-person-tour", "verify-whole-person-tour.mjs", "Checks the whole-person tour and fail-pattern coverage."],
  ["verify-competition-rules-trace", "verify-competition-rules-trace.mjs", "Checks the rules trace and above-the-brief proof map."],
  ["verify-public-bundle", "verify-public-bundle.mjs", "Checks expected files and privacy boundaries."],
  ["verify-final-privacy-scan", "verify-final-privacy-scan.mjs", "Checks that private artifacts stay out of public surfaces."],
  ["final-review-smoke", "final-review-smoke.mjs", "Runs final readiness smoke in blocked or approval-ready mode."],
  ["judge-quick-proof", "judge-quick-proof.mjs", "Runs the quick judge proof path."],
  ["verify-clean-public-stage", "verify-clean-public-stage.mjs", "Checks that a staged public repo is clean and publishable."],
  ["build-public-bundle", "build-public-bundle.mjs", "Builds the public bundle after approval."],
  ["stage-public-repo", "stage-public-repo.mjs", "Stages a separate clean public repository after approval."],
];

const markdownSourceEntries = markdownGroups.flatMap((group) =>
  group.sources.map((source) => ({
    group,
    id: source[0],
    label: source[1],
    file: source[2],
    summary: source[3],
    source,
  })),
);

const sourceNavigation = new Map(
  markdownSourceEntries.map((entry, index) => [
    entry.id,
    {
      index,
      total: markdownSourceEntries.length,
      previous: markdownSourceEntries[index - 1] || null,
      next: markdownSourceEntries[index + 1] || null,
    },
  ]),
);

function sourcePath(file) {
  return path.join(root, file);
}

function readSource(file) {
  return fs.readFileSync(sourcePath(file), "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function renderInline(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return `<span class="rendered-link"><span>${label}</span><code>${escapeHtml(href)}</code></span>`;
  });
  return output;
}

function isTableSeparator(line) {
  const cells = splitTableRow(line).filter(Boolean);
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines) {
  const header = splitTableRow(lines[0]);
  const rows = lines.slice(2).map(splitTableRow);
  return `<div class="rendered-table-wrap"><table>
    <thead><tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
      .join("\n")}</tbody>
  </table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1] || "";
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        `<pre class="rendered-code"${language ? ` data-language="${escapeHtml(language)}"` : ""}><code>${escapeHtml(code.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      const text = heading[2].trim();
      blocks.push(`<h${level}>${renderInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const table = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        table.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(table));
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

function splitMarkdownSections(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      if (current) {
        sections.push(current);
      }
      current = {
        title: heading[2].trim(),
        lines: [],
      };
      continue;
    }

    if (!current) {
      current = {
        title: "Opening notes",
        lines: [],
      };
    }

    current.lines.push(line);
  }

  if (current) {
    sections.push(current);
  }

  return sections.filter((section) => section.title || section.lines.some((line) => line.trim()));
}

function renderSectionedMarkdown(markdown) {
  const sections = splitMarkdownSections(markdown);
  return `<div class="rendered-section-list">
    ${sections
      .map((section, index) => {
        const body = renderMarkdown(section.lines.join("\n")) || "<p>No additional body text in this section.</p>";
        const lineCount = section.lines.filter((line) => line.trim()).length;
        return `<details class="rendered-section"${index === 0 ? " open" : ""}>
          <summary><span>${renderInline(section.title)}</span><small>${lineCount} lines</small></summary>
          <div class="rendered-section-body">
            ${body}
          </div>
        </details>`;
      })
      .join("\n")}
  </div>`;
}

function fileStats(file) {
  const content = readSource(file);
  return {
    content,
    lines: content.split("\n").length,
    bytes: Buffer.byteLength(content, "utf8"),
  };
}

function renderReaderLink(entry) {
  return `<a href="#${escapeHtml(entry.id)}">
    <span>${escapeHtml(entry.label)}</span>
    <small>${escapeHtml(entry.file)}</small>
  </a>`;
}

function renderReaderRail() {
  return `<aside class="evidence-reader-rail" aria-label="Evidence document index">
    <div class="reader-rail-inner">
      <p class="pane-label">Document index</p>
      <a class="reader-rail-top" href="#top">Reader overview</a>
      ${markdownGroups
        .map(
          (group) => `<section class="reader-rail-group" aria-labelledby="${escapeHtml(group.id)}-rail-title">
        <h2 id="${escapeHtml(group.id)}-rail-title">${escapeHtml(group.eyebrow)}</h2>
        <ol>
          ${group.sources
            .map((source) => {
              const entry = markdownSourceEntries.find((item) => item.id === source[0]);
              return `<li>${renderReaderLink(entry)}</li>`;
            })
            .join("\n")}
        </ol>
      </section>`,
        )
        .join("\n")}
      <a class="reader-rail-top" href="#verification">Verification scripts</a>
    </div>
  </aside>`;
}

function renderMobileIndex() {
  return `<details class="evidence-mobile-index">
    <summary>Open document index</summary>
    <div class="mobile-index-groups">
      ${markdownGroups
        .map(
          (group) => `<section aria-labelledby="${escapeHtml(group.id)}-mobile-title">
        <h2 id="${escapeHtml(group.id)}-mobile-title">${escapeHtml(group.eyebrow)}</h2>
        <ol>
          ${group.sources
            .map((source) => {
              const entry = markdownSourceEntries.find((item) => item.id === source[0]);
              return `<li>${renderReaderLink(entry)}</li>`;
            })
            .join("\n")}
        </ol>
      </section>`,
        )
        .join("\n")}
      <a class="reader-rail-top" href="#verification">Verification scripts</a>
    </div>
  </details>`;
}

function renderSourceActions(id) {
  const navigation = sourceNavigation.get(id);
  const previous = navigation.previous;
  const next = navigation.next;

  return `<footer class="source-actions" aria-label="Document reading controls">
    ${
      previous
        ? `<a href="#${escapeHtml(previous.id)}"><span>Previous document</span><strong>${escapeHtml(previous.label)}</strong><small>${escapeHtml(previous.file)}</small></a>`
        : `<a href="#top"><span>Reader</span><strong>Back to overview</strong><small>Top of evidence page</small></a>`
    }
    ${
      next
        ? `<a class="next-source" href="#${escapeHtml(next.id)}"><span>Next document</span><strong>${escapeHtml(next.label)}</strong><small>${escapeHtml(next.file)}</small></a>`
        : `<a class="next-source" href="#verification"><span>Next section</span><strong>Verification scripts</strong><small>Proof commands</small></a>`
    }
  </footer>`;
}

function renderGroupDocumentStrip(group) {
  return `<nav class="group-document-strip" aria-label="${escapeHtml(group.eyebrow)} documents">
    ${group.sources
      .map((source) => {
        const entry = markdownSourceEntries.find((item) => item.id === source[0]);
        return renderReaderLink(entry);
      })
      .join("\n")}
  </nav>`;
}

function renderSourceCard([id, label, file, summary], group) {
  const stats = fileStats(file);
  const navigation = sourceNavigation.get(id);
  return `<article id="${escapeHtml(id)}" class="evidence-card rendered-source" data-reader-document="${escapeHtml(id)}" data-reader-group="${escapeHtml(group.id)}">
    <header class="source-head">
      <div>
        <span>${escapeHtml(label)} / ${navigation.index + 1} of ${navigation.total}</span>
        <h3>${escapeHtml(file)}</h3>
        <p>${escapeHtml(summary)}</p>
      </div>
      <dl class="source-proof">
        <div><dt>Source</dt><dd><code>${escapeHtml(file)}</code></dd></div>
        <div><dt>Lines</dt><dd>${stats.lines}</dd></div>
        <div><dt>Bytes</dt><dd>${stats.bytes}</dd></div>
      </dl>
    </header>
    <div class="section-controls" aria-label="Section display controls">
      <button type="button" data-section-action="expand">Expand all sections</button>
      <button type="button" data-section-action="collapse">Collapse all sections</button>
    </div>
    <div class="rendered-markdown">
      ${renderSectionedMarkdown(stats.content)}
    </div>
    ${renderSourceActions(id)}
  </article>`;
}

function renderGroup(group) {
  return `<section id="${escapeHtml(group.id)}" class="evidence-group" data-evidence-group="${escapeHtml(group.id)}" aria-labelledby="${escapeHtml(group.id)}-title">
    <div class="evidence-group-header">
      <p class="eyebrow">${escapeHtml(group.eyebrow)}</p>
      <h2 id="${escapeHtml(group.id)}-title">${escapeHtml(group.title)}</h2>
    </div>
    ${renderGroupDocumentStrip(group)}
    <div class="evidence-document-stack">
      ${group.sources.map((source) => renderSourceCard(source, group)).join("\n")}
    </div>
  </section>`;
}

function renderScriptCard([id, file, summary]) {
  const scriptPath = `scripts/${file}`;
  const stats = fs.existsSync(sourcePath(scriptPath)) ? fileStats(scriptPath) : { lines: 0, bytes: 0 };
  return `<article id="${escapeHtml(id)}" class="evidence-card verifier-card">
    <h3>${escapeHtml(file)}</h3>
    <p>${escapeHtml(summary)}</p>
    <code>${escapeHtml(scriptPath)}</code>
    <small>${stats.lines} lines / ${stats.bytes} bytes</small>
  </article>`;
}

function renderEvidencePage() {
  const groupLinks = markdownGroups
    .map((group) => `<a href="#${escapeHtml(group.id)}">${escapeHtml(group.eyebrow.replace(" and ", " + "))}</a>`)
    .join("\n        ");

  return `<!doctype html>
<html lang="en" class="evidence-reader-shell">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Unstuck Coach Evidence Reader | Source Proof</title>
    <meta
      name="description"
      content="Source-backed evidence for Unstuck Coach, a folder-based executive-function accessibility coach with judge-readable receipts, transcripts, and verifiers."
    >
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="https://unstuck.kyanitelabs.tech/evidence">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Unstuck Coach">
    <meta property="og:title" content="Unstuck Coach Evidence Reader">
    <meta property="og:description" content="Rendered Markdown receipts, transcript evidence, source notes, scorecards, and verification scripts for Unstuck Coach.">
    <meta property="og:url" content="https://unstuck.kyanitelabs.tech/evidence">
    <meta property="og:image" content="https://unstuck.kyanitelabs.tech/assets/unstuck-coach-logo.png">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Unstuck Coach Evidence Reader">
    <meta name="twitter:description" content="Source-backed proof for a folder-based executive-function accessibility coach.">
    <meta name="twitter:image" content="https://unstuck.kyanitelabs.tech/assets/unstuck-coach-logo.png">
    <link rel="icon" type="image/png" href="./assets/unstuck-coach-logo.png">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body class="evidence-page evidence-single-doc">
    <header class="site-nav" aria-label="Primary">
      <a class="wordmark" href="./index.html#top" aria-label="Unstuck Coach home">
        <img class="wordmark-mark" src="./assets/unstuck-coach-logo.png" alt="" aria-hidden="true" width="64" height="64">
        Unstuck Coach
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-links" aria-label="Open navigation">
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
      </button>
      <nav class="nav-links" id="primary-links" aria-label="Evidence sections">
        <a href="./index.html#demo">Demo</a>
        <a href="./index.html#scorecard">Scorecard</a>
        <a href="./index.html#receipts">Receipts</a>
        <a href="#judge-path">Judge path</a>
        <a href="#behavior-proof">Behavior proof</a>
        <a href="#verification">Verification</a>
      </nav>
    </header>

    <main id="top">
      <section class="evidence-hero" aria-labelledby="evidence-title">
        <div class="section-heading evidence-heading">
          <p class="eyebrow">Evidence reader</p>
          <h1 id="evidence-title">Rendered Markdown, not claim cards.</h1>
          <p>
            This page is generated from the real Markdown files. The receipt shows the source path, line count, and readable rendered content before any judge has to open the folder.
          </p>
          <div class="hero-actions">
            <a class="action primary" href="./index.html#receipts">
              <span>Return to receipts</span>
              <span aria-hidden="true">-&gt;</span>
            </a>
            <a class="action secondary" href="#verification">
              <span>Review verification</span>
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
        <aside class="evidence-hero-panel" aria-label="Evidence reader promise">
          <span class="pane-label">Rendered source</span>
          <strong>The file content is on this page.</strong>
          <p>Filenames stay visible, but the proof is the rendered file content generated from the folder.</p>
        </aside>
      </section>

      <nav class="evidence-index" aria-label="Evidence groups">
        ${groupLinks}
        <a href="#verification">Verification</a>
      </nav>

      ${renderMobileIndex()}

      <div class="evidence-reader-layout">
        ${renderReaderRail()}
        <div class="evidence-reader-content">
          ${markdownGroups.map(renderGroup).join("\n\n")}

          <section id="verification" class="evidence-group verification-group" aria-labelledby="verification-title">
            <div class="evidence-group-header">
              <p class="eyebrow">Verification</p>
              <h2 id="verification-title">The scripts prove the folder stays coherent.</h2>
            </div>
            <div class="evidence-grid compact">
              ${verificationScripts.map(renderScriptCard).join("\n")}
            </div>
          </section>
        </div>
      </div>
    </main>

    <script src="./app.js"></script>
  </body>
</html>
`;
}

function main() {
  const outputPath = path.join(root, "landing", "evidence.html");
  fs.writeFileSync(outputPath, renderEvidencePage());
  console.log(
    JSON.stringify(
      {
        status: "pass",
        output: path.relative(root, outputPath),
        renderedMarkdownFiles: markdownGroups.reduce((count, group) => count + group.sources.length, 0),
        verifierCards: verificationScripts.length,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
