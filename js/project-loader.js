/**
 * ============================================================
 *  PROJEKT-LOADER — project-loader.js
 * ============================================================
 *
 *  DIESE DATEI BITTE NICHT ÄNDERN.
 *
 *  Sie liest den URL-Parameter ?id=<slug> aus, sucht das
 *  passende Projekt in projects.js und baut die 5 Slides
 *  dynamisch auf. Neue Projekte tauchen automatisch auf,
 *  sobald sie in projects.js eingetragen sind.
 * ============================================================
 */

(function () {

  // -----------------------------------------------------------
  // 1. URL-Parameter lesen
  // -----------------------------------------------------------
  function getProjectSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  // -----------------------------------------------------------
  // 2. Projekt aus der globalen projects-Liste finden
  // -----------------------------------------------------------
  function findProject(slug) {
    if (typeof projects === 'undefined' || !Array.isArray(projects)) {
      console.error('projects.js nicht geladen oder projects ist kein Array.');
      return null;
    }
    return projects.find(function (p) { return p.slug === slug; }) || null;
  }

  // -----------------------------------------------------------
  // 3. Slide-Wechsel-Logik
  // -----------------------------------------------------------
  let currentSlide = 1;
  let TOTAL_SLIDES = 5;
  let currentSlug = '';

  // -----------------------------------------------------------
  // Scatter-Physics Engine
  // -----------------------------------------------------------
  var slideshowTimer = null;

  function startSlideshow(container) {
    if (slideshowTimer) return;
    var imgs = Array.prototype.slice.call(container.querySelectorAll('.slideshow-img'));
    if (!imgs.length) return;
    var interval = parseInt(container.dataset.interval) || 500;
    var cw = container.offsetWidth;
    var ch = container.offsetHeight;
    var imgW       = 420;
    var spacing    = 140;
    var totalWidth = (imgs.length - 1) * spacing + imgW;
    var padL       = (cw - totalWidth) / 2;

    // Pre-calculate random rotation + vertical offset per image (stable within cycle)
    var poses = imgs.map(function (img, i) {
      var rot = (Math.random() - 0.5) * 20;
      var dy  = (Math.random() - 0.5) * 160;
      var x   = padL + i * spacing;
      var y   = (ch - imgW) / 2 + dy;
      img.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + imgW + 'px;opacity:0;transform:rotate(' + rot + 'deg);';
      return { rot: rot, dy: dy, x: x, y: y };
    });

    var phase = 'build';
    var idx   = 0;

    slideshowTimer = setInterval(function () {
      if (phase === 'build') {
        imgs[idx].style.opacity = '1';
        idx++;
        if (idx >= imgs.length) { phase = 'remove'; idx = imgs.length - 1; }
      } else {
        imgs[idx].style.opacity = '0';
        idx--;
        if (idx < 0) {
          // Neue zufällige Positionen für nächsten Durchlauf
          imgs.forEach(function (img, i) {
            var rot = (Math.random() - 0.5) * 20;
            var dy  = (Math.random() - 0.5) * 160;
            img.style.left      = (padL + i * spacing) + 'px';
            img.style.top       = ((ch - imgW) / 2 + dy) + 'px';
            img.style.transform = 'rotate(' + rot + 'deg)';
          });
          phase = 'build'; idx = 0;
        }
      }
    }, interval);
  }

  function stopSlideshow() {
    if (!slideshowTimer) return;
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }

  var scatterRAF = null;
  var imgshowAutoTimer = null;

  function stopImgshowAuto() {
    if (!imgshowAutoTimer) return;
    clearInterval(imgshowAutoTimer);
    imgshowAutoTimer = null;
  }

  function startImgshowAuto(section) {
    stopImgshowAuto();
    if (window.innerWidth > 900) return;
    var imgs = section.querySelectorAll('.imgshow-img');
    if (!imgs.length) return;
    var idx = 0;
    imgshowAutoTimer = setInterval(function () {
      imgs[idx].classList.remove('active');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('active');
    }, 1000);
  }

  function startScatter(container) {
    if (scatterRAF) return;

    var items = Array.prototype.slice.call(container.querySelectorAll('.scatter-img'));
    var mouse = { x: -9999, y: -9999 };
    var physics = items.map(function (el) {
      var w = el.offsetWidth || 160;
      var h = el.offsetHeight || 120;
      return {
        el: el,
        x: parseFloat(el.style.left) || 0,
        y: parseFloat(el.style.top)  || 0,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        w: w,
        h: h
      };
    });

    function onMove(e) {
      var rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999; }
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    function tick() {
      scatterRAF = requestAnimationFrame(tick);
      var cw = container.offsetWidth;
      var ch = container.offsetHeight;
      var REPEL_R = 180;
      var REPEL_F = 10;
      var DAMP    = 0.97;
      var MAX_V   = 5;

      // Brownian drift
      physics.forEach(function (p) {
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.08;
      });

      // Mouse repulsion
      physics.forEach(function (p) {
        var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        var dx = cx - mouse.x,   dy = cy - mouse.y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < REPEL_R && d > 0) {
          var f = ((REPEL_R - d) / REPEL_R) * REPEL_F;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      });

      // Inter-image collisions
      for (var i = 0; i < physics.length; i++) {
        for (var j = i + 1; j < physics.length; j++) {
          var a = physics[i], b = physics[j];
          var dx = (b.x + b.w / 2) - (a.x + a.w / 2);
          var dy = (b.y + b.h / 2) - (a.y + a.h / 2);
          var d  = Math.sqrt(dx * dx + dy * dy);
          var minD = (a.w + b.w) * 0.45;
          if (d < minD && d > 0) {
            var push = ((minD - d) / minD) * 0.4;
            var nx = dx / d, ny = dy / d;
            a.vx -= nx * push; a.vy -= ny * push;
            b.vx += nx * push; b.vy += ny * push;
          }
        }
      }

      // Integrate + wall bounce
      physics.forEach(function (p) {
        var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_V) { p.vx = (p.vx / spd) * MAX_V; p.vy = (p.vy / spd) * MAX_V; }
        p.vx *= DAMP; p.vy *= DAMP;
        p.x += p.vx;  p.y += p.vy;
        if (p.x < 0)        { p.x = 0;        p.vx *= -0.6; }
        if (p.y < 0)        { p.y = 0;        p.vy *= -0.6; }
        if (p.x + p.w > cw) { p.x = cw - p.w; p.vx *= -0.6; }
        if (p.y + p.h > ch) { p.y = ch - p.h; p.vy *= -0.6; }
        p.el.style.left = p.x + 'px';
        p.el.style.top  = p.y + 'px';
      });
    }

    tick();

    container._scatterCleanup = function () {
      cancelAnimationFrame(scatterRAF);
      scatterRAF = null;
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }

  function stopScatter() {
    if (!scatterRAF) return;
    cancelAnimationFrame(scatterRAF);
    scatterRAF = null;
    var c = document.querySelector('.slide-scatter');
    if (c && c._scatterCleanup) c._scatterCleanup();
  }

  // -----------------------------------------------------------
  // Grid-Effekte pro Projekt und Slide
  // Koordinatensystem: Spalten A–O, Zeilen 1–8
  // Beispiel: gridAPI.hideDot('B', 3) → Punkt in Spalte B, Zeile 3
  // -----------------------------------------------------------
  const SLIDE_EFFECTS = {
    'forest-souvenirs': {
      2: function () {
        if (window.gridAPI) window.gridAPI.hideDot('B', 3);
      },
      5: function () {
        document.body.classList.add('slide-fullframe');
        if (!window.gridAPI) return;
        // Step-Nav A1–E1, Eck-Nav O1 (ABOUT), A8 (PROJECTS), O8 (CONTACT)
        var linkDots = [
          ['A', 1], ['B', 1], ['C', 1], ['D', 1], ['E', 1],
          ['O', 1],
          ['A', 8], ['O', 8]
        ];
        linkDots.forEach(function (d) {
          var dot = window.gridAPI.getDot(
            window.gridAPI._row(d[1]),
            window.gridAPI._col(d[0])
          );
          if (dot) dot.classList.add('dot-link');
        });
      }
    }
  };

  function applyGridEffects(slug, slideNum) {
    document.body.classList.remove('slide-fullframe');
    document.querySelectorAll('.dot-link').forEach(function (d) { d.classList.remove('dot-link'); });
    if (window.gridAPI) window.gridAPI.resetAll();

    // Auf Mobile: Top-Row-Dots nach resetAll() wieder verstecken
    if (window.innerWidth <= 900 && window.gridAPI) {
      var mCols = window.gridAPI.getCols();
      for (var mc = 0; mc < mCols; mc++) {
        var md = window.gridAPI.getDot(0, mc);
        if (md) md.style.opacity = '0';
      }
    }

    var effects = SLIDE_EFFECTS[slug];
    if (effects && effects[slideNum]) effects[slideNum]();
  }

  function goToSlide(n) {
    if (n < 1 || n > TOTAL_SLIDES) return;

    stopScatter();
    stopSlideshow();
    stopImgshowAuto();

    const oldSlide = document.querySelector('.slide.active');
    if (oldSlide) oldSlide.classList.remove('active');

    const newSlide = document.getElementById('slide-' + n);
    if (newSlide) {
      newSlide.classList.add('active');
      if (newSlide.classList.contains('slide-scatter')) {
        setTimeout(function () { startScatter(newSlide); }, 50);
      }
      if (newSlide.classList.contains('slide-slideshow')) {
        startSlideshow(newSlide);
      }
      if (newSlide.classList.contains('slide-imgshow')) {
        startImgshowAuto(newSlide);
      }
    }

    updateGridPagination(n);

    // Grid-Effekte für diesen Slide anwenden (Layer 3, getrennt vom Grid)
    applyGridEffects(currentSlug, n);

    currentSlide = n;
  }

  // -----------------------------------------------------------
  // 4. HTML für die Slides generieren
  // -----------------------------------------------------------
  function buildSlides(project) {
    const w = document.getElementById('slides-wrapper');
    if (!w) return;

    function imgTag(src, alt, cssClass) {
      return `<img src="${src}" alt="${alt}" class="${cssClass || ''}" onerror="this.style.opacity='0.3'">`;
    }

    function getImages(entry) {
      return Array.isArray(entry) ? entry : [entry];
    }

    const descFull = project.description.trim();

    // --- Slide 1: Bilder links (gestapelt), Text rechts ---
    const s1imgs = getImages(project.slides[0]);
    const slide1 = `
      <section id="slide-1" class="slide slide-1-split active" data-project="${project.slug}">
        <div class="slide-1-left">
          ${s1imgs.map(function (src) { return imgTag(src, project.title, 'slide1-img'); }).join('')}
        </div>
        <div class="slide-1-right">
          <div class="slide1-title-row">
            <h1 class="project-title-large">${project.title}</h1>
            <span class="project-year">${project.year}</span>
          </div>
          <p class="project-description slide1-desc">${descFull.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}</p>
        </div>
      </section>`;

    // --- Slides 2+: zentriert (einzeln), nebeneinander (Array) oder Layout-Objekt ---
    const otherSlides = project.slides.slice(1).map(function (entry, i) {
      var num = i + 2;

      // Layout-Objekt: { src, layout }
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        var desc0 = project.description.trim().split(/\n\n+/)[0].replace(/\n/g, '<br>');
        if (entry.layout === 'image-left') {
          return `
        <section id="slide-${num}" class="slide">
          <div class="slide-image-left">
            ${imgTag(entry.src, project.title, '')}
          </div>
          <div class="slide-text-right">
            <p class="project-description">${desc0}</p>
          </div>
        </section>`;
        }
        if (entry.layout === 'imageshow') {
          var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.02 69.54" aria-hidden="true"><circle cx="66.99" cy="2.3" r="2.3"/><circle cx="72.4" cy="2.3" r="2.3"/><circle cx="56.17" cy="7.71" r="2.3"/><circle cx="61.58" cy="7.71" r="2.3"/><circle cx="66.99" cy="7.71" r="2.3"/><circle cx="72.4" cy="7.71" r="2.3"/><circle cx="61.58" cy="13.12" r="2.3"/><circle cx="66.99" cy="13.12" r="2.3"/><circle cx="72.4" cy="13.12" r="2.3"/><circle cx="77.81" cy="13.12" r="2.3"/><circle cx="66.99" cy="18.54" r="2.3"/><circle cx="72.4" cy="18.54" r="2.3"/><circle cx="77.81" cy="18.54" r="2.3"/><circle cx="72.4" cy="23.95" r="2.3"/><circle cx="77.81" cy="23.95" r="2.3"/><circle cx="83.22" cy="23.95" r="2.3"/><circle cx="88.63" cy="23.95" r="2.3"/><circle cx="2.3" cy="29.36" r="2.3"/><circle cx="7.71" cy="29.36" r="2.3"/><circle cx="13.12" cy="29.36" r="2.3"/><circle cx="18.54" cy="29.36" r="2.3"/><circle cx="23.71" cy="29.36" r="2.3"/><circle cx="29.12" cy="29.36" r="2.3"/><circle cx="34.53" cy="29.36" r="2.3"/><circle cx="39.94" cy="29.36" r="2.3"/><circle cx="45.35" cy="29.36" r="2.3"/><circle cx="50.76" cy="29.36" r="2.3"/><circle cx="56.17" cy="29.36" r="2.3"/><circle cx="61.58" cy="29.36" r="2.3"/><circle cx="66.99" cy="29.36" r="2.3"/><circle cx="72.4" cy="29.36" r="2.3"/><circle cx="77.81" cy="29.36" r="2.3"/><circle cx="83.22" cy="29.36" r="2.3"/><circle cx="88.63" cy="29.36" r="2.3"/><circle cx="94.05" cy="29.36" r="2.3"/><circle cx="99.46" cy="29.36" r="2.3"/><circle cx="2.3" cy="34.77" r="2.3"/><circle cx="7.71" cy="34.77" r="2.3"/><circle cx="13.12" cy="34.77" r="2.3"/><circle cx="18.54" cy="34.77" r="2.3"/><circle cx="23.71" cy="34.77" r="2.3"/><circle cx="29.12" cy="34.77" r="2.3"/><circle cx="34.53" cy="34.77" r="2.3"/><circle cx="39.94" cy="34.77" r="2.3"/><circle cx="45.35" cy="34.77" r="2.3"/><circle cx="50.76" cy="34.77" r="2.3"/><circle cx="56.17" cy="34.77" r="2.3"/><circle cx="61.58" cy="34.77" r="2.3"/><circle cx="66.99" cy="34.77" r="2.3"/><circle cx="72.4" cy="34.77" r="2.3"/><circle cx="77.81" cy="34.77" r="2.3"/><circle cx="83.22" cy="34.77" r="2.3"/><circle cx="88.63" cy="34.77" r="2.3"/><circle cx="94.05" cy="34.77" r="2.3"/><circle cx="99.46" cy="34.77" r="2.3"/><circle cx="104.72" cy="34.77" r="2.3"/><circle cx="2.3" cy="40.18" r="2.3"/><circle cx="7.71" cy="40.18" r="2.3"/><circle cx="13.12" cy="40.18" r="2.3"/><circle cx="18.54" cy="40.18" r="2.3"/><circle cx="23.71" cy="40.18" r="2.3"/><circle cx="29.12" cy="40.18" r="2.3"/><circle cx="34.53" cy="40.18" r="2.3"/><circle cx="39.94" cy="40.18" r="2.3"/><circle cx="45.35" cy="40.18" r="2.3"/><circle cx="50.76" cy="40.18" r="2.3"/><circle cx="56.17" cy="40.18" r="2.3"/><circle cx="61.58" cy="40.18" r="2.3"/><circle cx="66.99" cy="40.18" r="2.3"/><circle cx="72.4" cy="40.18" r="2.3"/><circle cx="77.81" cy="40.18" r="2.3"/><circle cx="83.22" cy="40.18" r="2.3"/><circle cx="88.63" cy="40.18" r="2.3"/><circle cx="94.05" cy="40.18" r="2.3"/><circle cx="99.46" cy="40.18" r="2.3"/><circle cx="72.4" cy="45.59" r="2.3"/><circle cx="77.81" cy="45.59" r="2.3"/><circle cx="83.22" cy="45.59" r="2.3"/><circle cx="88.63" cy="45.59" r="2.3"/><circle cx="66.99" cy="51" r="2.3"/><circle cx="72.4" cy="51" r="2.3"/><circle cx="77.81" cy="51" r="2.3"/><circle cx="56.17" cy="56.41" r="2.3"/><circle cx="61.58" cy="56.41" r="2.3"/><circle cx="66.99" cy="56.41" r="2.3"/><circle cx="72.4" cy="56.41" r="2.3"/><circle cx="77.81" cy="56.41" r="2.3"/><circle cx="56.17" cy="61.82" r="2.3"/><circle cx="61.58" cy="61.82" r="2.3"/><circle cx="66.99" cy="61.82" r="2.3"/><circle cx="72.4" cy="61.82" r="2.3"/><circle cx="66.99" cy="67.23" r="2.3"/><circle cx="72.4" cy="67.23" r="2.3"/></svg>';
          var hasCaptions = entry.captions && entry.captions.some(Boolean);
          var isImgs = entry.images.map(function (src, i) {
            var caption = entry.captions && entry.captions[i];
            var captionHtml = hasCaptions
              ? `<span class="imgshow-caption${i === 0 ? ' active' : ''}">${caption || ''}</span>`
              : '';
            return `<img src="${src}" alt="${project.title}" class="imgshow-img${i === 0 ? ' active' : ''}" onerror="this.style.opacity='0.2'">${captionHtml}`;
          }).join('');
          return `
        <section id="slide-${num}" class="slide slide-imgshow">
          <button class="imgshow-btn imgshow-prev" aria-label="Vorheriges Bild">${arrowSvg}</button>
          <div class="imgshow-display">${isImgs}</div>
          <button class="imgshow-btn imgshow-next" aria-label="Nächstes Bild">${arrowSvg}</button>
        </section>`;
        }
        if (entry.layout === 'table') {
          var isMobileTable = window.innerWidth <= 900;
          if (isMobileTable) {
            var tableImgs = entry.images.map(function (src) {
              var rot = (Math.random() - 0.5) * 18;
              return `<img src="${src}" alt="${project.title}" class="table-img"
                style="transform:rotate(${rot}deg);"
                onerror="this.style.opacity='0.2'">`;
            }).join('');
            return `
        <section id="slide-${num}" class="slide slide-table-static">
          ${tableImgs}
        </section>`;
          }
          var tImgW = 300;
          var tImgH = 240;
          var tcw = window.innerWidth;
          var tch = window.innerHeight;
          var tableImgs = entry.images.map(function (src) {
            var tx  = -20 + Math.random() * Math.max(0, tcw - tImgW + 40);
            var ty  = -20 + Math.random() * Math.max(0, tch - tImgH + 40);
            var rot = (Math.random() - 0.5) * 18;
            return `<img src="${src}" alt="${project.title}" class="table-img"
              style="left:${tx}px;top:${ty}px;width:${tImgW}px;transform:rotate(${rot}deg);"
              onerror="this.style.opacity='0.2'">`;
          }).join('');
          return `
        <section id="slide-${num}" class="slide slide-table">
          ${tableImgs}
        </section>`;
        }
        if (entry.layout === 'scatter') {
          var isMobileScatter = window.innerWidth <= 900;
          var imgSize = isMobileScatter ? 130 : 160;
          var cw = window.innerWidth  - 160;
          var ch = window.innerHeight - 160;
          var scatterImgs = entry.images.map(function (src) {
            if (isMobileScatter) {
              var rot = (Math.random() - 0.5) * 14;
              return `<img src="${src}" alt="${project.title}" class="scatter-img"
                style="transform:rotate(${rot}deg);"
                onerror="this.style.opacity='0.2'">`;
            }
            var rx = Math.random() * Math.max(0, cw - imgSize);
            var ry = Math.random() * Math.max(0, ch - imgSize);
            return `<img src="${src}" alt="${project.title}" class="scatter-img"
              style="left:${rx}px;top:${ry}px;width:${imgSize}px;"
              onerror="this.style.opacity='0.2'">`;
          }).join('');
          var sectionClass = isMobileScatter ? 'slide slide-scatter-static' : 'slide slide-scatter';
          return `
        <section id="slide-${num}" class="${sectionClass}">
          ${scatterImgs}
        </section>`;
        }
        if (entry.layout === 'stack-right') {
          var leftImgs = (entry.leftImages || []).map(function (src, i) {
            var caption = entry.leftCaptions && entry.leftCaptions[i];
            var captionHtml = caption ? `<span class="sr-left-caption">${caption}</span>` : '';
            return imgTag(src, project.title, 'sr-left-img') + captionHtml;
          }).join('');
          return `
        <section id="slide-${num}" class="slide slide-stack-right">
          <div class="sr-left">
            ${leftImgs}
          </div>
          <div class="sr-right">
            ${imgTag(entry.src, project.title, 'sr-right-img')}
          </div>
        </section>`;
        }
        if (entry.layout === 'image-right') {
          var leftContent = entry.leftImage
            ? `<p class="project-description">${desc0}</p>${imgTag(entry.leftImage, project.title, 'sir-left-img')}`
            : `<p class="project-description">${desc0}</p>`;
          return `
        <section id="slide-${num}" class="slide">
          <div class="sir-text">
            ${leftContent}
          </div>
          <div class="sir-image">
            ${imgTag(entry.src, project.title, 'sir-img')}
          </div>
        </section>`;
        }
      }

      var srcs = getImages(entry);
      if (srcs.length > 1) {
        return `
        <section id="slide-${num}" class="slide slide-dual">
          ${srcs.map(function (src) { return `<div class="slide-panel">${imgTag(src, project.title, 'slide-panel-img')}</div>`; }).join('')}
        </section>`;
      }
      return `
        <section id="slide-${num}" class="slide slide-centered">
          ${imgTag(srcs[0], project.title, 'slide-centered-img')}
        </section>`;
    }).join('');

    w.innerHTML = slide1 + otherSlides;
    w.querySelectorAll('.slide').forEach(function (s) { s.dataset.project = project.slug; });

    // Imageshow: Pfeil-Navigation initialisieren
    w.querySelectorAll('.slide-imgshow').forEach(function (section) {
      var imgs     = section.querySelectorAll('.imgshow-img');
      var captions = section.querySelectorAll('.imgshow-caption');
      var idx  = 0;
      function show(i) {
        imgs[idx].classList.remove('active');
        if (captions[idx]) captions[idx].classList.remove('active');
        idx = (i + imgs.length) % imgs.length;
        imgs[idx].classList.add('active');
        if (captions[idx]) captions[idx].classList.add('active');
      }
      section.querySelector('.imgshow-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
      section.querySelector('.imgshow-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    });
  }

  // -----------------------------------------------------------
  // 5. Grid-Step-Navigation aufbauen
  //    Zahlen 1–5 rechts neben den Dots A1–E1 (erste Zeile).
  //    Aktiver Step: grüner Kreis um den Dot + grüne Zahl.
  //    Nur genau ein Step ist aktiv.
  // -----------------------------------------------------------

  // Referenzen auf erstellte Elemente (für Updates bei Slide-Wechsel)
  var gridStepLabels = [];
  var gridStepRings  = [];

  function buildGridPagination() {
    // Klassische Pagination verstecken
    var oldPag = document.getElementById('pagination');
    if (oldPag) oldPag.style.display = 'none';

    // Bestehende Step-Elemente entfernen (z. B. bei Resize-Rebuild)
    document.querySelectorAll('.grid-step-label, .grid-step-ring').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });
    gridStepLabels = [];
    gridStepRings  = [];

    // Grid-Metriken aus CSS-Variable und gridAPI lesen
    var border   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--border'), 10) || 80;
    var cols     = (window.gridAPI && window.gridAPI.getCols()) || 15;
    var spacingX = (window.innerWidth - 2 * border) / (cols - 1);
    var dotY     = border; // Dots der ersten Zeile sitzen bei y = border
    var isMobile = window.innerWidth <= 900;

    for (var i = 0; i < TOTAL_SLIDES; i++) {
      var dotX    = isMobile
        ? border + (i / (TOTAL_SLIDES - 1)) * (window.innerWidth - 2 * border)
        : border + i * spacingX;
      var isFirst = (i === 0);

      // --- Label rechts vom Dot (Desktop) / zentriert (Mobile) ---
      var label = document.createElement('span');
      label.className       = 'grid-step-label' + (isFirst ? ' active' : '');
      label.textContent     = String(i + 1).padStart(2, '0');
      label.dataset.slide   = String(i + 1);
      label.style.left      = (dotX + (isMobile ? -14 : 14)) + 'px';
      label.style.top       = dotY + 'px';

      // Klick → Slide wechseln.
      // stopPropagation verhindert dass initClickAreas denselben Klick
      // nochmals als "linker Seitenbereich" interpretiert und goToSlide
      // mit dem falschen Index aufruft.
      (function (slideNum) {
        label.addEventListener('click', function (e) {
          e.stopPropagation();
          goToSlide(slideNum);
        });
      })(i + 1);

      document.body.appendChild(label);
      gridStepLabels.push(label);

      // --- Grüner Kreis um den Dot (nur Desktop) ---
      if (!isMobile) {
        var ring = document.createElement('div');
        ring.className           = 'grid-step-ring' + (isFirst ? ' active' : '');
        ring.style.left          = dotX + 'px';
        ring.style.top           = dotY + 'px';
        ring.style.pointerEvents = 'all';
        ring.style.cursor        = 'pointer';

        (function (slideNum) {
          ring.addEventListener('click', function (e) {
            e.stopPropagation();
            goToSlide(slideNum);
          });
        })(i + 1);

        document.body.appendChild(ring);
        gridStepRings.push(ring);
      }
    }

    // Auf Mobile: Top-Row-Dots verstecken (kollidieren mit Label-Positionen)
    if (isMobile && window.gridAPI) {
      var totalCols = window.gridAPI.getCols();
      for (var c = 0; c < totalCols; c++) {
        var d = window.gridAPI.getDot(0, c);
        if (d) d.style.opacity = '0';
      }
    }
  }

  // Aktiven Step aktualisieren — genau einer ist grün, alle anderen neutral
  function updateGridPagination(n) {
    gridStepLabels.forEach(function (label, i) {
      label.classList.toggle('active', i === n - 1);
    });
    gridStepRings.forEach(function (ring, i) {
      ring.classList.toggle('active', i === n - 1);
    });
  }

  // Bei Fenster-Resize: Step-Elemente neu positionieren
  var stepResizeTimer;
  function onStepResize() {
    clearTimeout(stepResizeTimer);
    stepResizeTimer = setTimeout(function () {
      buildGridPagination();
      updateGridPagination(currentSlide);
    }, 200);
  }

  // -----------------------------------------------------------
  // 6. Breadcrumb-Titel in der Navigation setzen
  // -----------------------------------------------------------
  function setNavTitle(project) {
    const el = document.getElementById('nav-project-title');
    if (el) {
      el.textContent = project.title + ' ' + project.year;
    }
  }

  // -----------------------------------------------------------
  // 7. Tastatur-Navigation (← →)
  // -----------------------------------------------------------
  function initKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToSlide(currentSlide - 1);
      }
    });
  }

  // -----------------------------------------------------------
  // 8a. Touch-Swipe-Navigation (Mobile)
  // -----------------------------------------------------------
  function initSwipe() {
    var startX = 0, startY = 0;
    document.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) { goToSlide(currentSlide + 1); }
      else        { goToSlide(currentSlide - 1); }
    }, { passive: true });
  }

  // -----------------------------------------------------------
  // 8b. Visuelle Pfeil-Buttons (Desktop) für Slide-Navigation
  // -----------------------------------------------------------
  var arrowSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.02 69.54" aria-hidden="true"><circle cx="66.99" cy="2.3" r="2.3"/><circle cx="72.4" cy="2.3" r="2.3"/><circle cx="56.17" cy="7.71" r="2.3"/><circle cx="61.58" cy="7.71" r="2.3"/><circle cx="66.99" cy="7.71" r="2.3"/><circle cx="72.4" cy="7.71" r="2.3"/><circle cx="61.58" cy="13.12" r="2.3"/><circle cx="66.99" cy="13.12" r="2.3"/><circle cx="72.4" cy="13.12" r="2.3"/><circle cx="77.81" cy="13.12" r="2.3"/><circle cx="66.99" cy="18.54" r="2.3"/><circle cx="72.4" cy="18.54" r="2.3"/><circle cx="77.81" cy="18.54" r="2.3"/><circle cx="72.4" cy="23.95" r="2.3"/><circle cx="77.81" cy="23.95" r="2.3"/><circle cx="83.22" cy="23.95" r="2.3"/><circle cx="88.63" cy="23.95" r="2.3"/><circle cx="2.3" cy="29.36" r="2.3"/><circle cx="7.71" cy="29.36" r="2.3"/><circle cx="13.12" cy="29.36" r="2.3"/><circle cx="18.54" cy="29.36" r="2.3"/><circle cx="23.71" cy="29.36" r="2.3"/><circle cx="29.12" cy="29.36" r="2.3"/><circle cx="34.53" cy="29.36" r="2.3"/><circle cx="39.94" cy="29.36" r="2.3"/><circle cx="45.35" cy="29.36" r="2.3"/><circle cx="50.76" cy="29.36" r="2.3"/><circle cx="56.17" cy="29.36" r="2.3"/><circle cx="61.58" cy="29.36" r="2.3"/><circle cx="66.99" cy="29.36" r="2.3"/><circle cx="72.4" cy="29.36" r="2.3"/><circle cx="77.81" cy="29.36" r="2.3"/><circle cx="83.22" cy="29.36" r="2.3"/><circle cx="88.63" cy="29.36" r="2.3"/><circle cx="94.05" cy="29.36" r="2.3"/><circle cx="99.46" cy="29.36" r="2.3"/><circle cx="2.3" cy="34.77" r="2.3"/><circle cx="7.71" cy="34.77" r="2.3"/><circle cx="13.12" cy="34.77" r="2.3"/><circle cx="18.54" cy="34.77" r="2.3"/><circle cx="23.71" cy="34.77" r="2.3"/><circle cx="29.12" cy="34.77" r="2.3"/><circle cx="34.53" cy="34.77" r="2.3"/><circle cx="39.94" cy="34.77" r="2.3"/><circle cx="45.35" cy="34.77" r="2.3"/><circle cx="50.76" cy="34.77" r="2.3"/><circle cx="56.17" cy="34.77" r="2.3"/><circle cx="61.58" cy="34.77" r="2.3"/><circle cx="66.99" cy="34.77" r="2.3"/><circle cx="72.4" cy="34.77" r="2.3"/><circle cx="77.81" cy="34.77" r="2.3"/><circle cx="83.22" cy="34.77" r="2.3"/><circle cx="88.63" cy="34.77" r="2.3"/><circle cx="94.05" cy="34.77" r="2.3"/><circle cx="99.46" cy="34.77" r="2.3"/><circle cx="104.72" cy="34.77" r="2.3"/><circle cx="2.3" cy="40.18" r="2.3"/><circle cx="7.71" cy="40.18" r="2.3"/><circle cx="13.12" cy="40.18" r="2.3"/><circle cx="18.54" cy="40.18" r="2.3"/><circle cx="23.71" cy="40.18" r="2.3"/><circle cx="29.12" cy="40.18" r="2.3"/><circle cx="34.53" cy="40.18" r="2.3"/><circle cx="39.94" cy="40.18" r="2.3"/><circle cx="45.35" cy="40.18" r="2.3"/><circle cx="50.76" cy="40.18" r="2.3"/><circle cx="56.17" cy="40.18" r="2.3"/><circle cx="61.58" cy="40.18" r="2.3"/><circle cx="66.99" cy="40.18" r="2.3"/><circle cx="72.4" cy="40.18" r="2.3"/><circle cx="77.81" cy="40.18" r="2.3"/><circle cx="83.22" cy="40.18" r="2.3"/><circle cx="88.63" cy="40.18" r="2.3"/><circle cx="94.05" cy="40.18" r="2.3"/><circle cx="99.46" cy="40.18" r="2.3"/><circle cx="72.4" cy="45.59" r="2.3"/><circle cx="77.81" cy="45.59" r="2.3"/><circle cx="83.22" cy="45.59" r="2.3"/><circle cx="88.63" cy="45.59" r="2.3"/><circle cx="66.99" cy="51" r="2.3"/><circle cx="72.4" cy="51" r="2.3"/><circle cx="77.81" cy="51" r="2.3"/><circle cx="56.17" cy="56.41" r="2.3"/><circle cx="61.58" cy="56.41" r="2.3"/><circle cx="66.99" cy="56.41" r="2.3"/><circle cx="72.4" cy="56.41" r="2.3"/><circle cx="77.81" cy="56.41" r="2.3"/><circle cx="56.17" cy="61.82" r="2.3"/><circle cx="61.58" cy="61.82" r="2.3"/><circle cx="66.99" cy="61.82" r="2.3"/><circle cx="72.4" cy="61.82" r="2.3"/><circle cx="66.99" cy="67.23" r="2.3"/><circle cx="72.4" cy="67.23" r="2.3"/></svg>';

  function buildNavArrows() {
    var prev = document.createElement('button');
    prev.className = 'slide-nav-arrow slide-nav-prev';
    prev.setAttribute('aria-label', 'Vorheriger Slide');
    prev.innerHTML = arrowSvgStr;
    prev.addEventListener('click', function (e) {
      e.stopPropagation();
      goToSlide(currentSlide - 1);
    });

    var next = document.createElement('button');
    next.className = 'slide-nav-arrow slide-nav-next';
    next.setAttribute('aria-label', 'Nächster Slide');
    next.innerHTML = arrowSvgStr;
    next.addEventListener('click', function (e) {
      e.stopPropagation();
      goToSlide(currentSlide + 1);
    });

    document.body.appendChild(prev);
    document.body.appendChild(next);
  }

  // -----------------------------------------------------------
  // 9. Fehlerseite anzeigen
  // -----------------------------------------------------------
  function showError(msg) {
    const w = document.getElementById('slides-wrapper');
    if (w) {
      w.innerHTML = `
        <section class="slide active" style="align-items:center;justify-content:center;flex-direction:column;gap:16px;">
          <p style="font-size:var(--fs-nav);opacity:0.5;">${msg}</p>
          <a href="projects.html" style="color:var(--color-accent);">← Zurück zur Übersicht</a>
        </section>`;
    }
  }

  // -----------------------------------------------------------
  // 10. Hauptfunktion: alles zusammensetzen
  // -----------------------------------------------------------
  function init() {
    const slug = getProjectSlug();

    if (!slug) {
      showError('Kein Projekt angegeben.');
      return;
    }

    const project = findProject(slug);

    if (!project) {
      showError('Projekt "' + slug + '" nicht gefunden.');
      return;
    }

    currentSlug = slug;
    TOTAL_SLIDES = project.slides.length;
    buildSlides(project);
    buildGridPagination();
    initKeyboard();
    buildNavArrows();
    initSwipe();
    window.addEventListener('resize', onStepResize);
  }

  // DOM bereit abwarten
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
