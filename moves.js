const tg = window.Telegram?.WebApp;

const ranks = [
  { min: 0, title: "Kuce usagi" },
  { min: 120, title: "Mehelle adami" },
  { min: 320, title: "Rayon sozu" },
  { min: 720, title: "Baki avtoriteti" },
  { min: 1300, title: "Seher efsanesi" },
];

const defaultState = {
  authority: 55,
  level: 1,
  energy: 80,
  maxEnergy: 100,
  equipment: {},
  selectedMoves: [],
  appearance: "appearance-01",
};

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

function currentRank(state) {
  return ranks.reduce((best, rank) => (state.authority >= rank.min ? rank : best), ranks[0]);
}

function playerDisplayName() {
  return tg?.initDataUnsafe?.user?.first_name || "Kuce Oyuncusu";
}

function appearancePath(state) {
  return `assets/appearances/${state.appearance || "appearance-01"}.png`;
}

function reqText(req = {}) {
  const parts = [];
  if (req.hits) parts.push(`${req.hits} adi`);
  if (req.crits) parts.push(`${req.crits} krit`);
  if (req.dodges) parts.push(`${req.dodges} uvorot`);
  if (req.rage) parts.push(`${req.rage} yaris`);
  if (req.mana) parts.push(`${req.mana} mana`);
  return parts.join(" / ") || "Aciq";
}

function classReason(state, classId) {
  const counts = {};
  Object.values(state.equipment || {}).forEach((id) => {
    const match = /^(guc|krit|tank|uvorot|mag)-/.exec(id || "");
    if (match) counts[match[1]] = (counts[match[1]] || 0) + 1;
  });
  const amount = counts[classId] || 0;
  return amount ? `${moveClasses[classId].name} geyimi: ${amount}` : "Geyim yoxdur: Guc default";
}

function render() {
  const state = loadState();
  const classId = classFromEquipment(state.equipment || {});
  const selected = selectedMoveIds(state);
  const classMoves = moveList.filter((move) => move.classId === classId);
  const isFull = selected.length >= 4;

  document.querySelector("#moveName").textContent = playerDisplayName();
  document.querySelector("#moveRank").textContent = `${currentRank(state).title} / ${moveClasses[classId].name}`;
  document.querySelector("#moveAvatar").src = appearancePath(state);
  document.querySelector("#moveXpText").textContent = `Sinif: ${classReason(state, classId)}`;
  document.querySelector("#moveXpLeft").textContent = `${selected.length}/4`;
  document.querySelector("#moveXpBar").style.width = `${Math.min(100, selected.length * 25)}%`;

  document.querySelector("#moveGrid").innerHTML = classMoves
    .map((move) => {
      const isSelected = selected.includes(move.id);
      return `
        <button class="move-pick ${isSelected ? "is-selected" : ""}" type="button" data-move-id="${move.id}">
          <span class="move-art" style="background-image:url('${move.icon}')"></span>
          <strong>${move.name}</strong>
          <small>${isSelected ? "Secilib" : isFull ? "Evezle" : reqText(move.req)}</small>
          <p>${move.desc}</p>
          <em>anti ${move.anti.toUpperCase()}</em>
        </button>
      `;
    })
    .join("");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-move-id]");
  if (!button) return;
  const state = loadState();
  const move = moveById(button.dataset.moveId);
  const classId = classFromEquipment(state.equipment || {});
  if (move.classId !== classId) return;
  const selected = selectedMoveIds(state);
  const exists = selected.includes(move.id);
  const next = exists
    ? selected.filter((id) => id !== move.id)
    : selected.length >= 4
      ? [...selected.slice(0, 3), move.id]
      : [...selected, move.id];
  state.selectedMoves = next;
  state.movesTouched = true;
  saveState(state);
  render();
});

tg?.ready?.();
tg?.expand?.();
render();
