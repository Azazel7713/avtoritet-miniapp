const tg = window.Telegram?.WebApp;
const levelThresholds = [0, 500, 1200, 2500, 5000, 12500, 30000, 300000, 500000, 1000000, 1500000, 2500000, 3500000, 4500000, 5500000];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem("avtoritet-state")) || {};
  } catch {
    return {};
  }
}

function levelFromAuthority(authority = 0) {
  let level = 1;
  levelThresholds.forEach((required, index) => {
    if (authority >= required) level = index + 1;
  });
  return Math.min(15, level);
}

function render() {
  const state = loadState();
  const level = levelFromAuthority(state.authority || 0);
  const cooldownUntil = Number(localStorage.getItem("avtoritet-cave-cooldown") || 0);
  const cooldownLeft = Math.max(0, cooldownUntil - Date.now());
  const link = document.querySelector("#caveOneLink");
  const status = document.querySelector("#caveOneStatus");
  if (cooldownLeft > 0) {
    const minutes = Math.ceil(cooldownLeft / 60000);
    link.classList.add("is-locked");
    link.removeAttribute("href");
    status.textContent = `${minutes} deq sonra`;
  } else {
    link.classList.remove("is-locked");
    link.href = "cave.html";
    status.textContent = "Aciq";
  }
}

tg?.ready?.();
tg?.expand?.();
render();
setInterval(render, 30000);
