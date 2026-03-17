const STATE = {
  IDLE: "Idle",
  LISTENING: "Listening",
  THINKING: "Thinking",
  SPEAKING: "Speaking",
  ERROR: "Error"
};

const GREETING = "Hi! How can I help you?";
const WAKE_PHRASE = "hi planet";
const INACTIVITY_MS = 10000;

let wakeRecognizer = null;
let convoRecognizer = null;
let messages = [{ role: "system", content: "You are a concise, friendly assistant for the Planet app." }];
let ui = null;
let logEl = null;
let stateEl = null;
let transcriptEl = null;
let wakePaused = false;
let speaking = false;
let inactivityTimer = null;
let wakeButton = null;
let micBlocked = false;
let convoRunning = false;
let uiVisible = false;
let preferredVoice = null;
let wakePrimed = false;
let centerBubble = null;
const STOP_WORDS = ["stop", "terminate", "close", "go away", "cancel", "quit", "end", "shut up", "mute", "halt", "pause"];
const NAV_HOME_WORDS = ["go home", "back home", "go to home", "back", "go back", "home screen", "home"];

function matchesWakePhrase(raw) {
  const normalized = (raw || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return false;
  const phrases = ["hi planet", "hey planet", "hello planet", "high planet", "hai planet"];
  if (phrases.some((p) => normalized.includes(p))) return true;
  const words = normalized.split(" ").filter(Boolean);
  const hasHi = words.includes("hi") || words.includes("hey") || words.includes("hello") || words.includes("high") || words.includes("hai");
  const hasPlanet = words.includes("planet");
  return hasHi && hasPlanet;
}

function isStopCommand(text) {
  const norm = (text || "").toLowerCase();
  return STOP_WORDS.some((word) => norm.includes(word));
}

function isHomeNavCommand(text) {
  const norm = (text || "").toLowerCase();
  return NAV_HOME_WORDS.some((word) => norm.split(/\s+/).join(" ").includes(word));
}

function getSpeechRecognition() {
  return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferredNames = ["Samantha", "Karen", "Victoria", "Moira", "Google US English", "en-US", "English" ];
  const femaleMatches = voices.filter((v) => /female|woman/i.test(v.name + v.voiceURI));
  preferredVoice =
    femaleMatches[0] ||
    voices.find((v) => preferredNames.some((n) => v.name.includes(n))) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) ||
    voices[0];
  return preferredVoice;
}

function setState(next) {
  if (!ui) return;
  stateEl.textContent = next;
  ui.dataset.state = next.toLowerCase();
}

function addLog(role, text) {
  if (!logEl) return;
  const item = document.createElement("div");
  item.className = "va-log-item";
  item.dataset.role = role;
  item.textContent = text;
  logEl.appendChild(item);
  logEl.scrollTop = logEl.scrollHeight;
}

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(() => {
    addLog("system", "Inactivity timeout, returning to wake mode.");
    returnToWake();
  }, INACTIVITY_MS);
}

function buildUI() {
  if (ui || typeof document === "undefined") return;

  const style = document.createElement("style");
  style.textContent = `
    .va-panel { position: fixed; right: 18px; bottom: 18px; width: 320px; max-width: calc(100% - 24px); background: rgba(20,20,24,0.9); color: #f7f7ff; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,0.55); font-family: var(--token-font-sans, "Inter", system-ui, sans-serif); backdrop-filter: blur(10px); z-index: 30; opacity: 0; pointer-events: none; transform: translateY(12px); transition: opacity 0.22s ease, transform 0.22s ease; }
    .va-panel.is-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .va-header { display:flex; align-items:center; justify-content:space-between; padding: 10px 12px; gap: 8px; }
    .va-state { display:flex; align-items:center; gap:8px; font-weight:600; font-size:13px; text-transform: capitalize; }
    .va-dot { width:10px; height:10px; border-radius:50%; background:#737373; box-shadow:0 0 0 6px rgba(255,255,255,0.05); }
    .va-panel[data-state="listening"] .va-dot { background:#67e8f9; }
    .va-panel[data-state="thinking"] .va-dot { background:#a5b4fc; }
    .va-panel[data-state="speaking"] .va-dot { background:#fbbf24; }
    .va-panel[data-state="idle"] .va-dot { background:#9ca3af; }
    .va-panel[data-state="error"] .va-dot { background:#f87171; }
    .va-bubble { width:14px; height:14px; border-radius:50%; background: linear-gradient(145deg, #5eead4, #22c55e); box-shadow: 0 0 0 0 rgba(94,234,212,0.4); animation: va-pulse 1.2s ease-in-out infinite; display:none; }
    .va-panel[data-state="listening"] .va-bubble { display:block; }
    @keyframes va-pulse { 0% { box-shadow: 0 0 0 0 rgba(94,234,212,0.45);} 70% { box-shadow: 0 0 0 16px rgba(94,234,212,0);} 100% { box-shadow: 0 0 0 0 rgba(94,234,212,0);} }
    .va-buttons { display:flex; gap:8px; }
    .va-buttons button { flex:1; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:#fff; cursor:pointer; font-weight:600; font-size:12px; transition:all 0.15s ease; }
    .va-buttons button:hover { background:rgba(255,255,255,0.1); }
    .va-log { max-height: 220px; overflow-y: auto; padding: 0 12px 12px; display:flex; flex-direction:column; gap:6px; font-size:12px; line-height:1.35; }
    .va-log-item { padding:8px 10px; border-radius:10px; background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.05); }
    .va-log-item[data-role="user"] { background: rgba(103, 232, 249, 0.08); border-color: rgba(103, 232, 249, 0.2); }
    .va-log-item[data-role="assistant"] { background: rgba(165, 180, 252, 0.08); border-color: rgba(165, 180, 252, 0.2); }
    .va-log-item[data-role="system"] { opacity: 0.7; font-style: italic; }
    .va-transcript { padding: 10px 12px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#d1d5db; min-height: 16px; white-space: pre-wrap; }
    .va-center-bubble { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.7); width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(94,234,212,0.9), rgba(34,197,94,0.8)); box-shadow: 0 0 0 0 rgba(94,234,212,0.35), 0 20px 60px rgba(0,0,0,0.4); opacity: 0; pointer-events: none; z-index: 25; transition: opacity 0.22s ease, transform 0.22s ease; }
    .va-center-bubble::after { content:""; position:absolute; inset:12px; border-radius:50%; border:2px solid rgba(255,255,255,0.4); opacity:0.9; }
    .va-center-bubble.is-active { opacity: 1; transform: translate(-50%, -50%) scale(1); animation: va-center-pulse 1.3s ease-in-out infinite; }
    @keyframes va-center-pulse { 0% { box-shadow: 0 0 0 0 rgba(94,234,212,0.35);} 70% { box-shadow: 0 0 0 40px rgba(94,234,212,0);} 100% { box-shadow: 0 0 0 0 rgba(94,234,212,0);} }
  `;
  document.head.appendChild(style);

  ui = document.createElement("div");
  ui.className = "va-panel";
  ui.dataset.state = "idle";
  ui.innerHTML = `
    <div class="va-header">
      <div class="va-state"><span class="va-dot"></span><span data-state-label>Idle</span></div>
      <div class="va-buttons">
        <div class="va-bubble" data-va-bubble></div>
        <button type="button" data-va-wake>Wake</button>
        <button type="button" data-va-stop>Stop</button>
      </div>
    </div>
    <div class="va-log" data-va-log></div>
    <div class="va-transcript" data-va-transcript></div>
  `;

  document.body.appendChild(ui);
  logEl = ui.querySelector("[data-va-log]");
  stateEl = ui.querySelector("[data-state-label]");
  transcriptEl = ui.querySelector("[data-va-transcript]");
  wakeButton = ui.querySelector("[data-va-wake]");
  centerBubble = document.createElement("div");
  centerBubble.className = "va-center-bubble";
  document.body.appendChild(centerBubble);

  ui.querySelector("[data-va-stop]").addEventListener("click", () => {
    addLog("system", "Assistant stopped. Listening for wake phrase.");
    returnToWake();
  });

  wakeButton.addEventListener("click", () => activateAssistant());
}

function showUI() {
  if (!uiVisible && ui) {
    ui.classList.add("is-visible");
    uiVisible = true;
  }
}

function hideUI() {
  if (uiVisible && ui) {
    ui.classList.remove("is-visible");
    uiVisible = false;
  }
}

function showCenterBubble() {
  centerBubble?.classList.add("is-active");
}

function hideCenterBubble() {
  centerBubble?.classList.remove("is-active");
}

function ensureRecognizer(baseHandlers) {
  const Recognition = getSpeechRecognition();
  if (!Recognition) return null;
  const recognizer = new Recognition();
  recognizer.lang = "en-US";
  recognizer.continuous = true;
  recognizer.interimResults = false;
  Object.assign(recognizer, baseHandlers);
  return recognizer;
}

function startWakeListening() {
  if (!getSpeechRecognition()) {
    setState(STATE.ERROR);
    addLog("system", "Speech recognition not supported in this browser.");
    return;
  }

  if (wakeRecognizer) wakeRecognizer.stop();
  wakePaused = false;
  setState(STATE.IDLE);
  hideUI();
  wakeRecognizer = ensureRecognizer({
    onresult: (event) => {
      if (speaking || wakePaused || micBlocked) return;
      const idx = Math.max(event.resultIndex ?? 0, (event.results?.length || 1) - 1);
      const transcript = (event.results?.[idx]?.[0]?.transcript || "");
      transcriptEl.textContent = transcript;
      if (matchesWakePhrase(transcript)) {
        addLog("user", transcript);
        activateAssistant();
      } else {
        // Optional trace
        console.debug?.("wake heard", transcript);
      }
    },
    onerror: (event) => {
      if (event.error === "not-allowed") {
        micBlocked = true;
        setState(STATE.ERROR);
        addLog("system", "Mic permission denied. Allow microphone to use the assistant.");
      }
    },
    onend: () => {
      if (!wakePaused && !micBlocked) {
        wakeRecognizer?.start();
      }
    }
  });

  try {
    wakeRecognizer.start();
    addLog("system", "Listening for \"hi planet\"…");
    wakePrimed = true;
  } catch (err) {
    addLog("system", `Wake listener error: ${err.message}`);
  }
}

function activateAssistant() {
  if (micBlocked) return;
  wakePaused = true;
  wakeRecognizer?.stop();
  showUI();
  addLog("assistant", GREETING);
  showCenterBubble();
  speakResponse(GREETING, false, () => {
    listenForCommand();
  });
}

function listenForCommand() {
  if (micBlocked) return;

  if (!convoRecognizer) {
    convoRecognizer = ensureRecognizer({
      onresult: (event) => {
        if (speaking) return; // avoid hearing itself
        const transcript = (event.results?.[0]?.[0]?.transcript || "").trim();
        if (!transcript) return;
        if (isStopCommand(transcript)) {
          addLog("system", "Voice assistant stopped by command.");
          returnToWake();
          return;
        }
        if (isHomeNavCommand(transcript)) {
          addLog("assistant", "Going home.");
          window.goHome?.();
          speakResponse("Navigating to home.", true, () => listenForCommand());
          return;
        }
        transcriptEl.textContent = transcript;
        addLog("user", transcript);
        resetInactivityTimer();
        const spaceSummary = window.handleSpaceVoiceSelection?.(transcript);
        if (spaceSummary) {
          addLog("assistant", spaceSummary);
          speakResponse(spaceSummary, true, () => listenForCommand());
          return;
        }
        const modulePrompt = window.handleVoiceModuleCommand?.(transcript);
        if (modulePrompt) {
          addLog("assistant", modulePrompt);
          speakResponse(modulePrompt, true, () => listenForCommand());
          return;
        }
        sendToAI(transcript);
      },
      onerror: (event) => {
        if (event.error === "not-allowed") {
          micBlocked = true;
          setState(STATE.ERROR);
          addLog("system", "Mic permission denied in conversation mode.");
          returnToWake();
        }
        convoRunning = false;
      },
      onend: () => {
        convoRunning = false;
        if (!speaking && !micBlocked) {
          try { convoRecognizer.start(); convoRunning = true; } catch (_) {}
        }
      }
    });
  }

  try {
    if (convoRunning) return;
    setState(STATE.LISTENING);
    convoRecognizer.start();
    convoRunning = true;
    showCenterBubble();
    resetInactivityTimer();
  } catch (err) {
    addLog("system", `Conversation listener error: ${err.message}`);
  }
}

async function sendToAI(text) {
  setState(STATE.THINKING);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    addLog("system", "Missing VITE_OPENAI_API_KEY. Add it to your .env file.");
    setState(STATE.ERROR);
    returnToWake();
    return;
  }

  messages.push({ role: "user", content: text });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || response.statusText);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I’m here.";
    messages.push({ role: "assistant", content: reply });
    addLog("assistant", reply);
    speakResponse(reply, true, () => listenForCommand());
  } catch (error) {
    addLog("system", `AI error: ${error.message}`);
    setState(STATE.ERROR);
    window.setTimeout(returnToWake, 1500);
  }
}

function speakResponse(text, showThinkingReset = false, onDone = () => {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    addLog("system", "Speech synthesis not supported.");
    onDone();
    return;
  }

  // Ensure audio is not muted
  try {
    window.speechSynthesis.cancel();
  } catch (_) {}
  convoRecognizer?.stop();
  convoRunning = false;
  speaking = true;
  setState(STATE.SPEAKING);
  showCenterBubble();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = preferredVoice || pickVoice();
  if (voice) {
    utterance.voice = voice;
  } else {
    addLog("system", "No speech voice available; using default browser voice.");
  }
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.volume = 1;
  utterance.onend = () => {
    speaking = false;
    if (showThinkingReset) setState(STATE.LISTENING);
    window.setTimeout(() => {
      if (!micBlocked) listenForCommand();
      onDone();
    }, 600);
    hideCenterBubble();
  };
  utterance.onerror = () => {
    speaking = false;
    setState(STATE.ERROR);
    onDone();
    hideCenterBubble();
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function returnToWake() {
  convoRecognizer?.stop();
  convoRunning = false;
  speaking = false;
  wakePaused = false;
  setState(STATE.IDLE);
  window.clearTimeout(inactivityTimer);
  hideUI();
  hideCenterBubble();
  startWakeListening();
}

export function initAssistant() {
  if (typeof window === "undefined") return;
  buildUI();
  // warm voice list
  window.speechSynthesis?.addEventListener("voiceschanged", pickVoice);
  pickVoice();
  startWakeListening();
  const primeWake = () => {
    if (!wakePrimed) startWakeListening();
  };
  window.addEventListener("click", primeWake, { once: true });
  window.addEventListener("keydown", primeWake, { once: true });
}

// Manual trigger from UI (bottom mic)
export function triggerAssistantFromMic() {
  if (micBlocked) return;
  wakePaused = true;
  showUI();
  showCenterBubble();
  addLog("assistant", GREETING);
  speakResponse(GREETING, false, () => {
    listenForCommand();
  });
}

export function startWakeListeningPublic() {
  startWakeListening();
}

export function activateAssistantPublic() {
  activateAssistant();
}

export function listenForCommandPublic() {
  listenForCommand();
}

// Named exports per requirements
export { startWakeListening as startWakeListening, activateAssistant as activateAssistant, listenForCommand as listenForCommand, sendToAI, speakResponse };

// Expose for app-level wiring (dock mic button)
if (typeof window !== "undefined") {
  window.triggerAssistantFromMic = triggerAssistantFromMic;
  window.startWakeListening = startWakeListening;
}
