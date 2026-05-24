import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildCoachInstructions } from "./lib/context.mjs";
import { callCoachModel, publicProviderConfig, resolveLlmConfig } from "./lib/llm-client.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = resolve(__dirname, "public");
const MAX_BODY_BYTES = 32_000;
const MAX_HISTORY_TURNS = 10;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 20;
const DEFAULT_MAX_CONCURRENT_MODEL_CALLS = 4;

class PublicHttpError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function sendText(response, status, text) {
  response.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(text);
}

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createRateLimiter({ windowMs, maxRequests, now = Date.now }) {
  const buckets = new Map();

  return {
    consume(id) {
      const currentTime = now();
      const bucket = buckets.get(id) || { count: 0, resetAt: currentTime + windowMs };

      if (currentTime >= bucket.resetAt) {
        bucket.count = 0;
        bucket.resetAt = currentTime + windowMs;
      }

      bucket.count += 1;
      buckets.set(id, bucket);

      if (bucket.count > maxRequests) {
        throw new PublicHttpError(429, "rate limit exceeded");
      }
    },
  };
}

function clientIdFor(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.socket?.remoteAddress || "unknown";
}

function allowedOriginsFor(env) {
  return String(env.LIVE_DEMO_ALLOWED_ORIGINS || env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function assertAllowedOrigin(request, env) {
  const origin = request.headers.origin;
  if (!origin) {
    return;
  }

  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new PublicHttpError(403, "origin not allowed");
  }

  const host = request.headers.host;
  const sameHost = host && parsedOrigin.host === host;
  const explicitlyAllowed = allowedOriginsFor(env).includes(parsedOrigin.origin);

  if (!sameHost && !explicitlyAllowed) {
    throw new PublicHttpError(403, "origin not allowed");
  }
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      throw new PublicHttpError(413, "request body too large");
    }
  }
  if (!body) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new PublicHttpError(400, "invalid JSON body");
  }
}

function cleanUserMessage(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 4_000);
}

function cleanConversationHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
      const content = cleanUserMessage(item?.content);
      return role && content ? [{ role, content }] : [];
    })
    .slice(-MAX_HISTORY_TURNS);
}

async function serveStatic(request, response) {
  const url = new URL(request.url, "http://localhost");
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": MIME_TYPES.get(extname(filePath)) || "application/octet-stream",
      "cache-control": "public, max-age=300",
    });
    response.end(body);
  } catch {
    sendText(response, 404, "Not found");
  }
}

export function createLiveDemoServer({
  rootDir = DEFAULT_ROOT,
  env = process.env,
  callModel = callCoachModel,
} = {}) {
  const rateLimiter = createRateLimiter({
    windowMs: readPositiveInteger(env.COACH_RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
    maxRequests: readPositiveInteger(env.COACH_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
  });
  const maxConcurrentModelCalls = readPositiveInteger(
    env.COACH_MAX_CONCURRENT_MODEL_CALLS,
    DEFAULT_MAX_CONCURRENT_MODEL_CALLS,
  );
  let activeModelCalls = 0;

  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true, service: "unstuck-coach-live-demo" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/config") {
        try {
          sendJson(response, 200, publicProviderConfig(resolveLlmConfig(env)));
        } catch (error) {
          sendJson(response, 200, {
            provider: "not-configured",
            providerLabel: "LLM not configured",
            model: "missing",
            warning: error.message,
          });
        }
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/coach") {
        assertAllowedOrigin(request, env);
        rateLimiter.consume(clientIdFor(request));

        const body = await readJsonBody(request);
        const message = cleanUserMessage(body.message);
        const suppliedContext = cleanUserMessage(body.context);
        const history = cleanConversationHistory(body.history);

        if (!message) {
          sendJson(response, 400, { error: "message is required" });
          return;
        }

        const instructions = await buildCoachInstructions({ rootDir });
        const userContent = suppliedContext
          ? `${message}\n\nSupplied visible context:\n${suppliedContext}`
          : message;
        const messages = [...history, { role: "user", content: userContent }];
        if (activeModelCalls >= maxConcurrentModelCalls) {
          throw new PublicHttpError(429, "demo is busy; try again");
        }

        activeModelCalls += 1;
        let result;
        try {
          result = await callModel({ instructions, messages, env });
        } finally {
          activeModelCalls -= 1;
        }

        sendJson(response, 200, {
          reply: result.text,
          provider: result.provider,
          providerLabel: result.providerLabel,
          model: result.model,
          steps: [
            { label: "Received prompt", detail: "The browser sent the user's stuck point to the server." },
            { label: "Loaded coach context", detail: "The server loaded the Unstuck project files." },
            { label: "Called LLM", detail: "The server made the model call; no API key went to the browser." },
            { label: "Returned one next move", detail: "The response is rendered back into this page." },
          ],
        });
        return;
      }

      if (request.method === "GET" || request.method === "HEAD") {
        await serveStatic(request, response);
        return;
      }

      sendText(response, 405, "Method not allowed");
    } catch (error) {
      if (error instanceof PublicHttpError) {
        sendJson(response, error.status, { error: error.publicMessage });
        return;
      }

      sendJson(response, 502, { error: "live demo failed" });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  createLiveDemoServer().listen(port, "0.0.0.0", () => {
    console.log(`Unstuck Coach live demo listening on ${port}`);
  });
}
