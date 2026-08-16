/**
 * About, contact and the two legal pages.
 *
 * Plain factual text describing what the site actually does today. The privacy
 * page makes concrete claims - no cookies, no ads, cookieless page counting -
 * so anything added to the site that touches visitor data has to be reflected
 * here in the same commit or the page becomes untrue.
 */
import { SITE } from '../lib/site.mjs';

export const CONTACT_EMAIL = `info@${SITE.domain}`;

export const sitePages = [
  {
    id: 'about',
    title: 'About PrintChords',
    metaTitle: 'About PrintChords: Free Printable Guitar Chord Charts',
    metaDescription:
      'What PrintChords is, who it is for and why every chart on the site is built to print in black and white on a cheap printer.',
    lead: 'Chord charts built to be printed, not just looked at.',
    sections: [
      {
        heading: 'What this is',
        body: [
          'PrintChords makes guitar chord charts, scale charts and blank diagram sheets, and every one of them is built to leave the screen. Press Print and you get the sheet. Press Download PDF and you get a vector file that stays sharp at any paper size. There is no account, no sign-up form and no limit on how many times you print.',
          'Most chord sites are built the other way round: an interactive tool on screen, with printing bolted on at the end if at all. That is the gap this site exists to fill.',
        ],
      },
      {
        heading: 'How the diagrams are made',
        body: [
          'Every diagram is generated from one description of the chord. The finger positions, the note names, the fret span and the difficulty are all computed from the same data, which means the text under a diagram cannot drift away from the diagram itself. The printable card and the picture on screen come from a single drawing routine, so they cannot disagree about which finger goes where.',
          'The shapes are checked automatically before every release: a chord whose diagram does not sound the chord it claims never reaches a page. Everything is pure black on white with no grey fills and no colour coding, so a photocopy of a photocopy still works.',
        ],
      },
      {
        heading: 'Who it is for',
        body: [
          'Beginners who want a sheet on the wall rather than a phone propped against a music stand, and teachers who need something to hand a class. Teachers are welcome to print as many copies as they like, and the sheets carry nothing but a small line of type at the bottom so a student can find their way back.',
        ],
      },
      {
        heading: 'Getting in touch',
        body: [
          `If a shape looks wrong, if a sheet will not print properly, or if you want to use the charts somewhere unusual, write to ${CONTACT_EMAIL}. Corrections to a chord shape are the most useful mail this site gets.`,
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    metaTitle: 'Contact PrintChords',
    metaDescription:
      'How to reach PrintChords: one email address for corrections to a chord shape, printing problems, licensing and everything else.',
    lead: `One address for everything: ${CONTACT_EMAIL}`,
    sections: [
      {
        heading: 'Email',
        body: [
          `Write to ${CONTACT_EMAIL}. It is read by a person, and most mail gets an answer within a few days.`,
        ],
      },
      {
        heading: 'What is worth writing about',
        body: [
          'A chord shape that looks wrong. Please say which chord, which fingering and what you think it should be; a photograph of your hand on the fretboard settles most of these in seconds.',
          'A sheet that will not print properly, with the paper size and the browser you used. The sheets are tested on A4 and US Letter, but printers vary more than they should.',
          'Using the charts in a class, a course, a book or an app. The short answer is usually yes, and the terms page covers the ordinary cases.',
          'A chord, scale or chart that is missing. Requests decide what gets built next more often than anything else does.',
        ],
      },
    ],
  },
  {
    id: 'terms',
    title: 'Terms of use',
    metaTitle: 'Terms of Use: PrintChords',
    metaDescription:
      'The terms for using PrintChords: what you may do with the printable charts, what is not allowed, and the limits of what the site promises.',
    lead: 'Short version: print them, use them, teach with them. Do not resell them as they are.',
    sections: [
      {
        heading: 'Using the sheets',
        body: [
          `You may print, download and copy anything on ${SITE.domain} for your own playing, for teaching, and for handing out in a class, a workshop or a lesson. You do not need permission and you do not need to pay. There is no limit on the number of copies.`,
          'You may include the diagrams in your own teaching material, worksheets and hand-outs. A credit is appreciated but not required.',
        ],
      },
      {
        heading: 'What is not allowed',
        body: [
          'Selling the sheets as they are, printed or digital, on a marketplace or anywhere else. Republishing the charts as the main content of another website, product or app. Presenting the diagrams as your own work.',
          'Automated bulk downloading that puts load on the site. If you need the files in bulk for a legitimate reason, ask instead.',
        ],
      },
      {
        heading: 'Accuracy and liability',
        body: [
          'The chord and scale data is checked automatically and by hand, but music notation has conventions that reasonable people disagree about, and mistakes are possible. The site is provided as it is, with no warranty of any kind. Use your ears as well as the diagram.',
          `${SITE.domain} is not liable for any loss arising from use of the site or the files it produces.`,
        ],
      },
      {
        heading: 'Changes',
        body: [
          `These terms may change as the site grows. The version on this page is the one that applies. Questions go to ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    metaTitle: 'Privacy: PrintChords',
    metaDescription:
      'What PrintChords does with your data: no accounts, no sign-up, no cookies, and page-view statistics that cannot identify anyone.',
    lead: 'No accounts, no cookies, and page counts that cannot identify anyone.',
    sections: [
      {
        heading: 'What the site collects',
        body: [
          'No accounts, no sign-up form, no newsletter and no comments. The site does not ask for your name, your email address or anything else, and it has no way to store them.',
          'Everything the pages do happens in your browser. Choosing a key on a scale page, switching between fingerings and printing a sheet are all local; nothing about those choices is sent anywhere.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          `${SITE.domain} sets no cookies and uses no local storage, and there is no advertising anywhere on the site.`,
        ],
      },
      {
        heading: 'Visitor statistics',
        body: [
          'The site uses Vercel Web Analytics to count page views. It does not use cookies and it does not follow anyone between sites. Visitors are identified by a hash made from the request itself, and that is discarded after 24 hours, so there is no way to reconstruct a browsing session or to connect two visits to the same person.',
          'What is recorded with each page view is the page address, where the visit came from, an approximate location no finer than a city, and the browser, operating system and device type. That is the whole list. It exists to answer one question: which sheets people actually print.',
        ],
      },
      {
        heading: 'Third parties',
        body: [
          'The Save to Pinterest buttons are ordinary links. Nothing loads from Pinterest until you click one, and at that point you are on their site and their privacy policy applies.',
          'Like any website, the hosting provider records standard server logs, including IP addresses, for security and for keeping the site running. Those logs are not used to build a profile of anyone.',
        ],
      },
      {
        heading: 'Questions',
        body: [
          `Anything about privacy goes to ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
];

export const sitePageUrl = (page) => `/${page.id}/`;

export function getSitePage(id) {
  const page = sitePages.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown site page: ${id}`);
  return page;
}
