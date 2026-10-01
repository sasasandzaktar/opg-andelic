/* Premium: spor, suptilan fade pri scrollu i prozirno zaglavlje koje dobiva podlogu. */
(function () {
  'use strict';
  var el = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.forEach(function (e) { e.classList.add('vidljiv'); });
  } else {
    var io = new IntersectionObserver(function (z) {
      z.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vidljiv'); io.unobserve(x.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    el.forEach(function (e) { io.observe(e); });
  }

  var vrh = document.querySelector('.vrh');
  function skrol() { vrh.classList.toggle('puno', window.scrollY > 40); }
  window.addEventListener('scroll', skrol, { passive: true });
  skrol();
})();
