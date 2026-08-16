// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeImageSitemap } from './scripts/image-sitemap.mjs';
import { checkAssets } from './scripts/check-assets.mjs';
import { generateAssets } from './scripts/generate-images.mjs';

const SITE = 'https://printchords.com';

/**
 * The PNGs and PDFs are generated rather than committed, so three things have
 * to happen automatically: the dev server regenerates them on start, the build
 * refuses to ship a page that points at a file which is not there, and the
 * image sitemap lists what the pages actually show.
 */
const printableAssets = () => ({
  name: 'printchords:assets',
  hooks: {
    'astro:server:start': async ({ logger }) => {
      const written = await generateAssets({ quiet: true });
      logger.info(`${written.length} printable assets ready`);
    },
    'astro:build:done': async ({ dir, logger }) => {
      const { checked } = await checkAssets({ distDir: fileURLToPath(dir) });
      logger.info(`${checked} asset references checked, none missing`);
      const result = await writeImageSitemap({ distDir: fileURLToPath(dir), site: SITE });
      logger.info(`sitemap-images.xml: ${result.images} images across ${result.pages} pages`);
    },
  },
});

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap(), printableAssets()],
});
