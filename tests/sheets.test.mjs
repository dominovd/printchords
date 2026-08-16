import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { blankSheets, blankImagePath, blankPage } from '../src/data/blanks.mjs';
import { allPrintables } from '../src/lib/printables.mjs';
import { blankSheetSvg, fretboardGroup, BLANK_SHAPE, BLANK_OPTIONS } from '../src/lib/diagram.mjs';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

test('a blank sheet has no dots, no barres and no string markers', () => {
  for (const sheet of blankSheets) {
    const svg = blankSheetSvg(sheet);
    assert.equal((svg.match(/<circle /g) || []).length, 0, `${sheet.id}: has a finger dot`);
    assert.equal((svg.match(/>O</g) || []).length, 0, `${sheet.id}: has an open-string marker`);
    assert.equal((svg.match(/>X</g) || []).length, 0, `${sheet.id}: has a muted-string marker`);
  }
});

test('a blank sheet draws exactly as many grids and name lines as it promises', () => {
  for (const sheet of blankSheets) {
    const svg = blankSheetSvg(sheet);
    const grids = (svg.match(/<g transform=/g) || []).length;
    // Six strings and six fret lines per grid, plus one name rule per cell.
    const lines = (svg.match(/<line /g) || []).length;
    assert.equal(grids, sheet.count, `${sheet.id}: ${grids} grids, expected ${sheet.count}`);
    assert.equal(lines, sheet.count * 13, `${sheet.id}: wrong number of lines`);
  }
});

test('the blank fretboard is the same renderer with the markers turned off', () => {
  const core = fretboardGroup(BLANK_SHAPE, BLANK_OPTIONS);
  for (const sheet of blankSheets) {
    assert.ok(blankSheetSvg(sheet).includes(core), `${sheet.id}: blank grid diverges from the renderer`);
  }
});

test('every printable has a generated PNG on disk', () => {
  for (const sheet of allPrintables()) {
    assert.ok(sheet.png.startsWith('/img/'), `${sheet.id}: odd image path ${sheet.png}`);
    assert.ok(
      existsSync(join(publicDir, sheet.png)),
      `${sheet.id}: ${sheet.png} is missing — run npm run assets`
    );
    assert.ok(sheet.alt && sheet.alt.length > 20, `${sheet.id}: weak alt text`);
  }
});

test('the download hub lists every chart and every blank sheet', () => {
  const ids = allPrintables().map((s) => s.id);
  for (const sheet of blankSheets) assert.ok(ids.includes(sheet.id), `${sheet.id} missing from the hub`);
  assert.ok(ids.includes('guitar-chord-chart'));
  assert.ok(ids.includes('beginner-chord-chart'));
});

test('blank page copy exists and is not boilerplate', () => {
  assert.ok(blankPage.intro.join(' ').split(/\s+/).length > 120, 'intro is too thin to differentiate the page');
  assert.ok(blankPage.faq.length >= 4);
});
