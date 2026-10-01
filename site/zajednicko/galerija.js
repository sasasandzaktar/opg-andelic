/* Zajednička galerija s lightboxom.
   <div data-galerija><a href="velika.webp" data-lightbox data-opis="Opis"><img alt="..."></a>...</div>
   Tipkovnica: strelice i Esc, swipe na dodir, fokus zarobljen u lightboxu. */
(function () {
  'use strict';

  var css = '' +
    '.lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:var(--lb-bg,rgba(10,10,10,.94));-webkit-tap-highlight-color:transparent}' +
    '.lb.otvoren{display:flex}' +
    '.lb figure{margin:0;max-width:100%;max-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 12px 64px;touch-action:pan-y}' +
    '.lb img{max-width:100%;max-height:calc(100vh - 140px);max-height:calc(100dvh - 140px);object-fit:contain;border-radius:var(--lb-radius,4px);user-select:none;-webkit-user-drag:none}' +
    '.lb figcaption{color:var(--lb-text,#fff);font:15px/1.4 system-ui,sans-serif;text-align:center;margin-top:12px;max-width:60ch;padding:0 8px}' +
    '.lb button{position:absolute;display:grid;place-items:center;width:48px;height:48px;border:0;border-radius:50%;background:var(--lb-btn,rgba(255,255,255,.14));color:var(--lb-text,#fff);cursor:pointer;font:inherit}' +
    '.lb button:hover{background:var(--lb-accent,#D9641E)}' +
    '.lb button:focus-visible{outline:3px solid var(--lb-accent,#D9641E);outline-offset:2px}' +
    '.lb svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.lb .lb-x{top:8px;right:8px}.lb .lb-p{left:8px;top:50%;margin-top:-24px}.lb .lb-n{right:8px;top:50%;margin-top:-24px}' +
    '.lb .lb-br{position:absolute;bottom:14px;left:0;right:0;text-align:center;color:var(--lb-text,#fff);opacity:.7;font:13px system-ui,sans-serif}' +
    '@media(max-width:600px){.lb .lb-p,.lb .lb-n{top:auto;bottom:8px;margin:0}.lb .lb-p{left:16px}.lb .lb-n{right:16px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var ikona = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    p: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    n: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Galerija fotografija');
  lb.innerHTML =
    '<button type="button" class="lb-x" aria-label="Zatvori">' + ikona.x + '</button>' +
    '<button type="button" class="lb-p" aria-label="Prethodna fotografija">' + ikona.p + '</button>' +
    '<button type="button" class="lb-n" aria-label="Sljedeća fotografija">' + ikona.n + '</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<div class="lb-br" aria-live="polite"></div>';
  document.body.appendChild(lb);

  var slika = lb.querySelector('img');
  var opis = lb.querySelector('figcaption');
  var brojac = lb.querySelector('.lb-br');
  var bX = lb.querySelector('.lb-x'), bP = lb.querySelector('.lb-p'), bN = lb.querySelector('.lb-n');
  var stavke = [], idx = 0, vratiFokus = null;

  function prikazi(i) {
    idx = (i + stavke.length) % stavke.length;
    var a = stavke[idx];
    var im = a.querySelector('img');
    slika.src = a.getAttribute('href');
    slika.alt = im ? im.alt : '';
    opis.textContent = a.getAttribute('data-opis') || (im ? im.alt : '');
    brojac.textContent = (idx + 1) + ' / ' + stavke.length;
    [idx - 1, idx + 1].forEach(function (j) {
      var n = stavke[(j + stavke.length) % stavke.length];
      if (n) { var p = new Image(); p.src = n.getAttribute('href'); }
    });
  }

  function otvori(grupa, a) {
    stavke = Array.prototype.slice.call(grupa.querySelectorAll('a[data-lightbox]'));
    vratiFokus = a;
    lb.classList.add('otvoren');
    document.documentElement.style.overflow = 'hidden';
    prikazi(stavke.indexOf(a));
    bX.focus();
  }

  function zatvori() {
    lb.classList.remove('otvoren');
    document.documentElement.style.overflow = '';
    slika.removeAttribute('src');
    if (vratiFokus) vratiFokus.focus();
  }

  document.querySelectorAll('[data-galerija]').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-lightbox]');
      if (!a || !g.contains(a)) return;
      e.preventDefault();
      otvori(g, a);
    });
  });

  bX.addEventListener('click', zatvori);
  bP.addEventListener('click', function () { prikazi(idx - 1); });
  bN.addEventListener('click', function () { prikazi(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') zatvori(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('otvoren')) return;
    if (e.key === 'Escape') { e.preventDefault(); zatvori(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prikazi(idx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); prikazi(idx + 1); }
    else if (e.key === 'Tab') {
      var f = [bX, bP, bN];
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) f[(i <= 0 ? f.length : i) - 1].focus();
      else f[(i + 1) % f.length].focus();
    }
  });

  var x0 = null, y0 = null;
  lb.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) prikazi(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
