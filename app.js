const tg = window.Telegram?.WebApp;

const ranks = [
  { min: 0, title: "Kuce usagi" },
  { min: 2500, title: "Mehelle adami" },
  { min: 30000, title: "Rayon sozu" },
  { min: 1000000, title: "Baki avtoriteti" },
  { min: 3500000, title: "Seher efsanesi" },
];

const levelThresholds = [0, 500, 1200, 2500, 5000, 12500, 30000, 300000, 500000, 1000000, 1500000, 2500000, 3500000, 4500000, 5500000];

const craftClasses = [
  { id: "guc", name: "Guc", prefix: "Demir Zerbe" },
  { id: "krit", name: "Krit", prefix: "Qirmizi Kesik" },
  { id: "tank", name: "Tank", prefix: "Das Divar" },
  { id: "uvorot", name: "Uvorot", prefix: "Neon Qacis" },
  { id: "mag", name: "Mag", prefix: "Mavi Mana" },
];

const craftSlots = [
  { id: "helmet", label: "Slem", icon: "helmet", art: "cap", suffix: "basligi" },
  { id: "weapon", label: "Silah", icon: "weapon", art: "pipe", suffix: "silahi" },
  { id: "offhand", label: "Siper", icon: "shield", art: "guard", suffix: "siperi" },
  { id: "armor", label: "Zireh", icon: "armor", art: "jacket", suffix: "zirehi" },
  { id: "belt", label: "Kemer", icon: "belt", art: "chain", suffix: "kemeri" },
  { id: "gloves", label: "Elcek", icon: "gloves", art: "gloves", suffix: "elceyi" },
  { id: "leggings", label: "Ponoj", icon: "leggings", art: "pants", suffix: "ponoju" },
  { id: "boots", label: "Bot", icon: "boots", art: "boots", suffix: "botlari" },
];

function craftCost(level, classIndex, slotIndex) {
  const hard = level >= 8 ? 1.35 : 1;
  return {
    metal: Math.round((level * 1.9 + slotIndex * 1.3 + classIndex) * hard),
    cloth: Math.round((level * 1.55 + slotIndex + classIndex * 0.8) * hard),
    parts: Math.round((level * 1.25 + slotIndex * 1.15 + classIndex) * hard),
  };
}

function craftStats(classId, slotId, level) {
  const slotBoost = { helmet: 1, weapon: 4, offhand: 2, armor: 3, belt: 2, gloves: 3, leggings: 2, boots: 2 }[slotId] || 1;
  const base = Math.max(1, Math.round(level * 0.8 + slotBoost));
  const stats = {
    guc: { strength: base + 3 },
    krit: { crit: Math.max(2, Math.round(level * 0.65 + slotBoost)), strength: Math.max(1, Math.round(base / 2)) },
    tank: { endurance: base + 3, hp: level * 10 + slotBoost * 8 },
    uvorot: { agility: base + 2, dodge: Math.max(2, Math.round(level * 0.55 + slotBoost)) },
    mag: { intellect: base + 2, mana: level * 8 + slotBoost * 7 },
  };
  return stats[classId];
}

function craftPower(classId, stats) {
  if (classId === "guc") return stats.strength || 0;
  if (classId === "krit") return Math.round((stats.strength || 0) + (stats.crit || 0) * 0.6);
  if (classId === "tank") return Math.round((stats.endurance || 0) * 0.45);
  if (classId === "uvorot") return Math.round((stats.agility || 0) * 0.55);
  if (classId === "mag") return Math.round((stats.intellect || 0) * 0.7);
  return 0;
}

const craftItems = Array.from({ length: 12 }, (_, index) => index + 4).flatMap((level) =>
  craftClasses.flatMap((craftClass, classIndex) =>
    craftSlots.map((slot, slotIndex) => {
      const stats = craftStats(craftClass.id, slot.id, level);
      return {
        id: `${craftClass.id}-${slot.id}-${String(level).padStart(2, "0")}`,
        slot: slot.id,
        icon: slot.icon,
        art: slot.art,
        classId: craftClass.id,
        className: craftClass.name,
        levelReq: level,
        name: `${craftClass.prefix} ${slot.suffix} ${level}`,
        desc: `${slot.label} / ${craftClass.name}`,
        stats,
        cost: craftCost(level, classIndex, slotIndex),
        power: craftPower(craftClass.id, stats),
      };
    })
  )
);

const equipmentSlots = [
  { id: "helmet", label: "Slem", icon: "helmet" },
  { id: "weapon", label: "Silah", icon: "weapon" },
  { id: "offhand", label: "Siper", icon: "shield" },
  { id: "armor", label: "Zireh", icon: "armor" },
  { id: "belt", label: "Kemer", icon: "belt" },
  { id: "gloves", label: "Elcek", icon: "gloves" },
  { id: "leggings", label: "Ponoj", icon: "leggings" },
  { id: "boots", label: "Bot", icon: "boots" },
];

const quests = [
  { id: "tea", name: "Cayxanada sozunu de", desc: "+20 avtoritet, +2 metal", energy: 10, reward: { authority: 20, metal: 2 } },
  { id: "market", name: "Bazarda meseleni hell et", desc: "+35 manat, +2 parca", energy: 14, reward: { cash: 35, cloth: 2 } },
  { id: "garage", name: "Qarajdan detal tap", desc: "+3 detal, +12 avtoritet", energy: 18, reward: { parts: 3, authority: 12 } },
];

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
let activeCraftClass = "all";
let activeCraftLevel = "4";

const els = {
  topPlayerName: document.querySelector("#topPlayerName"),
  homePlayerName: document.querySelector("#homePlayerName"),
  rankTitle: document.querySelector("#rankTitle"),
  homeRankTitle: document.querySelector("#homeRankTitle"),
  authorityValue: document.querySelector("#authorityValue"),
  levelValue: document.querySelector("#levelValue"),
  energyValue: document.querySelector("#energyValue"),
  hpValue: document.querySelector("#hpValue"),
  manaValue: document.querySelector("#manaValue"),
  winsValue: document.querySelector("#winsValue"),
  lossesValue: document.querySelector("#lossesValue"),
  battleCountValue: document.querySelector("#battleCountValue"),
  strengthValue: document.querySelector("#strengthValue"),
  agilityValue: document.querySelector("#agilityValue"),
  critValue: document.querySelector("#critValue"),
  enduranceValue: document.querySelector("#enduranceValue"),
  intellectValue: document.querySelector("#intellectValue"),
  setBonusValue: document.querySelector("#setBonusValue"),
  battleLog: document.querySelector("#battleLog"),
  craftList: document.querySelector("#craftList"),
  leaderboard: document.querySelector("#leaderboard"),
  referralCode: document.querySelector("#referralCode"),
  metalValue: document.querySelector("#metalValue"),
  clothValue: document.querySelector("#clothValue"),
  partsValue: document.querySelector("#partsValue"),
  equipmentSlots: document.querySelector("#equipmentSlots"),
  profileAvatarImage: document.querySelector("#profileAvatarImage"),
  heroCharacterImage: document.querySelector("#heroCharacterImage"),
  levelModal: document.querySelector("#levelModal"),
  levelList: document.querySelector("#levelList"),
  levelOpenButton: document.querySelector("#levelOpenButton"),
  levelCloseButton: document.querySelector("#levelCloseButton"),
};

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("avtoritet-state")) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem("avtoritet-state", JSON.stringify(state));
}

function playerLabel() {
  const user = tg?.initDataUnsafe?.user;
  return user?.first_name ? `${user.first_name}, Baki kucelerine xos geldin` : "Baki kucelerine xos geldin";
}

function playerDisplayName() {
  const user = tg?.initDataUnsafe?.user;
  return user?.first_name || "Kuce Oyuncusu";
}

function appearancePath() {
  return `assets/appearances/${state.appearance || "appearance-01"}.png`;
}

function referralCode() {
  const id = tg?.initDataUnsafe?.user?.id || Math.abs(hashCode(navigator.userAgent)).toString().slice(0, 4);
  return `BAKU-${String(id).slice(-4).padStart(4, "0")}`;
}

function hashCode(value) {
  return [...value].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function currentRank() {
  return ranks.reduce((best, rank) => (state.authority >= rank.min ? rank : best), ranks[0]);
}

function levelFromAuthority(authority) {
  let level = 1;
  levelThresholds.forEach((required, index) => {
    if (authority >= required) level = index + 1;
  });
  return Math.min(15, level);
}

function syncLevelFromAuthority() {
  const nextLevel = levelFromAuthority(state.authority);
  state.level = nextLevel;
  state.maxEnergy = Math.max(state.maxEnergy, 100 + (nextLevel - 1) * 8);
}

function playerStats() {
  const equipped = state.equipment || {};
  const gearStats = equippedGearStats(equipped);
  const setBonus = fullSetBonus(equipped);
  const strength = state.power + (gearStats.strength || 0) + (setBonus.stats.strength || 0);
  const agility = 10 + Math.floor(state.level * 1.6) + Math.floor(strength / 8) + (gearStats.agility || 0) + (setBonus.stats.agility || 0);
  const crit = Math.min(60, 6 + Math.floor(state.level * 1.2) + Math.floor(state.authority / 180) + (gearStats.crit || 0) + (setBonus.stats.crit || 0));
  const endurance = 110 + state.level * 12 + (gearStats.endurance || 0) + (setBonus.stats.endurance || 0);
  const intellect = 8 + Math.floor(state.level * 1.4) + Math.floor((state.parts + state.metal) / 3) + (gearStats.intellect || 0) + (setBonus.stats.intellect || 0);
  return {
    strength,
    agility,
    crit,
    endurance,
    intellect,
    setBonus,
    hp: endurance,
    mana: gearStats.mana || 0,
  };
}

function itemMeta(itemId) {
  const match = /^(guc|krit|tank|uvorot|mag)-(helmet|weapon|offhand|armor|belt|gloves|leggings|boots)-(\d{2})$/.exec(itemId || "");
  if (!match) return null;
  return { classId: match[1], slot: match[2], level: Number(match[3]) };
}

function statsFromMeta(meta) {
  return meta ? craftStats(meta.classId, meta.slot, meta.level) || {} : {};
}

function equippedGearStats(equipped) {
  return Object.values(equipped || {}).reduce((total, itemId) => {
    Object.entries(statsFromMeta(itemMeta(itemId))).forEach(([key, value]) => {
      total[key] = (total[key] || 0) + value;
    });
    return total;
  }, {});
}

function fullSetBonus(equipped) {
  const items = equipmentSlots.map((slot) => itemMeta(equipped[slot.id]));
  if (items.some((item) => !item)) return { label: "Yoxdur", stats: {} };
  const classId = items[0].classId;
  if (!items.every((item) => item.classId === classId)) return { label: "Yoxdur", stats: {} };
  const minLevel = Math.min(...items.map((item) => item.level));
  const className = craftClasses.find((item) => item.id === classId)?.name || classId;
  const bonusValue = Math.max(2, Math.floor(minLevel / 2));
  const stats = {
    guc: { strength: bonusValue + 4 },
    krit: { crit: bonusValue + 5 },
    tank: { endurance: bonusValue * 5 + 20 },
    uvorot: { agility: bonusValue + 4 },
    mag: { intellect: bonusValue + 5 },
  }[classId] || {};
  return { label: `${className} +${minLevel}`, stats };
}

function levelUp() {
  syncLevelFromAuthority();
}

function canAfford(cost) {
  return Object.entries(cost).every(([key, value]) => state[key] >= value);
}

function spend(cost) {
  Object.entries(cost).forEach(([key, value]) => {
    state[key] -= value;
  });
}

function statLabel(key) {
  const labels = {
    strength: "Guc",
    agility: "Ceviklik",
    crit: "Krit",
    endurance: "Dozumluluk",
    hp: "HP",
    armor: "Mudafie",
    block: "Blok",
    dodge: "Yayinma",
    intellect: "Intellekt",
    mana: "Mana",
  };
  return labels[key] || key;
}

function craftStatus(item, owned) {
  if (owned) return "Cantada";
  if (state.level < (item.levelReq || 1)) return `Lvl ${item.levelReq}`;
  if (!canAfford(item.cost)) return "Resurs";
  return "Cantaya";
}

function resourceCost(cost) {
  return `<span><img src="assets/resources/metal.png" alt="Metal" />${cost.metal}</span>
    <span><img src="assets/resources/cloth.png" alt="Parca" />${cost.cloth}</span>
    <span><img src="assets/resources/parts.png" alt="Detal" />${cost.parts}</span>`;
}

function craftArt(item) {
  return `assets/craft-items/generated/${item.id}.png`;
}

function gain(reward) {
  Object.entries(reward).forEach(([key, value]) => {
    state[key] = (state[key] || 0) + value;
  });
}

function render() {
  levelUp();
  const currentLevel = state.level;
  const currentMin = levelThresholds[currentLevel - 1] || 0;
  const nextNeed = levelThresholds[currentLevel] ?? levelThresholds[levelThresholds.length - 1];
  const levelSpan = Math.max(1, nextNeed - currentMin);
  const authorityProgress = currentLevel >= 15 ? levelSpan : Math.max(0, state.authority - currentMin);
  const xpLeft = currentLevel >= 15 ? 0 : Math.max(0, nextNeed - state.authority);
  const losses = state.losses || 0;
  const stats = playerStats();
  const avatar = appearancePath();
  els.profileAvatarImage.src = avatar;
  els.heroCharacterImage.src = avatar;
  els.topPlayerName.textContent = playerDisplayName();
  els.homePlayerName.textContent = playerDisplayName();
  els.rankTitle.textContent = currentRank().title;
  els.homeRankTitle.textContent = currentRank().title;
  els.authorityValue.textContent = state.authority;
  els.levelValue.textContent = state.level;
  els.energyValue.textContent = `${state.energy}/${state.maxEnergy}`;
  els.hpValue.textContent = `${stats.hp}/${stats.hp} HP`;
  els.manaValue.textContent = `${stats.mana}/${stats.mana} MP`;
  els.authorityValue.textContent = currentLevel >= 15 ? `${state.authority} / MAX` : `${state.authority} / ${nextNeed} - ${xpLeft} qalib`;
  els.winsValue.textContent = state.wins;
  els.lossesValue.textContent = losses;
  els.battleCountValue.textContent = state.wins + losses;
  els.strengthValue.textContent = stats.strength;
  els.agilityValue.textContent = `${stats.agility}%`;
  els.critValue.textContent = `${stats.crit}%`;
  els.enduranceValue.textContent = `${stats.endurance} HP`;
  els.intellectValue.textContent = stats.intellect;
  els.setBonusValue.textContent = stats.setBonus.label;
  els.referralCode.textContent = referralCode();
  renderCraft();
  renderEquipment();
  renderLeaderboard();
  saveState();
}

function iconPath(icon) {
  const paths = {
    helmet: "M6 11a6 6 0 0 1 12 0v5H6v-5Zm2 1h8v-1a4 4 0 0 0-8 0v1Zm-1 6h10v2H7v-2Z",
    weapon: "M4 19 16.8 6.2 18.9 8.3 6.1 21.1 4 19Zm12-15 4 4 1.4-1.4-4-4L16 4Z",
    shield: "M12 2 20 5v6c0 5-3.3 8.5-8 11-4.7-2.5-8-6-8-11V5l8-3Z",
    armor: "M8 3h8l3 4-2 3v11H7V10L5 7l3-4Zm2 3v12h4V6h-4Z",
    belt: "M4 9h16v6H4V9Zm7 1.5v3h2v-3h-2Z",
    gloves: "M6 5h4v8l2-2 2 2 2-2 2 2v6H8l-2-4V5Z",
    leggings: "M8 3h8v8l-2 10h-4L8 11V3Zm2 2v6l1 7h2l1-7V5h-4Z",
    boots: "M7 5h5v9h5l2 4v2H6V5h1Zm2 2v11h7l-.8-2H10V7H9Z",
  };
  return paths[icon] || paths.armor;
}

function renderEquipment() {
  const equipped = state.equipment || {};
  els.equipmentSlots.innerHTML = equipmentSlots
    .map((slot) => {
      const item = craftItems.find((entry) => entry.id === equipped[slot.id]);
      const filled = item ? "is-equipped" : "";
      const label = item?.name || slot.label;
      const icon = item?.icon || slot.icon;
      return `<button class="equip-slot ${filled}" type="button" title="${label}" aria-label="${label}">
        ${item ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPath(icon)}"/></svg>` : `<img src="assets/equipment/${slot.id}.png" alt="" aria-hidden="true" />`}
      </button>`;
    })
    .join("");
}

function renderLevelList() {
  els.levelList.innerHTML = levelThresholds
    .map((required, index) => {
      const level = index + 1;
      const reached = state.authority >= required ? "is-reached" : "";
      const current = state.level === level ? "is-current" : "";
      return `<div class="level-row ${reached} ${current}">
        <span>${level}</span>
        <strong>${required}</strong>
      </div>`;
    })
    .join("");
}

function renderCraft() {
  const bag = state.bag || [];
  const visibleItems = craftItems.filter((item) => {
    const classMatches = activeCraftClass === "all" || item.classId === activeCraftClass;
    const levelMatches = activeCraftLevel === "all" || item.levelReq === Number(activeCraftLevel);
    return classMatches && levelMatches;
  });
  els.metalValue.textContent = state.metal;
  els.clothValue.textContent = state.cloth;
  els.partsValue.textContent = state.parts;
  els.craftList.innerHTML = visibleItems
    .map((item) => {
      const owned = bag.includes(item.id) || Object.values(state.equipment || {}).includes(item.id);
      const locked = state.level < (item.levelReq || 1);
      const enough = canAfford(item.cost);
      const disabled = owned || locked || !enough ? "disabled" : "";
      const stats = Object.entries(item.stats || {})
        .map(([key, value]) => `<span>${statLabel(key)} <strong>+${value}</strong></span>`)
        .join("");
      return `<article class="craft-card ${owned ? "is-owned" : ""}">
        <div class="craft-icon">
          <img class="craft-art" src="${craftArt(item)}" alt="" aria-hidden="true" />
        </div>
        <div class="craft-info">
          <div class="craft-meta"><span>LVL ${item.levelReq || 1}</span><em>${item.className}</em><small>${equipmentSlots.find((slot) => slot.id === item.slot)?.label || item.slot}</small></div>
          <h2>${item.name}</h2>
          <p>${item.desc}</p>
          <div class="craft-stats">${stats}</div>
          <div class="craft-cost">${owned ? "Cantada var" : resourceCost(item.cost)}</div>
        </div>
        <button type="button" data-craft="${item.id}" ${disabled}>${craftStatus(item, owned)}</button>
      </article>`;
    })
    .join("");
}

function renderLeaderboard() {
  const board = [
    { name: "Neriman Crew", score: 1420 },
    { name: "Xezer Boss", score: 1185 },
    { name: "Sen", score: state.authority },
    { name: "Qara Qaraj", score: 760 },
    { name: "Iceriseher", score: 520 },
  ].sort((a, b) => b.score - a.score);

  els.leaderboard.innerHTML = board
    .map((row, index) => `<div class="leader-row"><span>#${index + 1}</span><span>${row.name}</span><strong>${row.score}</strong></div>`)
    .join("");
}

function runQuest(id) {
  const quest = quests.find((item) => item.id === id);
  if (!quest || state.energy < quest.energy) return;
  state.energy -= quest.energy;
  gain(quest.reward);
  els.battleLog.textContent = `${quest.name}: mukafat alindi.`;
  tg?.HapticFeedback?.impactOccurred("light");
  render();
}

function craft(id) {
  const item = craftItems.find((entry) => entry.id === id);
  if (!item || state.level < (item.levelReq || 1) || !canAfford(item.cost)) return;
  spend(item.cost);
  state.bag = [...(state.bag || []), item.id];
  els.battleLog.textContent = `${item.name} hazirdir. Cantaya elave olundu.`;
  tg?.HapticFeedback?.impactOccurred("medium");
  render();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetView = tab.dataset.view;
    if (!targetView) return;
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelector(`#${targetView}View`).classList.add("is-active");
    document.querySelector(".app-shell").classList.toggle("is-map-open", targetView === "map");
  });
});

document.addEventListener("click", (event) => {
  const craftClassButton = event.target.closest("[data-craft-class]");
  const craftLevelButton = event.target.closest("[data-craft-level]");
  const craftButton = event.target.closest("[data-craft]");
  const mapPlaceButton = event.target.closest("[data-map-place]");
  if (craftClassButton) {
    activeCraftClass = craftClassButton.dataset.craftClass;
    document.querySelectorAll("[data-craft-class]").forEach((button) => {
      button.classList.toggle("is-active", button === craftClassButton);
    });
    tg?.HapticFeedback?.selectionChanged?.();
    renderCraft();
    return;
  }
  if (craftLevelButton) {
    activeCraftLevel = craftLevelButton.dataset.craftLevel;
    document.querySelectorAll("[data-craft-level]").forEach((button) => {
      button.classList.toggle("is-active", button === craftLevelButton);
    });
    tg?.HapticFeedback?.selectionChanged?.();
    renderCraft();
    return;
  }
  if (craftButton) craft(craftButton.dataset.craft);
  if (mapPlaceButton) {
    els.battleLog.textContent = `${mapPlaceButton.dataset.mapPlace}: tezlikle acilacaq.`;
    tg?.HapticFeedback?.selectionChanged?.();
  }
});

document.querySelector("#copyReferral").addEventListener("click", async () => {
  const code = referralCode();
  await navigator.clipboard?.writeText(code);
  els.battleLog.textContent = `Referal kod kopyalandi: ${code}`;
});

document.querySelector("#shareButton")?.addEventListener("click", () => {
  const text = encodeURIComponent(`Avtoritet oyununa qosul. Kodum: ${referralCode()}`);
  const url = encodeURIComponent(location.href);
  tg?.openTelegramLink?.(`https://t.me/share/url?url=${url}&text=${text}`);
  if (!tg) window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
});

els.levelOpenButton.addEventListener("click", () => {
  renderLevelList();
  els.levelModal.showModal();
});

els.levelCloseButton.addEventListener("click", () => {
  els.levelModal.close();
});

els.levelModal.addEventListener("click", (event) => {
  if (event.target === els.levelModal) els.levelModal.close();
});

setInterval(() => {
  if (state.energy < state.maxEnergy) {
    state.energy += 1;
    render();
  }
}, 9000);

window.addEventListener("focus", () => {
  state = loadState();
  render();
});

tg?.ready?.();
tg?.expand?.();
render();
