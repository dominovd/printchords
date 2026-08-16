/**
 * Fail the build on a broken image or a dead download link.
 *
 * The PNGs and PDFs are generated, not committed, so a new chart can reach a
 * page before its sheet exists on disk. That shows up as a broken image in the
 * browser and as nothing at all in image search. This turns it into a build
 * error instead.
 */
import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

export async function checkAssets({ distDir }) {
  const missing = [];
  let checked = 0;

  for (const file of await htmlFiles(distDir)) {
    const html = await readFile(file, 'utf8');
    const page = '/' + relative(distDir, file).split(sep).slice(0, -1).join('/');
    const referenced = [
      ...html.matchAll(/(?:src|href)="(\/(?:img|pdf|fonts)\/[^"]+)"/g),
    ].map((match) => match[1]);

    for (const path of new Set(referenced)) {
      checked += 1;
      try {
        await access(join(distDir, path.replace(/^\//, '')));
      } catch {
        missing.push(`${page || '/'} references ${path}`);
      }
    }
  }

  // robots.txt promises a sitemap. Make the build prove it is there, so the
  // question cannot come up again after a deploy.
  const robots = await readFile(join(distDir, 'robots.txt'), 'utf8').catch(() => '');
  for (const [, url] of robots.matchAll(/^Sitemap:\s*(\S+)/gim)) {
    const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
    checked += 1;
    try {
      const index = await readFile(join(distDir, path), 'utf8');
      for (const [, child] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const childPath = child.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
        checked += 1;
        await access(join(distDir, childPath));
      }
    } catch {
      missing.push(`robots.txt promises ${url}, which the build did not produce`);
    }
  }

  if (missing.length) {
    throw new Error(
      `${missing.length} referenced file(s) do not exist. Run \`npm run assets\`.\n  ` + missing.join('\n  ')
    );
  }
  return { checked };
}
