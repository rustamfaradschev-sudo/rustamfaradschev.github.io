(function () {
  function initNavDots() {
    if (!window.gridAPI) return;

    var api     = window.gridAPI;
    var rows    = api.getRows();
    var cols    = api.getCols();
    var navRows = document.querySelectorAll('.nav-row');
    if (navRows.length < 2) return;

    var topLinks = navRows[0].querySelectorAll('a');
    var botLinks = navRows[1].querySelectorAll('a');

    // On project pages, A1 is already a pagination dot — skip RUSTAM corner there
    var isProjectPage = !!document.getElementById('slides-wrapper');

    var corners = [
      isProjectPage ? null : [0,          0,          topLinks[0]],
      [0,          cols - 1, topLinks[1]],
      [rows - 1,   0,        botLinks[0]],
      [rows - 1,   cols - 1, botLinks[1]],
    ].filter(Boolean);

    corners.forEach(function (corner) {
      var r    = corner[0];
      var c    = corner[1];
      var link = corner[2];
      var dot  = api.getDot(r, c);
      if (!dot || !link) return;

      var hit = document.createElement('div');
      hit.style.cssText =
        'position:fixed;width:28px;height:28px;' +
        'left:' + parseFloat(dot.style.left) + 'px;' +
        'top:'  + parseFloat(dot.style.top)  + 'px;' +
        'transform:translate(-50%,-50%);' +
        'cursor:pointer;z-index:11;pointer-events:all;';

      hit.addEventListener('click', function (e) {
        e.stopPropagation();
        link.click();
      });

      document.body.appendChild(hit);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavDots);
  } else {
    initNavDots();
  }
})();
