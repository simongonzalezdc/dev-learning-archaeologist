import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildCoachInstructions } from "./lib/context.mjs";
import { callCoachModel, publicProviderConfig, resolveLlmConfig } from "./lib/llm-client.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, "..");
const CHAT_PUBLIC_DIR = resolve(__dirname, "public");
const MAX_BODY_BYTES = 16_000;
const MAX_MESSAGE_CHARS = 2_500;
const MAX_SUPPLIED_CONTEXT_CHARS = 800;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_MESSAGE_CHARS = 1_000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 12;
const DEFAULT_MAX_CONCURRENT_MODEL_CALLS = 2;
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "permissions-policy": "microphone=(self)",
};
const HTML_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  "content-security-policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; "),
};

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
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

const PUBLIC_ROOT_FILES = new Set([
  "LICENSE",
  "README.md",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function sendText(response, status, text) {
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(text);
}

function redirect(response, location) {
  response.writeHead(308, {
    ...SECURITY_HEADERS,
    location,
    "cache-control": "public, max-age=300",
  });
  response.end();
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

function normalizeIpAddress(value) {
  const token = String(value || "")
    .split(",")[0]
    .trim();
  const bracketed = token.match(/^\[([^\]]+)\]/)?.[1];
  const ip = (bracketed || token).replace(/^::ffff:/, "");
  return isIP(ip) ? ip : "";
}

function isTrustedProxyAddress(value) {
  const ip = normalizeIpAddress(value);
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

function clientIdFor(request, env) {
  const remoteAddress = normalizeIpAddress(request.socket?.remoteAddress) || "unknown";
  const forwardedAddress = normalizeIpAddress(request.headers["x-forwarded-for"]);
  if (env.COACH_TRUST_PROXY !== "0" && forwardedAddress && isTrustedProxyAddress(remoteAddress)) {
    return forwardedAddress;
  }
  return remoteAddress;
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

function assertJsonContentType(request) {
  const contentType = request.headers["content-type"];
  if (typeof contentType !== "string" || !contentType.toLowerCase().includes("application/json")) {
    throw new PublicHttpError(415, "JSON content type required");
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

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanConversationHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
      const content = cleanText(item?.content, MAX_HISTORY_MESSAGE_CHARS);
      return role && content ? [{ role, content }] : [];
    })
    .slice(-MAX_HISTORY_TURNS);
}

async function serveStaticFile(request, response, { baseDir, requestedPath, cacheControl = "public, max-age=300" }) {
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const base = resolve(baseDir);
  const filePath = resolve(join(base, safePath));

  if (!filePath.startsWith(base)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    const type = MIME_TYPES.get(extname(filePath)) || "application/octet-stream";
    response.writeHead(200, {
      ...(type.startsWith("text/html") ? HTML_SECURITY_HEADERS : SECURITY_HEADERS),
      "content-type": type,
      "cache-control": cacheControl,
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function serveSiteStatic(request, response, rootDir) {
  const url = new URL(request.url, "http://localhost");
  const root = resolve(rootDir);
  const landingDir = resolve(root, "landing");

  if (url.pathname === "/landing" || url.pathname === "/landing/" || url.pathname === "/landing/index.html") {
    redirect(response, "/");
    return;
  }
  if (url.pathname === "/chat") {
    redirect(response, "/chat/");
    return;
  }
  if (url.pathname === "/favicon.ico") {
    await serveStaticFile(request, response, {
      baseDir: landingDir,
      requestedPath: "/assets/unstuck-coach-logo.png",
      cacheControl: "public, max-age=86400",
    });
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    await serveStaticFile(request, response, { baseDir: landingDir, requestedPath: "/index.html" });
    return;
  }
  if (url.pathname === "/chat/" || url.pathname.startsWith("/chat/")) {
    const chatPath = url.pathname === "/chat/" ? "/index.html" : url.pathname.slice("/chat".length);
    await serveStaticFile(request, response, {
      baseDir: CHAT_PUBLIC_DIR,
      requestedPath: chatPath,
      cacheControl: "no-cache",
    });
    return;
  }
  if (
    url.pathname === "/styles.css" ||
    url.pathname === "/app.js" ||
    url.pathname.startsWith("/assets/")
  ) {
    await serveStaticFile(request, response, { baseDir: landingDir, requestedPath: url.pathname });
    return;
  }

  const rootFile = url.pathname.replace(/^\//, "");
  if (PUBLIC_ROOT_FILES.has(rootFile)) {
    await serveStaticFile(request, response, { baseDir: root, requestedPath: `/${rootFile}` });
    return;
  }
  if (
    /^(coach|docs|demo|evals|reference)\//.test(rootFile) &&
    MIME_TYPES.has(extname(rootFile)) &&
    !rootFile.includes("PRIVATE")
  ) {
    await serveStaticFile(request, response, { baseDir: root, requestedPath: `/${rootFile}` });
    return;
  }

  sendText(response, 404, "Not found");
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
        rateLimiter.consume(clientIdFor(request, env));
        assertJsonContentType(request);

        const body = await readJsonBody(request);
        const message = cleanText(body.message, MAX_MESSAGE_CHARS);
        const suppliedContext = cleanText(body.context, MAX_SUPPLIED_CONTEXT_CHARS);
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
        await serveSiteStatic(request, response, rootDir);
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
