import { test, expect } from '@playwright/test';
import fs from 'node:fs';

interface VisitSource {
  name: string;
  url: string;
}
interface Temple {
  id: string;
  name: string;
  visit?: { hours: string; gettingThere: string; whenToGo: string; checkedAt: string; sources: VisitSource[] };
}
const load = (lang: string): Temple[] => JSON.parse(fs.readFileSync(`src/data/${lang}/temples-north.json`, 'utf8'));
const zhNorth = load('zh-TW');
const enNorth = load('en');
const jaNorth = load('ja');

// The visit box is optional per temple: it must show the data (with checked date
// and sources) where `visit` exists, and render nothing where it does not.
const LANGS = [
  { prefix: '', data: zhNorth, checked: '查證' },
  { prefix: '/en', data: enNorth, checked: 'Checked on' },
  { prefix: '/ja', data: jaNorth, checked: '確認' },
];

for (const { prefix, data, checked } of LANGS) {
  const withVisit = data.find((t) => t.visit);
  const withoutVisit = data.find((t) => !t.visit);

  test(`visit box shows data, date and sources (${prefix || 'zh'})`, async ({ page }) => {
    const visit = withVisit?.visit;
    expect(visit).toBeTruthy();
    if (!withVisit || !visit) return;
    // No trailing slash: the dev server 404s on it (production accepts both).
    const response = await page.goto(`${prefix}/temples/${withVisit.id}`);
    expect(response?.status()).toBe(200);
    const box = page.getByTestId('temple-visit');
    await expect(box).toBeVisible();
    await expect(box).toContainText(visit.hours);
    await expect(box).toContainText(visit.gettingThere);
    await expect(box).toContainText(visit.whenToGo);
    await expect(box).toContainText(checked);
    await expect(box).toContainText(visit.checkedAt);
    await expect(box.locator('a')).toHaveCount(visit.sources.length);
    for (const source of visit.sources) {
      await expect(box.locator(`a[href="${source.url}"]`)).toHaveText(source.name);
    }
  });

  test(`no visit box when the temple has no visit data (${prefix || 'zh'})`, async ({ page }) => {
    expect(withoutVisit).toBeTruthy();
    if (!withoutVisit) return;
    const response = await page.goto(`${prefix}/temples/${withoutVisit.id}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(withoutVisit.name);
    await expect(page.getByTestId('temple-visit')).toHaveCount(0);
  });
}
