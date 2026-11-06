(function () {
  'use strict';

  var COUNTER_ID = 114093396;
  var CONSENT_KEY = 'polinavision_analytics_consent_v1';
  var panel = document.getElementById('analytics-consent');
  var settingsButton = document.getElementById('analytics-settings');
  var status = document.getElementById('analytics-status');
  var started = false;
  var returnFocusToSettings = false;

  function getChoice() {
    try { return window.localStorage.getItem(CONSENT_KEY); }
    catch (error) { return null; }
  }

  function setChoice(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); }
    catch (error) { /* Choice still applies for the current page. */ }
  }

  function openPanel() {
    if (!panel) return;
    panel.hidden = false;
    var rejectLink = panel.querySelector('[data-analytics-choice="reject"]');
    if (rejectLink) rejectLink.hidden = false;
    var acceptButton = panel.querySelector('[data-analytics-choice="accept"]');
    if (acceptButton) acceptButton.focus();
  }

  function startCounter() {
    if (started || getChoice() !== 'accepted') return;
    var host = window.location.hostname;
    if (host !== 'polinavision.site' && host !== 'www.polinavision.site') {
      if (status) status.textContent = 'В локальном предпросмотре счётчик не загружается.';
      return;
    }
    started = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < e.scripts.length; j++) {
        if (e.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER_ID, 'ym');

    window.ym(COUNTER_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: false,
      referrer: document.referrer,
      url: window.location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  if (settingsButton) settingsButton.addEventListener('click', function () {
    returnFocusToSettings = true;
    openPanel();
  });

  if (panel) {
    panel.querySelectorAll('[data-analytics-choice]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        if (button.tagName === 'A') event.preventDefault();
        var accepted = button.getAttribute('data-analytics-choice') === 'accept';
        setChoice(accepted ? 'accepted' : 'rejected');
        if (!accepted) window['disableYaCounter' + COUNTER_ID] = true;
        panel.hidden = true;
        if (accepted) startCounter();
        if (status) status.textContent = accepted ? 'Выбор сохранён.' : 'Аналитика отключена.';
        if (returnFocusToSettings && settingsButton) {
          try { settingsButton.focus({ preventScroll: true }); }
          catch (error) { settingsButton.focus(); }
        }
        returnFocusToSettings = false;
      });
    });
  }

  document.addEventListener('click', function (event) {
    if (getChoice() !== 'accepted' || typeof window.ym !== 'function') return;
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (link && (link.matches('.contact__link, .btn--tg') || link.closest('.contact__links'))) {
      window.ym(COUNTER_ID, 'reachGoal', 'contact_click');
    }
    if (target && target.closest && target.closest('[data-copy]')) {
      window.ym(COUNTER_ID, 'reachGoal', 'contact_click');
    }
    if (link && (link.matches('.btn--cv') || /cv-polina-galagan\.pdf(?:$|[?#])/i.test(link.href))) {
      window.ym(COUNTER_ID, 'reachGoal', 'resume_download');
    }
    if (link) {
      var caseMatch = link.href.match(/\/(rower-rent|brealit|taskee|nobetek)\.html(?:[?#]|$)/i);
      if (caseMatch) window.ym(COUNTER_ID, 'reachGoal', 'case_navigation', { case: caseMatch[1] });
    }
  }, true);

  var savedChoice = getChoice();
  if (savedChoice === 'accepted') startCounter();
  else if (!savedChoice && panel) {
    var rejectLink = panel.querySelector('[data-analytics-choice="reject"]');
    if (rejectLink) rejectLink.hidden = false;
    panel.hidden = false;
    var acceptButton = panel.querySelector('[data-analytics-choice="accept"]');
    if (acceptButton) acceptButton.focus();
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab' && panel && !panel.hidden) {
      var focusable = panel.querySelectorAll('a[href]:not([hidden]), button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
