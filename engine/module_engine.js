/* ============================================================
   CPCS 222 — Universal Module Engine  v2.0
   Driven by window.CPCS_CONFIG set on each page before load.

   CPCS_CONFIG shape:
   {
     type          : 'lesson' | 'exercises',
     lessonId      : 'module3-lesson1',    // lesson pages only
     moduleNum     : 3,
     moduleTitle   : 'Proofs',
     moduleIcon    : '🧮',
     moduleColor   : 'ch3',
     jsonPath      : '../../content/module3.json',
     prevModulePath: '../module2/exercises.html',  // '' for M1 lesson1→home
     nextModulePath: '../module4/lesson1.html',    // '' for M10 exercises→home
   }
   ============================================================ */
(function (global) {
  'use strict';

  /* ── COLOR MAP ──────────────────────────────────────────────── */
  var COLOR_GRAD = {
    ch1:  'linear-gradient(135deg,#1e3a8a 0%,#2563eb 40%,#7c3aed 100%)',
    ch2:  'linear-gradient(135deg,#065f46 0%,#10b981 40%,#06b6d4 100%)',
    ch3:  'linear-gradient(135deg,#92400e 0%,#f59e0b 40%,#ef4444 100%)',
    ch4:  'linear-gradient(135deg,#831843 0%,#ec4899 40%,#7c3aed 100%)',
    ch5:  'linear-gradient(135deg,#0e7490 0%,#06b6d4 40%,#2563eb 100%)',
    ch6:  'linear-gradient(135deg,#065f46 0%,#10b981 40%,#f59e0b 100%)',
    ch7:  'linear-gradient(135deg,#4c1d95 0%,#7c3aed 40%,#ec4899 100%)',
    ch8:  'linear-gradient(135deg,#7f1d1d 0%,#ef4444 40%,#f59e0b 100%)',
    ch9:  'linear-gradient(135deg,#134e4a 0%,#06b6d4 40%,#10b981 100%)',
    ch10: 'linear-gradient(135deg,#312e81 0%,#4f46e5 40%,#0ea5e9 100%)'
  };

  /* Exercise-hero uses a darkened variant of the same hue */
  var EX_GRAD = {
    ch1:  'linear-gradient(135deg,#0f172a 0%,#1d4ed8 40%,#5b21b6 100%)',
    ch2:  'linear-gradient(135deg,#052e16 0%,#059669 40%,#0891b2 100%)',
    ch3:  'linear-gradient(135deg,#451a03 0%,#d97706 40%,#b91c1c 100%)',
    ch4:  'linear-gradient(135deg,#500724 0%,#be185d 40%,#5b21b6 100%)',
    ch5:  'linear-gradient(135deg,#082f49 0%,#0369a1 40%,#1d4ed8 100%)',
    ch6:  'linear-gradient(135deg,#052e16 0%,#059669 40%,#b45309 100%)',
    ch7:  'linear-gradient(135deg,#2e1065 0%,#6d28d9 40%,#9d174d 100%)',
    ch8:  'linear-gradient(135deg,#450a0a 0%,#b91c1c 40%,#92400e 100%)',
    ch9:  'linear-gradient(135deg,#042f2e 0%,#0e7490 40%,#065f46 100%)',
    ch10: 'linear-gradient(135deg,#1e1b4b 0%,#3730a3 40%,#0369a1 100%)'
  };

  var _cache = null;
  var _score = { correct: 0, total: 0 };
  var _cfg   = null;   /* set in _init() */

  /* ── INIT ───────────────────────────────────────────────────── */
  function _init() {
    _cfg = global.CPCS_CONFIG || {};
    var jsonPath = _cfg.jsonPath || './content/module1.json';

    var container = document.getElementById('lesson-view');
    if (!container) return;

    if (_cfg.type === 'exercises') {
      renderExercises(container, jsonPath);
    } else {
      renderLesson(_cfg.lessonId, container, jsonPath);
    }
  }

  /* ── HELPERS ────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _load(jsonPath, cb) {
    if (_cache) { cb(null, _cache); return; }
    fetch(jsonPath)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { _cache = d; cb(null, d); })
      .catch(function (e) { cb(e, null); });
  }

  function _grad(color) { return COLOR_GRAD[color] || COLOR_GRAD.ch1; }
  function _exGrad(color) { return EX_GRAD[color] || EX_GRAD.ch1; }

  /* ── PAGE META ─────────────────────────────────────────────── */
  function _updateMeta(lesson, idx, total) {
    var cfg = _cfg;
    var modLabel = 'Module ' + cfg.moduleNum + ' — ' + cfg.moduleTitle;

    /* Header */
    var ht = document.getElementById('mod-header-title');
    if (ht) ht.textContent = modLabel;

    var hp = document.getElementById('mod-progress');
    if (hp) hp.textContent = lesson ? ('Lesson ' + (idx + 1) + ' of ' + total) : '🧪 Exercises';

    /* Breadcrumb */
    var bm = document.getElementById('mod-bc-module');
    if (bm) bm.textContent = 'Module ' + cfg.moduleNum;

    var bl = document.getElementById('mod-bc-lesson');
    if (bl) bl.textContent = lesson ? lesson.title : 'Exercises';

    /* Sidebar header — managed by course_nav.js; no-op here */
  }

  /* ── SIDEBAR ───────────────────────────────────────────────── */
  /* Sidebar is now fully managed by course_nav.js — this is a no-op. */
  function _buildSidebar(lessons, activeId) { /* handled by CourseNav */ }

  /* ── PUBLIC — LESSON ────────────────────────────────────────── */
  function renderLesson(lessonId, container, jsonPath) {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading lesson…</p></div>';
    _load(jsonPath, function (err, data) {
      if (err) { _showErr(container, err); return; }
      var lessons = data.module.lessons;
      var lesson = null, idx = -1;
      for (var i = 0; i < lessons.length; i++) {
        if (lessons[i].lesson_id === lessonId) { lesson = lessons[i]; idx = i; break; }
      }
      if (!lesson) {
        container.innerHTML = '<p style="padding:2rem;color:var(--text-3)">Lesson not found: ' + esc(lessonId) + '</p>';
        return;
      }
      _updateMeta(lesson, idx, lessons.length);
      _buildSidebar(lessons, lessonId);
      if (_isV3(data)) {
        _buildLessonV3(lesson, idx, lessons, container);
      } else if (_isV2(data, lesson)) {
        _buildLessonV2(lesson, idx, lessons, container);
      } else {
        _buildLesson(lesson, idx, lessons, container);
        _initReveal(container);
        if (global.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]);
      }
    });
  }

  /* ── PUBLIC — EXERCISES ─────────────────────────────────────── */
  function renderExercises(container, jsonPath) {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading exercises…</p></div>';
    _load(jsonPath, function (err, data) {
      if (err) { _showErr(container, err); return; }
      _score = { correct: 0, total: 0 };
      var lessons = data.module.lessons;
      _updateMeta(null, -1, lessons.length);
      _buildSidebar(lessons, null);
      _buildExercises(data.module.exercises, lessons, container);
      _initReveal(container);
    });
  }

  /* ── LESSON BUILDER ─────────────────────────────────────────── */
  function _buildLesson(lesson, idx, allLessons, container) {
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'me-lesson';

    art.appendChild(_heroCard(lesson, idx, allLessons.length));
    art.appendChild(_welcomeCard(lesson.welcome));

    if (lesson.storytelling && lesson.storytelling.length) {
      art.appendChild(_storyCard(lesson.storytelling));
    }

    (lesson.sections || []).forEach(function (sec) {
      art.appendChild(_sectionCard(sec));
    });

    if (lesson.worked_examples && lesson.worked_examples.length) {
      art.appendChild(_workedExamplesBlock(lesson.worked_examples));
    }

    if (lesson.quick_checks && lesson.quick_checks.length) {
      art.appendChild(_quickChecksBlock(lesson.quick_checks));
    }

    if (lesson.summary) {
      art.appendChild(_summaryCard(lesson.summary));
    }

    art.appendChild(_lessonBottomNav(idx, allLessons));
    container.appendChild(art);
  }

  /* ── HERO CARD ──────────────────────────────────────────────── */
  function _heroCard(lesson, idx, total) {
    var cfg = _cfg;
    var pct = Math.round(((idx + 1) / total) * 100);
    var div = document.createElement('div');
    div.className = 'm1-hero reveal';
    div.style.background = _grad(cfg.moduleColor);
    div.innerHTML =
      '<div class="m1-hero-top">' +
        '<span class="m1-hero-module">' + esc(cfg.moduleIcon) + ' Module ' + cfg.moduleNum + ' — ' + esc(cfg.moduleTitle) + '</span>' +
        '<span class="badge badge-tutorial">📖 Tutorial</span>' +
      '</div>' +
      '<div class="m1-hero-progress-row">' +
        '<span class="m1-hero-num">Lesson ' + (idx + 1) + ' of ' + total + '</span>' +
        '<div class="m1-prog-bar-wrap"><div class="m1-prog-bar" style="width:' + pct + '%"></div></div>' +
        '<span class="m1-prog-pct">' + pct + '%</span>' +
      '</div>' +
      '<h1 class="m1-hero-title">' + esc(lesson.title) + '</h1>' +
      '<div class="m1-objectives">' +
        '<div class="m1-obj-label">🎯 After this lesson you will be able to:</div>' +
        '<ul class="m1-obj-list">' +
          (lesson.objectives || []).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') +
        '</ul>' +
      '</div>';
    return div;
  }

  /* ── WELCOME CARD ───────────────────────────────────────────── */
  function _welcomeCard(text) {
    var div = document.createElement('div');
    div.className = 'm1-welcome reveal';
    div.innerHTML =
      '<div class="m1-welcome-inner">' +
        '<div class="m1-welcome-icon">💡</div>' +
        '<div class="m1-welcome-text">' + esc(text || '') + '</div>' +
      '</div>';
    return div;
  }

  /* ── STORY CARD ─────────────────────────────────────────────── */
  function _storyCard(dialogue) {
    var div = document.createElement('div');
    div.className = 'm1-story reveal';
    var rows = dialogue.map(function (entry) {
      var isProf = entry.speaker === 'Professor';
      return '<div class="m1-chat-row ' + (isProf ? 'm1-chat-right' : 'm1-chat-left') + '">' +
        '<div class="m1-chat-avatar ' + (isProf ? 'm1-avatar-prof' : 'm1-avatar-student') + '">' +
          (isProf ? 'P' : 'S') +
        '</div>' +
        '<div class="m1-chat-bubble ' + (isProf ? 'm1-bubble-prof' : 'm1-bubble-student') + '">' +
          '<div class="m1-chat-speaker">' + esc(entry.speaker) + '</div>' +
          '<p>' + esc(entry.text) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
    div.innerHTML =
      '<div class="m1-block-header">' +
        '<div class="m1-block-icon m1-icon-story">💬</div>' +
        '<div><div class="m1-block-title">Classroom Dialogue</div>' +
        '<div class="m1-block-sub">Follow the conversation to build intuition</div></div>' +
      '</div>' +
      '<div class="m1-chat">' + rows + '</div>';
    return div;
  }

  /* ── SECTION CARD ───────────────────────────────────────────── */
  function _sectionCard(sec) {
    var div = document.createElement('div');
    div.className = 'm1-section reveal';

    var exHtml = '';
    if (sec.examples && sec.examples.length) {
      exHtml = '<div class="m1-sec-examples">' +
        '<div class="m1-sec-ex-label">📌 Examples</div>' +
        '<ul>' + sec.examples.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }

    var visHtml = '';
    if (sec.visual_idea) {
      var vi = sec.visual_idea;
      var icons = { 'truth-table': '📊', diagram: '🗺️', flowchart: '🔀', svg: '🖼️' };
      visHtml = '<div class="m1-visual">' +
        '<div class="m1-visual-header">' + (icons[vi.type] || '🖼️') + ' Visual — <em>' + esc(vi.type) + '</em></div>' +
        '<p class="m1-visual-desc">' + esc(vi.description) + '</p>' +
        '<p class="m1-visual-hint">💡 ' + esc(vi.interactive_hint) + '</p>' +
      '</div>';
    }

    var mistakesHtml = '';
    if (sec.common_mistakes && sec.common_mistakes.length) {
      mistakesHtml = '<div class="m1-mistakes">' +
        '<div class="m1-mistakes-label">⚠️ Common Mistake' + (sec.common_mistakes.length > 1 ? 's' : '') + '</div>' +
        '<ul>' + sec.common_mistakes.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }

    div.innerHTML =
      '<div class="m1-sec-top">' +
        '<div class="m1-sec-num">' + esc(sec.number) + '</div>' +
        '<h2 class="m1-sec-heading">' + esc(sec.heading) + '</h2>' +
      '</div>' +
      '<p class="m1-sec-explain">' + esc(sec.explanation) + '</p>' +
      exHtml + visHtml + mistakesHtml;
    return div;
  }

  /* ── WORKED EXAMPLES ────────────────────────────────────────── */
  function _workedExamplesBlock(examples) {
    var div = document.createElement('div');
    div.className = 'm1-worked reveal';
    var cards = examples.map(function (ex, i) {
      var uid = 'me-we-' + Date.now() + '-' + i;
      var stepsHtml = (ex.step_by_step_solution || []).map(function (s, j) {
        return '<div class="m1-step"><span class="m1-step-num">' + (j + 1) + '</span><span>' + esc(s) + '</span></div>';
      }).join('');
      var mistakeHtml = ex.common_mistake
        ? '<div class="m1-we-mistake"><span class="m1-we-label">⚠️ Common Mistake</span><p>' + esc(ex.common_mistake) + '</p></div>'
        : '';
      return '<div class="m1-we-card" id="' + uid + '">' +
        '<div class="m1-we-header" onclick="document.getElementById(\'' + uid + '\').classList.toggle(\'open\')">' +
          '<span class="m1-we-badge">Ex ' + (i + 1) + '</span>' +
          '<span class="m1-we-problem">' + esc(ex.problem) + '</span>' +
          '<span class="m1-we-toggle">▾</span>' +
        '</div>' +
        '<div class="m1-we-body">' +
          '<div class="m1-we-steps"><span class="m1-we-label">Step-by-Step</span>' + stepsHtml + '</div>' +
          '<div class="m1-we-answer"><span class="m1-we-label">✅ Final Answer</span>' + _formatAnswer(ex.final_answer) + '</div>' +
          '<div class="m1-we-why"><span class="m1-we-label">💡 Why It Works</span><p>' + esc(ex.why_it_works) + '</p></div>' +
          mistakeHtml +
        '</div>' +
      '</div>';
    }).join('');

    div.innerHTML =
      '<div class="m1-block-header">' +
        '<div class="m1-block-icon m1-icon-worked">📝</div>' +
        '<div><div class="m1-block-title">Worked Examples</div>' +
        '<div class="m1-block-sub">Click any example to expand</div></div>' +
      '</div>' + cards;
    return div;
  }

  /* ── QUICK CHECKS ───────────────────────────────────────────── */
  function _quickChecksBlock(checks) {
    var div = document.createElement('div');
    div.className = 'm1-quickchecks reveal';
    var qHtml = checks.map(function (qc, i) {
      return _renderQC(qc, 'me-qc-' + Date.now() + '-' + i);
    }).join('');
    div.innerHTML =
      '<div class="m1-block-header">' +
        '<div class="m1-block-icon m1-icon-check">⚡</div>' +
        '<div><div class="m1-block-title">Quick Checks</div>' +
        '<div class="m1-block-sub">Test yourself before moving on</div></div>' +
      '</div>' + qHtml;
    return div;
  }

  function _renderQC(qc, uid) {
    if (qc.type === 'mcq' || qc.type === 'true_false') {
      var choicesHtml = (qc.choices || []).map(function (c, j) {
        return '<button class="m1-choice" data-qid="' + uid + '" data-val="' + esc(c) + '" ' +
          'data-correct="' + (c === qc.answer ? '1' : '0') + '" ' +
          'onclick="ModuleEngine.checkAnswer(this)">' +
          '<span class="m1-choice-letter">' + String.fromCharCode(65 + j) + '</span>' +
          '<span>' + esc(c) + '</span>' +
          '</button>';
      }).join('');
      return '<div class="m1-qc-card" id="' + uid + '">' +
        '<div class="m1-qc-q">' +
          '<span class="m1-qc-badge m1-qc-badge-' + qc.type + '">' + (qc.type === 'true_false' ? 'T/F' : 'MCQ') + '</span>' +
          esc(qc.question) +
        '</div>' +
        '<div class="m1-choices">' + choicesHtml + '</div>' +
        '<div class="m1-qc-feedback" id="' + uid + '-fb">' + esc(qc.explanation || '') + '</div>' +
      '</div>';
    }
    /* short_answer */
    return '<div class="m1-qc-card" id="' + uid + '">' +
      '<div class="m1-qc-q">' +
        '<span class="m1-qc-badge m1-qc-badge-sa">SA</span>' +
        esc(qc.question) +
      '</div>' +
      '<div class="m1-sa-area">' +
        '<button class="m1-sa-reveal" onclick="(function(b){' +
          'b.style.display=\'none\';' +
          'document.getElementById(\'' + uid + '-fb\').style.display=\'block\'' +
        '})(this)">Show Answer</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" id="' + uid + '-fb">' +
          '<strong>Answer:</strong> ' + esc(qc.answer) +
          (qc.explanation ? '<br><em>' + esc(qc.explanation) + '</em>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── SUMMARY CARD ───────────────────────────────────────────── */
  function _summaryCard(summary) {
    var div = document.createElement('div');
    div.className = 'm1-summary reveal';
    div.innerHTML =
      '<div class="m1-block-header">' +
        '<div class="m1-block-icon m1-icon-summary">⭐</div>' +
        '<div><div class="m1-block-title">Lesson Summary</div>' +
        '<div class="m1-block-sub">Key ideas to remember</div></div>' +
      '</div>' +
      '<ul class="m1-summary-list">' +
        (summary.key_takeaways || []).map(function (t) {
          return '<li><span class="m1-summ-bullet">✦</span><span>' + esc(t) + '</span></li>';
        }).join('') +
      '</ul>' +
      (summary.next
        ? '<div class="m1-summary-next">▶ <strong>Up next:</strong> ' + esc(summary.next) + '</div>'
        : '');
    return div;
  }

  /* ── BOTTOM NAV — LESSON ─────────────────────────────────────── */
  function _lessonBottomNav(idx, lessons) {
    var cfg = _cfg;
    var div = document.createElement('div');
    div.className = 'bottom-nav';

    /* Previous: first lesson goes to prevModulePath, others to previous lesson */
    var prevHtml;
    if (idx === 0) {
      var prevLabel = cfg.prevModuleLabel || '‹ Home';
      var prevHref  = cfg.prevModulePath  || '../../index.html';
      prevHtml = '<a href="' + prevHref + '" class="btn-nav">' + esc(prevLabel) + '</a>';
    } else {
      prevHtml = '<a href="./lesson' + idx + '.html" class="btn-nav">‹ Lesson ' + idx + ': ' + esc(lessons[idx - 1].title) + '</a>';
    }

    /* Next: last lesson goes to exercises, others to next lesson */
    var nextHtml;
    if (idx < lessons.length - 1) {
      nextHtml = '<a href="./lesson' + (idx + 2) + '.html" class="btn-nav next">Lesson ' + (idx + 2) + ': ' + esc(lessons[idx + 1].title) + ' ›</a>';
    } else {
      nextHtml = '<a href="./exercises.html" class="btn-nav next me-nav-exercises">Module ' + cfg.moduleNum + ' Exercises 🧪 ›</a>';
    }

    div.innerHTML = prevHtml +
      '<div class="lesson-indicator"><strong>' + (idx + 1) + ' / ' + lessons.length + '</strong><span>Module ' + cfg.moduleNum + '</span></div>' +
      nextHtml;
    return div;
  }

  /* ── EXERCISES BUILDER ──────────────────────────────────────── */
  function _buildExercises(exercises, lessons, container) {
    var cfg = _cfg;
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'me-exercises-page';

    /* Hero */
    var hero = document.createElement('div');
    hero.className = 'm1-hero m1-ex-hero reveal';
    hero.style.background = _exGrad(cfg.moduleColor);
    hero.innerHTML =
      '<div class="m1-hero-top">' +
        '<span class="m1-hero-module">' + esc(cfg.moduleIcon) + ' Module ' + cfg.moduleNum + ' — ' + esc(cfg.moduleTitle) + '</span>' +
        '<span class="badge badge-exercise">🧪 Exercises</span>' +
      '</div>' +
      '<h1 class="m1-hero-title">' + esc(exercises.title) + '</h1>' +
      '<p class="m1-ex-desc">' + esc(exercises.description) + '</p>' +
      '<div class="m1-score-bar">' +
        '🏆 Score: <span class="m1-score-num" id="ex-correct">0</span> / ' +
        '<span class="m1-score-num" id="ex-total">0</span>' +
        '<button class="m1-retry-btn" onclick="ModuleEngine.retryAll()">↺ Retry All</button>' +
      '</div>';
    art.appendChild(hero);

    var setLabels = {
      mcq:          '🔘 Multiple Choice',
      true_false:   '✔️ True / False',
      short_answer: '✏️ Short Answer',
      step_by_step: '🔢 Step-by-Step',
      exam_style:   '📋 Exam-Style',
      randomized:   '🎲 Randomized Drill'
    };

    exercises.question_sets.forEach(function (qset, si) {
      var section = document.createElement('div');
      section.className = 'm1-ex-section reveal';
      var label = setLabels[qset.type] || qset.type;
      section.innerHTML = '<div class="m1-ex-section-hdr"><h2>' + label + '</h2></div>';

      if (qset.type === 'randomized') {
        section.appendChild(_buildRandomized(qset));
      } else {
        (qset.questions || []).forEach(function (q, qi) {
          var uid = 'ex-' + si + '-' + qi;
          section.appendChild(_buildExQuestion(q, qset.type, uid));
        });
      }
      art.appendChild(section);
    });

    /* Bottom nav */
    var nav = document.createElement('div');
    nav.className = 'bottom-nav';
    var prevLessonHref = './lesson' + lessons.length + '.html';
    var nextHref  = cfg.nextModulePath  || '../../index.html';
    var nextLabel = cfg.nextModuleLabel || 'Back to Home';
    nav.innerHTML =
      '<a href="' + prevLessonHref + '" class="btn-nav">‹ Back to Lesson ' + lessons.length + '</a>' +
      '<div class="lesson-indicator"><strong>Exercises</strong><span>Module ' + cfg.moduleNum + '</span></div>' +
      '<a href="' + nextHref + '" class="btn-nav next">' + esc(nextLabel) + ' ›</a>';
    art.appendChild(nav);

    container.appendChild(art);
  }

  /* ── ANSWER FORMATTER ───────────────────────────────────────── */
  var _LABEL_TEST  = /\b(?:Converse|Contrapositive|Inverse|Original|Final answer|Step\s+\d+|Reason|Result):/;
  var _LABEL_SPLIT = /(?=\b(?:Converse|Contrapositive|Inverse|Original|Final answer|Step\s+\d+|Reason|Result):)/;

  function _formatAnswer(text) {
    if (!text) return '';
    if (text.indexOf('|') !== -1 && text.indexOf('\n') !== -1) {
      return _renderPipeAnswer(text);
    }
    if (_LABEL_TEST.test(text)) {
      var parts = text.split(_LABEL_SPLIT).filter(function (p) { return p.trim(); });
      if (parts.length > 1) {
        return '<div class="m1-ans-text">' +
          parts.map(function (p) { return '<p class="m1-ans-part">' + esc(p.trim()) + '</p>'; }).join('') +
        '</div>';
      }
    }
    return '<span class="m1-ans-text">' + esc(text) + '</span>';
  }

  /* ── EXERCISE QUESTION BUILDER ──────────────────────────────── */
  function _buildExQuestion(q, type, uid) {
    var div = document.createElement('div');
    div.className = 'm1-ex-card';
    div.id = uid;

    /* source_pattern badge (v2 exercises) */
    var srcTag = q.source_pattern
      ? '<span class="v2-source-tag">🏷️ ' + esc(q.source_pattern) + '</span>'
      : '';

    if (type === 'mcq' || type === 'true_false') {
      var choicesHtml = (q.choices || []).map(function (c, j) {
        return '<button class="m1-choice" data-qid="' + uid + '" data-val="' + esc(c) + '" ' +
          'data-correct="' + (c === q.answer ? '1' : '0') + '" ' +
          'onclick="ModuleEngine.checkAnswer(this)">' +
          '<span class="m1-choice-letter">' + String.fromCharCode(65 + j) + '</span>' +
          '<span>' + esc(c) + '</span></button>';
      }).join('');
      div.innerHTML =
        srcTag +
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<div class="m1-choices">' + choicesHtml + '</div>' +
        '<div class="m1-qc-feedback" id="' + uid + '-fb">' + esc(q.explanation || '') + '</div>';

    } else if (type === 'short_answer' || type === 'exam_style') {
      div.innerHTML =
        srcTag +
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<button class="m1-sa-reveal" onclick="(function(b){b.style.display=\'none\';document.getElementById(\'' + uid + '-fb\').style.display=\'block\'})(this)">Show Answer</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" id="' + uid + '-fb">' +
          '<strong>Answer:</strong><br>' + _formatAnswer(q.answer) +
          (q.explanation ? '<em class="m1-ans-expl">' + esc(q.explanation) + '</em>' : '') +
        '</div>';

    } else if (type === 'step_by_step') {
      div.innerHTML =
        srcTag +
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<button class="m1-sa-reveal" onclick="(function(b){b.style.display=\'none\';document.getElementById(\'' + uid + '-fb\').style.display=\'block\'})(this)">Show Full Solution</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" id="' + uid + '-fb">' +
          _renderPipeAnswer(q.answer) +
          (q.explanation ? '<em>' + esc(q.explanation) + '</em>' : '') +
        '</div>';
    }
    return div;
  }

  /* ── RANDOMIZED DRILL ───────────────────────────────────────── */
  function _buildRandomized(qset) {
    var div = document.createElement('div');
    div.className = 'm1-rand-area';
    var templates = qset.questions || [];
    var currentIdx = 0;

    function pickQuestion(tIdx) {
      var tmpl = templates[tIdx];
      var vars = tmpl.variables || {};
      var filled = tmpl.template;
      Object.keys(vars).forEach(function (k) {
        var arr = vars[k];
        var pick = arr[Math.floor(Math.random() * arr.length)];
        filled = filled.replace(new RegExp('\\{' + k + '\\}', 'g'), pick);
      });
      return { q: filled, hint: tmpl.instructions || '', ex: tmpl.example_realization || '' };
    }

    function show() {
      var tIdx = currentIdx;
      var r = pickQuestion(tIdx);
      var qDiv = div.querySelector('.m1-rand-q');
      qDiv.innerHTML =
        '<p class="m1-rand-template"><strong>Template ' + (tIdx + 1) + ' of ' + templates.length + ':</strong> ' + esc(templates[tIdx].template) + '</p>' +
        '<div class="m1-rand-realized"><strong>Your question:</strong> ' + esc(r.q) + '</div>' +
        '<div class="m1-rand-instructions"><em>📋 ' + esc(r.hint) + '</em></div>' +
        '<button class="m1-sa-reveal" onclick="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">Show Example Answer</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" style="display:none"><strong>Example answer:</strong> ' + esc(r.ex) + '</div>';
    }

    div.innerHTML =
      '<div class="m1-rand-q"></div>' +
      '<div class="m1-rand-btns">' +
        '<button class="m1-rand-next">🎲 New Question</button>' +
        '<button class="m1-rand-prev">← Prev Template</button>' +
        '<button class="m1-rand-next-tmpl">Next Template →</button>' +
      '</div>';

    var btns = div.querySelectorAll('.m1-rand-btns button');
    btns[0].addEventListener('click', function () { show(); });
    btns[1].addEventListener('click', function () { currentIdx = (currentIdx - 1 + templates.length) % templates.length; show(); });
    btns[2].addEventListener('click', function () { currentIdx = (currentIdx + 1) % templates.length; show(); });

    setTimeout(function () { show(); }, 0);
    return div;
  }

  /* ── INTERACTIVITY ──────────────────────────────────────────── */
  function checkAnswer(btn) {
    var qid = btn.getAttribute('data-qid');
    var card = document.getElementById(qid);
    if (!card || card.classList.contains('answered')) return;
    card.classList.add('answered');

    var isCorrect = btn.getAttribute('data-correct') === '1';
    btn.classList.add(isCorrect ? 'm1-correct' : 'm1-wrong');

    if (!isCorrect) {
      card.querySelectorAll('.m1-choice').forEach(function (b) {
        if (b.getAttribute('data-correct') === '1') b.classList.add('m1-reveal-correct');
      });
    }
    card.querySelectorAll('.m1-choice').forEach(function (b) { b.disabled = true; });

    var fb = document.getElementById(qid + '-fb');
    if (fb) { fb.classList.add('show'); }

    /* Score only for exercise questions (uid starts with 'ex-') */
    if (qid.indexOf('ex-') === 0) {
      _score.total++;
      if (isCorrect) _score.correct++;
      var ce = document.getElementById('ex-correct');
      var te = document.getElementById('ex-total');
      if (ce) ce.textContent = _score.correct;
      if (te) te.textContent = _score.total;
    }
  }

  function retryAll() {
    _score = { correct: 0, total: 0 };
    var ce = document.getElementById('ex-correct');
    var te = document.getElementById('ex-total');
    if (ce) ce.textContent = '0';
    if (te) te.textContent = '0';
    document.querySelectorAll('.m1-ex-card, .m1-qc-card').forEach(function (card) {
      card.classList.remove('answered');
      card.querySelectorAll('.m1-choice').forEach(function (b) {
        b.disabled = false;
        b.classList.remove('m1-correct', 'm1-wrong', 'm1-reveal-correct');
      });
      card.querySelectorAll('.m1-qc-feedback').forEach(function (fb) {
        fb.classList.remove('show');
        if (fb.classList.contains('m1-sa-answer')) fb.style.display = 'none';
      });
      card.querySelectorAll('.m1-sa-reveal').forEach(function (b) { b.style.display = ''; });
    });
  }

  /* ── V3 PILOT RENDERER ──────────────────────────────────────── */

  /* Detect v3 content */
  function _isV3(data) {
    return data && data.version === 'v3';
  }

  /* Markdown helper with blockquote support (used by v3 prose) */
  function _mdProse(text) {
    if (!text) return '';
    var paras = text.split(/\n\n+/);
    return paras.map(function (p) {
      p = p.trim();
      if (p.charAt(0) === '>') {
        var inner = p.replace(/^>\s*/gm, '').trim();
        var s = esc(inner);
        s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
        s = s.replace(/`([^`\n]+?)`/g, '<code class="v2-inline-code">$1</code>');
        return '<blockquote class="v3-blockquote">' + s + '</blockquote>';
      }
      var s = esc(p);
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
      s = s.replace(/`([^`\n]+?)`/g, '<code class="v2-inline-code">$1</code>');
      return '<p>' + s.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* Main v3 lesson builder */
  function _buildLessonV3(lesson, idx, allLessons, container) {
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'me-lesson me-lesson-v3';

    art.appendChild(_heroCard(lesson, idx, allLessons.length));
    if (lesson.welcome) art.appendChild(_v2WelcomeCard(lesson.welcome));

    /* Storytelling rendered once after welcome */
    if (lesson.storytelling && lesson.storytelling.length) {
      var st = _storyCard(lesson.storytelling);
      art.appendChild(st);
    }

    /* Walk flow array */
    (lesson.flow || []).forEach(function (block) {
      var el = _v3RenderBlock(block);
      if (el) {
        el.classList.add('reveal');
        art.appendChild(el);
      }
    });

    if (lesson.quick_checks && lesson.quick_checks.length) {
      art.appendChild(_quickChecksBlock(lesson.quick_checks));
    }

    if (lesson.summary) art.appendChild(_summaryCard(lesson.summary));
    art.appendChild(_lessonBottomNav(idx, allLessons));
    container.appendChild(art);
    _initReveal(container);
    _initMermaid(container);
    if (global.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]);
  }

  /* Dispatcher for v3 flow block types */
  function _v3RenderBlock(block) {
    var type = block.type || '';
    if (type === 'definition')        return _v3BlockDefinition(block);
    if (type === 'prose')             return _v3BlockProse(block);
    if (type === 'table')             return _v3BlockTable(block);
    if (type === 'truth_table')       return _v3BlockTruthTable(block);
    if (type === 'inline_dialogue')   return _v3BlockDialogue(block);
    if (type === 'warning')           return _blockWarning(block);
    if (type === 'real_life_example') return _blockRealLife(block);
    if (type === 'mermaid')           return _blockMermaid(block);
    if (type === 'callout')           return _blockCallout(block);
    if (type === 'step_list')         return _v3BlockStepList(block);
    if (type === 'worked_example')    return _v3BlockWorkedExample(block);
    if (type === 'misconception_box') return _v3BlockMisconceptionBox(block);
    if (type === 'memory_hook')       return _v3BlockMemoryHook(block);
    if (type === 'formula')           return _v3BlockFormula(block);
    if (type === 'example')           return _v3BlockExample(block);
    var d = document.createElement('div');
    d.className = 'v2-block-generic';
    d.innerHTML = '<strong>' + esc(block.title || type) + '</strong>';
    return d;
  }

  /* Definition — supports content OR items array, optional latex */
  function _v3BlockDefinition(b) {
    var div = document.createElement('div');
    div.className = 'v2-definition';
    var latexHtml = b.latex ? '<div class="v2-def-latex">\\[' + b.latex + '\\]</div>' : '';
    var bodyHtml = '';
    if (b.items && b.items.length) {
      bodyHtml = '<ul class="v3-def-items">' +
        b.items.map(function (item) { return '<li>' + _md(item) + '</li>'; }).join('') +
        '</ul>';
    } else {
      bodyHtml = '<div class="v2-def-body">' + _md(b.content || '') + '</div>';
    }
    div.innerHTML =
      '<div class="v2-def-label">📘 Definition</div>' +
      '<div class="v2-def-title">' + esc(b.title || '') + '</div>' +
      bodyHtml + latexHtml;
    return div;
  }

  /* Prose — optional title, markdown content with blockquote support */
  function _v3BlockProse(b) {
    var div = document.createElement('div');
    div.className = 'v3-prose';
    div.innerHTML =
      (b.title ? '<div class="v3-prose-title">' + esc(b.title) + '</div>' : '') +
      _mdProse(b.content || '');
    return div;
  }

  /* Table — flat structure (b.headers, b.rows directly on block) */
  function _v3BlockTable(b) {
    var div = document.createElement('div');
    div.className = 'v2-table-wrap';
    var headers = b.headers || [];
    var rows = b.rows || [];
    var thead = '<thead><tr>' +
      headers.map(function (h) { return '<th>' + _md(h) + '</th>'; }).join('') +
      '</tr></thead>';
    var tbody = '<tbody>' +
      rows.map(function (row) {
        return '<tr>' +
          row.map(function (cell) { return '<td>' + _md(String(cell)) + '</td>'; }).join('') +
          '</tr>';
      }).join('') +
    '</tbody>';
    div.innerHTML =
      (b.title ? '<div class="v2-table-title">📋 ' + esc(b.title) + '</div>' : '') +
      '<div class="v2-table-scroll"><table class="v2-table">' + thead + tbody + '</table></div>';
    return div;
  }

  /* Truth table — flat + highlight_rows (row indices), highlight_columns (col names), notes */
  function _v3BlockTruthTable(b) {
    var div = document.createElement('div');
    div.className = 'v2-table-wrap';
    var headers = b.headers || [];
    var rows = b.rows || [];
    var hlRows = b.highlight_rows || [];
    var hlCols = b.highlight_columns || [];
    var lastCol = headers.length - 1;

    var hlColSet = {};
    hlCols.forEach(function (name) {
      var i = headers.indexOf(name);
      if (i !== -1) hlColSet[i] = true;
    });

    var thead = '<thead><tr>' +
      headers.map(function (h, i) {
        var cls = [];
        if (i === lastCol) cls.push('v2-th-result');
        if (hlColSet[i]) cls.push('v3-th-highlight');
        var ca = cls.length ? ' class="' + cls.join(' ') + '"' : '';
        return '<th' + ca + '>' + esc(h) + '</th>';
      }).join('') +
      '</tr></thead>';

    var tbody = '<tbody>' +
      rows.map(function (row, ri) {
        var rowHl = hlRows.indexOf(ri) !== -1;
        var trCls = rowHl ? ' class="v3-tt-highlight-row"' : '';
        return '<tr' + trCls + '>' +
          row.map(function (cell, ci) {
            var classes = [];
            if (cell === 'T') classes.push('v2-cell-T');
            else if (cell === 'F') classes.push('v2-cell-F');
            if (ci === lastCol) classes.push('v2-cell-result');
            if (hlColSet[ci]) classes.push('v3-cell-highlight');
            var ca = classes.length ? ' class="' + classes.join(' ') + '"' : '';
            return '<td' + ca + '>' + esc(String(cell)) + '</td>';
          }).join('') +
        '</tr>';
      }).join('') +
    '</tbody>';

    div.innerHTML =
      (b.title ? '<div class="v2-table-title">🔢 ' + esc(b.title) + '</div>' : '') +
      '<div class="v2-table-scroll"><table class="v2-table v2-truth-table">' + thead + tbody + '</table></div>' +
      (b.notes ? '<p class="v2-tt-note">' + esc(b.notes) + '</p>' : '');
    return div;
  }

  /* Inline dialogue — trigger field is suppressed; only exchange is rendered */
  function _v3BlockDialogue(b) {
    var div = document.createElement('div');
    div.className = 'm1-story v3-inline-dialogue';
    var exchange = b.exchange || [];
    var rows = exchange.map(function (entry) {
      var isProf = entry.speaker === 'Professor';
      return '<div class="m1-chat-row ' + (isProf ? 'm1-chat-right' : 'm1-chat-left') + '">' +
        '<div class="m1-chat-avatar ' + (isProf ? 'm1-avatar-prof' : 'm1-avatar-student') + '">' +
          (isProf ? 'P' : 'S') +
        '</div>' +
        '<div class="m1-chat-bubble ' + (isProf ? 'm1-bubble-prof' : 'm1-bubble-student') + '">' +
          '<div class="m1-chat-speaker">' + esc(entry.speaker) + '</div>' +
          '<p>' + _md(entry.text) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
    div.innerHTML = '<div class="m1-chat">' + rows + '</div>';
    return div;
  }

  /* Step list — strips leading "N. " prefix then auto-numbers */
  function _v3BlockStepList(b) {
    var div = document.createElement('div');
    div.className = 'v2-step-list';
    var items = (b.items || []).map(function (item, i) {
      var text = item.replace(/^\d+\.\s*/, '');
      return '<div class="v2-step-item">' +
        '<div class="v2-step-dot">' + (i + 1) + '</div>' +
        '<div class="v2-step-text">' + _md(text) + '</div>' +
      '</div>';
    }).join('');
    div.innerHTML =
      (b.title ? '<div class="v2-step-header">' + esc(b.title) + '</div>' : '') +
      '<div class="v2-steps">' + items + '</div>';
    return div;
  }

  /* Worked example — inline (always visible, not collapsed) */
  function _v3BlockWorkedExample(b) {
    var div = document.createElement('div');
    div.className = 'v3-worked-example';
    var sourceHtml = b.source_pattern
      ? '<div class="v3-we-source">' + esc(b.source_pattern) + '</div>'
      : '';
    var thinkHtml = b.thinking_process
      ? '<div class="v3-we-row"><div class="v3-we-label">💭 Approach</div>' +
        '<div class="v3-we-body">' + _md(b.thinking_process) + '</div></div>'
      : '';
    var stepsHtml = (b.step_by_step_solution || []).map(function (s, i) {
      return '<div class="v3-we-step"><span class="v3-we-step-num">' + (i + 1) + '</span>' +
        '<span class="v3-we-step-text">' + _md(s) + '</span></div>';
    }).join('');
    var mistakeHtml = b.common_mistake
      ? '<div class="v3-we-row v3-we-mistake"><div class="v3-we-label">⚠️ Common Mistake</div>' +
        '<div class="v3-we-body">' + _md(b.common_mistake) + '</div></div>'
      : '';
    div.innerHTML =
      '<div class="v3-we-header">' +
        '<span class="v3-we-badge">📝 Worked Example</span>' +
        '<div class="v3-we-title">' + esc(b.title || '') + '</div>' +
      '</div>' +
      sourceHtml +
      '<div class="v3-we-row"><div class="v3-we-label">❓ Problem</div>' +
        '<div class="v3-we-body">' + _md(b.problem || '') + '</div></div>' +
      thinkHtml +
      (stepsHtml
        ? '<div class="v3-we-row"><div class="v3-we-label">🔢 Steps</div>' +
          '<div class="v3-we-steps">' + stepsHtml + '</div></div>'
        : '') +
      (b.final_answer
        ? '<div class="v3-we-row v3-we-answer"><div class="v3-we-label">✅ Answer</div>' +
          '<div class="v3-we-body">' + _md(b.final_answer) + '</div></div>'
        : '') +
      mistakeHtml;
    return div;
  }

  /* Misconception box */
  function _v3BlockMisconceptionBox(b) {
    var div = document.createElement('div');
    div.className = 'v2-misconceptions-block';
    var items = (b.items || []).map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-warn-hdr">❌ ' + esc(b.title || 'Common Misconceptions') + '</div>' +
      '<ul class="v2-misconceptions-list">' + items + '</ul>';
    return div;
  }

  /* Memory hook — content (string) or items (array) */
  function _v3BlockMemoryHook(b) {
    var div = document.createElement('div');
    div.className = 'v2-memory-block';
    var bodyHtml = '';
    if (b.items && b.items.length) {
      bodyHtml = '<ul class="v2-memory-list">' +
        b.items.map(function (item) { return '<li>' + _md(item) + '</li>'; }).join('') +
        '</ul>';
    } else if (b.content) {
      bodyHtml = '<div class="v2-memory-list"><p>' + _md(b.content) + '</p></div>';
    }
    div.innerHTML =
      '<div class="v2-mem-hdr">🧠 ' + esc(b.title || 'Memory Hook') + '</div>' +
      bodyHtml;
    return div;
  }

  /* Formula — items array of plain equivalence strings */
  function _v3BlockFormula(b) {
    var div = document.createElement('div');
    div.className = 'v2-formula';
    var itemsHtml = (b.items || []).map(function (item) {
      return '<div class="v3-formula-item"><code class="v3-formula-code">' + esc(item) + '</code></div>';
    }).join('');
    div.innerHTML =
      (b.title ? '<div class="v2-form-header">📐 ' + esc(b.title) + '</div>' : '') +
      (itemsHtml ? '<div class="v3-formula-list">' + itemsHtml + '</div>' : '');
    return div;
  }

  /* Example — lightweight inline card */
  function _v3BlockExample(b) {
    var div = document.createElement('div');
    div.className = 'v3-example';
    div.innerHTML =
      (b.title ? '<div class="v3-example-title">💡 ' + esc(b.title) + '</div>' : '') +
      '<div class="v3-example-body">' + _md(b.content || '') + '</div>';
    return div;
  }

  /* ── V2 PILOT RENDERER ──────────────────────────────────────── */

  /* Detect v2 content */
  function _isV2(data, lesson) {
    return (data && data.version === 'v2-pilot') ||
      (lesson && lesson.rich_content_blocks && lesson.rich_content_blocks.length > 0);
  }

  /* Safe inline markdown: **bold**, _italic_, `code` */
  function _md(text) {
    if (!text) return '';
    var s = esc(text);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    s = s.replace(/`([^`\n]+?)`/g, '<code class="v2-inline-code">$1</code>');
    var paras = s.split(/\n\n+/);
    return paras.map(function (p) {
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* Parse pipe-table answer text → styled HTML truth table */
  function _renderPipeAnswer(text) {
    if (!text) return '';
    var lines = text.split('\n');
    var tableLines = [];
    var trailingText = [];
    var seenTable = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('|') !== -1) {
        seenTable = true;
        tableLines.push(lines[i]);
      } else if (seenTable && lines[i].trim()) {
        trailingText.push(lines[i]);
      }
    }
    if (tableLines.length < 2) {
      return '<pre class="m1-pre">' + esc(text) + '</pre>';
    }
    /* Parse header row */
    var rawHdr = tableLines[0].split('|').map(function (h) { return h.trim(); });
    if (rawHdr[0] === '') rawHdr.shift();
    if (rawHdr[rawHdr.length - 1] === '') rawHdr.pop();
    var headers = rawHdr;
    var lastCol = headers.length - 1;

    var html = '<div class="v2-table-wrap"><table class="v2-table v2-truth-table"><thead><tr>';
    headers.forEach(function (h, i) {
      var cls = (i === lastCol) ? ' class="v2-th-result"' : '';
      html += '<th' + cls + '>' + esc(h) + '</th>';
    });
    html += '</tr></thead><tbody>';
    for (var r = 1; r < tableLines.length; r++) {
      var line = tableLines[r];
      if (/^[\s\-\+\|=]+$/.test(line)) continue; /* skip separator lines */
      var cells = line.split('|').map(function (c) { return c.trim(); });
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();
      if (!cells.length) continue;
      html += '<tr>';
      cells.forEach(function (c, ci) {
        var classes = [];
        if (c === 'T') classes.push('v2-cell-T');
        else if (c === 'F') classes.push('v2-cell-F');
        if (ci === lastCol) classes.push('v2-cell-result');
        var ca = classes.length ? ' class="' + classes.join(' ') + '"' : '';
        html += '<td' + ca + '>' + esc(c) + '</td>';
      });
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    if (trailingText.length) {
      html += '<p class="v2-tt-note">' + esc(trailingText.join(' ')) + '</p>';
    }
    return html;
  }

  /* Main v2 lesson builder */
  function _buildLessonV2(lesson, idx, allLessons, container) {
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'me-lesson me-lesson-v2';

    art.appendChild(_heroCard(lesson, idx, allLessons.length));
    if (lesson.hook)          art.appendChild(_v2HookCard(lesson.hook));
    if (lesson.welcome)       art.appendChild(_v2WelcomeCard(lesson.welcome));
    if (lesson.why_it_matters) art.appendChild(_v2WhyCard(lesson.why_it_matters));
    if (lesson.storytelling && lesson.storytelling.length) {
      art.appendChild(_storyCard(lesson.storytelling));
    }
    if (lesson.rich_content_blocks && lesson.rich_content_blocks.length) {
      art.appendChild(_v2RichBlocksSection(lesson.rich_content_blocks, 'Core Concepts'));
    }
    if (lesson.concept_blocks && lesson.concept_blocks.length) {
      art.appendChild(_v2RichBlocksSection(lesson.concept_blocks, 'Step-by-Step Guides'));
    }
    (lesson.sections || []).forEach(function (sec) {
      art.appendChild(_sectionCard(sec));
    });
    if (lesson.worked_examples && lesson.worked_examples.length) {
      art.appendChild(_workedExamplesBlock(lesson.worked_examples));
    }
    if (lesson.misconceptions && lesson.misconceptions.length) {
      art.appendChild(_v2MisconceptionsCard(lesson.misconceptions));
    }
    if (lesson.memory_hooks && lesson.memory_hooks.length) {
      art.appendChild(_v2MemoryHooksCard(lesson.memory_hooks));
    }
    if (lesson.quick_checks && lesson.quick_checks.length) {
      art.appendChild(_quickChecksBlock(lesson.quick_checks));
    }
    if (lesson.summary)        art.appendChild(_summaryCard(lesson.summary));
    if (lesson.lesson_summary) art.appendChild(_v2LessonSummaryCard(lesson.lesson_summary));
    art.appendChild(_lessonBottomNav(idx, allLessons));
    container.appendChild(art);
    _initReveal(container);
    _initMermaid(container);
    if (global.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]);
  }

  /* Hook card */
  function _v2HookCard(text) {
    var div = document.createElement('div');
    div.className = 'v2-hook reveal';
    div.innerHTML = '<div class="v2-hook-header">🪝 Hook</div>' +
      '<div class="v2-hook-body">' + _md(text) + '</div>';
    return div;
  }

  /* Why it matters card */
  function _v2WhyCard(text) {
    var div = document.createElement('div');
    div.className = 'v2-why reveal';
    div.innerHTML = '<div class="v2-why-header">🎯 Why it matters</div>' +
      '<div class="v2-why-body">' + _md(text) + '</div>';
    return div;
  }

  /* Welcome card (v2 — markdown-aware) */
  function _v2WelcomeCard(text) {
    var div = document.createElement('div');
    div.className = 'm1-welcome reveal';
    div.innerHTML =
      '<div class="m1-welcome-inner">' +
        '<div class="m1-welcome-icon">💡</div>' +
        '<div class="m1-welcome-text">' + _md(text) + '</div>' +
      '</div>';
    return div;
  }

  /* Wrapper for a section of rich blocks */
  function _v2RichBlocksSection(blocks, title) {
    var div = document.createElement('div');
    div.className = 'v2-rich-section reveal';
    if (title) {
      div.innerHTML = '<div class="v2-rich-section-label">' + esc(title) + '</div>';
    }
    blocks.forEach(function (block) {
      div.appendChild(_renderRichBlock(block));
    });
    return div;
  }

  /* Dispatcher for block types */
  function _renderRichBlock(block) {
    var type = block.type || '';
    if (type === 'definition')        return _blockDefinition(block);
    if (type === 'callout')           return _blockCallout(block);
    if (type === 'warning')           return _blockWarning(block);
    if (type === 'misconception')     return _blockMisconception(block);
    if (type === 'real_life_example') return _blockRealLife(block);
    if (type === 'table')             return _blockTable(block);
    if (type === 'truth_table')       return _blockTruthTable(block);
    if (type === 'formula')           return _blockFormula(block);
    if (type === 'mermaid')           return _blockMermaid(block);
    if (type === 'svg_idea')          return _blockSvgIdea(block);
    if (type === 'step_list')         return _blockStepList(block);
    if (type === 'summary_box')       return _blockSummaryBox(block);
    var d = document.createElement('div');
    d.className = 'v2-block-generic';
    d.innerHTML = '<strong>' + esc(block.title || type) + '</strong>';
    return d;
  }

  /* Definition block */
  function _blockDefinition(b) {
    var div = document.createElement('div');
    div.className = 'v2-definition';
    var latexHtml = b.latex ? '<div class="v2-def-latex">\\[' + b.latex + '\\]</div>' : '';
    div.innerHTML =
      '<div class="v2-def-label">📘 Definition</div>' +
      '<div class="v2-def-title">' + esc(b.title || '') + '</div>' +
      '<div class="v2-def-body">' + _md(b.content || '') + '</div>' +
      latexHtml;
    return div;
  }

  /* Callout block */
  function _blockCallout(b) {
    var div = document.createElement('div');
    div.className = 'v2-callout';
    var items = (b.items || []).map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-callout-header">💬 ' + esc(b.title || '') + '</div>' +
      '<ul>' + items + '</ul>';
    return div;
  }

  /* Warning block */
  function _blockWarning(b) {
    var div = document.createElement('div');
    div.className = 'v2-warning';
    div.innerHTML =
      '<div class="v2-warning-header">⚠️ ' + esc(b.title || '') + '</div>' +
      _md(b.content || '');
    return div;
  }

  /* Misconception block (inside rich_content_blocks) */
  function _blockMisconception(b) {
    var div = document.createElement('div');
    div.className = 'v2-warning v2-misconception';
    var items = (b.items || []).map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-warning-header">❌ ' + esc(b.title || '') + '</div>' +
      '<ul>' + items + '</ul>';
    return div;
  }

  /* Real-life example block */
  function _blockRealLife(b) {
    var div = document.createElement('div');
    div.className = 'v2-reallife';
    var items = (b.items || []).map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-rl-header">🌍 ' + esc(b.title || '') + '</div>' +
      '<ul class="v2-rl-list">' + items + '</ul>';
    return div;
  }

  /* Generic table block */
  function _blockTable(b) {
    var div = document.createElement('div');
    div.className = 'v2-table-wrap';
    var t = b.table || {};
    var headers = t.headers || [];
    var rows = t.rows || [];
    var thead = '<thead><tr>' +
      headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead>';
    var tbody = '<tbody>' +
      rows.map(function (row) {
        return '<tr>' +
          row.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') +
          '</tr>';
      }).join('') +
    '</tbody>';
    div.innerHTML =
      (b.title ? '<div class="v2-table-title">📋 ' + esc(b.title) + '</div>' : '') +
      '<div class="v2-table-scroll"><table class="v2-table">' + thead + tbody + '</table></div>';
    return div;
  }

  /* Truth table block (colored T/F + result column) */
  function _blockTruthTable(b) {
    var div = document.createElement('div');
    div.className = 'v2-table-wrap';
    var t = b.table || {};
    var headers = t.headers || [];
    var rows = t.rows || [];
    var lastCol = headers.length - 1;
    var thead = '<thead><tr>' +
      headers.map(function (h, i) {
        var cls = (i === lastCol) ? ' class="v2-th-result"' : '';
        return '<th' + cls + '>' + esc(h) + '</th>';
      }).join('') +
      '</tr></thead>';
    var tbody = '<tbody>' +
      rows.map(function (row) {
        return '<tr>' +
          row.map(function (cell, ci) {
            var classes = [];
            if (cell === 'T') classes.push('v2-cell-T');
            else if (cell === 'F') classes.push('v2-cell-F');
            if (ci === lastCol) classes.push('v2-cell-result');
            var ca = classes.length ? ' class="' + classes.join(' ') + '"' : '';
            return '<td' + ca + '>' + esc(cell) + '</td>';
          }).join('') +
        '</tr>';
      }).join('') +
    '</tbody>';
    div.innerHTML =
      (b.title ? '<div class="v2-table-title">🔢 ' + esc(b.title) + '</div>' : '') +
      '<div class="v2-table-scroll"><table class="v2-table v2-truth-table">' + thead + tbody + '</table></div>';
    return div;
  }

  /* Formula block */
  function _blockFormula(b) {
    var div = document.createElement('div');
    div.className = 'v2-formula';
    div.innerHTML =
      (b.title   ? '<div class="v2-form-header">📐 ' + esc(b.title) + '</div>' : '') +
      (b.latex   ? '<div class="v2-def-latex">\\[' + b.latex + '\\]</div>' : '') +
      (b.content ? '<p class="v2-form-note">' + _md(b.content) + '</p>' : '');
    return div;
  }

  /* Mermaid diagram block */
  function _blockMermaid(b) {
    var div = document.createElement('div');
    div.className = 'v2-mermaid';
    div.innerHTML =
      (b.title ? '<div class="v2-mermaid-title">📊 ' + esc(b.title) + '</div>' : '') +
      '<div class="v2-mermaid-wrap"><div class="mermaid">' + esc(b.mermaid || '') + '</div></div>';
    return div;
  }

  /* SVG idea block — description-only, no SVG rendered */
  function _blockSvgIdea(b) {
    var div = document.createElement('div');
    div.className = 'v2-svg-idea';
    div.innerHTML =
      '<div class="v2-svg-header">🖼️ ' + esc(b.title || 'Visual') + '</div>' +
      '<div class="v2-svg-placeholder">' +
        '<div class="v2-svg-icon">📐</div>' +
        '<div class="v2-svg-desc">' + _md(b.content || b.description || '') + '</div>' +
      '</div>';
    return div;
  }

  /* Step list block */
  function _blockStepList(b) {
    var div = document.createElement('div');
    div.className = 'v2-step-list';
    var items = (b.items || []).map(function (item, i) {
      return '<div class="v2-step-item">' +
        '<div class="v2-step-dot">' + (i + 1) + '</div>' +
        '<div class="v2-step-text">' + _md(item) + '</div>' +
      '</div>';
    }).join('');
    div.innerHTML =
      (b.title ? '<div class="v2-step-header">' + esc(b.title) + '</div>' : '') +
      '<div class="v2-steps">' + items + '</div>';
    return div;
  }

  /* Summary box block */
  function _blockSummaryBox(b) {
    var div = document.createElement('div');
    div.className = 'v2-summary-box';
    var bodyHtml = '';
    if (b.content) {
      bodyHtml = '<div class="v2-sumbox-body">' + _md(b.content) + '</div>';
    } else if (b.items) {
      bodyHtml = '<ul class="v2-sumbox-list">' +
        b.items.map(function (item) { return '<li>' + _md(item) + '</li>'; }).join('') +
      '</ul>';
    }
    div.innerHTML =
      (b.title ? '<div class="v2-sumbox-header">⭐ ' + esc(b.title) + '</div>' : '') +
      bodyHtml;
    return div;
  }

  /* Misconceptions section card (top-level array of markdown strings) */
  function _v2MisconceptionsCard(items) {
    var div = document.createElement('div');
    div.className = 'v2-misconceptions-block reveal';
    var listHtml = items.map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-warn-hdr">❌ Common Misconceptions</div>' +
      '<ul class="v2-misconceptions-list">' + listHtml + '</ul>';
    return div;
  }

  /* Memory hooks card */
  function _v2MemoryHooksCard(items) {
    var div = document.createElement('div');
    div.className = 'v2-memory-block reveal';
    var listHtml = items.map(function (item) {
      return '<li>' + _md(item) + '</li>';
    }).join('');
    div.innerHTML =
      '<div class="v2-mem-hdr">🧠 Memory Hooks</div>' +
      '<ul class="v2-memory-list">' + listHtml + '</ul>';
    return div;
  }

  /* Lesson summary card — wraps a summary_box block */
  function _v2LessonSummaryCard(summ) {
    var div = document.createElement('div');
    div.className = 'v2-lesson-summary reveal';
    div.appendChild(_blockSummaryBox(summ));
    return div;
  }

  /* Initialize mermaid via lazy CDN injection */
  function _initMermaid(container) {
    var nodes = container.querySelectorAll('.mermaid');
    if (!nodes.length) return;
    function runMermaid() {
      if (global.mermaid) {
        try {
          if (mermaid.run) {
            mermaid.run({ nodes: Array.prototype.slice.call(nodes) });
          } else {
            mermaid.init(undefined, nodes);
          }
        } catch (e) {
          nodes.forEach(function (n) { _mermaidFallback(n); });
        }
      } else {
        nodes.forEach(function (n) { _mermaidFallback(n); });
      }
    }
    if (global.mermaid) { runMermaid(); return; }
    if (!document.getElementById('mermaid-cdn')) {
      var s = document.createElement('script');
      s.id  = 'mermaid-cdn';
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      s.onload = function () {
        try { mermaid.initialize({ startOnLoad: false, theme: 'neutral' }); runMermaid(); }
        catch (e) { nodes.forEach(function (n) { _mermaidFallback(n); }); }
      };
      s.onerror = function () { nodes.forEach(function (n) { _mermaidFallback(n); }); };
      document.head.appendChild(s);
    }
  }

  function _mermaidFallback(el) {
    var src = el.textContent || '';
    el.innerHTML = '<pre class="v2-mmd-fallback">' + esc(src) + '</pre>';
  }

  /* ── HELPERS ────────────────────────────────────────────────── */
  function _initReveal(container) {
    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    container.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  function _showErr(container, err) {
    container.innerHTML =
      '<div class="fallback-msg">' +
        '<div class="icon">⚠️</div>' +
        '<h3>Could not load content</h3>' +
        '<p>' + esc(String(err)) + '</p>' +
        '<p>Check that the JSON file exists at the path specified in CPCS_CONFIG.jsonPath.</p>' +
      '</div>';
  }

  /* ── EXPORT ─────────────────────────────────────────────────── */
  global.ModuleEngine = {
    renderLesson:    renderLesson,
    renderExercises: renderExercises,
    checkAnswer:     checkAnswer,
    retryAll:        retryAll
  };

  /* Auto-init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})(window);
