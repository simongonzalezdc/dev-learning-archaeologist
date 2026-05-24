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
        const result = await callModel({ instructions, messages, env });

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
