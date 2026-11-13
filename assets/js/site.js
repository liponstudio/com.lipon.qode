/* QODE — shared interactions (nav, reveals, counters, code library, copy/toast) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- footer year ---------- */
  $$('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- seamless marquee (duplicate track once) ---------- */
  var mq = $('#marquee');
  if (mq) { mq.innerHTML += mq.innerHTML; }

  /* ---------- nav: scrolled state ---------- */
  var nav = $('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = $('.nav-toggle'), menu = $('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open'); toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- active section in nav ---------- */
  var links = $$('.nav-links a[href^="#"]');
  var map = {};
  links.forEach(function (a) { var id = a.getAttribute('href').slice(1); var sec = document.getElementById(id); if (sec) map[id] = a; });
  if ('IntersectionObserver' in window && Object.keys(map).length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var a = map[e.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else { counters.forEach(animateCount); }

  /* ---------- toast ---------- */
  var toast = $('.toast'), toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    var t = $('.toast-msg', toast); if (t) t.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* ---------- clipboard ---------- */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }

  /* hero floating code-card copy buttons */
  $$('.cc-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-code');
      copyText(code, function () { showToast('Copied ' + code); });
    });
  });

  /* ============================================================
     CODE LIBRARY — seeded, searchable, filterable, copyable
     ============================================================ */
  var CODES = [
    { code: '*#06#', desc: 'Display your IMEI, MEID and serial number instantly.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#4636#*#*', desc: 'Phone information, battery and usage statistics.', cat: 'essentials', tag: 'Android' },
    { code: '*#07#', desc: 'Check the SAR (radiation) value for your device.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#2663#*#*', desc: 'Touchscreen firmware version.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#232339#*#*', desc: 'WLAN / Wi-Fi test.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#232338#*#*', desc: 'Show the Wi-Fi MAC address.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#1472365#*#*', desc: 'GPS test.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#0842#*#*', desc: 'Vibration and backlight test.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#34971539#*#*', desc: 'Camera firmware and information.', cat: 'essentials', tag: 'Android' },
    { code: '*#*#197328640#*#*', desc: 'Enter service mode.', cat: 'essentials', tag: 'Android' },
    { code: '*#0*#', desc: 'Samsung test mode — screen, speaker, sensors, vibration.', cat: 'samsung', tag: 'Samsung' },
    { code: '*#9900#', desc: 'Samsung system dump and service options.', cat: 'samsung', tag: 'Samsung' },
    { code: '*#0228#', desc: 'Samsung battery status (ADC).', cat: 'samsung', tag: 'Samsung' },
    { code: '*#1234#', desc: 'Samsung firmware / PDA version.', cat: 'samsung', tag: 'Samsung' },
    { code: '*#0808#', desc: 'Samsung USB settings.', cat: 'samsung', tag: 'Samsung' },
    { code: '*#2663#', desc: 'Samsung touchscreen firmware version.', cat: 'samsung', tag: 'Samsung' },
    { code: '*#*#7780#*#*', desc: 'Factory data reset — erases apps and accounts.', cat: 'samsung', tag: 'Reset', danger: true, note: 'Destructive: wipes your data. Back up first.' },
    { code: '*2767*3855#', desc: 'Full factory reset / firmware wipe.', cat: 'samsung', tag: 'Reset', danger: true, note: 'Destructive: erases everything. Use with care.' },
    { code: '##002#', desc: 'Cancel all call forwarding.', cat: 'network', tag: 'Network' },
    { code: '*#21#', desc: 'Check call forwarding status.', cat: 'network', tag: 'Network' },
    { code: '**21*number#', desc: 'Forward all calls to another number.', cat: 'network', tag: 'Network' },
    { code: '**67*number#', desc: 'Forward calls when busy.', cat: 'network', tag: 'Network' },
    { code: '**61*number#', desc: 'Forward calls when unanswered.', cat: 'network', tag: 'Network' },
    { code: '**62*number#', desc: 'Forward calls when unreachable.', cat: 'network', tag: 'Network' },
    { code: '#31#', desc: 'Hide your caller ID for the next call.', cat: 'network', tag: 'Network' },
    { code: '*121*1*1#', desc: 'Grameenphone — balance check.', cat: 'ussd', tag: 'BD · Grameenphone' },
    { code: '*121*2#', desc: 'Grameenphone — internet / data balance.', cat: 'ussd', tag: 'BD · Grameenphone' },
    { code: '*124#', desc: 'Banglalink — balance check.', cat: 'ussd', tag: 'BD · Banglalink' },
    { code: '*222#', desc: 'Robi — balance check.', cat: 'ussd', tag: 'BD · Robi' },
    { code: '*123#', desc: 'Airtel / BSNL — balance check.', cat: 'ussd', tag: 'IN · Airtel' },
    { code: '*199#', desc: 'Vi — balance check.', cat: 'ussd', tag: 'IN · Vi' },
    { code: '#225#', desc: 'Verizon — balance check.', cat: 'ussd', tag: 'US · Verizon' }
  ];
  var TABS = [
    { id: 'all', label: 'All' },
    { id: 'essentials', label: 'Essentials' },
    { id: 'samsung', label: 'Samsung' },
    { id: 'network', label: 'Network' },
    { id: 'ussd', label: 'USSD balance' }
  ];

  var libList = $('#lib-list'), libTabs = $('#lib-tabs'), libSearch = $('#lib-search'), libCount = $('#lib-count');
  if (libList && libTabs) {
    var state = { cat: 'all', q: '' };

    // build tabs
    TABS.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'lib-tab' + (t.id === 'all' ? ' active' : '');
      b.type = 'button'; b.textContent = t.label; b.setAttribute('data-cat', t.id);
      b.addEventListener('click', function () {
        state.cat = t.id;
        $$('.lib-tab', libTabs).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        render();
      });
      libTabs.appendChild(b);
    });

    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function render() {
      var q = state.q.trim().toLowerCase();
      var rows = CODES.filter(function (c) {
        var okCat = state.cat === 'all' || c.cat === state.cat;
        var okQ = !q || (c.code + ' ' + c.desc + ' ' + c.tag).toLowerCase().indexOf(q) !== -1;
        return okCat && okQ;
      });
      libList.innerHTML = '';
      if (!rows.length) {
        var empty = document.createElement('div');
        empty.className = 'lib-empty';
        empty.innerHTML = '<div class="big">No codes match “' + esc(state.q) + '”</div><div>Try a different keyword, or switch category. The full app has 1,400+ codes.</div>';
        libList.appendChild(empty);
      } else {
        rows.forEach(function (c) {
          var row = document.createElement('div');
          row.className = 'code-row';
          var note = c.danger ? '<div class="cr-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' + esc(c.note) + '</div>' : '';
          row.innerHTML =
            '<div class="cr-main"><div class="cr-top"><span class="cr-code">' + esc(c.code) + '</span>' +
            '<span class="cr-tag' + (c.danger ? ' danger' : '') + '">' + esc(c.tag) + '</span></div>' +
            '<div class="cr-desc">' + esc(c.desc) + '</div>' + note + '</div>' +
            '<button class="cr-copy" type="button" data-code="' + esc(c.code) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
            '<span>Copy</span></button>';
          libList.appendChild(row);
        });
      }
      if (libCount) libCount.innerHTML = 'Showing <b>' + rows.length + '</b> of ' + CODES.length + ' featured codes';
    }

    libList.addEventListener('click', function (e) {
      var btn = e.target.closest('.cr-copy'); if (!btn) return;
      var code = btn.getAttribute('data-code');
      copyText(code, function () {
        btn.classList.add('copied');
        var label = $('span', btn); var old = label.textContent; label.textContent = 'Copied';
        showToast('Copied ' + code);
        setTimeout(function () { btn.classList.remove('copied'); label.textContent = old; }, 1600);
      });
    });

    if (libSearch) {
      libSearch.addEventListener('input', function () { state.q = libSearch.value; render(); });
    }
    render();
  }
})();