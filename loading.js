(function () {
  const tips = [
    "Avtoritet seviyye demekdir: dovuslerde qazan, amma magara dovusleri avtoritet vermir.",
    "Kohne Tunel material toplamaq ucundur: metal, parca ve detal craft ucun lazimdir.",
    "Tam sinif komplekti geyinende elave bonus acilir.",
    "Guc zerbeni artirir, ceviklik yayinma sansi verir, krit qirmizi zerbe acir.",
    "Mag geyimi mana verir. Mana yoxdursa magik priyomlar dovusde islemir.",
    "Priyomlar bolmesinde dovuse aparacagin 4 priyomu sec.",
    "Auto duymesi her raund ucun ayrica basilir: bu senin gedisini tesdiq edir.",
    "8-ci seviyeden sonra avtoritet cox cetin yigilir. Seher efsanesi olmaq uzun yoldur.",
  ];

  const minShowMs = 30000;
  const startedAt = performance.now();
  let progress = 8;
  let tipIndex = Math.floor(Math.random() * tips.length);
  let progressTimer;
  let tipTimer;
  let closing = false;

  function buildLoader() {
    if (sessionStorage.getItem("avtoritet-loader-seen") === "1") return null;
    if (document.querySelector(".game-loader")) return null;
    sessionStorage.setItem("avtoritet-loader-seen", "1");

    const loader = document.createElement("section");
    loader.className = "game-loader";
    loader.setAttribute("aria-label", "Oyun yuklenir");
    loader.innerHTML = `
      <img class="loader-art" src="assets/loading/loading-screen.png" alt="" aria-hidden="true" />
      <div class="loader-vignette" aria-hidden="true"></div>
      <div class="loader-panel">
        <p class="loader-kicker">Baki kuceleri</p>
        <strong>AVTORITET</strong>
        <span class="loader-status">Oyun yuklenir</span>
      </div>
      <div class="loader-bottom">
        <div class="loader-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="8">
          <span></span>
          <em>8%</em>
        </div>
        <div class="loader-tip">
          <span>MESLEHET</span>
          <p>${tips[tipIndex]}</p>
        </div>
      </div>
    `;
    document.body.prepend(loader);
    document.body.classList.add("is-loading");
    return loader;
  }

  function setProgress(loader, value) {
    progress = Math.max(progress, Math.min(100, value));
    const bar = loader.querySelector(".loader-progress span");
    const text = loader.querySelector(".loader-progress em");
    const root = loader.querySelector(".loader-progress");
    if (bar) bar.style.width = `${progress}%`;
    if (text) text.textContent = `${Math.round(progress)}%`;
    if (root) root.setAttribute("aria-valuenow", String(Math.round(progress)));
  }

  function rotateTip(loader) {
    tipIndex = (tipIndex + 1) % tips.length;
    const tip = loader.querySelector(".loader-tip p");
    if (!tip) return;
    tip.classList.remove("is-visible");
    window.setTimeout(() => {
      tip.textContent = tips[tipIndex];
      tip.classList.add("is-visible");
    }, 180);
  }

  function hideLoader(loader) {
    if (closing) return;
    closing = true;
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, minShowMs - elapsed);
    window.setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(tipTimer);
      setProgress(loader, 100);
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      window.setTimeout(() => loader.remove(), 520);
    }, wait);
  }

  function start() {
    const loader = buildLoader();
    if (!loader) return;

    loader.querySelector(".loader-tip p")?.classList.add("is-visible");
    progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const target = Math.min(99, 8 + (elapsed / minShowMs) * 91);
      setProgress(loader, target);
    }, 250);
    tipTimer = window.setInterval(() => rotateTip(loader), 4300);

    if (document.readyState === "complete") {
      hideLoader(loader);
    } else {
      window.addEventListener("load", () => hideLoader(loader), { once: true });
      window.setTimeout(() => hideLoader(loader), minShowMs + 600);
    }
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
