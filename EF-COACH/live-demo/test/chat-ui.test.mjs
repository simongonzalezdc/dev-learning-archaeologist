import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("public demo uses a normal chat interface", () => {
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const script = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");

  assert.match(html, /id="chat-log"/);
  assert.match(html, /class="composer-row"/);
  assert.match(html, /placeholder="Message Unstuck Coach"/);
  assert.doesNotMatch(html, /Optional visible context|result-panel|Coach reply/);

  assert.match(script, /renderMessages/);
  assert.match(script, /history/);
  assert.match(script, /thread\.push\(\{ role: "user"/);
  assert.match(script, /thread\.push\(\{ role: "assistant"/);
});

test("public demo includes the Coach Dock low-friction sidecar", () => {
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const script = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");

  assert.match(html, /id="coach-dock"/);
  assert.match(html, /id="voice-button"/);
  assert.match(html, /id="read-button"/);
  assert.match(html, /id="stop-audio-button"/);
  assert.match(html, /data-prompt="I'?m frozen/i);
  assert.match(html, /id="state-read"/);
  assert.match(html, /id="next-move"/);
  assert.match(html, /id="held-pile"/);
  assert.match(html, /id="tiny-checks"/);

  assert.match(script, /function renderDock/);
  assert.match(script, /function startVoiceInput/);
  assert.match(script, /function stopVoiceInput/);
  assert.match(script, /function getSpeechRecognition/);
  assert.match(script, /interimResults = true/);
  assert.match(script, /Microphone permission was blocked/);
  assert.match(script, /function readLatestCoachReply/);
  assert.match(script, /function stopReadAloud/);
  assert.match(script, /function getPreferredVoice/);
  assert.match(script, /function inferState/);
  assert.match(script, /SpeechRecognition|webkitSpeechRecognition/);
  assert.match(script, /speechSynthesis/);
  assert.match(script, /SpeechSynthesisUtterance/);
  assert.match(script, /getVoices/);
});

test("public demo includes a one-click energy check", () => {
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const script = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");

  assert.match(html, /id="energy-check"/);
  assert.match(html, /id="relief-map"/);
  assert.match(html, /aria-label="Energy level"/);
  assert.match(html, /id="energy-read"/);
  assert.equal(html.match(/data-energy="/g)?.length, 5);

  assert.match(script, /let energyLevel/);
  assert.match(script, /function setEnergy/);
  assert.match(script, /function getEnergyContext/);
  assert.match(script, /function renderReliefMap/);
  assert.match(script, /data-visual-state/);
});
