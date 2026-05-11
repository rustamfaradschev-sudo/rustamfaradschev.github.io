(function () {
  'use strict';

  var isMobile = window.innerWidth <= 900;
  var COLS   = isMobile ? 3  : 15;
  var ROWS   = isMobile ? 7  : 8;
  var BORDER = isMobile ? 40 : 80;
  var W = window.innerWidth;
  var H = window.innerHeight;

  function buildDots(el) {
    var frag = document.createDocumentFragment();
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var d = document.createElement('div');
        d.className = 'transition-dot';
        d.style.left = (BORDER + c * (W - 2 * BORDER) / Math.max(COLS - 1, 1)) + 'px';
        d.style.top  = (BORDER + r * (H - 2 * BORDER) / Math.max(ROWS - 1, 1)) + 'px';
        frag.appendChild(d);
      }
    }
    el.appendChild(frag);
  }

  var pageIn  = document.getElementById('page-in');
  var pageOut = document.getElementById('page-out');

  if (pageIn) {
    buildDots(pageIn);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pageIn.style.opacity = '0';
        pageIn.addEventListener('transitionend', function () {
          pageIn.remove();
        }, { once: true });
      });
    });
  }

  if (pageOut) buildDots(pageOut);

  function go(url) {
    if (!pageOut || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.href = url;
      return;
    }
    pageOut.style.opacity = '1';
    pageOut.style.pointerEvents = 'all';
    setTimeout(function () { window.location.href = url; }, 800);
  }

  var nav = document.querySelector('nav');
  if (nav) {
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      go(href);
    });
  }
})();
