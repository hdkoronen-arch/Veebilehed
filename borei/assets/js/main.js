/* BOREI · saidi skriptid (ilma sõltuvusteta) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Lahtiolekuajad: 0 = pühapäev ... 6 = laupäev. [avamine, sulgemine] tundides. */
  var HOURS = { 0: [10, 16], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 16] };
  var DAYS_SHORT = ["P", "E", "T", "K", "N", "R", "L"];
  var DAYS_LONG = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
  var MONTHS = ["jaan", "veebr", "märts", "apr", "mai", "juuni", "juuli", "aug", "sept", "okt", "nov", "dets"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }

  /* ---------- Menüü ---------- */
  var mnav = $(".mobile-nav");
  var lastFocus = null;
  function setMenu(open) {
    if (!mnav) return;
    if (open) lastFocus = document.activeElement;
    mnav.classList.toggle("open", open);
    mnav.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    $$(".menu-toggle").forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
    if (open) { var c = $(".close", mnav); if (c) c.focus(); }
    else if (lastFocus) lastFocus.focus();
  }
  $$("[data-menu-open]").forEach(function (b) { b.addEventListener("click", function () { setMenu(true); }); });
  $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (mnav && mnav.classList.contains("open")) setMenu(false); closeLightbox(); }
  });

  /* ---------- Mobiili broneerimisriba ---------- */
  var sticky = $(".sticky-book");
  if (sticky) {
    document.body.classList.add("has-sticky");
    var onScroll = function () { sticky.classList.toggle("show", window.scrollY > 480); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Täna avatud / suletud ---------- */
  var now = new Date();
  var today = now.getDay();
  $$(".hours tr[data-day]").forEach(function (tr) {
    if (tr.getAttribute("data-day").split(",").indexOf(String(today)) > -1) tr.classList.add("today");
  });
  $$("[data-status]").forEach(function (el) {
    var h = HOURS[today];
    var t = now.getHours() + now.getMinutes() / 60;
    var open = t >= h[0] && t < h[1];
    el.classList.toggle("is-open", open);
    el.textContent = open ? "Avatud täna " + pad(h[0]) + ":00–" + pad(h[1]) + ":00" : (t < h[0] ? "Avame täna kell " + pad(h[0]) + ":00" : "Täna suletud, homme " + pad(HOURS[(today + 1) % 7][0]) + ":00");
  });
  $$("[data-year]").forEach(function (el) { el.textContent = now.getFullYear(); });

  /* ---------- Ilmumine ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Galerii ---------- */
  var gallery = $(".gallery");
  var lb = $(".lightbox");
  var lbIndex = 0;
  function visibleItems() { return $$(".gallery figure").filter(function (f) { return !f.hidden; }); }
  function showLightbox(i) {
    var items = visibleItems();
    if (!lb || !items.length) return;
    lbIndex = (i + items.length) % items.length;
    var fig = items[lbIndex];
    var src = $(".ph", fig);
    var target = $(".ph", lb);
    target.innerHTML = src.innerHTML;
    $(".lb-cap", lb).textContent = (lbIndex + 1) + " / " + items.length + " · " + $$("figcaption span", fig).map(function (x) { return x.textContent.trim(); }).join(" · ");
    if (!lb.classList.contains("open")) { lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); lastFocus = document.activeElement; $(".lb-close", lb).focus(); }
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains("open")) return;
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  if (gallery) {
    var figs = $$("figure", gallery);
    $$(".chip[data-filter]").forEach(function (chip) {
      var f = chip.getAttribute("data-filter");
      var n = f === "all" ? figs.length : figs.filter(function (x) { return x.getAttribute("data-cat") === f; }).length;
      var s = document.createElement("span"); s.className = "n"; s.textContent = n; chip.appendChild(s);
      chip.addEventListener("click", function () {
        $$(".chip[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        figs.forEach(function (x) { x.hidden = !(f === "all" || x.getAttribute("data-cat") === f); });
      });
    });
    figs.forEach(function (fig) {
      $("button", fig).addEventListener("click", function () { showLightbox(visibleItems().indexOf(fig)); });
    });
  }
  if (lb) {
    $(".lb-close", lb).addEventListener("click", closeLightbox);
    $(".lb-prev", lb).addEventListener("click", function () { showLightbox(lbIndex - 1); });
    $(".lb-next", lb).addEventListener("click", function () { showLightbox(lbIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
      if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
    });
  }

  /* ---------- Vormide valideerimine ---------- */
  function validate(form) {
    var ok = true, first = null;
    $$("[required]", form).forEach(function (el) {
      var wrap = el.closest(".field") || el.closest(".check");
      var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
      if (valid && el.type === "email" && el.value.trim()) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (valid && el.type === "tel") valid = el.value.replace(/[^\d]/g, "").length >= 7;
      if (wrap) wrap.classList.toggle("invalid", !valid);
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  $$("form[data-simple]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var done = document.getElementById(form.getAttribute("data-simple"));
      form.hidden = true;
      if (done) { done.hidden = false; done.setAttribute("tabindex", "-1"); done.focus(); }
    });
    form.addEventListener("input", function (e) {
      var w = e.target.closest(".field.invalid, .check.invalid");
      if (w) w.classList.remove("invalid");
    });
  });

  /* ---------- Broneerimine ---------- */
  var bk = $("#booking");
  if (bk) {
    var SERVICES = JSON.parse($("#services-data").textContent);
    var MASTERS = JSON.parse($("#masters-data").textContent);
    var state = { service: null, master: null, date: null, time: null };
    var step = 1;

    function svc(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }
    function mst(id) { for (var i = 0; i < MASTERS.length; i++) if (MASTERS[i].id === id) return MASTERS[i]; return null; }

    /* 1. teenused */
    var list = $("#svc-list");
    var group = "";
    SERVICES.forEach(function (s) {
      if (s.group !== group) {
        group = s.group;
        var g = document.createElement("div"); g.className = "opt-group"; g.textContent = group; list.appendChild(g);
      }
      var l = document.createElement("label"); l.className = "opt-card";
      l.innerHTML = '<input type="radio" name="service" value="' + s.id + '"><span class="box" aria-hidden="true"></span>' +
        '<span class="t">' + s.name + '<span class="s">' + s.desc + '</span></span>' +
        '<span class="r">' + s.price + ' €<small>' + s.dur + ' min</small></span>';
      list.appendChild(l);
    });

    /* 2. meistrid */
    var mlist = $("#master-list");
    MASTERS.forEach(function (m) {
      var l = document.createElement("label"); l.className = "master";
      l.innerHTML = '<input type="radio" name="master" value="' + m.id + '">' +
        (m.id === "any" ? '<span class="any" aria-hidden="true">?</span>' : '<span class="ph" style="--ar:1/1"><span>Foto</span></span>') +
        '<span class="mi"><b>' + m.name + '</b><small>' + m.role + '</small></span>';
      mlist.appendChild(l);
    });

    function markChecked(name) {
      $$('input[name="' + name + '"]', bk).forEach(function (i) {
        var c = i.closest(".opt-card, .master"); if (c) c.classList.toggle("is-checked", i.checked);
      });
    }

    bk.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "service") { state.service = t.value; state.time = null; markChecked("service"); renderSlots(); }
      if (t.name === "master") { state.master = t.value; state.time = null; markChecked("master"); renderSlots(); }
      update();
    });

    /* 3. päevad ja ajad */
    var daysEl = $("#days"), slotsEl = $("#slots"), slotsNote = $("#slots-note");
    var start = new Date(); start.setHours(0, 0, 0, 0);
    for (var d = 0; d < 14; d++) {
      var dt = new Date(start); dt.setDate(start.getDate() + d);
      var b = document.createElement("button");
      b.type = "button"; b.className = "day"; b.setAttribute("aria-pressed", "false");
      b.dataset.date = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
      b.innerHTML = "<small>" + (d === 0 ? "Täna" : DAYS_SHORT[dt.getDay()]) + "</small><b>" + dt.getDate() + "</b><small>" + MONTHS[dt.getMonth()] + "</small>";
      b.setAttribute("aria-label", DAYS_LONG[dt.getDay()] + ", " + dt.getDate() + ". " + MONTHS[dt.getMonth()]);
      daysEl.appendChild(b);
    }
    daysEl.addEventListener("click", function (e) {
      var b = e.target.closest(".day"); if (!b) return;
      $$(".day", daysEl).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      state.date = b.dataset.date; state.time = null;
      renderSlots(); update();
    });

    function seeded(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return function () { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; }; }

    function renderSlots() {
      slotsEl.innerHTML = "";
      if (!state.date) { slotsNote.textContent = "Vali kõigepealt päev."; return; }
      var p = state.date.split("-"), day = new Date(+p[0], +p[1] - 1, +p[2]);
      var h = HOURS[day.getDay()], dur = state.service ? svc(state.service).dur : 30;
      var rnd = seeded(state.date + (state.master || "any"));
      var nowD = new Date(), isToday = day.toDateString() === nowD.toDateString();
      var free = 0;
      for (var m = h[0] * 60; m + dur <= h[1] * 60; m += 30) {
        var label = pad(Math.floor(m / 60)) + ":" + pad(m % 60);
        var past = isToday && m <= nowD.getHours() * 60 + nowD.getMinutes() + 30;
        var taken = rnd() < (state.master === "any" ? 0.22 : 0.4);
        var s = document.createElement("button");
        s.type = "button"; s.className = "slot"; s.textContent = label;
        s.setAttribute("aria-pressed", String(state.time === label));
        if (past || taken) { s.disabled = true; s.setAttribute("aria-label", label + ", hõivatud"); } else free++;
        slotsEl.appendChild(s);
      }
      slotsNote.textContent = free ? DAYS_LONG[day.getDay()].charAt(0).toUpperCase() + DAYS_LONG[day.getDay()].slice(1) + ": " + free + " vaba aega. Lahti " + pad(h[0]) + ":00–" + pad(h[1]) + ":00." : "Sel päeval vabu aegu enam pole. Vali teine päev.";
    }
    slotsEl.addEventListener("click", function (e) {
      var s = e.target.closest(".slot"); if (!s || s.disabled) return;
      $$(".slot", slotsEl).forEach(function (x) { x.setAttribute("aria-pressed", String(x === s)); });
      state.time = s.textContent; update();
    });

    /* Kokkuvõte ja sammud */
    var nextBtn = $("#next"), backBtn = $("#back");
    function stepValid(n) {
      if (n === 1) return !!state.service;
      if (n === 2) return !!state.master;
      if (n === 3) return !!(state.date && state.time);
      return true;
    }
    function fmtDate(iso) { var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]); return DAYS_SHORT[d.getDay()] + " " + d.getDate() + ". " + MONTHS[d.getMonth()]; }
    function update() {
      var s = state.service && svc(state.service);
      $("#sum-service").textContent = s ? s.name : "–";
      $("#sum-master").textContent = state.master ? mst(state.master).name : "–";
      $("#sum-date").textContent = state.date ? fmtDate(state.date) : "–";
      $("#sum-time").textContent = state.time ? state.time + (s ? " (" + s.dur + " min)" : "") : "–";
      $("#sum-total").textContent = s ? s.price + " €" : "0 €";
      nextBtn.disabled = !stepValid(step);
    }
    function go(n) {
      step = n;
      $$(".step", bk).forEach(function (el) { el.hidden = +el.dataset.step !== n; });
      $$(".steps li").forEach(function (li, i) {
        li.classList.toggle("done", i + 1 < n); li.classList.toggle("current", i + 1 === n);
        if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      backBtn.style.visibility = n === 1 ? "hidden" : "visible";
      nextBtn.innerHTML = n === 4 ? 'Kinnita broneering <span class="arr">→</span>' : 'Edasi <span class="arr">→</span>';
      update();
      var h = $('.step[data-step="' + n + '"] h2', bk);
      if (h && window._bkStarted) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); bk.scrollIntoView({ behavior: "smooth", block: "start" }); }
      window._bkStarted = true;
    }
    nextBtn.addEventListener("click", function () {
      if (!stepValid(step)) return;
      if (step < 4) { go(step + 1); return; }
      var form = $("#bk-form");
      if (!validate(form)) return;
      var s = svc(state.service);
      $("#done-text").textContent = s.name + ", " + fmtDate(state.date) + " kell " + state.time + ". Meister: " + mst(state.master).name + ". Hind " + s.price + " €, tasumine salongis.";
      $("#done-name").textContent = $("#b-name").value.trim().split(" ")[0];
      $("#bk-flow").hidden = true;
      var done = $("#bk-done"); done.hidden = false; done.setAttribute("tabindex", "-1"); done.focus();
      bk.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    backBtn.addEventListener("click", function () { if (step > 1) go(step - 1); });
    $("#bk-form").addEventListener("input", function (e) { var w = e.target.closest(".invalid"); if (w) w.classList.remove("invalid"); });

    /* ?teenus=... eelvalik */
    var pre = new URLSearchParams(location.search).get("teenus");
    if (pre && svc(pre)) {
      var r = $('input[name="service"][value="' + pre + '"]', bk);
      if (r) { r.checked = true; state.service = pre; markChecked("service"); }
    }
    renderSlots();
    go(1);
  }

  /* ---------- Kinkekaart ---------- */
  var gc = $("#giftcard");
  if (gc) {
    var card = $(".card-gc"), val = $("#gc-val"), to = $("#gc-to"), from = $("#gc-from"), msg = $("#gc-msg"), code = $("#gc-code");
    var amount = "30 €";
    function randCode() { var c = "BOR-"; for (var i = 0; i < 6; i++) c += "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)); return c; }
    code.textContent = randCode();
    function render() {
      var type = $('input[name="gc-type"]:checked', gc).value;
      var svcSel = $("#gc-service");
      if (type === "summa") { val.textContent = amount; }
      else { val.textContent = svcSel.options[svcSel.selectedIndex].text.split(" · ")[0]; }
      $("#gc-amount-wrap").hidden = type !== "summa";
      $("#gc-service-wrap").hidden = type === "summa";
      val.style.fontSize = type === "summa" ? "" : "clamp(1.7rem, 5.4vw, 2.8rem)";
      to.textContent = $("#g-to").value.trim() || "Saaja nimi";
      from.textContent = $("#g-from").value.trim() || "Sinu nimi";
      msg.textContent = $("#g-msg").value.trim();
    }
    $$(".amounts .chip", gc).forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".amounts .chip", gc).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        var custom = $("#g-custom-wrap");
        if (c.dataset.v === "muu") { custom.hidden = false; $("#g-custom").focus(); amount = ($("#g-custom").value || "0") + " €"; }
        else { custom.hidden = true; amount = c.dataset.v + " €"; }
        render();
      });
    });
    $("#g-custom").addEventListener("input", function () { amount = (this.value || "0") + " €"; render(); });
    $$(".swatch", gc).forEach(function (s) {
      s.addEventListener("click", function () {
        $$(".swatch", gc).forEach(function (x) { x.setAttribute("aria-pressed", String(x === s)); });
        card.className = "card-gc " + s.dataset.theme;
      });
    });
    gc.addEventListener("input", render);
    gc.addEventListener("change", render);
    gc.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($('input[name="gc-type"]:checked', gc).value === "summa" && parseInt(amount, 10) < 10) { toast("Kinkekaardi väikseim summa on 10 €."); return; }
      if (!validate(gc)) return;
      gc.hidden = true;
      $("#gc-done-code").textContent = code.textContent;
      var d = $("#gc-done"); d.hidden = false; d.setAttribute("tabindex", "-1"); d.focus();
    });
    render();
  }
})();
