(() => {
  "use strict";

  const C = window.CONTENT;
  const DESIGN_WIDTH = 1440;
  const stage = document.getElementById("stage");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), C);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const state = {
    screen: "intake",
    answers: { interests: new Set(), team: null },
    open: "interests",
    picks: [],
    product: null,
    planIndex: 0,
    updatePending: false,
  };

  // ---------- Fit the 1440px design to any screen ----------
  function fit() {
    const zoom = window.innerWidth / DESIGN_WIDTH;
    const stageH = Math.round(window.innerHeight / zoom);
    document.documentElement.style.setProperty("--zoom", zoom);
    document.documentElement.style.setProperty("--stage-h", stageH + "px");
    state.stageH = stageH;
    if (state.screen === "detail") layoutDetail();
    if (state.screen === "reco") updateCarousel();
  }

  // ---------- Static copy ----------
  $$("[data-text]").forEach((el) => { el.textContent = get(el.dataset.text); });

  function renderNav() {
    const n = C.nav;
    const html = `
      <div class="util-bar">
        <span class="phone">${esc(n.phoneLabel)} <b>${esc(n.phone)}</b></span>
        ${n.utility.map((u) => `<span>${esc(u)}</span>`).join("")}
        <span class="with-icon">${esc(n.login)} <img src="assets/icons/util-dropdown.svg" alt=""></span>
        <img class="search" src="assets/icons/search.svg" alt="">
      </div>
      <div class="main-nav">
        <div class="main-nav-row">
          <div class="main-nav-left">
            <img src="assets/icons/logo-white.svg" alt="RingCentral">
            <div class="nav-links">
              ${n.links.map((l) => `<span>${esc(l.label)}${l.dropdown ? '<img src="assets/icons/nav-dropdown.svg" alt="">' : ""}</span>`).join("")}
            </div>
          </div>
          <button class="pill pill-white" data-action="my-demos">${esc(n.myDemos)}</button>
        </div>
        <div class="nav-line"></div>
      </div>`;
    $$("[data-nav]").forEach((el) => { el.innerHTML = html; });
  }

  // ---------- Screens ----------
  function show(name) {
    state.screen = name;
    $$(".screen").forEach((s) => s.classList.toggle("is-active", s.dataset.screen === name));
    if (name === "detail") { $("#detail-scroll").scrollTop = 0; layoutDetail(); onDetailScroll(); }
    if (name === "reco") requestAnimationFrame(updateCarousel);
  }

  // ---------- 1. Questionnaire ----------
  function renderIntake() {
    const wrap = $("#questions");
    wrap.innerHTML = C.intake.questions.map((q) => `
      <div class="question" data-q="${q.id}">
        <button class="q-row" data-action="toggle-q" data-q="${q.id}">
          <span class="q-label">${esc(q.label)}</span>
          <span class="q-field"><span class="q-field-text"></span><svg><use href="#i-caret"/></svg></span>
        </button>
        <div class="q-options"><div class="q-options-inner">
          <p class="q-hint">${esc(q.hint)}</p>
          <div class="chips">
            ${q.options.map((o) => `<button class="chip" data-action="chip" data-q="${q.id}" data-id="${o.id}" aria-pressed="false">${esc(o.label)}</button>`).join("")}
          </div>
        </div></div>
      </div>`).join("");
    syncIntake();
  }

  function syncIntake() {
    const { interests, team } = state.answers;
    C.intake.questions.forEach((q) => {
      const el = $(`.question[data-q="${q.id}"]`);
      el.classList.toggle("is-open", state.open === q.id);
      const chosen = q.options.filter((o) => (q.multi ? interests.has(o.id) : team === o.id));
      $(".q-field-text", el).textContent = chosen.map((o) => o.label).join(", ");
      $$(".chip", el).forEach((chip) => {
        chip.setAttribute("aria-pressed", String(chosen.some((o) => o.id === chip.dataset.id)));
      });
    });
    $('[data-action="continue"]').classList.toggle("is-disabled", !intakeComplete());
  }

  const intakeComplete = () => state.answers.interests.size > 0 && !!state.answers.team;

  function onChip(qid, id) {
    if (qid === "interests") {
      const s = state.answers.interests;
      s.has(id) ? s.delete(id) : s.add(id);
    } else {
      state.answers.team = id;
    }
    syncIntake();
  }

  function onContinue() {
    if (!state.answers.interests.size) { state.open = "interests"; syncIntake(); return; }
    if (!state.answers.team) { state.open = "team"; syncIntake(); return; }
    recommend();
    show("reco");
  }

  // ---------- 2. Recommendations ----------
  function recommend() {
    const answers = [...state.answers.interests, state.answers.team];
    const scored = C.products.map((p, i) => ({
      p, i, score: answers.reduce((sum, a) => sum + (p.score[a] || 0), 0),
    }));
    scored.sort((a, b) => b.score - a.score || a.i - b.i);
    state.picks = scored.slice(0, C.recommendations.count).map((s) => s.p);
    $("#reco-sub").textContent = C.recommendations.subtitle.replace("{count}", numberWord(state.picks.length));
    $("#carousel").innerHTML = state.picks.map((p, i) => `
      <button class="card${i === 0 ? " is-active" : ""}" data-action="open-product" data-id="${p.id}">
        <div class="card-media"><img src="${esc(p.card)}" alt="" draggable="false"></div>
        <div class="card-text">
          <p class="card-title">${esc(p.name)}</p>
          <p class="card-tagline">${esc(p.tagline)}</p>
        </div>
      </button>`).join("");
    $("#carousel").scrollLeft = 0;
  }

  const numberWord = (n) => ["zero", "one", "two", "three", "four", "five", "six"][n] || String(n);

  // Snap stops: each card lines up with the left edge; the last ones settle against the right edge.
  function snapStops() {
    const car = $("#carousel");
    const max = car.scrollWidth - car.clientWidth;
    const stops = $$(".card", car).map((card) => Math.max(0, Math.min(max, card.offsetLeft - CAROUSEL_PAD)));
    return stops.filter((x, i) => i === 0 || x - stops[i - 1] > 1);
  }

  function activeIndex() {
    const stops = snapStops();
    const x = $("#carousel").scrollLeft;
    let best = 0;
    stops.forEach((s, i) => { if (Math.abs(s - x) < Math.abs(stops[best] - x)) best = i; });
    return best;
  }

  function updateCarousel() {
    const cards = $$(".card");
    if (!cards.length) return;
    const stops = snapStops();
    const idx = activeIndex();
    cards.forEach((c, i) => c.classList.toggle("is-active", i === idx));
    $('.screen-reco [data-action="prev"]').disabled = idx === 0;
    $('.screen-reco [data-action="next"]').disabled = idx === stops.length - 1;
  }

  const CAROUSEL_PAD = 76;

  // Drag with a mouse or pen (touch already scrolls natively). A quick flick carries
  // on to the next card, then it settles on the nearest stop.
  function initCarouselDrag() {
    const car = $("#carousel");
    let drag = null;
    let suppressClick = false;
    car.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      drag = { id: e.pointerId, startX: e.clientX, startLeft: car.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false };
    });
    car.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--zoom")) || 1;
      const now = performance.now();
      const dx = (e.clientX - drag.startX) / zoom;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        car.setPointerCapture(drag.id);
        car.classList.add("is-dragging");
      }
      if (!drag.moved) return;
      car.scrollLeft = drag.startLeft - dx;
      const dt = Math.max(1, now - drag.lastT);
      drag.v = 0.8 * (((e.clientX - drag.lastX) / zoom) / dt) + 0.2 * drag.v;
      drag.lastX = e.clientX;
      drag.lastT = now;
    });
    const end = () => {
      if (!drag) return;
      if (!drag.moved) { drag = null; return; }
      suppressClick = true;
      const projected = car.scrollLeft - drag.v * 250;
      const stops = snapStops();
      const target = stops.reduce((best, x) => (Math.abs(x - projected) < Math.abs(best - projected) ? x : best), stops[0]);
      drag = null;
      car.scrollTo({ left: target, behavior: "smooth" });
      setTimeout(() => car.classList.remove("is-dragging"), 450);
    };
    car.addEventListener("pointerup", end);
    car.addEventListener("pointercancel", end);
    // A drag that ends over a card shouldn't open it
    car.addEventListener("click", (e) => {
      if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
    }, true);
  }

  function stepCarousel(dir) {
    const stops = snapStops();
    const idx = Math.max(0, Math.min(stops.length - 1, activeIndex() + dir));
    $("#carousel").scrollTo({ left: stops[idx], behavior: "smooth" });
  }

  // ---------- 3. Product detail ----------
  const FOOTER_SOCIALS = [
    '<path fill-rule="evenodd" d="M17.35 22v-5.4h1.64l.27-2.4h-1.91v-1.17c0-.62.02-1.23.88-1.23h.87v-1.72c0-.03-.75-.08-1.51-.08-1.59 0-2.58.99-2.58 2.82v1.38h-1.75v2.4h1.75V22h2.34Z"/>',
    '<path fill-rule="evenodd" d="M13.74 10.07c-.97.05-1.82.29-2.5.97-.69.68-.92 1.53-.97 2.5-.03.6-.19 5.16.28 6.36.31.8.93 1.43 1.75 1.74.38.15.81.25 1.44.28 5.32.24 7.29.11 8.12-2.02.15-.38.25-.81.28-1.45.24-5.33-.04-6.48-.97-7.41-.73-.73-1.6-1.23-7.43-.97Zm.05 10.77c-.58-.03-.9-.12-1.1-.2a1.94 1.94 0 0 1-1.14-1.13c-.35-.91-.24-5.22-.2-5.92.03-.68.17-1.3.65-1.79.6-.6 1.37-.89 6.62-.65.68.03 1.31.17 1.8.65.6.6.89 1.37.65 6.6-.03.58-.12.9-.2 1.1-.54 1.39-1.79 1.58-7.07 1.34Zm4.88-8.03c0 .4.32.72.72.72a.71.71 0 1 0-.72-.72Zm-5.53 3.18a3.06 3.06 0 1 0 6.13 0 3.06 3.06 0 0 0-6.13 0Zm1.07 0a1.99 1.99 0 1 1 3.98 0 1.99 1.99 0 0 1-3.98 0Z"/>',
    '<path fill-rule="evenodd" d="M21.14 21h-2v-3.5c0-.96-.42-1.5-1.18-1.5-.83 0-1.32.56-1.32 1.5V21h-2v-6.5h2v.73s.63-1.1 2.04-1.1c1.41 0 2.46.86 2.46 2.65V21Zm-8.77-7.54a1.23 1.23 0 1 1 0-2.46 1.23 1.23 0 0 1 0 2.46ZM11.15 21h2.5v-6.5h-2.5V21Z"/>',
    '<path d="M10 10h4.61l2.69 3.85L20.63 10h1.45l-4.13 4.78L23 22h-4.61l-2.98-4.27L11.72 22h-1.47l4.5-5.2L10 10Zm2.23 1.18 6.75 9.63h1.79l-6.75-9.63h-1.79Z"/>',
    '<path d="M22.45 11.86c-.5-.61-1.44-.86-3.22-.86h-6.46c-1.82 0-2.77.26-3.28.91C9 12.55 9 13.48 9 14.77v2.46c0 2.5.58 3.77 3.77 3.77h6.46c1.55 0 2.41-.22 2.96-.76.57-.55.81-1.45.81-3.01v-2.46c0-1.36-.04-2.3-.55-2.91Zm-4.46 4.48-2.94 1.56a.45.45 0 0 1-.66-.41v-3.1a.45.45 0 0 1 .66-.4l2.94 1.54a.45.45 0 0 1 0 .81Z"/>',
    '<path d="M21.31 12.28a3.3 3.3 0 0 1-2.6-2.97V9h-2.37v9.57a2.2 2.2 0 0 1-3.58 1.22 2.2 2.2 0 0 1 2.19-3.16v-2.45a4.6 4.6 0 0 0-3.71 7.48 4.6 4.6 0 0 0 7.47-3.09v-4.89A5.6 5.6 0 0 0 22 14.75v-2.4c-.23 0-.46-.02-.69-.07Z"/>',
  ];

  function renderDetail(p) {
    state.product = p;
    state.planIndex = 0;
    const D = C.detail;
    $("#d-hero-img").style.backgroundImage = `url("${p.hero}")`;
    $("#d-title").textContent = p.name;
    $("#d-tagline").textContent = p.tagline;

    $("#d-panel").innerHTML = `
      <div class="d-left">
        <p class="d-desc">${esc(p.description)}</p>
        <div class="d-tags">${p.tags.map(esc).join("<i></i>")}</div>
        <p class="d-features-title">${esc(D.topFeatures)}</p>
        <ul class="d-features">
          ${p.features.map((f) => `<li><img src="assets/icons/f-${f.icon}.svg" alt="">${esc(f.text)}</li>`).join("")}
        </ul>
        <button class="d-viewall" data-action="handoff">${esc(D.viewAll)} <img src="assets/icons/view-all.svg" alt=""></button>
      </div>
      <div class="plan-card">
        <div class="plan-slide" id="plan-slide"></div>
        <div class="plan-nav">
          <button class="arrow" data-action="plan-prev" aria-label="Previous plan"><svg width="9" height="17"><use href="#i-chev-left"/></svg></button>
          <div class="plan-dots" id="plan-dots"></div>
          <button class="arrow" data-action="plan-next" aria-label="Next plan"><svg width="9" height="17"><use href="#i-chev-right"/></svg></button>
        </div>
      </div>`;
    renderPlan(false);

    const F = C.footer;
    $("#d-cta").innerHTML = `
      <div class="cta-inner">
        <h2 class="cta-title">${esc(D.ctaTitle)}</h2>
        <div class="cta-buttons">
          <button class="pill pill-white" data-action="handoff"><img src="assets/icons/calendar.svg" alt="">${esc(D.scheduleNow)}</button>
          <button class="pill pill-outline" data-action="handoff"><img src="assets/icons/phone.svg" alt="">${esc(D.callNow)}</button>
        </div>
      </div>
      <footer class="site-footer">
        <div class="footer-top">
          <img src="assets/icons/logo-mint.svg" alt="RingCentral">
          <span class="region"><img src="assets/icons/world.svg" alt="">${esc(F.region)}<svg width="11" height="7"><use href="#i-caret"/></svg></span>
        </div>
        <div class="footer-cols">
          ${F.columns.map((c) => `<div class="footer-col"><h4>${esc(c.title)}</h4>${c.links.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`).join("")}
        </div>
        <div class="footer-bottom">
          <div>
            <div class="legal">${F.legal.map(esc).join("<span>|</span>")}</div>
            <p>${esc(F.copyright)}</p>
          </div>
          <div class="socials">${FOOTER_SOCIALS.map((path) => `<svg viewBox="0 0 32 32" fill="#BDDBCA">${path}</svg>`).join("")}</div>
        </div>
      </footer>`;
  }

  function renderPlan(animate) {
    const plans = state.product.plans;
    const plan = plans[state.planIndex];
    const D = C.detail;
    const slide = $("#plan-slide");
    slide.innerHTML = `
      <p class="plan-eyebrow">${esc(D.planEyebrow)}</p>
      <div class="plan-price"><strong>${esc(plan.price)}</strong>${plan.was ? `<s>${esc(plan.was)}</s>` : ""}</div>
      <p class="plan-unit">${esc(plan.unit)}</p>
      <p class="plan-name">${esc(plan.name)}</p>
      <p class="plan-body">${esc(plan.body)}</p>
      <div class="plan-buttons">
        <button class="pill pill-white" data-action="handoff">${esc(D.tryFree)}</button>
        <button class="pill pill-outline" data-action="handoff">${esc(D.buyNow)}</button>
      </div>`;
    $("#plan-dots").innerHTML = plans.length > 1 ? plans.map((_, i) => `<i class="${i === state.planIndex ? "is-active" : ""}"></i>`).join("") : "";
    $$(".plan-nav .arrow").forEach((a) => { a.style.visibility = plans.length > 1 ? "visible" : "hidden"; });
    if (animate) {
      slide.classList.add("is-entering");
      requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.remove("is-entering")));
    }
  }

  function stepPlan(dir) {
    const n = state.product.plans.length;
    state.planIndex = (state.planIndex + dir + n) % n;
    renderPlan(true);
  }

  // Layering scroll: the hero stays put while the title and white panel slide over it,
  // the panel then pins in place and the green "questions" section slides over it.
  const TAGLINE_PINNED_Y = 203; // where the tagline rests once pinned (Figma frame 2)
  const TITLE_MIN_SCALE = 32 / 56;
  let detailPin = 0;

  function layoutDetail() {
    const main = $("#d-main");
    const tagline = $("#d-tagline");
    const pinForTitle = TAGLINE_PINNED_Y - offsetWithin(tagline, main);
    const pinForPanel = state.stageH - main.offsetHeight;
    // Prefer showing the whole panel, but never push the title up under the nav bar.
    detailPin = Math.max(Math.min(pinForTitle, pinForPanel), pinForTitle - 32);
    main.style.top = detailPin + "px";
  }

  function offsetWithin(el, ancestor) {
    let y = 0;
    for (let n = el; n && n !== ancestor; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  function onDetailScroll() {
    const y = $("#detail-scroll").scrollTop;
    const travel = Math.max(1, -detailPin);
    const t = Math.min(1, y / travel);
    $("#d-title").style.transform = `scale(${1 - t * (1 - TITLE_MIN_SCALE)})`;
    $("#d-panel").style.borderRadius = `${16 + 16 * t}px ${16 + 16 * t}px 0 0`;
    $("#d-hero-img").style.transform = `translate3d(0, ${-0.48 * Math.min(y, travel)}px, 0)`;
  }

  // ---------- Modals ----------
  function openModal(copy) {
    $("#modal-title").textContent = copy.title;
    $("#modal-body").textContent = copy.body;
    $("#modal-close").textContent = copy.close;
    $("#modal").hidden = false;
  }

  // ---------- Reset & idle ----------
  function reset() {
    state.answers.interests.clear();
    state.answers.team = null;
    state.open = "interests";
    state.picks = [];
    $$(".overlay").forEach((o) => { o.hidden = true; });
    syncIntake();
    show("intake");
    if (state.updatePending) { location.reload(); return; }
    checkForUpdate();
  }

  const isPristine = () => state.screen === "intake" && !state.answers.interests.size && !state.answers.team && $("#modal").hidden;

  let idleTimer = null;
  let countdownTimer = null;
  function bumpIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startCountdown, C.idle.timeoutSeconds * 1000);
  }
  function startCountdown() {
    if (isPristine()) { bumpIdle(); return; }
    let left = C.idle.seconds;
    $("#idle-count").textContent = left;
    $("#idle").hidden = false;
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      left -= 1;
      $("#idle-count").textContent = left;
      if (left <= 0) { stopCountdown(); reset(); }
    }, 1000);
  }
  function stopCountdown() {
    clearInterval(countdownTimer);
    $("#idle").hidden = true;
    bumpIdle();
  }
  ["pointerdown", "touchstart", "keydown", "wheel"].forEach((ev) =>
    window.addEventListener(ev, () => { if ($("#idle").hidden) bumpIdle(); }, { passive: true, capture: true }));
  $("#detail-scroll").addEventListener("scroll", () => { bumpIdle(); onDetailScroll(); }, { passive: true });
  $("#carousel").addEventListener("scroll", () => { bumpIdle(); updateCarousel(); }, { passive: true });

  // ---------- Actions ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    switch (el.dataset.action) {
      case "toggle-q": state.open = state.open === el.dataset.q ? null : el.dataset.q; syncIntake(); break;
      case "chip": onChip(el.dataset.q, el.dataset.id); break;
      case "continue": onContinue(); break;
      case "restart": reset(); break;
      case "edit": state.open = "interests"; syncIntake(); show("intake"); break;
      case "share": openModal(C.shareSheet); break;
      case "prev": stepCarousel(-1); break;
      case "next": stepCarousel(1); break;
      case "open-product": renderDetail(C.products.find((p) => p.id === el.dataset.id)); show("detail"); break;
      case "back": show("reco"); break;
      case "my-demos": if (state.picks.length) show("reco"); break;
      case "plan-prev": stepPlan(-1); break;
      case "plan-next": stepPlan(1); break;
      case "handoff": openModal(C.handoff); break;
      case "close-modal": $("#modal").hidden = true; break;
      case "stay": stopCountdown(); break;
      case "close-admin": $("#admin").hidden = true; break;
      case "check-update": checkForUpdate(true); break;
      case "hard-reload": hardReload(); break;
    }
  });
  // Tapping the dimmed area closes the info modal
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") $("#modal").hidden = true; });

  // Block pinch-zoom and long-press menus on iPad
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // ---------- Staff menu: hold the top-left corner for 3 seconds ----------
  let holdTimer = null;
  const hotspot = $("#admin-hotspot");
  hotspot.addEventListener("pointerdown", () => {
    holdTimer = setTimeout(async () => {
      $("#admin-version").textContent = await currentVersion();
      $("#admin-status").textContent = "";
      $("#admin").hidden = false;
    }, 3000);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hotspot.addEventListener(ev, () => clearTimeout(holdTimer)));

  // ---------- Offline + auto-update ----------
  // sw.js carries a build version; every deploy changes it, the new worker installs in the
  // background, and the app swaps to it the next time the kiosk is idle on the start screen.
  let registration = null;

  async function currentVersion() {
    if (!("caches" in window)) return "dev";
    const keys = await caches.keys();
    const key = keys.find((k) => k.startsWith("rc-kiosk-"));
    return key ? key.replace("rc-kiosk-", "") : "not cached";
  }

  async function checkForUpdate(fromAdmin) {
    if (!registration) return;
    try {
      await registration.update();
      if (fromAdmin) $("#admin-status").textContent = registration.installing || registration.waiting ? "Update found, installing…" : "You’re on the latest version.";
    } catch (err) {
      if (fromAdmin) $("#admin-status").textContent = "Offline. The app will update when it’s back online.";
    }
  }

  async function hardReload() {
    if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    if (registration) await registration.unregister();
    location.reload();
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      registration = reg;
      setInterval(() => checkForUpdate(), 5 * 60 * 1000);
    });
    let hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController) { hadController = true; return; } // first install, nothing to swap
      if (isPristine()) location.reload();
      else state.updatePending = true;
    });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) checkForUpdate(); });
  }

  // ---------- Boot ----------
  renderNav();
  renderIntake();
  initCarouselDrag();
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", () => setTimeout(fit, 200));
  if (document.fonts) document.fonts.ready.then(() => { if (state.screen === "detail") layoutDetail(); });
  bumpIdle();
})();
