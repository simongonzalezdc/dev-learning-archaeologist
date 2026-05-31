const form = document.querySelector("#coach-form");
const message = document.querySelector("#message");
const chatLog = document.querySelector("#chat-log");
const provider = document.querySelector("#provider");
const submit = form?.querySelector('button[type="submit"]');
const voiceButton = document.querySelector("#voice-button");
const voiceStatus = document.querySelector("#voice-status");
const coachDock = document.querySelector("#coach-dock");
const reliefMap = document.querySelector("#relief-map");
const energyRead = document.querySelector("#energy-read");
const energyHint = document.querySelector("#energy-hint");
const energyButtons = [...document.querySelectorAll("[data-energy]")];
const energyScaleSteps = [...document.querySelectorAll("[data-scale]")];
const stateRead = document.querySelector("#state-read");
const stateDetail = document.querySelector("#state-detail");
const nextMove = document.querySelector("#next-move");
const heldPile = document.querySelector("#held-pile");
const tinyChecks = document.querySelector("#tiny-checks");
const draftStatus = document.querySelector("#draft-status");
const sendStatus = document.querySelector("#send-status");
const thread = [];
const heldItems = [];
let energyLevel = null;
let currentRecognition = null;
let voiceBaseDraft = "";
let lastVoiceTranscript = "";
let loadingTimers = [];
let lastTrackedDraftBucket = null;

const DRAFT_STORAGE_KEY = "unstuck_live_demo_draft";

const intro = {
  role: "assistant",
  content: "Tell me what is stuck. Messy is fine.",
};

const stateRules = [
  {
    label: "Calendar/inbox reality",
    detail: "Find the next hard anchor. Cleanup can wait.",
    pattern: /calendar|inbox|deadline|meeting|appointment|review/i,
  },
  {
    label: "Communication threat",
    detail: "Separate the literal ask from the threat story.",
    pattern: /message|email|\btext\b|reply|mad|wrong|per my last|we need to talk/i,
  },
  {
    label: "Body or activation fuel",
    detail: "Stabilize first, then choose one move.",
    pattern: /\beat\b|food|tired|fried|dopamine|sleep|body|hungry|overstimulated/i,
  },
  {
    label: "Frozen start",
    detail: "Lower the start line. Contact counts.",
    pattern: /frozen|stuck|can't start|cannot start|overwhelmed|too much/i,
  },
  {
    label: "Capture and park",
    detail: "Get it out of working memory before sorting it.",
    pattern: /brain dump|idea:|todo:|note to self|remind me/i,
  },
];

const energyProfiles = {
  1: {
    label: "rest",
    detail: "We will use a body-level move. No sorting yet.",
  },
  2: {
    label: "tiny",
    detail: "We will keep this under thirty seconds.",
  },
  3: {
    label: "small",
    detail: "One small task move is okay. The pile stays parked.",
  },
  4: {
    label: "steady",
    detail: "Use the momentum, but still choose only one move.",
  },
  5: {
    label: "bigger",
    detail: "A slightly bigger step is okay. Still no long menu.",
  },
};

const pileRules = [
  [/calendar|meeting|appointment|review|deadline/i, "Hard anchor"],
  [/inbox|email/i, "Inbox pile"],
  [/message|text|reply|call/i, "Message thread"],
  [/bill|form|tax|paperwork|admin/i, "Admin loop"],
  [/eat|food|water|sleep|medication/i, "Body need"],
  [/idea|todo|remind|note/i, "Capture item"],
  [/task|list|project|launch/i, "Task pile"],
];

function getLengthBucket(text) {
  const length = String(text || "").trim().length;
  if (!length) return "empty";
  if (length < 120) return "short";
  if (length < 900) return "detailed";
  if (length < 4000) return "big-context";
  return "demo-limit-risk";
}

function trackChat(eventName, properties = {}) {
  window.UnstuckAnalytics?.track?.(eventName, {
    surface: "chat",
    energy_selected: energyLevel || null,
    thread_turns: thread.length,
    ...properties,
  });
}

function pulseClick(element) {
  if (!element) return;
  element.dataset.clicked = "true";
  window.setTimeout(() => {
    delete element.dataset.clicked;
  }, 450);
}

function setSendStatus(text = "Ready.", state = "ready") {
  if (!sendStatus) return;
  sendStatus.textContent = text;
  sendStatus.dataset.state = state;
}

function updateDraftStatus() {
  if (!draftStatus || !message) return null;
  const length = message.value.trim().length;
  const bucket = getLengthBucket(message.value);
  const labels = {
    empty: "Empty draft. Messy context is welcome.",
    short: "Short draft. Fragments count.",
    detailed: "Detailed draft. Good — I can work with messy context.",
    "big-context": "Big context — still okay. I will compress the pile.",
    "demo-limit-risk": "Very large context. If the demo pushes back, send any three fragments.",
  };
  draftStatus.textContent = `${labels[bucket]}${length ? ` (${length} chars)` : ""}`;
  draftStatus.dataset.state = bucket.startsWith("big") || bucket === "demo-limit-risk" ? "big" : bucket;
  return bucket;
}

function saveDraft() {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, message.value);
  } catch {
    // Draft preservation must not block the demo.
  }
}

function clearSavedDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function restoreDraft() {
  try {
    const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved && !message.value.trim()) {
      message.value = saved;
      resizeComposer();
    }
  } catch {
    // Ignore storage failures.
  }
  updateDraftStatus();
}

function clearLoadingTimers() {
  for (const timer of loadingTimers) {
    window.clearTimeout(timer);
  }
  loadingTimers = [];
}

function startLoadingProgress() {
  clearLoadingTimers();
  setSendStatus("Holding context…", "loading");
  loadingTimers = [
    window.setTimeout(() => setSendStatus("Compressing the pile…", "loading"), 1200),
    window.setTimeout(() => setSendStatus("Finding one next move…", "loading"), 2800),
  ];
}

function createTurn(turn, extraClass = "") {
  const article = document.createElement("article");
  article.className = ["turn", turn.role, extraClass].filter(Boolean).join(" ");

  const label = document.createElement("span");
  label.className = "speaker";
  label.textContent = turn.role === "assistant" ? "Coach" : "You";

  const content = document.createElement("div");
  content.textContent = turn.content;

  article.append(label, content);
  return article;
}

function latest(role) {
  return [...thread].reverse().find((turn) => turn.role === role)?.content || "";
}

function inferState(text) {
  const match = stateRules.find((rule) => rule.pattern.test(text));
  return (
    match || {
      label: "Ready to start",
      detail: "Pick a chip, talk, or type one messy sentence.",
    }
  );
}

function getVisualSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderEnergyCheck() {
  const profile = energyProfiles[energyLevel];
  energyRead.textContent = profile ? `${energyLevel}/5 - ${profile.label}` : "Pick 1-5";
  energyHint.textContent = profile ? profile.detail : "Pick capacity so the coach sizes the move.";
  reliefMap?.style.setProperty("--energy-progress", `${energyLevel ? energyLevel * 20 : 0}%`);

  for (const button of energyButtons) {
    const selected = Number(button.dataset.energy) === energyLevel;
    button.setAttribute("aria-pressed", String(selected));
  }

  for (const step of energyScaleSteps) {
    step.toggleAttribute("data-selected", Number(step.dataset.scale) === energyLevel);
  }
}

function setEnergy(value) {
  const nextLevel = Number.parseInt(value, 10);
  if (!energyProfiles[nextLevel]) {
    return;
  }

  energyLevel = nextLevel;
  trackChat("energy selected", { energy_level: nextLevel });
  renderDock();
}

function getEnergyContext() {
  const profile = energyProfiles[energyLevel];
  if (!profile) {
    return "";
  }

  return `Energy selected: ${energyLevel}/5 (${profile.label}). ${profile.detail}`;
}

function rememberPile(text) {
  for (const [pattern, label] of pileRules) {
    if (pattern.test(text) && !heldItems.includes(label)) {
      heldItems.push(label);
    }
  }
  while (heldItems.length > 5) {
    heldItems.shift();
  }
}

function extractNextMove(text) {
  const lines = text
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/\*\*/g, "")
        .replace(/^(next move|move|try|check):\s*/i, "")
        .trim(),
    )
    .filter(Boolean);

  return (
    lines.find((line) => /^(send|open|tell|reply|write|touch|put|set|pick|choose|say)\b/i.test(line)) ||
    lines.find((line) => line.length < 120 && !line.endsWith("?")) ||
    "Send one stuck point. Fragments count."
  );
}

function renderHeldPile() {
  if (!heldItems.length) {
    heldPile.textContent = "Nothing parked yet.";
    return;
  }

  const list = document.createElement("ul");
  for (const item of heldItems) {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  }
  heldPile.replaceChildren(`${heldItems.length} item${heldItems.length === 1 ? "" : "s"} parked`, list);
}

function createPromptButton(label, prompt) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.prompt = prompt;
  button.textContent = label;
  return button;
}

function renderTinyChecks() {
  tinyChecks.replaceChildren(
    createPromptButton("Done", "Done."),
    createPromptButton("Too much", "Too much. Make it smaller."),
    createPromptButton("Need help", "I need help doing the next move."),
  );
}

function renderReliefMap(state) {
  const visualState = `energy-${energyLevel || 0}-${getVisualSlug(state.label)}`;
  coachDock?.setAttribute("data-visual-state", visualState);
  reliefMap?.setAttribute("data-visual-state", visualState);
}

function renderDock() {
  const lastUser = latest("user");
  const lastAssistant = latest("assistant");
  const state = inferState(lastUser);

  stateRead.textContent = state.label;
  stateDetail.textContent = state.detail;
  nextMove.textContent = extractNextMove(lastAssistant);
  renderEnergyCheck();
  renderReliefMap(state);
  renderTinyChecks();
  renderHeldPile();
}

function renderMessages({ pendingText, errorText } = {}) {
  const turns = [createTurn(intro), ...thread.map((turn) => createTurn(turn))];

  if (pendingText) {
    turns.push(createTurn({ role: "assistant", content: pendingText }, "pending"));
  }

  if (errorText) {
    turns.push(createTurn({ role: "assistant", content: errorText }, "error"));
  }

  chatLog.replaceChildren(...turns);
  chatLog.scrollTop = chatLog.scrollHeight;
  renderDock();
}

function resizeComposer() {
  message.style.height = "auto";
  message.style.height = `${Math.min(message.scrollHeight, 160)}px`;
}

function setRuntimeStatus(label, detail = "") {
  provider.textContent = label;
  if (detail) {
    provider.title = detail;
    provider.setAttribute("aria-label", detail);
  } else {
    provider.removeAttribute("title");
    provider.removeAttribute("aria-label");
  }
}

function getRuntimeDetail({ providerLabel, provider: providerName, model }) {
  return [providerLabel || providerName, model].filter(Boolean).join(" · ");
}

async function loadConfig() {
  const response = await fetch("/api/config", { cache: "no-store" });
  const config = await response.json();
  setRuntimeStatus("Live model ready", getRuntimeDetail(config));
}

function insertText(text) {
  message.value = text;
  resizeComposer();
  updateDraftStatus();
  saveDraft();
  message.focus();
}

function submitPrompt(text) {
  insertText(text);
  form.requestSubmit();
}

function trimForRequest(text, maxLength) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

function historyForRequest(turns) {
  return turns.slice(-4).map((turn) => ({
    role: turn.role,
    content: trimForRequest(turn.content, 900),
  }));
}

function getErrorMessage(response, body) {
  const message = body?.message || body?.error;
  if (response.status === 413) {
    return "That was a big, real context drop. The demo hit its size limit, not your fault. Please send any three fragments from it and I will keep going from there.";
  }
  if (response.status === 429) {
    return "The demo is busy right now. Your text is still here in the thread; wait a moment and send again.";
  }
  if (response.status >= 500) {
    return "The live model stumbled. Your text is still visible in the thread — try again, or send the smallest chunk.";
  }
  return message || "Live demo request failed. Your text is still visible in the thread; try again when ready.";
}

function setVoiceState(text, busy = false) {
  voiceButton.setAttribute("aria-pressed", String(busy));
  if (busy) {
    voiceButton.setAttribute("aria-busy", "true");
  } else {
    voiceButton.removeAttribute("aria-busy");
  }
  voiceStatus.textContent = text;
}

function stopVoiceInput(status = "Stopped listening.") {
  if (currentRecognition) {
    try {
      currentRecognition.stop();
    } catch {
      currentRecognition.abort?.();
    }
  }
  currentRecognition = null;
  setVoiceState(status, false);
  message.focus();
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function getVoiceErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone permission was blocked. I focused the box for keyboard dictation or fragments.";
  }
  if (error === "no-speech") {
    return "No speech caught. Try Mic again, or use keyboard dictation in the box.";
  }
  if (error === "audio-capture") {
    return "No microphone was found. I focused the box for keyboard dictation or fragments.";
  }
  return "Voice typing did not start. I focused the box for keyboard dictation or fragments.";
}

function focusManualDictationFallback(status, starterText = "") {
  if (starterText && !message.value.trim()) {
    insertText(starterText);
  } else {
    message.focus();
    message.setSelectionRange?.(message.value.length, message.value.length);
  }
  setVoiceState(status, false);
}

function extractRecognitionTranscript(event) {
  return Array.from(event.results || [])
    .map((result) => result[0]?.transcript || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyVoiceTranscript(transcript) {
  lastVoiceTranscript = transcript;
  message.value = [voiceBaseDraft, transcript].filter(Boolean).join(" ").trim();
  resizeComposer();
  updateDraftStatus();
  saveDraft();
}

function startVoiceInput() {
  if (currentRecognition) {
    stopVoiceInput("Stopped listening. Captured text stays in the box.");
    return;
  }

  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    trackChat("voice failed", { reason: "unsupported" });
    focusManualDictationFallback(
      "Voice typing is not available in this browser. I focused the box for keyboard dictation.",
      "I'm too overloaded to type. Help me start.",
    );
    return;
  }

  let recognition;
  try {
    recognition = new SpeechRecognition();
  } catch {
    trackChat("voice failed", { reason: "constructor" });
    focusManualDictationFallback("Voice typing did not initialize. I focused the box for keyboard dictation.");
    return;
  }
  let endedWithError = false;
  voiceBaseDraft = message.value.trim();
  lastVoiceTranscript = "";
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;
  currentRecognition = recognition;

  recognition.addEventListener("start", () => {
    trackChat("voice started");
    setVoiceState("Listening. Say the messy version. Tap Mic again to stop.", true);
  });

  recognition.addEventListener("result", (event) => {
    const transcript = extractRecognitionTranscript(event);
    if (transcript) {
      applyVoiceTranscript(transcript);
      trackChat("voice transcript received", { input_length_bucket: getLengthBucket(transcript) });
      voiceStatus.textContent = "Captured speech. Send when ready, or keep talking.";
    }
  });

  recognition.addEventListener("speechend", () => {
    voiceStatus.textContent = "Processing speech.";
  });

  recognition.addEventListener("end", () => {
    currentRecognition = null;
    setVoiceState(
      endedWithError
        ? voiceStatus.textContent
        : lastVoiceTranscript || message.value.trim()
          ? "Captured. Press Enter or Send."
          : "No speech captured. Try Mic again or use a chip.",
      false,
    );
    message.focus();
  });

  recognition.addEventListener("error", (event) => {
    endedWithError = true;
    trackChat("voice failed", { reason: event.error || "unknown" });
    focusManualDictationFallback(getVoiceErrorMessage(event.error));
  });

  try {
    recognition.start();
  } catch {
    currentRecognition = null;
    trackChat("voice failed", { reason: "start" });
    focusManualDictationFallback("Voice typing did not start. I focused the box for keyboard dictation.");
  }
}

document.addEventListener("click", (event) => {
  const energyButton = event.target.closest("[data-energy]");
  if (energyButton) {
    pulseClick(energyButton);
    setEnergy(energyButton.dataset.energy);
    return;
  }

  const promptButton = event.target.closest("[data-prompt]");
  if (promptButton) {
    pulseClick(promptButton);
    const promptLabel = promptButton.textContent.trim().slice(0, 40);
    trackChat(promptLabel === "Make easier" ? "make easier clicked" : "starter prompt clicked", {
      prompt_label: promptLabel,
      input_length_bucket: getLengthBucket(promptButton.dataset.prompt),
    });
    submitPrompt(promptButton.dataset.prompt);
    return;
  }

  const insertButton = event.target.closest("[data-insert]");
  if (insertButton) {
    pulseClick(insertButton);
    trackChat("tiny ask inserted", { input_length_bucket: getLengthBucket(insertButton.dataset.insert) });
    insertText(insertButton.dataset.insert);
  }
});

voiceButton.addEventListener("click", startVoiceInput);
message.addEventListener("input", () => {
  resizeComposer();
  const bucket = updateDraftStatus();
  saveDraft();
  if (bucket !== lastTrackedDraftBucket) {
    lastTrackedDraftBucket = bucket;
    trackChat("draft length bucket changed", { input_length_bucket: bucket });
  }
});
message.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = message.value.trim();
  if (!content || submit.disabled) {
    return;
  }

  const history = historyForRequest(thread);
  const inputLengthBucket = getLengthBucket(content);
  trackChat("chat prompt submitted", {
    input_length_bucket: inputLengthBucket,
    history_turns: history.length,
    has_energy: Boolean(energyLevel),
  });
  rememberPile(content);
  thread.push({ role: "user", content });
  message.value = "";
  updateDraftStatus();
  resizeComposer();
  renderMessages({ pendingText: "Holding context..." });
  startLoadingProgress();
  submit.setAttribute("aria-busy", "true");
  submit.disabled = true;
  const startedAt = performance.now();

  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: content,
        context: getEnergyContext(),
        history,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      trackChat("chat error shown", {
        status: response.status,
        error_type: body?.error || "http_error",
        input_length_bucket: inputLengthBucket,
      });
      throw new Error(getErrorMessage(response, body));
    }

    thread.push({ role: "assistant", content: body.reply });
    setRuntimeStatus("Live model ready", getRuntimeDetail(body));
    trackChat("coach response received", {
      latency_ms: Math.round(performance.now() - startedAt),
      provider: body.provider || null,
      model: body.model || null,
      input_length_bucket: inputLengthBucket,
    });
    clearSavedDraft();
    setSendStatus("Response received.", "ready");
    renderMessages();
  } catch (error) {
    if (!message.value.trim()) {
      message.value = content;
      resizeComposer();
      updateDraftStatus();
    }
    setSendStatus("Recovery path shown.", "ready");
    renderMessages({ errorText: error.message });
  } finally {
    clearLoadingTimers();
    submit.removeAttribute("aria-busy");
    submit.disabled = false;
    message.focus();
  }
});

renderMessages();
restoreDraft();
lastTrackedDraftBucket = getLengthBucket(message?.value || "");
trackChat("chat opened");
loadConfig().catch(() => {
  setRuntimeStatus("Runtime unavailable");
  trackChat("runtime status changed", { status: "unavailable" });
});
