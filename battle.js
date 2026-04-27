const tg = window.Telegram?.WebApp;

const levelThresholds = [0, 500, 1200, 2500, 5000, 12500, 30000, 300000, 500000, 1000000, 1500000, 2500000, 3500000, 4500000, 5500000];
const actionNames = {
  strike: "Adi zerbe",
  heavy: "Guclu zerbe",
  guard: "Blok",
  quick: "Uvorot",
  crush: "Sokurucu",
  special: "Xususi hucum",
};

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
  bag: [],
  appearance: "appearance-01",
};

let state = loadState();
let bot = botForLevel(levelFromAuthority(state.authority));
let battle = freshBattle();
let selectedAction = "";
let turnTimer = null;
let turnSeconds = 30;
let redirectTimer = null;

let scene;
let camera;
let renderer;
let THREE;
let playerMesh;
let rivalMesh;
let arenaBackdrop;
let particles = [];
let threeReady = false;

const els = {
  canvas: document.querySelector("#arenaCanvas"),
  fallback: document.querySelector("#arenaFallback"),
  playerStandee: document.querySelector(".player-standee"),
  rivalStandee: document.querySelector("#rivalStandee"),
  energy: document.querySelector("#arenaEnergy"),
  modePanel: document.querySelector("#modePanel"),
  botPreviewName: document.querySelector("#botPreviewName"),
  botPreviewMeta: document.querySelector("#botPreviewMeta"),
  combatFloat: document.querySelector("#combatFloat"),
  playerHpText: document.querySelector("#playerHpText"),
  playerManaText: document.querySelector("#playerManaText"),
  rivalManaText: document.querySelector("#rivalManaText"),
  rivalHpText: document.querySelector("#rivalHpText"),
  playerHpBar: document.querySelector("#playerHpBar"),
  playerManaBar: document.querySelector("#playerManaBar"),
  rivalManaBar: document.querySelector("#rivalManaBar"),
  rivalHpBar: document.querySelector("#rivalHpBar"),
  hitCount: document.querySelector("#hitCount"),
  critCount: document.querySelector("#critCount"),
  dodgeCount: document.querySelector("#dodgeCount"),
  rageCount: document.querySelector("#rageCount"),
  rivalName: document.querySelector("#rivalName"),
  roundText: document.querySelector("#roundText"),
  timerText: document.querySelector("#timerText"),
  exchangeText: document.querySelector("#exchangeText"),
  battleLog: document.querySelector("#battleLog"),
  startButton: document.querySelector("#startButton"),
  autoButton: document.querySelector("#autoButton"),
};

function freshBattle() {
  return {
    active: false,
    resolving: false,
    round: 1,
    playerHp: 100,
    playerMaxHp: 100,
    playerMana: 80,
    playerMaxMana: 80,
    rivalHp: 80,
    rivalMaxHp: 80,
    rivalMana: 60,
    rivalMaxMana: 60,
    combo: { hits: 0, crits: 0, dodges: 0, rage: 0 },
  };
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("avtoritet-state")) };
  } catch {
    document.body.classList.add("no-three");
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem("avtoritet-state", JSON.stringify(state));
}

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function percent(value, max) {
  return `${clamp(Math.round((value / max) * 100), 0, 100)}%`;
}

function appearancePath() {
  return `assets/appearances/${state.appearance || "appearance-01"}.png`;
}

function rivalImagePath() {
  return localStorage.getItem("avtoritet-battle-rival-image") || "assets/rival.png";
}

function levelFromAuthority(authority) {
  let level = 1;
  levelThresholds.forEach((required, index) => {
    if (authority >= required) level = index + 1;
  });
  return Math.min(15, level);
}

function levelUp() {
  state.level = levelFromAuthority(state.authority);
  state.maxEnergy = Math.max(state.maxEnergy, 100 + (state.level - 1) * 8);
}

function botForLevel(level) {
  const names = [
    "Heyet doyuscusu",
    "Qaraj qoruyani",
    "Bazar qolu",
    "Gece reketi",
    "Arena qapicisi",
    "Rayon bossu",
    "Tunel bascisi",
    "Qara klub ustasi",
    "Bank muhafizi",
    "Kolge duelisti",
    "Demir kapitan",
    "Magara serkerdesi",
    "Seher ovcusu",
    "Qizil boss",
    "Baki efsanesi",
  ];
  const style = level % 5 === 0 ? "boss" : level % 3 === 0 ? "tank" : level % 2 === 0 ? "quick" : "balanced";
  return {
    level,
    style,
    name: names[level - 1] || `Bot ${level}`,
    hp: 92 + level * 18 + (style === "tank" ? 30 : 0),
    power: 22 + level * 6 + (style === "boss" ? 12 : 0),
    crit: 5 + level + (style === "quick" ? 5 : 0),
    dodge: 4 + Math.floor(level * 1.25) + (style === "quick" ? 8 : 0),
    armor: 4 + Math.floor(level * 1.5) + (style === "tank" ? 8 : 0),
    color: style === "boss" ? 0xf5b83d : style === "quick" ? 0x33d1a0 : style === "tank" ? 0x4a90e2 : 0xef6351,
  };
}

function playerStats() {
  const gearStats = equippedGearStats(state.equipment || {});
  const setBonus = fullSetBonus(state.equipment || {});
  const strength = state.power + (gearStats.strength || 0) + (setBonus.strength || 0);
  const agility = 10 + Math.floor(state.level * 1.6) + Math.floor(strength / 8) + (gearStats.agility || 0) + (setBonus.agility || 0);
  const crit = Math.min(60, 6 + Math.floor(state.level * 1.2) + Math.floor(state.authority / 180) + (gearStats.crit || 0) + (setBonus.crit || 0));
  const endurance = 110 + state.level * 12 + (gearStats.endurance || 0) + (setBonus.endurance || 0);
  const hp = endurance + (gearStats.hp || 0) + (setBonus.hp || 0);
  const intellect = 8 + Math.floor(state.level * 1.4) + Math.floor((state.parts + state.metal) / 3) + (gearStats.intellect || 0) + (setBonus.intellect || 0);
  return {
    strength,
    agility,
    crit,
    endurance,
    intellect,
    hp,
    mana: gearStats.mana || 0,
    physicalArmor: Math.min(42, Math.floor(endurance / 9)),
    magicArmor: Math.min(38, Math.floor(intellect / 3)),
    dodgeChance: Math.min(40, Math.floor(agility / 2.35) + (gearStats.dodge || 0)),
  };
}

function fullSetBonus(equipped) {
  const slots = ["helmet", "weapon", "offhand", "armor", "belt", "gloves", "leggings", "boots"];
  const metas = slots.map((slot) => /^(guc|krit|tank|uvorot|mag)-(helmet|weapon|offhand|armor|belt|gloves|leggings|boots)-(\d{2})$/.exec(equipped[slot] || ""));
  if (metas.some((meta) => !meta)) return {};
  const classId = metas[0][1];
  if (!metas.every((meta) => meta[1] === classId)) return {};
  const minLevel = Math.min(...metas.map((meta) => Number(meta[3])));
  const bonusValue = Math.max(2, Math.floor(minLevel / 2));
  return {
    guc: { strength: bonusValue + 4 },
    krit: { crit: bonusValue + 5 },
    tank: { endurance: bonusValue * 5 + 20 },
    uvorot: { agility: bonusValue + 4 },
    mag: { intellect: bonusValue + 5 },
  }[classId] || {};
}

function gearStatsFromId(itemId) {
  const match = /^(guc|krit|tank|uvorot|mag)-(helmet|weapon|offhand|armor|belt|gloves|leggings|boots)-(\d{2})$/.exec(itemId || "");
  if (!match) return {};
  const [, classId, slotId, levelText] = match;
  const level = Number(levelText);
  const slotBoost = { helmet: 1, weapon: 4, offhand: 2, armor: 3, belt: 2, gloves: 3, leggings: 2, boots: 2 }[slotId] || 1;
  const base = Math.max(1, Math.round(level * 0.8 + slotBoost));
  const hpBase = level * 4 + slotBoost * 3;
  const stats = {
    guc: { strength: base + 3, hp: Math.round(hpBase * 1.05) },
    krit: { crit: Math.max(2, Math.round(level * 0.65 + slotBoost)), strength: Math.max(1, Math.round(base / 2)), hp: Math.round(hpBase * 0.85) },
    tank: { endurance: base + 3, hp: level * 12 + slotBoost * 10 },
    uvorot: { agility: base + 2, dodge: Math.max(2, Math.round(level * 0.55 + slotBoost)), hp: Math.round(hpBase * 0.75) },
    mag: { intellect: base + 2, mana: level * 8 + slotBoost * 7, hp: Math.round(hpBase * 0.65) },
  };
  return stats[classId] || {};
}

function equippedGearStats(equipped) {
  return Object.values(equipped || {}).reduce((total, itemId) => {
    Object.entries(gearStatsFromId(itemId)).forEach(([key, value]) => {
      total[key] = (total[key] || 0) + value;
    });
    return total;
  }, {});
}

async function initThree() {
  try {
    THREE = await import("https://unpkg.com/three@0.162.0/build/three.module.js");
  } catch {
    els.fallback.innerHTML = "<strong>3D arena yuklenmedi</strong><span>Internet baglantisi olanda arena acilacaq.</span>";
    return;
  }

  threeReady = true;
  document.body.classList.add("three-ready");
  els.fallback.hidden = true;
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x101316, 8, 24);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
  camera.position.set(0, 4.4, 8.1);
  camera.lookAt(0, 1.45, 0);

  renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;

  scene.add(new THREE.HemisphereLight(0xdff7ff, 0x111111, 1.6));
  const key = new THREE.SpotLight(0xf5b83d, 18, 18, Math.PI / 5, 0.4, 1.2);
  key.position.set(-4, 7, 4);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.PointLight(0x33d1a0, 7, 10);
  rim.position.set(4, 3, 3);
  scene.add(rim);

  buildArena();
  playerMesh = createFighter(appearancePath(), 1.36, 3.72);
  playerMesh.position.set(-2.05, -0.22, 0.15);
  rivalMesh = createFighter(rivalImagePath(), 2.36, 3.88);
  rivalMesh.position.set(2.05, -0.22, 0.15);
  rivalMesh.rotation.y = -0.18;
  scene.add(playerMesh, rivalMesh);

  resizeArena();
  window.addEventListener("resize", resizeArena);
  animate();
}

function buildArena() {
  const loader = new THREE.TextureLoader();
  const bgTexture = loader.load("assets/arena-bg.png");
  bgTexture.colorSpace = THREE.SRGBColorSpace;
  arenaBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 8),
    new THREE.MeshBasicMaterial({ map: bgTexture, depthWrite: false })
  );
  arenaBackdrop.position.set(0, 3.3, -4.7);
  scene.add(arenaBackdrop);

  const floorTexture = loader.load("assets/arena-bg.png");
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(3.9, 4.4, 0.34, 8),
    new THREE.MeshStandardMaterial({ map: floorTexture, color: 0x9c8c78, roughness: 0.72, metalness: 0.05 })
  );
  floor.receiveShadow = true;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.45, 0.045, 8, 80),
    new THREE.MeshStandardMaterial({ color: 0xf5b83d, emissive: 0x6b3c00, roughness: 0.38 })
  );
  ring.position.y = 0.28;
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  for (let i = 0; i < 30; i += 1) {
    const spark = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.06),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf5b83d : 0x33d1a0 })
    );
    spark.position.set((Math.random() - 0.5) * 7, 1 + Math.random() * 3, -3 - Math.random() * 2);
    particles.push(spark);
    scene.add(spark);
  }
}

function createFighter(textureUrl, width, height) {
  const texture = new THREE.TextureLoader().load(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.04, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);
  sprite.center.set(0.5, 0);
  return sprite;
}

function resizeArena() {
  if (!renderer) return;
  const box = els.canvas.getBoundingClientRect();
  renderer.setSize(box.width, box.height, false);
  camera.aspect = box.width / box.height;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  if (!threeReady) return;
  const t = performance.now() / 1000;
  playerMesh.position.y = -0.22 + Math.sin(t * 2.4) * 0.026;
  rivalMesh.position.y = -0.22 + Math.sin(t * 2.2 + 1) * 0.026;
  particles.forEach((spark, index) => {
    spark.rotation.y += 0.02;
    spark.position.y += Math.sin(t + index) * 0.002;
  });
  renderer.render(scene, camera);
}

function punch(attacker) {
  if (!threeReady) return;
  const mesh = attacker === "player" ? playerMesh : rivalMesh;
  const start = mesh.position.x;
  mesh.position.x = start + (attacker === "player" ? 0.95 : -0.95);
  mesh.scale.y *= 1.04;
  setTimeout(() => {
    mesh.position.x = start;
    mesh.scale.y /= 1.04;
  }, 150);
}

function flashFloat(text, type = "") {
  els.combatFloat.innerHTML = `<span class="${type}">${text}</span>`;
  els.combatFloat.classList.remove("is-visible", "crit", "block", "dodge");
  if (type) els.combatFloat.classList.add(type);
  void els.combatFloat.offsetWidth;
  els.combatFloat.classList.add("is-visible");
}

function startBattle() {
  if (battle.active) {
    resetBattle();
    return;
  }
  if (state.energy < 16) {
    els.battleLog.textContent = "PvE doyus ucun en azi 16 enerji lazimdir.";
    return;
  }
  levelUp();
  bot = botForLevel(state.level);
  const caveMonsterName = localStorage.getItem("avtoritet-battle-name");
  if (caveMonsterName) bot.name = caveMonsterName;
  const caveFloor = Number(localStorage.getItem("avtoritet-battle-floor") || 1);
  if (caveFloor > 1) {
    bot.hp = Math.floor(bot.hp * 1.55);
    bot.power = Math.floor(bot.power * 1.45);
    bot.crit += 8;
    bot.armor += 6;
  }
  const stats = playerStats();
  state.energy -= 16;
  battle = {
    active: true,
    resolving: false,
    round: 1,
    playerHp: stats.hp,
    playerMaxHp: stats.hp,
    playerMana: stats.mana,
    playerMaxMana: stats.mana,
    rivalHp: bot.hp,
    rivalMaxHp: bot.hp,
    rivalMana: 50 + bot.level * 8,
    rivalMaxMana: 50 + bot.level * 8,
    combo: { hits: 0, crits: 0, dodges: 0, rage: 0 },
  };
  selectedAction = "";
  resetTimer();
  startTurnTimer();
  els.battleLog.textContent = `${bot.name} arenadadir. Priyom sec, sonra Auto bas.`;
  render();
}

function resetBattle() {
  battle = freshBattle();
  selectedAction = "";
  clearInterval(turnTimer);
  turnTimer = null;
  els.battleLog.textContent = "PvE bot seni gozleyir.";
  render();
}

function resetTimer() {
  clearInterval(turnTimer);
  turnSeconds = 30;
  els.timerText.textContent = "30";
}

function startTurnTimer() {
  resetTimer();
  turnTimer = setInterval(() => {
    turnSeconds -= 1;
    els.timerText.textContent = `${turnSeconds}`;
    if (turnSeconds <= 0) {
      if (!selectedAction) selectedAction = bestAutoAction();
      resolveExchange();
    }
  }, 1000);
}

function combo() {
  battle.combo ||= { hits: 0, crits: 0, dodges: 0, rage: 0 };
  return battle.combo;
}

function canUseAction(action) {
  const move = moveById(action);
  if (move.classId !== classFromEquipment(state.equipment || {})) return false;
  const req = move.req || {};
  const meter = combo();
  return (
    meter.hits >= (req.hits || 0) &&
    meter.crits >= (req.crits || 0) &&
    meter.dodges >= (req.dodges || 0) &&
    meter.rage >= (req.rage || 0) &&
    battle.playerMana >= (req.mana || 0)
  );
}

function spendActionCost(action) {
  const move = moveById(action);
  const req = move.req || {};
  const manaCost = move.effect?.manaCost || req.mana || 0;
  const meter = combo();
  meter.hits = Math.max(0, meter.hits - (req.hits || 0));
  meter.crits = Math.max(0, meter.crits - (req.crits || 0));
  meter.dodges = Math.max(0, meter.dodges - (req.dodges || 0));
  meter.rage = Math.max(0, meter.rage - (req.rage || 0));
  battle.playerMana = Math.max(0, battle.playerMana - manaCost);
}

function selectAction(action) {
  if (!battle.active || battle.resolving) return;
  if (!canUseAction(action)) return;
  selectedAction = action;
  els.exchangeText.textContent = `${moveById(action).name} secildi`;
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.action === action);
  });
}

function botAction(playerAction) {
  if (bot.style === "tank" && roll(1, 100) <= 42) return "guard";
  if (bot.style === "quick" && roll(1, 100) <= 42) return "quick";
  if (bot.style === "boss" && battle.rivalHp < battle.rivalMaxHp * 0.55 && roll(1, 100) <= 34) return "special";
  if (playerAction === "guard" && roll(1, 100) <= 45) return "special";
  return roll(1, 100) <= 72 ? "strike" : "guard";
}

function botClass() {
  if (bot.style === "tank") return "tank";
  if (bot.style === "quick") return "uvorot";
  if (bot.style === "boss") return "krit";
  return bot.level % 4 === 0 ? "mag" : "guc";
}

function currentMoves() {
  return selectedMoveIds(state).map(moveById);
}

function playerHit(action, enemyAction) {
  const stats = playerStats();
  const move = moveById(action);
  const effect = move.effect || { type: "damage", mult: 1 };
  const blocked = enemyAction === "guard" || roll(1, 100) <= bot.armor;
  const dodged = enemyAction === "quick" && roll(1, 100) <= bot.dodge + 14;
  const crit = roll(1, 100) <= stats.crit + (effect.critBoost || 0);
  const isMagic = effect.type === "magic" || effect.type === "magicGuard";
  const antiBonus = move.anti === botClass() ? 1.22 : 1;
  let damage = roll(14, 26) + Math.floor((isMagic ? stats.intellect : stats.strength) * (isMagic ? 1.2 : 0.36));
  damage = Math.floor(damage * (effect.mult || 1) * antiBonus);
  if (effect.type === "heal") {
    const heal = Math.max(12, Math.floor(battle.playerMaxHp * (effect.mult || 0.1)));
    battle.playerHp = Math.min(battle.playerMaxHp, battle.playerHp + heal);
    damage = 0;
  }
  if (effect.type === "guard" || effect.type === "magicGuard") damage = Math.floor(damage * 0.45);
  if (dodged && effect.type !== "dodgeHit") damage = 0;
  if (crit && damage > 0) damage *= 2;
  if (blocked && damage > 0) damage = Math.floor(damage * (effect.type === "pierce" ? 0.72 : crit ? 0.5 : 0.35));
  const meter = combo();
  if (damage > 0 && move.req?.hits === 0) meter.hits = clamp(meter.hits + 1, 0, 9);
  if (crit && damage > 0) meter.crits = clamp(meter.crits + 1, 0, 9);
  meter.rage = clamp(meter.rage + (damage > 0 ? 10 : 4), 0, 100);
  spendActionCost(action);
  return { damage: Math.max(0, damage), crit, blocked, dodged, name: move.name };
}

function enemyHit(action, playerAction) {
  const stats = playerStats();
  const playerMove = moveById(playerAction);
  const playerEffect = playerMove.effect || {};
  const guarded = playerEffect.type === "guard" || playerEffect.type === "guardHit" || playerEffect.type === "magicGuard";
  const dodged = playerEffect.type === "dodgeHit" && roll(1, 100) <= stats.dodgeChance + 18;
  const crit = roll(1, 100) <= bot.crit;
  const magic = action === "special";
  if (dodged) {
    const meter = combo();
    meter.dodges = clamp(meter.dodges + 1, 0, 9);
    meter.rage = clamp(meter.rage + 12, 0, 100);
    return { damage: 0, crit, blocked: false, dodged: true, name: actionNames[action] };
  }
  let damage = action === "guard" ? roll(5, 10) : action === "quick" ? roll(10, 16) : magic ? roll(24, 36) : roll(12, 24);
  damage += Math.floor(bot.power * (magic ? 0.44 : 0.32));
  damage -= magic ? stats.magicArmor : stats.physicalArmor;
  if (crit) damage *= 2;
  if (guarded) damage = Math.floor(damage * (crit ? 0.5 : 0.35));
  combo().rage = clamp(combo().rage + Math.max(4, Math.floor(Math.max(0, damage) / 8)), 0, 100);
  return { damage: Math.max(0, damage), crit, blocked: guarded, dodged, name: actionNames[action] };
}

function resolveExchange() {
  if (!battle.active || battle.resolving || !selectedAction) return;
  battle.resolving = true;
  clearInterval(turnTimer);
  const playerAction = selectedAction;
  const enemyAction = botAction(playerAction);
  els.exchangeText.textContent = "Auto zerbe";
  els.battleLog.textContent = `${moveById(playerAction).name} vs ${actionNames[enemyAction]}`;

  setTimeout(() => {
    const hit = playerHit(playerAction, enemyAction);
    battle.rivalHp = Math.max(0, battle.rivalHp - hit.damage);
    punch("player");
    flashFloat(`${hit.name} -${hit.damage}${hit.crit ? " KRIT" : ""}${hit.blocked ? " BLOK" : ""}${hit.dodged ? " UVOROT" : ""}`, hit.crit ? "crit" : hit.blocked ? "block" : hit.dodged ? "dodge" : "");
    render();
  }, 240);

  setTimeout(() => {
    if (battle.rivalHp > 0) {
      const counter = enemyHit(enemyAction, playerAction);
      battle.playerHp = Math.max(0, battle.playerHp - counter.damage);
      punch("rival");
      flashFloat(`${counter.name} -${counter.damage}${counter.crit ? " KRIT" : ""}${counter.blocked ? " BLOK" : ""}${counter.dodged ? " UVOROT" : ""}`, counter.crit ? "crit" : counter.blocked ? "block" : counter.dodged ? "dodge" : "");
    }
    finishExchange(playerAction, enemyAction);
  }, 980);
}

function finishExchange(playerAction, enemyAction) {
  if (battle.rivalHp <= 0) return winBattle();
  if (battle.playerHp <= 0) return loseBattle();
  battle.round += 1;
  battle.resolving = false;
  selectedAction = "";
  document.querySelectorAll("[data-action]").forEach((button) => button.classList.remove("is-selected"));
  els.exchangeText.textContent = "Gedis sec";
  els.battleLog.textContent = `Raund ${battle.round}: bot ${actionNames[enemyAction]} secdi.`;
  tg?.HapticFeedback?.impactOccurred(moveById(playerAction).effect?.mult > 1.8 ? "heavy" : "light");
  render();
  startTurnTimer();
}

function bestAutoAction() {
  const usable = currentMoves().filter((move) => canUseAction(move.id));
  if (!usable.length) return currentMoves()[0]?.id || "guc-01";
  return usable.sort((a, b) => (b.effect?.mult || 1) - (a.effect?.mult || 1))[0].id;
}

function winBattle() {
  const caveReturn = localStorage.getItem("avtoritet-battle-return");
  const authReward = caveReturn ? 0 : 24 + state.level * 8;
  const cashReward = 35 + state.level * 12;
  state.wins += 1;
  state.authority += authReward;
  state.cash += cashReward;
  if (!caveReturn) {
    state.metal += Math.random() > 0.45 ? 1 : 0;
    state.parts += Math.random() > 0.56 ? 1 : 0;
  }
  if (caveReturn) {
    localStorage.setItem("avtoritet-cave-battle-result", "win");
  }
  battle.active = false;
  battle.resolving = false;
  clearInterval(turnTimer);
  levelUp();
  flashFloat(caveReturn ? "Qelebe" : `Qelebe +${authReward}`, "crit");
  els.battleLog.textContent = caveReturn
    ? `${bot.name} meglub oldu. Drop tunelde qaldi.`
    : `${bot.name} meglub oldu. +${authReward} avtoritet, +${cashReward} manat.`;
  tg?.HapticFeedback?.notificationOccurred("success");
  render();
  returnToArena();
}

function loseBattle() {
  state.authority = Math.max(0, state.authority - 12);
  state.losses = (state.losses || 0) + 1;
  battle.active = false;
  battle.resolving = false;
  clearInterval(turnTimer);
  flashFloat("Meglubiyyet", "block");
  els.battleLog.textContent = `${bot.name} ustun geldi. Avtoritet -12.`;
  if (localStorage.getItem("avtoritet-battle-return")) {
    localStorage.setItem("avtoritet-cave-battle-result", "lose");
  }
  tg?.HapticFeedback?.notificationOccurred("warning");
  render();
  returnToArena();
}

function returnToArena() {
  clearTimeout(redirectTimer);
  redirectTimer = setTimeout(() => {
    const target = localStorage.getItem("avtoritet-battle-return") || "arena.html";
    localStorage.removeItem("avtoritet-battle-return");
    localStorage.removeItem("avtoritet-battle-name");
    localStorage.removeItem("avtoritet-battle-rival-image");
    localStorage.removeItem("avtoritet-battle-floor");
    window.location.href = target;
  }, 1800);
}

function render() {
  levelUp();
  bot = battle.active ? bot : botForLevel(state.level);
  saveState();
  if (els.playerStandee) els.playerStandee.src = appearancePath();
  if (els.rivalStandee) els.rivalStandee.src = rivalImagePath();
  if (els.botPreviewName) els.botPreviewName.textContent = bot.name;
  if (els.botPreviewMeta) els.botPreviewMeta.textContent = `Lvl ${state.level} / ${bot.style}`;
  if (els.energy) els.energy.textContent = `${state.energy}/${state.maxEnergy} enerji`;
  els.rivalName.textContent = `${bot.name} L${state.level}`;
  els.playerHpText.textContent = `HP ${battle.playerHp}/${battle.playerMaxHp}`;
  els.playerManaText.textContent = `${battle.playerMana}/${battle.playerMaxMana}`;
  els.rivalHpText.textContent = `HP ${battle.rivalHp}/${battle.rivalMaxHp}`;
  if (els.rivalManaText) els.rivalManaText.textContent = `${battle.rivalMana}/${battle.rivalMaxMana}`;
  els.playerHpBar.style.width = percent(battle.playerHp, battle.playerMaxHp);
  els.playerManaBar.style.width = percent(battle.playerMana, battle.playerMaxMana);
  els.rivalHpBar.style.width = percent(battle.rivalHp, battle.rivalMaxHp);
  if (els.rivalManaBar) els.rivalManaBar.style.width = percent(battle.rivalMana, battle.rivalMaxMana);
  const meter = combo();
  els.hitCount.textContent = meter.hits;
  els.critCount.textContent = meter.crits;
  els.dodgeCount.textContent = meter.dodges;
  els.rageCount.textContent = meter.rage;
  els.roundText.textContent = battle.active ? `R${battle.round}` : "PvE";
  els.startButton.textContent = battle.active ? "Reset" : "Basla";
  els.startButton.classList.toggle("is-active", battle.active);
  els.startButton.disabled = !battle.active && state.energy < 16;
  els.autoButton.disabled = !battle.active || battle.resolving;
  document.querySelector(".move-actions").innerHTML = currentMoves()
    .map((move) => `<button class="battle-action move-${move.classId} ${move.effect?.type === "magic" ? "accent" : ""}" data-action="${move.id}" type="button" aria-label="${move.name}"><span class="move-art" style="background-image:url('${move.icon}')"></span><small>${move.req?.mana || move.req?.crits || move.req?.dodges || move.req?.rage || move.req?.hits || 0}</small></button>`)
    .join("");
  document.querySelectorAll("[data-action]").forEach((button) => {
    const unlocked = canUseAction(button.dataset.action);
    button.disabled = !battle.active || battle.resolving || !unlocked;
    button.classList.toggle("is-locked", battle.active && !unlocked);
  });
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

els.startButton.addEventListener("click", startBattle);
els.autoButton.addEventListener("click", () => {
  if (!battle.active || battle.resolving) return;
  if (!selectedAction) selectAction(bestAutoAction());
  resolveExchange();
  render();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) selectAction(button.dataset.action);
});

tg?.ready?.();
tg?.expand?.();
initThree();
render();





