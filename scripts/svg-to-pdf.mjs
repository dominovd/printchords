/**
 * SVG to PDF for the printable sheets.
 *
 * The "Download PDF" button has to hand over a file, not open the print dialog.
 * Rather than adding a second drawing path, this replays the SVG the renderer
 * already produced: every sheet is built from rect, line, circle, text and a
 * translate/scale group, so the translation is small and total. Anything the
 * renderer starts emitting that is not on that list throws, so a new shape
 * cannot silently vanish from the PDF.
 */
import PDFDocument from 'pdfkit';

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 24;

const num = (value) => Number(value);

function attrs(tag) {
  const out = {};
  // Digits belong in the class: x1, y2 and friends are attribute names too.
  for (const [, key, value] of tag.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g)) out[key] = value;
  return out;
}

/** Flatten the SVG into drawing commands, applying group transforms as we go. */
function parse(svg) {
  const commands = [];
  const stack = [{ x: 0, y: 0, k: 1 }];
  const tokens = svg.matchAll(/<(\/?)(svg|g|rect|line|circle|text)\b([^>]*)>([^<]*)/g);

  for (const [, closing, name, rawAttrs, text] of tokens) {
    const top = stack[stack.length - 1];
    if (closing) {
      if (name === 'g') stack.pop();
      continue;
    }
    const a = attrs('<' + rawAttrs + '>');
    const map = (x, y) => ({ x: top.x + x * top.k, y: top.y + y * top.k });

    switch (name) {
      case 'svg':
        break;
      case 'g': {
        const t = (a.transform || '').match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)(?:\s*scale\(([-\d.]+)\))?/);
        if (!t) { stack.push({ ...top }); break; }
        const k = t[3] === undefined ? 1 : num(t[3]);
        stack.push({ x: top.x + num(t[1]) * top.k, y: top.y + num(t[2]) * top.k, k: top.k * k });
        break;
      }
      case 'rect': {
        const p = map(num(a.x || 0), num(a.y || 0));
        commands.push({
          op: 'rect', x: p.x, y: p.y,
          w: num(a.width) * top.k, h: num(a.height) * top.k,
          rx: a.rx ? num(a.rx) * top.k : 0, fill: a.fill,
        });
        break;
      }
      case 'line': {
        const p1 = map(num(a.x1), num(a.y1));
        const p2 = map(num(a.x2), num(a.y2));
        commands.push({ op: 'line', ...p1, x2: p2.x, y2: p2.y, w: num(a['stroke-width'] || 1) * top.k, stroke: a.stroke });
        break;
      }
      case 'circle': {
        const p = map(num(a.cx), num(a.cy));
        commands.push({
          op: 'circle', x: p.x, y: p.y, r: num(a.r) * top.k,
          fill: a.fill, stroke: a.stroke, w: num(a['stroke-width'] || 0) * top.k,
        });
        break;
      }
      case 'text': {
        const p = map(num(a.x), num(a.y));
        commands.push({
          op: 'text', x: p.x, y: p.y, size: num(a['font-size']) * top.k,
          weight: num(a['font-weight'] || 400), anchor: a['text-anchor'] || 'start',
          fill: a.fill || '#000000',
          value: text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
        });
        break;
      }
      default:
        throw new Error(`svg-to-pdf: unsupported element <${name}>`);
    }
  }
  return commands;
}

function fontFor(weight) {
  if (weight >= 800) return 'sheet-extrabold';
  if (weight >= 600) return 'sheet-bold';
  return 'sheet-regular';
}

/**
 * @param {string} svg   a sheet from the renderer, 1000x1500 user units
 * @param {{fonts:{regular:string,bold:string,extrabold:string}, title?:string}} options
 * @returns {Promise<Buffer>}
 */
export function svgToPdf(svg, options) {
  const viewBox = (svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) || []).slice(1).map(num);
  const [srcW, srcH] = viewBox.length === 2 ? viewBox : [1000, 1500];

  const scale = Math.min((A4.width - MARGIN * 2) / srcW, (A4.height - MARGIN * 2) / srcH);
  const offsetX = (A4.width - srcW * scale) / 2;
  const offsetY = (A4.height - srcH * scale) / 2;

  const doc = new PDFDocument({
    size: [A4.width, A4.height],
    margin: 0,
    info: { Title: options.title || 'PrintChords', Producer: 'printchords.com', Creator: 'printchords.com' },
  });
  doc.registerFont('sheet-regular', options.fonts.regular);
  doc.registerFont('sheet-bold', options.fonts.bold);
  doc.registerFont('sheet-extrabold', options.fonts.extrabold);

  const X = (x) => offsetX + x * scale;
  const Y = (y) => offsetY + y * scale;
  const S = (v) => v * scale;

  for (const c of parse(svg)) {
    switch (c.op) {
      case 'rect':
        if (!c.fill || c.fill === 'none') break;
        if (c.rx) doc.roundedRect(X(c.x), Y(c.y), S(c.w), S(c.h), S(c.rx));
        else doc.rect(X(c.x), Y(c.y), S(c.w), S(c.h));
        doc.fill(c.fill);
        break;
      case 'line':
        doc.moveTo(X(c.x), Y(c.y)).lineTo(X(c.x2), Y(c.y2)).lineWidth(S(c.w)).stroke(c.stroke || '#000000');
        break;
      case 'circle':
        doc.circle(X(c.x), Y(c.y), S(c.r));
        if (c.fill && c.fill !== 'none' && c.stroke) doc.lineWidth(S(c.w)).fillAndStroke(c.fill, c.stroke);
        else if (c.stroke && (!c.fill || c.fill === 'none')) doc.lineWidth(S(c.w)).stroke(c.stroke);
        else doc.fill(c.fill || '#000000');
        break;
      case 'text': {
        if (!c.value) break;
        doc.font(fontFor(c.weight)).fontSize(S(c.size)).fillColor(c.fill);
        const width = doc.widthOfString(c.value);
        const x = c.anchor === 'middle' ? X(c.x) - width / 2 : c.anchor === 'end' ? X(c.x) - width : X(c.x);
        // SVG places text on its baseline; pdfkit places it by the ascender.
        doc.text(c.value, x, Y(c.y) - doc.currentLineHeight() * 0.79, { lineBreak: false });
        break;
      }
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}
