import { dirname } from "node:path";
import { existsSync } from "node:fs";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stdin } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const USAGE_LOG_TYPE = "unstuck_usage";
const DEFAULT_AGGREGATE_FILE = `${__dirname}/unstuck_usage_alltime.json`;
const TRACKED_EVENTS = [
  "view_landing",
  "view_chat",
  "chat_started",
  "llm_reply_ok",
  "llm_error",
  "rate_limited",
  "request_rejected",
];

function withTrackedEventDefaults(source) {
  const base = Object.create(null);
  for (const event of TRACKED_EVENTS) {
    base[event] = 0;
  }
  if (!source) {
    return base;
  }
  for (const [event, count] of Object.entries(source)) {
    if (TRACKED_EVENTS.includes(event)) {
      base[event] = Number(count) || 0;
    }
  }
  return base;
}

function normalizeEventName(value) {
  return value || "unknown";
}

function makeEmptyAggregate() {
  return {
    version: 1,
    firstSeen: null,
    lastSeen: null,
    events: Object.create(null),
    providerModel: Object.create(null),
    errorReasons: Object.create(null),
    totalErrors: 0,
    latencySamples: [],
  };
}

function loadAggregate(path) {
  if (!existsSync(path)) {
    return makeEmptyAggregate();
  }
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version || 1,
      firstSeen: parsed.firstSeen || null,
      lastSeen: parsed.lastSeen || null,
      events: parsed.events || Object.create(null),
      providerModel: parsed.providerModel || Object.create(null),
      errorReasons: parsed.errorReasons || Object.create(null),
      totalErrors: Number(parsed.totalErrors) || 0,
      latencySamples: Array.isArray(parsed.latencySamples) ? parsed.latencySamples.filter((value) => Number.isFinite(value)) : [],
    };
  } catch {
    return makeEmptyAggregate();
  }
}

function writeAggregate(path, aggregate) {
  const payload = {
    ...aggregate,
    events: Object.fromEntries(
      Object.entries(aggregate.events)
        .filter(([, value]) => Number.isFinite(value))
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
    providerModel: Object.fromEntries(
      Object.entries(aggregate.providerModel)
        .filter(([, value]) => Number.isFinite(value))
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
    errorReasons: Object.fromEntries(
      Object.entries(aggregate.errorReasons)
        .filter(([, value]) => Number.isFinite(value))
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function mergeMaps(target, source) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] || 0) + (Number(value) || 0);
  }
}

function mergeValues(target, value) {
  const normalized = normalizeEventName(value);
  target[normalized] = (target[normalized] || 0) + 1;
}

function computeLatencyStats(samples) {
  if (!samples.length) {
    return {
      samples: 0,
      min: 0,
      max: 0,
      avg: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
    };
  }
  const sortedLatencies = [...samples].sort((a, b) => a - b);
  return {
    samples: sortedLatencies.length,
    min: sortedLatencies[0],
    max: sortedLatencies.at(-1),
    avg: Math.round(sortedLatencies.reduce((sum, item) => sum + item, 0) / sortedLatencies.length),
    p50: percentile(sortedLatencies, 0.5),
    p90: percentile(sortedLatencies, 0.9),
    p95: percentile(sortedLatencies, 0.95),
    p99: percentile(sortedLatencies, 0.99),
  };
}

function mergeLatencySamples(base, additions) {
  const combined = [...base, ...additions];
  if (combined.length > 100000) {
    return combined.slice(-100000);
  }
  return combined;
}

function parseArgs(argv) {
  const result = new Set();
  const values = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      values.set(arg.slice(2), argv[i + 1]);
      i += 1;
    } else {
      result.add(arg.slice(2));
    }
  }
  return { flags: result, values };
}

function parseUsageLine(line) {
  const jsonStart = line.indexOf("{");
  if (jsonStart < 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(line.slice(jsonStart));
    return parsed?.type === USAGE_LOG_TYPE || parsed?.type === `${USAGE_LOG_TYPE}_log` ? parsed : null;
  } catch {
    return null;
  }
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function toNumber(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function percentile(values, p) {
  if (!values.length) {
    return 0;
  }
  const index = Math.floor((values.length - 1) * p);
  return values[index];
}

function summarizeSessions(events) {
  const sessions = new Map();
  for (const event of events) {
    const key = event.sessionId || event.requestId || event.status;
    if (!key) {
      continue;
    }
    const current = sessions.get(key) || {
      hasLanding: false,
      hasChat: false,
      hasStarted: false,
      hasReply: false,
      requestRejected: false,
      rateLimited: false,
    };

    if (event.event === "view_landing") {
      current.hasLanding = true;
    } else if (event.event === "view_chat") {
      current.hasChat = true;
    } else if (event.event === "chat_started") {
      current.hasStarted = true;
    } else if (event.event === "llm_reply_ok") {
      current.hasReply = true;
    } else if (event.event === "request_rejected") {
      current.requestRejected = true;
    } else if (event.event === "rate_limited") {
      current.rateLimited = true;
    }

    sessions.set(key, current);
  }

  let withLanding = 0;
  let withChat = 0;
  let withStarted = 0;
  let withReply = 0;
  let landingToChat = 0;
  let chatToStarted = 0;
  let startedToReply = 0;

  for (const state of sessions.values()) {
    if (state.hasLanding) {
      withLanding += 1;
    }
    if (state.hasChat) {
      withChat += 1;
    }
    if (state.hasStarted) {
      withStarted += 1;
    }
    if (state.hasReply) {
      withReply += 1;
    }
    if (state.hasLanding && state.hasChat) {
      landingToChat += 1;
    }
    if (state.hasChat && state.hasStarted) {
      chatToStarted += 1;
    }
    if (state.hasStarted && state.hasReply) {
      startedToReply += 1;
    }
  }

  return {
    sessionsTotal: sessions.size,
    withLanding,
    withChat,
    withStarted,
    withReply,
    landingToChat,
    chatToStarted,
    startedToReply,
  };
}

async function checkPosthogHealth(posthogUrl) {
  const result = {
    endpoint: posthogUrl,
    checked: false,
    hasScriptTag: false,
    hasPosthogInit: false,
    hasKey: false,
    hasCaptureEndpoint: false,
    apiHost: null,
    keySample: null,
    errors: [],
  };
  try {
    const scriptResponse = await fetch(`${posthogUrl}/posthog.js`, { method: "GET" });
    result.checked = true;
    if (!scriptResponse.ok) {
      result.errors.push(`script_status_${scriptResponse.status}`);
      return result;
    }

    const scriptBody = await scriptResponse.text();
    result.hasScriptTag = scriptBody.includes("posthog.init");
    result.hasPosthogInit = scriptBody.includes("posthog.init(");
    const keyMatch = scriptBody.match(/phc_[A-Za-z0-9]+/);
    result.hasKey = Boolean(keyMatch);
    if (keyMatch) {
      const value = keyMatch[0];
      result.keySample = `${value.slice(0, 6)}...${value.slice(-6)}`;
    }

    const hostMatch = scriptBody.match(/api_host:\s*['"]([^'"]+)['"]/);
    if (hostMatch?.[1]) {
      result.apiHost = hostMatch[1];
      try {
        const capturePing = await fetch(`${result.apiHost}/e/`, { method: "HEAD", redirect: "manual" });
        result.hasCaptureEndpoint = capturePing.status < 500;
      } catch (error) {
        result.errors.push(error?.message || "capture_ping_failed");
      }
    }
  } catch (error) {
    result.errors.push(error?.message || "posthog_check_failed");
  }
  return result;
}

async function main() {
  const { flags, values } = parseArgs(process.argv.slice(2));
  const posthogUrl = values.get("posthog-url") || "https://unstuck.kyanitelabs.tech";
  const includePosthogCheck = flags.has("posthog-check");
  const aggregatePath = values.get("aggregate-file") || DEFAULT_AGGREGATE_FILE;
  const persistEnabled = !flags.has("no-all-time");
  const aggregate = loadAggregate(aggregatePath);
  const usageCounts = new Map();
  const providerModel = new Map();
  const errorReasons = new Map();
  const responseLatencies = [];
  const eventList = [];
  let firstSeen = "";
  let lastSeen = "";
  let parsedUsageEvents = 0;

  let buffer = "";
  stdin.setEncoding("utf8");
  for await (const chunk of stdin) {
    buffer += chunk;
  }

  for (const line of buffer.split(/\r?\n/)) {
    const event = parseUsageLine(line);
    if (!event) {
      continue;
    }
    parsedUsageEvents += 1;

    eventList.push(event);
    const eventName = normalizeEventName(event.event);
    increment(usageCounts, eventName);
    if (persistEnabled) {
      mergeValues(aggregate.events, eventName);
    }
    if (!firstSeen || event.timestamp < firstSeen) {
      firstSeen = event.timestamp;
    }
    if (!lastSeen || event.timestamp > lastSeen) {
      lastSeen = event.timestamp;
    }

    if (event.event === "llm_reply_ok") {
      const by = `${event.provider || "unknown"}.${event.model || "unknown"}`;
      increment(providerModel, by);
      if (persistEnabled) {
        mergeValues(aggregate.providerModel, by);
      }
      const latency = toNumber(event.totalLatencyMs);
      if (latency !== null) {
        responseLatencies.push(latency);
      }
      const modelLatency = toNumber(event.modelLatencyMs);
      if (modelLatency !== null) {
        responseLatencies.push(modelLatency);
      }
    }

    if (event.event === "llm_error") {
      increment(errorReasons, event.errorType || "unknown");
      if (persistEnabled) {
        mergeValues(aggregate.errorReasons, event.errorType || "unknown");
      }
      const latency = toNumber(event.totalLatencyMs);
      if (latency !== null) {
        responseLatencies.push(latency);
      }
    }

    if (event.event === "rate_limited" || event.event === "request_rejected") {
      increment(errorReasons, String(event.reason || event.rejectionType || event.status || "unknown"));
      if (persistEnabled) {
        mergeValues(
          aggregate.errorReasons,
          String(event.reason || event.rejectionType || event.status || "unknown"),
        );
      }
    }

    if (persistEnabled && event.timestamp) {
      if (!aggregate.firstSeen || event.timestamp < aggregate.firstSeen) {
        aggregate.firstSeen = event.timestamp;
      }
      if (!aggregate.lastSeen || event.timestamp > aggregate.lastSeen) {
        aggregate.lastSeen = event.timestamp;
      }
    }
  }

  if (persistEnabled && responseLatencies.length) {
    aggregate.latencySamples = mergeLatencySamples(aggregate.latencySamples, responseLatencies);
  }

  if (persistEnabled) {
    aggregate.totalErrors = (usageCounts.get("llm_error") || 0)
      + (usageCounts.get("rate_limited") || 0)
      + (usageCounts.get("request_rejected") || 0)
      + aggregate.totalErrors;
  }

  const sortedLatencies = responseLatencies.sort((a, b) => a - b);
  const sessionMetrics = summarizeSessions(eventList);
  const hasErrors =
    usageCounts.get("llm_error") > 0 ||
    usageCounts.get("rate_limited") > 0 ||
    usageCounts.get("request_rejected") > 0;
  const hasTraffic = [...usageCounts.values()].some((count) => count > 0);

  const allEvents = withTrackedEventDefaults(Object.fromEntries([...usageCounts.entries()]));
  const allTimeEvents = withTrackedEventDefaults(
    persistEnabled ? aggregate.events : Object.fromEntries([...usageCounts.entries()]),
  );
  const providerModelCounts = Object.fromEntries(
    [...providerModel.entries()].sort(([a], [b]) => a.localeCompare(b)),
  );
  const errorReasonCounts = Object.fromEntries([...errorReasons.entries()].sort(([a], [b]) => a.localeCompare(b)));

  const summary = {
    type: "unstuck_usage_summary_v2",
    firstSeen: firstSeen || null,
    lastSeen: lastSeen || null,
    events: allEvents,
    windowEvents: allEvents,
    providerModel: providerModelCounts,
    session: {
      totalSessionsObserved: sessionMetrics.sessionsTotal,
      landingToChat: {
        count: sessionMetrics.landingToChat,
        denominator: Math.max(sessionMetrics.withLanding, 1),
        rate: sessionMetrics.landingToChat / Math.max(sessionMetrics.withLanding, 1),
      },
      chatToChatStart: {
        count: sessionMetrics.chatToStarted,
        denominator: Math.max(sessionMetrics.withChat, 1),
        rate: sessionMetrics.chatToStarted / Math.max(sessionMetrics.withChat, 1),
      },
      chatStartToReply: {
        count: sessionMetrics.startedToReply,
        denominator: Math.max(sessionMetrics.withStarted, 1),
        rate: sessionMetrics.startedToReply / Math.max(sessionMetrics.withStarted, 1),
      },
      withLanding: sessionMetrics.withLanding,
      withChat: sessionMetrics.withChat,
      withStarted: sessionMetrics.withStarted,
      withReply: sessionMetrics.withReply,
    },
    allTime: {
      events: allTimeEvents,
      providerModel: persistEnabled ? aggregate.providerModel : providerModelCounts,
      errorCountsByReason: persistEnabled ? aggregate.errorReasons : errorReasonCounts,
      errors: {
        totalErrors: persistEnabled ? aggregate.totalErrors : (usageCounts.get("llm_error") || 0) + (usageCounts.get("rate_limited") || 0) + (usageCounts.get("request_rejected") || 0),
      },
      firstSeen: persistEnabled ? aggregate.firstSeen : (firstSeen || null),
      lastSeen: persistEnabled ? aggregate.lastSeen : (lastSeen || null),
      latencyMs: persistEnabled ? computeLatencyStats(aggregate.latencySamples) : {
        samples: sortedLatencies.length,
        min: sortedLatencies[0] || 0,
        max: sortedLatencies.at(-1) || 0,
        avg:
          sortedLatencies.length === 0
            ? 0
            : Math.round(sortedLatencies.reduce((sum, value) => sum + value, 0) / sortedLatencies.length),
        p50: percentile(sortedLatencies, 0.5),
        p90: percentile(sortedLatencies, 0.9),
        p95: percentile(sortedLatencies, 0.95),
        p99: percentile(sortedLatencies, 0.99),
      },
      status: persistEnabled ? (aggregate.totalErrors > 0 ? "showing errors/rate limiting" : "active") : undefined,
    },
    latencyMs: {
      samples: sortedLatencies.length,
      min: sortedLatencies[0] || 0,
      max: sortedLatencies.at(-1) || 0,
      avg:
        sortedLatencies.length === 0
          ? 0
          : Math.round(sortedLatencies.reduce((sum, value) => sum + value, 0) / sortedLatencies.length),
      p50: percentile(sortedLatencies, 0.5),
      p90: percentile(sortedLatencies, 0.9),
      p95: percentile(sortedLatencies, 0.95),
      p99: percentile(sortedLatencies, 0.99),
    },
    errors: {
      countsByReason: errorReasonCounts,
      totalErrors: (usageCounts.get("llm_error") || 0) + (usageCounts.get("rate_limited") || 0) + (usageCounts.get("request_rejected") || 0),
    },
    status: hasErrors ? "showing errors/rate limiting" : hasTraffic ? "active" : "quiet",
  };

  if (persistEnabled && parsedUsageEvents > 0) {
    writeAggregate(aggregatePath, aggregate);
  }

  if (includePosthogCheck) {
    summary.posthog = await checkPosthogHealth(posthogUrl);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
