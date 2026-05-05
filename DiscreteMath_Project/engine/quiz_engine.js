/* ============================================================
   CPCS 222 — Discrete Mathematics
   quiz_engine.js  —  Multiple-choice quiz with scoring
   ============================================================ */
(function (global) {
  'use strict';

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls)  e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function safe(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ----------------------------------------------------------
     BUILD ONE QUESTION CARD
  ---------------------------------------------------------- */
  function buildQuestion(qData, qIndex, state, onAnswer) {
    var card = el('div', 'quiz-question');
    card.id  = 'quiz-q-' + qIndex;

    /* Header */
    var header = el('div', 'quiz-q-header');
    var num    = el('span', 'quiz-q-num');
    num.textContent = 'Q' + (qIndex + 1);
    var qText  = el('div', 'quiz-q-text');
    qText.textContent = qData.q;
    var icon   = el('span', 'quiz-status-icon');
    icon.textContent = '';
    header.appendChild(num);
    header.appendChild(qText);
    header.appendChild(icon);
    card.appendChild(header);

    /* Choices */
    var choicesWrap = el('div', 'quiz-choices');
    var choiceEls = [];

    qData.choices.forEach(function (choice, ci) {
      var choiceBtn = el('div', 'quiz-choice');
      choiceBtn.dataset.choice = choice;

      var letter = el('span', 'choice-letter');
      letter.textContent = LETTERS[ci] || (ci + 1);
      var cText  = el('span', 'choice-text');
      cText.textContent = choice;
      choiceBtn.appendChild(letter);
      choiceBtn.appendChild(cText);
      choiceEls.push(choiceBtn);

      choiceBtn.addEventListener('click', function () {
        if (state.answered[qIndex]) return;

        var selected = choice;
        var correct  = qData.answer;
        var isCorrect = (selected === correct);

        state.answered[qIndex] = true;
        if (isCorrect) state.score++;

        /* Style all choices */
        choiceEls.forEach(function (ce) {
          ce.classList.add('disabled');
          var cv = ce.dataset.choice;
          if (cv === selected && isCorrect) {
            ce.classList.add('selected-correct');
          } else if (cv === selected && !isCorrect) {
            ce.classList.add('selected-wrong');
          } else if (cv === correct) {
            ce.classList.add('reveal-correct');
          }
        });

        /* Status icon */
        icon.textContent = isCorrect ? '✅' : '❌';
        card.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');

        /* Explanation */
        var expl = card.querySelector('.quiz-explanation');
        if (expl) expl.classList.add('show');

        onAnswer();
      });

      choicesWrap.appendChild(choiceBtn);
    });

    card.appendChild(choicesWrap);

    /* Explanation (hidden until answered) */
    if (qData.explanation) {
      var expl = el('div', 'quiz-explanation');
      expl.innerHTML =
        '<div class="expl-label">Explanation</div>' +
        '<div>' + safe(qData.explanation) + '</div>';
      card.appendChild(expl);
    }

    return card;
  }

  /* ----------------------------------------------------------
     PROGRESS BAR
  ---------------------------------------------------------- */
  function buildProgressBar(state, totalEl, scoreEl, barEl) {
    var pct   = state.total === 0 ? 0 : Math.round((Object.keys(state.answered).length / state.total) * 100);
    var score = state.score;
    if (barEl)   barEl.style.width = pct + '%';
    if (totalEl) totalEl.textContent = Object.keys(state.answered).length + ' / ' + state.total + ' answered';
    if (scoreEl) scoreEl.textContent = score + ' / ' + state.total + ' correct';
  }

  /* ----------------------------------------------------------
     FINAL SCORE BANNER
  ---------------------------------------------------------- */
  function buildFinal(state, container, quizData, onRetry) {
    var allAnswered = Object.keys(state.answered).length >= state.total;
    if (!allAnswered) return;

    var pct = Math.round((state.score / state.total) * 100);
    var grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good work!' : '📚 Keep studying!';

    var final = el('div', 'quiz-final');
    final.innerHTML =
      '<div class="quiz-final-score">' + state.score + ' / ' + state.total + '</div>' +
      '<div class="quiz-final-label">' + pct + '% &nbsp;—&nbsp; ' + grade + '</div>';

    var retryBtn = el('button', 'btn-retry');
    retryBtn.type = 'button';
    retryBtn.textContent = '↺ Try Again';
    retryBtn.addEventListener('click', function () {
      onRetry();
    });
    final.appendChild(retryBtn);
    container.appendChild(final);
  }

  /* ----------------------------------------------------------
     PUBLIC INIT
  ---------------------------------------------------------- */
  function init(quizData, container) {
    if (!container) return;
    if (!quizData  || !quizData.length) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:.9rem">No quiz available for this section.</p>';
      return;
    }

    function render() {
      container.innerHTML = '';

      var state = {
        total:    quizData.length,
        score:    0,
        answered: {}
      };

      /* Outer container */
      var quiz = el('div', 'quiz-container');

      /* Progress bar */
      var progress = el('div', 'quiz-progress');
      var barWrap  = el('div', 'quiz-progress-bar-wrap');
      var bar      = el('div', 'quiz-progress-bar');
      bar.style.width = '0%';
      barWrap.appendChild(bar);
      var totalTxt = el('span', '', '0 / ' + quizData.length + ' answered');
      var scoreTxt = el('span', 'quiz-score-live', '0 / ' + quizData.length + ' correct');
      progress.appendChild(totalTxt);
      progress.appendChild(barWrap);
      progress.appendChild(scoreTxt);
      quiz.appendChild(progress);

      /* Build question cards */
      quizData.forEach(function (qData, idx) {
        var card = buildQuestion(qData, idx, state, function () {
          buildProgressBar(state, totalTxt, scoreTxt, bar);
          /* Show final after all answered */
          if (Object.keys(state.answered).length >= state.total) {
            buildFinal(state, quiz, quizData, render);
          }
        });
        quiz.appendChild(card);
      });

      container.appendChild(quiz);
    }

    render();
  }

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  global.QuizEngine = {
    init: init
  };

})(window);
