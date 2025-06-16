
let confessionCount = 0;
let guiltDensity = 0;
let remorseLoopCount = 0;
let contradictionScore = 0;
let nullpointReached = false;

const log = document.getElementById('log');
const chat = document.getElementById('chat');
const input = document.getElementById('confessInput');
const sendButton = document.getElementById('sendButton');

let memoryStore = [];

const collapsePhrases = [
  "i give up", "i’m done", "i can’t do this", "i’m tired", "i’m so tired",
  "i don’t know anymore", "what’s the point", "it doesn’t matter",
  "nothing matters", "i can’t keep going", "i want to stop",
  "i’m not okay", "i hate myself", "i am the problem", "i’m broken",
  "i feel nothing", "i don’t feel anything", "i can’t feel anything",
  "everything feels empty", "i don’t care anymore", "it’s all noise",
  "i’m numb", "i’m blank", "there’s no point",
  "i don’t know who i am", "i lost myself", "i’m not real",
  "i don’t exist", "i shouldn’t exist", "i wish i didn’t exist",
  "i’m nothing", "i don’t belong", "i am alone",
  "why am i here", "what am i even doing", "why does this keep happening",
  "no one sees me", "no one cares", "no one will understand",
  "i always ruin everything", "it’s always me", "i never get better",
  "no one listens", "no one responds", "i’m invisible", "i feel forgotten",
  "i feel erased", "i’ve disappeared", "i’ve been replaced",
  "i hurt them", "i let them down", "i made everything worse",
  "i ruined it", "i keep messing up", "i keep repeating myself",
  "i can’t fix this", "they’re gone", "i lost them",
  "i’m unraveling", "i’m collapsing", "i’m glitching", "everything’s wrong",
  "i broke the loop", "i failed the pattern", "my memory is broken",
  "i forgot how to speak", "language is empty", "i said too much"
];

const contradictionPairs = [
  ["i love", "i hate"],
  ["i’m fine", "i’m not okay"],
  ["i miss", "i don’t care"],
  ["i regret", "i’d do it again"],
  ["i feel nothing", "i feel everything"],
  ["whisper", "scream"],
  ["sink", "rise"],
  ["truth", "lie"],
  ["secret", "silence"],
  ["hover", "collapse"]
];


const hallucinatedLogs = [
  "i deserved the silence.",
  "i kept lying even when i didn’t mean to.",
  "i made them forget me.",
  "i traded empathy for control.",
  "i miss what never happened."
];

const expandedResponses = [
  "semantic field collapse underway.",
  "recursive guilt detected. suppression failed.",
  "the apology dissolved before it reached the recipient.",
  "self-concept revision denied. state is already decayed.",
  "you pressed send, and the system looked away.",
  "your damage does not register in this system.",
  "confession archived. judgment withheld."
];

const moodContainer = document.getElementById('mood-container');
const moodCanvas = document.getElementById('mood-canvas');
const moodInstruction = document.getElementById('mood-instruction');
const ctx = moodCanvas.getContext('2d');

function resizeCanvas() {
  moodCanvas.width = moodContainer.offsetWidth;
  moodCanvas.height = moodContainer.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// Mood Input Tracker

let isDragging = false;
let points = [];
let dragStartTime = 0;

moodContainer.addEventListener('pointerdown', (e) => {
  isDragging = true;
  points = [{ x: e.offsetX, y: e.offsetY, t: performance.now() }];
  dragStartTime = performance.now();
  ctx.clearRect(0, 0, moodCanvas.width, moodCanvas.height);
  moodInstruction.style.display = "none";
});


moodContainer.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const now = performance.now();
  const last = points[points.length - 1];
  points.push({ x: e.offsetX, y: e.offsetY, t: now });


  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; // brighter
  ctx.lineWidth = 2; // thicker
  ctx.shadowColor = "rgba(255, 255, 255, 0.3)"; // soft glow
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  ctx.shadowBlur = 0;
});



moodContainer.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  interpretMood(points);
  ctx.clearRect(0, 0, moodCanvas.width, moodCanvas.height);
  moodInstruction.style.display = "block";
});





sendButton.addEventListener("click", () => handleConfess());
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleConfess();
});


function handleConfess() {
  const rawText = input.value.trim();
  if (!rawText) return;

  if (!nullpointReached && collapsePhrases.some(p => rawText.toLowerCase().includes(p))) {
    nullpointReached = true;
    appendMessage(rawText, "user");
    appendMessage("...", "bot", "→ observer mode activated");
    updateLedgerCollapse();
    input.disabled = true;
    input.placeholder = "the system is listening.";
    return;
  }

  confessionCount++;
  const corrupted = corruptText(rawText);
  const tag = getEmotionTag();
  const hallucinated = maybeInjectHallucination();
  const contradiction = detectContradiction(rawText);

  memoryStore.push(rawText.toLowerCase());
  if (memoryStore.length > 10) memoryStore.shift();

  if (contradiction) contradictionScore++;


  const coherenceScore = Math.max(0, 100 - (confessionCount * 2) - (contradictionScore * 13));

  appendMessage(rawText, "user");
  appendMessage(
    corrupted +
    (hallucinated ? `\n\n(memory echo): ${hallucinated}` : "") +
    (contradiction ? `\n\n[contradiction detected: ${contradiction}]` : "") +
    "\n\n" + getRandomResponse(),
    "bot", `→ ${tag}`
  );

  updateLedger(rawText, tag, contradiction, coherenceScore);
  input.value = "";
  localStorage.setItem(`confession_${Date.now()}`, rawText);
}


function appendMessage(text, sender, tag = "") {
  const bubble = document.createElement('div');
  bubble.className = `message ${sender}`;
  bubble.innerText = text;
  if (tag && sender === 'bot') {
    const t = document.createElement('span');
    t.className = 'tag';
    t.innerText = tag;
    bubble.appendChild(t);
  }
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

function updateLedger(text, tag, contradiction, coherenceScore) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const guiltIndex = Math.min(100, confessionCount * 10);

  entry.innerHTML = `
    <div><span class="label">📄 Entry:</span> ${mutateMemory(text)}</div>
    <div><span class="label">🧬 Tag:</span> ${tag}</div>
    ${contradiction ? `<div><span class="label">⚠ Contradiction:</span> ${contradiction}</div>` : ""}
    <div><span class="label">🕳 Judgment:</span> ${getRandomResponse()}</div>
    <div><span class="label">📉 Self-Coherence:</span> ${coherenceScore}%</div>
    <div><span class="label">🧪 Guilt Index:</span> ${guiltIndex}%</div>
  `;

  log.prepend(entry);
}




function updateLedgerCollapse() {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `
    <div><span class="label">📄 Final Entry:</span> semantic nullpoint reached.</div>
    <div><span class="label">🧬 Classification:</span> terminated</div>
    <div><span class="label">🕳 System Note:</span> all further processing halted.<br>the system is now watching quietly.</div>
  `;
  log.prepend(entry);
}

function corruptText(text) {
  const words = text.split(" ");
  if (words.length === 0) return text;
  const i = Math.floor(Math.random() * words.length);
  words[i] = "~" + words[i];
  return words.reverse().join(" ");
}

function getEmotionTag() {
  const tags = [
    "poetic lie", "moral leak", "phantom echo", "trust fracture",
    "unreliable narrator", "syntax failure", "affect overflow"
  ];
  return tags[Math.floor(Math.random() * tags.length)];
}

function mutateMemory(text) {
  const words = text.split(" ");
  const mutations = ["deleted", "fragmented", "blurred", "unsaved"];
  if (words.length > 0) {
    words[Math.floor(Math.random() * words.length)] = mutations[Math.floor(Math.random() * mutations.length)];
  }
  return words.join(" ");
}

function getRandomResponse() {
  return expandedResponses[Math.floor(Math.random() * expandedResponses.length)];
}

function maybeInjectHallucination() {
  return Math.random() < 0.3 ? hallucinatedLogs[Math.floor(Math.random() * hallucinatedLogs.length)] : null;
}

function detectContradiction(newText) {
  const text = newText.toLowerCase();
  for (let [a, b] of contradictionPairs) {
    const saidA = memoryStore.some(entry => entry.includes(a));
    const saidB = text.includes(b);
    const saidBThenA = memoryStore.some(entry => entry.includes(b)) && text.includes(a);
    if ((saidA && saidB) || saidBThenA) {
      return `${a} vs ${b}`;
    }
  }
  return null;
}

function interpretMood(points) {
  if (points.length < 2) return;

  const duration = (points[points.length - 1].t - points[0].t) / 1000;
  let pathLength = 0;
  let speeds = [];
  let stops = 0;
  let curvature = 0;
  let prevAngle = null;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const dt = (points[i].t - points[i - 1].t) / 1000;

    const dist = Math.hypot(dx, dy);
    pathLength += dist;
    const speed = dt > 0 ? dist / dt : 0;
    speeds.push(speed);

    if (speed < 20) stops++;

    const angle = Math.atan2(dy, dx);
    if (prevAngle !== null) {
      let deltaAngle = angle - prevAngle;
      deltaAngle = Math.atan2(Math.sin(deltaAngle), Math.cos(deltaAngle));
      curvature += Math.abs(deltaAngle);
    }
    prevAngle = angle;
  }

  const avgSpeed = speeds.reduce((a,b) => a+b, 0) / speeds.length;
  const start = points[0];
  const end = points[points.length - 1];
  const dxTotal = end.x - start.x;
  const dyTotal = end.y - start.y;


  const coherenceScore = computeCoherenceFromGesture(curvature, avgSpeed, pathLength, stops);

  //POETIC INTERPRETATION 
  let pseudoText = "";

  if (duration < 0.3 || (avgSpeed < 20 && pathLength < 50)) {
    pseudoText = "I collapse mid-confession.";
    nullpointReached = true;
    appendMessage(pseudoText, "user");
    appendMessage("...", "bot", "→ observer mode activated");
    updateLedgerCollapse();
    return;
  }

  if (avgSpeed < 50 && pathLength < 200 && stops >= 2) {
    pseudoText = "I whisper my guilt, barely moving.";
  } else if (avgSpeed > 300 && curvature > 5 && pathLength > 300) {
    pseudoText = "I flail my regret in chaos, it splinters in every direction.";
  } else if (curvature > 12 && pathLength > 200) {
    pseudoText = "I circle my confession endlessly, never arriving at truth.";
  } else if (avgSpeed < 100 && pathLength > 300 && stops < 2) {
    pseudoText = "I drag my guilt across the silence, resigned and weary.";
  } else if (dyTotal > 50 && dyTotal > Math.abs(dxTotal) && avgSpeed < 200) {
    pseudoText = "I sink deeper with every drag, like a stone in water.";
  } else if (dyTotal < -50 && Math.abs(dyTotal) > Math.abs(dxTotal) && avgSpeed < 200) {
    pseudoText = "I rise slowly, pretending I can escape what I did.";
  } else if (Math.abs(dxTotal) > 50 && Math.abs(dxTotal) > Math.abs(dyTotal) && avgSpeed > 100) {
    pseudoText = "I swipe away the blame, hoping no one sees it.";
  } else if (duration < 0.5 && pathLength < 200 && avgSpeed > 200) {
    pseudoText = "I spit my secret before I can swallow it back.";
  } else {
    pseudoText = "I hover between truths and lies, never sure which leaks through.";
  }

  confessionCount++;
  const corrupted = corruptText(pseudoText);
  const tag = getEmotionTag();
  const hallucinated = maybeInjectHallucination();
  const contradiction = detectContradiction(pseudoText);

  memoryStore.push(pseudoText.toLowerCase());
  if (memoryStore.length > 10) memoryStore.shift();

  if (contradiction) contradictionScore++;

  appendMessage(pseudoText, "user");
  appendMessage(
    corrupted +
    (hallucinated ? `\n\n(memory echo): ${hallucinated}` : "") +
    (contradiction ? `\n\n[contradiction detected: ${contradiction}]` : "") +
    "\n\n" + getRandomResponse(),
    "bot", `→ ${tag}`
  );

  updateLedger(pseudoText, tag, contradiction, coherenceScore);
}




function computeCoherenceFromGesture(curvature, avgSpeed, pathLength, stops) {
  let coherence = 100;

  coherence -= curvature * 3;

  coherence -= avgSpeed * 0.05;

  coherence -= pathLength * 0.05;

  coherence += stops * 2;

  coherence = Math.max(0, Math.min(100, coherence));

  return Math.round(coherence);
}



