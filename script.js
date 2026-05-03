const effectItems = [
  {
    label: "OP",
    file: "op.mp3",
    color: { hi: "#c86bff", mid: "#8d21f7", low: "#4c0d98", rim: "#5a12a9" },
  },
  {
    label: "Uh",
    file: "Uh.mp3",
    color: { hi: "#66d6ff", mid: "#1da8eb", low: "#0e4f9f", rim: "#0d5ab1" },
  },
  {
    label: "Daam",
    file: "daam.mp3",
    color: { hi: "#74f7bf", mid: "#23c786", low: "#11805f", rim: "#129164" },
  },
  {
    label: "Daam Girl",
    file: "daamGirl.mp3",
    color: { hi: "#ffd36f", mid: "#f3a91f", low: "#a55f0d", rim: "#b96a0f" },
  },
  {
    label: "강남",
    file: "gangnam.mp3",
    color: { hi: "#ff8da8", mid: "#f54c7a", low: "#9a1f48", rim: "#aa2750" },
  },
  {
    label: "인간",
    file: "ingan.mp3",
    color: { hi: "#b0ff70", mid: "#67c726", low: "#397d14", rim: "#448f18" },
  },
  {
    label: "사나에",
    file: "sanaye.mp3",
    color: { hi: "#ffb178", mid: "#ef7430", low: "#9f3c12", rim: "#b64a18" },
  },
  {
    label: "예~",
    file: "yeahyeah.mp3",
    color: { hi: "#9fb4ff", mid: "#5d78f0", low: "#2f3f9d", rim: "#384ab0" },
  },
  {
    label: "여자",
    file: "yeoja.mp3",
    color: { hi: "#ff8ef2", mid: "#dc4bc9", low: "#862174", rim: "#982683" },
  },
];

const soundGrid = document.getElementById("soundGrid");
const comboSourceGrid = document.getElementById("comboSourceGrid");
const sequenceList = document.getElementById("sequenceList");
const comboNameInput = document.getElementById("comboName");
const saveComboButton = document.getElementById("saveComboButton");
const comboList = document.getElementById("comboList");
const globalSpeedSelect = document.getElementById("globalSpeedSelect");
const referenceModal = document.getElementById("referenceModal");
const closeModalButton = document.getElementById("closeModalButton");
const hideModalToggle = document.getElementById("hideModalToggle");
const referenceEmbed = document.querySelector(".modal-embed");

const activeMedia = new Map();
const currentSequence = [];
const STORAGE_KEY = "pangil_meme_combos_v1";
const MODAL_HIDE_KEY = "pangil_hide_reference_modal_v1";
const GLOBAL_SPEED_KEY = "pangil_global_speed_v1";
const ALLOWED_SPEEDS = [1, 1.5, 2];
let combos = loadCombos();
const REFERENCE_EMBED_SRC = "https://www.instagram.com/reel/DWFip86CQ9k/embed";

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function loadCombos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load combos", err);
    return [];
  }
}

function saveCombos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
}

function playSingleEffect(file, button) {
  const src = `./effect/${file}`;

  if (activeMedia.has(file)) {
    const prev = activeMedia.get(file);
    prev.pause();
    prev.currentTime = 0;
  }

  const media = new Audio(src);
  activeMedia.set(file, media);

  if (button) {
    button.classList.add("is-pressed");
    setTimeout(() => button.classList.remove("is-pressed"), 110);
  }

  media.play().catch((err) => {
    console.error(`Failed to play ${src}`, err);
  });

  trackEvent("play_sound", { file });
}

function playOneAndWait(file, speed) {
  return new Promise((resolve) => {
    const media = new Audio(`./effect/${file}`);
    media.playbackRate = speed;

    const done = () => resolve();
    media.addEventListener("ended", done, { once: true });
    media.addEventListener("error", done, { once: true });

    media.play().catch(() => resolve());
  });
}

async function playComboSequence(files, speed) {
  for (const file of files) {
    await playOneAndWait(file, speed);
  }
}

function normalizeSpeed(value) {
  const num = Number(value);
  return ALLOWED_SPEEDS.includes(num) ? num : 1;
}

function loadGlobalSpeed() {
  return normalizeSpeed(localStorage.getItem(GLOBAL_SPEED_KEY) || "1");
}

function getComboSpeed(combo) {
  if (combo.speed === undefined || combo.speed === null) {
    return loadGlobalSpeed();
  }
  return normalizeSpeed(combo.speed);
}

function renderSoundButtons() {
  effectItems.forEach((effect) => {
    const item = document.createElement("div");
    item.className = "sound-item";

    const button = document.createElement("button");
    button.className = "sound-button";
    button.type = "button";

    button.style.setProperty("--btn-hi", effect.color.hi);
    button.style.setProperty("--btn-mid", effect.color.mid);
    button.style.setProperty("--btn-low", effect.color.low);
    button.style.setProperty("--btn-rim", effect.color.rim);

    button.title = `${effect.label} 소리 재생`;
    button.setAttribute("aria-label", `${effect.label} 소리 재생`);
    button.addEventListener("click", () => playSingleEffect(effect.file, button));

    const label = document.createElement("p");
    label.className = "sound-label";
    label.textContent = effect.label;

    item.appendChild(button);
    item.appendChild(label);
    soundGrid.appendChild(item);
  });
}

function renderComboSourceButtons() {
  comboSourceGrid.innerHTML = "";

  effectItems.forEach((effect) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-button";
    btn.textContent = effect.label;

    btn.addEventListener("click", () => {
      currentSequence.push(effect.file);
      playSingleEffect(effect.file);
      if (navigator.vibrate) navigator.vibrate(10);
      renderSequenceList();
    });

    comboSourceGrid.appendChild(btn);
  });
}

function moveSequenceItem(fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
  const moved = currentSequence.splice(fromIdx, 1)[0];
  currentSequence.splice(toIdx, 0, moved);
}

function renderSequenceList() {
  sequenceList.innerHTML = "";

  if (currentSequence.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sequence-empty";
    empty.textContent = "아직 추가된 사운드가 없습니다. 위 버튼을 눌러 순서를 쌓아보세요.";
    sequenceList.appendChild(empty);
    return;
  }

  currentSequence.forEach((file, index) => {
    const effect = effectItems.find((item) => item.file === file);
    const row = document.createElement("div");
    row.className = "sequence-item";
    row.draggable = true;
    row.dataset.index = String(index);

    const text = document.createElement("span");
    text.innerHTML = `<span class="sequence-index">${index + 1}.</span> ${effect ? effect.label : file}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "sequence-remove";
    removeBtn.textContent = "삭제";
    removeBtn.addEventListener("click", () => {
      currentSequence.splice(index, 1);
      renderSequenceList();
    });

    row.addEventListener("dragstart", () => {
      row.classList.add("dragging");
      if (navigator.vibrate) navigator.vibrate(15);
    });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("dragenter", () => row.classList.add("over"));
    row.addEventListener("dragleave", () => row.classList.remove("over"));
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("over");
      const draggingEl = sequenceList.querySelector(".sequence-item.dragging");
      if (!draggingEl) return;
      const fromIdx = Number(draggingEl.dataset.index);
      const toIdx = Number(row.dataset.index);
      moveSequenceItem(fromIdx, toIdx);
      if (navigator.vibrate) navigator.vibrate([8, 20, 8]);
      renderSequenceList();
    });

    row.appendChild(text);
    row.appendChild(removeBtn);
    sequenceList.appendChild(row);
  });
}

function deleteCombo(id) {
  combos = combos.filter((combo) => combo.id !== id);
  saveCombos();
  renderComboList();
}

function renderComboList() {
  comboList.innerHTML = "";

  if (combos.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "저장된 콤보가 없습니다.";
    comboList.appendChild(empty);
    return;
  }

  combos.forEach((combo) => {
    const row = document.createElement("div");
    row.className = "combo-item";

    const speedSelect = document.createElement("select");
    speedSelect.className = "speed-select combo-speed-select";
    [1, 1.5, 2].forEach((speed) => {
      const opt = document.createElement("option");
      opt.value = String(speed);
      opt.textContent = `x${speed}`;
      speedSelect.appendChild(opt);
    });
    speedSelect.value = String(getComboSpeed(combo));
    speedSelect.addEventListener("change", () => {
      combo.speed = normalizeSpeed(speedSelect.value);
      saveCombos();
    });

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "combo-play";
    playBtn.textContent = `${combo.name} (${combo.files.length}개)`;
    playBtn.addEventListener("click", () => {
      const speed = getComboSpeed(combo);
      playComboSequence(combo.files, speed);
      trackEvent("play_combo", {
        combo_name: combo.name,
        sound_count: combo.files.length,
        speed,
      });
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "combo-delete";
    delBtn.textContent = "삭제";
    delBtn.addEventListener("click", () => deleteCombo(combo.id));

    row.appendChild(speedSelect);
    row.appendChild(playBtn);
    row.appendChild(delBtn);
    comboList.appendChild(row);
  });
}

function saveCombo() {
  const name = comboNameInput.value.trim();

  if (!name) {
    alert("콤보 이름을 입력해 주세요.");
    return;
  }

  if (currentSequence.length === 0) {
    alert("콤보에 넣을 사운드를 1개 이상 선택해 주세요.");
    return;
  }

  combos.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    files: [...currentSequence],
    speed: loadGlobalSpeed(),
  });

  saveCombos();
  trackEvent("save_combo", {
    combo_name: name,
    sound_count: currentSequence.length,
    speed: loadGlobalSpeed(),
  });
  comboNameInput.value = "";
  currentSequence.length = 0;
  renderSequenceList();
  renderComboList();
}

saveComboButton.addEventListener("click", saveCombo);
globalSpeedSelect.addEventListener("change", () => {
  const speed = normalizeSpeed(globalSpeedSelect.value);
  localStorage.setItem(GLOBAL_SPEED_KEY, String(speed));
});

function openReferenceModal() {
  if (referenceEmbed && !referenceEmbed.src) {
    referenceEmbed.src = REFERENCE_EMBED_SRC;
  }
  referenceModal.hidden = false;
}

function closeReferenceModal() {
  if (hideModalToggle.checked) {
    localStorage.setItem(MODAL_HIDE_KEY, "1");
  }
  referenceModal.hidden = true;
  if (referenceEmbed) {
    referenceEmbed.src = "";
  }
}

function initializeReferenceModal() {
  const hidePref = localStorage.getItem(MODAL_HIDE_KEY);
  if (hidePref !== "1") {
    openReferenceModal();
  }

  closeModalButton.addEventListener("click", closeReferenceModal);
  referenceModal.addEventListener("click", (event) => {
    if (event.target === referenceModal) {
      closeReferenceModal();
    }
  });
}

renderSoundButtons();
renderComboSourceButtons();
renderSequenceList();
globalSpeedSelect.value = String(loadGlobalSpeed());
renderComboList();
initializeReferenceModal();
