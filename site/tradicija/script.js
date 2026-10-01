/* Tradicija: otkrivanje elemenata pri scrollu. */
(function () {
  'use strict';
  var el = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.forEach(function (e) { e.classList.add('vidljiv'); });
    return;
  }
  var io = new IntersectionObserver(function (zapisi) {
    zapisi.forEach(function (z) {
      if (z.isIntersecting) { z.target.classList.add('vidljiv'); io.unobserve(z.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  el.forEach(function (e) { io.observe(e); });
})();
