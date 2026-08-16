/**
 * Every printable the site has, in one list.
 *
 * `/printable-chord-chart/` is a download hub rather than another copy of a
 * chart, so it needs one place that knows about all the sheets. Adding a chart
 * or a blank sheet puts it on that page automatically.
 */
import { charts, chartUrl } from '../data/charts.mjs';
import { blankSheets, blankImagePath, blankPage } from '../data/blanks.mjs';
import { getChord, primaryVariant, sheetImagePath } from './chords.mjs';
import { blankSheetSvg, chartSheetSvg } from './diagram.mjs';

export function chartEntries(chart) {
  return chart.chords.map((id) => {
    const chord = getChord(id);
    return { chord, shape: primaryVariant(chord) };
  });
}

export function chartPrintable(chart) {
  return {
    id: chart.id,
    kind: 'chart',
    title: chart.title,
    subtitle: chart.sheetSubtitle,
    description: chart.lead,
    bestFor: `${chart.chords.length} chords, ready to play`,
    png: sheetImagePath(chart.id),
    alt: chart.imageAlt,
    sourceUrl: chartUrl(chart),
    sourceLabel: 'Open the chart',
    svg: chartSheetSvg({
      title: chart.title,
      subtitle: chart.sheetSubtitle,
      columns: chart.columns,
      chords: chartEntries(chart),
    }),
  };
}

export function blankPrintable(sheet) {
  return {
    id: sheet.id,
    kind: 'blank',
    title: `${sheet.title}, ${sheet.label}`,
    subtitle: sheet.subtitle,
    description: sheet.description,
    bestFor: sheet.bestFor,
    png: blankImagePath(sheet),
    alt: sheet.imageAlt,
    sourceUrl: blankPage.url,
    sourceLabel: 'About blank charts',
    svg: blankSheetSvg(sheet),
  };
}

/** Charts first, blanks after: filled sheets are what most people came for. */
export function allPrintables() {
  return [...charts.map(chartPrintable), ...blankSheets.map(blankPrintable)];
}
