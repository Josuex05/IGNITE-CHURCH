/* =========================================================
   EVENT DATA  (Ignite Church)

   Later this file can be replaced by a live source
   (Planning Center, Google Calendar, or a Google Sheet).
   events.js only needs a list shaped like this:

   id        unique short name
   title     event name
   start     "YYYY-MM-DDTHH:MM"  (or "YYYY-MM-DD" for all-day)
   end       same format (optional; for multi-day use the LAST day)
   repeat    "weekly" for events that repeat every week (optional)
   until     "YYYY-MM-DD" last day a repeating event happens (optional)
   location  short text (optional)
   image     path to a flyer/photo (used for featured events)
   link      where "Learn more" goes (optional)
   featured  true = shows in the Upcoming Events slider

   For repeating events, "start" is just the first meeting;
   it keeps repeating on that same weekday and time.
========================================================= */
window.IGNITE_EVENTS_SAMPLE = false;

window.IGNITE_EVENTS = [
  { id: 'sunday', title: 'Sunday Service',
    start: '2026-01-04T10:30', repeat: 'weekly',
    featured: true, image: 'images/map_church.webp' },

  { id: 'matrix', title: 'Matrix University',
    start: '2026-01-05T19:00', repeat: 'weekly',
    featured: true, image: 'images/MATRIXU.webp',
    link: 'https://www.matrixuniversity.online/' },

  { id: 'her', title: 'IGNITEHer',
    start: '2026-01-06T19:00', repeat: 'weekly',
    featured: true, image: 'images/IgniteHer.webp',
    link: 'https://ignite-church-445102.churchcenter.com/groups/unique/igniteher-women-s-group-chat' },

  { id: '400m', title: "400M Men's Meeting",
    start: '2026-01-07T19:00', repeat: 'weekly',
    featured: true, image: 'images/400M.webp',
    link: 'https://ignite-church-445102.churchcenter.com/registrations/events/2549312' }
];
