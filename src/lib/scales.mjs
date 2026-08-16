/**
 * Scales: the note maths, and the shapes a neck diagram needs.
 *
 * The scales cluster is the cleanest part of the plan, with AI Overview at 0% on
 * all sixteen keys, so this stays as data-driven as the chords: a scale is a
 * list of intervals, everything else is computed.
 */

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Open strings, low to high, as pitch classes and MIDI numbers. */
export const STRINGS = [
  { name: 'E', label: 'low E', midi: 40 },
  { name: 'A', label: 'A', midi: 45 },
  { name: 'D', label: 'D', midi: 50 },
  { name: 'G', label: 'G', midi: 55 },
  { name: 'B', label: 'B', midi: 59 },
  { name: 'E', label: 'high E', midi: 64 },
];

/** The twelve keys, spelled the way guitarists write them. */
export const KEYS = [
  { id: 'c', name: 'C', pc: 0 },
  { id: 'c-sharp', name: 'C#', pc: 1 },
  { id: 'd', name: 'D', pc: 2 },
  { id: 'e-flat', name: 'Eb', pc: 3 },
  { id: 'e', name: 'E', pc: 4 },
  { id: 'f', name: 'F', pc: 5 },
  { id: 'f-sharp', name: 'F#', pc: 6 },
  { id: 'g', name: 'G', pc: 7 },
  { id: 'a-flat', name: 'Ab', pc: 8 },
  { id: 'a', name: 'A', pc: 9 },
  { id: 'b-flat', name: 'Bb', pc: 10 },
  { id: 'b', name: 'B', pc: 11 },
];

export const DEFAULT_KEY = 'a';

/**
 * Degrees are written out rather than numbered 1-7, because on a black and
 * white print a flattened third has to be readable as a flattened third.
 */
export const SCALES = [
  {
    id: 'minor-pentatonic',
    name: 'Minor pentatonic',
    chartName: 'minor pentatonic scale',
    intervals: [0, 3, 5, 7, 10],
    degrees: ['R', 'b3', '4', '5', 'b7'],
    summary: 'Five notes and no wrong ones. Nearly every rock and blues solo you know starts here.',
    bestFor: 'First scale for soloing',
  },
  {
    id: 'major-pentatonic',
    name: 'Major pentatonic',
    chartName: 'major pentatonic scale',
    intervals: [0, 2, 4, 7, 9],
    degrees: ['R', '2', '3', '5', '6'],
    summary: 'The same five-note idea with a brighter sound. Country, folk and most singalong melodies live in it.',
    bestFor: 'Bright, melodic playing',
  },
  {
    id: 'blues',
    name: 'Blues scale',
    chartName: 'blues scale',
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['R', 'b3', '4', 'b5', '5', 'b7'],
    chromaticDegrees: ['b5'],
    summary: 'The minor pentatonic with one extra note between the fourth and fifth. That note is the whole sound.',
    bestFor: 'Blues and rock phrasing',
  },
  {
    id: 'major',
    name: 'Major scale',
    chartName: 'major scale',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['R', '2', '3', '4', '5', '6', '7'],
    summary: 'Seven notes, and the reference every other scale is described against. Worth knowing where the roots are.',
    bestFor: 'Understanding everything else',
  },
  {
    id: 'natural-minor',
    name: 'Natural minor',
    chartName: 'natural minor scale',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['R', '2', 'b3', '4', '5', 'b6', 'b7'],
    summary: 'The major scale started from its sixth note. Same notes as its relative major, different centre of gravity.',
    bestFor: 'Minor-key songs',
  },
];

/**
 * The five minor-pentatonic positions. They are not fixed fret offsets: on each
 * string a position takes the next two scale notes, which is why box 3 needs a
 * stretch on the G string and box 1 does not.
 */
export const PENTATONIC_BOXES = [
  { id: 'box-1', name: 'Box 1', note: 'The shape almost everyone starts with. Its root sits under the index finger on the low E string, so finding it in a new key is one move.' },
  { id: 'box-2', name: 'Box 2', note: 'Starts on the note box 1 ended on. Practise crossing between the two before adding any of the others.' },
  { id: 'box-3', name: 'Box 3', note: 'The one with a stretch on the G string. It sits in the middle of the neck where bends are easiest.' },
  { id: 'box-4', name: 'Box 4', note: 'Roots on the fifth and third strings. Useful when a solo needs to sit above the vocal.' },
  { id: 'box-5', name: 'Box 5', note: 'Leads straight back into box 1 an octave higher, which closes the loop up the neck.' },
];

/**
 * Alt text and pin descriptions say "<key> <chartName> chart". The scale's own
 * name cannot be reused there: "Blues scale" would come out as
 * "C blues scale scale chart".
 */
export const scaleAltText = (scale, key) =>
  `${key.name} ${scale.chartName} chart for guitar, printable`;

export const getScale = (id) => {
  const scale = SCALES.find((s) => s.id === id);
  if (!scale) throw new Error(`Unknown scale: ${id}`);
  return scale;
};

export const getKey = (id) => KEYS.find((k) => k.id === id) || KEYS.find((k) => k.id === DEFAULT_KEY);

export const noteName = (pc) => PITCH_NAMES[((pc % 12) + 12) % 12];

const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** How many letter names each degree moves from the root: b3 and 3 are both thirds. */
const DEGREE_LETTER_STEP = { R: 0, 2: 1, b3: 2, 3: 2, 4: 3, b5: 4, 5: 4, b6: 5, 6: 5, b7: 6, 7: 6 };

/**
 * Spell a scale the way it is written rather than the way a pitch-class table
 * would print it: C minor pentatonic is C Eb F G Bb, not C D# F G A#. Each
 * degree takes its own letter, and the accidental is whatever makes the pitch
 * come out right.
 */
export function scaleNotes(scale, key) {
  const rootIndex = LETTERS.indexOf(key.name[0]);
  const chromatic = new Set(scale.chromaticDegrees || []);
  return scale.intervals.map((semitones, i) => {
    const degree = scale.degrees[i];
    const wanted = ((key.pc + semitones) % 12 + 12) % 12;
    const step = DEGREE_LETTER_STEP[degree];
    // A passing note outside the seven-note framework, the flattened fifth of
    // the blues scale, has no correct letter, and forcing one produces Fb or
    // Bbb. Those get the plain name instead.
    if (step === undefined || chromatic.has(degree)) return FLAT_NAMES[wanted];
    const letter = LETTERS[(rootIndex + step) % 7];
    let offset = ((wanted - LETTER_PITCH[letter]) % 12 + 12) % 12;
    if (offset > 6) offset -= 12;
    if (Math.abs(offset) > 1) return FLAT_NAMES[wanted];
    return letter + (offset > 0 ? '#' : offset < 0 ? 'b' : '');
  });
}

/**
 * Every place the scale falls on the neck inside a fret window.
 * @returns {Array<{string:number, fret:number, degree:string, root:boolean}>}
 */
export function neckPositions(scale, key, { fromFret = 0, toFret = 12 } = {}) {
  const out = [];
  STRINGS.forEach((string, index) => {
    for (let fret = fromFret; fret <= toFret; fret++) {
      const pc = (string.midi + fret) % 12;
      const degreeIndex = scale.intervals.indexOf(((pc - key.pc) % 12 + 12) % 12);
      if (degreeIndex === -1) continue;
      out.push({
        string: index,
        fret,
        degree: scale.degrees[degreeIndex],
        root: degreeIndex === 0,
      });
    }
  });
  return out;
}

/** The lowest fret where the scale's root sits on the low E string. */
export function rootFretOnLowE(key) {
  return ((key.pc - STRINGS[0].midi) % 12 + 12) % 12;
}

/** Every fret in 0..24 where a scale tone falls on one string. */
function scaleFretsOnString(scale, key, stringIndex, fromFret) {
  const out = [];
  for (let fret = fromFret; fret <= 24; fret++) {
    const pc = (STRINGS[stringIndex].midi + fret) % 12;
    if (scale.intervals.includes(((pc - key.pc) % 12 + 12) % 12)) out.push(fret);
  }
  return out;
}

/**
 * One pentatonic position. On every string it takes the next two scale notes
 * counting up from the root on the low E string, which is how the five boxes
 * are actually built. A fixed four-fret window gets box 3 wrong.
 */
export function pentatonicBox(key, boxIndex, scale = getScale('minor-pentatonic')) {
  const anchor = rootFretOnLowE(key);
  const positions = [];
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const frets = scaleFretsOnString(scale, key, stringIndex, anchor);
    for (const fret of frets.slice(boxIndex, boxIndex + 2)) {
      const pc = (STRINGS[stringIndex].midi + fret) % 12;
      const degreeIndex = scale.intervals.indexOf(((pc - key.pc) % 12 + 12) % 12);
      positions.push({
        string: stringIndex,
        fret,
        degree: scale.degrees[degreeIndex],
        root: degreeIndex === 0,
      });
    }
  }
  const frets = positions.map((p) => p.fret);
  const notes = { fromFret: Math.min(...frets), toFret: Math.max(...frets) };
  return { positions, notes, window: drawWindow(notes) };
}

/**
 * The fret wires a diagram needs in order to show a range of notes. A note on
 * fret 5 sits in the cell between wire 4 and wire 5, so the window has to open
 * one wire earlier than the first note.
 */
export function drawWindow({ fromFret, toFret }) {
  return { fromFret: Math.max(0, fromFret - 1), toFret };
}

export const scaleUrl = (scale) =>
  scale.id === 'minor-pentatonic' ? '/guitar-scales/pentatonic/' : '/guitar-scales/';

