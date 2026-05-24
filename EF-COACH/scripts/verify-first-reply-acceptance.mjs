#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { verifyTranscriptPack } from "./verify-transcript-pack.mjs";

const actionPattern = /\b(reply|tell me|send|paste|type|dump|copy|quote|mark|pick|choose|open|write|save|park|close|eat|touch)\b/i;
const proofPattern = /\b(proof|reply|tell me|messy task pile|raw pile|any three items|three items|fed|quoted?|sentence|breadcrumb|one label|one item|one loop|closest blocker|say yellow|current next action)\b/i;

const genericAdvicePatterns = [
  /\btry breaking (?:it|the task) into smaller pieces\b/i,
  /\bset(?:ting)? a timer\b/i,
  /\bremove distractions\b/i,
  /\breward yourself\b/i,
  /\bprioritize (?:your )?tasks by urgency and importance\b/i,
  /\buse (?:an? )?(?:eisenhower )?matrix\b/i,
  /\bstay positive\b/i,
  /\byou can do it\b/i,
  /\bconsistency is built by showing up\b/i,
  /\bdo not take feedback personally\b/i,
];

const frictionSignals = [
  "make this clear",
  "messy task pile",
  "sort it outside your head",
  "hold the rest",
  "stuck at the start",
  "not failing",
  "getting one move unstuck",
  "not processing your worth",
  "holding the three loops",
  "Biology comes first",
  "I am holding the list",
  "Captured:",
  "three attempts",
  "The plan failed; you did not",
  "Biology is in the loop",
  "I will not guess",
  "system overload",
  "I will sort it outside your head",
  "activation fuel",
];

const unclearFirstContactPatterns = [
  /\bactivation friction\b/i,
  /\bvisible surface\b/i,
  /\bwhat is open\b/i,
  /\bwhat can you see\b/i,
  /\bput one thing where you can see it\b/i,
  /\bname the thing\b/i,
  /\bthing you can see\b/i,
  /\bopen, touched, or visible\b/i,
];

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function includesAny(text, values) {
  const lower = text.toLowerCase();
  return values.some((value) => lower.includes(value.toLowerCase()));
}

export function verifyFirstReplyAcceptance(root = process.cwd()) {
  const transcriptSummary = verifyTranscriptPack(root);
  const failures = [...transcriptSummary.failures.map((failure) => `Transcript prerequisite failed: ${failure}`)];
  const cases = [];

  for (const transcriptCase of transcriptSummary.cases) {
    const reply = transcriptCase.coachSnippet || "";
    const normalizedReply = reply.trim();
    const caseFailures = [];

    if (!normalizedReply) {
      caseFailures.push("missing coach reply");
    }

    if (!includesAny(normalizedReply, frictionSignals)) {
      caseFailures.push("does not clearly name or frame the live friction");
    }

    if (!actionPattern.test(normalizedReply)) {
      caseFailures.push("does not give one concrete next move");
    }

    if (!proofPattern.test(normalizedReply)) {
      caseFailures.push("does not ask for tiny proof or a state signal");
    }

    const matchedGenericAdvice = genericAdvicePatterns
      .filter((pattern) => pattern.test(normalizedReply))
      .map((pattern) => pattern.source);
    if (matchedGenericAdvice.length > 0) {
      caseFailures.push(`contains generic advice pattern(s): ${matchedGenericAdvice.join(", ")}`);
    }

    if (transcriptCase.title === "Getting Started") {
      const matchedUnclearFirstContact = unclearFirstContactPatterns
        .filter((pattern) => pattern.test(normalizedReply))
        .map((pattern) => pattern.source);
      if (matchedUnclearFirstContact.length > 0) {
        caseFailures.push(`contains unclear first-contact wording: ${matchedUnclearFirstContact.join(", ")}`);
      }
    }

    const words = wordCount(normalizedReply);
    if (words > 80) {
      caseFailures.push(`reply is too long for first-contact coaching: ${words} words`);
    }

    const sentenceCount = normalizedReply.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
    if (sentenceCount > 6) {
      caseFailures.push(`reply has too many sentence-like units: ${sentenceCount}`);
    }

    if (caseFailures.length > 0) {
      failures.push(`${transcriptCase.title}: ${caseFailures.join("; ")}`);
    }

    cases.push({
      title: transcriptCase.title,
      wordCount: words,
      sentenceCount,
      hasFrictionSignal: includesAny(normalizedReply, frictionSignals),
      hasConcreteMove: actionPattern.test(normalizedReply),
      hasTinyProof: proofPattern.test(normalizedReply),
      genericAdviceMatches: matchedGenericAdvice.length,
      failures: caseFailures,
    });
  }

  return {
    checkedCases: cases.length,
    cases,
    failures,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const summary = verifyFirstReplyAcceptance();
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length > 0) {
    process.exitCode = 1;
  }
}
