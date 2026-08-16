/**
 * Chord data access and everything derived from it.
 *
 * Nothing about a chord is written twice: note names, fret span and difficulty
 * are computed from `positions` / `fingers`, so prose can never drift away from
 * the diagram.
 */
import data from '../data/chords.json' with { type: 'json' };

export const TUNING = data.tuning;

/** Open-string pitches in standard tuning, low to high, as semitones from C0. */
const OPEN_STRING_SEMITONES = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4 (MIDI)
const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ENHARMONIC = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

/** Note name sounded by a string at a given fret. */
export function noteAt(stringIndex, fret) {
  return PITCH_NAMES[(OPEN_STRING_SEMITONES[stringIndex] + fret) % 12];
}

/** Every note a shape actually sounds, low string to high. */
export function soundedNotes(shape) {
  return shape.positions
    .map((fret, i) => (fret < 0 ? null : noteAt(i, fret)))
    .filter(Boolean);
}

/** Unique pitch classes in a shape, order-independent. */
export function pitchClasses(shape) {
  return [...new Set(soundedNotes(shape))];
}

/** True when the shape sounds exactly the chord tones and nothing else. */
export function shapeMatchesChord(chord, shape) {
  const expected = new Set(chord.notes.map(normalisePitch));
  const actual = new Set(pitchClasses(shape).map(normalisePitch));
  if (actual.size !== expected.size) return false;
  for (const note of actual) if (!expected.has(note)) return false;
  return true;
}

function normalisePitch(note) {
  const sharp = Object.entries(ENHARMONIC).find(([, flat]) => flat === note);
  return sharp ? sharp[0] : note;
}

/** Frets actually pressed, ignoring open and muted strings. */
function frettedFrets(shape) {
  return shape.positions.filter((p) => p > 0);
}

export function fretSpan(shape) {
  const frets = frettedFrets(shape);
  if (!frets.length) return { low: 0, high: 0, span: 0, label: 'Open strings only' };
  const low = Math.min(...frets);
  const high = Math.max(...frets);
  const span = high - low + 1;
  return { low, high, span, label: low === high ? `Fret ${low}` : `Frets ${low}–${high}` };
}

export function fingersUsed(shape) {
  return new Set(shape.fingers.filter((f) => f > 0)).size;
}

/**
 * A three-step difficulty read off the shape itself: how many fingers are
 * involved, whether one of them has to barre, and how far the hand has to
 * stretch.
 */
export function difficulty(shape) {
  const { span } = fretSpan(shape);
  const score = fingersUsed(shape) + (shape.barre ? 2 : 0) + (span >= 3 ? 1 : 0);
  if (score <= 3) return 'Easy';
  if (score <= 5) return 'Moderate';
  return 'Hard';
}

export function openStringCount(shape) {
  return shape.positions.filter((p) => p === 0).length;
}

export function mutedStringCount(shape) {
  return shape.positions.filter((p) => p < 0).length;
}

/* -------------------------------------------------------------------------- */

export const chords = data.chords;

export function getChord(id) {
  const chord = chords.find((c) => c.id === id);
  if (!chord) throw new Error(`Unknown chord id: ${id}`);
  return chord;
}

export function primaryVariant(chord) {
  return chord.variants.find((v) => v.id === chord.primaryVariant) || chord.variants[0];
}

export function getVariant(chord, variantId) {
  const variant = chord.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error(`Unknown variant ${variantId} on ${chord.id}`);
  return variant;
}

/** Chords that have their own page (only the five with no AI Overview). */
export function chordsWithPages() {
  return chords.filter((c) => Boolean(c.pageUrl));
}

/** Filename used for a variant's printable PNG. */
export function cardImagePath(chord, shape) {
  return `/img/chords/${chord.id}-${shape.id}-printable.png`;
}

export function sheetImagePath(chartId) {
  return `/img/charts/${chartId}-printable.png`;
}
