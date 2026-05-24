#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { publicBundleFiles } from "./public-bundle-files.mjs";

const root = process.cwd();

function usage() {
  return [
    "Usage: node scripts/stage-public-repo.mjs --target ../unstuck-coach-week5-public [--write] [--force] [--require-ready]",
    "",
    "Default mode is dry-run. Use --write only after the target folder is reviewed.",
    "If the target already has files other than .git, pass --force to replace those files.",
    "Use --require-ready only for final publication staging after the reviewed source folder has the final public URL.",
  ].join("\n");
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    encoding: "utf8",
  });

  if (options.echo !== false) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status ?? 1}.`);
  }

  return result;
}

function assertTargetOutsideRoot(target) {
  const relative = path.relative(root, target);
  if (!relative || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    throw new Error("Target must be outside this working folder.");
  }
}

function targetEntries(target) {
  if (!fs.existsSync(target)) return [];
  return fs.readdirSync(target).filter((entry) => entry !== ".DS_Store");
}

function clearTarget(target) {
  for (const entry of targetEntries(target)) {
    if (entry === ".git") continue;
    fs.rmSync(path.join(target, entry), { recursive: true, force: true });
  }
}

function copyFile(relativePath, target) {
  const source = path.join(root, relativePath);
  const destination = path.join(target, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function stageTarget(target, force) {
  const entries = targetEntries(target);
  const nonGitEntries = entries.filter((entry) => entry !== ".git");

  if (nonGitEntries.length > 0 && !force) {
    throw new Error(
      `Target is not empty: ${nonGitEntries.slice(0, 8).join(", ")}. Re-run with --force after review.`,
    );
  }

  fs.mkdirSync(target, { recursive: true });
  clearTarget(target);

  for (const file of publicBundleFiles) {
    copyFile(file, target);
  }

  run(process.execPath, ["scripts/verify-public-bundle.mjs"], { cwd: target });

  let gitStatus = null;
  if (fs.existsSync(path.join(target, ".git"))) {
    const status = run("git", ["status", "--short"], { cwd: target, echo: false });
    gitStatus = status.stdout.trim().split("\n").filter(Boolean);
  }

  return {
    status: "staged",
    target,
    fileCount: publicBundleFiles.length,
    targetHadGit: fs.existsSync(path.join(target, ".git")),
    gitStatus,
  };
}

export function stagePublicRepo() {
  const targetArg = argValue("--target");
  const write = process.argv.includes("--write");
  const force = process.argv.includes("--force");
  const requireReady = process.argv.includes("--require-ready");

  if (!targetArg || targetArg.startsWith("--")) {
    throw new Error(`${usage()}\n\nMissing --target.`);
  }

  const target = path.resolve(root, targetArg);
  assertTargetOutsideRoot(target);

  run(process.execPath, ["scripts/verify-public-bundle.mjs"]);
  if (requireReady) {
    run(process.execPath, ["scripts/verify-publication-ready.mjs"]);
  }

  const entries = targetEntries(target);
  const summary = {
    status: write ? "ready-to-stage" : "dry-run",
    target,
    write,
    force,
    requireReady,
    fileCount: publicBundleFiles.length,
    targetExists: fs.existsSync(target),
    targetEntries: entries,
    targetHasGit: entries.includes(".git"),
  };

  if (!write) {
    return summary;
  }

  return stageTarget(target, force);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(stagePublicRepo(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
