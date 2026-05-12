(function () {
  'use strict';

  var pageIn  = document.getElementById('page-in');
  var pageOut = document.getElementById('page-out');

  // Dot-Positionen direkt aus dem echten Grid lesen — garantierte Übereinstimmung.
  // Fallback: eigene Berechnung falls gridAPI noch nicht bereit ist.
  function buildDots(el) {
    var frag = document.createDocumentFragment();
    var api  = window.gridAPI;

    if (api && api.getRows() > 0) {
      var rows = api.getRows();
      var cols = api.getCols();
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var src = api.getDot(r, c);
          if (!src) continue;
          var d = document.createElement('div');
          d.className  = 'transition-dot';
          d.style.left = src.style.left;
          d.style.top  = src.style.top;
          frag.appendChild(d);
        }
      }
    } else {
      // Fallback: Positionen selbst berechnen (selbe Logik wie grid.js)
      var isMobile = window.innerWidth <= 900;
      var COLS     = isMobile ? 3  : 15;
      var ROWS     = isMobile ? 7  : 8;
      var BORDER   = isMobile ? 40 : 80;
      var BORDER_X = isMobile ? 56 : 80;
      var W = window.innerWidth;
      var H = window.innerHeight;
      for (var r2 = 0; r2 < ROWS; r2++) {
        for (var c2 = 0; c2 < COLS; c2++) {
          var d2 = document.createElement('div');
          d2.className  = 'transition-dot';
          d2.style.left = (BORDER_X + c2 * (W - 2 * BORDER_X) / Math.max(COLS - 1, 1)) + 'px';
          d2.style.top  = (BORDER   + r2 * (H - 2 * BORDER)   / Math.max(ROWS - 1, 1)) + 'px';
          frag.appendChild(d2);
        }
      }
    }

    el.appendChild(frag);
  }

  // page-in: nach DOMContentLoaded aufbauen, damit buildGrid() bereits gelaufen ist
  if (pageIn) {
    function initPageIn() {
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPageIn);
    } else {
      initPageIn();
    }
  }

  function go(url) {
    if (!pageOut || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.href = url;
      return;
    }
    // page-out: Grid ist hier garantiert aufgebaut
    if (!pageOut.hasChildNodes()) buildDots(pageOut);
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
