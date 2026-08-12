/**
 * 求籤結果 → 真廟 / 路線的推薦資料（build time 產生）。
 *
 * 資料鏈：神明 id → temples[].mainDeities[].id → routes[].stops[].templeId
 * `mainDeities` 本來就帶神明 id，所以是精準比對，不需要廟名字串映射。
 *
 * 覆蓋率：28 / 53 尊神明查得到主祀廟。查無廟時由呼叫端決定 fallback
 * （見 PRODUCT-PROGRESS.md「Step 0 真正要處理的三件事」）。
 */

export type Lang = 'zh-TW' | 'en' | 'ja';

interface MainDeity {
  id?: string;
  name?: string;
}

interface TempleRecord {
  id: string;
  name: string;
  location?: string;
  mainDeities?: MainDeity[];
  sortOrder?: number;
}

interface RouteStop {
  templeId?: string;
}

interface RouteRecord {
  id: string;
  name: string;
  stops?: RouteStop[];
}

export interface RecommendedTemple {
  id: string;
  name: string;
  location: string;
  href: string;
}

export interface RecommendedRoute {
  id: string;
  name: string;
  href: string;
}

export interface GodRecommendation {
  temples: RecommendedTemple[];
  routes: RecommendedRoute[];
}

/** 一次最多推幾間廟 / 幾條路線 — 呼應「留白是設計、量一定要輕」 */
const MAX_TEMPLES = 3;
const MAX_ROUTES = 2;

/**
 * 唯一的量測手段：CTA 連結帶 `?from=<來源>`，GA4 頁面報表直接看得到點擊數（零 JS 埋點）。
 * 每個入口用不同的來源值，數據才分得開（求籤 vs 神明指南）。
 */
export type CtaSource = 'fortune' | 'guide';

const templeModules = import.meta.glob<TempleRecord[]>('/src/data/*/temples-*.json', {
  eager: true,
  import: 'default',
});

const routeModules = import.meta.glob<RouteRecord[]>('/src/data/*/routes.json', {
  eager: true,
  import: 'default',
});

const localePrefix = (lang: Lang): string => (lang === 'zh-TW' ? '' : `/${lang}`);

function collect<T>(modules: Record<string, T[]>, lang: Lang): T[] {
  const out: T[] = [];
  for (const [path, records] of Object.entries(modules)) {
    if (path.startsWith(`/src/data/${lang}/`) && Array.isArray(records)) {
      out.push(...records);
    }
  }
  return out;
}

/**
 * 產生 `神明 id → { 主祀廟, 經過那些廟的路線 }` 的對照表。
 * 廟依 sortOrder（顯著度）排序，取前 MAX_TEMPLES 間。
 */
export function buildGodRecommendations(lang: Lang, source: CtaSource = 'fortune'): Record<string, GodRecommendation> {
  const temples = collect(templeModules, lang);
  const routes = collect(routeModules, lang);
  const prefix = localePrefix(lang);
  const track = `?from=${source}`;

  // templeId → 經過該廟的路線
  const routesByTemple = new Map<string, RouteRecord[]>();
  for (const route of routes) {
    for (const stop of route.stops ?? []) {
      if (!stop.templeId) continue;
      const list = routesByTemple.get(stop.templeId);
      if (list) list.push(route);
      else routesByTemple.set(stop.templeId, [route]);
    }
  }

  // 神明 id → 主祀廟（先收集，之後排序裁切）
  const templesByGod = new Map<string, TempleRecord[]>();
  for (const temple of temples) {
    for (const deity of temple.mainDeities ?? []) {
      if (!deity.id) continue;
      const list = templesByGod.get(deity.id);
      if (list) list.push(temple);
      else templesByGod.set(deity.id, [temple]);
    }
  }

  const result: Record<string, GodRecommendation> = {};

  for (const [godId, matched] of templesByGod) {
    const picked = [...matched]
      .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
      .slice(0, MAX_TEMPLES);

    const seenRoutes = new Set<string>();
    const relatedRoutes: RecommendedRoute[] = [];
    for (const temple of picked) {
      for (const route of routesByTemple.get(temple.id) ?? []) {
        if (seenRoutes.has(route.id) || relatedRoutes.length >= MAX_ROUTES) continue;
        seenRoutes.add(route.id);
        relatedRoutes.push({
          id: route.id,
          name: route.name,
          href: `${prefix}/routes/${route.id}${track}`,
        });
      }
    }

    result[godId] = {
      temples: picked.map((temple) => ({
        id: temple.id,
        name: temple.name,
        location: temple.location ?? '',
        href: `${prefix}/temples/${temple.id}${track}`,
      })),
      routes: relatedRoutes,
    };
  }

  return result;
}

/** 查無主祀廟時的退路：導去主題路線總覽（原民類由呼叫端直接不顯示） */
export function routesIndexHref(lang: Lang, source: CtaSource = 'fortune'): string {
  return `${localePrefix(lang)}/routes?from=${source}`;
}
