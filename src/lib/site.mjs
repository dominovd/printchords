import { charts, chartUrl } from '../data/charts.mjs';
import { chordsWithPages } from './chords.mjs';

export const SITE = {
  name: 'PrintChords',
  domain: 'printchords.com',
  origin: 'https://printchords.com',
  tagline: 'Free printable guitar chord charts',
};

/**
 * Navigation is built from the pages that actually exist. Adding a chart to
 * charts.mjs or giving a chord a pageUrl puts it in the header automatically,
 * and nothing here can point at a URL that has not been built.
 */
export const NAV = [
  ...charts.map((chart) => ({ url: chartUrl(chart), label: chart.navLabel || chart.title })),
  { url: '/chords/', label: 'All Chords' },
  { url: '/guitar-scales/', label: 'Scales' },
  { url: '/printable-chord-chart/', label: 'Printable' },
  { url: '/blank-chord-chart/', label: 'Blank' },
];

/** Full titles for the footer, where there is room for them. */
export const FOOTER_CHARTS = [
  ...charts.map((chart) => ({ url: chartUrl(chart), label: chart.title })),
  { url: '/chords/', label: 'All guitar chords' },
  { url: '/guitar-scales/', label: 'Guitar Scales Chart' },
  { url: '/guitar-scales/pentatonic/', label: 'Pentatonic Scale Chart' },
  { url: '/printable-chord-chart/', label: 'Printable Chord Chart' },
  { url: '/blank-chord-chart/', label: 'Blank Chord Chart' },
];

export const CONTACT_EMAIL = `info@${SITE.domain}`;

/** About, contact and the legal pages, for the footer. */
export const SITE_PAGES = [
  { url: '/for-teachers/', label: 'For teachers' },
  { url: '/about/', label: 'About' },
  { url: '/contact/', label: 'Contact' },
  { url: '/terms/', label: 'Terms' },
  { url: '/privacy/', label: 'Privacy' },
];

/** Chord pages, for footers and in-page link blocks. */
export const CHORD_LINKS = chordsWithPages().map((chord) => ({ url: chord.pageUrl, label: `${chord.name} chord` }));

/**
 * The pages that can realistically rank in the first year, by difficulty.
 * Contextual links matter more than the menu, so every template links here
 * rather than only into the chord pages, which cannot move for a year.
 */
export const CHEAPEST_ENTRIES = [
  { url: '/blank-chord-chart/', title: 'Blank Chord Chart', text: 'Empty diagrams to fill in by hand, 6, 12 or 24 to a page.' },
  { url: '/power-chords-chart/', title: 'Power Chords Chart', text: 'Eight shapes, and the two movable ones that cover the whole neck.' },
  { url: '/printable-chord-chart/', title: 'Printable Chord Chart', text: 'Every sheet on the site as a PDF, ready for A4 or US Letter.' },
  { url: '/guitar-scales/pentatonic/', title: 'Pentatonic Scale Chart', text: 'The five box shapes in any key, with the frets you actually play.' },
  { url: '/guitar-scales/', title: 'Guitar Scales Chart', text: 'Five scales across the whole neck, roots marked, in any key.' },
];

export const absolute = (path) => new URL(path, SITE.origin).href;
