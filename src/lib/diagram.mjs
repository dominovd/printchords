/**
 * PrintChords chord diagram renderer.
 *
 * This file is the ONLY place a fretboard is drawn. The on-screen SVG, the
 * printable 1000x1500 card and the composite chart sheet all call
 * `fretboardGroup()` with the same shape object, so a diagram and its printable
 * version can never disagree about a finger number. If you need a new output
 * size, add a wrapper here. Do not write a second drawing routine.
 */

export const INK = '#111111';
export const PAPER = '#ffffff';
// Single quotes on purpose: this string is written into double-quoted SVG
// attributes, and double quotes inside it break the XML parser used for PNG
// rasterisation.
export const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Local drawing units for one fretboard block. */
export const GEOM = {
  // The left margin is wider than the right: it has to hold the "5fr" position
  // marker without it running into the rounded end of a barre.
  gutterLeft: 26,
  gutterRight: 18,
  stringGap: 20,
  fretHeight: 24,
  frets: 5,
  gridTop: 26,     // leaves room for the X / O row
  markerBaseline: 16,
  dotRadius: 8.6,
  lineWidth: 1.7,
  nutWidth: 5,
  barreWidth: 16,
};

export const DIAGRAM_WIDTH = GEOM.gutterLeft + GEOM.gutterRight + GEOM.stringGap * 5; // 144
export const DIAGRAM_HEIGHT = GEOM.gridTop + GEOM.fretHeight * GEOM.frets + 8;        // 154

const stringX = (i) => GEOM.gutterLeft + i * GEOM.stringGap;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => Math.round(v * 100) / 100;

/**
 * Draw one fretboard as an SVG fragment in local units
 * (DIAGRAM_WIDTH x DIAGRAM_HEIGHT, origin top-left).
 *
 * @param {object} shape  a chord variant: { positions, fingers, barre, startFret }
 * @param {object} [opts] { ink, paper, font, showFingerNumbers, scaleStroke }
 * @returns {string} SVG markup without an <svg> wrapper
 */
export function fretboardGroup(shape, opts = {}) {
  const ink = opts.ink || INK;
  const paper = opts.paper || PAPER;
  const font = opts.font || FONT;
  const showFingers = opts.showFingerNumbers !== false;
  const showStringMarkers = opts.showStringMarkers !== false;
  // Screen SVGs keep hairlines crisp at any size; rasterised output must scale
  // its strokes with the artwork, so non-scaling-stroke is opt-in.
  const vector = opts.scaleStroke === false ? ' vector-effect="non-scaling-stroke"' : '';

  const start = shape.startFret || 1;
  const { gridTop, fretHeight, frets, stringGap, dotRadius } = GEOM;
  const gridBottom = gridTop + fretHeight * frets;
  const out = [];

  // --- fret rows -----------------------------------------------------------
  for (let r = 0; r <= frets; r++) {
    const y = gridTop + r * fretHeight;
    const isNut = r === 0 && start === 1;
    out.push(
      `<line x1="${stringX(0)}" y1="${n(y)}" x2="${stringX(5)}" y2="${n(y)}" stroke="${ink}" ` +
      `stroke-width="${isNut ? GEOM.nutWidth : GEOM.lineWidth}" stroke-linecap="butt"${isNut ? '' : vector}/>`
    );
  }

  // --- strings -------------------------------------------------------------
  for (let i = 0; i < 6; i++) {
    out.push(
      `<line x1="${stringX(i)}" y1="${n(gridTop)}" x2="${stringX(i)}" y2="${n(gridBottom)}" ` +
      `stroke="${ink}" stroke-width="${GEOM.lineWidth}"${vector}/>`
    );
  }

  // --- position marker ("3fr") --------------------------------------------
  if (start > 1) {
    out.push(
      `<text x="${n(GEOM.gutterLeft - 11)}" y="${n(gridTop + fretHeight * 0.5 + 4)}" text-anchor="end" ` +
      `font-family="${font}" font-size="10.5" font-weight="700" fill="${ink}">${start}fr</text>`
    );
  }

  // --- muted / open markers above the nut ---------------------------------
  shape.positions.forEach((p, i) => {
    if (p > 0 || !showStringMarkers) return;
    const glyph = p === 0 ? 'O' : 'X';
    out.push(
      `<text x="${stringX(i)}" y="${GEOM.markerBaseline}" text-anchor="middle" font-family="${font}" ` +
      `font-size="13" font-weight="${p === 0 ? 500 : 600}" fill="${ink}">${glyph}</text>`
    );
  });

  // --- barre ---------------------------------------------------------------
  const barre = shape.barre;
  if (barre) {
    const a = 6 - barre.fromString;   // low-string end, as an array index
    const b = 6 - barre.toString;     // high-string end
    const x1 = Math.min(stringX(a), stringX(b));
    const x2 = Math.max(stringX(a), stringX(b));
    const y = gridTop + (barre.fret - start + 0.5) * fretHeight;
    // The bar is a rounded rect that stops exactly on the outer strings, with a
    // normal finger dot on top of its low end. A round-capped line used to put
    // half the bar's thickness outside the grid; now the only thing that reaches
    // past the outer string is the dot, exactly as on any other chord.
    const h = GEOM.barreWidth;
    out.push(
      `<rect x="${n(x1)}" y="${n(y - h / 2)}" width="${n(x2 - x1)}" height="${h}" rx="${n(h / 2)}" fill="${ink}"/>`
    );
    out.push(`<circle cx="${n(x1)}" cy="${n(y)}" r="${dotRadius}" fill="${ink}"/>`);
    if (showFingers) {
      out.push(
        `<text x="${n(x1)}" y="${n(y + 4.2)}" text-anchor="middle" font-family="${font}" font-size="11.5" ` +
        `font-weight="700" fill="${paper}">${barre.finger}</text>`
      );
    }
  }

  // --- fretted dots --------------------------------------------------------
  // Anything the barre already covers is skipped, so every fretted string ends
  // up with exactly one marker.
  shape.positions.forEach((p, i) => {
    if (p <= 0) return;
    const finger = shape.fingers[i];
    if (barre && p === barre.fret && finger === barre.finger) {
      const lo = Math.min(6 - barre.fromString, 6 - barre.toString);
      const hi = Math.max(6 - barre.fromString, 6 - barre.toString);
      if (i >= lo && i <= hi) return;
    }
    const y = gridTop + (p - start + 0.5) * fretHeight;
    out.push(`<circle cx="${stringX(i)}" cy="${n(y)}" r="${dotRadius}" fill="${ink}"/>`);
    if (showFingers && finger > 0) {
      out.push(
        `<text x="${stringX(i)}" y="${n(y + 4.2)}" text-anchor="middle" font-family="${font}" ` +
        `font-size="11.5" font-weight="700" fill="${paper}">${finger}</text>`
      );
    }
  });

  return out.join('');
}

/**
 * On-screen diagram. Sized by CSS; the viewBox is identical for every chord so
 * grids line up.
 */
export function diagramSvg(shape, { label, className = 'diagram', extraAttrs = '' } = {}) {
  return (
    `<svg class="${className}" viewBox="0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}" ` +
    `role="img" aria-label="${esc(label)}" ${extraAttrs}>` +
    fretboardGroup(shape, { scaleStroke: false }) +
    '</svg>'
  );
}

/* -------------------------------------------------------------------------- */
/*  Printable outputs: same fretboardGroup(), different page around it        */
/* -------------------------------------------------------------------------- */

export const PRINT_WIDTH = 1000;
export const PRINT_HEIGHT = 1500;

const FINGER_LEGEND = '1 index · 2 middle · 3 ring · 4 little finger';

function textLine(x, y, text, { size = 30, weight = 400, anchor = 'middle', fill = INK, font = FONT }) {
  return (
    `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" ` +
    `font-weight="${weight}" fill="${fill}">${esc(text)}</text>`
  );
}

/**
 * A single printable chord card, 1000x1500. The asset used for the image pack,
 * Pinterest and og:image.
 */
export function printableCardSvg(chord, shape) {
  const scale = 5.3;
  const boardW = DIAGRAM_WIDTH * scale;
  const boardH = DIAGRAM_HEIGHT * scale;
  const tx = (PRINT_WIDTH - boardW) / 2;
  const ty = 330;
  const body = [
    `<rect width="${PRINT_WIDTH}" height="${PRINT_HEIGHT}" fill="${PAPER}"/>`,
    textLine(PRINT_WIDTH / 2, 150, chord.full, { size: 90, weight: 800 }),
    textLine(PRINT_WIDTH / 2, 212, shape.label, { size: 34, weight: 400, fill: '#4a4a48' }),
    `<g transform="translate(${n(tx)} ${ty}) scale(${scale})">${fretboardGroup(shape)}</g>`,
    textLine(PRINT_WIDTH / 2, ty + boardH + 74, `Notes: ${chord.notes.join(' · ')}`, { size: 38, weight: 700 }),
    textLine(PRINT_WIDTH / 2, ty + boardH + 128, FINGER_LEGEND, { size: 26, weight: 400, fill: '#555553' }),
    textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 58, 'printchords.com', { size: 26, weight: 400, fill: '#4a4a48' }),
  ];
  return svgDocument(PRINT_WIDTH, PRINT_HEIGHT, body.join(''));
}

/** An empty fretboard: no dots, no X/O row. Used by the blank sheets. */
export const BLANK_SHAPE = Object.freeze({
  id: 'blank',
  label: 'Blank',
  positions: [-1, -1, -1, -1, -1, -1],
  fingers: [0, 0, 0, 0, 0, 0],
  barre: null,
  startFret: 1,
});

export const BLANK_OPTIONS = Object.freeze({ showStringMarkers: false, showFingerNumbers: false });

/**
 * Composite sheet: title, a grid of fretboards, footer. Chart sheets and blank
 * sheets are the same layout with different cells, so spacing only ever gets
 * tuned in one place.
 *
 * @param {{title:string, subtitle?:string, columns?:number,
 *          cells:Array<{shape:object, label?:string, rule?:boolean, options?:object}>}} sheet
 */
export function sheetSvg(sheet) {
  const items = sheet.cells;
  // Three columns by default, not four. The sheet is 2:3, so a wider grid
  // leaves a dead band above the footer and shrinks every diagram, which is
  // what a Pinterest feed and an image-pack thumbnail see first.
  const cols = sheet.columns || 3;
  const rows = Math.ceil(items.length / cols);

  const marginX = 40;
  const areaTop = sheet.subtitle ? 196 : 168;
  const areaBottom = PRINT_HEIGHT - 120;
  const cellW = (PRINT_WIDTH - marginX * 2) / cols;
  const cellH = (areaBottom - areaTop) / rows;
  // Denser sheets get a smaller name strip, otherwise the label eats the space
  // the diagram needs.
  const labelSpace = Math.max(28, Math.min(52, cellH * 0.19));

  // Fit the diagram to whichever of the two runs out first, then centre the
  // whole block so a partly filled last row does not drag the grid off balance.
  const scale = Math.min((cellW - 26) / DIAGRAM_WIDTH, (cellH - labelSpace) / DIAGRAM_HEIGHT);
  const boardW = DIAGRAM_WIDTH * scale;
  const boardH = DIAGRAM_HEIGHT * scale;
  const rowH = boardH + labelSpace;
  const top = areaTop + (areaBottom - areaTop - rows * rowH) / 2;
  // When the row height is what limits the diagram, the columns end up far
  // wider than the artwork. Pull them in so the grid reads as a block rather
  // than as islands.
  const columnPitch = Math.min(cellW, boardW * 1.22);

  const body = [
    `<rect width="${PRINT_WIDTH}" height="${PRINT_HEIGHT}" fill="${PAPER}"/>`,
    textLine(PRINT_WIDTH / 2, 108, sheet.title, { size: 68, weight: 800 }),
  ];
  if (sheet.subtitle) body.push(textLine(PRINT_WIDTH / 2, 158, sheet.subtitle, { size: 28, fill: '#4a4a48' }));

  const labelSize = Math.min(46, Math.max(24, boardW * 0.2));

  items.forEach((cell, index) => {
    const row = Math.floor(index / cols);
    const inRow = Math.min(cols, items.length - row * cols);
    const col = index % cols;
    const rowWidth = inRow * columnPitch;
    const rowLeft = (PRINT_WIDTH - rowWidth) / 2;
    const x = rowLeft + col * columnPitch + (columnPitch - boardW) / 2;
    const y = top + row * rowH;
    body.push(
      `<g transform="translate(${n(x)} ${n(y)}) scale(${n(scale)})">${fretboardGroup(cell.shape, cell.options)}</g>`
    );
    if (cell.label) {
      body.push(textLine(x + boardW / 2, y + boardH + labelSize * 0.95, cell.label, { size: labelSize, weight: 800 }));
    }
    if (cell.rule) {
      // A line to write the chord name on.
      const ruleW = boardW * 0.74;
      const ruleY = y + boardH + labelSpace * 0.62;
      body.push(
        `<line x1="${n(x + (boardW - ruleW) / 2)}" y1="${n(ruleY)}" x2="${n(x + (boardW + ruleW) / 2)}" ` +
        `y2="${n(ruleY)}" stroke="${INK}" stroke-width="2.2"/>`
      );
    }
  });

  const footnote = sheet.footnote === undefined ? FINGER_LEGEND : sheet.footnote;
  if (footnote) body.push(textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 84, footnote, { size: 26, fill: '#555553' }));
  body.push(textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 40, 'printchords.com', { size: 26, fill: '#4a4a48' }));
  return svgDocument(PRINT_WIDTH, PRINT_HEIGHT, body.join(''));
}

/** A chart page's sheet: one diagram per chord, named underneath. */
export function chartSheetSvg(sheet) {
  return sheetSvg({
    title: sheet.title,
    subtitle: sheet.subtitle,
    columns: sheet.columns,
    cells: sheet.chords.map(({ chord, shape }) => ({ shape, label: chord.name })),
  });
}

/** An empty sheet to fill in by hand: N identical blank grids, each with a name line. */
export function blankSheetSvg(sheet) {
  return sheetSvg({
    title: sheet.title,
    subtitle: sheet.subtitle,
    columns: sheet.columns,
    footnote: sheet.footnote ?? 'Write the chord name on the line · O = open string · X = do not play',
    cells: Array.from({ length: sheet.count }, () => ({
      shape: BLANK_SHAPE,
      rule: true,
      options: BLANK_OPTIONS,
    })),
  });
}

/* -------------------------------------------------------------------------- */
/*  Neck diagrams: scales                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A scale is a horizontal neck rather than a chord box: it spans frets instead
 * of sitting inside five of them. Same rules as the chord renderer: one place
 * to draw it, black and white only, and every colour cue doubled by a symbol.
 */
export const NECK = {
  gutterLeft: 30,   // open-string / fret-number column
  gutterRight: 10,
  fretWidth: 44,
  stringGap: 30,
  top: 30,          // fret numbers, clear of a marker on the top string
  bottom: 28,       // inlay dots, clear of a marker on the low E string
  markerRadius: 9.4,
  lineWidth: 1.5,
  nutWidth: 5,
};

const INLAY_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAY_FRETS = new Set([12, 24]);

export function neckSize(fromFret, toFret) {
  const frets = toFret - fromFret;
  return {
    width: NECK.gutterLeft + frets * NECK.fretWidth + NECK.gutterRight,
    height: NECK.top + NECK.stringGap * 5 + NECK.bottom,
  };
}

/**
 * @param {Array<{string:number, fret:number, degree:string, root:boolean}>} positions
 * @param {{fromFret:number, toFret:number}} window
 */
export function neckGroup(positions, window, opts = {}) {
  const ink = opts.ink || INK;
  const paper = opts.paper || PAPER;
  const font = opts.font || FONT;
  const { fromFret, toFret } = window;
  const { gutterLeft, fretWidth, stringGap, top, markerRadius } = NECK;
  const vector = opts.scaleStroke === false ? ' vector-effect="non-scaling-stroke"' : '';

  const x = (fret) => gutterLeft + (fret - fromFret) * fretWidth;
  const y = (stringIndex) => top + (5 - stringIndex) * stringGap; // low E at the bottom
  const left = x(fromFret);
  const right = x(toFret);
  const out = [];

  // Fret wires, with the nut drawn thick when the window starts at the nut.
  for (let fret = fromFret; fret <= toFret; fret++) {
    const isNut = fret === 0;
    out.push(
      `<line x1="${n(x(fret))}" y1="${n(y(5))}" x2="${n(x(fret))}" y2="${n(y(0))}" stroke="${ink}" ` +
      `stroke-width="${isNut ? NECK.nutWidth : NECK.lineWidth}"${isNut ? '' : vector}/>`
    );
  }

  // Strings.
  for (let s = 0; s < 6; s++) {
    out.push(
      `<line x1="${n(left)}" y1="${n(y(s))}" x2="${n(right)}" y2="${n(y(s))}" stroke="${ink}" ` +
      `stroke-width="${NECK.lineWidth}"${vector}/>`
    );
  }

  // Inlay markers, in the strip under the neck so they never sit behind a note.
  const inlayY = y(0) + NECK.bottom * 0.62;
  for (let fret = Math.max(fromFret + 1, 1); fret <= toFret; fret++) {
    const cx = x(fret) - fretWidth / 2;
    if (DOUBLE_INLAY_FRETS.has(fret)) {
      out.push(`<circle cx="${n(cx - 5)}" cy="${n(inlayY)}" r="2.6" fill="${ink}"/>`);
      out.push(`<circle cx="${n(cx + 5)}" cy="${n(inlayY)}" r="2.6" fill="${ink}"/>`);
    } else if (INLAY_FRETS.has(fret)) {
      out.push(`<circle cx="${n(cx)}" cy="${n(inlayY)}" r="2.6" fill="${ink}"/>`);
    }
  }

  // Fret numbers above the neck.
  for (let fret = Math.max(fromFret + 1, 1); fret <= toFret; fret++) {
    out.push(
      `<text x="${n(x(fret) - fretWidth / 2)}" y="${n(top - 13)}" text-anchor="middle" font-family="${font}" ` +
      `font-size="10.5" font-weight="600" fill="#5f5f5c">${fret}</text>`
    );
  }

  // Notes. Roots are filled and labelled R; the rest are hollow with the degree
  // written in, so nothing depends on colour surviving a photocopier.
  for (const note of positions) {
    const cx = note.fret === 0 ? gutterLeft - 15 : x(note.fret) - fretWidth / 2;
    const cy = y(note.string);
    if (note.root) {
      out.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${markerRadius}" fill="${ink}"/>`);
      out.push(
        `<text x="${n(cx)}" y="${n(cy + 3.6)}" text-anchor="middle" font-family="${font}" font-size="10" ` +
        `font-weight="800" fill="${paper}">R</text>`
      );
    } else {
      out.push(
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${markerRadius - 0.6}" fill="${paper}" stroke="${ink}" stroke-width="1.6"/>`
      );
      out.push(
        `<text x="${n(cx)}" y="${n(cy + 3.4)}" text-anchor="middle" font-family="${font}" font-size="9.5" ` +
        `font-weight="700" fill="${ink}">${esc(note.degree)}</text>`
      );
    }
  }

  return out.join('');
}

export function neckSvg(positions, window, { label, className = 'neck', scaleStroke = false } = {}) {
  const { width, height } = neckSize(window.fromFret, window.toFret);
  return (
    `<svg class="${className}" viewBox="0 0 ${n(width)} ${n(height)}" role="img" aria-label="${esc(label)}">` +
    neckGroup(positions, window, { scaleStroke }) +
    '</svg>'
  );
}

/**
 * Printable scale sheet: a stack of necks on one 1000x1500 page.
 * @param {{title:string, subtitle:string, blocks:Array<{caption:string, positions:Array, window:object}>,
 *          notesLine?:string}} sheet
 */
export function neckSheetSvg(sheet) {
  const blocks = sheet.blocks;
  const areaTop = 206;
  const areaBottom = PRINT_HEIGHT - (sheet.notesLine ? 186 : 126);
  const gap = 40;
  const captionH = 42;

  // One scale for every block so the necks stay comparable, then the whole
  // stack is centred. Sizing each block to its own slot would make a four-fret
  // box look the same size as a twelve-fret neck.
  const cols = sheet.columns || 1;
  const rows = Math.ceil(blocks.length / cols);
  const widest = Math.max(...blocks.map((b) => neckSize(b.window.fromFret, b.window.toFret).width));
  const tallest = Math.max(...blocks.map((b) => neckSize(b.window.fromFret, b.window.toFret).height));
  const usableH = areaBottom - areaTop - rows * captionH - (rows - 1) * gap;
  const columnW = (PRINT_WIDTH - 80) / cols;
  const scale = Math.min((columnW - 16) / widest, usableH / (rows * tallest));
  const rowH = captionH + tallest * scale;
  const stackH = rows * rowH + (rows - 1) * gap;
  const top = areaTop + (areaBottom - areaTop - stackH) / 2;

  const body = [
    `<rect width="${PRINT_WIDTH}" height="${PRINT_HEIGHT}" fill="${PAPER}"/>`,
    textLine(PRINT_WIDTH / 2, 104, sheet.title, { size: 64, weight: 800 }),
    textLine(PRINT_WIDTH / 2, 154, sheet.subtitle, { size: 28, fill: '#4a4a48' }),
  ];

  blocks.forEach((block, index) => {
    const { width } = neckSize(block.window.fromFret, block.window.toFret);
    const drawW = width * scale;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const inRow = Math.min(cols, blocks.length - row * cols);
    const rowLeft = (PRINT_WIDTH - inRow * columnW) / 2;
    const cx = rowLeft + col * columnW + columnW / 2;
    const y = top + row * (rowH + gap);
    if (block.caption) {
      body.push(textLine(cx, y + captionH - 14, block.caption, { size: cols > 1 ? 24 : 28, weight: 700, fill: '#333' }));
    }
    body.push(
      `<g transform="translate(${n(cx - drawW / 2)} ${n(y + captionH)}) scale(${n(scale)})">` +
      neckGroup(block.positions, block.window) +
      '</g>'
    );
  });

  if (sheet.notesLine) {
    body.push(textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 150, sheet.notesLine, { size: 34, weight: 700 }));
  }
  body.push(
    textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 96, 'R = root note · numbers are scale degrees', {
      size: 24, fill: '#555553',
    })
  );
  body.push(textLine(PRINT_WIDTH / 2, PRINT_HEIGHT - 44, 'printchords.com', { size: 26, fill: '#4a4a48' }));
  return svgDocument(PRINT_WIDTH, PRINT_HEIGHT, body.join(''));
}

function svgDocument(width, height, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}">${body}</svg>`
  );
}
