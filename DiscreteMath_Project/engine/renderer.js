/* ============================================================
   CPCS 222 — Discrete Mathematics
   renderer.js  —  Lesson DOM builder
   ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls)  e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function text(str) {
    return document.createTextNode(str || '');
  }

  function safeText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function safe(str) {
    return safeText(str);
  }

  /* Make collapsible section head */
  function makeSectionHead(icon, title) {
    var head = el('div', 'section-head');
    head.innerHTML =
      '<span class="section-icon">' + icon + '</span>' +
      '<h2>' + safe(title) + '</h2>' +
      '<span class="section-chevron">&#9660;</span>';
    head.addEventListener('click', function () {
      var section = head.parentElement;
      section.classList.toggle('collapsed');
    });
    return head;
  }

  /* Wrap in collapsible section card */
  function wrapSection(icon, title, bodyEl) {
    var section = el('div', 'lesson-section');
    section.appendChild(makeSectionHead(icon, title));
    var body = el('div', 'section-body');
    body.appendChild(bodyEl);
    section.appendChild(body);
    return section;
  }

  /* ----------------------------------------------------------
     STORY / DIALOGUE RENDERER
  ---------------------------------------------------------- */
  function renderStory(storyText) {
    if (!storyText) {
      return el('p', 'text-center', '<em>No story available.</em>');
    }

    var dialogue = el('div', 'dialogue');

    var exchanges = storyText.split(/\n\n+/);
    exchanges.forEach(function (exchange) {
      exchange = exchange.trim();
      if (!exchange) return;

      var isProf   = /^Professor/i.test(exchange);
      var colonIdx = exchange.indexOf(':');
      var speaker  = colonIdx > -1 ? exchange.substring(0, colonIdx).trim() : 'Narrator';
      var speech   = colonIdx > -1 ? exchange.substring(colonIdx + 1).trim() : exchange;

      /* Strip outer quotes if present */
      speech = speech.replace(/^[""](.*)[""]$/s, '$1').trim();

      var row     = el('div', 'dialogue-exchange' + (isProf ? ' professor' : ''));
      var initials = speaker.replace(/\s+\(.*?\)/, '').split(' ')
        .map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();

      var avatar  = el('div', (isProf ? 'speaker-avatar avatar-prof' : 'speaker-avatar avatar-student'));
      avatar.textContent = initials || '?';

      var bubble  = el('div', (isProf ? 'dialogue-bubble bubble-prof' : 'dialogue-bubble bubble-student'));
      var nameEl  = el('div', 'speaker-name');
      nameEl.textContent = speaker;
      var speechEl = el('p', '');
      speechEl.textContent = speech;
      bubble.appendChild(nameEl);
      bubble.appendChild(speechEl);

      row.appendChild(avatar);
      row.appendChild(bubble);
      dialogue.appendChild(row);
    });

    return dialogue;
  }

  /* ----------------------------------------------------------
     EXPLANATION RENDERER
  ---------------------------------------------------------- */
  function renderExplain(explainText) {
    if (!explainText) {
      return el('p', '', '<em>No explanation available.</em>');
    }

    var wrap = el('div', 'explain-content');
    var paragraphs = explainText.split(/\n\n+/);

    paragraphs.forEach(function (para) {
      para = para.trim();
      if (!para) return;

      /* Numbered item detection: "1) ...", "2) ..." */
      var numMatch = para.match(/^(\d+)\)\s+([A-Z]+)\s*(.*)$/s);
      if (numMatch) {
        var numEl = el('div', 'explain-item');
        var numBadge = el('div', 'explain-item-num');
        numBadge.textContent = numMatch[1];
        var itemText = el('div', 'explain-item-text');
        var keyword = el('strong', '');
        keyword.textContent = numMatch[2];
        itemText.appendChild(keyword);
        var rest = document.createTextNode(' ' + (numMatch[3] || '').trim());
        itemText.appendChild(rest);
        numEl.appendChild(numBadge);
        numEl.appendChild(itemText);
        wrap.appendChild(numEl);
        return;
      }

      /* Bullet sub-items: lines starting with "  •" or "  *" */
      if (para.includes('\n') && /^\s+[•*]/.test(para)) {
        var lines = para.split('\n');
        var heading = '';
        if (!/^\s+[•*]/.test(lines[0])) {
          heading = lines.shift().trim();
        }
        if (heading) {
          var hEl = el('p', '');
          hEl.innerHTML = '<strong>' + safe(heading) + '</strong>';
          wrap.appendChild(hEl);
        }
        var ul = el('ul', '');
        ul.style.paddingLeft = '1.2rem';
        ul.style.marginBottom = '.6rem';
        lines.forEach(function (line) {
          line = line.trim().replace(/^[•*]\s*/, '');
          if (line) {
            var li = el('li', '');
            li.style.color = 'var(--text-secondary)';
            li.style.marginBottom = '.3rem';
            li.textContent = line;
            ul.appendChild(li);
          }
        });
        wrap.appendChild(ul);
        return;
      }

      /* Keyword lines: "WORD:" or "WORD WORD:" heading patterns */
      if (/^[A-Z][A-Z\s()]+:/.test(para)) {
        var pEl = el('p', '');
        /* Bold the ALL-CAPS keyword up to the first colon */
        var kw = para.match(/^([A-Z][A-Z\s()]+:)/);
        if (kw) {
          pEl.innerHTML = '<strong>' + safe(kw[1]) + '</strong>' +
                           safe(para.substring(kw[1].length));
        } else {
          pEl.textContent = para;
        }
        wrap.appendChild(pEl);
        return;
      }

      /* Default paragraph */
      var defaultP = el('p', '');
      defaultP.textContent = para;
      wrap.appendChild(defaultP);
    });

    return wrap;
  }

  /* ----------------------------------------------------------
     KEY POINTS RENDERER
  ---------------------------------------------------------- */
  function renderKeyPoints(points) {
    if (!points || !points.length) {
      return el('p', '', '<em>No key points available.</em>');
    }
    var list = el('div', 'key-points-list');
    points.forEach(function (pt) {
      var item = el('div', 'key-point');
      var bull = el('span', 'key-point-bullet');
      bull.textContent = '◆';
      var txt  = el('div', 'key-point-text');
      txt.textContent = pt;
      item.appendChild(bull);
      item.appendChild(txt);
      list.appendChild(item);
    });
    return list;
  }

  /* ----------------------------------------------------------
     EXAMPLES RENDERER
  ---------------------------------------------------------- */
  function renderExamples(examples) {
    if (!examples || !examples.length) {
      return el('p', '', '<em>No examples available.</em>');
    }
    var list = el('div', 'examples-list');
    examples.forEach(function (ex, idx) {
      var card = el('div', 'example-card');

      var prompt = el('div', 'example-prompt');
      var num    = el('span', 'example-num');
      num.textContent = 'Ex ' + (idx + 1);
      var promptTxt = el('span', 'example-prompt-text');
      promptTxt.textContent = ex.prompt;
      var toggle = el('span', 'example-toggle');
      toggle.textContent = '▼';
      prompt.appendChild(num);
      prompt.appendChild(promptTxt);
      prompt.appendChild(toggle);

      var answer = el('div', 'example-answer');
      var label  = el('div', 'answer-label');
      label.textContent = '✓ Solution';
      answer.appendChild(label);
      var ansText = el('div', '');
      ansText.style.whiteSpace = 'pre-wrap';
      ansText.style.fontFamily = 'var(--font-mono)';
      ansText.style.fontSize = '.85rem';
      ansText.textContent = ex.answer;
      answer.appendChild(ansText);

      prompt.addEventListener('click', function () {
        card.classList.toggle('open');
      });

      card.appendChild(prompt);
      card.appendChild(answer);
      list.appendChild(card);
    });
    return list;
  }

  /* ----------------------------------------------------------
     MATH FORMULAS RENDERER
  ---------------------------------------------------------- */
  function renderMath(mathArr) {
    if (!mathArr || !mathArr.length) {
      return el('p', '', '<em>No formulas available.</em>');
    }
    var list = el('div', 'formula-list');
    mathArr.forEach(function (formula) {
      var item = el('div', 'formula-item');
      var dot  = el('div', 'formula-bullet');
      var txt  = el('div', 'formula-text');
      txt.textContent = formula;
      item.appendChild(dot);
      item.appendChild(txt);
      list.appendChild(item);
    });
    return list;
  }

  /* ----------------------------------------------------------
     TRUTH TABLE WIDGET  (visual.type === "table")
  ---------------------------------------------------------- */
  var _FORMULAS = [
    {
      id: 'neg_p',
      label: '¬p',
      cols:  ['p', '¬p'],
      last:  1,
      annotation: '¬p flips the truth value: ¬T = F,  ¬F = T.',
      rows: function () {
        return [
          ['T', 'F'],
          ['F', 'T']
        ];
      }
    },
    {
      id: 'and',
      label: 'p ∧ q',
      cols:  ['p', 'q', 'p ∧ q'],
      last:  2,
      annotation: 'AND is true only when BOTH inputs are true.',
      rows: function () {
        return [
          ['T','T','T'],
          ['T','F','F'],
          ['F','T','F'],
          ['F','F','F']
        ];
      }
    },
    {
      id: 'or',
      label: 'p ∨ q',
      cols:  ['p', 'q', 'p ∨ q'],
      last:  2,
      annotation: 'OR is true when AT LEAST ONE input is true (inclusive or).',
      rows: function () {
        return [
          ['T','T','T'],
          ['T','F','T'],
          ['F','T','T'],
          ['F','F','F']
        ];
      }
    },
    {
      id: 'xor',
      label: 'p ⊕ q',
      cols:  ['p', 'q', 'p ⊕ q'],
      last:  2,
      annotation: 'XOR (exclusive or) is true when inputs DIFFER.',
      rows: function () {
        return [
          ['T','T','F'],
          ['T','F','T'],
          ['F','T','T'],
          ['F','F','F']
        ];
      }
    },
    {
      id: 'implies',
      label: 'p → q',
      cols:  ['p', 'q', 'p → q'],
      last:  2,
      annotation: 'Implication is FALSE only when hypothesis p is TRUE and conclusion q is FALSE. All other rows are TRUE.',
      rows: function () {
        return [
          ['T','T','T'],
          ['T','F','F'],
          ['F','T','T'],
          ['F','F','T']
        ];
      }
    },
    {
      id: 'iff',
      label: 'p ↔ q',
      cols:  ['p', 'q', 'p ↔ q'],
      last:  2,
      annotation: 'Biconditional is true when p and q have the SAME truth value.',
      rows: function () {
        return [
          ['T','T','T'],
          ['T','F','F'],
          ['F','T','F'],
          ['F','F','T']
        ];
      }
    },
    {
      id: 'compound',
      label: '(p∨¬q)→q',
      cols:  ['p', 'q', '¬q', 'p∨¬q', '(p∨¬q)→q'],
      last:  4,
      annotation: 'A compound formula. Columns are built left-to-right from subexpressions.',
      rows: function () {
        return [
          ['T','T','F','T','T'],
          ['T','F','T','T','F'],
          ['F','T','F','F','T'],
          ['F','F','T','T','F']
        ];
      }
    }
  ];

  var _CONNECTIVES = [
    { symbol: '¬p',   name: 'Negation',      rule: 'True when p is False' },
    { symbol: 'p ∧ q', name: 'Conjunction',   rule: 'True when BOTH are True' },
    { symbol: 'p ∨ q', name: 'Disjunction',   rule: 'True when AT LEAST ONE is True' },
    { symbol: 'p ⊕ q', name: 'Exclusive OR',  rule: 'True when inputs DIFFER' },
    { symbol: 'p → q', name: 'Implication',   rule: 'False ONLY when p=T and q=F' },
    { symbol: 'p ↔ q', name: 'Biconditional', rule: 'True when p and q are EQUAL' }
  ];

  function buildTruthTableWidget(visual) {
    var wrap = el('div', 'tt-widget');

    /* Description */
    var desc = el('div', 'tt-description');
    desc.textContent = visual.idea || 'Interactive truth table builder.';
    wrap.appendChild(desc);

    /* Formula tabs */
    var tabs = el('div', 'tt-formula-tabs');
    _FORMULAS.forEach(function (f) {
      var tab = el('button', 'tt-tab');
      tab.textContent = f.label;
      tab.dataset.id  = f.id;
      tab.type = 'button';
      tabs.appendChild(tab);
    });
    wrap.appendChild(tabs);

    /* Table container */
    var tableWrap = el('div', 'tt-table-wrap');
    wrap.appendChild(tableWrap);

    /* Annotation */
    var annot = el('div', 'tt-annotation');
    wrap.appendChild(annot);

    /* Connective reference */
    var refTitle = el('h4', '');
    refTitle.textContent = 'Connective Quick Reference';
    refTitle.style.marginTop = '.75rem';
    refTitle.style.marginBottom = '.5rem';
    refTitle.style.color = 'var(--text)';
    refTitle.style.fontSize = '.85rem';
    wrap.appendChild(refTitle);

    var refGrid = el('div', 'connective-ref');
    _CONNECTIVES.forEach(function (c) {
      var card  = el('div', 'conn-card');
      var sym   = el('div', 'conn-symbol'); sym.textContent = c.symbol;
      var name  = el('div', 'conn-name');   name.textContent = c.name;
      var rule  = el('div', 'conn-rule');   rule.textContent = c.rule;
      card.appendChild(sym);
      card.appendChild(name);
      card.appendChild(rule);
      refGrid.appendChild(card);
    });
    wrap.appendChild(refGrid);

    /* Render function */
    function showFormula(fId) {
      var f = _FORMULAS.filter(function (x) { return x.id === fId; })[0];
      if (!f) return;

      /* Update active tab */
      tabs.querySelectorAll('.tt-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.id === fId);
      });

      /* Build table */
      var table = el('table', 'tt-table');
      var thead = el('thead', '');
      var headRow = el('tr', '');
      f.cols.forEach(function (col, ci) {
        var th = el('th', ci === f.last ? 'result-col' : '', safe(col));
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      var tbody = el('tbody', '');
      f.rows().forEach(function (row) {
        var tr = el('tr', '');
        row.forEach(function (val, ci) {
          var td = el('td', (ci === f.last ? 'result-col ' : '') + 'val-' + val, val);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableWrap.innerHTML = '';
      tableWrap.appendChild(table);

      annot.innerHTML = '<strong>Key insight:</strong> ' + safe(f.annotation);
    }

    /* Tab click handlers */
    tabs.querySelectorAll('.tt-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        showFormula(tab.dataset.id);
      });
    });

    /* Default: show p → q */
    showFormula('implies');

    return wrap;
  }

  /* ----------------------------------------------------------
     VISUAL SECTION RENDERER
  ---------------------------------------------------------- */
  function renderVisual(visual) {
    if (!visual) {
      var ph = el('div', 'visual-placeholder');
      ph.innerHTML = '<div class="vp-type">NO DATA</div><p>No visual layer available for this section.</p>';
      return ph;
    }

    if (visual.type === 'table') {
      return buildTruthTableWidget(visual);
    }

    /* Placeholder for other visual types */
    var ph = el('div', 'visual-placeholder');
    var badge = el('div', 'vp-type');
    badge.textContent = (visual.type || 'visual').toUpperCase();
    var desc = el('p', '');
    desc.textContent = visual.idea || 'Interactive visualization.';
    var hint = el('p', 'visual-idea');
    hint.textContent = visual.interactive_hint || '';
    ph.appendChild(badge);
    ph.appendChild(desc);
    if (visual.interactive_hint) ph.appendChild(hint);
    return ph;
  }

  /* ----------------------------------------------------------
     COMING-SOON STUB  (for sections 1.2 – 1.8 in PREVIEW mode)
  ---------------------------------------------------------- */
  function renderStub(lesson, container) {
    container.innerHTML = '';
    var stub = el('div', 'lesson-stub');

    var header = el('div', 'stub-header');
    var icon   = el('div', 'stub-icon');
    icon.textContent = '🔒';
    var info   = el('div', '');
    var secEl  = el('div', 'stub-section');
    secEl.textContent = 'Section ' + (lesson ? lesson.section : '—');
    var titleEl = el('div', 'stub-title');
    titleEl.textContent = lesson ? lesson.title : 'Lesson unavailable';
    var msg = el('div', 'stub-msg');
    msg.textContent = 'This lesson will be available in the next release.';
    info.appendChild(secEl);
    info.appendChild(titleEl);
    info.appendChild(msg);
    header.appendChild(icon);
    header.appendChild(info);
    stub.appendChild(header);

    if (lesson && lesson.objective) {
      var objBox = el('div', 'stub-objective');
      var objHead = el('h4', '');
      objHead.textContent = 'What you\'ll learn';
      var objText = el('p', '');
      objText.textContent = lesson.objective;
      objBox.appendChild(objHead);
      objBox.appendChild(objText);
      stub.appendChild(objBox);
    }

    container.appendChild(stub);
  }

  /* ----------------------------------------------------------
     ERROR / FALLBACK
  ---------------------------------------------------------- */
  function renderError(msg, container) {
    container.innerHTML = '';
    var box = el('div', 'fallback-msg');
    box.innerHTML =
      '<div class="icon">⚠️</div>' +
      '<h3>Something went wrong</h3>' +
      '<p>' + safe(msg || 'Unable to load lesson content.') + '</p>';
    container.appendChild(box);
  }

  /* ----------------------------------------------------------
     MAIN LESSON RENDERER
  ---------------------------------------------------------- */
  function renderLesson(lesson, container) {
    if (!container) return;
    container.innerHTML = '';

    if (!lesson) {
      renderError('Lesson data not found.', container);
      return;
    }

    try {
      var article = el('article', 'lesson');
      article.setAttribute('data-section', lesson.section);

      /* --- Header --- */
      var header = el('header', 'lesson-header');
      var meta = el('div', 'lesson-meta');
      meta.textContent = 'Chapter 1  •  Section ' + lesson.section;
      var title = el('h1', 'lesson-title');
      title.textContent = lesson.title || 'Untitled Lesson';

      var objective = el('div', 'lesson-objective');
      objective.textContent = lesson.objective || '';

      var whyDiv = el('div', 'lesson-why');
      whyDiv.innerHTML = '<strong>Why it matters: </strong>' + safe(lesson.why || '');

      header.appendChild(meta);
      header.appendChild(title);
      if (lesson.objective) header.appendChild(objective);
      if (lesson.why)       header.appendChild(whyDiv);
      article.appendChild(header);

      /* --- Story --- */
      if (lesson.story) {
        article.appendChild(
          wrapSection('💬', 'Story', renderStory(lesson.story))
        );
      }

      /* --- Explanation --- */
      if (lesson.explain) {
        article.appendChild(
          wrapSection('📖', 'Explanation', renderExplain(lesson.explain))
        );
      }

      /* --- Key Points --- */
      if (lesson.key_points && lesson.key_points.length) {
        article.appendChild(
          wrapSection('🔑', 'Key Points', renderKeyPoints(lesson.key_points))
        );
      }

      /* --- Math Formulas --- */
      if (lesson.math && lesson.math.length) {
        article.appendChild(
          wrapSection('∑', 'Essential Formulas', renderMath(lesson.math))
        );
      }

      /* --- Interactive Visual --- */
      article.appendChild(
        wrapSection('🎨', 'Interactive Visual', renderVisual(lesson.visual || null))
      );

      /* --- Worked Examples --- */
      if (lesson.examples && lesson.examples.length) {
        article.appendChild(
          wrapSection('✏️', 'Worked Examples', renderExamples(lesson.examples))
        );
      }

      /* --- Quiz --- */
      if (lesson.quiz && lesson.quiz.length) {
        var quizBody = el('div', '');
        article.appendChild(
          wrapSection('🧪', 'Quick Quiz', quizBody)
        );
        if (global.QuizEngine) {
          global.QuizEngine.init(lesson.quiz, quizBody);
        } else {
          quizBody.textContent = 'Quiz engine not loaded.';
        }
      }

      container.appendChild(article);

      /* Scroll to top */
      container.scrollTop = 0;

    } catch (e) {
      console.error('[Renderer] Error rendering lesson:', e);
      renderError('Render error: ' + e.message, container);
    }
  }

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  global.Renderer = {
    renderLesson:  renderLesson,
    renderStub:    renderStub,
    renderError:   renderError
  };

})(window);
