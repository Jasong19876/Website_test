/* Smooth motion: scroll reveals, header shadow, scroll progress, soft parallax, page fades */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var header = document.querySelector('header');
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);

  /* ---------- scroll-linked: header shadow, progress bar, parallax ---------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll('.img.hero, .img.banner'));
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset, max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {                                   // two thresholds, so it can never flip back and forth around one point
      if (y > 60) header.classList.add('scrolled');
      else if (y < 20) header.classList.remove('scrolled');
    }
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    layers.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;   // -1 .. 1
      el.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var targets = [];
  document.querySelectorAll('.wrap > section').forEach(function (sec) {
    var kids = sec.querySelectorAll(':scope > .grid > *');
    if (kids.length) {
      kids.forEach(function (k, i) { k.style.setProperty('--d', (i % 4) * 80 + 'ms'); targets.push(k); });
    } else {
      targets.push(sec);
    }
  });

  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      el.classList.add('in');
      // drop the reveal classes afterwards so hover transitions go back to normal speed
      setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1000);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });

  /* ---------- soft fade between pages ---------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /\.(jpg|png|svg|pdf)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page / hash only
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 220);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
})();
