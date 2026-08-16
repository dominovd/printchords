/**
 * Chart pages: the collection template. One entry per URL from the page map.
 * `chords` lists chord ids in the order they appear on the sheet; the diagrams
 * come from chords.json, so a chart never carries a drawing of its own.
 */

export const charts = [
  {
    id: 'guitar-chord-chart',
    // The head term lives on the root rather than on a keyword slug: the root is
    // what gets typed, linked and pinned, and the slug is a weak signal next to
    // the title and the sheet itself.
    url: '/',
    navLabel: 'Chord Chart',
    title: 'Guitar Chord Chart',
    metaTitle: 'Guitar Chord Chart: 12 Essential Chords, Free Printable',
    metaDescription:
      'A free printable guitar chord chart with the 12 chords most songs are built from. Print it, save it as PDF or take the PNG. A4 and US Letter.',
    lead: '12 essential guitar chords. Print the full chart or save it for later.',
    sheetSubtitle: '12 essential chords · standard tuning',
    imageAlt: 'Guitar chord chart with 12 essential chords, printable',
    chords: [
      'c-major', 'd-major', 'e-major', 'g-major',
      'a-major', 'a-minor', 'd-minor', 'e-minor',
      'f-major', 'b-minor', 'b-dominant-7', 'd-dominant-7',
    ],
    intro: [
      'These twelve chords cover most of what a beginner songbook asks for. Eight are open shapes that use the fretting hand lightly; The other four, F, Bm, B7 and D7, turn up as soon as a song leaves the easiest keys.',
      'A sensible order is Em, A and D first, because they share fingers and frets, then C and G, then Am and Dm. Leave F and Bm until the open shapes are automatic: they are barre chords and they need hand strength that comes from playing rather than from drilling the grip on its own.',
      'The sheet prints in black and white on A4 and US Letter with nothing cut off, which is the point of it. Pin it up where you practise instead of keeping it on a screen.',
    ],
    steps: [
      { title: 'Learn the shapes', text: 'Get comfortable with each shape and where the fingers land before worrying about speed.' },
      { title: 'Practise transitions', text: 'Move between two chords slowly and cleanly. Accuracy first; speed follows on its own.' },
      { title: 'Play real songs', text: 'Apply what you have learned to simple songs that use these chords. That is where it sticks.' },
    ],
    faq: [
      {
        q: 'How do I read these chord diagrams?',
        a: 'The six vertical lines are the strings, low E on the left and high E on the right. The horizontal lines are frets, and the thick line at the top is the nut. A numbered dot shows which finger presses which string. An O above a string means play it open; an X means leave it out.',
      },
      {
        q: 'Which fingers should I use?',
        a: '1 is the index finger, 2 the middle, 3 the ring and 4 the little finger. Every dot on every diagram follows that scheme. Where a chord has more than one common fingering, the individual chord pages show each one separately.',
      },
      {
        q: 'Can I use a capo with these chords?',
        a: 'Yes. A capo moves every shape up the neck without changing the grip, so a G shape with a capo at the second fret sounds as A. The diagrams stay the same, but count frets from the capo rather than from the nut.',
      },
      {
        q: 'Is the printable chart free?',
        a: 'Yes, and there is no sign-up. Print it straight from the page, save it as a PDF through the print dialog, or download the PNG for a phone or a Pinterest board.',
      },
    ],
  },
  {
    id: 'beginner-chord-chart',
    navLabel: 'Beginner',
    title: 'Beginner Chord Chart',
    metaTitle: 'Beginner Guitar Chord Chart: 8 Easy Chords, Free Printable',
    metaDescription:
      'A free printable beginner guitar chord chart: eight easy open chords in a practical order, no barre shapes. Print it or take the PNG.',
    lead: 'Eight easy open chords, in the order they are worth learning. No barre shapes.',
    sheetSubtitle: '8 easy open chords · no barre shapes',
    imageAlt: 'Beginner guitar chord chart with 8 easy open chords, printable',
    chords: ['e-minor', 'a-minor', 'd-major', 'a-major', 'c-major', 'g-major', 'e-major', 'd-minor'],
    intro: [
      'Every chord here is an open shape: at least one string rings without being pressed, and no finger has to hold down more than one string at a time. That is what makes them playable in a first week.',
      'The order matters more than the list. Em and Am come first because they use two and three fingers in adjacent frets, and moving between them changes almost nothing. D and A follow, then C and G, which are the two shapes that take the longest to make clean. E and Dm round the set out.',
      'Nothing on this sheet is a barre chord. When these eight feel automatic, the full chord chart adds F, Bm, B7 and D7, and that is the right moment for them, not before.',
    ],
    steps: [
      { title: 'Two chords at a time', text: 'Pick a pair and move between them for a minute without stopping. Two clean chords beat eight rough ones.' },
      { title: 'Check every string', text: 'Play the chord one string at a time. A buzz usually means a finger is flat rather than arched.' },
      { title: 'Add the strumming hand last', text: 'Once the shape lands reliably, keep a steady strum going and let the chords change on the beat.' },
    ],
    faq: [
      {
        q: 'What is the easiest guitar chord to start with?',
        a: 'E minor. It uses two fingers in the same fret on neighbouring strings and all six strings ring, so there is nothing to mute and very little to get wrong.',
      },
      {
        q: 'How long does it take to learn these eight chords?',
        a: 'Most people can play all eight recognisably within a few weeks of short daily practice. Changing between them cleanly at song speed takes longer, and that is the part worth spending the time on.',
      },
      {
        q: 'Why are there no barre chords here?',
        a: 'Barre chords need hand strength that builds up from playing open chords first. Starting with F or Bm usually produces a muted, buzzing sound and a lot of discouragement. They are on the full guitar chord chart for when you are ready.',
      },
      {
        q: 'Do I strum all six strings on every chord?',
        a: 'No. Each diagram marks the strings that stay out of the chord with an X above the nut. A, C and Dm all leave at least one low string out. Aim the strum at the first string without an X.',
      },
    ],
  },
  {
    id: 'power-chords-chart',
    navLabel: 'Power Chords',
    title: 'Power Chords Chart',
    metaTitle: 'Guitar Power Chords Chart: Free Printable, All Shapes',
    metaDescription:
      'A free printable guitar power chords chart: the open shapes and the two movable ones that cover every power chord on the neck. Print it or take the PNG.',
    lead: 'Eight power chords, and the two movable shapes that give you all the rest.',
    sheetSubtitle: '8 power chords · two movable shapes',
    imageAlt: 'Guitar power chords chart with 8 shapes, printable',
    chords: ['e5', 'a5', 'd5', 'f5', 'g5', 'b5', 'c5', 'd5-fifth-fret'],
    intro: [
      'A power chord is two notes: the root and the fifth, usually with the root doubled an octave up. It is neither major nor minor, which is exactly why it works under distortion where a full chord turns to mud.',
      'There are really only two shapes here. One is rooted on the sixth string, one on the fifth, and both slide anywhere on the neck. Learn F5 at the first fret and you have every chord with a root on the low E string; learn B5 at the second and you have the rest. The open E5, A5 and D5 are the same idea with an open string doing the work.',
      'The hand that matters is the other one. Power chords live and die on muting: let the strings you are not playing ring and the whole thing collapses. Rest the side of your strumming hand lightly on the bridge and keep the unused strings damped with the fretting hand.',
    ],
    steps: [
      { title: 'Two fingers first', text: 'Index on the root, ring finger two frets up on the next string. That is the whole shape.' },
      { title: 'Add the octave', text: 'The little finger doubles the root one string higher. It makes the chord thicker, not different.' },
      { title: 'Move it', text: 'Slide the shape and read the root off the fret. Two shapes cover the neck.' },
    ],
    faq: [
      {
        q: 'What is a power chord?',
        a: 'Two notes: the root and the fifth above it, often with the root doubled an octave higher. It has no third, so it is neither major nor minor, and that is why the same shape fits over both.',
      },
      {
        q: 'Why are power chords written with a 5?',
        a: 'The 5 says the chord contains the root and the fifth and nothing else. E5 is E and B; A5 is A and E. It is a description of the notes rather than a chord quality.',
      },
      {
        q: 'How many power chord shapes do I need?',
        a: 'Two. One rooted on the sixth string and one on the fifth. Both are movable, so between them they cover every power chord on the neck; the open shapes are a convenience, not a separate thing to learn.',
      },
      {
        q: 'Do I strum all the strings?',
        a: 'No, and this is the part that takes practice. Only the two or three strings in the shape should sound. Mute the rest with the side of the fretting hand and keep the strum tight.',
      },
    ],
  },
];

export const charts_by_id = Object.fromEntries(charts.map((c) => [c.id, c]));

/** The chart served from the root. */
export const rootChart = charts.find((c) => c.url === '/') || charts[0];

export function chartUrl(chart) {
  return chart.url || `/${chart.id}/`;
}

export function getChart(id) {
  const chart = charts_by_id[id];
  if (!chart) throw new Error(`Unknown chart id: ${id}`);
  return chart;
}

/** Charts whose sheet includes a given chord. */
export function chartsContaining(chordId) {
  return charts.filter((chart) => chart.chords.includes(chordId));
}
