import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { brotliDecompressSync } from "node:zlib";

function extractInlineServer(compose) {
  const match = compose.match(/cat > \/app\/server\.mjs <<'NODE'\n([\s\S]+?)\n        NODE/);
  assert.ok(match, "could not find inline server heredoc");
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^        /, ""))
    .join("\n");
}

function extractInlinePage(compose) {
  const server = extractInlineServer(compose);
  const match = server.match(/Buffer\.from\("([^"]+)","base64"\)/);
  assert.ok(match, "could not find compressed inline page");
  return brotliDecompressSync(Buffer.from(match[1], "base64")).toString();
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl, getExitMessage) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(`${baseUrl}/`);
      return;
    } catch {
      await pause(25);
    }
  }
  throw new Error(`generated server did not start: ${getExitMessage()}`);
}

async function startGeneratedServer(t) {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
      ZAI_API_KEY: "test-zai-secret",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const dir = mkdtempSync(join(tmpdir(), "unstuck-generated-server-"));
  const file = join(dir, "server.mjs");
  writeFileSync(file, extractInlineServer(result.stdout));

  const port = await freePort();
  let stderr = "";
  const child = spawn(process.execPath, [file], {
    env: {
      ...process.env,
      PORT: String(port),
      CONTEXT_BASE_URL: "http://127.0.0.1:9",
      OPENAI_BASE_URL: "http://127.0.0.1:9/v1",
      OPENAI_API_KEY: "test-key",
      OPENAI_MODEL: "glm-5.1",
    },
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  t.after(() => child.kill());

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl, () => stderr || `exit=${child.exitCode}`);
  return baseUrl;
}

test("Hostinger compose stays below the API content limit", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.length < 8192, `compose was ${result.stdout.length} bytes`);
  assert.match(result.stdout, /simongonzalezdc\.github\.io\/unstuck-coach/);
  assert.doesNotMatch(result.stdout, /LIVE_DEMO_TGZ_B64|PRIVATE_|OPENAI_API_KEY: [^\\n]*sk-/);
});

test("generated compose routes the public Kyanite subdomain and keeps the VPS fallback", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  assert.match(result.stdout, /Host\(`unstuck\.kyanitelabs\.tech`\)/);
  assert.match(result.stdout, /Host\(`srv1542844\.hstgr\.cloud`\) && PathPrefix\(`\/unstuck`\)/);
});

test("generated inline server has valid JavaScript syntax", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const source = extractInlineServer(result.stdout);
  const dir = mkdtempSync(join(tmpdir(), "unstuck-compose-"));
  const file = join(dir, "server.mjs");
  writeFileSync(file, source);

  const check = spawnSync("node", ["--check", file], { encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test("generated inline server rejects scanner paths and unsupported API methods", async (t) => {
  const baseUrl = await startGeneratedServer(t);

  for (const path of ["/.env", "/server.mjs", "/package.json"]) {
    const response = await fetch(`${baseUrl}${path}`);
    const text = await response.text();
    assert.equal(response.status, 404, path);
    assert.doesNotMatch(text, /<!doctype html|OPENAI_API_KEY|ZAI_API_KEY|PRIVATE_/i, path);
  }

  for (const method of ["GET", "OPTIONS", "DELETE"]) {
    const response = await fetch(`${baseUrl}/api/coach`, { method });
    const text = await response.text();
    assert.equal(response.status, 405, method);
    assert.doesNotMatch(text, /<!doctype html|OPENAI_API_KEY|ZAI_API_KEY|PRIVATE_/i, method);
  }
});

test("generated inline server rejects malformed and oversized coach requests safely", async (t) => {
  const baseUrl = await startGeneratedServer(t);

  const malformed = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  const malformedText = await malformed.text();
  assert.match(malformedText, /invalid JSON/i);
  assert.doesNotMatch(malformedText, /Unexpected|SyntaxError|live demo failed|OPENAI_API_KEY|ZAI_API_KEY/i);

  const oversized = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "x".repeat(33_000) }),
  });
  assert.equal(oversized.status, 413);
  const oversizedText = await oversized.text();
  assert.match(oversizedText, /body too large/i);
  assert.doesNotMatch(oversizedText, /live demo failed|OPENAI_API_KEY|ZAI_API_KEY/i);
});

test("generated inline server rejects cross-site browser origins", async (t) => {
  const baseUrl = await startGeneratedServer(t);

  const response = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.example",
    },
    body: JSON.stringify({ message: "Use my quota." }),
  });

  assert.equal(response.status, 403);
  assert.match(await response.text(), /origin/i);
});

test("generated inline server rate-limits repeated clients before model calls", async (t) => {
  const baseUrl = await startGeneratedServer(t);

  let response;
  for (let index = 0; index < 21; index += 1) {
    response = await fetch(`${baseUrl}/api/coach`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.45",
      },
      body: JSON.stringify({ message: "" }),
    });
  }

  assert.equal(response.status, 429);
  assert.match(await response.text(), /rate/i);
});

test("generated compose creates the app working directory before writing server code", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /working_dir: \/app/);
  assert.match(result.stdout, /cat > \/app\/server\.mjs/);
});

test("generated VPS-local server budgets context for the small local model", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /slice\(0,8000\)/);
  assert.doesNotMatch(result.stdout, /78000/);
});

test("generated VPS-local server forces plain coach output instead of protocol labels", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No labels/);
  assert.match(result.stdout, /Choose the move/);
  assert.match(result.stdout, /max_tokens:1200/);
  assert.match(result.stdout, /function sh/);
  assert.match(result.stdout, /AbortSignal\.timeout/);
});

test("generated Hostinger compose targets GLM-5.1 with medium reasoning", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
      ZAI_API_KEY: "test-zai-secret",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.length < 8192, `compose was ${result.stdout.length} bytes`);

  assert.match(result.stdout, /OPENAI_BASE_URL: https:\/\/api\.z\.ai\/api\/coding\/paas\/v4/);
  assert.match(result.stdout, /OPENAI_MODEL: glm-5\.1/);
  assert.match(result.stdout, /thinking:\{type:"enabled"\}/);
  assert.doesNotMatch(result.stdout, /test-zai-secret/);
});

test("generated Hostinger demo preserves ongoing conversation history", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const page = extractInlinePage(result.stdout);
  assert.match(result.stdout, /history/);
  assert.match(page, /thread/);
  assert.match(page, /role==="assistant"/);
});

test("generated Hostinger demo removes text-to-speech and keeps speech-to-text", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const page = extractInlinePage(result.stdout);
  assert.match(page, /id=voice-button/);
  assert.match(page, /SpeechRecognition|webkitSpeechRecognition/);
  assert.match(page, /interimResults/);
  assert.doesNotMatch(page, /id=speak-button|id=stop-button/);
  assert.doesNotMatch(page, /SpeechSynthesisUtterance|speechSynthesis/);
});

test("generated Hostinger demo presents a normal chat interface", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const page = extractInlinePage(result.stdout);
  assert.match(page, /Message Unstuck Coach/);
  assert.match(page, /chat/);
  assert.match(page, /GLM 5\.1/);
  assert.doesNotMatch(page, /GLM medium/);
  assert.match(page, /m\.onkeydown/);
  assert.match(page, /key==="Enter"/);
  assert.match(page, /!e\.shiftKey/);
  assert.match(page, /f\.requestSubmit\(\)/);
  assert.doesNotMatch(page, /Optional context|Execution|Coach reply/);
});

test("generated Hostinger demo has parseable browser JavaScript", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const page = extractInlinePage(result.stdout);
  const match = page.match(/<script>([\s\S]+)<\/script>/);
  assert.ok(match, "could not find inline browser script");
  assert.doesNotThrow(() => new Function(match[1]));
});

test("generated Hostinger demo includes the Coach Dock", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);

  const page = extractInlinePage(result.stdout);
  assert.match(page, /coach-dock/);
  assert.match(page, /voice-button/);
  assert.match(page, /state-read/);
  assert.match(page, /next-move/);
  assert.match(page, /held-pile/);
  assert.match(page, /tiny-checks/);
  assert.match(page, /inferState/);
  assert.match(page, /SpeechRecognition|webkitSpeechRecognition/);
  assert.match(page, /vstat/);
  assert.match(page, /interimResults/);
  assert.match(page, /Blocked|No mic/);
  assert.doesNotMatch(page, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(page, /Message Unstuck Coach/);
  assert.match(page, /work-surface/);
  assert.doesNotMatch(page, /Optional context|Execution|Coach reply/);
});

test("generated Hostinger demo includes the one-click energy check", () => {
  const result = spawnSync("node", ["live-demo/scripts/build-hostinger-compose.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      UNSTUCK_LIVE_PROVIDER: "zai-coding-plan",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.length < 8192, `compose was ${result.stdout.length} bytes`);

  const page = extractInlinePage(result.stdout);
  assert.match(page, /energy-check/);
  assert.match(page, /relief-map/);
  assert.match(page, /Energy now/);
  assert.match(page, /data-energy/);
  assert.match(page, /energy-read/);
  assert.match(page, /energyLevel/);
  assert.match(page, /setEnergy/);
  assert.match(page, /getEnergyContext/);
  assert.match(page, /data-visual-state/);
});
