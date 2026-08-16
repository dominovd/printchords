import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sourceFiles(path)));
    else if (['.mjs', '.js', '.json', '.astro', '.css'].includes(extname(entry.name))) out.push(path);
  }
  return out;
}

test('no em dashes anywhere in the source', async () => {
  // An em dash reads as machine-written English, and this site's whole pitch is
  // that a person wrote the charts. En dashes stay: "Frets 3–5" is a range.
  const offenders = [];
  for (const dir of ['src', 'scripts']) {
    for (const file of await sourceFiles(join(root, dir))) {
      const text = await readFile(file, 'utf8');
      text.split('\n').forEach((line, index) => {
        if (line.includes('—')) offenders.push(`${file.replace(root + '/', '')}:${index + 1}  ${line.trim().slice(0, 90)}`);
      });
    }
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}\n`);
});

test('meta descriptions stay inside the snippet Google shows', async () => {
  const { charts } = await import('../src/data/charts.mjs');
  const { blankPage } = await import('../src/data/blanks.mjs');
  const { scalesPage, pentatonicPage } = await import('../src/data/scale-pages.mjs');
  const { chords } = await import('../src/lib/chords.mjs');

  const described = [
    ...charts.map((c) => [c.id, c.metaDescription]),
    ['blank-chord-chart', blankPage.metaDescription],
    ['guitar-scales', scalesPage.metaDescription],
    ['pentatonic', pentatonicPage.metaDescription],
    ...chords.filter((c) => c.pageUrl).map((c) => [c.id, c.metaDescription]),
  ];

  for (const [id, description] of described) {
    assert.ok(description, `${id}: no meta description`);
    assert.ok(description.length >= 110, `${id}: description is only ${description.length} chars`);
    assert.ok(description.length <= 155, `${id}: description is ${description.length} chars, will be truncated`);
  }
});
