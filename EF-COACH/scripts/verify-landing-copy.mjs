#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const expectedCopyTargets = [];

function hasTarget(markup, target, text) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const targetPattern = new RegExp(`id="${target}"[\\s\\S]*?${escapedText}`);
  return targetPattern.test(markup);
}

export function verifyLandingCopy(root = process.cwd()) {
  const htmlPath = path.join(root, "landing", "index.html");
  const jsPath = path.join(root, "landing", "app.js");
  const failures = [];

  if (!fs.existsSync(htmlPath)) {
    return {
      checkedButtons: 0,
      failures: ["Missing landing/index.html."],
    };
  }

  if (!fs.existsSync(jsPath)) {
    return {
      checkedButtons: 0,
      failures: ["Missing landing/app.js."],
    };
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const app = fs.readFileSync(jsPath, "utf8");

  for (const expected of expectedCopyTargets) {
    if (!html.includes(`aria-label="${expected.button}"`)) {
      failures.push(`Missing copy button: ${expected.button}`);
    }

    if (!html.includes(`data-copy-target="#${expected.target}"`)) {
      failures.push(`Missing copy target wiring for ${expected.button}`);
    }

    if (!hasTarget(html, expected.target, expected.text)) {
      failures.push(`Missing copy target text for ${expected.target}`);
    }
  }

  for (const removedCopyText of ["copy-control", "Copy starter", "Copy start prompt"]) {
    if (html.includes(removedCopyText)) {
      failures.push(`Landing should not expose prompt-copy UI: ${removedCopyText}`);
    }
  }

  return {
    checkedButtons: expectedCopyTargets.length,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyLandingCopy();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
