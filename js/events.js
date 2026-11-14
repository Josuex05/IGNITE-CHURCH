/* =========================================================
   EVENTS PAGE
   - Upcoming Events slider (featured events)
   - Glass month calendar (dots = events, bars = multi-day)
   - Day panel on the right
   - Photo slideshow
   Reads events from window.IGNITE_EVENTS (see events-data.js)
========================================================= */
(function () {
  'use strict';

  var MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  var PHOTOS = ['images/pastor_carousel.png', 'images/carousel 2.png', 'images/carousel 3.png'];
  var MAX_BAR_LANES = 3;

  /* ---------- date helpers (all LOCAL time) ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function endOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes()); }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function diffDays(a, b) { // whole days from b to a (calendar days, DST safe)
    return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
  }
  function parseLocal(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(s || '');
    if (!m) { return null; }
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  }
  function fmtTime(d) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function fmtShort(d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  function fmtLong(d) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }

  /* ---------- turn raw data into usable events ---------- */
  function normalize(raw) {
    var start = parseLocal(raw.start);
    if (!start) { return null; }
    var dateOnly = raw.start.length === 10;
    var allDay = !!raw.allDay || dateOnly;
    var end = raw.end ? parseLocal(raw.end) : null;
    if (allDay) {
      start = startOfDay(start);
      end = endOfDay(end || start);
    } else if (!end || end < start) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    return {
      id: raw.id, title: raw.title || 'Event', start: start, end: end, allDay: allDay,
      location: raw.location || '', image: raw.image || '', link: raw.link || '',
      featured: !!raw.featured, repeat: raw.repeat || '', until: raw.until ? parseLocal(raw.until) : null
    };
  }

  // All occurrences that touch the range [from, to]. Handles weekly repeats.
  function expand(rawList, from, to) {
    var out = [];
    rawList.forEach(function (raw) {
      var ev = normalize(raw);
      if (!ev) { return; }
      var len = ev.end.getTime() - ev.start.getTime();
      function push(s) {
        var e = new Date(s.getTime() + len);
        if (s <= to && e >= from) {
          out.push({ id: ev.id, title: ev.title, start: s, end: e, allDay: ev.allDay, location: ev.location,
                     image: ev.image, link: ev.link, featured: ev.featured, repeats: !!ev.repeat });
        }
      }
      if (ev.repeat === 'weekly') {
        var s = new Date(ev.start.getTime());
        var limit = ev.until ? endOfDay(ev.until) : to;
        if (limit > to) { limit = to; }
        var guard = 0;
        while (s <= limit && guard < 1000) {
          push(s);
          s = addDays(s, 7);        // same clock time, next week
          guard++;
        }
      } else {
        push(ev.start);
      }
    });
    out.sort(function (a, b) { return a.start - b.start || a.title.localeCompare(b.title); });
    return out;
  }

  // last calendar day an event touches (an event ending exactly at midnight ends the day before)
  function lastDay(ev) {
    var e = ev.end;
    if (!ev.allDay && e.getHours() === 0 && e.getMinutes() === 0 && e > ev.start) { e = new Date(e.getTime() - 1); }
    return startOfDay(e);
  }
  function isMultiDay(ev) { return diffDays(lastDay(ev), startOfDay(ev.start)) > 0; }

  // describes when an event happens, for the side panel
  function whenText(ev) {
    if (isMultiDay(ev)) { return fmtShort(ev.start) + ' - ' + fmtShort(lastDay(ev)); }
    if (ev.allDay) { return 'All day'; }
    return fmtTime(ev.start);
  }

  /* ---------- tiny DOM helper ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* =========================================================
     LOAD EVENTS (swap this later for a live source)
  ========================================================= */
  function loadEvents() {
    return Promise.resolve(window.IGNITE_EVENTS || []);
  }

  /* =========================================================
     UPCOMING SLIDER
  ========================================================= */
  function buildUpcoming(raw) {
    var track = document.getElementById('upTrack');
    var dotsBox = document.getElementById('upDots');
    if (!track || !dotsBox) { return; }
    track.innerHTML = '';
    dotsBox.innerHTML = '';

    var now = new Date();
    var seen = {};
    var featured = expand(raw, now, addDays(now, 180)).filter(function (e) {
      if (!e.featured || seen[e.id]) { return false; }
      seen[e.id] = true;
      return true;
    }).slice(0, 6);

    if (!featured.length) {
      track.appendChild(el('p', 'up-empty', 'No featured events right now. Check the calendar for what is coming up.'));
      return;
    }

    featured.forEach(function (ev, i) {
      var slide = el('article', 'up-slide');
      if (ev.image) { slide.style.setProperty('--img', 'url("' + new URL(ev.image, document.baseURI).href + '")'); }
      slide.appendChild(el('span', 'up-tag', ev.repeats ? 'WEEKLY' : 'FEATURED'));
      slide.appendChild(el('h3', 'up-name', ev.title));
      var when;
      if (ev.repeats) {
        when = 'Every ' + ev.start.toLocaleDateString('en-US', { weekday: 'long' }) + ' at ' + fmtTime(ev.start);
      } else if (isMultiDay(ev) || ev.allDay) {
        when = whenText(ev);
      } else {
        when = fmtLong(ev.start) + ' at ' + fmtTime(ev.start);
      }
      slide.appendChild(el('p', 'up-when', when));
      if (ev.link) {
        var a = el('a', 'up-btn', 'LEARN MORE \u203A');
        a.href = ev.link; a.target = '_blank'; a.rel = 'noopener';
        slide.appendChild(a);
      }
      track.appendChild(slide);

      var dot = el('button', 'up-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show ' + ev.title);
      dot.addEventListener('click', function () { go(i, true); });
      dotsBox.appendChild(dot);
    });

    var index = 0, timer = null, count = featured.length;
    function go(i, user) {
      index = (i + count) % count;
      track.style.setProperty('--i', index);
      Array.prototype.forEach.call(dotsBox.children, function (d, k) { d.classList.toggle('on', k === index); });
      if (user) { restart(); }
    }
    function restart() {
      clearInterval(timer);
      if (count > 1 && !reduceMotion()) { timer = setInterval(function () { go(index + 1); }, 6000); }
    }
    var box = track.parentNode;
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
    box.addEventListener('mouseleave', restart);
    box.addEventListener('focusin', function () { clearInterval(timer); });
    box.addEventListener('focusout', restart);
    go(0); restart();
  }

  /* =========================================================
     CALENDAR
  ========================================================= */
  function buildCalendar(raw) {
    var grid = document.getElementById('calGrid');
    var monthLabel = document.getElementById('calMonth');
    var sideTitle = document.getElementById('sideTitle');
    var sideList = document.getElementById('sideList');
    if (!grid) { return; }

    var today = new Date();
    var view = { y: today.getFullYear(), m: today.getMonth() };
    var selected = startOfDay(today);
    var shown = [];   // events for the month grid currently displayed

    function render() {
      var first = new Date(view.y, view.m, 1);
      var daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
      var total = Math.ceil((first.getDay() + daysInMonth) / 7) * 7;
      var gridStart = addDays(first, -first.getDay());
      var gridEnd = addDays(gridStart, total - 1);

      monthLabel.textContent = MONTHS[view.m] + ' ' + view.y;
      shown = expand(raw, gridStart, endOfDay(gridEnd));

      // multi-day events get a "lane" so their bars line up across days
      var multis = shown.filter(isMultiDay);
      var laneEnd = [];
      multis.forEach(function (ev) {
        var s = diffDays(startOfDay(ev.start), gridStart);
        var e = diffDays(lastDay(ev), gridStart);
        var lane = 0;
        while (laneEnd[lane] !== undefined && laneEnd[lane] >= s) { lane++; }
        laneEnd[lane] = e;
        ev._s = s; ev._e = e; ev._lane = lane;
      });
      var laneCount = Math.min(laneEnd.length, MAX_BAR_LANES);

      grid.innerHTML = '';
      grid.style.setProperty('--rows', total / 7);

      for (var i = 0; i < total; i++) {
        var d = addDays(gridStart, i);
        var dayEvents = shown.filter(function (ev) {
          return startOfDay(ev.start) <= d && lastDay(ev) >= d;
        });
        var singles = dayEvents.filter(function (ev) { return !isMultiDay(ev); });

        var cell = el('button', 'day');
        cell.type = 'button';
        cell._date = d;
        if (d.getMonth() !== view.m) { cell.classList.add('out'); }
        if (sameDay(d, today)) { cell.classList.add('today'); }
        if (sameDay(d, selected)) { cell.classList.add('selected'); }
        if (dayEvents.length) { cell.classList.add('has-events'); }
        cell.setAttribute('aria-label', d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
          (dayEvents.length ? ', ' + dayEvents.length + (dayEvents.length === 1 ? ' event' : ' events') : ', no events'));

        var num = el('span', 'num');
        num.appendChild(el('b', null, String(d.getDate())));
        cell.appendChild(num);

        if (laneCount) {
          var bars = el('span', 'bars');
          for (var L = 0; L < laneCount; L++) {
            var hit = null;
            for (var k = 0; k < multis.length; k++) {
              if (multis[k]._lane === L && multis[k]._s <= i && multis[k]._e >= i) { hit = multis[k]; break; }
            }
            if (hit) {
              var bar = el('span', 'bar');
              if (i === hit._s || i % 7 === 0) { bar.classList.add('cap-l'); }
              if (i === hit._e || i % 7 === 6) { bar.classList.add('cap-r'); }
              bar.title = hit.title;
              bars.appendChild(bar);
            } else {
              bars.appendChild(el('span', 'bar-gap'));
            }
          }
          cell.appendChild(bars);
        }

        if (singles.length) {
          var dots = el('span', 'dots');
          singles.slice(0, 3).forEach(function () { dots.appendChild(el('i', 'dot')); });
          cell.appendChild(dots);
        }
        grid.appendChild(cell);
      }
      renderSide();
    }

    function renderSide() {
      var isToday = sameDay(selected, today);
      sideTitle.textContent = isToday ? "TODAY'S EVENTS" : fmtLong(selected).toUpperCase();
      sideList.innerHTML = '';
      var list = shown.filter(function (ev) {
        return startOfDay(ev.start) <= selected && lastDay(ev) >= selected;
      });
      if (!list.length) {
        sideList.appendChild(el('li', 'side-empty', 'No events on this day.'));
        return;
      }
      list.forEach(function (ev, idx) {
        var li = el('li', 'side-item' + (idx === 0 ? ' first' : ''));
        var inner = ev.link ? el('a', 'side-link') : el('div', 'side-link');
        if (ev.link) { inner.href = ev.link; inner.target = '_blank'; inner.rel = 'noopener'; }
        inner.appendChild(el('strong', null, ev.title));
        inner.appendChild(el('span', null, whenText(ev)));
        if (ev.location) { inner.appendChild(el('em', null, ev.location)); }
        li.appendChild(inner);
        sideList.appendChild(li);
      });
    }

    function pickDefaultDay() {
      selected = (today.getFullYear() === view.y && today.getMonth() === view.m)
        ? startOfDay(today) : new Date(view.y, view.m, 1);
    }

    grid.addEventListener('click', function (e) {
      var cell = e.target.closest ? e.target.closest('.day') : null;
      if (!cell || !cell._date) { return; }
      selected = startOfDay(cell._date);
      if (selected.getMonth() !== view.m) { view = { y: selected.getFullYear(), m: selected.getMonth() }; }
      render();
    });
    document.getElementById('calPrev').addEventListener('click', function () {
      view.m--; if (view.m < 0) { view.m = 11; view.y--; }
      pickDefaultDay(); render();
    });
    document.getElementById('calNext').addEventListener('click', function () {
      view.m++; if (view.m > 11) { view.m = 0; view.y++; }
      pickDefaultDay(); render();
    });

    render();
  }

  /* =========================================================
     PHOTO SLIDESHOW
  ========================================================= */
  function buildPhotos() {
    var frame = document.getElementById('photoFrame');
    if (!frame) { return; }
    var imgs = PHOTOS.map(function (src, i) {
      var img = new Image();
      img.src = src; img.alt = ''; img.className = 'photo' + (i === 0 ? ' on' : '');
      img.onerror = function () { img.style.display = 'none'; };
      frame.insertBefore(img, frame.firstChild);
      return img;
    });
    var idx = 0, timer = null;
    function show(i) {
      imgs[idx].classList.remove('on');
      idx = (i + imgs.length) % imgs.length;
      imgs[idx].classList.add('on');
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion()) { timer = setInterval(function () { show(idx + 1); }, 5000); }
    }
    document.getElementById('photoPrev').addEventListener('click', function () { show(idx - 1); restart(); });
    document.getElementById('photoNext').addEventListener('click', function () { show(idx + 1); restart(); });
    restart();
  }

  /* =========================================================
     START
  ========================================================= */
  function init() {
    var note = document.getElementById('sampleNote');
    if (note && window.IGNITE_EVENTS_SAMPLE) { note.hidden = false; }
    buildPhotos();
    loadEvents().then(function (raw) {
      buildUpcoming(raw);
      buildCalendar(raw);
    });
  }

  if (typeof document !== 'undefined' && document.getElementById) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
  }
  // lets us test the date logic outside a browser
  if (typeof module !== 'undefined') { module.exports = { expand: expand, isMultiDay: isMultiDay, lastDay: lastDay, normalize: normalize, diffDays: diffDays }; }
})();
