/**
 * Printable sheets for the scale pages. Same idea as the chord sheets: the page
 * and the printable come from one renderer, so they cannot disagree.
 */
import {
  PENTATONIC_BOXES,
  getScale,
  pentatonicBox,
  neckPositions,
  scaleNotes,
} from './scales.mjs';
import { neckSheetSvg } from './diagram.mjs';

export const FULL_NECK = { fromFret: 0, toFret: 12 };
export const UPPER_NECK = { fromFret: 12, toFret: 24 };

export const scaleImagePath = (scale, key) => `/img/scales/${scale.id}-${key.id}.png`;
export const boxesImagePath = (key) => `/img/scales/pentatonic-boxes-${key.id}.png`;

/** One scale across the whole neck, wrapped onto two rows. */
export function scaleSheetSvg(scale, key) {
  return neckSheetSvg({
    title: `${key.name} ${scale.name.toLowerCase()}`,
    subtitle: 'Guitar scale chart · standard tuning',
    blocks: [
      { caption: 'Open position to fret 12', positions: neckPositions(scale, key, FULL_NECK), window: FULL_NECK },
      { caption: 'Fret 12 to fret 24', positions: neckPositions(scale, key, UPPER_NECK), window: UPPER_NECK },
    ],
    notesLine: `Notes: ${scaleNotes(scale, key).join(' · ')}`,
  });
}

/** The five minor-pentatonic boxes, stacked down one page. */
export function boxesSheetSvg(key) {
  const scale = getScale('minor-pentatonic');
  return neckSheetSvg({
    title: `${key.name} minor pentatonic`,
    subtitle: 'The five box shapes · standard tuning',
    columns: 2,
    blocks: PENTATONIC_BOXES.map((box, index) => {
      const { positions, notes, window } = pentatonicBox(key, index);
      return {
        caption: `${box.name} · frets ${notes.fromFret}–${notes.toFret}`,
        positions,
        window,
      };
    }),
    notesLine: `Notes: ${scaleNotes(scale, key).join(' · ')}`,
  });
}
