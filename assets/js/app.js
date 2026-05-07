/* ============================================================
   CPCS 222 — Discrete Mathematics
   app.js  —  Bootstrap: theme toggle + scroll reveal
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     THEME TOGGLE
  ---------------------------------------------------------- */
  function initTheme() {
    var html  = document.documentElement;
    var btn   = document.getElementById('theme-toggle');
    var saved = localStorage.getItem('cpcs222-theme') || 'light';

    html.setAttribute('data-theme', saved);
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';

    if (btn) {
      btn.addEventListener('click', function () {
        var current = html.getAttribute('data-theme');
        var next    = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('cpcs222-theme', next);
        btn.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    }
  }

  /* ----------------------------------------------------------
     SCROLL REVEAL  (IntersectionObserver)
     Adds .visible to .reveal elements as they enter viewport.
     Falls back gracefully if IntersectionObserver is absent.
  ---------------------------------------------------------- */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    function observeAll() {
      document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
        observer.observe(el);
      });
    }

    observeAll();

    // re-scan after navigation renders new content
    var lessonView = document.getElementById('lesson-view');
    if (lessonView && 'MutationObserver' in window) {
      var mutObs = new MutationObserver(function () {
        observeAll();
      });
      mutObs.observe(lessonView, { childList: true, subtree: true });
    }
  }

  /* ----------------------------------------------------------
     MOBILE SIDEBAR TOGGLE
     course_nav.js handles the full logic; this is a no-op
     guard so the overlay/open class stays consistent.
  ---------------------------------------------------------- */
  function initSidebarToggle() {
    /* Handled by CourseNav._initMobileToggle — skip to avoid conflicts. */
  }

  /* ----------------------------------------------------------
     BOOT
  ---------------------------------------------------------- */
  function boot() {
    initTheme();
    initScrollReveal();
    initSidebarToggle();

    // initialize data and routing
    if (typeof Navigation !== 'undefined') {
      var sidebarList = document.getElementById('lesson-list');
      var lessonView  = document.getElementById('lesson-view');
      if (sidebarList && lessonView) {
        Navigation.init(sidebarList, lessonView);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
