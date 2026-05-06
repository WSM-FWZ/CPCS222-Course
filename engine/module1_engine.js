/* ============================================================
   CPCS 222 — Module 1 Engine
   Fetches /content/module1_propositional_logic.json and renders
   lesson pages and the exercises page.
   ============================================================ */
(function (global) {
  'use strict';

  var _cache = null;
  var _score = { correct: 0, total: 0 };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Compute the correct JSON path based on the current page's location.
     Pages inside /pages/ need ../content/…
     The root index.html needs ./content/… */
  function _resolveJsonPath() {
    var pathname = window.location.pathname;
    if (pathname.indexOf('/pages/') !== -1) {
      return '../content/module1_propositional_logic.json';
    }
    return './content/module1_propositional_logic.json';
  }

  function _load(jsonPath, cb) {
    if (_cache) { cb(null, _cache); return; }
    fetch(jsonPath)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { _cache = d; cb(null, d); })
      .catch(function (e) { cb(e, null); });
  }

  /* ── PUBLIC ───────────────────────────────────────────────── */

  function renderLesson(lessonId, container, jsonPath) {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading lesson…</p></div>';
    _load(_resolveJsonPath(), function (err, data) {
      if (err) { _showErr(container, err); return; }
      var lessons = data.module.lessons;
      var lesson = null, idx = -1;
      for (var i = 0; i < lessons.length; i++) {
        if (lessons[i].lesson_id === lessonId) { lesson = lessons[i]; idx = i; break; }
      }
      if (!lesson) { container.innerHTML = '<p style="padding:2rem">Lesson not found.</p>'; return; }
      _buildLesson(lesson, idx, lessons, data.module.exercises, container);
      _activateSidebar(lessonId);
      _initReveal(container);
      if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]);
    });
  }

  function renderExercises(container, jsonPath) {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading exercises…</p></div>';
    _load(_resolveJsonPath(), function (err, data) {
      if (err) { _showErr(container, err); return; }
      _score = { correct: 0, total: 0 };
      _buildExercises(data.module.exercises, data.module.lessons, container);
      _activateSidebar('module1-exercises');
      _initReveal(container);
    });
  }

  /* ── LESSON BUILDER ───────────────────────────────────────── */

  function _buildLesson(lesson, idx, allLessons, exercises, container) {
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'm1-lesson';

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

  function _heroCard(lesson, idx, total) {
    var pct = Math.round(((idx + 1) / total) * 100);
    var div = document.createElement('div');
    div.className = 'm1-hero reveal';
    div.innerHTML =
      '<div class="m1-hero-top">' +
        '<span class="m1-hero-module">📐 Module 1 — Propositional Logic</span>' +
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

  function _welcomeCard(text) {
    var div = document.createElement('div');
    div.className = 'm1-welcome reveal';
    div.innerHTML =
      '<div class="m1-welcome-inner">' +
        '<div class="m1-welcome-icon">💡</div>' +
        '<div class="m1-welcome-text">' + esc(text) + '</div>' +
      '</div>';
    return div;
  }

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
      var icons = { 'truth-table': '📊', 'diagram': '🗺️', 'flowchart': '🔀', 'svg': '🖼️' };
      var icon = icons[vi.type] || '🖼️';
      visHtml = '<div class="m1-visual">' +
        '<div class="m1-visual-header">' + icon + ' Visual — <em>' + esc(vi.type) + '</em></div>' +
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
        '<div class="m1-sec-num">' + sec.number + '</div>' +
        '<h2 class="m1-sec-heading">' + esc(sec.heading) + '</h2>' +
      '</div>' +
      '<p class="m1-sec-explain">' + esc(sec.explanation) + '</p>' +
      exHtml + visHtml + mistakesHtml;
    return div;
  }

  function _workedExamplesBlock(examples) {
    var div = document.createElement('div');
    div.className = 'm1-worked reveal';
    var cards = examples.map(function (ex, i) {
      var uid = 'm1-we-' + i;
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
          '<div class="m1-we-answer"><span class="m1-we-label">✅ Final Answer</span><pre class="m1-pre">' + esc(ex.final_answer) + '</pre></div>' +
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

  function _quickChecksBlock(checks) {
    var div = document.createElement('div');
    div.className = 'm1-quickchecks reveal';
    var qHtml = checks.map(function (qc, i) {
      return _renderQC(qc, 'm1-qc-' + i);
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
          'onclick="Module1Engine.checkAnswer(this)">' +
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
        '<div class="m1-qc-feedback" id="' + uid + '-fb">' + esc(qc.explanation) + '</div>' +
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

  function _lessonBottomNav(idx, lessons) {
    var div = document.createElement('div');
    div.className = 'bottom-nav';
    var prevHtml = idx > 0
      ? '<a href="module1-propositional-logic-lesson' + idx + '.html" class="btn-nav">‹ Lesson ' + idx + ': ' + esc(lessons[idx - 1].title) + '</a>'
      : '<a href="../index.html" class="btn-nav">‹ Home</a>';
    var nextHtml = idx < lessons.length - 1
      ? '<a href="module1-propositional-logic-lesson' + (idx + 2) + '.html" class="btn-nav next">Lesson ' + (idx + 2) + ': ' + esc(lessons[idx + 1].title) + ' ›</a>'
      : '<a href="module1-propositional-logic-exercises.html" class="btn-nav next m1-nav-exercises">Module 1 Exercises 🧪 ›</a>';
    div.innerHTML = prevHtml +
      '<div class="lesson-indicator"><strong>' + (idx + 1) + ' / ' + lessons.length + '</strong><span>Module 1</span></div>' +
      nextHtml;
    return div;
  }

  /* ── EXERCISES BUILDER ────────────────────────────────────── */

  function _buildExercises(exercises, lessons, container) {
    container.innerHTML = '';
    var art = document.createElement('article');
    art.className = 'm1-exercises-page';

    /* Hero */
    var hero = document.createElement('div');
    hero.className = 'm1-hero m1-ex-hero reveal';
    hero.innerHTML =
      '<div class="m1-hero-top">' +
        '<span class="m1-hero-module">📐 Module 1 — Propositional Logic</span>' +
        '<span class="badge badge-exercise">🧪 Exercises</span>' +
      '</div>' +
      '<h1 class="m1-hero-title">' + esc(exercises.title) + '</h1>' +
      '<p class="m1-ex-desc">' + esc(exercises.description) + '</p>' +
      '<div class="m1-score-bar">' +
        '🏆 Score: <span class="m1-score-num" id="ex-correct">0</span> / ' +
        '<span class="m1-score-num" id="ex-total">0</span>' +
        '<button class="m1-retry-btn" onclick="Module1Engine.retryAll()">↺ Retry All</button>' +
      '</div>';
    art.appendChild(hero);

    var setLabels = { mcq: '🔘 Multiple Choice', true_false: '✔️ True / False',
      short_answer: '✏️ Short Answer', step_by_step: '🔢 Step-by-Step Truth Tables',
      exam_style: '📋 Exam-Style', randomized: '🎲 Randomized Drill' };

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
    nav.innerHTML =
      '<a href="module1-propositional-logic-lesson3.html" class="btn-nav">‹ Back to Lesson 3</a>' +
      '<div class="lesson-indicator"><strong>Exercises</strong><span>Module 1</span></div>' +
      '<a href="../index.html" class="btn-nav next">Home ›</a>';
    art.appendChild(nav);

    container.appendChild(art);
  }

  function _buildExQuestion(q, type, uid) {
    var div = document.createElement('div');
    div.className = 'm1-ex-card';
    div.id = uid;

    if (type === 'mcq' || type === 'true_false') {
      var choicesHtml = (q.choices || []).map(function (c, j) {
        return '<button class="m1-choice" data-qid="' + uid + '" data-val="' + esc(c) + '" ' +
          'data-correct="' + (c === q.answer ? '1' : '0') + '" ' +
          'onclick="Module1Engine.checkAnswer(this)">' +
          '<span class="m1-choice-letter">' + String.fromCharCode(65 + j) + '</span>' +
          '<span>' + esc(c) + '</span></button>';
      }).join('');
      div.innerHTML =
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<div class="m1-choices">' + choicesHtml + '</div>' +
        '<div class="m1-qc-feedback" id="' + uid + '-fb">' + esc(q.explanation || '') + '</div>';

    } else if (type === 'short_answer' || type === 'exam_style') {
      div.innerHTML =
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<button class="m1-sa-reveal" onclick="(function(b){b.style.display=\'none\';document.getElementById(\'' + uid + '-fb\').style.display=\'block\'})(this)">Show Answer</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" id="' + uid + '-fb">' +
          '<strong>Answer:</strong><br><pre class="m1-pre">' + esc(q.answer) + '</pre>' +
          (q.explanation ? '<em>' + esc(q.explanation) + '</em>' : '') +
        '</div>';

    } else if (type === 'step_by_step') {
      div.innerHTML =
        '<p class="m1-ex-q">' + esc(q.question) + '</p>' +
        '<button class="m1-sa-reveal" onclick="(function(b){b.style.display=\'none\';document.getElementById(\'' + uid + '-fb\').style.display=\'block\'})(this)">Show Full Solution</button>' +
        '<div class="m1-qc-feedback m1-sa-answer" id="' + uid + '-fb">' +
          '<pre class="m1-pre">' + esc(q.answer) + '</pre>' +
          (q.explanation ? '<em>' + esc(q.explanation) + '</em>' : '') +
        '</div>';
    }
    return div;
  }

  function _buildRandomized(qset) {
    var div = document.createElement('div');
    div.className = 'm1-rand-area';

    var templates = qset.questions || [];
    var currentIdx = 0;

    /* Pick random values for every {VARIABLE} in the template at tIdx */
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

    /* Re-render the question panel with freshly randomized values */
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

    /* Build skeleton — buttons wired with closures, no global calls */
    div.innerHTML =
      '<div class="m1-rand-q"></div>' +
      '<div class="m1-rand-btns">' +
        '<button class="m1-rand-next">🎲 New Question</button>' +
        '<button class="m1-rand-prev">← Prev Template</button>' +
        '<button class="m1-rand-next-tmpl">Next Template →</button>' +
      '</div>';

    var btns = div.querySelectorAll('.m1-rand-btns button');
    /* New Question: re-randomize same template */
    btns[0].addEventListener('click', function () { show(); });
    /* Prev Template */
    btns[1].addEventListener('click', function () {
      currentIdx = (currentIdx - 1 + templates.length) % templates.length;
      show();
    });
    /* Next Template */
    btns[2].addEventListener('click', function () {
      currentIdx = (currentIdx + 1) % templates.length;
      show();
    });

    /* Initial render after element is in DOM */
    setTimeout(function () { show(); }, 0);
    return div;
  }

  /* ── INTERACTIVITY ────────────────────────────────────────── */

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

    /* update score only for exercises page (has ex- prefix) */
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
      card.querySelectorAll('.m1-sa-reveal').forEach(function (b) {
        b.style.display = '';
      });
    });
  }

  /* ── HELPERS ──────────────────────────────────────────────── */

  function _activateSidebar(lessonId) {
    document.querySelectorAll('.m1-sidebar-link').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-id') === lessonId);
    });
  }

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
        '<p>Make sure the JSON file is at <code>content/module1_propositional_logic.json</code>.</p>' +
      '</div>';
  }

  /* ── EXPORT ───────────────────────────────────────────────── */
  global.Module1Engine = {
    renderLesson: renderLesson,
    renderExercises: renderExercises,
    checkAnswer: checkAnswer,
    retryAll: retryAll,
    _randState: {}
  };

})(window);
