#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { publicBundleFiles } from "./public-bundle-files.mjs";

const root = process.cwd();
const outDir = path.join(root, "output", "public-bundle", "unstuck-coach");
const manifestPath = path.join(outDir, "PUBLICATION_MANIFEST.json");

const manifestDisallowedFragments = [
  ["source", "Branch"].join(""),
  ["codex", "unstuck"].join("/"),
  ["skool", "competitions"].join("_"),
  ["EF", "COACH"].join("-"),
  ["si", "mon", "gonzalez"].join(""),
  ["Mac", "Mini"].join(" "),
  ["KyaniteLabs", "dev-learning"].join("/"),
  ["Desktop", "liam-private"].join("/"),
  ["workspaces", "liam"].join("/"),
  ["Cloak", "Browser"].join(""),
  [".cloak", "browser"].join(""),
  ["Skool", "comment", "sweep"].join(" "),
  ["Tw", "ilio"].join(""),
  ["Tele", "gram"].join(""),
  ["patterns", "db"].join("."),
  ["calls", "jsonl"].join("."),
  ["para", "sqlite"].join("."),
];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function runVerifier(cwd, label) {
  const verify = spawnSync(process.execPath, ["scripts/verify-public-bundle.mjs"], {
    cwd,
    encoding: "utf8",
  });

  process.stdout.write(verify.stdout);
  process.stderr.write(verify.stderr);

  if (verify.status !== 0) {
    throw new Error(`${label} verification failed with exit ${verify.status ?? 1}.`);
  }
}

function assertManifestPublicSafe() {
  const manifestText = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  const branchProvenanceKey = ["source", "Branch"].join("");

  if (Object.prototype.hasOwnProperty.call(manifest, branchProvenanceKey)) {
    throw new Error("Publication manifest contains branch provenance.");
  }

  for (const fragment of manifestDisallowedFragments) {
    if (manifestText.toLowerCase().includes(fragment.toLowerCase())) {
      throw new Error("Publication manifest contains local or private provenance.");
    }
  }
}

function assertNoNestedOutput() {
  if (fs.existsSync(path.join(outDir, "output"))) {
    throw new Error("Exported bundle contains a nested output directory.");
  }
}

runVerifier(root, "Source bundle");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of publicBundleFiles) {
  copyFile(file);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  fileCount: publicBundleFiles.length,
  files: publicBundleFiles,
  notes: [
    "Generated output is intentionally ignored by git.",
    "Copy this folder into the clean Week 5 public repository after final approval and final links.",
    "Run node scripts/verify-public-bundle.mjs again after inserting public URLs.",
  ],
};

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
);

assertManifestPublicSafe();
assertNoNestedOutput();
runVerifier(outDir, "Exported bundle");

console.log(
  JSON.stringify(
    {
      status: "built",
      output: path.relative(root, outDir),
      fileCount: publicBundleFiles.length,
      manifest: path.relative(root, manifestPath),
      exportVerified: true,
    },
    null,
    2,
  ),
);
