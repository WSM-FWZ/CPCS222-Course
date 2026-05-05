/* ============================================================
   CPCS 222 — Discrete Mathematics
   quiz_engine.js  —  Multiple-choice quiz (Phase 2)
   ============================================================ */
(function (global) {
  'use strict';

  var _LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function init(quizData, container) {
    container.innerHTML = '';
    container.className = 'quiz-container';

    var state = { answered: 0, correct: 0, total: quizData.length };

    quizData.forEach(function (item, qi) {
      var qCard = document.createElement('div');
      qCard.className = 'quiz-question';

      // header
      var qHeader = document.createElement('div');
      qHeader.className = 'quiz-q-header';

      var qNum = document.createElement('span');
      qNum.className = 'quiz-q-num';
      qNum.textContent = 'Q' + (qi + 1);

      var qText = document.createElement('p');
      qText.className = 'quiz-q-text';
      qText.textContent = item.q;

      var statusIcon = document.createElement('span');
      statusIcon.className = 'quiz-status-icon';

      qHeader.appendChild(qNum);
      qHeader.appendChild(qText);
      qHeader.appendChild(statusIcon);
      qCard.appendChild(qHeader);

      // choices
      var choicesEl = document.createElement('div');
      choicesEl.className = 'quiz-choices';

      item.choices.forEach(function (choice, ci) {
        var btn = document.createElement('button');
        btn.className = 'quiz-choice';

        var letter = document.createElement('span');
        letter.className = 'choice-letter';
        letter.textContent = _LETTERS[ci] || String(ci + 1);

        var text = document.createElement('span');
        text.className = 'choice-text';
        text.textContent = choice;

        btn.appendChild(letter);
        btn.appendChild(text);

        btn.addEventListener('click', function () {
          if (qCard.classList.contains('answered-correct') ||
              qCard.classList.contains('answered-wrong')) return;

          var isCorrect = choice === item.answer;

          // mark chosen button
          btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
          if (!isCorrect) {
            // reveal the correct answer
            choicesEl.querySelectorAll('.quiz-choice').forEach(function (b) {
              if (b.querySelector('.choice-text').textContent === item.answer) {
                b.classList.add('reveal-correct');
              }
            });
          }

          // disable all choices
          choicesEl.querySelectorAll('.quiz-choice').forEach(function (b) {
            b.classList.add('disabled');
            b.disabled = true;
          });

          // mark card
          qCard.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');
          statusIcon.textContent = isCorrect ? '✓' : '✗';

          // show explanation
          var expEl = document.createElement('div');
          expEl.className = 'quiz-explanation show';
          var expLabel = document.createElement('div');
          expLabel.className = 'expl-label';
          expLabel.textContent = isCorrect ? 'Correct!' : 'Explanation';
          var expText = document.createElement('p');
          expText.textContent = item.explanation;
          expEl.appendChild(expLabel);
          expEl.appendChild(expText);
          qCard.appendChild(expEl);

          state.answered++;
          if (isCorrect) state.correct++;
          if (state.answered === state.total) {
            _showFinal(container, state, quizData);
          }
        });

        choicesEl.appendChild(btn);
      });

      qCard.appendChild(choicesEl);
      container.appendChild(qCard);
    });
  }

  function _showFinal(container, state, quizData) {
    var pct = Math.round(state.correct / state.total * 100);
    var grade = pct === 100 ? 'Perfect! 🎉' : pct >= 80 ? 'Great work!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!';

    var final = document.createElement('div');
    final.className = 'quiz-final reveal';

    var score = document.createElement('div');
    score.className = 'quiz-final-score';
    score.textContent = pct + '%';

    var label = document.createElement('p');
    label.className = 'quiz-final-label';
    label.textContent = grade + ' — ' + state.correct + ' / ' + state.total + ' correct';

    var retry = document.createElement('button');
    retry.className = 'btn-retry';
    retry.textContent = '↺ Try Again';
    retry.addEventListener('click', function () { init(quizData, container); });

    final.appendChild(score);
    final.appendChild(label);
    final.appendChild(retry);
    container.appendChild(final);

    // trigger reveal animation
    setTimeout(function () { final.classList.add('visible'); }, 50);
    final.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  global.QuizEngine = { init: init };

})(window);
