#!/usr/bin/env node
/**
 * 一致性對帳 — 跑一次就知道「三語資料對不對得上」以及「文件裡的數字有沒有過期」。
 *
 *   node scripts/verify-consistency.mjs
 *
 * 為什麼有這支：
 * 1. 原本的 verify-consistency.mjs 是 C:/tmp 的臨時腳本、已遺失，三語一致性從此沒有自動驗證。
 * 2. 文件裡的數字（筆數、覆蓋率、路線數）會過期而沒人發現 —— 2026-08-09 抓到
 *    CONTENT-PROGRESS 的路線寫 4（實際 8）、roadmap 的流量還停在三月基線。
 *    數字是負債，靠人記得改不可靠，所以改成機器對帳。
 *
 * 有任何一項不符就 exit 1。
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['zh-TW', 'en', 'ja'];
const BASE_LANG = 'zh-TW';

const problems = [];
const fail = (msg) => problems.push(msg);

const readJson = (lang, base) => JSON.parse(readFileSync(join(ROOT, 'src/data', lang, `${base}.json`), 'utf8'));
const readDoc = (name) => readFileSync(join(ROOT, name), 'utf8');

const dataFiles = readdirSync(join(ROOT, 'src/data', BASE_LANG))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort();

// ---------------------------------------------------------------------------
// 1. 三語資料一致性：檔案齊全 / 筆數相同 / id 順序相同 / 欄位不缺
// ---------------------------------------------------------------------------

console.log('▸ 三語資料一致性');

const counts = {};

for (const base of dataFiles) {
  const records = {};

  for (const lang of LANGS) {
    try {
      records[lang] = readJson(lang, base);
    } catch {
      fail(`[資料] ${lang}/${base}.json 讀不到或不是合法 JSON`);
    }
  }
  if (LANGS.some((l) => !records[l])) continue;

  const baseRecords = records[BASE_LANG];
  counts[base] = baseRecords.length;

  for (const lang of LANGS.filter((l) => l !== BASE_LANG)) {
    const other = records[lang];

    if (other.length !== baseRecords.length) {
      fail(`[資料] ${base}: 筆數不一致 — ${BASE_LANG}=${baseRecords.length} / ${lang}=${other.length}`);
      continue;
    }

    const baseIds = baseRecords.map((r) => r.id);
    const otherIds = other.map((r) => r.id);
    const firstDiff = baseIds.findIndex((id, i) => id !== otherIds[i]);
    if (firstDiff !== -1) {
      fail(
        `[資料] ${base}: id 順序不一致 — 第 ${firstDiff + 1} 筆 ${BASE_LANG}="${baseIds[firstDiff]}" / ${lang}="${otherIds[firstDiff]}"`
      );
      continue;
    }

    baseRecords.forEach((record, i) => {
      const missing = Object.keys(record).filter((k) => !(k in other[i]));
      if (missing.length) {
        fail(`[資料] ${base}: ${lang} 第 ${i + 1} 筆（${record.id}）缺欄位 ${missing.join(', ')}`);
      }
    });
  }
}

console.log(`  ${dataFiles.length} 個 data 檔 × ${LANGS.length} 語系比對完成`);

// ---------------------------------------------------------------------------
// 2. 衍生指標（CTA 覆蓋率、路線美食）— 文件會引用這些數字
// ---------------------------------------------------------------------------

const godBases = ['taoist-gods', 'buddhist-gods', 'folk-gods', 'hakka-gods', 'indigenous-spirits'];
const templeBases = ['temples-north', 'temples-central', 'temples-south', 'temples-east'];
const cultureBases = ['culture-customs', 'culture-festivals', 'culture-heritage', 'culture-rituals', 'culture-mantras'];

const allGods = godBases.flatMap((b) => readJson(BASE_LANG, b));
const allTemples = templeBases.flatMap((b) => readJson(BASE_LANG, b));
const routes = readJson(BASE_LANG, 'routes');

const godsWithTemple = allGods.filter((g) =>
  allTemples.some((t) => (t.mainDeities ?? []).some((d) => d.id === g.id))
).length;

const routesWithFood = routes.filter((r) => r.food).length;

const derived = {
  godsTotal: allGods.length,
  godsWithTemple,
  templesTotal: allTemples.length,
  routesTotal: routes.length,
  routesWithFood,
  // 「神明 46」= 神明四類，不含原民
  godsExcludingIndigenous: godBases.filter((b) => b !== 'indigenous-spirits').reduce((sum, b) => sum + counts[b], 0),
  cultureTotal: cultureBases.reduce((sum, b) => sum + counts[b], 0),
};

console.log('\n▸ 衍生指標（實算）');
console.log(`  神明 ${derived.godsExcludingIndigenous} + 原民 ${counts['indigenous-spirits']}`);
console.log(`  廟宇 ${derived.templesTotal} ／ 文化 ${derived.cultureTotal} ／ 路線 ${derived.routesTotal}`);
console.log(`  CTA 覆蓋：${derived.godsWithTemple} / ${derived.godsTotal} 尊神明查得到主祀廟`);
console.log(`  路線配美食：${derived.routesWithFood} / ${derived.routesTotal}`);

// ---------------------------------------------------------------------------
// 3. 文件數字對帳
// ---------------------------------------------------------------------------

console.log('\n▸ 文件數字對帳');

const contentProgress = readDoc('CONTENT-PROGRESS.md');
const productProgress = readDoc('PRODUCT-PROGRESS.md');

/** 在 markdown 表格裡找「含 needle 的那一列的第一個數字欄」 */
const rowNumber = (doc, needle) => {
  const row = doc.split('\n').find((line) => line.startsWith('|') && line.includes(needle));
  if (!row) return { missing: true };
  const cells = row
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
  const numberCell = cells.slice(1).find((c) => /^\d[\d,]*$/.test(c));
  if (numberCell === undefined) return { missing: true };
  return { value: Number(numberCell.replace(/,/g, '')) };
};

const checkRow = (docName, doc, needle, expected, label) => {
  const found = rowNumber(doc, needle);
  if (found.missing) {
    fail(`[文件] ${docName}: 找不到「${needle}」那一列的數字欄（列被改名或刪掉了？）`);
  } else if (found.value !== expected) {
    fail(`[文件] ${docName}: ${label ?? needle} 寫 ${found.value}，實際 ${expected}`);
  }
};

// CONTENT-PROGRESS 進度總表：每個 data 檔一列，列標題含檔名
for (const base of dataFiles) {
  checkRow('CONTENT-PROGRESS.md', contentProgress, ` ${base} `, counts[base], base);
}

// PRODUCT-PROGRESS 地基層現況表（列標題是中文，逐項對映）
const baseLayerRows = [
  ['| 神明 ', derived.godsExcludingIndigenous, '神明總數'],
  ['| 原民信仰 ', counts['indigenous-spirits'], '原民信仰'],
  ['| 廟宇 ', derived.templesTotal, '廟宇總數'],
  ['| 文化 ', derived.cultureTotal, '文化總數'],
  ['| 神明故事 ', counts['god-stories'], '神明故事'],
  ['| 路線 ', derived.routesTotal, '路線'],
  ['| 籤詩 ', counts['fortunes'], '籤詩'],
  ['| 神明指南 ', counts['god-guide'], '神明指南'],
];
for (const [needle, expected, label] of baseLayerRows) {
  checkRow('PRODUCT-PROGRESS.md', productProgress, needle, expected, label);
}

// 散在內文的數字
const inlineChecks = [
  {
    doc: 'PRODUCT-PROGRESS.md',
    text: productProgress,
    re: /覆蓋率實測：(\d+)\s*\/\s*(\d+)\s*尊神明/,
    expected: [derived.godsWithTemple, derived.godsTotal],
    label: 'CTA 覆蓋率',
  },
  {
    doc: 'PRODUCT-PROGRESS.md',
    text: productProgress,
    re: /\*\*(\d+)\/(\d+)\s*皆已配廟口美食\*\*/,
    expected: [derived.routesWithFood, derived.routesTotal],
    label: '路線配美食',
  },
  {
    doc: 'CONTENT-PROGRESS.md',
    text: contentProgress,
    re: /(\d+)\/(\d+)\s*皆配廟口美食/,
    expected: [derived.routesWithFood, derived.routesTotal],
    label: '路線配美食',
  },
];

for (const { doc, text, re, expected, label } of inlineChecks) {
  const m = text.match(re);
  if (!m) {
    fail(`[文件] ${doc}: 找不到「${label}」的敘述（措辭被改過？）`);
    continue;
  }
  const actual = m.slice(1).map(Number);
  if (actual.join('/') !== expected.join('/')) {
    fail(`[文件] ${doc}: ${label} 寫 ${actual.join(' / ')}，實際 ${expected.join(' / ')}`);
  }
}

// ---------------------------------------------------------------------------

console.log('');
if (problems.length) {
  console.error(`✗ ${problems.length} 項不一致：\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\n（文件類問題就是數字過期，改文件即可；資料類問題要回去補三語資料）');
  process.exit(1);
}

console.log('✓ 三語資料與文件數字全部一致');
