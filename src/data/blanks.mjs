/**
 * Blank chord sheets: empty grids to fill in by hand.
 *
 * `blank guitar chord chart` is 590 a month at KD 9, the cheapest entry in the
 * whole plan, and the first result is a music school with a single page of
 * blanks. Nobody is holding this.
 */

export const blankSheets = [
  {
    id: 'blank-12',
    title: 'Blank Chord Chart',
    subtitle: '12 diagrams · write your own shapes',
    columns: 3,
    count: 12,
    label: '12 per page',
    description: 'The everyday size. Room to write the chord name under each grid without crowding the page.',
    bestFor: 'Practice notes and lesson handouts',
    imageAlt: 'Blank guitar chord chart with 12 empty chord diagrams, printable',
  },
  {
    id: 'blank-24',
    title: 'Blank Chord Chart',
    subtitle: '24 diagrams · write your own shapes',
    columns: 4,
    count: 24,
    label: '24 per page',
    description: 'Twice the grids on one page, for a whole song or a set of variations without turning over.',
    bestFor: 'Songs and long chord runs',
    imageAlt: 'Blank guitar chord chart with 24 empty chord diagrams, printable',
  },
  {
    id: 'blank-6',
    title: 'Blank Chord Chart',
    subtitle: '6 large diagrams · write your own shapes',
    columns: 2,
    count: 6,
    label: '6 large',
    description: 'Big grids for young students, thick pens and anything that goes on a wall.',
    bestFor: 'Beginners and classroom walls',
    imageAlt: 'Blank guitar chord chart with 6 large empty chord diagrams, printable',
  },
];

export const blankPage = {
  url: '/blank-chord-chart/',
  h1: 'Blank Guitar Chord Chart',
  metaTitle: 'Blank Guitar Chord Chart: Free Printable Diagram Sheets',
  metaDescription:
    'Free printable blank guitar chord charts: empty chord diagrams in three sizes, 6, 12 or 24 to a page. A4 and US Letter, no sign-up.',
  lead: 'Empty chord diagrams to fill in by hand. Three sizes, all free to print.',
  intro: [
    'A blank chord chart is for the shapes that are not in any book: the voicing a teacher shows you in a lesson, the grip you worked out for one awkward bar, the four chords a student needs by next week. Writing a shape down by hand also fixes it in memory in a way that reading one does not.',
    'Fill them in the same way the diagrams on this site are drawn. The six vertical lines are the strings, low E on the left. The thick line at the top is the nut. Put a dot where a finger presses, write 1 to 4 in it for index, middle, ring and little finger, and mark the strings above the nut: O for an open string, X for one you leave out. If the shape sits further up the neck, write the fret number beside the top row.',
    'Choose the density by what you are doing. Twelve to a page suits practice notes, twenty-four fits a whole song, and the six large grids are the ones to hand a child or pin on a classroom wall.',
  ],
  faq: [
    {
      q: 'How do I fill in a blank chord chart?',
      a: 'Draw a dot on the string and fret where each finger goes, and write the finger number inside it: 1 index, 2 middle, 3 ring, 4 little finger. Above the nut, write O over any string you play open and X over any string you do not play. Write the chord name on the line underneath.',
    },
    {
      q: 'Which size should I print?',
      a: 'Twelve diagrams to a page is the everyday choice. Take twenty-four when you are writing out a whole song and want it on one sheet, and the six large grids when the reader is a beginner, a child, or the page is going on a wall.',
    },
    {
      q: 'Can I use these sheets with my students?',
      a: 'Yes. They are free, there is no sign-up and no limit on how many you print. The only thing on the page besides the grids is printchords.com in small type at the bottom, so a student can find their way back to the filled-in versions.',
    },
    {
      q: 'Do the sheets fit A4 and US Letter?',
      a: 'Both. The grids are laid out with enough margin that neither paper size crops anything, and everything is pure black and white, so a cheap printer with a tired cartridge still gives you usable diagrams.',
    },
  ],
};

export function blankImagePath(sheet) {
  return `/img/blanks/${sheet.id}-printable.png`;
}
