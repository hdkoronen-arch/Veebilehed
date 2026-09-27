/* Lana stuudio: väike JS ilma raamistiketa */
(function () {
  var d = document;
  var lang = d.documentElement.lang || 'et';

  /* Mobiilimenüü */
  var menuBtn = d.querySelector('[data-menu]');
  var menu = d.getElementById('mnav');
  var hdr = d.querySelector('.hdr');

  function placeMenu() {
    if (!menu || !hdr) return;
    var r = hdr.getBoundingClientRect();
    menu.style.setProperty('--mnav-top', Math.max(0, r.bottom) + 'px');
  }
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    placeMenu();
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.classList.toggle('lock', open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1200) setMenu(false); else placeMenu(); });
  }

  /* Päise joon kerimisel */
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Tänane päev lahtiolekuaegades */
  var today = new Date().getDay(); // 0 = pühapäev
  d.querySelectorAll('.hours [data-days]').forEach(function (row) {
    if (row.getAttribute('data-days').split(',').indexOf(String(today)) > -1) row.classList.add('today');
  });

  /* Aasta jaluses */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Galerii filter */
  var filters = d.querySelectorAll('[data-filter]');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      d.querySelectorAll('[data-cat]').forEach(function (item) {
        item.hidden = !(f === 'all' || item.getAttribute('data-cat') === f);
      });
    });
  });

  /* Demo vormid: näitavad kinnitust. Päris saatmiseks ühenda vormiteenusega (vt README). */
  function showOk(form) {
    var ok = d.getElementById(form.getAttribute('data-ok'));
    if (!ok) return;
    form.hidden = true;
    ok.hidden = false;
    ok.setAttribute('tabindex', '-1');
    ok.focus({ preventScroll: true });
    ok.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  d.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.id === 'book-form') fillBookingOk();
      showOk(form);
    });
  });

  /* Broneerimine */
  var book = d.getElementById('book-form');
  var sum = {};
  function fmtDate(v) {
    if (!v) return '';
    var p = v.split('-');
    var dt = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return dt.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'long' }); }
    catch (e) { return p[2] + '.' + p[1] + '.' + p[0]; }
  }
  function fillBookingOk() {
    var t = d.getElementById('ok-summary');
    if (t) t.textContent = [sum.service, sum.date, sum.time].filter(Boolean).join(' · ');
  }

  if (book) {
    var dash = '...';
    var sService = d.getElementById('s-service');
    var sDur = d.getElementById('s-dur');
    var sDate = d.getElementById('s-date');
    var sTime = d.getElementById('s-time');
    var sTotal = d.getElementById('s-total');
    var dateInput = d.getElementById('b-date');
    var slotsWrap = d.getElementById('slots');
    var slotsMsg = d.getElementById('slots-msg');

    var now = new Date();
    var iso = function (x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    dateInput.min = iso(now);
    var max = new Date(now); max.setDate(max.getDate() + 60);
    dateInput.max = iso(max);

    // Näidisena on osad ajad "hõivatud", et vaade näeks elus välja.
    function renderSlots() {
      var v = dateInput.value;
      slotsWrap.innerHTML = '';
      if (!v) { slotsMsg.textContent = slotsMsg.getAttribute('data-pick'); slotsMsg.hidden = false; return; }
      var p = v.split('-');
      var day = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
      if (day === 0) { slotsMsg.textContent = slotsMsg.getAttribute('data-closed'); slotsMsg.hidden = false; return; }
      slotsMsg.hidden = true;
      var last = day === 6 ? 14 : 18;
      var seed = (+p[2] * 7 + +p[1] * 3) % 5;
      for (var h = 10, i = 0; h <= last; h++, i++) {
        var time = h + ':00';
        var busy = (i + seed) % 4 === 0;
        var isToday = v === iso(now) && h <= now.getHours();
        var lab = d.createElement('label');
        lab.className = 'slot';
        lab.innerHTML = '<input type="radio" name="kellaaeg" required value="' + time + '"' + (busy || isToday ? ' disabled' : '') + '><span>' + time + '</span>';
        slotsWrap.appendChild(lab);
      }
      update();
    }

    function update() {
      var s = book.querySelector('input[name="teenus"]:checked');
      var t = book.querySelector('input[name="kellaaeg"]:checked');
      sum.service = s ? s.value : '';
      sum.date = fmtDate(dateInput.value);
      sum.time = t ? t.value : '';
      sService.textContent = sum.service || dash;
      sDur.textContent = s ? s.getAttribute('data-dur') : dash;
      sDate.textContent = sum.date || dash;
      sTime.textContent = sum.time || dash;
      sTotal.textContent = s ? s.getAttribute('data-price') : '0 €';
    }

    book.addEventListener('change', function (e) {
      if (e.target === dateInput) renderSlots(); else update();
    });

    // Eelvalik lingist: broneeri.html?t=geellakk
    var q = new URLSearchParams(location.search).get('t');
    if (q) {
      var pre = book.querySelector('input[name="teenus"][data-id="' + q + '"]');
      if (pre) pre.checked = true;
    }
    renderSlots();
    update();
  }

  /* Teenuste kategooriamenüü: tõstab esile kategooria, mida parajasti vaadatakse */
  var pnav = d.querySelector('.price-nav');
  if (pnav && 'IntersectionObserver' in window) {
    var chips = pnav.querySelectorAll('a[href^="#"]');
    var setOn = function (id) {
      chips.forEach(function (c) {
        var on = c.getAttribute('href') === '#' + id;
        c.classList.toggle('on', on);
        if (on) {
          c.setAttribute('aria-current', 'true');
          var bar = c.parentNode;
          bar.scrollTo({ left: c.offsetLeft - 16, behavior: 'smooth' });
        } else c.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setOn(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    d.querySelectorAll('.pcat[id]').forEach(function (sec) { io.observe(sec); });
  }
})();
