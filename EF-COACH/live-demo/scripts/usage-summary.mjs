import { stdin } from "node:process";

const USAGE_LOG_TYPE = "unstuck_usage";
const counts = new Map();
let firstSeen = "";
let lastSeen = "";

function increment(key) {
  counts.set(key, (counts.get(key) || 0) + 1);
}

function parseUsageLine(line) {
  const jsonStart = line.indexOf("{");
  if (jsonStart < 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(line.slice(jsonStart));
    return parsed?.type === USAGE_LOG_TYPE ? parsed : null;
  } catch {
    return null;
  }
}

let buffer = "";
stdin.setEncoding("utf8");
stdin.on("data", (chunk) => {
  buffer += chunk;
});

stdin.on("end", () => {
  for (const line of buffer.split(/\r?\n/)) {
    const event = parseUsageLine(line);
    if (!event) {
      continue;
    }

    increment(event.event || "unknown");
    if (!firstSeen || event.timestamp < firstSeen) {
      firstSeen = event.timestamp;
    }
    if (!lastSeen || event.timestamp > lastSeen) {
      lastSeen = event.timestamp;
    }
  }

  const summary = Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
  console.log(
    JSON.stringify(
      {
        type: "unstuck_usage_summary",
        firstSeen: firstSeen || null,
        lastSeen: lastSeen || null,
        events: summary,
      },
      null,
      2,
    ),
  );
});
