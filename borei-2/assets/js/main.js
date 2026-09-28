/* BOREI v2 · saidi skriptid (ilma sõltuvusteta) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Lahtiolekuajad: 0 = pühapäev ... 6 = laupäev */
  var HOURS = { 0: [10, 16], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 16] };
  var DOW = ["P", "E", "T", "K", "N", "R", "L"];
  var DOW_LONG = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
  var MON = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(d) { return DOW_LONG[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()]; }

  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  /* Vormi saatmine. Kuulame ka nupu klikki, sest liivakastis (sandbox ilma allow-forms) submit-sündmust ei tule. */
  function onSubmit(form, fn) {
    form.addEventListener("submit", function (e) { e.preventDefault(); fn(); });
    $$('button[type="submit"]', form).forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); fn(); }); });
  }
  /* Navigeerimine: ühe faili versioonis asendab ruuter selle */
  function go(url) { if (window.boreiGo) window.boreiGo(url); else location.href = url; }

  /* ---------- Menüü ---------- */
  var ov = $(".overlay"), lastFocus = null;
  function menu(open) {
    if (!ov) return;
    if (open) lastFocus = document.activeElement;
    ov.classList.toggle("open", open);
    ov.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    $$(".menu-btn").forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
    if (open) $(".close", ov).focus(); else if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.boreiCloseMenu = function () { if (ov && ov.classList.contains("open")) menu(false); };
  $$("[data-open-menu]").forEach(function (b) { b.addEventListener("click", function () { menu(true); }); });
  $$("[data-close-menu]").forEach(function (b) { b.addEventListener("click", function () { menu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { window.boreiCloseMenu(); closeLb(); } });

  /* ---------- Mobiili riba ---------- */
  var mbar = $(".mbar");
  if (mbar) {
    document.body.classList.add("has-mbar");
    var onScroll = function () { mbar.classList.toggle("show", window.scrollY > 420); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------- Täna ---------- */
  var now = new Date(), today = now.getDay();
  $$(".hours tr[data-day]").forEach(function (tr) {
    if (tr.getAttribute("data-day").split(",").indexOf(String(today)) > -1) tr.classList.add("today");
  });
  $$("[data-status]").forEach(function (el) {
    var h = HOURS[today], t = now.getHours() + now.getMinutes() / 60, open = t >= h[0] && t < h[1];
    el.classList.toggle("is-open", open);
    el.textContent = open ? "Praegu avatud · kuni " + h[1] + ":00" : (t < h[0] ? "Avame täna " + h[0] + ":00" : "Suletud · homme " + HOURS[(today + 1) % 7][0] + ":00");
  });
  $$("[data-year]").forEach(function (el) { el.textContent = now.getFullYear(); });

  /* ---------- Ilmumine ---------- */
  var rises = $$(".rise");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    rises.forEach(function (el) { io.observe(el); });
  } else rises.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Hero slaidid (AVNIER) ---------- */
  var slides = $$(".hero .slide"), dots = $$(".dots button"), cur = 0, timer = null;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("on", k === cur); });
    dots.forEach(function (d, k) {
      d.classList.remove("on"); d.setAttribute("aria-pressed", String(k === cur));
      if (k === cur) { void d.offsetWidth; d.classList.add("on"); }
    });
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(function () { show(cur + 1); }, 6000);
  }
  if (slides.length) {
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); }); });
    show(0);
  }

  /* ---------- Kiirbroneerimine (Fresha) ---------- */
  var quick = $("#quick");
  if (quick) {
    var qd = $("#q-day");
    for (var i = 0; i < 7; i++) {
      var d = new Date(); d.setDate(d.getDate() + i);
      var o = document.createElement("option"); o.value = iso(d);
      o.textContent = i === 0 ? "Täna" : i === 1 ? "Homme" : DOW_LONG[d.getDay()].charAt(0).toUpperCase() + DOW_LONG[d.getDay()].slice(1) + " " + d.getDate() + "." + pad(d.getMonth() + 1);
      qd.appendChild(o);
    }
    onSubmit(quick, function () {
      var p = new URLSearchParams();
      if ($("#q-svc").value) p.set("teenus", $("#q-svc").value);
      p.set("paev", qd.value);
      go(quick.getAttribute("action") + "?" + p.toString());
    });
  }

  /* ---------- Teenuste rida (Aesop) ---------- */
  $$("[data-rail]").forEach(function (wrap) {
    var rail = $(".rail", wrap), bar = $(".rail-bar span", wrap);
    function upd() {
      var max = rail.scrollWidth - rail.clientWidth, w = rail.clientWidth / rail.scrollWidth * 100;
      bar.style.width = Math.max(w, 8) + "%";
      bar.style.left = (max > 0 ? rail.scrollLeft / max * (100 - w) : 0) + "%";
    }
    rail.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
    $$("[data-rail-go]", wrap).forEach(function (b) {
      b.addEventListener("click", function () { rail.scrollBy({ left: +b.getAttribute("data-rail-go") * rail.clientWidth * .8, behavior: reduce ? "auto" : "smooth" }); });
    });
    wrap._upd = upd;
  });
  window.boreiRails = function () { $$("[data-rail]").forEach(function (w) { if (w._upd) w._upd(); }); };

  /* ---------- Galerii ---------- */
  var works = $(".works"), lb = $(".lb"), lbI = 0;
  function visible() { return $$(".works figure").filter(function (f) { return !f.hidden; }); }
  function openLb(i) {
    var items = visible(); if (!lb || !items.length) return;
    lbI = (i + items.length) % items.length;
    var f = items[lbI];
    $(".lb-img", lb).innerHTML = $(".ph", f).outerHTML;
    $(".lb-count", lb).textContent = pad(lbI + 1) + " / " + pad(items.length);
    $(".lb-bot em", lb).textContent = $("figcaption em", f).textContent;
    $(".lb-cat", lb).textContent = $("figcaption span", f).textContent;
    if (!lb.classList.contains("open")) { lastFocus = document.activeElement; lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.classList.add("menu-open"); $(".lb-close", lb).focus(); }
  }
  function closeLb() {
    if (!lb || !lb.classList.contains("open")) return;
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.classList.remove("menu-open");
    if (lastFocus) lastFocus.focus();
  }
  if (works) {
    var figs = $$("figure", works);
    $$(".tab[data-f]").forEach(function (t) {
      var f = t.getAttribute("data-f");
      var sup = document.createElement("sup");
      sup.textContent = "(" + (f === "all" ? figs.length : figs.filter(function (x) { return x.dataset.cat === f; }).length) + ")";
      t.appendChild(sup);
      t.addEventListener("click", function () {
        $$(".tab[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === t)); });
        figs.forEach(function (x) { x.hidden = !(f === "all" || x.dataset.cat === f); x.classList.toggle("big", f === "all" && x.hasAttribute("data-big")); });
      });
    });
    figs.forEach(function (f) { $("button", f).addEventListener("click", function () { openLb(visible().indexOf(f)); }); });
  }
  if (lb) {
    $(".lb-close", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", function () { openLb(lbI - 1); });
    $(".lb-next", lb).addEventListener("click", function () { openLb(lbI + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "ArrowLeft") openLb(lbI - 1);
      if (e.key === "ArrowRight") openLb(lbI + 1);
    });
  }

  /* ---------- KKK: otsing ja teemad ---------- */
  var qa = $(".qa");
  if (qa) {
    var cat = "all", search = $("#faq-q"), none = $("#faq-none");
    function filter() {
      var q = (search.value || "").trim().toLowerCase(), n = 0;
      $$("details", qa).forEach(function (d) {
        var ok = (cat === "all" || d.dataset.cat === cat) && (!q || d.textContent.toLowerCase().indexOf(q) > -1);
        d.hidden = !ok; if (ok) n++;
        if (q && ok) d.open = true;
      });
      none.hidden = n > 0;
    }
    search.addEventListener("input", filter);
    $$(".faq-cats button").forEach(function (b) {
      b.addEventListener("click", function () {
        cat = b.dataset.cat;
        $$(".faq-cats button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        filter();
      });
    });
  }

  /* ---------- Vormid ---------- */
  function validate(form) {
    var ok = true, first = null;
    $$("[required]", form).forEach(function (el) {
      var w = el.closest(".fld") || el.closest(".chk");
      var v = el.type === "checkbox" ? el.checked : el.value.trim() !== "";
      if (v && el.type === "email" && el.value.trim()) v = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (v && el.type === "tel") v = el.value.replace(/\D/g, "").length >= 7;
      if (w) w.classList.toggle("bad", !v);
      if (!v) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  document.addEventListener("input", function (e) { var w = e.target.closest && e.target.closest(".bad"); if (w) w.classList.remove("bad"); });
  $$("form[data-done]").forEach(function (f) {
    onSubmit(f, function () {
      if (!validate(f)) return;
      var d = document.getElementById(f.getAttribute("data-done"));
      f.hidden = true; d.hidden = false; d.setAttribute("tabindex", "-1"); d.focus();
    });
  });

  /* ---------- Broneerimine ---------- */
  var bk = $("#bk");
  if (bk) {
    var SV = JSON.parse($("#svc-json").textContent), MS = JSON.parse($("#mst-json").textContent);
    var st = { svc: null, mst: null, day: null, time: null }, step = 1, started = false;
    var sv = function (id) { return SV.filter(function (s) { return s.id === id; })[0]; };
    var ms = function (id) { return MS.filter(function (m) { return m.id === id; })[0]; };

    /* 1 */
    var sl = $("#bk-svcs"), grp = "";
    SV.forEach(function (s) {
      if (s.group !== grp) { grp = s.group; var g = document.createElement("div"); g.className = "group-t"; g.textContent = grp; sl.appendChild(g); }
      var l = document.createElement("label"); l.className = "card-opt";
      l.innerHTML = '<input type="radio" name="svc" value="' + s.id + '"><span class="t">' + s.name + '</span><span class="p">' + s.price + ' €</span><span class="d">' + s.desc + '</span><span class="m">' + s.dur + ' min</span>';
      sl.appendChild(l);
    });
    /* 2 */
    var pl = $("#bk-people");
    MS.forEach(function (m) {
      var l = document.createElement("label"); l.className = "person-opt";
      l.innerHTML = '<input type="radio" name="mst" value="' + m.id + '">' +
        (m.id === "any" ? '<span class="any">Ükskõik kes,<br>peaasi et kiiresti</span>' : '<span class="ph"><i>Portree</i></span>') +
        '<span class="nm"><b>' + m.name + '</b><small>' + m.role + '</small></span>';
      pl.appendChild(l);
    });
    function mark(name) { $$('input[name="' + name + '"]', bk).forEach(function (i) { i.parentNode.classList.toggle("on", i.checked); }); }
    bk.addEventListener("change", function (e) {
      if (e.target.name === "svc") { st.svc = e.target.value; st.time = null; mark("svc"); slots(); }
      if (e.target.name === "mst") { st.mst = e.target.value; st.time = null; mark("mst"); slots(); }
      upd();
    });
    /* 3: kalender, esmaspäevast algav nädal */
    var cal = $("#bk-cal");
    ["E", "T", "K", "N", "R", "L", "P"].forEach(function (d) { var s = document.createElement("span"); s.className = "dow"; s.textContent = d; cal.appendChild(s); });
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var lead = (start.getDay() + 6) % 7;
    for (var k = 0; k < lead; k++) { var b0 = document.createElement("button"); b0.type = "button"; b0.disabled = true; b0.setAttribute("aria-hidden", "true"); b0.tabIndex = -1; cal.appendChild(b0); }
    for (var n = 0; n < 14; n++) {
      var dd = new Date(start); dd.setDate(start.getDate() + n);
      var b = document.createElement("button"); b.type = "button"; b.dataset.day = iso(dd); b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", fmt(dd));
      b.innerHTML = "<b>" + dd.getDate() + "</b><small>" + (n === 0 ? "täna" : MON[dd.getMonth()].slice(0, 3)) + "</small>";
      cal.appendChild(b);
    }
    cal.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-day]"); if (!b) return;
      pickDay(b.dataset.day);
    });
    function pickDay(day) {
      var b = $('button[data-day="' + day + '"]', cal); if (!b) return false;
      $$("button[data-day]", cal).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      st.day = day; st.time = null; slots(); upd(); return true;
    }
    function rng(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0; return function () { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; }; }
    var sw = $("#bk-slots");
    function slots() {
      sw.innerHTML = "";
      if (!st.day) { sw.innerHTML = '<p class="empty">Vali kalendrist päev.</p>'; return; }
      var d = parseIso(st.day), h = HOURS[d.getDay()], dur = st.svc ? sv(st.svc).dur : 30;
      var r = rng(st.day + (st.mst || "any")), nowD = new Date(), isT = d.toDateString() === nowD.toDateString();
      var groups = [["Hommik", 0, 12], ["Päev", 12, 16], ["Õhtu", 16, 24]], free = 0;
      groups.forEach(function (g) {
        var list = document.createElement("div"); list.className = "slot-list"; var cnt = 0;
        for (var m = h[0] * 60; m + dur <= h[1] * 60; m += 30) {
          if (m < g[1] * 60 || m >= g[2] * 60) continue;
          var lab = pad(Math.floor(m / 60)) + ":" + pad(m % 60);
          var taken = r() < (st.mst === "any" ? .2 : .38) || (isT && m <= nowD.getHours() * 60 + nowD.getMinutes() + 30);
          var s = document.createElement("button"); s.type = "button"; s.className = "slot"; s.textContent = lab;
          s.setAttribute("aria-pressed", String(st.time === lab));
          if (taken) { s.disabled = true; s.setAttribute("aria-label", lab + " hõivatud"); } else free++;
          list.appendChild(s); cnt++;
        }
        if (!cnt) return;
        var w = document.createElement("div"); w.className = "slot-group";
        w.innerHTML = "<h4>" + g[0] + "</h4>"; w.appendChild(list); sw.appendChild(w);
      });
      if (!free) sw.innerHTML = '<p class="empty">Sel päeval on kõik ajad võetud. Proovi mõnda teist päeva.</p>';
    }
    sw.addEventListener("click", function (e) {
      var s = e.target.closest(".slot"); if (!s || s.disabled) return;
      $$(".slot", sw).forEach(function (x) { x.setAttribute("aria-pressed", String(x === s)); });
      st.time = s.textContent; upd();
    });

    var next = $("#bk-next"), back = $("#bk-back");
    function valid(n) { return n === 1 ? !!st.svc : n === 2 ? !!st.mst : n === 3 ? !!(st.day && st.time) : true; }
    function upd() {
      var s = st.svc && sv(st.svc);
      $("#bar-t").textContent = s ? s.name + " · " + s.price + " €" : "Vali teenus";
      var bits = [];
      if (s) bits.push(s.dur + " min");
      if (st.mst) bits.push(ms(st.mst).name);
      if (st.day) bits.push(fmt(parseIso(st.day)).split(",")[1].trim());
      if (st.time) bits.push(st.time);
      $("#bar-s").textContent = bits.length ? bits.join(" · ") : "Samm " + step + " / 4";
      next.disabled = !valid(step);
      if (step === 4) {
        $("#r-svc").textContent = s.name; $("#r-mst").textContent = ms(st.mst).name;
        $("#r-day").textContent = fmt(parseIso(st.day)); $("#r-time").textContent = st.time + " (" + s.dur + " min)";
        $("#r-sum").textContent = s.price + " €";
      }
    }
    function goStep(n) {
      step = n;
      $$(".bk-step", bk).forEach(function (el) { el.hidden = +el.dataset.step !== n; });
      $$(".bk-progress li").forEach(function (li, i) { li.classList.toggle("past", i + 1 < n); li.classList.toggle("cur", i + 1 === n); if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      back.style.visibility = n === 1 ? "hidden" : "visible";
      next.innerHTML = (n === 4 ? "Kinnita" : "Edasi") + ' <span class="ar">→</span>';
      upd();
      if (started) { var h = $('.bk-step[data-step="' + n + '"] h2', bk); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); bk.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }); }
      started = true;
    }
    next.addEventListener("click", function () {
      if (!valid(step)) return;
      if (step < 4) return goStep(step + 1);
      if (!validate($("#bk-form"))) return;
      var s = sv(st.svc), d = parseIso(st.day), tp = st.time.split(":");
      $("#done-name").textContent = $("#b-name").value.trim().split(" ")[0];
      $("#done-txt").textContent = s.name + ", " + fmt(d) + " kell " + st.time + ". Meister: " + ms(st.mst).name + ". Hind " + s.price + " €, tasumine salongis.";
      var startD = new Date(d); startD.setHours(+tp[0], +tp[1]);
      var endD = new Date(startD.getTime() + s.dur * 60000);
      var ics = function (x) { return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + "T" + pad(x.getHours()) + pad(x.getMinutes()) + "00"; };
      var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Borei//Broneering//ET", "BEGIN:VEVENT", "UID:" + Date.now() + "@borei", "DTSTAMP:" + ics(new Date()), "DTSTART:" + ics(startD), "DTEND:" + ics(endD), "SUMMARY:Borei: " + s.name, "LOCATION:Keskallee 20\\, Kohtla-Järve", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      try { $("#done-ics").href = URL.createObjectURL(new Blob([body], { type: "text/calendar" })); } catch (err) { $("#done-ics").hidden = true; }
      $("#bk-flow").hidden = true;
      var done = $("#bk-done"); done.hidden = false; done.setAttribute("tabindex", "-1"); done.focus();
      bk.scrollIntoView({ block: "start" });
    });
    back.addEventListener("click", function () { if (step > 1) goStep(step - 1); });

    /* Eelvalik: ?teenus=...&paev=... */
    function reset() {
      st = { svc: null, mst: null, day: null, time: null };
      $$("input", bk).forEach(function (i) { if (i.type === "radio" || i.type === "checkbox") i.checked = false; else i.value = ""; });
      $("#b-note").value = ""; $$(".on", bk).forEach(function (x) { x.classList.remove("on"); });
      $$("button[data-day]", cal).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      $("#bk-done").hidden = true; $("#bk-flow").hidden = false; started = false; slots(); goStep(1);
    }
    window.boreiBooking = function (params) {
      if (!$("#bk-done").hidden) reset();
      var t = params.get("teenus"), p = params.get("paev");
      if (t && sv(t)) { var r = $('input[name="svc"][value="' + t + '"]', bk); r.checked = true; st.svc = t; st.time = null; mark("svc"); }
      if (p) pickDay(p);
      slots(); upd();
      if (st.svc && step === 1) goStep(2);
    };
    slots();
    goStep(1);
    if (!window.boreiGo) window.boreiBooking(new URLSearchParams(location.search));
  }

  /* ---------- Kinkekaart ---------- */
  var gf = $("#gift");
  if (gf) {
    var pol = $(".polaroid"), amount = "30 €";
    var code = "BOREI-"; for (var c = 0; c < 5; c++) code += "ACDEFGHJKLMNPRSTUVXYZ2345679".charAt(Math.floor(Math.random() * 28));
    $("#p-code").textContent = code;
    function draw() {
      var type = $('input[name="gt"]:checked', gf).value;
      $$(".seg label", gf).forEach(function (l) { l.classList.toggle("on", $("input", l).checked); });
      $("#g-amt").hidden = type !== "summa"; $("#g-svc-w").hidden = type === "summa";
      var val = $("#p-val");
      if (type === "summa") { val.textContent = amount; val.classList.remove("long"); }
      else { var o = $("#g-svc").selectedOptions[0]; val.textContent = o.text.split(" · ")[0]; val.classList.add("long"); }
      $("#p-to").textContent = $("#g-to").value.trim() || "Saaja";
      $("#p-from").textContent = $("#g-from").value.trim() || "Sina";
      $("#p-msg").textContent = $("#g-msg").value.trim();
    }
    $$("[data-amt]", gf).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("[data-amt]", gf).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var v = b.dataset.amt; $("#g-own").hidden = v !== "muu";
        if (v === "muu") { $("#g-own-v").focus(); amount = ($("#g-own-v").value || "0") + " €"; } else amount = v + " €";
        draw();
      });
    });
    $("#g-own-v").addEventListener("input", function () { amount = (this.value || "0") + " €"; draw(); });
    $$(".swatches button", gf).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".swatches button", gf).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        pol.className = "polaroid " + b.dataset.c;
      });
    });
    gf.addEventListener("input", draw); gf.addEventListener("change", draw);
    onSubmit(gf, function () {
      if ($('input[name="gt"]:checked', gf).value === "summa" && parseInt(amount, 10) < 10) { toast("Väikseim summa on 10 €."); return; }
      if (!validate(gf)) return;
      gf.hidden = true; $("#g-done-code").textContent = code;
      var d = $("#g-done"); d.hidden = false; d.setAttribute("tabindex", "-1"); d.focus();
    });
    draw();
  }
})();
