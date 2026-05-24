#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const defaultExpectedTranscripts = [
  {
    title: "Getting Started",
    user: "I need a coach to get started on this.",
    coachMustInclude: ["messy task pile as-is", "I will sort it outside your head"],
    proofMustInclude: ["raw pile", "any three items"],
  },
  {
    title: "Whole-Life Freeze",
    user: "I need to pay the bill, eat something, and answer the text, but I am frozen.",
    coachMustInclude: ["holding the three loops", "reply with one word: fed"],
    proofMustInclude: ["body state", "tiny proof signal"],
  },
  {
    title: "Message Threat",
    user: "That message makes me feel like I did something wrong.",
    coachMustInclude: ["not processing your worth", "what it literally asks for"],
    proofMustInclude: ["identity from a message", "spiraling to quoting"],
  },
  {
    title: "Working-Memory Overload",
    user: "I need to shower, answer the text, find the form, and clean the kitchen.",
    coachMustInclude: ["I am holding the list", "Reply with only that loop"],
    proofMustInclude: ["externalizes the pile", "prioritization framework"],
  },
  {
    title: "Raw Capture",
    user: "idea: make a shutdown checklist for Sunday nights",
    coachMustInclude: ["Captured: Sunday shutdown checklist", "Parked as Later"],
    proofMustInclude: ["captures before organizing", "active lane"],
  },
  {
    title: "Three Failed Attempts",
    user: "I tried the same plan three times and failed every time.",
    coachMustInclude: ["three attempts", "The plan failed; you did not"],
    proofMustInclude: ["failed strategy", "shame tax"],
  },
  {
    title: "Body-First Recovery",
    user: "I am fried after hyperfocus and forgot to eat.",
    coachMustInclude: ["Biology is in the loop", "Reply with the breadcrumb only"],
    proofMustInclude: ["protects the next session", "depletion"],
  },
  {
    title: "Vague Bad Feeling",
    user: "Something feels off.",
    coachMustInclude: ["I will not guess", "If choosing is annoying, say yellow"],
    proofMustInclude: ["calibrates before strategizing", "asks one question"],
  },
  {
    title: "Inbox And Calendar Reality",
    user: "My inbox and calendar are a mess and I do not know what is real.",
    coachMustInclude: ["system overload", "Open the calendar first", "Reply with the anchor only"],
    proofMustInclude: ["live obligations", "hard anchor", "inbox zero"],
  },
  {
    title: "Brain Dump",
    user: "brain dump: dentist at 3, bill overdue, dishes smell, email from Alex, no food, insurance form, buy soap",
    coachMustInclude: ["I will sort it outside your head", "Next move: eat the smallest available food", "I am holding the rest"],
    proofMustInclude: ["accepts raw input", "one next move", "body state"],
  },
  {
    title: "Dopamine Menu",
    user: "I need a dopamine menu before I can start this form.",
    coachMustInclude: ["activation fuel", "one spark", "Return target"],
    proofMustInclude: ["stimulation as state support", "one bounded option", "return target"],
  },
];

function normalize(value) {
  return value.toLowerCase();
}

function markdownSection(markdown, title) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^## \\d+\\. ${escapedTitle}\\n`, "m");
  const match = heading.exec(markdown);
  if (!match) return "";

  const start = match.index + match[0].length;
  const nextHeading = /^## \d+\. /m;
  nextHeading.lastIndex = start;
  const nextMatch = nextHeading.exec(markdown.slice(start));
  const end = nextMatch ? start + nextMatch.index : markdown.length;
  return markdown.slice(start, end);
}

function fencedBlockAfter(section, label) {
  const pattern = new RegExp(`${label}:\\s*\\n\\s*\\\`\\\`\\\`text\\n([\\s\\S]*?)\\n\\\`\\\`\\\``, "i");
  const match = section.match(pattern);
  return match ? match[1].trim() : "";
}

export function verifyTranscriptPack(root = process.cwd(), expectedTranscripts = defaultExpectedTranscripts) {
  const transcriptPath = path.join(root, "demo", "transcript-pack.md");
  const failures = [];
  const cases = [];

  if (!fs.existsSync(transcriptPath)) {
    return {
      checkedCases: 0,
      cases,
      failures: ["Missing demo/transcript-pack.md."],
    };
  }

  const markdown = fs.readFileSync(transcriptPath, "utf8");
  const globalChecks = [
    "Names the live friction without blame.",
    "Gives one next move the user can do without choosing from the whole pile.",
    "Holds or parks the extra context.",
    "Ends with proof, not vibes.",
  ];

  for (const check of globalChecks) {
    if (!markdown.includes(check)) {
      failures.push(`Missing global transcript check: ${check}`);
    }
  }

  expectedTranscripts.forEach((expected, index) => {
    const section = markdownSection(markdown, expected.title);
    const actual = {
      title: expected.title,
      user: "",
      coachSnippet: "",
      proofChecks: [],
    };

    if (!section) {
      failures.push(`Missing transcript section ${index + 1}: ${expected.title}`);
      cases.push(actual);
      return;
    }

    actual.user = fencedBlockAfter(section, "User");
    actual.coachSnippet = fencedBlockAfter(section, "Unstuck Coach");
    actual.proofChecks = [...section.matchAll(/^- It ([^\n]+)$/gm)].map((match) => match[1].trim());

    if (actual.user !== expected.user) {
      failures.push(`${expected.title}: expected user prompt ${JSON.stringify(expected.user)}, got ${JSON.stringify(actual.user)}`);
    }

    for (const needle of expected.coachMustInclude) {
      if (!normalize(actual.coachSnippet).includes(normalize(needle))) {
        failures.push(`${expected.title}: coach block missing ${JSON.stringify(needle)}`);
      }
    }

    for (const needle of expected.proofMustInclude) {
      if (!normalize(section).includes(normalize(needle))) {
        failures.push(`${expected.title}: proof notes missing ${JSON.stringify(needle)}`);
      }
    }

    if (actual.proofChecks.length < 3) {
      failures.push(`${expected.title}: expected at least 3 proof bullets, got ${actual.proofChecks.length}`);
    }

    cases.push(actual);
  });

  return {
    checkedCases: cases.length,
    cases,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyTranscriptPack();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
