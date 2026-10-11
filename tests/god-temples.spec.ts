import { test, expect } from '@playwright/test';
import fs from 'node:fs';

interface GodTemple {
  name: string;
  url?: string;
}
interface God {
  id: string;
  temples?: GodTemple[];
}
const load = (lang: string, base: string): God[] =>
  JSON.parse(fs.readFileSync(`src/data/${lang}/${base}.json`, 'utf8'));
const templeNames = (lang: string) =>
  new Set(
    ['north', 'central', 'south', 'east'].flatMap((r) =>
      (JSON.parse(fs.readFileSync(`src/data/${lang}/temples-${r}.json`, 'utf8')) as GodTemple[]).map((t) => t.name)
    )
  );

// A god's temple card links to the temple page (name in the temple DB), to its map link (url),
// or to nothing. A card with neither must not render as a link without an href.
const CASES = [
  { base: 'indigenous-spirits', path: 'indigenous', id: 'pastai' },
  { base: 'folk-gods', path: 'folk', id: 'qiniangma' },
];
const LANGS = [
  { prefix: '', lang: 'zh-TW' },
  { prefix: '/en', lang: 'en' },
  { prefix: '/ja', lang: 'ja' },
];

for (const { prefix, lang } of LANGS) {
  const names = templeNames(lang);
  for (const { base, path, id } of CASES) {
    test(`temple cards link only where a target exists (${lang} ${id})`, async ({ page }) => {
      const temples = load(lang, base).find((g) => g.id === id)?.temples || [];
      expect(temples.length).toBeGreaterThan(0);
      const response = await page.goto(`${prefix}/gods/${path}/${id}`);
      expect(response?.status()).toBe(200);
      const section = page.locator('#temples');
      for (const t of temples) await expect(section).toContainText(t.name);
      await expect(section.locator('a:not([href])')).toHaveCount(0);
      const linked = temples.filter((t) => names.has(t.name) || t.url);
      await expect(section.locator('a[href]')).toHaveCount(linked.length);
      for (const t of temples.filter((x) => !names.has(x.name) && x.url)) {
        await expect(section.locator(`a[href="${t.url}"]`)).toContainText(t.name);
      }
    });
  }
}
