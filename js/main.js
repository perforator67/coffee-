/* ==========================================================================
   «Тишь» — интерактив. Ванильный JS, без зависимостей.
   ========================================================================== */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: фон с размытием после начала скролла ---------- */
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Мобильное меню ---------- */
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  burger.addEventListener('click', function () {
    setMenu(!header.classList.contains('is-open'));
  });
  document.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Появление секций при скролле ---------- */
  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Подсветка активного пункта навигации ---------- */
  var navLinks = {};
  document.querySelectorAll('.nav__link').forEach(function (link) {
    navLinks[link.getAttribute('href').slice(1)] = link;
  });
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navLinks).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* ---------- Лёгкий параллакс декора в hero ---------- */
  var parallaxItems = document.querySelectorAll('[data-parallax]');
  if (parallaxItems.length && !reduceMotion) {
    // Запоминаем исходный transform из разметки, чтобы дописывать к нему смещение
    parallaxItems.forEach(function (el) {
      el.dataset.base = el.getAttribute('transform') || '';
    });
    var ticking = false;
    function applyParallax() {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        parallaxItems.forEach(function (el) {
          var shift = -(y * parseFloat(el.dataset.parallax)).toFixed(1);
          el.setAttribute('transform', 'translate(0 ' + shift + ') ' + el.dataset.base);
        });
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyParallax);
      }
    }, { passive: true });
  }

  /* ---------- Статус «открыто / закрыто» по петербургскому времени ---------- */
  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');
  if (statusDot && statusText) {
    // Петербург — UTC+3 круглый год
    var now = new Date(Date.now() + 3 * 60 * 60 * 1000);
    var day = now.getUTCDay();                      // 0 — воскресенье
    var minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    var weekend = day === 0 || day === 6;
    var opens = weekend ? 9 * 60 : 8 * 60;
    var closes = weekend ? 22 * 60 : 21 * 60;

    if (minutes >= opens && minutes < closes) {
      statusDot.classList.add('is-open');
      statusText.textContent = 'Сейчас открыто · до ' + (closes / 60) + ':00';
    } else {
      // Если ещё не открылись — откроемся сегодня, иначе — завтра
      var nextDay = minutes < opens ? day : (day + 1) % 7;
      var nextOpens = (nextDay === 0 || nextDay === 6) ? 9 : 8;
      statusText.textContent = 'Сейчас закрыто · откроемся в ' + nextOpens + ':00';
    }
  }

  /* ---------- Ссылки-заглушки соцсетей не прыгают по странице ---------- */
  document.querySelectorAll('[data-stub]').forEach(function (link) {
    link.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Год в футере ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
