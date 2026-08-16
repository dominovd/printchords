import test from 'node:test';
import assert from 'node:assert/strict';

import { chords, shapeMatchesChord, pitchClasses, difficulty, fretSpan } from '../src/lib/chords.mjs';
import { charts } from '../src/data/charts.mjs';
import { fretboardGroup, diagramSvg, printableCardSvg, chartSheetSvg } from '../src/lib/diagram.mjs';

const everyShape = chords.flatMap((chord) => chord.variants.map((shape) => ({ chord, shape })));

test('every shape sounds the chord it claims', () => {
  for (const { chord, shape } of everyShape) {
    assert.ok(
      shapeMatchesChord(chord, shape),
      `${chord.id}/${shape.id} sounds ${pitchClasses(shape).join(' ')}, expected ${chord.notes.join(' ')}`
    );
  }
});

test('every fretted string gets exactly one marker', () => {
  for (const { chord, shape } of everyShape) {
    const svg = diagramSvg(shape, { label: chord.full });
    const dots = (svg.match(/<circle /g) || []).length;
    // In a bare diagram the only <rect> is the barre — the page background only
    // exists on the printable outputs.
    const barres = (svg.match(/<rect /g) || []).length;
    const frettedCount = shape.positions.filter((p) => p > 0).length;
    const barredCount = shape.barre
      ? shape.positions.filter(
          (p, i) =>
            p === shape.barre.fret &&
            shape.fingers[i] === shape.barre.finger &&
            i >= 6 - shape.barre.fromString &&
            i <= 6 - shape.barre.toString
        ).length
      : 0;
    // A barre draws one bar plus one dot on its low end, so the barred strings
    // collapse into a single marker instead of one each.
    const expectedDots = frettedCount - barredCount + (shape.barre ? 1 : 0);
    assert.equal(barres, shape.barre ? 1 : 0, `${chord.id}/${shape.id}: wrong number of barres`);
    assert.equal(dots, expectedDots, `${chord.id}/${shape.id}: ${dots} dots, expected ${expectedDots}`);
  }
});

test('no dot is drawn without a finger number', () => {
  for (const { chord, shape } of everyShape) {
    const svg = diagramSvg(shape, { label: chord.full });
    const dots = (svg.match(/<circle /g) || []).length;
    const labels = (svg.match(/fill="#ffffff">[1-4]<\/text>/g) || []).length;
    assert.equal(dots, labels, `${chord.id}/${shape.id}: an unlabelled marker would be drawn`);
  }
});

test('printable card and on-screen diagram draw the identical fretboard', () => {
  // The review that produced this project found a card and a diagram showing
  // different finger numbers for the same shape. They now come from one call,
  // and this test fails the build if that ever stops being true.
  for (const { chord, shape } of everyShape) {
    const core = fretboardGroup(shape);
    assert.ok(printableCardSvg(chord, shape).includes(core), `${chord.id}/${shape.id}: card diverges from the renderer`);
    assert.ok(
      diagramSvg(shape, { label: chord.full }).includes(fretboardGroup(shape, { scaleStroke: false })),
      `${chord.id}/${shape.id}: screen diagram diverges from the renderer`
    );
  }
});

test('chart sheets use the same renderer as the chart page', () => {
  for (const chart of charts) {
    const entries = chart.chords.map((id) => {
      const chord = chords.find((c) => c.id === id);
      assert.ok(chord, `${chart.id} references unknown chord ${id}`);
      const shape = chord.variants.find((v) => v.id === chord.primaryVariant);
      return { chord, shape };
    });
    const sheet = chartSheetSvg({ title: chart.title, subtitle: chart.sheetSubtitle, chords: entries });
    for (const { chord, shape } of entries) {
      assert.ok(sheet.includes(fretboardGroup(shape)), `${chart.id}: ${chord.id} on the sheet diverges from the renderer`);
    }
  }
});

test('svg output is well-formed enough to rasterise', () => {
  for (const { chord, shape } of everyShape) {
    const svg = printableCardSvg(chord, shape);
    // resvg parses the card as XML, so an unescaped quote inside an attribute
    // value is a build failure rather than a cosmetic problem.
    for (const value of svg.match(/="[^"]*"/g) || []) {
      assert.ok(!value.slice(2, -1).includes('"'), `${chord.id}/${shape.id}: quote inside an attribute value`);
    }
    assert.equal((svg.match(/<svg/g) || []).length, 1);
    assert.ok(svg.trimEnd().endsWith('</svg>'));
  }
});

test('copy on a chord page talks about playing, not about the software', () => {
  const banned = /\b(render(ed|er|ing)?|shared chord data|diagram system|pipeline|engine)\b/i;
  for (const chord of chords) {
    for (const shape of chord.variants) {
      assert.ok(!banned.test(shape.summary), `${chord.id}/${shape.id}: summary describes the software`);
    }
    if (chord.intro) assert.ok(!banned.test(chord.intro), `${chord.id}: intro describes the software`);
  }
});

test('derived facts stay inside their allowed values', () => {
  for (const { shape } of everyShape) {
    assert.ok(['Easy', 'Moderate', 'Hard'].includes(difficulty(shape)));
    const span = fretSpan(shape);
    assert.ok(span.span <= 5, 'a shape must fit inside the five-fret window');
  }
});

test('chord pages only exist for chords with page copy', () => {
  for (const chord of chords.filter((c) => c.pageUrl)) {
    assert.ok(chord.lead && chord.intro, `${chord.id}: page without copy`);
    assert.ok(chord.variants.length >= 2, `${chord.id}: a page with one shape is what an AI Overview already answers`);
  }
});
