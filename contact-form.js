/* Contact forms: send each message to the company inbox through FormSubmit (formsubmit.co).
   The first message ever sent makes FormSubmit email a one-time confirmation link to the inbox. */
var SIZE_BY_TOPIC = {
  'Vinyl flooring':   { label: 'Square feet needed (optional)', unit: 'sq ft', hint: 'Adding your square footage helps us give you a more accurate estimate.' },
  'Laminate flooring':{ label: 'Square feet needed (optional)', unit: 'sq ft', hint: 'Adding your square footage helps us give you a more accurate estimate.' },
  'Wall panels':      { label: 'Wall area in square feet (optional)', unit: 'sq ft', hint: 'Measure the wall height times width. The more exact, the better the estimate.' },
  'Countertops':      { label: 'Countertop area in square feet (optional)', unit: 'sq ft', hint: 'Length times depth of each counter, added together, is a good start.' },
  'Islands':          { label: 'Island size or area (optional)', unit: 'sq ft', hint: 'Tell us the size you have in mind, or measure the space where it will go.' },
  'Baseboards':       { label: 'Linear feet needed (optional)', unit: 'linear ft', hint: 'Add up the length of every wall that needs baseboard.' },
  'Cabinets':         { label: 'Room size or cabinet list (optional)', unit: '', hint: 'Tell us the room size or the cabinet codes you want priced.' },
  'Not sure yet':     { label: 'Room size in square feet (optional)', unit: 'sq ft', hint: 'A rough size helps us point you to the right product.' }
};

(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/ae70e9f273b7dc57e8d4f7ad05e22e61';

  document.querySelectorAll('form[data-contact]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'form-status ' + (kind || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements._honey && form.elements._honey.value) return;     // bots fill the hidden field
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== '_honey') data[k] = v; });
      if (data.size_needed) {                               // add the unit, so the email is not ambiguous
        var info = SIZE_BY_TOPIC[data.interested_in];
        if (info && info.unit && /^[\d.,\s]+$/.test(data.size_needed)) data.size_needed = data.size_needed.trim() + ' ' + info.unit;
      }
      if (!data.size_needed) delete data.size_needed;

      btn.disabled = true; btn.textContent = 'Sending…'; say('');
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') {
            form.reset();
            if (form.elements.interested_in) form.elements.interested_in.dispatchEvent(new Event('change'));   // refresh the size label
            say('Thanks! Your message was sent. We’ll get back to you soon.', 'ok');
          } else {
            throw new Error(res.j && res.j.message || 'failed');
          }
        })
        .catch(function () { say('Sorry, that didn’t send. Please try again in a moment.', 'err'); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();

/* Arriving from a "Get an estimate" button: preselect the product and start the message */
(function () {
  var q = new URLSearchParams(location.search), topic = q.get('topic'), item = q.get('item');
  var sel = document.getElementById('c-topic'), msg = document.getElementById('c-msg');
  if (!topic || !sel || !msg) return;
  Array.prototype.forEach.call(sel.options, function (o) { if (o.text === topic) sel.value = o.value; });
  if (!msg.value) msg.value = 'I’d like an estimate for ' + (item ? topic.toLowerCase() + ' ' + item : topic.toLowerCase()) + '.';
})();

/* Contact page: change the size field to match the chosen product */
(function () {
  var sel = document.getElementById('c-topic'), lab = document.getElementById('c-size-label'),
      hint = document.getElementById('c-size-hint'), inp = document.getElementById('c-size');
  if (!sel || !lab) return;
  function sync() {
    var info = SIZE_BY_TOPIC[sel.value] || SIZE_BY_TOPIC['Not sure yet'];
    lab.textContent = info.label; hint.textContent = info.hint;
  }
  sel.addEventListener('change', sync);
  sync();
  // arriving from a "Get an estimate" button: draw the eye to the size field
  if (new URLSearchParams(location.search).get('topic')) {
    inp.classList.add('nudge');
    inp.addEventListener('focus', function () { inp.classList.remove('nudge'); }, { once: true });
  }
})();
