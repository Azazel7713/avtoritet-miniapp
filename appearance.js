const tg = window.Telegram?.WebApp;

const defaultState = {
  authority: 55,
  level: 1,
  xp: 0,
  cash: 120,
  energy: 80,
  maxEnergy: 100,
  power: 34,
  metal: 4,
  cloth: 3,
  parts: 2,
  wins: 0,
  losses: 0,
  referrals: 0,
  equipment: {},
  appearance: "appearance-01",
};

const names = [
  "Qızıl küçə",
  "Dəri gecə",
  "Ağ prestij",
  "Qaraj stili",
  "Qapı qoruyan",
  "Bazar bossu",
  "Retro dəstə",
  "Biker kral",
  "Taktik qara",
  "Ağ kostyum",
  "Neon kapüşon",
  "Qırmızı bomber",
  "Arena çempionu",
  "Denim küçə",
  "Qara palto",
];

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("avtoritet-state")) };
  } catch {
    return { ...defaultState };
  }
}

function saveState(state) {
  localStorage.setItem("avtoritet-state", JSON.stringify(state));
}

function render() {
  const state = loadState();
  document.querySelector("#appearanceGrid").innerHTML = names
    .map((name, index) => {
      const id = `appearance-${String(index + 1).padStart(2, "0")}`;
      const active = state.appearance === id ? "is-selected" : "";
      return `<button class="appearance-card ${active}" type="button" data-appearance="${id}">
        <img src="assets/appearances/${id}.png" alt="" />
        <span>${name}</span>
      </button>`;
    })
    .join("");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-appearance]");
  if (!button) return;
  const state = loadState();
  state.appearance = button.dataset.appearance;
  saveState(state);
  tg?.HapticFeedback?.notificationOccurred("success");
  render();
});

tg?.ready?.();
tg?.expand?.();
render();
