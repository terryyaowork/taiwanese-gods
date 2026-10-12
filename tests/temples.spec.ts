import { test, expect } from '@playwright/test';
import fs from 'node:fs';

interface VisitSource {
  name: string;
  url: string;
}
interface Temple {
  id: string;
  name: string;
  visit?: { hours?: string; gettingThere?: string; whenToGo?: string; checkedAt: string; sources: VisitSource[] };
}
type VisitField = 'hours' | 'gettingThere' | 'whenToGo';
const VISIT_FIELDS: VisitField[] = ['hours', 'gettingThere', 'whenToGo'];
const loadRegion = (lang: string, region: string): Temple[] =>
  JSON.parse(fs.readFileSync(`src/data/${lang}/temples-${region}.json`, 'utf8'));
const zhNorth = loadRegion('zh-TW', 'north');
const enNorth = loadRegion('en', 'north');
const jaNorth = loadRegion('ja', 'north');

// The visit box is optional per temple: it must show the data (with checked date
// and sources) where `visit` exists, and render nothing where it does not.
const LANGS = [
  {
    prefix: '',
    lang: 'zh-TW',
    data: zhNorth,
    checked: '查證',
    fieldLabels: { hours: '開放時間', gettingThere: '怎麼去', whenToGo: '何時去' },
  },
  {
    prefix: '/en',
    lang: 'en',
    data: enNorth,
    checked: 'Checked on',
    fieldLabels: { hours: 'Hours', gettingThere: 'Getting There', whenToGo: 'When to Go' },
  },
  {
    prefix: '/ja',
    lang: 'ja',
    data: jaNorth,
    checked: '確認',
    fieldLabels: { hours: '参拝時間', gettingThere: 'アクセス', whenToGo: '混雑する日' },
  },
];

for (const { prefix, lang, data, checked, fieldLabels } of LANGS) {
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
    for (const f of VISIT_FIELDS) if (visit[f]) await expect(box).toContainText(visit[f]);
    await expect(box).toContainText(checked);
    await expect(box).toContainText(visit.checkedAt);
    await expect(box.locator('a')).toHaveCount(visit.sources.length);
    for (const source of visit.sources) {
      await expect(box.locator(`a[href="${source.url}"]`)).toHaveText(source.name);
    }
  });

  test(`visit box leaves out fields that have no data (${prefix || 'zh'})`, async ({ page }) => {
    // Any region: the first temple whose visit is missing at least one field.
    const all = ['north', 'central', 'south', 'east'].flatMap((r) => loadRegion(lang, r));
    const partial = all.find((t) => t.visit && VISIT_FIELDS.some((f) => !t.visit?.[f]));
    expect(partial).toBeTruthy();
    if (!partial?.visit) return;
    const response = await page.goto(`${prefix}/temples/${partial.id}`);
    expect(response?.status()).toBe(200);
    const box = page.getByTestId('temple-visit');
    await expect(box).toBeVisible();
    for (const f of VISIT_FIELDS) {
      const label = box.locator('dt', { hasText: fieldLabels[f] });
      await expect(label).toHaveCount(partial.visit[f] ? 1 : 0);
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
