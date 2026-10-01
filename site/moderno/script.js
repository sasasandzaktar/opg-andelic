/* Moderno: otkrivanje pri scrollu, brojač sezone, računanje iznosa, plutajući gumb. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Otkrivanje
  var el = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduced) {
    el.forEach(function (e) { e.classList.add('vidljiv'); });
  } else {
    var io = new IntersectionObserver(function (z) {
      z.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vidljiv'); io.unobserve(x.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    el.forEach(function (e) { io.observe(e); });
  }

  // Brojač sezone: berba 1. listopada - 31. prosinca [PROVJERITI datume]
  var tekst = document.querySelector('[data-sezona-tekst]');
  if (tekst) {
    var sad = new Date();
    var dan = 86400000;
    var g = sad.getFullYear();
    var pocetak = new Date(g, 9, 1), kraj = new Date(g, 11, 31, 23, 59, 59);
    function dana(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? ' dan' : ' dana'); }
    if (sad >= pocetak && sad <= kraj) {
      tekst.textContent = 'Sezona je otvorena · još ' + dana(Math.ceil((kraj - sad) / dan)) + ' berbe';
    } else if (sad < pocetak) {
      tekst.textContent = 'Sezona kreće za ' + dana(Math.ceil((pocetak - sad) / dan));
    } else {
      tekst.textContent = 'Sezona mandarina završila · sokovi i džemovi su dostupni';
    }
  }

  // Forma: odabir iz kartica, količina, okvirni iznos
  var forma = document.querySelector('form[data-narudzba]');
  if (forma) {
    var kol = forma.querySelector('#kol');
    var ukupno = document.querySelector('[data-ukupno]');
    var skriveno = forma.querySelector('input[name="okvirno"]');
    var radios = forma.querySelectorAll('input[name="proizvod"]');

    function izracun() {
      var r = forma.querySelector('input[name="proizvod"]:checked');
      var n = parseInt(kol.value, 10);
      if (!r || !(n > 0)) { ukupno.textContent = '–'; skriveno.value = ''; return; }
      var iznos = n * parseFloat(r.getAttribute('data-cijena'));
      var s = iznos.toLocaleString('hr-HR') + ' €';
      ukupno.textContent = s;
      skriveno.value = '~' + s + ' (okvirno)';
    }
    radios.forEach(function (r) { r.addEventListener('change', izracun); });
    kol.addEventListener('input', function () {
      kol.value = kol.value.replace(/[^0-9]/g, '').slice(0, 3);
      izracun();
    });
    forma.querySelectorAll('[data-kol]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = (parseInt(kol.value, 10) || 0) + parseInt(b.getAttribute('data-kol'), 10);
        kol.value = Math.max(1, Math.min(99, n));
        kol.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    document.querySelectorAll('[data-odaberi]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = forma.querySelector('input[data-id="' + b.getAttribute('data-odaberi') + '"]');
        if (r) { r.checked = true; izracun(); }
        document.getElementById('narudzba').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    izracun();
  }

  // Plutajući gumb nestaje kad je forma ili kontakt u prikazu
  var plut = document.querySelector('[data-plutajuci]');
  var ciljevi = [document.getElementById('vrh'), document.getElementById('narudzba'), document.getElementById('kontakt')];
  if (plut && 'IntersectionObserver' in window) {
    var vidljivo = {};
    var io2 = new IntersectionObserver(function (z) {
      z.forEach(function (x) { vidljivo[x.target.id] = x.isIntersecting; });
      plut.classList.toggle('skriven', !!(vidljivo.vrh || vidljivo.narudzba || vidljivo.kontakt));
    }, { threshold: 0.3 });
    ciljevi.forEach(function (c) { if (c) io2.observe(c); });
  }
})();
