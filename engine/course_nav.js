/* ============================================================
   CPCS 222 — Course Navigator  (course_nav.js)
   Renders a full 10-module accordion sidebar on every lesson page.
   Reads window.CPCS_CONFIG to know the current module / page.
   ============================================================ */
(function (global) {
  'use strict';

  /* ── Static course structure ──────────────────────────────────
     Lesson titles and counts mirror the v4 JSON files exactly so that the
     sidebar entries always map to a real lesson_id (moduleN-lessonK). When
     v4 consolidates lessons (e.g. Module 9 went from 4 → 2), this array
     reflects that consolidation. */
  var COURSE = [
    { num: 1,  icon: '📐', title: 'Propositional Logic',
      lessons: [
        'What Is a Proposition?',
        'Logical Connectives — The Verbs of Logic',
        'Truth Tables and Conditional Statements'
      ]
    },
    { num: 2,  icon: '🔮', title: 'Predicate Logic',
      lessons: [
        'Predicates and Quantifiers',
        'Translating and Negating Quantified Statements',
        'Nested Quantifiers and Why Order Matters'
      ]
    },
    { num: 3,  icon: '🧮', title: 'Proofs',
      lessons: [
        'Rules of Inference',
        'Introduction to Proofs',
        'Proof Methods and Strategy'
      ]
    },
    { num: 4,  icon: '🔢', title: 'Sets',
      lessons: [
        'Sets — Definitions, Notation, and Membership',
        'Set Operations and Set Identities'
      ]
    },
    { num: 5,  icon: '📊', title: 'Sequences',
      lessons: [
        'Introduction to Sequences',
        'Arithmetic, Geometric, and Fibonacci Sequences'
      ]
    },
    { num: 6,  icon: 'Σ', title: 'Summations',
      lessons: [
        'Summation Notation and Basic Rules',
        'Closed-Form Formulas and the Geometric Series'
      ]
    },
    { num: 7,  icon: '📈', title: 'Functions',
      lessons: [
        'Functions — Domain, Codomain, Range',
        'Injective, Surjective, Bijective — and Composition'
      ]
    },
    { num: 8,  icon: '🔗', title: 'Relations',
      lessons: [
        'Relations and Their Properties',
        'Equivalence Relations and Partial Orders'
      ]
    },
    { num: 9,  icon: '🎲', title: 'Counting',
      lessons: [
        'Basic Counting Rules and the Pigeonhole Principle',
        'Permutations and Combinations'
      ]
    },
    { num: 10, icon: '🏗️', title: 'Mathematical Induction',
      lessons: [
        'Mathematical Induction — The Two Steps',
        'Induction on Inequalities, Divisibility, and Recursion'
      ]
    }
  ];

  /* ── Helpers ─────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Active-page detection ───────────────────────────────── */
  function _activeLessonNum(cfg) {
    if (!cfg || cfg.type !== 'lesson' || !cfg.lessonId) return 0;
    var m = cfg.lessonId.match(/lesson(\d+)/);
    return m ? Number(m[1]) : 0;
  }

  /* ── Build sidebar HTML ──────────────────────────────────── */
  function _buildHtml(cfg) {
    var currentMod   = cfg ? cfg.moduleNum : 0;
    var isExercises  = cfg ? cfg.type === 'exercises' : false;
    var activeLesNum = _activeLesNum(cfg);

    var rows = COURSE.map(function (mod) {
      var isOpen = (mod.num === currentMod);
      var modBody = '';

      mod.lessons.forEach(function (title, i) {
        var lesNum = i + 1;
        var href   = '../module' + mod.num + '/lesson' + lesNum + '.html';
        var isActive = isOpen && !isExercises && (activeLesNum === lesNum);
        modBody +=
          '<a href="' + href + '"' +
          ' class="cnav-item' + (isActive ? ' cnav-active' : '') + '"' +
          ' tabindex="0">' +
            '<span class="cnav-item-num">' + lesNum + '</span>' +
            '<span class="cnav-item-title">' + esc(title) + '</span>' +
            '<span class="cnav-item-badge">📖</span>' +
          '</a>';
      });

      var exHref   = '../module' + mod.num + '/exercises.html';
      var exActive = isOpen && isExercises;
      modBody +=
        '<a href="' + exHref + '"' +
        ' class="cnav-item cnav-item-ex' + (exActive ? ' cnav-active' : '') + '"' +
        ' tabindex="0">' +
          '<span class="cnav-item-num cnav-ex-num">Ex</span>' +
          '<span class="cnav-item-title">Module ' + mod.num + ' Practice</span>' +
          '<span class="cnav-item-badge cnav-ex-badge">🧪</span>' +
        '</a>';

      return (
        '<div class="cnav-module" id="cnav-m' + mod.num + '">' +
          '<button class="cnav-module-btn"' +
          ' aria-expanded="' + (isOpen ? 'true' : 'false') + '"' +
          ' onclick="CourseNav.toggle(' + mod.num + ')"' +
          ' type="button">' +
            '<span class="cnav-mod-badge">M' + mod.num + '</span>' +
            '<span class="cnav-mod-icon">' + mod.icon + '</span>' +
            '<span class="cnav-mod-title">' + esc(mod.title) + '</span>' +
            '<span class="cnav-chevron" aria-hidden="true">' +
              (isOpen ? '&#9660;' : '&#9658;') +
            '</span>' +
          '</button>' +
          '<div class="cnav-body' + (isOpen ? ' cnav-open' : '') + '">' +
            modBody +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="cnav-brand">' +
        '<div class="cnav-brand-icon">📚</div>' +
        '<div class="cnav-brand-info">' +
          '<div class="cnav-brand-label">CPCS 222</div>' +
          '<div class="cnav-brand-name">Discrete Mathematics</div>' +
        '</div>' +
      '</div>' +
      '<nav class="cnav-list" aria-label="Course navigation">' +
        rows +
      '</nav>'
    );
  }

  /* Alias — used internally */
  function _activeLesNum(cfg) { return _activeLessonNum(cfg); }

  /* ── Inject sidebar ──────────────────────────────────────── */
  function buildNav(cfg) {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = _buildHtml(cfg);
    sidebar.classList.add('cnav-sidebar');
  }

  /* ── Accordion toggle ────────────────────────────────────── */
  function toggle(num) {
    var el  = document.getElementById('cnav-m' + num);
    if (!el) return;
    var btn  = el.querySelector('.cnav-module-btn');
    var body = el.querySelector('.cnav-body');
    var chev = el.querySelector('.cnav-chevron');
    if (!btn || !body) return;

    var isOpen = body.classList.contains('cnav-open');
    if (isOpen) {
      body.classList.remove('cnav-open');
      btn.setAttribute('aria-expanded', 'false');
      if (chev) chev.innerHTML = '&#9658;';
    } else {
      body.classList.add('cnav-open');
      btn.setAttribute('aria-expanded', 'true');
      if (chev) chev.innerHTML = '&#9660;';
    }
  }

  /* ── Mobile sidebar overlay ──────────────────────────────── */
  function _initMobileToggle() {
    var btn     = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('cnav-overlay');
    if (!btn || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('cnav-overlay-show');
      btn.setAttribute('aria-expanded', 'true');
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('cnav-overlay-show');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) { closeSidebar(); } else { openSidebar(); }
    });
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }
  }

  /* ── Scroll active item into view ────────────────────────── */
  function _scrollActive() {
    var active = document.querySelector('.cnav-active');
    if (active) {
      setTimeout(function () {
        active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 150);
    }
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    var cfg = global.CPCS_CONFIG || null;
    buildNav(cfg);
    _initMobileToggle();
    _scrollActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Export ──────────────────────────────────────────────── */
  global.CourseNav = { toggle: toggle, buildNav: buildNav };

})(window);
