const tg = window.Telegram?.WebApp;
const COOLDOWN_MS = 2 * 60 * 60 * 1000;

const floors = {
  1: {
    title: "Kohne Tunel 1F",
    bg: ["main", "roots", "wide"],
    start: { x: 1, y: 1, dir: 1 },
    maze: [
      "#########",
      "#P..#...#",
      "#.#.#.#M#",
      "#.#...#.#",
      "#.###.#.#",
      "#...#...#",
      "###.#.###",
      "#M..#..S#",
      "#########",
    ],
    monsters: [
      { id: "f1-rat", name: "Tunel sicani", x: 7, y: 2, image: "assets/caves/monster.png", reward: { metal: 1, cloth: 1, partsChance: 0.18 } },
      { id: "f1-guard", name: "Qaya qoruyani", x: 1, y: 7, image: "assets/caves/monster.png", reward: { metal: 2, cloth: 0, partsChance: 0.34 } },
    ],
    chests: [],
  },
  2: {
    title: "Kohne Tunel 2F",
    bg: ["floor2", "wide", "roots"],
    start: { x: 1, y: 1, dir: 1 },
    maze: [
      "#############",
      "#P....#.....#",
      "#.##M.#.###.#",
      "#.#...#...#C#",
      "#.#.#####.#.#",
      "#...#M....#.#",
      "###.#.#####.#",
      "#C..#.....M.#",
      "#.#######.#.#",
      "#.....M...#E#",
      "#############",
    ],
    monsters: [
      { id: "f2-brute", name: "Kristal qaya devi", x: 4, y: 2, image: "assets/caves/monster2.png", reward: { metal: 2, cloth: 1, partsChance: 0.45 } },
      { id: "f2-watcher", name: "Dərinlik gozcu", x: 5, y: 5, image: "assets/caves/monster2.png", reward: { metal: 1, cloth: 2, partsChance: 0.38 } },
      { id: "f2-crusher", name: "Demir caynaq", x: 10, y: 7, image: "assets/caves/monster2.png", reward: { metal: 3, cloth: 0, partsChance: 0.52 } },
      { id: "f2-warden", name: "Tunel bascisi", x: 6, y: 9, image: "assets/caves/monster2.png", reward: { metal: 3, cloth: 2, partsChance: 0.68 } },
    ],
    chests: [
      { id: "f2-chest-a", x: 11, y: 3, reward: { metal: 2, cloth: 2, parts: 1 } },
      { id: "f2-chest-b", x: 1, y: 7, reward: { metal: 1, cloth: 3, parts: 1 } },
    ],
  },
};

let pos = { x: 1, y: 1, dir: 1, floor: 1 };

const els = {
  picture: document.querySelector("#cavePicture"),
  fallback: document.querySelector("#caveFallback"),
  monsterImage: document.querySelector("#caveMonsterImage"),
  chestImage: document.querySelector("#caveChestImage"),
  mini: document.querySelector("#miniMap"),
  info: document.querySelector("#caveInfo"),
  title: document.querySelector("#caveTitle"),
  exit: document.querySelector("#caveExit"),
  panel: document.querySelector("#monsterPanel"),
  panelName: document.querySelector("#monsterName"),
  panelMeta: document.querySelector("#monsterMeta"),
  action: document.querySelector("#attackMonster"),
};

function floorData() {
  return floors[pos.floor] || floors[1];
}

function maze() {
  return floorData().maze;
}

function loadCaveState() {
  try {
    return JSON.parse(localStorage.getItem("avtoritet-cave-state")) || {};
  } catch {
    return {};
  }
}

function saveCaveState(extra = {}) {
  const prev = loadCaveState();
  localStorage.setItem("avtoritet-cave-state", JSON.stringify({ ...prev, x: pos.x, y: pos.y, dir: pos.dir, floor: pos.floor, ...extra }));
}

function setCooldown() {
  localStorage.setItem("avtoritet-cave-cooldown", String(Date.now() + COOLDOWN_MS));
}

function restoreCave() {
  const cooldownUntil = Number(localStorage.getItem("avtoritet-cave-cooldown") || 0);
  if (cooldownUntil > Date.now()) {
    window.location.href = "caves.html";
    return;
  }
  const saved = loadCaveState();
  if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    pos = { x: saved.x, y: saved.y, dir: saved.dir || 1, floor: saved.floor || 1 };
  }
  const result = localStorage.getItem("avtoritet-cave-battle-result");
  const encounter = JSON.parse(localStorage.getItem("avtoritet-cave-encounter") || "null");
  if (result === "win" && encounter) {
    applyReward(encounter.reward || {});
    const state = loadCaveState();
    const killed = [...new Set([...(state.killed || []), encounter.monsterId])];
    saveCaveState({ killed });
  }
  if (result === "lose") {
    setCooldown();
    localStorage.removeItem("avtoritet-cave-battle-result");
    localStorage.removeItem("avtoritet-cave-encounter");
    window.location.href = "caves.html";
    return;
  }
  localStorage.removeItem("avtoritet-cave-battle-result");
  localStorage.removeItem("avtoritet-cave-encounter");
}

function applyReward(reward) {
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem("avtoritet-state")) || {};
  } catch {
    state = {};
  }
  state.metal = (state.metal || 0) + (reward.metal || 0);
  state.cloth = (state.cloth || 0) + (reward.cloth || 0);
  state.parts = (state.parts || 0) + (reward.parts || 0);
  localStorage.setItem("avtoritet-state", JSON.stringify(state));
  els.info.textContent = `Drop: metal +${reward.metal || 0}, parca +${reward.cloth || 0}, detal +${reward.parts || 0}`;
}

function isWall(x, y) {
  return maze()[y]?.[x] === "#";
}

function nextCell() {
  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  const delta = dirs[pos.dir];
  return { x: pos.x + delta.x, y: pos.y + delta.y };
}

function aliveMonsters() {
  const killed = loadCaveState().killed || [];
  return floorData().monsters.filter((monster) => !killed.includes(monster.id));
}

function closedChests() {
  const opened = loadCaveState().openedChests || [];
  return floorData().chests.filter((chest) => !opened.includes(chest.id));
}

function thingAhead() {
  const next = nextCell();
  const monster = aliveMonsters().find((item) => item.x === next.x && item.y === next.y);
  if (monster) return { type: "monster", item: monster };
  const chest = closedChests().find((item) => item.x === next.x && item.y === next.y);
  if (chest) return { type: "chest", item: chest };
  if (maze()[next.y]?.[next.x] === "S") return { type: "stairs", item: { name: "2-ci mertebeye enis" } };
  return null;
}

function sceneClass() {
  const front = nextCell();
  const leftDir = (pos.dir + 3) % 4;
  const rightDir = (pos.dir + 1) % 4;
  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  const left = { x: pos.x + dirs[leftDir].x, y: pos.y + dirs[leftDir].y };
  const right = { x: pos.x + dirs[rightDir].x, y: pos.y + dirs[rightDir].y };
  return [
    "cave-picture",
    `variant-${sceneVariant(front)}`,
    isWall(front.x, front.y) ? "front-wall" : "front-open",
    isWall(left.x, left.y) ? "left-wall" : "left-open",
    isWall(right.x, right.y) ? "right-wall" : "right-open",
  ].join(" ");
}

function sceneVariant(front) {
  if (isWall(front.x, front.y)) return "deadend";
  if (pos.floor === 2) return floorData().bg[(pos.x + pos.y + pos.dir) % floorData().bg.length];
  return ["main", "roots", "wide"][(pos.x + pos.y + pos.dir) % 3];
}

function renderScene() {
  els.fallback.hidden = true;
  els.title.textContent = floorData().title;
  els.picture.className = sceneClass();
  const ahead = thingAhead();
  els.panel.hidden = !ahead;
  els.monsterImage.hidden = true;
  els.chestImage.hidden = true;
  if (ahead?.type === "monster") {
    els.monsterImage.src = ahead.item.image;
    els.monsterImage.hidden = false;
    els.panelName.textContent = ahead.item.name;
    els.panelMeta.textContent = "Qarsindadir. Hucum et.";
    els.action.textContent = "Hucum et";
  }
  if (ahead?.type === "chest") {
    els.chestImage.hidden = false;
    els.panelName.textContent = "Sandıq";
    els.panelMeta.textContent = "Material ola biler.";
    els.action.textContent = "Ac";
  }
  if (ahead?.type === "stairs") {
    els.panelName.textContent = "Enis";
    els.panelMeta.textContent = "2-ci mertebe daha boyuk ve tehlukelidir.";
    els.action.textContent = "Dus";
  }
  drawMiniMap();
  saveCaveState();
}

function drawMiniMap() {
  const ctx = els.mini.getContext("2d");
  const data = maze();
  const cols = data[0].length;
  const rows = data.length;
  const size = Math.min(els.mini.width / cols, els.mini.height / rows);
  ctx.clearRect(0, 0, els.mini.width, els.mini.height);
  data.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      ctx.fillStyle = cell === "#" ? "#1b1f21" : cell === "S" ? "#315b75" : "#504131";
      ctx.fillRect(x * size, y * size, size - 1, size - 1);
    });
  });
  aliveMonsters().forEach((m) => {
    ctx.fillStyle = "#ef6351";
    ctx.beginPath();
    ctx.arc((m.x + 0.5) * size, (m.y + 0.5) * size, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  });
  closedChests().forEach((c) => {
    ctx.fillStyle = "#f5b83d";
    ctx.fillRect((c.x + 0.25) * size, (c.y + 0.25) * size, size * 0.5, size * 0.5);
  });
  const cx = (pos.x + 0.5) * size;
  const cy = (pos.y + 0.5) * size;
  const r = size * 0.42;
  const angle = [-Math.PI / 2, 0, Math.PI / 2, Math.PI][pos.dir];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = "#f5b83d";
  ctx.strokeStyle = "#070809";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(-r * 0.7, -r * 0.62);
  ctx.lineTo(-r * 0.35, 0);
  ctx.lineTo(-r * 0.7, r * 0.62);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function moveForward() {
  const next = nextCell();
  if (isWall(next.x, next.y) || thingAhead()) return;
  pos.x = next.x;
  pos.y = next.y;
  renderScene();
}

function turn(side) {
  pos.dir = (pos.dir + Number(side) + 4) % 4;
  renderScene();
}

function openChest(chest) {
  applyReward(chest.reward);
  const state = loadCaveState();
  saveCaveState({ openedChests: [...new Set([...(state.openedChests || []), chest.id])] });
  renderScene();
}

function goDownstairs() {
  const start = floors[2].start;
  pos = { ...start, floor: 2 };
  saveCaveState();
  els.info.textContent = "2-ci mertebe";
  renderScene();
}

function attackMonster(monster) {
  const reward = {
    metal: monster.reward.metal || 0,
    cloth: monster.reward.cloth || 0,
    parts: Math.random() < monster.reward.partsChance ? 1 : 0,
  };
  localStorage.setItem("avtoritet-cave-encounter", JSON.stringify({ monsterId: monster.id, reward }));
  localStorage.setItem("avtoritet-battle-return", "cave.html");
  localStorage.setItem("avtoritet-battle-name", monster.name);
  localStorage.setItem("avtoritet-battle-rival-image", monster.image);
  localStorage.setItem("avtoritet-battle-floor", String(pos.floor));
  window.location.href = "battle.html?from=cave";
}

function handleAction() {
  const ahead = thingAhead();
  if (!ahead) return;
  if (ahead.type === "monster") attackMonster(ahead.item);
  if (ahead.type === "chest") openChest(ahead.item);
  if (ahead.type === "stairs") goDownstairs();
}

document.addEventListener("click", (event) => {
  const move = event.target.closest("[data-move]");
  const turnButton = event.target.closest("[data-turn]");
  if (move) moveForward();
  if (turnButton) turn(turnButton.dataset.turn);
});

els.action.addEventListener("click", handleAction);
els.exit.addEventListener("click", () => setCooldown());
tg?.ready?.();
tg?.expand?.();
restoreCave();
renderScene();
