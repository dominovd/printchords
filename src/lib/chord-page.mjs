/**
 * Everything a chord page says that is not written by hand: which keys the
 * chord belongs to, which strings to strum, and the FAQ answers that depend on
 * the shapes themselves.
 */
import { difficulty, fretSpan, getChord } from './chords.mjs';

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_FOR = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'F#', 'G#': 'Ab', 'A#': 'Bb' };

function transpose(root, semitones) {
  const index = PITCH_NAMES.indexOf(root);
  if (index < 0) return root;
  const name = PITCH_NAMES[(index + semitones + 120) % 12];
  return FLAT_FOR[name] || name;
}

/**
 * Keys the chord is diatonic to. A major triad is I in its own key, IV a fifth
 * above and V a fourth above; its relative minor sits a minor third below.
 */
export function commonKeys(chord) {
  const r = chord.root;
  if (chord.quality === 'minor') {
    return [
      `${r} minor`,
      `${transpose(r, 3)} major`,
      `${transpose(r, -2)} major`,
      `${transpose(r, -4)} major`,
    ];
  }
  return [
    `${r} major`,
    `${transpose(r, 5)} major`,
    `${transpose(r, 7)} major`,
    `${transpose(r, -3)} minor`,
  ];
}

const STRING_NAMES = ['low E', 'A', 'D', 'G', 'B', 'high E'];

/** Plain-language strumming instruction, read straight off the shape. */
export function strummingAdvice(shape) {
  const muted = shape.positions
    .map((p, i) => (p < 0 ? i : null))
    .filter((i) => i !== null);
  if (!muted.length) return 'All six strings are part of this shape, so you can strum from the low E string down.';
  const lowest = shape.positions.findIndex((p) => p >= 0);
  const names = muted.map((i) => `${STRING_NAMES[i]} string`);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return `Leave the ${list} out and start the strum from the ${STRING_NAMES[lowest]} string. The X above the nut marks every string that stays silent.`;
}

const CHORD_TEASER = {
  'g-major': 'Four fingerings, including the movable barre at the third fret.',
  'd-major': 'Three fingers on the top four strings, plus the movable A shape at the fifth fret.',
  'a-major': 'Three fingers in one fret, plus a one-finger version for when the hand runs out of room.',
  'b-major': 'No open shape, so it is a barre from the start, with a three-string version you can use today.',
  'b-minor': 'The barre that stops most beginners. Two full grips and an easy three-string stand-in.',
};

export function chordTeaser(chordId) {
  return CHORD_TEASER[chordId] || getChord(chordId).variants[0].summary;
}

/** FAQ built from the shapes on the page, not from a template. */
export function chordFaq(chord) {
  const byEase = [...chord.variants].sort(
    (a, b) => ['Easy', 'Moderate', 'Hard'].indexOf(difficulty(a)) - ['Easy', 'Moderate', 'Hard'].indexOf(difficulty(b))
  );
  const easiest = byEase[0];
  const movable = chord.variants.find((v) => v.barre && v.barre.fromString === 6);
  const primary = chord.variants.find((v) => v.id === chord.primaryVariant) || chord.variants[0];

  const items = [
    {
      q: `Which ${chord.name} fingering should a beginner use?`,
      a: `${easiest.label}. ${easiest.summary} Once it lands cleanly every time, the other shapes on this page are worth adding, because each one buys you something different.`,
    },
    {
      q: 'Why are there several ways to play the same chord?',
      a: `They contain the same notes, ${chord.notes.join(', ')}, but they put your hand in different places. Which one is right depends on the chord you are moving to next and on how much of the neck the song uses, not on which one is "correct".`,
    },
    {
      q: `Which strings do I strum for ${chord.name}?`,
      a: strummingAdvice(primary),
    },
    {
      q: 'Can I print just one shape?',
      a: 'Yes. Each shape has its own Print button and its own printable card, so you can put a single fingering on the wall instead of the whole page. The PNG download is the same image at 1000 × 1500, sized for a phone or a Pinterest board.',
    },
  ];

  if (movable) {
    items.splice(2, 0, {
      q: `Is the ${chord.name} barre shape worth learning?`,
      a: `Yes, because it moves. ${movable.summary} The grip costs more up front and then keeps paying for itself in every key.`,
    });
  }
  return items;
}

export function factRows(chord, shape) {
  return [
    { label: 'Notes', value: chord.notes.join(' · ') },
    { label: 'Fret span', value: fretSpan(shape).label },
    { label: 'Difficulty', value: difficulty(shape) },
    { label: 'Best for', value: shape.bestFor },
  ];
}
