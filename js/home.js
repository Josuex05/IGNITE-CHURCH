/* Home page: one Bible verse (KJV, public domain) that changes every day. */
(function () {
  var VERSES = [
    ["John 3:16", "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."],
    ["Psalm 119:105", "Thy word is a lamp unto my feet, and a light unto my path."],
    ["John 8:12", "I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life."],
    ["Jeremiah 29:11", "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."],
    ["Philippians 4:13", "I can do all things through Christ which strengtheneth me."],
    ["Proverbs 3:5-6", "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."],
    ["Psalm 46:1", "God is our refuge and strength, a very present help in trouble."],
    ["Matthew 11:28", "Come unto me, all ye that labour and are heavy laden, and I will give you rest."],
    ["Psalm 23:1", "The LORD is my shepherd; I shall not want."],
    ["Romans 8:28", "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."],
    ["Hebrews 11:1", "Now faith is the substance of things hoped for, the evidence of things not seen."],
    ["Psalm 27:1", "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?"],
    ["Matthew 6:33", "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."],
    ["Lamentations 3:22-23", "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness."],
    ["Psalm 34:8", "O taste and see that the LORD is good: blessed is the man that trusteth in him."],
    ["Matthew 5:16", "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven."],
    ["Romans 15:13", "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost."],
    ["Psalm 37:4", "Delight thyself also in the LORD; and he shall give thee the desires of thine heart."]
  ];

  var box = document.getElementById("verseText");
  if (!box) return;

  var now = new Date();
  var startOfYear = new Date(now.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((now - startOfYear) / 86400000);
  var v = VERSES[dayOfYear % VERSES.length];

  var bq = document.createElement("blockquote");
  bq.textContent = v[1];
  var cap = document.createElement("figcaption");
  cap.textContent = v[0] + " \u00B7 KJV";
  box.appendChild(bq);
  box.appendChild(cap);

  /* if a long verse does not fit its tab, shrink it a little */
  var tab = box.closest(".hp-tab");
  var size = 1;
  while (tab && tab.scrollHeight > tab.clientHeight + 1 && size > 0.78) {
    size -= 0.04;
    bq.style.fontSize = size + "rem";
  }
})();