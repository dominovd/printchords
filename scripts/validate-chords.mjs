/**
 * Data integrity checks. Run before every build: a chord whose diagram does not
 * sound the chord it claims should never reach a page.
 */
import { chords, shapeMatchesChord, soundedNotes, pitchClasses } from '../src/lib/chords.mjs';

const problems = [];
const warnings = [];

for (const chord of chords) {
  if (!chord.variants.length) problems.push(`${chord.id}: no variants`);
  if (!chord.variants.some((v) => v.id === chord.primaryVariant)) {
    problems.push(`${chord.id}: primaryVariant "${chord.primaryVariant}" is not in variants`);
  }
  if (chord.pageUrl && (!chord.lead || !chord.intro)) {
    problems.push(`${chord.id}: has a page but no lead/intro copy`);
  }

  const seen = new Set();
  for (const shape of chord.variants) {
    const where = `${chord.id}/${shape.id}`;
    if (seen.has(shape.id)) problems.push(`${where}: duplicate variant id`);
    seen.add(shape.id);

    if (shape.positions.length !== 6) problems.push(`${where}: positions must have 6 entries`);
    if (shape.fingers.length !== 6) problems.push(`${where}: fingers must have 6 entries`);

    shape.positions.forEach((fret, i) => {
      const finger = shape.fingers[i];
      if (fret > 0 && !(finger >= 1 && finger <= 4)) {
        problems.push(`${where}: string ${6 - i} is fretted at ${fret} but has finger "${finger}"`);
      }
      if (fret <= 0 && finger !== 0) {
        problems.push(`${where}: string ${6 - i} is open/muted but has finger ${finger}`);
      }
      if (fret > 0 && fret < shape.startFret) {
        problems.push(`${where}: fret ${fret} sits above startFret ${shape.startFret}`);
      }
      if (fret > 0 && fret > shape.startFret + 4) {
        problems.push(`${where}: fret ${fret} falls outside the 5-fret window from ${shape.startFret}`);
      }
    });

    // A finger can only be in two places at once if it is barring.
    const byFinger = new Map();
    shape.positions.forEach((fret, i) => {
      const finger = shape.fingers[i];
      if (fret > 0 && finger > 0) {
        if (!byFinger.has(finger)) byFinger.set(finger, []);
        byFinger.get(finger).push({ i, fret });
      }
    });
    for (const [finger, places] of byFinger) {
      if (places.length > 1) {
        const sameFret = places.every((p) => p.fret === places[0].fret);
        if (!shape.barre || shape.barre.finger !== finger || !sameFret) {
          problems.push(`${where}: finger ${finger} is on ${places.length} strings without a matching barre`);
        }
      }
    }

    if (shape.barre) {
      const { fret, fromString, toString, finger } = shape.barre;
      if (fromString <= toString) problems.push(`${where}: barre.fromString must be the lower string (6..1 numbering)`);
      const lo = 6 - fromString;
      const hi = 6 - toString;
      for (let i = lo; i <= hi; i++) {
        if (shape.positions[i] < fret && shape.positions[i] >= 0) {
          problems.push(`${where}: string ${6 - i} is fretted below the barre at ${fret}`);
        }
      }
      const barredStrings = shape.fingers.filter((f, i) => f === finger && shape.positions[i] === fret).length;
      if (barredStrings < 2) problems.push(`${where}: barre covers fewer than two strings`);
    }

    // Every string that is pressed must end up with a visible marker: either its
    // own dot or the barre. This is the check that catches an unlabelled dot.
    shape.positions.forEach((fret, i) => {
      if (fret <= 0) return;
      const finger = shape.fingers[i];
      const coveredByBarre =
        shape.barre &&
        finger === shape.barre.finger &&
        fret === shape.barre.fret &&
        i >= 6 - shape.barre.fromString &&
        i <= 6 - shape.barre.toString;
      if (!coveredByBarre && !(finger >= 1 && finger <= 4)) {
        problems.push(`${where}: string ${6 - i} would render a dot with no finger number`);
      }
    });

    if (!shapeMatchesChord(chord, shape)) {
      problems.push(
        `${where}: sounds ${pitchClasses(shape).join(' ')} (${soundedNotes(shape).join(' ')}) ` +
        `but ${chord.full} is ${chord.notes.join(' ')}`
      );
    }

    if (!shape.summary || shape.summary.length < 40) warnings.push(`${where}: summary is very short`);
    if (/render|data|system|engine|pipeline/i.test(shape.summary || '')) {
      warnings.push(`${where}: summary describes the software rather than the chord`);
    }
  }
}

for (const warning of warnings) console.warn(`  warn  ${warning}`);

if (problems.length) {
  console.error(`\nChord data failed validation (${problems.length} problems):`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

const shapeCount = chords.reduce((total, chord) => total + chord.variants.length, 0);
console.log(`  ok    ${chords.length} chords, ${shapeCount} shapes: notes, fingers and barres all check out`);
