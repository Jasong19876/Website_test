/* Contact forms: send each message to the company inbox through FormSubmit (formsubmit.co).
   The first message ever sent makes FormSubmit email a one-time confirmation link to the inbox. */
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
