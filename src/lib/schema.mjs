/**
 * JSON-LD for every page, in one place.
 *
 * The pages are printable reference sheets, so the main entity is a WebPage
 * with the sheet as its primary image, not a WebApplication. Google's
 * structured data policy asks that the markup describe what the page actually
 * is, and an accurate ImageObject is worth more here than a software type that
 * was never eligible for a rich result anyway.
 */
import { SITE, absolute } from './site.mjs';

const WEBSITE_ID = `${SITE.origin}/#website`;

/** Emitted once, on the root, as the site-name signal. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    alternateName: SITE.domain,
    url: `${SITE.origin}/`,
    description: SITE.tagline,
    inLanguage: 'en',
  };
}

function imageObject({ url, caption }) {
  return {
    '@type': 'ImageObject',
    contentUrl: absolute(url),
    url: absolute(url),
    width: 1000,
    height: 1500,
    caption,
    encodingFormat: 'image/png',
    license: `${SITE.origin}/`,
    acquireLicensePage: `${SITE.origin}/`,
  };
}

/**
 * @param {{name:string, url:string, description:string, image:string,
 *          imageAlt:string, breadcrumb:Array<{name:string,url:string}>,
 *          faq?:Array<{q:string,a:string}>, isRoot?:boolean}} page
 */
export function pageSchema(page) {
  const blocks = [];

  if (page.isRoot) blocks.push(websiteSchema());

  blocks.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absolute(page.url)}#webpage`,
    name: page.name,
    url: absolute(page.url),
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    primaryImageOfPage: imageObject({ url: page.image, caption: page.imageAlt }),
    ...(page.about ? { about: page.about } : {}),
  });

  blocks.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: page.breadcrumb.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.url),
    })),
  });

  // FAQ rich results were retired in May 2026, so this earns nothing in the
  // SERP any more. It stays because it is valid, costs a few hundred bytes and
  // is the shape answer engines parse.
  if (page.faq && page.faq.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return blocks;
}
