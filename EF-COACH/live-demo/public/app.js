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
const energyButtons = [...document.querySelectorAll("[data-energy]")];
const stateRead = document.querySelector("#state-read");
const stateDetail = document.querySelector("#state-detail");
const nextMove = document.querySelector("#next-move");
const heldPile = document.querySelector("#held-pile");
const tinyChecks = document.querySelector("#tiny-checks");
const thread = [];
const heldItems = [];
let energyLevel = null;
let currentRecognition = null;

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
    label: "bare minimum",
    detail: "Assume almost no capacity. Offer one body-level move.",
  },
  2: {
    label: "low",
    detail: "Keep the move under thirty seconds and remove choices.",
  },
  3: {
    label: "usable",
    detail: "One small task move is okay. Keep the pile parked.",
  },
  4: {
    label: "warm",
    detail: "Use momentum, but still choose one next move.",
  },
  5: {
    label: "ready",
    detail: "The user can take a slightly bigger step, but no long menu.",
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

  for (const button of energyButtons) {
    const selected = Number(button.dataset.energy) === energyLevel;
    button.setAttribute("aria-pressed", String(selected));
  }
}

function setEnergy(value) {
  const nextLevel = Number.parseInt(value, 10);
  if (!energyProfiles[nextLevel]) {
    return;
  }

  energyLevel = nextLevel;
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
  const state = inferState(`${lastUser} ${lastAssistant}`);

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

async function loadConfig() {
  const response = await fetch("./api/config", { cache: "no-store" });
  const config = await response.json();
  provider.textContent = `${config.providerLabel} · ${config.model}`;
}

function insertText(text) {
  message.value = text;
  resizeComposer();
  message.focus();
}

function submitPrompt(text) {
  insertText(text);
  form.requestSubmit();
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
    return "Microphone permission was blocked. You can still type or use a chip.";
  }
  if (error === "no-speech") {
    return "No speech caught. Try Mic again and say the messy version.";
  }
  if (error === "audio-capture") {
    return "No microphone was found. The chips still work.";
  }
  return "Voice typing did not start. The chips still work.";
}

function startVoiceInput() {
  if (currentRecognition) {
    stopVoiceInput();
    return;
  }

  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    setVoiceState("Voice typing is not available here. I put a no-typing prompt in the box.");
    insertText("I'm too overloaded to type. Help me start.");
    return;
  }

  const recognition = new SpeechRecognition();
  let endedWithError = false;
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  currentRecognition = recognition;

  recognition.addEventListener("start", () => {
    setVoiceState("Listening. Say the messy version.", true);
  });

  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    if (transcript) {
      message.value = transcript;
      resizeComposer();
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
        : message.value.trim()
          ? "Captured. Press Enter or Send."
          : "No speech captured. Try Mic again or use a chip.",
      false,
    );
    message.focus();
  });

  recognition.addEventListener("error", (event) => {
    endedWithError = true;
    setVoiceState(getVoiceErrorMessage(event.error), false);
  });

  try {
    recognition.start();
  } catch {
    currentRecognition = null;
    setVoiceState("Voice typing did not start. Try a chip or type fragments.", false);
  }
}

document.addEventListener("click", (event) => {
  const energyButton = event.target.closest("[data-energy]");
  if (energyButton) {
    setEnergy(energyButton.dataset.energy);
    return;
  }

  const promptButton = event.target.closest("[data-prompt]");
  if (promptButton) {
    submitPrompt(promptButton.dataset.prompt);
    return;
  }

  const insertButton = event.target.closest("[data-insert]");
  if (insertButton) {
    insertText(insertButton.dataset.insert);
  }
});

voiceButton.addEventListener("click", startVoiceInput);
message.addEventListener("input", resizeComposer);
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

  const history = [...thread];
  rememberPile(content);
  thread.push({ role: "user", content });
  message.value = "";
  resizeComposer();
  renderMessages({ pendingText: "Thinking with the thread..." });
  submit.setAttribute("aria-busy", "true");
  submit.disabled = true;

  try {
    const response = await fetch("./api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: content,
        context: getEnergyContext(),
        history,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.message || body.error || "Live demo request failed.");
    }

    thread.push({ role: "assistant", content: body.reply });
    provider.textContent = `${body.providerLabel || body.provider} · ${body.model}`;
    renderMessages();
  } catch (error) {
    renderMessages({ errorText: error.message });
  } finally {
    submit.removeAttribute("aria-busy");
    submit.disabled = false;
    message.focus();
  }
});

renderMessages();
loadConfig().catch(() => {
  provider.textContent = "Runtime unavailable";
});
