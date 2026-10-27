(function () {
  'use strict';

  /* Мобильное меню */
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');

  function setMenu(open) {
    if (!toggle || !links) return;
    links.setAttribute('data-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(links.getAttribute('data-open') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.getAttribute('data-open') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* Граница хедера при прокрутке */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Копирование email */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var status = document.getElementById(btn.getAttribute('aria-describedby'));
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var done = function (ok) {
        if (!status) return;
        status.textContent = ok ? 'Адрес скопирован' : 'Не получилось скопировать, адрес: ' + value;
        clearTimeout(btn._t);
        btn._t = setTimeout(function () { status.textContent = ''; }, 4000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = value;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          done(ok);
        } catch (err) { done(false); }
      }
    });
  });

  /* Оглавление кейса: подсветка текущего раздела и скрытие над широкими картинками */
  var toc = document.querySelector('.case-toc');
  if (toc) {
    var tocLinks = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var targets = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var media = Array.prototype.slice.call(document.querySelectorAll('.case-page .media, .case-cover'));
    var ticking = false;
    var updateToc = function () {
      ticking = false;
      var line = (header ? header.offsetHeight : 0) + 120;
      var current = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) current = i; });
      tocLinks.forEach(function (a, i) {
        if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      var box = toc.getBoundingClientRect();
      var overlap = media.some(function (m) {
        var r = m.getBoundingClientRect();
        return r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
      });
      toc.classList.toggle('is-hidden', overlap);
    };
    var requestToc = function () { if (!ticking) { ticking = true; requestAnimationFrame(updateToc); } };
    window.addEventListener('scroll', requestToc, { passive: true });
    window.addEventListener('resize', requestToc);
    updateToc();
  }

  /* Видео скролла: играет, только когда видно; при «уменьшить движение» не запускается */
  var videos = document.querySelectorAll('.media--video video');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (videos.length && !reduce && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { vio.observe(v); });
  } else {
    videos.forEach(function (v) { v.setAttribute('controls', ''); });
  }

  /* Ролик YouTube: плеер без cookie подгружается только по клику */
  document.querySelectorAll('.yt[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Видео';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  /* Год в футере */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
