/* Salong Siid — saidi skriptid (ilma sõltuvusteta) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- Päis ja menüü ---------- */
  var header = $(".site-header");
  var stickyBook = $(".sticky-book");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (stickyBook) stickyBook.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var mnav = $(".mobile-nav");
  function setMenu(open) {
    if (!mnav) return;
    mnav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    $$(".menu-toggle").forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
    if (open) { var f = $("nav a", mnav); if (f) f.focus(); }
  }
  $$("[data-menu-open]").forEach(function (b) { b.addEventListener("click", function () { setMenu(true); }); });
  $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
      $$(".dd.open").forEach(function (d) { d.classList.remove("open"); $(".dd-toggle", d).setAttribute("aria-expanded", "false"); });
    }
  });

  $$(".dd").forEach(function (dd) {
    var btn = $(".dd-toggle", dd);
    btn.addEventListener("click", function () {
      var open = !dd.classList.contains("open");
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!dd.contains(e.target)) { dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---------- Ilmumise animatsioon ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Aasta jaluses, tänane päev lahtiolekuaegades ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var today = new Date().getDay(); // 0 = pühapäev
  $$(".hours [data-day]").forEach(function (row) {
    var days = row.getAttribute("data-day").split(",").map(Number);
    if (days.indexOf(today) !== -1) row.classList.add("today");
  });

  /* ---------- Hinnakirja kategooriate esiletõst ---------- */
  var priceLinks = $$(".price-nav a");
  if (priceLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        priceLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          if (on && a.parentNode.scrollWidth > a.parentNode.clientWidth) {
            a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
          }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".price-group").forEach(function (g) { spy.observe(g); });
  }

  /* ---------- Filtrid (galerii, e-pood, blogi) ---------- */
  $$("[data-filter-group]").forEach(function (group) {
    var target = $(group.getAttribute("data-filter-group"));
    if (!target) return;
    $$(".filter-btn", group).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        $$(".filter-btn", group).forEach(function (b) { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
        $$("[data-cat]", target).forEach(function (item) {
          var cats = item.getAttribute("data-cat").split(" ");
          item.hidden = !(f === "all" || cats.indexOf(f) !== -1);
        });
      });
    });
  });

  /* ---------- Ostukorv (demo, brauseri mälus) ---------- */
  var cart = store.get("siid-cart", []);
  function renderCartCount() {
    var n = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    $$(".cart-count").forEach(function (el) { el.textContent = n; el.setAttribute("data-count", n); });
  }
  renderCartCount();
  $$(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var found = cart.filter(function (i) { return i.id === id; })[0];
      if (found) found.qty += 1; else cart.push({ id: id, name: btn.getAttribute("data-name"), price: Number(btn.getAttribute("data-price")), qty: 1 });
      store.set("siid-cart", cart);
      renderCartCount();
      toast("„" + btn.getAttribute("data-name") + "“ lisati ostukorvi");
    });
  });

  /* ---------- Vormid (demo: näitab kinnitust) ----------
     NB! Päris saatmiseks ühenda vorm e-posti teenuse või serveriga (nt Formspree, Netlify Forms). */
  $$("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.classList.add("sent");
      var msg = $(".form-success", form);
      if (msg) { msg.setAttribute("tabindex", "-1"); msg.focus(); }
      $$("input, textarea, select, button[type=submit]", form).forEach(function (el) { if (!el.closest(".form-success")) el.disabled = true; });
      if (form.classList.contains("newsletter")) {
        var inp = $("input", form); inp.value = ""; inp.placeholder = "Aitäh! Oled nimekirjas.";
      }
    });
  });

  /* ---------- Kinkekaart ---------- */
  var gcForm = $("#giftcard-form");
  if (gcForm) {
    var amountOut = $("#gc-amount"), toOut = $("#gc-to"), card = $("#gc-preview"), custom = $("#gc-custom");
    function updateGc() {
      var sel = $("input[name=summa]:checked", gcForm);
      var val = sel ? sel.value : "50";
      if (val === "muu") { val = custom.value || "—"; custom.closest(".field").hidden = false; }
      else { custom.closest(".field").hidden = true; }
      amountOut.textContent = val + " €";
      var name = $("#gc-saaja").value.trim();
      toOut.textContent = name || "Kingisaaja nimi";
      var design = $("input[name=kujundus]:checked", gcForm);
      card.classList.toggle("light", design && design.value === "hele");
    }
    gcForm.addEventListener("input", updateGc);
    gcForm.addEventListener("change", updateGc);
    updateGc();
  }

  /* ---------- Broneerimine ---------- */
  var booking = $("#booking-form");
  if (booking) {
    var panels = $$(".step-panel", booking);
    var stepItems = $$(".steps li");
    var current = 0;
    var dateInput = $("#b-date");
    var slotsWrap = $("#b-slots");

    // Kuupäev: min = täna
    var now = new Date();
    var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    dateInput.min = iso(now);
    var maxD = new Date(now); maxD.setDate(maxD.getDate() + 90); dateInput.max = iso(maxD);

    function buildSlots() {
      slotsWrap.innerHTML = "";
      if (!dateInput.value) { slotsWrap.innerHTML = '<p class="muted">Vali esmalt kuupäev.</p>'; return; }
      var d = new Date(dateInput.value + "T00:00:00");
      var day = d.getDay();
      if (day === 0) { slotsWrap.innerHTML = '<p class="muted">Pühapäeval oleme suletud — palun vali mõni teine päev.</p>'; return; }
      var start = 9, end = day === 6 ? 16 : 20;
      var seed = d.getDate() * 7 + d.getMonth();
      for (var h = start; h < end; h++) {
        [0, 30].forEach(function (m) {
          var t = String(h).padStart(2, "0") + ":" + (m ? "30" : "00");
          var id = "slot-" + t.replace(":", "");
          var busy = ((h * 3 + m + seed) % 5) === 0; // demo: osa aegu on hõivatud
          if (iso(d) === iso(now) && (h < now.getHours() + 1)) busy = true;
          var el = document.createElement("div");
          el.className = "slot";
          el.innerHTML = '<input type="radio" name="kellaaeg" id="' + id + '" value="' + t + '"' + (busy ? " disabled" : "") + ' required><label for="' + id + '">' + t + "</label>";
          slotsWrap.appendChild(el);
        });
      }
    }
    dateInput.addEventListener("change", function () { buildSlots(); updateSummary(); });
    buildSlots();

    function val(name) { var el = $("[name=" + name + "]:checked", booking); return el; }
    function updateSummary() {
      var s = val("teenus"), p = val("spetsialist"), t = val("kellaaeg");
      $("#sum-service").textContent = s ? s.getAttribute("data-label") : "—";
      $("#sum-person").textContent = p ? p.getAttribute("data-label") : "—";
      var dStr = "—";
      if (dateInput.value) {
        var d = new Date(dateInput.value + "T00:00:00");
        dStr = d.toLocaleDateString("et-EE", { weekday: "short", day: "numeric", month: "long" });
        if (t) dStr += ", kell " + t.value;
      }
      $("#sum-time").textContent = dStr;
      $("#sum-duration").textContent = s ? s.getAttribute("data-duration") : "—";
      $("#sum-price").textContent = s ? s.getAttribute("data-price") : "—";
    }
    booking.addEventListener("change", updateSummary);

    function go(i) {
      current = i;
      panels.forEach(function (p, idx) { p.classList.toggle("active", idx === i); });
      stepItems.forEach(function (li, idx) {
        li.classList.toggle("active", idx === i);
        li.classList.toggle("done", idx < i);
      });
      var top = $(".steps").getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
    }
    function validPanel(i) {
      var fields = $$("input, select, textarea", panels[i]);
      for (var k = 0; k < fields.length; k++) {
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; }
      }
      return true;
    }
    $$("[data-next]", booking).forEach(function (b) { b.addEventListener("click", function () { if (validPanel(current)) go(current + 1); }); });
    $$("[data-prev]", booking).forEach(function (b) { b.addEventListener("click", function () { go(current - 1); }); });

    // Eelvalik URL-ist: broneeri.html?teenus=balayage
    var q = new URLSearchParams(location.search).get("teenus");
    if (q) { var pre = $("#svc-" + q, booking); if (pre) { pre.checked = true; } }
    updateSummary();

    booking.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validPanel(current)) return;
      booking.hidden = true;
      $(".steps").hidden = true;
      var done = $(".booking-done");
      $("#done-text").textContent = $("#sum-service").textContent + " · " + $("#sum-time").textContent + " · " + $("#sum-person").textContent;
      done.classList.add("show");
      done.setAttribute("tabindex", "-1");
      done.focus();
    });
  }
})();
