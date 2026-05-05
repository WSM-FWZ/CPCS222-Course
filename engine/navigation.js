/* ============================================================
   CPCS 222 — Discrete Mathematics
   navigation.js  —  Hash-based routing + breadcrumb + bottom nav
   ============================================================ */
(function (global) {
  'use strict';

  var _PREVIEW_SECTION = '1.1';

  var _sidebarListEl  = null;
  var _lessonViewEl   = null;
  var _breadcrumbEl   = null;
  var _bottomNavEl    = null;
  var _currentSection = null;

  function init(sidebarListEl, lessonViewEl) {
    _sidebarListEl = sidebarListEl;
    _lessonViewEl  = lessonViewEl;

    if (!global.JsonLoader) { console.error('[Nav] JsonLoader not loaded'); return; }
    JsonLoader.init();

    _buildSidebar();
    _breadcrumbEl = document.getElementById('breadcrumb-nav');
    _buildBottomNav();
    _route();

    global.addEventListener('hashchange', _route);
  }

  function _route() {
    var hash = global.location.hash.replace('#', '') || '1.1';
    var lesson = JsonLoader.getLesson(hash);
    if (!lesson) { hash = '1.1'; }
    navigateTo(hash);
  }

  function navigateTo(section) {
    _currentSection = section;
    var lesson = JsonLoader.getLesson(section);
    if (!lesson) {
      _lessonViewEl.innerHTML = '<p style="padding:2rem;color:var(--text-3)">Section not found.</p>';
      return;
    }

    global.location.hash = '#' + section;

    // update sidebar active
    if (_sidebarListEl) {
      _sidebarListEl.querySelectorAll('.lesson-list-item').forEach(function (li) {
        var active = li.getAttribute('data-section') === section;
        li.classList.toggle('active', active);
      });
    }

    // update header progress
    var progress = document.getElementById('progress-text');
    if (progress) progress.textContent = 'Section ' + section;

    _lessonViewEl.scrollTop = 0;

    if (_isUnlocked(section)) {
      Renderer.renderLesson(lesson, _lessonViewEl);
    } else {
      Renderer.renderStub(lesson, _lessonViewEl);
    }

    _updateBreadcrumb(section);
    _updateBottomNav(section);
  }

  function _isUnlocked(section) {
    return parseFloat(section) <= parseFloat(_PREVIEW_SECTION);
  }

  /* ----------------------------------------------------------
     SIDEBAR
  ---------------------------------------------------------- */
  function _buildSidebar() {
    if (!_sidebarListEl) return;
    _sidebarListEl.innerHTML = '';
    JsonLoader.getAllLessons().forEach(function (lesson) {
      var li = document.createElement('li');
      li.className = 'lesson-list-item' + (_isUnlocked(lesson.section) ? '' : ' locked');
      li.setAttribute('data-section', lesson.section);

      var dot = document.createElement('span');
      dot.className = 'lli-dot';
      dot.setAttribute('aria-hidden','true');

      var info = document.createElement('div');
      info.style.flex = '1';
      info.style.minWidth = '0';

      var sec = document.createElement('div');
      sec.className = 'lli-section';
      sec.textContent = lesson.section;

      var title = document.createElement('div');
      title.className = 'lli-title';
      title.textContent = lesson.title.split(' — ')[0];

      info.appendChild(sec);
      info.appendChild(title);

      li.appendChild(dot);
      li.appendChild(info);

      if (!_isUnlocked(lesson.section)) {
        var lock = document.createElement('span');
        lock.className = 'lli-lock';
        lock.textContent = '🔒';
        lock.setAttribute('aria-label','Locked');
        li.appendChild(lock);
      }

      if (_isUnlocked(lesson.section)) {
        li.addEventListener('click', function () { navigateTo(lesson.section); });
      }

      _sidebarListEl.appendChild(li);
    });
  }

  /* ----------------------------------------------------------
     BREADCRUMB
  ---------------------------------------------------------- */
  function _updateBreadcrumb(section) {
    if (!_breadcrumbEl) return;
    var lesson = JsonLoader.getLesson(section);
    var shortTitle = lesson ? lesson.title.split(' — ')[0] : 'Section ' + section;
    _breadcrumbEl.innerHTML =
      '<a href="../index.html">Home</a>' +
      '<span class="breadcrumb-sep" aria-hidden="true">›</span>' +
      '<span>Chapter 1</span>' +
      '<span class="breadcrumb-sep" aria-hidden="true">›</span>' +
      '<span class="breadcrumb-current">' + shortTitle + '</span>';
  }

  /* ----------------------------------------------------------
     BOTTOM NAVIGATION  (appended inside lesson-view each render)
  ---------------------------------------------------------- */
  function _buildBottomNav() {
    // no-op: bottom nav is built fresh each time in _updateBottomNav
  }

  function _updateBottomNav(section) {
    var lessons = JsonLoader.getAllLessons();
    var idx = -1;
    lessons.forEach(function (l, i) { if (l.section === section) idx = i; });
    var prev = idx > 0 ? lessons[idx - 1] : null;
    var next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

    var nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.setAttribute('aria-label','Lesson navigation');

    if (prev) {
      var pBtn = document.createElement('button');
      pBtn.className = 'btn-nav';
      pBtn.innerHTML = '← ' + prev.section;
      pBtn.addEventListener('click', function () { navigateTo(prev.section); });
      nav.appendChild(pBtn);
    } else {
      nav.appendChild(document.createElement('span'));
    }

    var indicator = document.createElement('div');
    indicator.className = 'lesson-indicator';
    indicator.textContent = (idx + 1) + ' / ' + lessons.length;
    nav.appendChild(indicator);

    if (next) {
      var nBtn = document.createElement('button');
      nBtn.className = 'btn-nav next';
      nBtn.innerHTML = next.section + ' →';
      nBtn.addEventListener('click', function () { navigateTo(next.section); });
      nav.appendChild(nBtn);
    } else {
      nav.appendChild(document.createElement('span'));
    }

    _lessonViewEl.appendChild(nav);
  }

  global.Navigation = { init: init, navigateTo: navigateTo };

})(window);
