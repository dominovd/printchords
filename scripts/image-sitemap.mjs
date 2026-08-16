/**
 * Image sitemap.
 *
 * Image results carry 97% of this cluster's keywords, so the printable PNGs are
 * the assets that most need discovering. @astrojs/sitemap only lists pages, so
 * this reads the built HTML, collects the images each page actually shows and
 * writes them out alongside it.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name === 'index.html') out.push(path);
  }
  return out;
}

/** Every <img> on the page, plus its og:image, with the alt text as the caption. */
function imagesIn(html) {
  const found = new Map();
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src || !src.startsWith('/img/')) continue;
    const alt = (tag.match(/\salt="([^"]*)"/) || [])[1] || '';
    if (!found.has(src)) found.set(src, alt);
  }
  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (og) {
    const path = og.replace(/^https?:\/\/[^/]+/, '');
    if (path.startsWith('/img/') && !found.has(path)) {
      found.set(path, (html.match(/<meta property="og:image:alt" content="([^"]*)"/) || [])[1] || '');
    }
  }
  return found;
}

export async function writeImageSitemap({ distDir, site }) {
  const origin = String(site).replace(/\/$/, '');
  const entries = [];

  for (const file of await htmlFiles(distDir)) {
    const html = await readFile(file, 'utf8');
    // A page that only redirects has nothing of its own to list.
    if (/<meta http-equiv="refresh"/i.test(html)) continue;
    const images = imagesIn(html);
    if (!images.size) continue;
    const dir = relative(distDir, join(file, '..')).split(sep).filter(Boolean).join('/');
    const loc = dir ? `${origin}/${dir}/` : `${origin}/`;
    entries.push({ loc, images });
  }

  entries.sort((a, b) => a.loc.localeCompare(b.loc));

  const body = entries
    .map(({ loc, images }) => {
      const tags = [...images]
        .map(([src, caption]) =>
          '    <image:image>\n' +
          `      <image:loc>${escapeXml(origin + src)}</image:loc>\n` +
          (caption ? `      <image:caption>${escapeXml(caption)}</image:caption>\n` : '') +
          '    </image:image>'
        )
        .join('\n');
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${tags}\n  </url>`;
    })
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    body + '\n</urlset>\n';

  await writeFile(join(distDir, 'sitemap-images.xml'), xml);

  // Add it to the index @astrojs/sitemap just wrote, so robots.txt still needs
  // to point at only one file.
  const indexPath = join(distDir, 'sitemap-index.xml');
  try {
    const index = await readFile(indexPath, 'utf8');
    if (!index.includes('sitemap-images.xml')) {
      await writeFile(
        indexPath,
        index.replace(
          '</sitemapindex>',
          `<sitemap><loc>${origin}/sitemap-images.xml</loc></sitemap></sitemapindex>`
        )
      );
    }
  } catch {
    // No page sitemap in this build; the image sitemap stands on its own.
  }

  const total = entries.reduce((sum, entry) => sum + entry.images.size, 0);
  return { pages: entries.length, images: total };
}
