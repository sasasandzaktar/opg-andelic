/* Zajednička logika narudžbe: forma -> WhatsApp / Viber poruka (bez backenda).
   Obrasci: <form data-narudzba data-intro="Pozdrav, ..."> s kontrolama koje imaju name + data-label.
   Gumbi: [data-send="wa"] i [data-send="viber"]. Status: [data-status]. */
(function () {
  'use strict';

  /* [PROVJERITI] broj telefona klijenta (099 825 0273) - jedino mjesto gdje se mijenja */
  var KONTAKT = {
    broj: '385998250273',
    prikaz: '099 825 0273'
  };
  window.OPG_KONTAKT = KONTAKT;

  function waUrl(tekst) {
    return 'https://wa.me/' + KONTAKT.broj + (tekst ? '?text=' + encodeURIComponent(tekst) : '');
  }
  function viberUrl() {
    return 'viber://chat?number=%2B' + KONTAKT.broj;
  }
  window.OPG_waUrl = waUrl;

  // Obični linkovi na stranici ([data-wa], [data-viber], [data-tel]) dobivaju href iz konstante.
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-wa') || '');
    a.target = '_blank';
    a.rel = 'noopener';
  });
  document.querySelectorAll('[data-viber]').forEach(function (a) { a.href = viberUrl(); });
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:+' + KONTAKT.broj; });
  document.querySelectorAll('[data-broj]').forEach(function (el) { el.textContent = KONTAKT.prikaz; });

  function oznaka(el) {
    return el.getAttribute('data-label') || el.name;
  }

  function vrijednost(form, el) {
    if (el.type === 'radio') {
      var c = form.querySelector('input[type="radio"][name="' + el.name + '"]:checked');
      return c ? c.value : '';
    }
    if (el.type === 'checkbox') return el.checked ? (el.value && el.value !== 'on' ? el.value : 'da') : '';
    return (el.value || '').trim();
  }

  function greska(form, el, tekst) {
    var polje = el.closest('.polje') || el.parentNode;
    var poruka = polje.querySelector('.greska');
    if (!poruka) {
      poruka = document.createElement('span');
      poruka.className = 'greska';
      poruka.setAttribute('role', 'alert');
      polje.appendChild(poruka);
    }
    poruka.textContent = tekst;
    el.setAttribute('aria-invalid', 'true');
  }

  function ocisti(form) {
    form.querySelectorAll('.greska').forEach(function (g) { g.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
  }

  function provjeri(form) {
    ocisti(form);
    var prvi = null;
    var vidjeno = {};
    form.querySelectorAll('[name]').forEach(function (el) {
      if (!el.required) return;
      if (el.type === 'radio') {
        if (vidjeno[el.name]) return;
        vidjeno[el.name] = true;
      }
      if (!vrijednost(form, el)) {
        greska(form, el, 'Molimo ispunite: ' + oznaka(el).toLowerCase() + '.');
        if (!prvi) prvi = el;
      }
    });
    if (prvi) { prvi.focus(); return false; }
    return true;
  }

  function sastavi(form) {
    var redovi = [];
    var uvod = form.getAttribute('data-intro');
    if (uvod) redovi.push(uvod, '');
    var vidjeno = {};
    form.querySelectorAll('[name]').forEach(function (el) {
      if (el.type === 'radio') {
        if (vidjeno[el.name]) return;
        vidjeno[el.name] = true;
      }
      var v = vrijednost(form, el);
      if (v) redovi.push(oznaka(el) + ': ' + v);
    });
    var kraj = form.getAttribute('data-outro');
    if (kraj) redovi.push('', kraj);
    return redovi.join('\n');
  }

  function status(form, tekst) {
    var s = form.querySelector('[data-status]');
    if (s) s.textContent = tekst;
  }

  function kopiraj(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst).then(function () { return true; }, function () { return false; });
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = tekst;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return Promise.resolve(ok);
    } catch (e) { return Promise.resolve(false); }
  }

  document.querySelectorAll('form[data-narudzba]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        el.removeAttribute('aria-invalid');
        var p = (el.closest('.polje') || el.parentNode).querySelector('.greska');
        if (p) p.remove();
      });
    });
    form.querySelectorAll('[data-send]').forEach(function (gumb) {
      gumb.addEventListener('click', function () {
        if (!provjeri(form)) { status(form, 'Molimo dopunite označena polja.'); return; }
        var tekst = sastavi(form);
        if (gumb.getAttribute('data-send') === 'wa') {
          window.open(waUrl(tekst), '_blank', 'noopener');
          status(form, 'Otvaramo WhatsApp s ispunjenom porukom. Pošaljite je jednim dodirom.');
        } else {
          kopiraj(tekst).then(function (ok) {
            status(form, ok
              ? 'Poruka je kopirana. U Viberu je samo zalijepite i pošaljite.'
              : 'Otvaramo Viber. Ako se poruka ne pojavi, napišite nam ručno.');
            window.location.href = viberUrl();
          });
        }
      });
    });
  });

  // Za testiranje: window.OPG_sastavi(form)
  window.OPG_sastavi = sastavi;
})();
