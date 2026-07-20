/* ============================================================
   FINO ACABAMENTO — main.js
   ============================================================ */
(function () {
  'use strict';

  window.__fdReady = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var WA = '5581983618877';

  if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- SMOOTH SCROLL ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    if (hasST) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }
  }

  /* ---------- REVEAL ---------- */
  function revealObserver(threshold, rootMargin) {
    return new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: threshold, rootMargin: rootMargin });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var ioReveal = revealObserver(0.15, '0px 0px -8% 0px');
    document.querySelectorAll('[data-reveal]').forEach(function (el) { ioReveal.observe(el); });
    var ioMask = revealObserver(0, '0px 0px -14% 0px');
    document.querySelectorAll('[data-reveal-mask]').forEach(function (el) { ioMask.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal],[data-reveal-mask]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- HERO PARALLAX ---------- */
  var hero = document.querySelector('.hero');
  var media = document.querySelector('.hero__media');
  if (hasST && hero && media && !reduce) {
    window.gsap.to(media, {
      yPercent: 13, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    window.gsap.to('.hero__inner', {
      yPercent: -7, opacity: 0.32, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  if (hero && media && !reduce && hasGsap && window.matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var rx = (e.clientX / window.innerWidth - 0.5);
      var ry = (e.clientY / window.innerHeight - 0.5);
      window.gsap.to(media, { x: rx * -20, y: ry * -13, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
  }

  /* ---------- COUNTERS ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (isNaN(target) || reduce) return;
    var dur = 1500, t0 = null;
    function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target) + suffix;
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- MARQUEE ---------- */
  (function marquee() {
    if (reduce) return;
    document.querySelectorAll('.marquee__row').forEach(function (row) {
      var dir = parseFloat(row.dataset.marquee) || 1;
      var original = row.innerHTML;
      var safety = 0;
      while (row.scrollWidth < window.innerWidth * 2 && safety < 10) { row.innerHTML += original; safety++; }
      row.innerHTML += row.innerHTML;
      var half = row.scrollWidth / 2;
      var x = dir < 0 ? -half : 0;
      var speed = 0.38 * dir;
      function tick() {
        x -= speed;
        if (x <= -half) x += half;
        if (x >= 0) x -= half;
        row.style.transform = 'translateX(' + x + 'px)';
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  })();

  /* ---------- HEADER / PROGRESS / SCROLLSPY ---------- */
  var header = document.querySelector('.header');
  var progress = document.querySelector('.progress');
  var waFloat = document.querySelector('.wa-float');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.header__nav a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 40);
    if (waFloat) waFloat.classList.toggle('is-in', y > 500);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h * 100) : 0) + '%';
    }
    var current = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
    }
    navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- BURGER ---------- */
  var burger = document.querySelector('.header__burger');
  if (burger && header) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.header__nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- ÂNCORAS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -78 });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 78, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- FILTRO DA GALERIA ---------- */
  var chips = document.querySelectorAll('.chip');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.gcard'));
  var moreBtn = document.querySelector('[data-gal-more]');
  var countEl = document.querySelector('[data-gal-count]');
  var STEP = 12;
  var shown = STEP;
  var filter = 'todos';

  function applyGallery() {
    var matched = cards.filter(function (c) { return filter === 'todos' || c.dataset.brand === filter; });
    cards.forEach(function (c) { c.classList.add('is-hidden'); });
    matched.slice(0, shown).forEach(function (c) { c.classList.remove('is-hidden'); });
    var visible = Math.min(shown, matched.length);
    if (countEl) countEl.textContent = 'Exibindo ' + visible + ' de ' + matched.length + (matched.length === 1 ? ' referência' : ' referências');
    if (moreBtn) moreBtn.style.display = visible >= matched.length ? 'none' : '';
    if (hasST) window.ScrollTrigger.refresh();
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      filter = chip.dataset.filter;
      shown = STEP;
      applyGallery();
    });
  });
  if (moreBtn) moreBtn.addEventListener('click', function () { shown += STEP; applyGallery(); });
  if (cards.length) applyGallery();

  /* ---------- CARD DA GALERIA -> WHATSAPP ---------- */
  function consultarCard(card) {
    var nome = card.dataset.name || '';
    var marca = card.dataset.brand || '';
    var msg = 'Olá! Vi o site da Fino Acabamento e queria consultar a disponibilidade de:%0A%0A'
      + encodeURIComponent(nome) + ' (' + encodeURIComponent(marca) + ')';
    window.open('https://wa.me/' + WA + '?text=' + msg, '_blank', 'noopener');
  }
  cards.forEach(function (card) {
    card.addEventListener('click', function (e) { e.preventDefault(); consultarCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); consultarCard(card); }
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      if (open) {
        a.style.height = a.scrollHeight + 'px';
        requestAnimationFrame(function () { a.style.height = '0px'; });
        item.classList.remove('is-open');
        q.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        a.style.height = a.scrollHeight + 'px';
        a.addEventListener('transitionend', function te() { a.style.height = 'auto'; a.removeEventListener('transitionend', te); });
      }
    });
  });

  /* ---------- FORMULÁRIO -> WHATSAPP ---------- */
  var form = document.querySelector('.hero__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (form.querySelector('[name="nome"]') || {}).value || '';
      var cidade = (form.querySelector('[name="cidade"]') || {}).value || '';
      var ambiente = (form.querySelector('[name="ambiente"]') || {}).value || '';
      var metragem = (form.querySelector('[name="metragem"]') || {}).value || '';
      var msg = 'Olá! Quero consultar disponibilidade na Fino Acabamento.%0A%0A'
        + 'Nome: ' + encodeURIComponent(nome) + '%0A'
        + 'Cidade: ' + encodeURIComponent(cidade) + '%0A'
        + 'Ambiente: ' + encodeURIComponent(ambiente) + '%0A'
        + 'Metragem aproximada: ' + encodeURIComponent(metragem) + ' m²';
      window.open('https://wa.me/' + WA + '?text=' + msg, '_blank', 'noopener');
    });
  }

  /* ---------- FUNDOS PARALLAX SOB DEMANDA ---------- */
  /* background-image de CSS não é lazy: as 3 fotos entrariam no caminho crítico
     e derrubavam o LCP. A classe .bg-on só entra quando a seção se aproxima. */
  (function () {
    var secs = Array.prototype.slice.call(document.querySelectorAll('.parallax-section'));
    if (!secs.length) return;
    if (!('IntersectionObserver' in window)) {
      secs.forEach(function (s) { s.classList.add('bg-on'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('bg-on'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '600px 0px' });
    secs.forEach(function (s) { io.observe(s); });
  })();

  /* ---------- FALLBACK iOS PARA O PARALLAX ---------- */
  /* iOS Safari ignora background-attachment:fixed. Nele a foto vira um filho
     position:fixed, ligado só enquanto a seção está no viewport. */
  (function () {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS) return;
    document.documentElement.classList.add('is-ios');
    var secs = Array.prototype.slice.call(document.querySelectorAll('.parallax-section'));
    function tick() {
      secs.forEach(function (s) {
        var bg = s.querySelector('.parallax-bg');
        if (!bg) return;
        var r = s.getBoundingClientRect();
        bg.classList.toggle('is-on', r.bottom > 0 && r.top < window.innerHeight);
      });
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* ---------- REFRESH ---------- */
  if (hasST) {
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
  }
})();
