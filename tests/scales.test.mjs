import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  KEYS, PENTATONIC_BOXES, SCALES, STRINGS, getKey, getScale,
  neckPositions, noteName, pentatonicBox, rootFretOnLowE, scaleAltText, scaleNotes,
} from '../src/lib/scales.mjs';
import {
  FULL_NECK, boxesImagePath, boxesSheetSvg, scaleImagePath, scaleSheetSvg,
} from '../src/lib/scale-sheets.mjs';
import { neckGroup, neckSvg } from '../src/lib/diagram.mjs';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

test('a scale on the neck only contains notes of that scale', () => {
  for (const key of KEYS) {
    for (const scale of SCALES) {
      const wanted = new Set(scale.intervals.map((i) => (key.pc + i) % 12));
      for (const note of neckPositions(scale, key, FULL_NECK)) {
        const pc = (STRINGS[note.string].midi + note.fret) % 12;
        assert.ok(wanted.has(pc), `${key.name} ${scale.id}: ${noteName(pc)} at string ${note.string} fret ${note.fret}`);
      }
    }
  }
});

test('roots are marked where the root note actually is', () => {
  for (const key of KEYS) {
    for (const scale of SCALES) {
      for (const note of neckPositions(scale, key, FULL_NECK)) {
        const pc = (STRINGS[note.string].midi + note.fret) % 12;
        assert.equal(note.root, pc === key.pc, `${key.name} ${scale.id}: root flag wrong at fret ${note.fret}`);
      }
    }
  }
});

test('scales are spelled with one letter per degree, no double accidentals', () => {
  for (const key of KEYS) {
    for (const scale of SCALES) {
      const notes = scaleNotes(scale, key);
      assert.equal(notes.length, scale.intervals.length);
      for (const note of notes) {
        assert.ok(/^[A-G](#|b)?$/.test(note), `${key.name} ${scale.id}: awkward spelling "${note}"`);
      }
      // The seven-note scales must use seven different letters.
      if (scale.intervals.length === 7) {
        assert.equal(new Set(notes.map((n) => n[0])).size, 7, `${key.name} ${scale.id}: repeated letter`);
      }
    }
  }
});

test('known scales are spelled the way they are written', () => {
  const cases = [
    ['c', 'minor-pentatonic', 'C Eb F G Bb'],
    ['a', 'minor-pentatonic', 'A C D E G'],
    ['e-flat', 'major', 'Eb F G Ab Bb C D'],
    ['f-sharp', 'major', 'F# G# A# B C# D# E#'],
    ['b-flat', 'blues', 'Bb Db Eb E F Ab'],
    ['a', 'natural-minor', 'A B C D E F G'],
  ];
  for (const [keyId, scaleId, expected] of cases) {
    assert.equal(scaleNotes(getScale(scaleId), getKey(keyId)).join(' '), expected, `${keyId} ${scaleId}`);
  }
});

test('pentatonic box 1 starts on the root of the low E string', () => {
  for (const key of KEYS) {
    const box = pentatonicBox(key, 0);
    assert.equal(box.notes.fromFret, rootFretOnLowE(key), `${key.name}: box 1 is not on the root`);
    const lowestOnLowE = box.positions.filter((p) => p.string === 0).sort((a, b) => a.fret - b.fret)[0];
    assert.ok(lowestOnLowE.root, `${key.name}: box 1 does not open on the root`);
  }
});

test('every box holds two notes per string and fits its own diagram', () => {
  for (const key of KEYS) {
    for (let index = 0; index < PENTATONIC_BOXES.length; index++) {
      const where = `${key.name} box ${index + 1}`;
      const { positions, notes, window } = pentatonicBox(key, index);
      assert.equal(positions.length, 12, `${where}: ${positions.length} notes, expected 12`);
      for (let string = 0; string < 6; string++) {
        assert.equal(positions.filter((p) => p.string === string).length, 2, `${where}: string ${string + 1}`);
      }
      assert.ok(window.fromFret < notes.fromFret || notes.fromFret === 0, `${where}: diagram opens too late`);
      for (const note of positions) {
        assert.ok(note.fret >= window.fromFret && note.fret <= window.toFret, `${where}: note outside the diagram`);
      }
    }
  }
});

test('the boxes join end to end up the neck', () => {
  for (const key of KEYS) {
    for (let index = 0; index < PENTATONIC_BOXES.length - 1; index++) {
      const here = pentatonicBox(key, index).notes;
      const next = pentatonicBox(key, index + 1).notes;
      assert.ok(next.fromFret > here.fromFret, `${key.name}: box ${index + 2} does not move up`);
      assert.ok(next.fromFret <= here.toFret, `${key.name}: box ${index + 2} leaves a gap after box ${index + 1}`);
    }
  }
});

test('scale sheets and on-screen necks come from one renderer', () => {
  const key = getKey('a');
  for (const scale of SCALES) {
    const core = neckGroup(neckPositions(scale, key, FULL_NECK), FULL_NECK);
    assert.ok(scaleSheetSvg(scale, key).includes(core), `${scale.id}: sheet diverges from the renderer`);
    assert.ok(
      neckSvg(neckPositions(scale, key, FULL_NECK), FULL_NECK, { label: 'x' })
        .includes(neckGroup(neckPositions(scale, key, FULL_NECK), FULL_NECK, { scaleStroke: false })),
      `${scale.id}: screen neck diverges from the renderer`
    );
  }
  const box = pentatonicBox(key, 0);
  assert.ok(boxesSheetSvg(key).includes(neckGroup(box.positions, box.window)));
});

test('every key has a generated PNG for every scale', () => {
  for (const key of KEYS) {
    for (const scale of SCALES) {
      const path = scaleImagePath(scale, key);
      assert.ok(existsSync(join(publicDir, path)), `${path} is missing — run npm run assets`);
    }
    assert.ok(existsSync(join(publicDir, boxesImagePath(key))), `${boxesImagePath(key)} is missing`);
  }
});

test('sheet text stays inside the shipped font', () => {
  // Inter's static cuts have no U+266D, so a flat sign renders as tofu in the PNGs.
  const key = getKey('e-flat');
  for (const scale of SCALES) {
    const svg = scaleSheetSvg(scale, key);
    assert.ok(!/[♭♯♮]/.test(svg), `${scale.id}: musical accidental glyph in a PNG sheet`);
  }
});

test('alt text never doubles the word scale', () => {
  // "Blues scale" + " scale chart" used to come out as "C blues scale scale chart".
  for (const key of KEYS) {
    for (const scale of SCALES) {
      const alt = scaleAltText(scale, key);
      assert.ok(alt.startsWith(`${key.name} `), `${key.name} ${scale.id}: alt does not name the key`);
      assert.ok(!/scale\s+scale/i.test(alt), `${key.name} ${scale.id}: "${alt}"`);
      assert.ok(alt.length > 30 && alt.length < 90, `${key.name} ${scale.id}: alt length ${alt.length}`);
    }
  }
});
