const tg = window.Telegram?.WebApp;

const levelThresholds = [0, 500, 1200, 2500, 5000, 12500, 30000, 300000, 500000, 1000000, 1500000, 2500000, 3500000, 4500000, 5500000];

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

const craftClasses = [
  { id: "guc", name: "Güc", prefix: "Dəmir Zərbə" },
  { id: "krit", name: "Krit", prefix: "Qırmızı Kəsik" },
  { id: "tank", name: "Tank", prefix: "Daş Divar" },
  { id: "uvorot", name: "Uvorot", prefix: "Neon Qaçış" },
  { id: "mag", name: "Mag", prefix: "Mavi Mana" },
];

const craftSlots = [
  { id: "helmet", label: "Şlem", icon: "assets/craft-items/cap.png", suffix: "başlığı" },
  { id: "weapon", label: "Silah", icon: "assets/craft-items/pipe.png", suffix: "silahı" },
  { id: "offhand", label: "Sipər", icon: "assets/craft-items/guard.png", suffix: "sipəri" },
  { id: "armor", label: "Zireh", icon: "assets/craft-items/jacket.png", suffix: "zirehi" },
  { id: "belt", label: "Kəmər", icon: "assets/craft-items/chain.png", suffix: "kəməri" },
  { id: "gloves", label: "Əlcək", icon: "assets/craft-items/gloves.png", suffix: "əlcəyi" },
  { id: "leggings", label: "Ponoj", icon: "assets/craft-items/pants.png", suffix: "ponoju" },
  { id: "boots", label: "Bot", icon: "assets/craft-items/boots.png", suffix: "botları" },
];

const categories = {
  scrolls: [
    { icon: "S", name: "Küçə andı", stat: "+10% avtoritet döyüşdən sonra" },
    { icon: "X", name: "Köhnə xəritə", stat: "Mağarada gizli yol açır" },
    { icon: "B", name: "Boss çağırışı", stat: "Xüsusi PvP duel açır" },
  ],
  elixirs: [
    { icon: "+", name: "Yaşıl eliksir", stat: "+45 HP bərpa" },
    { icon: "M", name: "Mavi eliksir", stat: "+35 mana bərpa" },
    { icon: "F", name: "Qəzəb içkisi", stat: "3 raund +15% zərbə" },
  ],
  runes: [
    { icon: "R", name: "Güc runası", stat: "Silaha +3 güc" },
    { icon: "M", name: "Mana runası", stat: "Mag geyiminə +mana" },
    { icon: "K", name: "Krit runası", stat: "+2% kritik şans" },
  ],
  upgrades: [
    { icon: "G", name: "Metal sərtləşdirmə", stat: "Silah səviyyəsini artırır" },
    { icon: "+", name: "Zireh tikişi", stat: "HP və müdafiə artırır" },
    { icon: "*", name: "Prestij nişanı", stat: "Əşyaya bonus verir" },
  ],
};

let activeTab = "equipment";

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

function craftItemFromId(id) {
  const match = /^(guc|krit|tank|uvorot|mag)-(helmet|weapon|offhand|armor|belt|gloves|leggings|boots)-(\d{2})$/.exec(id);
  if (!match) return null;
  const [, classId, slotId, levelText] = match;
  const level = Number(levelText);
  const craftClass = craftClasses.find((item) => item.id === classId);
  const slot = craftSlots.find((item) => item.id === slotId);
  if (!craftClass || !slot) return null;
  const stats = craftStats(classId, slotId, level);
  return {
    id,
    slot: slotId,
    icon: `assets/craft-items/generated/${id}.png`,
    name: `${craftClass.prefix} ${slot.suffix} ${level}`,
    stat: `${slot.label} / ${craftClass.name} / ${formatStats(stats)}`,
  };
}

function formatStats(stats) {
  const labels = {
    strength: "güc",
    agility: "çeviklik",
    crit: "krit",
    endurance: "dözümlülük",
    hp: "HP",
    dodge: "yayınma",
    intellect: "intellekt",
    mana: "mana",
  };
  return Object.entries(stats).map(([key, value]) => `+${value} ${labels[key] || key}`).join(", ");
}

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

function levelFromAuthority(authority) {
  let level = 1;
  levelThresholds.forEach((required, index) => {
    if (authority >= required) level = index + 1;
  });
  return Math.min(15, level);
}

function renderEquipment(state) {
  const equipped = state.equipment || {};
  const bag = state.bag || [];
  const slotCards = craftSlots
    .map((slot) => {
      const item = craftItemFromId(equipped[slot.id]);
      return `<article class="bag-item ${item ? "is-equipped" : ""}">
        <div class="bag-item-icon"><img src="${item?.icon || `assets/equipment/${slot.id}.png`}" alt="" aria-hidden="true" /></div>
        <div>
          <strong>${item?.name || `${slot.label} slotu`}</strong>
          <small>${item?.stat || "Boş slot"}</small>
        </div>
        <em>${item ? "Geyinilib" : "Boş slot"}</em>
      </article>`;
    })
    .join("");
  const inventoryCards = bag
    .map(craftItemFromId)
    .filter(Boolean)
    .map((item) => `<article class="bag-item">
      <div class="bag-item-icon"><img src="${item.icon}" alt="" aria-hidden="true" /></div>
      <div>
        <strong>${item.name}</strong>
        <small>${item.stat}</small>
      </div>
      <button class="bag-action" type="button" data-equip="${item.id}">Geyin</button>
    </article>`)
    .join("");
  return `${slotCards}${inventoryCards || `<article class="bag-empty">Kraftdan sonra əşyalar burada görünəcək.</article>`}`;
}

function render() {
  const state = loadState();
  state.level = levelFromAuthority(state.authority);
  const list = document.querySelector("#bagList");
  if (activeTab === "equipment") {
    list.innerHTML = renderEquipment(state);
    return;
  }
  list.innerHTML = categories[activeTab]
    .map((item) => `<article class="bag-item">
      <div class="bag-item-icon"><span>${item.icon}</span></div>
      <div>
        <strong>${item.name}</strong>
        <small>${item.stat}</small>
      </div>
      <em>Çantada</em>
    </article>`)
    .join("");
}

document.addEventListener("click", (event) => {
  const equipButton = event.target.closest("[data-equip]");
  if (equipButton) {
    const state = loadState();
    const item = craftItemFromId(equipButton.dataset.equip);
    if (!item) return;
    const equipped = { ...(state.equipment || {}) };
    const bag = [...(state.bag || [])];
    const bagIndex = bag.indexOf(item.id);
    if (bagIndex !== -1) bag.splice(bagIndex, 1);
    if (equipped[item.slot]) bag.push(equipped[item.slot]);
    equipped[item.slot] = item.id;
    state.equipment = equipped;
    state.bag = bag;
    saveState(state);
    tg?.HapticFeedback?.notificationOccurred?.("success");
    render();
    return;
  }

  const tab = event.target.closest("[data-bag-tab]");
  if (!tab) return;
  activeTab = tab.dataset.bagTab;
  document.querySelectorAll("[data-bag-tab]").forEach((button) => {
    button.classList.toggle("is-active", button === tab);
  });
  tg?.HapticFeedback?.selectionChanged?.();
  render();
});

tg?.ready?.();
tg?.expand?.();
render();
