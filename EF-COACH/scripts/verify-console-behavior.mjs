#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const defaultCases = [
  {
    name: "task pile overload",
    input: "I need a coach to get started on this.",
    expected: {
      state: "Yellow",
      friction: "Task pile overload",
      move: "Send the messy task pile.",
      check: "Any three items.",
    },
  },
  {
    name: "whole-life freeze",
    input: "I need to pay the bill, eat something, and answer the text, but I am frozen.",
    expected: {
      state: "Yellow",
      friction: "Working-memory overload",
      move: "Externalize the loops.",
      check: "One relief mark.",
    },
  },
  {
    name: "message threat",
    input: "That message makes me feel like I did something wrong.",
    expected: {
      state: "Red-yellow",
      friction: "Communication threat",
      move: "Separate ask from meaning.",
      check: "One quoted sentence.",
    },
  },
  {
    name: "calendar inbox overload",
    input: "My inbox and calendar are a mess and I do not know what is real.",
    expected: {
      state: "Yellow",
      friction: "Calendar/inbox overload",
      move: "Rescue live obligations.",
      check: "One hard anchor or live item.",
    },
  },
  {
    name: "working-memory overload",
    input: "I need to shower, answer the text, find the form, and clean the kitchen.",
    expected: {
      state: "Yellow",
      friction: "Working-memory overload",
      move: "Externalize the loops.",
      check: "One relief mark.",
    },
  },
  {
    name: "idea capture",
    input: "idea: make a shutdown checklist for Sunday nights",
    expected: {
      state: "Green-yellow",
      friction: "Capture versus execution",
      move: "Park with a return time.",
      check: "One parked idea.",
    },
  },
  {
    name: "brain dump overload",
    input: "brain dump: dentist at 3, bill overdue, dishes smell, email from Alex, no food, insurance form, buy soap",
    expected: {
      state: "Yellow",
      friction: "Brain dump overload",
      move: "Sort outside the head.",
      check: "One next move.",
    },
  },
  {
    name: "dopamine menu",
    input: "I need a dopamine menu before I can start this form.",
    expected: {
      state: "Yellow",
      friction: "Activation fuel gap",
      move: "Choose one tiny spark.",
      check: "Spark plus target.",
    },
  },
  {
    name: "repeated failed plan",
    input: "I tried the same plan three times and failed every time.",
    expected: {
      state: "Yellow-red",
      friction: "Plan mismatch",
      move: "Name the closest blocker.",
      check: "One blocker named.",
    },
  },
  {
    name: "body-first recovery",
    input: "I am fried after hyperfocus and forgot to eat.",
    expected: {
      state: "Red",
      friction: "Recovery before re-entry",
      move: "Close the loop.",
      check: "A re-entry breadcrumb.",
    },
  },
  {
    name: "calibration fallback",
    input: "Something feels off.",
    expected: {
      state: "Unknown-yellow",
      friction: "Needs calibration",
      move: "Ask one state question.",
      check: "One honest signal.",
    },
  },
];

function makeElement(dataset = {}) {
  return {
    dataset,
    textContent: "",
    value: "",
    classList: {
      toggle() {},
    },
    setAttribute() {},
    addEventListener() {},
  };
}

function makeHarness() {
  const elements = new Map([
    ["#demo-prompt", makeElement()],
    ["#demo-generic", makeElement()],
    ["#demo-unstuck", makeElement()],
    ["#coach-console", makeElement()],
    ["#coach-input", makeElement()],
    ["#console-state", makeElement()],
    ["#console-state-note", makeElement()],
    ["#console-friction", makeElement()],
    ["#console-friction-note", makeElement()],
    ["#console-move", makeElement()],
    ["#console-move-note", makeElement()],
    ["#console-check", makeElement()],
    ["#console-check-note", makeElement()],
  ]);

  const promptTabs = [0, 1, 2, 3, 4, 5].map((index) => makeElement({ demo: String(index) }));
  const sampleChips = [
    "I need a coach to get started on this.",
    "That message makes me feel like I did something wrong.",
    "My inbox and calendar are a mess and I do not know what is real.",
    "I need to shower, answer the text, find the form, and clean the kitchen.",
    "brain dump: dentist at 3, bill overdue, dishes smell, email from Alex, no food, insurance form, buy soap",
    "I need a dopamine menu before I can start this form.",
    "idea: make a shutdown checklist for Sunday nights",
  ].map((sample) => makeElement({ sample }));
  const copyControls = [];

  const document = {
    querySelector(selector) {
      const element = elements.get(selector);
      if (!element) {
        throw new Error(`Unhandled selector in console verifier: ${selector}`);
      }
      return element;
    },
    querySelectorAll(selector) {
      if (selector === ".prompt-tab") return promptTabs;
      if (selector === ".sample-chip") return sampleChips;
      if (selector === ".copy-control") return copyControls;
      throw new Error(`Unhandled selector list in console verifier: ${selector}`);
    },
  };

  const window = {
    clearInterval() {},
    setInterval() {
      return 1;
    },
  };

  return { document, elements, window };
}

export function verifyConsoleBehavior(root = process.cwd()) {
  const appPath = path.join(root, "landing", "app.js");
  const htmlPath = path.join(root, "landing", "index.html");
  const source = fs.readFileSync(appPath, "utf8");
  const html = fs.readFileSync(htmlPath, "utf8");
  const harness = makeHarness();
  const context = vm.createContext({
    document: harness.document,
    window: harness.window,
    Number,
  });

  vm.runInContext(source, context, {
    filename: appPath,
    timeout: 1000,
  });

  const failures = [];
  const expectedDemoTabs = [
    { index: "0", label: "Life freeze" },
    { index: "1", label: "Get started" },
    { index: "2", label: "Message spiral" },
    { index: "3", label: "Inbox/calendar" },
    { index: "4", label: "Too many loops" },
    { index: "5", label: "Failed plan" },
  ];
  const promptTabs = Array.from(
    html.matchAll(/<button[^>]*class="prompt-tab[^"]*"[^>]*data-demo="([^"]+)"[^>]*>[\s\S]*?<\/button>/g),
  ).map((match) => ({
    index: match[1],
    label: match[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  }));
  if (promptTabs.length !== expectedDemoTabs.length) {
    failures.push(`landing demo expected ${expectedDemoTabs.length} prompt tabs, found ${promptTabs.length}`);
  }
  expectedDemoTabs.forEach((expected, index) => {
    const actual = promptTabs[index];
    if (!actual) return;
    if (actual.index !== expected.index || actual.label !== expected.label) {
      failures.push(
        `landing demo tab ${index} expected data-demo=${expected.index} label=${JSON.stringify(expected.label)}, got data-demo=${actual.index} label=${JSON.stringify(actual.label)}`,
      );
    }
    if (!source.includes(`label: "${expected.label}"`)) {
      failures.push(`landing/app.js demos missing matching label: ${expected.label}`);
    }
  });

  const cases = defaultCases.map((testCase) => {
    const result = context.coachMoment(testCase.input);
    const actual = {
      state: result.state,
      friction: result.friction,
      move: result.move,
      check: result.check,
    };
    for (const [key, expectedValue] of Object.entries(testCase.expected)) {
      if (actual[key] !== expectedValue) {
        failures.push(
          `${testCase.name}: expected ${key}=${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual[key])}`,
        );
      }
    }
    context.renderConsole(result);
    if (harness.elements.get("#console-friction").textContent !== actual.friction) {
      failures.push(`${testCase.name}: renderConsole did not write friction`);
    }
    return {
      name: testCase.name,
      input: testCase.input,
      actual,
    };
  });

  return {
    checkedCases: cases.length,
    demoPromptTabs: promptTabs.length,
    cases,
    failures,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyConsoleBehavior();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
