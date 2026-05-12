/**
 * ============================================================
 *  PUNKT-RASTER — grid.js
 * ============================================================
 *
 *  Drei vollständig getrennte Layer:
 *
 *  Layer 1 — Statisches Grid:
 *    Alle Punkte grau. Ruhezustand. buildGrid() erstellt das Grid.
 *    Jeder Punkt hat data-row / data-col und ist in dotGrid[r][c]
 *    gespeichert — so kann jeder einzelne Punkt gezielt angesprochen
 *    werden, ohne andere zu beeinflussen.
 *
 *  Layer 2 — Schritt-Navigation (01–05):
 *    Komplett separat in project-loader.js. Kennt das Grid nicht.
 *    Greift niemals auf dotGrid zu. Kein Code hier berührt die Nav.
 *
 *  Layer 3 — Grid-Effekte (Hover, Animationen):
 *    Spricht gezielt einzelne Punkte über Koordinaten an.
 *    updateHover() ist der aktive Effekt. Weitere Effekte können
 *    über window.gridAPI.setColor(row, col, farbe) hinzugefügt werden.
 *    Beeinflusst niemals die Schritt-Navigation.
 * ============================================================
 */

(function () {

  // === KONFIGURATION ==========================================

  const DESKTOP_COLS = 15;
  const DESKTOP_ROWS = 8;
  const MOBILE_COLS  = 3;
  const MOBILE_ROWS  = 7;

  const BORDER_DESKTOP   = 80;
  const BORDER_MOBILE    = 40;
  const BORDER_MOBILE_X  = 56;   // horizontaler Dot-Abstand auf Mobile (etwas weiter innen)
  const MOBILE_BREAK     = 900;

  const DOT_SIZE_BASE = 4;
  const DOT_SIZE_MAX  = 12;

  // Layer 3 — Hover-Effekt
  // HOVER_RADIUS skaliert mit der Viewport-Breite (ca. 11% → ~280px bei 2560px, ~165px bei 1512px)
  const HOVER_RADIUS_FACTOR = 280 / 2560;
  const HOVER_COLOR  = [34, 197, 94];   // Grün (nur für Layer-3-Effekte)

  // Layer 1 — Default-Farben (Ruhezustand)
  const COLOR_LIGHT    = [26, 26, 26];
  const COLOR_PROJECTS = [255, 255, 255];

  // === STATE =================================================

  // 2D-Array: dotGrid[row][col] → DOM-Element
  // Öffentlich über window.gridAPI zugänglich
  let dotGrid = [];

  // Mausposition für Layer-3-Effekte
  let mouseX = -9999;
  let mouseY = -9999;

  // Dynamischer Hover-Radius (wird bei buildGrid() aktualisiert)
  let hoverRadius = 280;

  // === HILFSFUNKTIONEN =======================================

  function getDefaultColor() {
    return document.body.classList.contains('projects-page')
      ? COLOR_PROJECTS : COLOR_LIGHT;
  }

  function lerpColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  // === LAYER 1: GRID AUFBAUEN ================================

  function buildGrid() {
    const container = document.getElementById('dot-grid');
    if (!container) return;
    container.innerHTML = '';
    dotGrid = [];

    const W = window.innerWidth;
    const H = window.innerHeight;

    const isMobile = (window.innerWidth <= MOBILE_BREAK);
    const cols    = isMobile ? MOBILE_COLS   : DESKTOP_COLS;
    const rows    = isMobile ? MOBILE_ROWS   : DESKTOP_ROWS;
    const border  = isMobile ? BORDER_MOBILE : BORDER_DESKTOP;
    const borderX = isMobile ? BORDER_MOBILE_X : BORDER_DESKTOP;

    const spacingX = (W - 2 * borderX) / (cols - 1);
    const spacingY = (H - 2 * border)  / (rows - 1);

    const dc  = getDefaultColor();
    const colStr = 'rgb(' + dc[0] + ',' + dc[1] + ',' + dc[2] + ')';
    const frag = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
      dotGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        const x = borderX + c * spacingX;
        const y = border  + r * spacingY;

        const el = document.createElement('div');
        el.className      = 'dot';
        el.dataset.row    = r;   // Koordinate row für externe Adressierung
        el.dataset.col    = c;   // Koordinate col für externe Adressierung
        el.style.left            = x + 'px';
        el.style.top             = y + 'px';
        el.style.width           = DOT_SIZE_BASE + 'px';
        el.style.height          = DOT_SIZE_BASE + 'px';
        el.style.backgroundColor = colStr;
        el._x = x;  // gecachte Position für Layer-3-Distanzberechnung
        el._y = y;

        frag.appendChild(el);
        dotGrid[r][c] = el;
      }
    }
    container.appendChild(frag);

    // Hover-Radius proportional zur Viewport-Breite aktualisieren
    hoverRadius = Math.round(W * HOVER_RADIUS_FACTOR);

    // CSS-Variable → Nav und Layout synchronisieren sich automatisch
    document.documentElement.style.setProperty('--border', border + 'px');

    // Nav-Zeilen: Höhe = border, an jeweiliger Viewport-Kante.
    // align-items:center zentriert Text exakt bei border/2.
    var navRows = document.querySelectorAll('.nav-row');
    if (navRows[0]) {
      navRows[0].style.top          = '0';
      navRows[0].style.bottom       = '';
      navRows[0].style.height       = border + 'px';
      navRows[0].style.transform    = '';
      navRows[0].style.paddingLeft  = borderX + 'px';
      navRows[0].style.paddingRight = borderX + 'px';
    }
    if (navRows[1]) {
      navRows[1].style.bottom       = '0';
      navRows[1].style.top          = '';
      navRows[1].style.height       = border + 'px';
      navRows[1].style.transform    = '';
      navRows[1].style.paddingLeft  = borderX + 'px';
      navRows[1].style.paddingRight = borderX + 'px';
    }
  }

  // === LAYER 3: HOVER-EFFEKT =================================
  // Färbt einzelne Grid-Punkte grün — basierend auf Mausnähe.
  // Hat keinerlei Kenntnis von der Schritt-Navigation.

  function updateHover() {
    const dc  = getDefaultColor();
    const now = Date.now();

    for (let r = 0; r < dotGrid.length; r++) {
      const row = dotGrid[r];
      for (let c = 0; c < row.length; c++) {
        const dot = row[c];
        const dx  = mouseX - dot._x;
        const dy  = mouseY - dot._y;
        const d   = Math.sqrt(dx * dx + dy * dy);

        if (d < hoverRadius) {
          const t      = 1 - d / hoverRadius;
          const wobble = 1 + Math.sin(now * 0.005 + r * 0.9 + c * 0.6) * 0.07 * t;
          const scale  = (DOT_SIZE_BASE + t * (DOT_SIZE_MAX - DOT_SIZE_BASE)) / DOT_SIZE_BASE * wobble;
          const col    = lerpColor(dc, HOVER_COLOR, t);
          dot.style.backgroundColor = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
          dot.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
        } else {
          dot.style.backgroundColor = 'rgb(' + dc[0] + ',' + dc[1] + ',' + dc[2] + ')';
          dot.style.transform = 'translate(-50%,-50%) scale(1)';
        }
      }
    }
    requestAnimationFrame(updateHover);
  }

  function onMouseMove(e) { mouseX = e.clientX; mouseY = e.clientY; }
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }
  function onTouchEnd() { mouseX = -9999; mouseY = -9999; }

  // === RESIZE ================================================

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 150);
  }

  // === ÖFFENTLICHE API =======================================
  //
  // Koordinatensystem wie ein Schachbrett / Excel:
  //   Spalten: A B C D E F G H I J K L M N O  (15 Spalten Desktop)
  //   Zeilen:  1 2 3 4 5 6 7 8                (8 Zeilen Desktop)
  //
  // Beispiele:
  //   window.gridAPI.hideDot('B', 3)      → Punkt B3 unsichtbar
  //   window.gridAPI.showDot('B', 3)      → Punkt B3 wieder sichtbar
  //   window.gridAPI.setColor('D', 5, '#22C55E') → Punkt D5 grün
  //   window.gridAPI.resetAll()           → alle Effekte zurücksetzen

  window.gridAPI = {

    // Koordinaten-Umrechnung: 'B' → 1,  3 → 2  (intern 0-basiert)
    _col: function (letter) { return letter.toUpperCase().charCodeAt(0) - 65; },
    _row: function (num)    { return num - 1; },

    getDot: function (row, col) {
      return (dotGrid[row] || [])[col] || null;
    },

    // Punkt ausblenden (Platz bleibt erhalten, Hover-Effekt pausiert)
    hideDot: function (colLetter, rowNum) {
      var dot = this.getDot(this._row(rowNum), this._col(colLetter));
      if (dot) dot.style.opacity = '0';
    },

    // Punkt wieder einblenden
    showDot: function (colLetter, rowNum) {
      var dot = this.getDot(this._row(rowNum), this._col(colLetter));
      if (dot) dot.style.opacity = '1';
    },

    // Farbe eines Punktes setzen
    setColor: function (colLetter, rowNum, color) {
      var dot = this.getDot(this._row(rowNum), this._col(colLetter));
      if (dot) dot.style.backgroundColor = color;
    },

    // Alle Slide-Effekte zurücksetzen (opacity + Farbe)
    resetAll: function () {
      var dc = getDefaultColor();
      var colStr = 'rgb(' + dc[0] + ',' + dc[1] + ',' + dc[2] + ')';
      for (var r = 0; r < dotGrid.length; r++) {
        for (var c = 0; c < (dotGrid[r] || []).length; c++) {
          var dot = dotGrid[r][c];
          if (dot) {
            dot.style.opacity         = '1';
            dot.style.backgroundColor = colStr;
            dot.style.transform       = 'translate(-50%,-50%) scale(1)';
          }
        }
      }
    },

    getRows: function () { return dotGrid.length; },
    getCols: function () { return dotGrid.length > 0 ? dotGrid[0].length : 0; }
  };

  // === INIT ==================================================

  function init() {
    buildGrid();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend',  onTouchEnd,  { passive: true });
    window.addEventListener('resize',    onResize);
    requestAnimationFrame(updateHover);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
