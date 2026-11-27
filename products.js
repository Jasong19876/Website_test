/* Reads products.txt (the editable product list) and hands it to each page.
   Usage on a page:  loadProducts(function (P) { ... P.vinyl ... });
   You never need to edit this file to change stock or colors: edit products.txt. */
(function () {
  var YES = /^(yes|y|true|in|in stock|1)$/i;

  function cols(line) { return line.split('|').map(function (s) { return s.trim(); }); }
  /* a code never has spaces: "R86 yes" (a forgotten |) still reads as code R86, in stock yes */
  function fixCode(c) {
    var w = (c[0] || '').split(/\s+/);
    if (w.length > 1) { c = [w[0], /^(yes|y|no|n|true|false|in|out)$/i.test(w[1]) ? w[1] : c[1]].concat(c.slice(2)); }
    return c;
  }
  function stock(v) { return v === undefined || v === '' ? true : YES.test(v); }   // blank counts as in stock
  function list(v) { return (v || '').split(',').map(function (s) { return s.trim().replace(/\.jpe?g$/i, ''); }).filter(Boolean); }
  function file(v) { return (v || '').trim().replace(/\.jpe?g$/i, ''); }

  var ROW = {
    'vinyl':       function (c) { return c[0] && { code: c[0], inStock: stock(c[1]) }; },
    'laminate':    function (c) { return c[0] && { code: c[0], inStock: stock(c[1]) }; },
    'countertops': function (c) { return c[0] && { code: c[0], counter: stock(c[1]), island36: stock(c[2]), island52: stock(c[3]) }; },
    'baseboards':  function (c) { return c[0] && { code: c[0], name: c[1] || '', t: c[2] || '', h: c[3] || '', L: c[4] || '', inStock: stock(c[5]), side: list(c[6]) }; },
    'wall panels': function (c) { var p = list(c[2]); return c[0] && { code: c[0], card: file(c[1]) || p[0] || c[0], photos: p.length ? p : [file(c[1]) || c[0]], inStock: stock(c[3]) }; },
    'shower panels': function (c) { return (c[1] || c[2]) && { name: c[0] || '', card: file(c[1]) || file(c[2]), large: file(c[2]) || file(c[1]), inStock: stock(c[3]) }; },
    'cabinets out of stock': function (c) { return c[0] && c[0]; }
  };
  var KEY = { 'vinyl': 'vinyl', 'laminate': 'laminate', 'countertops': 'countertops', 'baseboards': 'baseboards',
              'wall panels': 'wallPanels', 'shower panels': 'showerPanels', 'cabinets out of stock': 'cabinetsOut' };

  function parse(text) {
    var out = {}, sec = null;
    Object.keys(KEY).forEach(function (k) { out[KEY[k]] = []; });
    text.split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/\s+$/, '');
      if (!line.trim() || /^\s*(#|=)/.test(line)) return;
      var h = line.match(/^\s*\[(.+)\]\s*$/);
      if (h) { sec = h[1].trim().toLowerCase(); return; }
      if (!sec || !ROW[sec]) return;
      try { var c = cols(line); if (sec !== 'shower panels') c = fixCode(c); var r = ROW[sec](c); if (r) out[KEY[sec]].push(r); }
      catch (e) { if (window.console) console.warn('products.txt: skipped a line it could not read:', line); }   // one bad line never breaks the rest
    });
    return out;
  }

  var cache = null, waiting = [];
  function done(P) { cache = P; fillCounts(P); waiting.splice(0).forEach(function (f) { f(P); }); }

  window.loadProducts = function (cb) {
    if (cache) return cb(cache);
    waiting.push(cb);
    if (waiting.length > 1) return;
    // no-cache: the browser checks for a newer list on every visit, so stock changes show right away
    fetch('products.txt', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { done(parse(t)); })
      .catch(function (e) {
        if (window.console) console.error('Could not load products.txt', e);
        document.querySelectorAll('[data-products-error]').forEach(function (el) {
          el.hidden = false;
          el.innerHTML = 'Our product list didn&rsquo;t load. Please refresh the page, or call us at <a href="tel:+12096189999">209-618-9999</a>.';
        });
        done(null);
      });
  };

  /* any element with data-count="vinyl" / "laminate" / "flooring" shows how many colors are listed */
  function fillCounts(P) {
    if (!P) return;
    var n = { vinyl: P.vinyl.length, laminate: P.laminate.length, flooring: P.vinyl.length + P.laminate.length };
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var v = n[el.getAttribute('data-count')];
      if (v) el.textContent = v;
    });
  }
  window.parseProducts = parse;   // used by the checker on GitHub
})();
