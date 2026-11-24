/* Shared site behaviour: phone/tablet menu, dropdown toggles, keyboard access for clickable cards, footer year */
(function () {
  var header = document.querySelector('header');
  var nav = document.getElementById('mainnav');
  var btn = document.querySelector('.navbtn');
  var small = window.matchMedia('(max-width: 1100px)');

  /* ---------- phone/tablet menu ---------- */
  function setOpen(open) {
    if (!nav || !btn) return;
    nav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (btn) btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });

  /* sub-menus: the arrow next to Flooring, Cabinets, ... opens its list in the phone menu */
  document.querySelectorAll('.dd-toggle').forEach(function (t) {
    t.addEventListener('click', function () {
      var dd = t.parentNode, open = !dd.classList.contains('open');
      dd.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open);
    });
  });
  /* open the current section's list by default in the phone menu */
  document.querySelectorAll('nav .dd > a.here').forEach(function (a) {
    var dd = a.parentNode; dd.classList.add('open');
    var t = dd.querySelector('.dd-toggle'); if (t) t.setAttribute('aria-expanded', 'true');
  });

  /* any link in the menu closes it (links to a part of the same page don't reload) */
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
  small.addEventListener ? small.addEventListener('change', function () { setOpen(false); }) : small.addListener(function () { setOpen(false); });

  /* desktop: a tap on a dropdown's own link on a touch screen opens the list first (no hover there) */
  document.querySelectorAll('nav .dd > a').forEach(function (a) {
    a.addEventListener('touchend', function (e) {
      if (small.matches) return;
      var dd = a.parentNode;
      if (!dd.classList.contains('touch-open')) {
        e.preventDefault();
        document.querySelectorAll('nav .dd.touch-open').forEach(function (o) { o.classList.remove('touch-open'); });
        dd.classList.add('touch-open');
      }
    });
  });
  document.addEventListener('touchstart', function (e) {
    if (!e.target.closest('nav .dd')) document.querySelectorAll('nav .dd.touch-open').forEach(function (o) { o.classList.remove('touch-open'); });
  }, { passive: true });

  /* ---------- clickable picture cards work with the keyboard too ---------- */
  var CLICKABLE = '.colorgrid .card:not(.soon), .thumbs .img, .sidethumbs .img, .cablist .item';
  function mark() {
    document.querySelectorAll(CLICKABLE).forEach(function (el) {
      if (el.tagName === 'A' || el.hasAttribute('tabindex')) return;
      el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      if (!el.hasAttribute('aria-label')) {
        var n = el.querySelector('.pfname, .name');
        if (n) el.setAttribute('aria-label', n.textContent.trim());
      }
    });
  }
  mark();
  if (window.MutationObserver) new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target;
    if (el && el.matches && el.matches(CLICKABLE)) { e.preventDefault(); el.click(); }
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- header height, so the phone menu can fill the rest of the screen ---------- */
  function hh() { if (header) document.documentElement.style.setProperty('--hh', header.offsetHeight + 'px'); }
  hh(); window.addEventListener('resize', hh);
})();
