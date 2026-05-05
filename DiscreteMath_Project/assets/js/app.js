/* ============================================================
   CPCS 222 — Discrete Mathematics
   app.js  —  Application bootstrap
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     THEME
  ---------------------------------------------------------- */
  var THEME_KEY = 'cpcs222_theme';

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ----------------------------------------------------------
     HOME PAGE BOOTSTRAP
  ---------------------------------------------------------- */
  function initHome() {
    /* Theme */
    setTheme(getTheme());
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  }

  /* ----------------------------------------------------------
     VIEWER PAGE BOOTSTRAP
  ---------------------------------------------------------- */
  function initViewer() {
    /* Theme */
    setTheme(getTheme());
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    /* Init data loader */
    var loaderOk = false;
    if (window.JsonLoader) {
      loaderOk = window.JsonLoader.init();
    }

    if (!loaderOk) {
      var view = document.getElementById('lesson-view');
      if (view) {
        view.innerHTML =
          '<div class="fallback-msg">' +
          '<div class="icon">⚠️</div>' +
          '<h3>Data Load Error</h3>' +
          '<p>Could not initialize the lesson data. Please reload the page.</p>' +
          '</div>';
      }
      return;
    }

    /* Populate header course info */
    var meta = window.JsonLoader.getMeta();
    var headerTitle = document.querySelector('.header-title');
    if (headerTitle && meta.chapter_title) {
      headerTitle.textContent = 'Ch. 1 — ' + meta.chapter_title;
    }

    /* Init navigation (wires sidebar + lesson view) */
    var sidebarList = document.getElementById('lesson-list');
    var lessonView  = document.getElementById('lesson-view');
    if (window.Navigation && sidebarList && lessonView) {
      window.Navigation.init(sidebarList, lessonView);
    }

    /* Mobile sidebar toggle (if we add a hamburger) */
    var sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
        var sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }

    /* Close sidebar on overlay click (mobile) */
    document.addEventListener('click', function (e) {
      var sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      if (window.innerWidth > 768) return;
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          e.target.id !== 'sidebar-toggle') {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ----------------------------------------------------------
     DETECT PAGE AND BOOT
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    if (body.classList.contains('page-home')) {
      initHome();
    } else if (body.classList.contains('page-viewer')) {
      initViewer();
    } else {
      /* Fallback: try viewer boot if scripts are loaded */
      if (window.JsonLoader) {
        document.body.classList.add('page-viewer');
        initViewer();
      } else {
        setTheme(getTheme());
      }
    }
  });

})();
