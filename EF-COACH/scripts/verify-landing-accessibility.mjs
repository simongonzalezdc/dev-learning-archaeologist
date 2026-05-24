#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function read(root, file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function stripTags(markup) {
  return markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function attrs(markup) {
  const found = {};
  for (const [, name, rawValue] of markup.matchAll(/\s([a-zA-Z:-]+)(?:="([^"]*)")?/g)) {
    found[name] = rawValue ?? true;
  }
  return found;
}

function findIds(markup) {
  return new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

function localHashTargets(markup) {
  return [...markup.matchAll(/\shref="#([^"]+)"/g)].map((match) => match[1]);
}

function elementMatches(markup, tag) {
  return [...markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function buttonBlocks(markup) {
  return [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)].map((match) => match[0]);
}

function imageElements(markup) {
  return elementMatches(markup, "img");
}

function sectionElements(markup) {
  return elementMatches(markup, "section");
}

function countMatches(markup, pattern) {
  return (markup.match(pattern) || []).length;
}

export function verifyLandingAccessibility(root = process.cwd()) {
  const failures = [];
  const htmlPath = path.join(root, "landing/index.html");
  const evidencePath = path.join(root, "landing/evidence.html");
  const cssPath = path.join(root, "landing/styles.css");
  const appPath = path.join(root, "landing/app.js");

  if (!fs.existsSync(htmlPath)) {
    return {
      checked: false,
      images: 0,
      buttons: 0,
      labelledSections: 0,
      localHashLinks: 0,
      failures: ["Missing landing/index.html."],
    };
  }

  if (!fs.existsSync(cssPath)) {
    failures.push("Missing landing/styles.css.");
  }

  if (!fs.existsSync(appPath)) {
    failures.push("Missing landing/app.js.");
  }

  if (!fs.existsSync(evidencePath)) {
    failures.push("Missing landing/evidence.html.");
  }

  const html = read(root, "landing/index.html");
  const evidenceHtml = fs.existsSync(evidencePath) ? read(root, "landing/evidence.html") : "";
  const css = fs.existsSync(cssPath) ? read(root, "landing/styles.css") : "";
  const app = fs.existsSync(appPath) ? read(root, "landing/app.js") : "";
  const ids = findIds(html);
  const evidenceIds = findIds(evidenceHtml);
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*id="([^"]+)"[^>]*>/g)].map((match) => ({
    level: Number(match[1]),
    id: match[2],
  }));
  const h1Count = countMatches(html, /<h1\b/gi);
  const images = imageElements(html);
  const buttons = buttonBlocks(html);
  const sections = sectionElements(html);
  const labelledSections = sections.filter((section) => attrs(section)["aria-labelledby"]);
  const hashTargets = localHashTargets(html);
  const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/gi)].map((match) => attrs(match[0]));
  const copyButtons = [...html.matchAll(/<button\b[^>]*class="[^"]*\bcopy-control\b[^"]*"[^>]*>/gi)].map((match) => attrs(match[0]));
  const evidenceLinks = [...html.matchAll(/\shref="\.\/evidence\.html#([^"]+)"/g)].map((match) => match[1]);
  const rawSourceLinks = [...html.matchAll(/\shref="\.\.\/([^"]+)"/g)].map((match) => match[1]);
  const evidenceRawSourceLinks = [...evidenceHtml.matchAll(/\shref="\.\.\/([^"]+)"/g)].map((match) => match[1]);
  const evidenceHashTargets = localHashTargets(evidenceHtml);

  if (!/<html\s+lang="en"/i.test(html)) {
    failures.push("landing/index.html must declare lang=\"en\".");
  }

  if (!/<meta\s+name="viewport"\s+content="width=device-width, initial-scale=1"/i.test(html)) {
    failures.push("landing/index.html must include the responsive viewport meta tag.");
  }

  if (h1Count !== 1) {
    failures.push(`landing/index.html should have exactly one h1, found ${h1Count}.`);
  }

  if (!ids.has("top") || !/<main\s+id="top"/i.test(html)) {
    failures.push("landing/index.html must expose main#top for skipless home navigation.");
  }

  for (const required of [
    '<header class="site-nav" aria-label="Primary">',
    '<nav class="nav-links" id="primary-links" aria-label="Page sections">',
    'aria-live="polite"',
    'aria-label="Whole-person support surfaces"',
    'aria-label="Unstuck calendar and inbox coaching rhythm"',
    'aria-label="Admin operations safety boundary"',
  ]) {
    if (!html.includes(required)) {
      failures.push(`landing/index.html is missing accessibility anchor: ${required}`);
    }
  }

  for (const target of hashTargets) {
    if (!ids.has(target)) {
      failures.push(`Local hash link points at missing id: #${target}`);
    }
  }

  for (const target of evidenceHashTargets) {
    if (!evidenceIds.has(target)) {
      failures.push(`Evidence page local hash link points at missing id: #${target}`);
    }
  }

  for (const target of evidenceLinks) {
    if (!evidenceIds.has(target)) {
      failures.push(`Landing evidence link points at missing evidence id: #${target}`);
    }
  }

  if (rawSourceLinks.length > 0) {
    failures.push(`Landing page still links directly to raw source files: ${rawSourceLinks.join(", ")}`);
  }

  if (evidenceRawSourceLinks.length > 0) {
    failures.push(`Evidence page still links directly to raw source files: ${evidenceRawSourceLinks.join(", ")}`);
  }

  for (const section of labelledSections) {
    const labelId = attrs(section)["aria-labelledby"];
    if (!ids.has(labelId)) {
      failures.push(`Section aria-labelledby points at missing id: ${labelId}`);
    }
  }

  for (const heading of headings) {
    if (!ids.has(heading.id)) {
      failures.push(`Heading id is missing from id set: ${heading.id}`);
    }
  }

  for (const image of images) {
    const imageAttrs = attrs(image);
    if (!("alt" in imageAttrs)) {
      failures.push(`Image is missing alt text: ${image}`);
      continue;
    }
    const isDecorative =
      imageAttrs["aria-hidden"] === "true" ||
      imageAttrs.role === "presentation" ||
      imageAttrs.role === "none";
    if (isDecorative) {
      if (typeof imageAttrs.alt === "string" && imageAttrs.alt.trim().length > 0) {
        failures.push(`Decorative image should use empty alt text: ${image}`);
      }
      continue;
    }
    if (typeof imageAttrs.alt === "string" && imageAttrs.alt.trim().length < 12) {
      failures.push(`Image alt text is too terse: ${imageAttrs.alt}`);
    }
  }

  for (const button of buttons) {
    const buttonAttrs = attrs(button);
    const visibleText = stripTags(button);
    if (!buttonAttrs["aria-label"] && !visibleText) {
      failures.push(`Button lacks an accessible name: ${button}`);
    }
  }

  const navToggle = elementMatches(html, "button").find((button) => button.includes("nav-toggle"));
  if (!navToggle) {
    failures.push("Missing mobile nav toggle button.");
  } else {
    const navToggleAttrs = attrs(navToggle);
    if (navToggleAttrs["aria-controls"] !== "primary-links") {
      failures.push("Mobile nav toggle must control primary-links.");
    }
    if (navToggleAttrs["aria-expanded"] !== "false") {
      failures.push("Mobile nav toggle should default aria-expanded to false.");
    }
  }

  if (tabs.length !== 6) {
    failures.push(`Expected 6 demo tabs, found ${tabs.length}.`);
  }
  if (!tabs.some((tab) => tab["aria-selected"] === "true")) {
    failures.push("Demo tablist must have one selected tab.");
  }

  for (const copyButton of copyButtons) {
    if (!copyButton["aria-label"]) {
      failures.push("Copy button is missing aria-label.");
    }
    if (!copyButton.title) {
      failures.push("Copy button is missing title tooltip text.");
    }
    const target = String(copyButton["data-copy-target"] || "").replace(/^#/, "");
    if (!target || !ids.has(target)) {
      failures.push(`Copy button points at missing target: ${copyButton["data-copy-target"]}`);
    }
  }

  for (const forbidden of [/tabindex="\d+"/i, /autofocus\b/i, /role="button"/i]) {
    if (forbidden.test(html)) {
      failures.push(`landing/index.html contains avoidable accessibility anti-pattern: ${forbidden}`);
    }
  }

  for (const requiredCss of [
    ":focus-visible",
    "outline: 3px solid var(--cyan)",
    "@media (prefers-reduced-motion: reduce)",
    "scroll-behavior: auto !important",
    "transition: none !important",
    "--motion-fast: 120ms",
  ]) {
    if (!css.includes(requiredCss)) {
      failures.push(`landing/styles.css is missing accessibility CSS: ${requiredCss}`);
    }
  }

  for (const { label, source, pattern, message } of [
    {
      label: "landing/styles.css",
      source: css,
      pattern: /scroll-behavior\s*:\s*smooth/i,
      message: "smooth scrolling is disallowed because hash navigation must not animate the page.",
    },
    {
      label: "landing/styles.css",
      source: css,
      pattern: /\banimation\s*:\s*(?!\s*none\b)[^;]+/i,
      message: "decorative CSS animations are disallowed on the public landing page.",
    },
    {
      label: "landing/styles.css",
      source: css,
      pattern: /@keyframes\b/i,
      message: "unused or decorative keyframes are disallowed on the public landing page.",
    },
    {
      label: "landing/styles.css",
      source: css,
      pattern: /transition\s*:\s*[^;]*\btransform\b/i,
      message: "transform transitions are disallowed because interaction should not move or scale controls.",
    },
  ]) {
    if (pattern.test(source)) {
      failures.push(`${label}: ${message}`);
    }
  }

  for (const requiredAppText of [
    "navToggle.setAttribute(\"aria-expanded\", String(nextState))",
    "navToggle.setAttribute(\"aria-expanded\", \"false\")",
    "tab.setAttribute(\"aria-selected\", String(active))",
    "consoleCheckNote.textContent",
    "scrollIntoView({ block: \"start\", behavior: \"auto\" })",
    "cycleTimer = null",
  ]) {
    if (!app.includes(requiredAppText)) {
      failures.push(`landing/app.js is missing accessibility behavior text: ${requiredAppText}`);
    }
  }

  for (const { pattern, message } of [
    {
      pattern: /setInterval\b/,
      message: "landing/app.js must not auto-cycle demo content.",
    },
    {
      pattern: /requestAnimationFrame\b/,
      message: "landing/app.js must not schedule motion-like scroll choreography.",
    },
    {
      pattern: /IntersectionObserver\b/,
      message: "landing/app.js must not reveal content through scroll-triggered choreography.",
    },
    {
      pattern: /transitionDelay\b/,
      message: "landing/app.js must not stagger reveal transitions.",
    },
  ]) {
    if (pattern.test(app)) {
      failures.push(message);
    }
  }

  return {
    checked: true,
    images: images.length,
    buttons: buttons.length,
    labelledSections: labelledSections.length,
    localHashLinks: hashTargets.length,
    evidenceLinks: evidenceLinks.length,
    evidenceCards: countMatches(evidenceHtml, /class="[^"]*\bevidence-card\b/gi),
    demoTabs: tabs.length,
    copyButtons: copyButtons.length,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyLandingAccessibility();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
