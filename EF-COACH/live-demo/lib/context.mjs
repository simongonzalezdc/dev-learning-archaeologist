import { readFile } from "node:fs/promises";
import { join, normalize, resolve } from "node:path";

export const CONTEXT_FILES = [
  "PROJECT_INSTRUCTIONS.md",
  "START_HERE.md",
  "FIRST_RUN.md",
  "identity.md",
  "rules.md",
  "examples.md",
  "reference/coaching-protocols.md",
  "reference/mode-router.md",
  "reference/signal-map.md",
  "reference/admin-ops-playbooks.md",
  "reference/safety-boundaries.md",
];

const MAX_CONTEXT_CHARS = 78_000;

function assertPublicPath(relativePath) {
  const normalized = normalize(relativePath);
  if (
    normalized.startsWith("..") ||
    normalized.includes("PRIVATE_") ||
    normalized.includes(".git") ||
    normalized.includes("node_modules")
  ) {
    throw new Error(`Refusing to load non-public context path: ${relativePath}`);
  }
  return normalized;
}

export async function buildCoachInstructions({ rootDir, contextFiles = CONTEXT_FILES } = {}) {
  if (!rootDir) {
    throw new Error("rootDir is required");
  }

  const root = resolve(rootDir);
  const sections = [];

  for (const relativePath of contextFiles) {
    const safePath = assertPublicPath(relativePath);
    const fullPath = join(root, safePath);
    const body = await readFile(fullPath, "utf8");
    sections.push(`\n\n--- ${safePath} ---\n${body.trim()}`);
  }

  const instructions = `You are running the public live demo for Unstuck Coach. Use the loaded project files as the coach contract. Reply as the coach, not as a commentator about the repository. Keep the answer plain, humane, and short: name what is happening without blame, give one concrete next move, and ask for one tiny answer or proof signal.${sections.join("")}`;

  if (instructions.length > MAX_CONTEXT_CHARS) {
    return instructions.slice(0, MAX_CONTEXT_CHARS) + "\n\n[Context truncated at public live-demo limit.]";
  }

  return instructions;
}
