/* ============================================================
   CPCS 222 — Discrete Mathematics
   renderer.js  —  Lesson DOM builder (Phase 2)
   ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     STORY / DIALOGUE
  ---------------------------------------------------------- */
  function renderStory(storyText) {
    var wrap = document.createElement('div');
    wrap.className = 'dialogue';
    var blocks = storyText.trim().split(/\n\n+/);
    blocks.forEach(function (block) {
      var line = block.trim();
      if (!line) return;
      var isProfessor = /^Professor\s*:/i.test(line);

      var exchange = document.createElement('div');
      exchange.className = 'dialogue-exchange' + (isProfessor ? ' professor' : '');

      var avatar = document.createElement('div');
      avatar.className = 'speaker-avatar ' + (isProfessor ? 'avatar-prof' : 'avatar-student');
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = isProfessor ? 'P' : 'S';

      var bubble = document.createElement('div');
      bubble.className = 'dialogue-bubble ' + (isProfessor ? 'bubble-prof' : 'bubble-student');

      var name = document.createElement('div');
      name.className = 'speaker-name';
      name.textContent = isProfessor ? 'Professor' : 'Student';

      var text = document.createElement('p');
      text.textContent = isProfessor
        ? line.replace(/^Professor\s*:\s*/i, '')
        : line.replace(/^Student\s*:\s*/i, '');

      bubble.appendChild(name);
      bubble.appendChild(text);
      exchange.appendChild(avatar);
      exchange.appendChild(bubble);
      wrap.appendChild(exchange);
    });
    return wrap;
  }

  /* ----------------------------------------------------------
     EXPLANATION
  ---------------------------------------------------------- */
  function renderExplain(explainText) {
    var wrap = document.createElement('div');
    wrap.className = 'explain-content';
    var lines = explainText.split('\n');
    var numberedGroup = null;
    var i = 0;

    function flushGroup() {
      if (numberedGroup) {
        wrap.appendChild(numberedGroup);
        numberedGroup = null;
      }
    }

    while (i < lines.length) {
      var line = lines[i].trim();
      if (!line) { i++; continue; }

      var numMatch = line.match(/^(\d+)\)\s+(.+)$/);
      if (numMatch) {
        if (!numberedGroup) {
          numberedGroup = document.createElement('div');
          numberedGroup.className = 'explain-numbered';
        }
        var item = document.createElement('div');
        item.className = 'explain-item';

        var numBadge = document.createElement('div');
        numBadge.className = 'explain-item-num';
        numBadge.textContent = numMatch[1];

        var textWrap = document.createElement('div');
        textWrap.className = 'explain-item-text';
        var parts = numMatch[2].split(' — ');
        var strong = document.createElement('strong');
        strong.textContent = parts[0];
        textWrap.appendChild(strong);
        if (parts.length > 1) {
          var rest = document.createTextNode(' — ' + parts.slice(1).join(' — '));
          textWrap.appendChild(rest);
        }

        item.appendChild(numBadge);
        item.appendChild(textWrap);
        numberedGroup.appendChild(item);
        i++;
        continue;
      }

      flushGroup();

      if (/^[•\-\*]\s/.test(line)) {
        var p = document.createElement('p');
        p.textContent = line.replace(/^[•\-\*]\s*/, '• ');
        wrap.appendChild(p);
        i++;
        continue;
      }

      var para = document.createElement('p');
      para.textContent = line;
      wrap.appendChild(para);
      i++;
    }
    flushGroup();
    return wrap;
  }

  /* ----------------------------------------------------------
     KEY POINTS
  ---------------------------------------------------------- */
  function renderKeyPoints(points) {
    var ul = document.createElement('ul');
    ul.className = 'key-points-list';
    points.forEach(function (pt) {
      var li = document.createElement('li');
      li.className = 'key-point';

      var bullet = document.createElement('span');
      bullet.className = 'key-point-bullet';
      bullet.setAttribute('aria-hidden', 'true');
      bullet.textContent = '✦';

      var text = document.createElement('span');
      text.className = 'key-point-text';
      text.textContent = pt;

      li.appendChild(bullet);
      li.appendChild(text);
      ul.appendChild(li);
    });
    return ul;
  }

  /* ----------------------------------------------------------
     EXAMPLES
  ---------------------------------------------------------- */
  function renderExamples(examples) {
    var wrap = document.createElement('div');
    wrap.className = 'examples-list';
    examples.forEach(function (ex, idx) {
      var card = document.createElement('div');
      card.className = 'example-card';

      var prompt = document.createElement('div');
      prompt.className = 'example-prompt';

      var num = document.createElement('span');
      num.className = 'example-num';
      num.textContent = 'Ex ' + (idx + 1);

      var promptText = document.createElement('span');
      promptText.className = 'example-prompt-text';
      promptText.textContent = ex.prompt;

      var chevron = document.createElement('span');
      chevron.className = 'example-toggle';
      chevron.textContent = '▾';

      prompt.appendChild(num);
      prompt.appendChild(promptText);
      prompt.appendChild(chevron);

      var answer = document.createElement('div');
      answer.className = 'example-answer';
      var label = document.createElement('div');
      label.className = 'answer-label';
      label.textContent = 'Solution';
      var answerText = document.createElement('pre');
      answerText.style.whiteSpace = 'pre-wrap';
      answerText.style.fontFamily = 'var(--font-mono)';
      answerText.style.fontSize = '.85rem';
      answerText.style.margin = '0';
      answerText.textContent = ex.answer;
      answer.appendChild(label);
      answer.appendChild(answerText);

      prompt.addEventListener('click', function () {
        card.classList.toggle('open');
      });

      card.appendChild(prompt);
      card.appendChild(answer);
      wrap.appendChild(card);
    });
    return wrap;
  }

  /* ----------------------------------------------------------
     MATH FORMULAS
  ---------------------------------------------------------- */
  function renderMath(mathArr) {
    var wrap = document.createElement('div');
    wrap.className = 'formula-list';
    mathArr.forEach(function (formula) {
      var item = document.createElement('div');
      item.className = 'formula-item';

      var dot = document.createElement('div');
      dot.className = 'formula-bullet';
      dot.setAttribute('aria-hidden', 'true');

      var text = document.createElement('span');
      text.className = 'formula-text';
      text.textContent = formula;

      item.appendChild(dot);
      item.appendChild(text);
      wrap.appendChild(item);
    });
    return wrap;
  }

  /* ----------------------------------------------------------
     SVG TRUTH TABLE WIDGET
  ---------------------------------------------------------- */
  var _TT_FORMULAS = [
    {
      label: '¬p',
      headers: ['p', '¬p'],
      insight: null,
      generate: function () {
        return [[true,false],[false,true]];
      }
    },
    {
      label: 'p ∧ q',
      headers: ['p', 'q', 'p ∧ q'],
      insight: null,
      generate: function () {
        return [[true,true,true],[true,false,false],[false,true,false],[false,false,false]];
      }
    },
    {
      label: 'p ∨ q',
      headers: ['p', 'q', 'p ∨ q'],
      insight: null,
      generate: function () {
        return [[true,true,true],[true,false,true],[false,true,true],[false,false,false]];
      }
    },
    {
      label: 'p ⊕ q',
      headers: ['p', 'q', 'p ⊕ q'],
      insight: null,
      generate: function () {
        return [[true,true,false],[true,false,true],[false,true,true],[false,false,false]];
      }
    },
    {
      label: 'p → q',
      headers: ['p', 'q', 'p → q'],
      insight: 'FALSE only when p = T and q = F',
      generate: function () {
        return [[true,true,true],[true,false,false],[false,true,true],[false,false,true]];
      }
    },
    {
      label: 'p ↔ q',
      headers: ['p', 'q', 'p ↔ q'],
      insight: null,
      generate: function () {
        return [[true,true,true],[true,false,false],[false,true,false],[false,false,true]];
      }
    },
    {
      label: '(p∨¬q)→q',
      headers: ['p', 'q', '¬q', 'p∨¬q', 'result'],
      insight: null,
      generate: function () {
        return [[true,true,false,true,true],[true,false,true,true,false],[false,true,false,false,true],[false,false,true,true,false]];
      }
    }
  ];

  var _activeFormula = 4;

  function _buildSVGTable(formula) {
    var rows = formula.generate();
    var headers = formula.headers;
    var nCols = headers.length;
    var nRows = rows.length;
    var cellW = 68, cellH = 44, headerH = 48;
    var totalW = nCols * cellW;
    var totalH = headerH + nRows * cellH;
    var NS = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + totalW + ' ' + totalH);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', totalH);
    svg.setAttribute('class', 'tt-svg');

    var hBg = document.createElementNS(NS, 'rect');
    hBg.setAttribute('x','0'); hBg.setAttribute('y','0');
    hBg.setAttribute('width', totalW); hBg.setAttribute('height', headerH);
    hBg.setAttribute('fill','var(--primary)');
    svg.appendChild(hBg);

    headers.forEach(function (h, ci) {
      var isLast = ci === nCols - 1;
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', ci * cellW + cellW / 2);
      t.setAttribute('y', headerH / 2 + 6);
      t.setAttribute('text-anchor','middle');
      t.setAttribute('fill','#ffffff');
      t.setAttribute('font-size', isLast ? '13' : '12');
      t.setAttribute('font-weight', isLast ? '700' : '500');
      t.setAttribute('font-family','Inter,sans-serif');
      t.textContent = h;
      svg.appendChild(t);
    });

    rows.forEach(function (row, ri) {
      var y = headerH + ri * cellH;
      var bg = document.createElementNS(NS, 'rect');
      bg.setAttribute('x','0'); bg.setAttribute('y', y);
      bg.setAttribute('width', totalW); bg.setAttribute('height', cellH);
      bg.setAttribute('fill', ri % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)');
      svg.appendChild(bg);

      row.forEach(function (val, ci) {
        var isLast = ci === nCols - 1;
        if (isLast) {
          var cellBg = document.createElementNS(NS, 'rect');
          cellBg.setAttribute('x', ci * cellW + 2);
          cellBg.setAttribute('y', y + 2);
          cellBg.setAttribute('width', cellW - 4);
          cellBg.setAttribute('height', cellH - 4);
          cellBg.setAttribute('rx','6');
          cellBg.setAttribute('fill', val ? 'rgba(34,197,94,.18)' : 'rgba(239,68,68,.15)');
          svg.appendChild(cellBg);
        }
        var t = document.createElementNS(NS, 'text');
        t.setAttribute('x', ci * cellW + cellW / 2);
        t.setAttribute('y', y + cellH / 2 + 6);
        t.setAttribute('text-anchor','middle');
        t.setAttribute('font-size', isLast ? '15' : '13');
        t.setAttribute('font-weight', isLast ? '700' : '400');
        t.setAttribute('font-family','Inter,sans-serif');
        t.setAttribute('fill', isLast ? (val ? '#16a34a' : '#dc2626') : 'var(--text)');
        t.textContent = val ? 'T' : 'F';
        svg.appendChild(t);
      });

      var div = document.createElementNS(NS, 'line');
      div.setAttribute('x1','0'); div.setAttribute('y1', y + cellH);
      div.setAttribute('x2', totalW); div.setAttribute('y2', y + cellH);
      div.setAttribute('stroke','var(--border)'); div.setAttribute('stroke-width','1');
      svg.appendChild(div);
    });

    for (var ci = 1; ci < nCols; ci++) {
      var vl = document.createElementNS(NS, 'line');
      vl.setAttribute('x1', ci * cellW); vl.setAttribute('y1','0');
      vl.setAttribute('x2', ci * cellW); vl.setAttribute('y2', totalH);
      vl.setAttribute('stroke','var(--border)'); vl.setAttribute('stroke-width','1');
      svg.appendChild(vl);
    }
    return svg;
  }

  function buildTruthTableWidget() {
    var container = document.createElement('div');
    container.className = 'tt-widget';

    // tabs
    var tabs = document.createElement('div');
    tabs.className = 'tt-formula-tabs';
    tabs.setAttribute('role','tablist');

    var svgWrap = document.createElement('div');
    svgWrap.className = 'tt-svg-container';

    var annotation = document.createElement('div');
    annotation.className = 'tt-annotation';

    _TT_FORMULAS.forEach(function (f, idx) {
      var btn = document.createElement('button');
      btn.className = 'tt-tab' + (idx === _activeFormula ? ' active' : '');
      btn.textContent = f.label;
      btn.setAttribute('role','tab');
      btn.addEventListener('click', function () {
        _activeFormula = idx;
        tabs.querySelectorAll('.tt-tab').forEach(function (b, i) {
          b.classList.toggle('active', i === idx);
        });
        _refreshTT(svgWrap, annotation, idx);
      });
      tabs.appendChild(btn);
    });

    _refreshTT(svgWrap, annotation, _activeFormula);

    container.appendChild(tabs);
    container.appendChild(svgWrap);
    container.appendChild(annotation);

    var refGrid = document.createElement('div');
    refGrid.className = 'connective-ref';
    var connectives = [
      {sym:'¬p', name:'NOT', rule:'Flips truth value'},
      {sym:'p∧q', name:'AND', rule:'True only if both T'},
      {sym:'p∨q', name:'OR', rule:'True if either T'},
      {sym:'p⊕q', name:'XOR', rule:'True if exactly one T'},
      {sym:'p→q', name:'IF-THEN', rule:'False only if p=T, q=F'},
      {sym:'p↔q', name:'IFF', rule:'True if same value'}
    ];
    connectives.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'conn-card';
      card.innerHTML = '<div class="conn-symbol">' + c.sym + '</div>' +
        '<div class="conn-name">' + c.name + '</div>' +
        '<div class="conn-rule">' + c.rule + '</div>';
      refGrid.appendChild(card);
    });
    container.appendChild(refGrid);
    return container;
  }

  function _refreshTT(svgWrap, annotation, idx) {
    var f = _TT_FORMULAS[idx];
    svgWrap.innerHTML = '';
    svgWrap.appendChild(_buildSVGTable(f));
    if (f.insight) {
      annotation.innerHTML = '💡 <strong>Key insight:</strong> ' + f.insight;
      annotation.style.display = '';
    } else {
      annotation.style.display = 'none';
    }
  }

  /* ----------------------------------------------------------
     SECTION WRAPPER  (collapsible)
  ---------------------------------------------------------- */
  function wrapSection(icon, title, bodyEl, typeClass) {
    var section = document.createElement('div');
    section.className = 'lesson-section ' + (typeClass || '') + ' reveal';

    var head = document.createElement('div');
    head.className = 'section-head';
    head.setAttribute('role','button');
    head.setAttribute('tabindex','0');
    head.setAttribute('aria-expanded','true');

    var iconEl = document.createElement('span');
    iconEl.className = 'section-icon';
    iconEl.setAttribute('aria-hidden','true');
    iconEl.textContent = icon;

    var h2 = document.createElement('h2');
    h2.textContent = title;

    var chevron = document.createElement('span');
    chevron.className = 'section-chevron';
    chevron.textContent = '▾';

    head.appendChild(iconEl);
    head.appendChild(h2);
    head.appendChild(chevron);

    var body = document.createElement('div');
    body.className = 'section-body';
    body.appendChild(bodyEl);

    function toggle() {
      var collapsed = section.classList.toggle('collapsed');
      head.setAttribute('aria-expanded', String(!collapsed));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    section.appendChild(head);
    section.appendChild(body);
    return section;
  }

  /* ----------------------------------------------------------
     STUB  (locked sections)
  ---------------------------------------------------------- */
  function renderStub(lesson, container) {
    container.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'lesson-stub';

    var hdr = document.createElement('div');
    hdr.className = 'stub-header';
    var iconEl = document.createElement('div');
    iconEl.className = 'stub-icon';
    iconEl.textContent = '🔒';
    var info = document.createElement('div');
    var secEl = document.createElement('div');
    secEl.className = 'stub-section';
    secEl.textContent = 'Section ' + lesson.section;
    var titleEl = document.createElement('h2');
    titleEl.className = 'stub-title';
    titleEl.textContent = lesson.title;
    var msgEl = document.createElement('p');
    msgEl.className = 'stub-msg';
    msgEl.textContent = 'Full lesson coming soon.';
    info.appendChild(secEl);
    info.appendChild(titleEl);
    info.appendChild(msgEl);
    hdr.appendChild(iconEl);
    hdr.appendChild(info);
    wrap.appendChild(hdr);

    if (lesson.objective) {
      var obj = document.createElement('div');
      obj.className = 'stub-objective';
      var objHead = document.createElement('h4');
      objHead.textContent = 'Learning Objective';
      var objText = document.createElement('p');
      objText.textContent = lesson.objective;
      obj.appendChild(objHead);
      obj.appendChild(objText);
      wrap.appendChild(obj);
    }
    container.appendChild(wrap);
  }

  /* ----------------------------------------------------------
     FULL LESSON RENDERER
  ---------------------------------------------------------- */
  function renderLesson(lesson, container) {
    container.innerHTML = '';
    container.setAttribute('data-section', lesson.section);

    var header = document.createElement('div');
    header.className = 'lesson-header';

    var meta = document.createElement('div');
    meta.className = 'lesson-meta';
    meta.textContent = 'Section ' + lesson.section;

    var titleEl = document.createElement('h1');
    titleEl.className = 'lesson-title';
    titleEl.textContent = lesson.title;

    var objEl = document.createElement('p');
    objEl.className = 'lesson-objective';
    objEl.textContent = lesson.objective;

    header.appendChild(meta);
    header.appendChild(titleEl);
    header.appendChild(objEl);

    if (lesson.why) {
      var whyEl = document.createElement('div');
      whyEl.className = 'lesson-why';
      var whyText = document.createElement('p');
      whyText.innerHTML = '<strong>Why this matters:</strong> ' + lesson.why;
      whyEl.appendChild(whyText);
      header.appendChild(whyEl);
    }
    container.appendChild(header);

    if (lesson.story) {
      container.appendChild(wrapSection('💬', 'Dialogue', renderStory(lesson.story), 'lesson-section--story'));
    }
    if (lesson.explain) {
      container.appendChild(wrapSection('📖', 'Explanation', renderExplain(lesson.explain), 'lesson-section--explain'));
    }
    if (lesson.key_points && lesson.key_points.length) {
      container.appendChild(wrapSection('⭐', 'Key Points', renderKeyPoints(lesson.key_points), 'lesson-section--keypoints'));
    }
    if (lesson.math && lesson.math.length) {
      container.appendChild(wrapSection('∑', 'Key Formulas', renderMath(lesson.math), 'lesson-section--math'));
    }
    if (lesson.visual) {
      var visualBody = document.createElement('div');
      visualBody.className = 'visual-body';
      if (lesson.visual.type === 'table') {
        visualBody.appendChild(buildTruthTableWidget());
      } else {
        var vDesc = document.createElement('p');
        vDesc.textContent = lesson.visual.idea;
        var vHint = document.createElement('p');
        vHint.style.fontSize = '.85rem';
        vHint.style.color = 'var(--text-3)';
        vHint.textContent = '💡 ' + lesson.visual.interactive_hint;
        visualBody.appendChild(vDesc);
        visualBody.appendChild(vHint);
      }
      container.appendChild(wrapSection('🔬', 'Interactive Visual', visualBody, 'lesson-section--visual'));
    }
    if (lesson.examples && lesson.examples.length) {
      container.appendChild(wrapSection('📝', 'Worked Examples', renderExamples(lesson.examples), 'lesson-section--examples'));
    }
    if (lesson.quiz && lesson.quiz.length) {
      var quizMount = document.createElement('div');
      if (typeof QuizEngine !== 'undefined') {
        QuizEngine.init(lesson.quiz, quizMount);
      } else {
        quizMount.textContent = 'Quiz engine not loaded.';
      }
      container.appendChild(wrapSection('🧪', 'Practice Quiz', quizMount, 'lesson-section--quiz'));
    }

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([container]).catch(function (e) {
        console.warn('[Renderer] MathJax error:', e);
      });
    }
  }

  global.Renderer = { renderLesson: renderLesson, renderStub: renderStub };

})(window);
