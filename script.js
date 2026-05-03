const effectItems = [
  {
    label: "OP",
    file: "op.mp3",
    color: {
      hi: "#c86bff",
      mid: "#8d21f7",
      low: "#4c0d98",
      rim: "#5a12a9",
    },
  },
  {
    label: "Uh",
    file: "Uh.mp3",
    color: {
      hi: "#66d6ff",
      mid: "#1da8eb",
      low: "#0e4f9f",
      rim: "#0d5ab1",
    },
  },
  {
    label: "Daam",
    file: "daam.mp3",
    color: {
      hi: "#74f7bf",
      mid: "#23c786",
      low: "#11805f",
      rim: "#129164",
    },
  },
  {
    label: "Daam Girl",
    file: "daamGirl.mp3",
    color: {
      hi: "#ffd36f",
      mid: "#f3a91f",
      low: "#a55f0d",
      rim: "#b96a0f",
    },
  },
  {
    label: "강남",
    file: "gangnam.mp3",
    color: {
      hi: "#ff8da8",
      mid: "#f54c7a",
      low: "#9a1f48",
      rim: "#aa2750",
    },
  },
  {
    label: "인간",
    file: "ingan.mp3",
    color: {
      hi: "#b0ff70",
      mid: "#67c726",
      low: "#397d14",
      rim: "#448f18",
    },
  },
  {
    label: "사나에",
    file: "sanaye.mp3",
    color: {
      hi: "#ffb178",
      mid: "#ef7430",
      low: "#9f3c12",
      rim: "#b64a18",
    },
  },
  {
    label: "예~",
    file: "yeahyeah.mp3",
    color: {
      hi: "#9fb4ff",
      mid: "#5d78f0",
      low: "#2f3f9d",
      rim: "#384ab0",
    },
  },
  {
    label: "여자",
    file: "yeoja.mp3",
    color: {
      hi: "#ff8ef2",
      mid: "#dc4bc9",
      low: "#862174",
      rim: "#982683",
    },
  },
];

const soundGrid = document.getElementById("soundGrid");
const activeMedia = new Map();

function playEffect(file, button) {
  const src = `./effect/${file}`;

  if (activeMedia.has(file)) {
    const prev = activeMedia.get(file);
    prev.pause();
    prev.currentTime = 0;
  }

  const media = new Audio(src);
  activeMedia.set(file, media);

  button.classList.add("is-pressed");
  setTimeout(() => button.classList.remove("is-pressed"), 110);

  media.play().catch((err) => {
    console.error(`Failed to play ${src}`, err);
  });
}

effectItems.forEach((effect) => {
  const item = document.createElement("div");
  item.className = "sound-item";

  const button = document.createElement("button");
  button.className = "sound-button";
  button.type = "button";
  const theme = effect.color;
  button.style.setProperty("--btn-hi", theme.hi);
  button.style.setProperty("--btn-mid", theme.mid);
  button.style.setProperty("--btn-low", theme.low);
  button.style.setProperty("--btn-rim", theme.rim);
  button.title = `${effect.label} 소리 재생`;
  button.setAttribute("aria-label", `${effect.label} 소리 재생`);
  button.addEventListener("click", () => playEffect(effect.file, button));

  const label = document.createElement("p");
  label.className = "sound-label";
  label.textContent = effect.label;

  item.appendChild(button);
  item.appendChild(label);
  soundGrid.appendChild(item);
});
