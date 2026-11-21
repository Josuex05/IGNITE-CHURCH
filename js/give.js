/* =========================================================
   GIVE PAGE: rotating glass bubbles + typewriter description

   - Click a bubble that is not in front: it rotates to the front
     and its description types out on the right.
   - Click the bubble that is already in front (or the GIVE NOW
     button): opens the Zeffy page.
   Text and links live in give.html (data-desc, data-ref, href).
========================================================= */
(function () {
  'use strict';

  var bubbles = Array.prototype.slice.call(document.querySelectorAll('.bubble'));
  if (!bubbles.length) { return; }

  var nameEl  = document.getElementById('gvName');
  var refEl   = document.getElementById('gvRef');
  var textEl  = document.getElementById('gvText');
  var typedEl = document.getElementById('gvTyped');
  var ghostEl = document.getElementById('gvGhost');
  var srEl    = document.getElementById('gvSr');
  var btnEl   = document.getElementById('gvBtn');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var count = bubbles.length;
  var active = 1;            // Offering starts in front, like the sketch
  var timer = null;

  function link(b) { return b.querySelector('a'); }

  // slot 0 = front/large, slot 1 = upper left, slot 2 = lower left
  function layout() {
    bubbles.forEach(function (b, i) {
      var slot = (active - i + count) % count;
      b.classList.remove('slot-0', 'slot-1', 'slot-2');
      b.classList.add('slot-' + slot);
      var a = link(b);
      var name = b.getAttribute('data-name');
      if (slot === 0) {
        a.setAttribute('aria-current', 'true');
        a.setAttribute('aria-label', 'Give to ' + name + ' (opens Zeffy in a new tab)');
      } else {
        a.removeAttribute('aria-current');
        a.setAttribute('aria-label', 'Learn about ' + name);
      }
    });
  }

  function typeText(text) {
    clearInterval(timer);
    textEl.classList.remove('done');
    if (reduce) {
      typedEl.textContent = text;
      ghostEl.textContent = '';
      textEl.classList.add('done');
      return;
    }
    var n = 0;
    typedEl.textContent = '';
    ghostEl.textContent = text;           // invisible; keeps the box from jumping in height
    timer = setInterval(function () {
      n++;
      typedEl.textContent = text.slice(0, n);
      ghostEl.textContent = text.slice(n);
      if (n >= text.length) {
        clearInterval(timer);
        textEl.classList.add('done');
      }
    }, 22);
  }

  function showPanel(i, delay) {
    var b = bubbles[i];
    var name = b.getAttribute('data-name');
    var ref  = b.getAttribute('data-ref') || '';
    var desc = b.getAttribute('data-desc') || '';

    nameEl.textContent = name;
    refEl.textContent = ref;
    refEl.style.display = ref ? '' : 'none';
    btnEl.href = link(b).href;
    btnEl.textContent = 'GIVE TO ' + name.toUpperCase();
    srEl.textContent = name + '. ' + desc;

    clearInterval(timer);
    typedEl.textContent = '';
    ghostEl.textContent = desc;
    textEl.classList.remove('done');
    setTimeout(function () { typeText(desc); }, delay || 0);
  }

  function select(i) {
    if (i === active) { return; }
    active = i;
    layout();
    showPanel(i, reduce ? 0 : 350);       // let the bubble start rotating first
  }

  bubbles.forEach(function (b, i) {
    link(b).addEventListener('click', function (e) {
      if (i !== active) {                 // not in front yet: rotate instead of leaving the page
        e.preventDefault();
        select(i);
      }                                   // already in front: the link opens Zeffy normally
    });
  });

  layout();
  showPanel(active, reduce ? 0 : 1500);   // wait for the entrance animation
})();
