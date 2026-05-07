/* ============================================================
   CPCS 222 — Discrete Mathematics
   feedback.js  —  Floating feedback button + modal form
   Submits to Google Apps Script via no-cors fetch
   ============================================================ */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzZgwpXmBnshrmn2dkePELUR5K_HOq8pAHyx8HyYX6aAQFBNG49VWRy1prOq9XPNEeSfg/exec';

  /* ----------------------------------------------------------
     METADATA  —  read CPCS_CONFIG if present
  ---------------------------------------------------------- */
  function _getMetadata() {
    var cfg = window.CPCS_CONFIG || {};
    return {
      page_title:  document.title || '',
      page_url:    window.location.href,
      module_id:   cfg.moduleNum  ? 'module' + cfg.moduleNum : 'home',
      lesson_id:   cfg.lessonId   || (cfg.type === 'exercises' ? 'exercises' : 'index'),
      timestamp:   new Date().toISOString(),
      user_agent:  navigator.userAgent || ''
    };
  }

  /* ----------------------------------------------------------
     BUILD UI  —  inject button + modal into <body>
  ---------------------------------------------------------- */
  function _buildUI() {
    var html = [
      /* Floating trigger button */
      '<button class="fb-btn" id="fb-btn" type="button" aria-label="Open feedback form" title="Send feedback">',
      '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
      '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
      '  </svg>',
      '</button>',

      /* Backdrop overlay */
      '<div class="fb-overlay" id="fb-overlay" aria-hidden="true"></div>',

      /* Modal */
      '<div class="fb-modal" id="fb-modal" role="dialog" aria-modal="true" aria-labelledby="fb-modal-title" aria-hidden="true">',

      /* — Header — */
      '  <div class="fb-modal-header">',
      '    <span class="fb-modal-icon" aria-hidden="true">💬</span>',
      '    <h2 class="fb-modal-title" id="fb-modal-title">Share Your Feedback</h2>',
      '    <button class="fb-close" id="fb-close" type="button" aria-label="Close feedback form">✕</button>',
      '  </div>',

      /* — Default form panel — */
      '  <div class="fb-panel" id="fb-panel-form">',
      '    <form id="fb-form" novalidate>',

      '      <div class="fb-field">',
      '        <label class="fb-label" for="fb-name">Name <span class="fb-required" aria-hidden="true">*</span></label>',
      '        <input class="fb-input" id="fb-name" name="name" type="text" placeholder="Your name" autocomplete="name" required />',
      '        <span class="fb-err" id="fb-name-err" role="alert"></span>',
      '      </div>',

      '      <div class="fb-field">',
      '        <label class="fb-label" for="fb-email">Email <span class="fb-required" aria-hidden="true">*</span></label>',
      '        <input class="fb-input" id="fb-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />',
      '        <span class="fb-err" id="fb-email-err" role="alert"></span>',
      '      </div>',

      '      <div class="fb-field">',
      '        <label class="fb-label" for="fb-type">Feedback Type <span class="fb-required" aria-hidden="true">*</span></label>',
      '        <select class="fb-input fb-select" id="fb-type" name="feedback_type" required>',
      '          <option value="" disabled selected>Select a type…</option>',
      '          <option value="bug">🐛 Bug / Error</option>',
      '          <option value="suggestion">💡 Suggestion</option>',
      '          <option value="content">📖 Content Issue</option>',
      '          <option value="praise">⭐ Praise</option>',
      '          <option value="other">📝 Other</option>',
      '        </select>',
      '        <span class="fb-err" id="fb-type-err" role="alert"></span>',
      '      </div>',

      '      <div class="fb-field">',
      '        <label class="fb-label" for="fb-message">Message <span class="fb-required" aria-hidden="true">*</span></label>',
      '        <textarea class="fb-input fb-textarea" id="fb-message" name="message" placeholder="Describe your feedback…" rows="4" required></textarea>',
      '        <span class="fb-err" id="fb-message-err" role="alert"></span>',
      '      </div>',

      '      <div class="fb-actions">',
      '        <button class="fb-cancel-btn" id="fb-cancel" type="button">Cancel</button>',
      '        <button class="fb-submit-btn" id="fb-submit" type="submit">Send Feedback</button>',
      '      </div>',

      '    </form>',
      '  </div>',

      /* — Loading panel — */
      '  <div class="fb-panel fb-panel-hidden" id="fb-panel-loading" aria-live="polite">',
      '    <div class="fb-spinner" aria-hidden="true"></div>',
      '    <p class="fb-status-text">Sending your feedback…</p>',
      '  </div>',

      /* — Success panel — */
      '  <div class="fb-panel fb-panel-hidden" id="fb-panel-success" aria-live="polite">',
      '    <div class="fb-status-icon fb-status-ok" aria-hidden="true">✓</div>',
      '    <p class="fb-status-text"><strong>Thank you!</strong></p>',
      '    <p class="fb-status-sub">Your feedback has been received. We appreciate you taking the time to help improve this course.</p>',
      '    <button class="fb-submit-btn" id="fb-done" type="button">Done</button>',
      '  </div>',

      /* — Error panel — */
      '  <div class="fb-panel fb-panel-hidden" id="fb-panel-error" aria-live="polite">',
      '    <div class="fb-status-icon fb-status-err" aria-hidden="true">✕</div>',
      '    <p class="fb-status-text"><strong>Something went wrong</strong></p>',
      '    <p class="fb-status-sub">We could not send your feedback. Please try again.</p>',
      '    <button class="fb-submit-btn" id="fb-retry" type="button">Try Again</button>',
      '  </div>',

      '</div>'
    ].join('\n');

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }
  }

  /* ----------------------------------------------------------
     PANEL SWITCHING
  ---------------------------------------------------------- */
  function _showPanel(id) {
    var ids = ['fb-panel-form', 'fb-panel-loading', 'fb-panel-success', 'fb-panel-error'];
    ids.forEach(function (pid) {
      var el = document.getElementById(pid);
      if (!el) return;
      if (pid === id) {
        el.classList.remove('fb-panel-hidden');
      } else {
        el.classList.add('fb-panel-hidden');
      }
    });
  }

  /* ----------------------------------------------------------
     MODAL OPEN / CLOSE
  ---------------------------------------------------------- */
  function _openModal() {
    var modal   = document.getElementById('fb-modal');
    var overlay = document.getElementById('fb-overlay');
    if (!modal || !overlay) return;

    _showPanel('fb-panel-form');
    _clearErrors();

    modal.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    modal.classList.add('fb-modal-open');
    overlay.classList.add('fb-overlay-open');

    // focus first input
    var first = modal.querySelector('input, select, textarea');
    if (first) setTimeout(function () { first.focus(); }, 60);

    document.body.style.overflow = 'hidden';
  }

  function _closeModal() {
    var modal   = document.getElementById('fb-modal');
    var overlay = document.getElementById('fb-overlay');
    if (!modal || !overlay) return;

    modal.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    modal.classList.remove('fb-modal-open');
    overlay.classList.remove('fb-overlay-open');

    document.body.style.overflow = '';

    // return focus to trigger button
    var btn = document.getElementById('fb-btn');
    if (btn) btn.focus();
  }

  /* ----------------------------------------------------------
     FORM VALIDATION
  ---------------------------------------------------------- */
  function _clearErrors() {
    ['fb-name-err', 'fb-email-err', 'fb-type-err', 'fb-message-err'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['fb-name', 'fb-email', 'fb-type', 'fb-message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('fb-input-err');
    });
  }

  function _setError(fieldId, errId, msg) {
    var field = document.getElementById(fieldId);
    var err   = document.getElementById(errId);
    if (field) field.classList.add('fb-input-err');
    if (err)   err.textContent = msg;
  }

  function _validate() {
    _clearErrors();
    var ok = true;

    var name    = (document.getElementById('fb-name')    || {}).value || '';
    var email   = (document.getElementById('fb-email')   || {}).value || '';
    var type    = (document.getElementById('fb-type')    || {}).value || '';
    var message = (document.getElementById('fb-message') || {}).value || '';

    if (!name.trim()) {
      _setError('fb-name', 'fb-name-err', 'Please enter your name.');
      ok = false;
    }

    if (!email.trim()) {
      _setError('fb-email', 'fb-email-err', 'Please enter your email address.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      _setError('fb-email', 'fb-email-err', 'Please enter a valid email address.');
      ok = false;
    }

    if (!type) {
      _setError('fb-type', 'fb-type-err', 'Please select a feedback type.');
      ok = false;
    }

    if (!message.trim()) {
      _setError('fb-message', 'fb-message-err', 'Please enter a message.');
      ok = false;
    } else if (message.trim().length < 10) {
      _setError('fb-message', 'fb-message-err', 'Message must be at least 10 characters.');
      ok = false;
    }

    return ok;
  }

  /* ----------------------------------------------------------
     SUBMISSION
  ---------------------------------------------------------- */
  function _submit() {
    if (!_validate()) return;

    var meta = _getMetadata();

    var params = new URLSearchParams();
    params.append('name',          (document.getElementById('fb-name')    || {}).value || '');
    params.append('email',         (document.getElementById('fb-email')   || {}).value || '');
    params.append('feedback_type', (document.getElementById('fb-type')    || {}).value || '');
    params.append('message',       (document.getElementById('fb-message') || {}).value || '');
    params.append('page_title',    meta.page_title);
    params.append('page_url',      meta.page_url);
    params.append('module_id',     meta.module_id);
    params.append('lesson_id',     meta.lesson_id);
    params.append('timestamp',     meta.timestamp);
    params.append('user_agent',    meta.user_agent);

    _showPanel('fb-panel-loading');

    fetch(ENDPOINT, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString()
    })
    .then(function () {
      // no-cors always resolves as opaque — treat as success
      _showPanel('fb-panel-success');
      // reset form for next use
      var form = document.getElementById('fb-form');
      if (form) form.reset();
    })
    .catch(function () {
      _showPanel('fb-panel-error');
    });
  }

  /* ----------------------------------------------------------
     KEYBOARD TRAP  (Tab / Shift+Tab inside modal)
  ---------------------------------------------------------- */
  function _trapFocus(e) {
    var modal = document.getElementById('fb-modal');
    if (!modal || !modal.classList.contains('fb-modal-open')) return;

    var focusable = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === 'Escape') { _closeModal(); }
  }

  /* ----------------------------------------------------------
     BIND EVENTS
  ---------------------------------------------------------- */
  function _bindEvents() {
    var btn     = document.getElementById('fb-btn');
    var close   = document.getElementById('fb-close');
    var cancel  = document.getElementById('fb-cancel');
    var form    = document.getElementById('fb-form');
    var overlay = document.getElementById('fb-overlay');
    var done    = document.getElementById('fb-done');
    var retry   = document.getElementById('fb-retry');

    if (btn)     btn.addEventListener('click', _openModal);
    if (close)   close.addEventListener('click', _closeModal);
    if (cancel)  cancel.addEventListener('click', _closeModal);
    if (overlay) overlay.addEventListener('click', _closeModal);
    if (done)    done.addEventListener('click', _closeModal);
    if (retry)   retry.addEventListener('click', function () { _showPanel('fb-panel-form'); });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        _submit();
      });
    }

    document.addEventListener('keydown', _trapFocus);
  }

  /* ----------------------------------------------------------
     BOOT
  ---------------------------------------------------------- */
  function _init() {
    _buildUI();
    _bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
