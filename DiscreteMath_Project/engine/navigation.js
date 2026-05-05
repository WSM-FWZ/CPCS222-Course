/* ============================================================
   CPCS 222 — Discrete Mathematics
   navigation.js  —  Hash-based SPA routing + sidebar
   ============================================================ */
(function (global) {
  'use strict';

  var _sidebarList = null;
  var _lessonView  = null;
  var _currentSection = null;
  var _PREVIEW_SECTION = '1.1';  /* Only section fully rendered in PREVIEW */

  /* ----------------------------------------------------------
     BUILD SIDEBAR LESSON LIST
  ---------------------------------------------------------- */
  function buildSidebar() {
    if (!_sidebarList) return;
    _sidebarList.innerHTML = '';

    if (!global.JsonLoader) return;

    var lessons = global.JsonLoader.getAllLessons();
    lessons.forEach(function (lesson) {
      var isActive  = lesson.section === _currentSection;
      var isPreview = lesson.section === _PREVIEW_SECTION;
      var isLocked  = !isPreview;

      var item = document.createElement('li');
      item.className = 'lesson-list-item' +
                       (isActive  ? ' active'  : '') +
                       (isLocked  ? ' locked'  : '');
      item.dataset.section = lesson.section;

      var dot    = document.createElement('div');
      dot.className = 'lli-dot';

      var info   = document.createElement('div');
      info.style.flex = '1';

      var secEl  = document.createElement('div');
      secEl.className = 'lli-section';
      secEl.textContent = lesson.section;

      var titleEl = document.createElement('div');
      titleEl.className = 'lli-title';
      /* Short title: take text before the em-dash */
      var shortTitle = (lesson.title || '').split('—')[0].split('–')[0].trim();
      titleEl.textContent = shortTitle;

      info.appendChild(secEl);
      info.appendChild(titleEl);
      item.appendChild(dot);
      item.appendChild(info);

      if (isLocked) {
        var lock = document.createElement('span');
        lock.className = 'lli-lock';
        lock.textContent = '🔒';
        item.appendChild(lock);
      }

      item.addEventListener('click', function () {
        navigateTo(lesson.section);
      });

      _sidebarList.appendChild(item);
    });
  }

  /* ----------------------------------------------------------
     UPDATE ACTIVE ITEM IN SIDEBAR
  ---------------------------------------------------------- */
  function updateActive(section) {
    if (!_sidebarList) return;
    _sidebarList.querySelectorAll('.lesson-list-item').forEach(function (item) {
      item.classList.toggle('active', item.dataset.section === section);
    });
  }

  /* ----------------------------------------------------------
     NAVIGATE TO SECTION
  ---------------------------------------------------------- */
  function navigateTo(section) {
    if (!section || !global.JsonLoader) return;

    _currentSection = section;
    updateActive(section);

    /* Update URL hash */
    if (history.replaceState) {
      history.replaceState(null, '', '#' + section);
    } else {
      window.location.hash = '#' + section;
    }

    /* Update progress display */
    var progressEl = document.getElementById('progress-text');
    if (progressEl) progressEl.textContent = 'Section ' + section;

    /* Update page title */
    var lesson = global.JsonLoader.getLesson(section);
    if (lesson) {
      document.title = section + ' — ' + lesson.title.split('—')[0].trim() + ' | CPCS 222';
    }

    /* Show loading state */
    if (_lessonView) {
      _lessonView.innerHTML =
        '<div class="loading-state">' +
        '<div class="spinner"></div>' +
        '<p>Loading lesson ' + section + '…</p>' +
        '</div>';
    }

    /* Small delay to let loading state paint, then render */
    setTimeout(function () {
      if (!_lessonView) return;

      if (section === _PREVIEW_SECTION) {
        /* Full render */
        if (global.Renderer && lesson) {
          global.Renderer.renderLesson(lesson, _lessonView);
        } else if (!lesson) {
          _lessonView.innerHTML =
            '<div class="fallback-msg">' +
            '<div class="icon">⚠️</div>' +
            '<h3>Lesson Not Found</h3>' +
            '<p>Section ' + section + ' data is missing.</p>' +
            '</div>';
        }
      } else {
        /* Stub / coming soon */
        if (global.Renderer) {
          global.Renderer.renderStub(lesson, _lessonView);
        } else {
          _lessonView.innerHTML =
            '<div class="fallback-msg">' +
            '<div class="icon">🔒</div>' +
            '<h3>Coming Soon</h3>' +
            '<p>Section ' + section + ' will be available in the next release.</p>' +
            '</div>';
        }
      }
    }, 80);
  }

  /* ----------------------------------------------------------
     HASH CHANGE HANDLER
  ---------------------------------------------------------- */
  function onHashChange() {
    var hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      navigateTo(hash);
    }
  }

  /* ----------------------------------------------------------
     PUBLIC INIT
  ---------------------------------------------------------- */
  function init(sidebarListEl, lessonViewEl) {
    _sidebarList = sidebarListEl;
    _lessonView  = lessonViewEl;

    /* Build sidebar */
    buildSidebar();

    /* Determine initial section from hash or default */
    var hash = window.location.hash.replace('#', '').trim();
    var startSection = hash || _PREVIEW_SECTION;

    navigateTo(startSection);

    /* Listen for back/forward */
    window.addEventListener('hashchange', onHashChange);
  }

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  global.Navigation = {
    init:       init,
    navigateTo: navigateTo
  };

})(window);
