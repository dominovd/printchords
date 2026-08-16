/**
 * Build-time PNG generation.
 *
 * Every printable asset is a real 1000x1500 file on disk, because the image
 * pack and Pinterest are two of the three channels this project sells to. The
 * SVG comes from the same renderer the page uses, so a card can never disagree
 * with the diagram above it.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

import { chords, cardImagePath, primaryVariant, sheetImagePath } from '../src/lib/chords.mjs';
import { charts } from '../src/data/charts.mjs';
import { blankSheets, blankImagePath } from '../src/data/blanks.mjs';
import { KEYS, SCALES } from '../src/lib/scales.mjs';
import { boxesImagePath, boxesSheetSvg, scaleImagePath, scaleSheetSvg } from '../src/lib/scale-sheets.mjs';
import { pdfPath } from '../src/lib/assets.mjs';
import { svgToPdf } from './svg-to-pdf.mjs';
import { blankSheetSvg, chartSheetSvg, printableCardSvg, PRINT_WIDTH } from '../src/lib/diagram.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const fontFiles = ['Inter-Regular.ttf', 'Inter-Bold.ttf', 'Inter-ExtraBold.ttf'].map((file) =>
  join(root, 'assets', 'fonts', file)
);

const pdfFonts = {
  regular: join(root, 'assets', 'fonts', 'Inter-Regular.ttf'),
  bold: join(root, 'assets', 'fonts', 'Inter-Bold.ttf'),
  extrabold: join(root, 'assets', 'fonts', 'Inter-ExtraBold.ttf'),
};

/**
 * Both outputs come from the same SVG: the PNG for screens and image search,
 * the PDF for the download button, which has to hand over a file rather than
 * open the browser's print dialog.
 */
async function writeSheet(svg, outputPath, title) {
  await writePng(svg, outputPath);
  const pdf = pdfPath(outputPath);
  const file = join(publicDir, pdf);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, await svgToPdf(svg, { fonts: pdfFonts, title }));
  return [outputPath, pdf];
}

async function writePng(svg, outputPath) {
  const resvg = new Resvg(svg, {
    background: '#ffffff',
    fitTo: { mode: 'width', value: PRINT_WIDTH },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' },
  });
  const file = join(publicDir, outputPath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, resvg.render().asPng());
  return outputPath;
}

export async function generateAssets({ quiet = false } = {}) {
const written = [];

// One card per fingering, but only for chords that have a page of their own.
for (const chord of chords.filter((c) => c.pageUrl)) {
  for (const shape of chord.variants) {
    written.push(...(await writeSheet(printableCardSvg(chord, shape), cardImagePath(chord, shape), `${chord.full} ${shape.label}`)));
  }
}

// Plus the composite sheet behind every chart page.
for (const chart of charts) {
  const entries = chart.chords.map((id) => {
    const chord = chords.find((c) => c.id === id);
    if (!chord) throw new Error(`Chart ${chart.id} references unknown chord ${id}`);
    return { chord, shape: primaryVariant(chord) };
  });
  const svg = chartSheetSvg({ title: chart.title, subtitle: chart.sheetSubtitle, columns: chart.columns, chords: entries });
  written.push(...(await writeSheet(svg, sheetImagePath(chart.id), chart.title)));
}

// Plus the blank sheets, which have no chord data behind them at all.
for (const sheet of blankSheets) {
  written.push(...(await writeSheet(blankSheetSvg(sheet), blankImagePath(sheet), `${sheet.title} ${sheet.label}`)));
}

// Scale sheets in every key. The page ships one key and transposes in the
// browser, but the download and the pin have to resolve to a real file for
// whichever key the visitor lands on.
for (const key of KEYS) {
  for (const scale of SCALES) {
    written.push(...(await writeSheet(scaleSheetSvg(scale, key), scaleImagePath(scale, key), `${key.name} ${scale.chartName}`)));
  }
  written.push(...(await writeSheet(boxesSheetSvg(key), boxesImagePath(key), `${key.name} minor pentatonic boxes`)));
}


// Site icons, rendered from the same favicon.svg the browser gets.
const faviconSvg = await readFile(join(publicDir, 'favicon.svg'), 'utf8');
for (const [size, name] of [[96, 'favicon-96.png'], [180, 'apple-touch-icon.png']]) {
  const icon = new Resvg(faviconSvg, {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' },
  });
  await writeFile(join(publicDir, name), icon.render().asPng());
  written.push(`/${name}`);
}

if (!quiet) console.log(`  ok    ${written.length} generated assets in public/`);
  return written;
}

// Run directly from `npm run assets`; imported by the dev server integration.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) await generateAssets();
