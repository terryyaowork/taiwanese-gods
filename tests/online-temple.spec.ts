import { test, expect, type Page } from '@playwright/test';

// 開發模式下頁面連 http://localhost:8787 的計數器；測試一律用假的回應，不依賴 wrangler dev
const HALL = 'http://localhost:8787';

interface HallState {
  total: number;
  today: number;
  sittingNow: number;
  sitToday: number;
}

async function mockHall(page: Page, state: HallState) {
  const calls: string[] = [];
  await page.route(`${HALL}/**`, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    calls.push(`${req.method()} ${path}${req.postData() ? ' ' + req.postData() : ''}`);
    let body: Record<string, unknown> = { ...state };
    if (path === '/incense') {
      state.total += 1;
      state.today += 1;
      body = { ...state, counted: true };
    } else if (path === '/sit') {
      state.sittingNow += 1;
      state.sitToday += 1;
      body = { ...state, seated: true };
    } else if (path === '/bow') {
      body = { ...state, bowed: Math.max(0, state.sittingNow - 1) };
    } else if (path === '/stand') {
      state.sittingNow = Math.max(0, state.sittingNow - 1);
      body = { ...state };
    }
    await route.fulfill({
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });
  return calls;
}

async function holdToLight(page: Page, ms = 1600) {
  const box = await page.locator('#hold-light').boundingBox();
  if (!box) throw new Error('hold button not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

const burnerStep = (page: Page, step: string) => page.locator(`[data-panel="burner"] [data-step="${step}"]`);

async function bowThreeTimes(page: Page) {
  const bow = page.locator('#bow-btn');
  for (let i = 1; i <= 3; i++) {
    await bow.click();
    await expect(bow).toContainText(`${i} / 3`);
    await page.waitForTimeout(950);
  }
}

test.describe('Online temple — zh-TW', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // 只清最上層頁面：Partytown 會開同網域的隱藏 iframe，晚載入時會把頁面剛存的資料清掉。
    // 只在第一次載入時清，重新整理要能看到上次存的資料
    await page.addInitScript(() => {
      if (window.top !== window || sessionStorage.getItem('test:cleared')) return;
      localStorage.clear();
      sessionStorage.setItem('test:cleared', '1');
    });
  });

  test('shows two stations and no ads', async ({ page }) => {
    await mockHall(page, { total: 0, today: 0, sittingNow: 0, sitToday: 0 });
    await page.goto('/online-temple');
    await expect(page.locator('.station')).toHaveCount(2);
    await expect(page.locator('.nav-btn')).toHaveCount(2);
    await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
  });

  test('a short tap explains that the button must be held', async ({ page }) => {
    await mockHall(page, { total: 0, today: 0, sittingNow: 0, sitToday: 0 });
    await page.goto('/online-temple');
    await holdToLight(page, 150);
    await expect(page.locator('#stage-pop')).not.toBeEmpty();
    await expect(burnerStep(page, 'idle')).toBeVisible();
  });

  test('incense flow counts once and ends with share, next steps and tip', async ({ page }) => {
    const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 0 });
    await page.route(/~partytown/, (route) => route.abort());
    await page.goto('/online-temple');
    await expect(page.locator('#hud-count')).toContainText('150');
    // 網站用 Partytown 把 GA 移到背景執行緒，頁面上的 gtag 和 dataLayer.push 都是轉送函式。
    // 測試擋掉 Partytown 的程式，再把兩個都包一層會記錄的函式（頁面有 gtag 時走 gtag，沒有才推 dataLayer）
    await page.evaluate(() => {
      const w = window as unknown as {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
        __events: unknown[][];
      };
      w.__events = [];
      w.gtag = (...args: unknown[]) => void w.__events.push(args);
      w.dataLayer = w.dataLayer || [];
      const forward = w.dataLayer.push.bind(w.dataLayer);
      w.dataLayer.push = (...items: unknown[]) => {
        items.forEach((item) => w.__events.push(Array.from(item as ArrayLike<unknown>)));
        return forward(...items);
      };
    });

    await holdToLight(page);
    await expect(burnerStep(page, 'pray')).toBeVisible();
    await bowThreeTimes(page);
    await expect(burnerStep(page, 'plant')).toBeVisible();
    await page.locator('#plant-btn').click();
    await expect(burnerStep(page, 'done')).toBeVisible();

    await expect.poll(() => calls.filter((c) => c.startsWith('POST /incense')).length).toBe(1);
    await expect(page.locator('#hud-count')).toContainText('151');
    await expect(page.locator('#temple-fortune-link')).toHaveAttribute('href', /from=temple/);
    await expect(page.locator('#temple-list-link')).toHaveAttribute('href', /\/temples\?from=temple/);
    await expect(page.locator('#temple-tip-link')).toHaveAttribute('href', /ko-fi\.com/);

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __events: unknown[][] }).__events))
      .toContainEqual(['event', 'temple_worship', { method: 'incense' }]);
  });

  test('share sends the page link with a share source', async ({ page }) => {
    await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 0 });
    await page.addInitScript(() => {
      const w = window as unknown as { __sharedUrl?: string };
      Object.defineProperty(navigator, 'canShare', { value: () => true });
      Object.defineProperty(navigator, 'share', {
        value: async (data: ShareData) => {
          w.__sharedUrl = data.url;
        },
      });
    });
    await page.goto('/online-temple');
    await holdToLight(page);
    await bowThreeTimes(page);
    await page.locator('#plant-btn').click();
    await page.locator('#share-btn').click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __sharedUrl?: string }).__sharedUrl))
      .toMatch(/\/online-temple\?from=share$/);
  });

  test('praying with palms does not count as incense', async ({ page }) => {
    const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 0 });
    await page.goto('/online-temple');
    const shareBefore = await page.locator('#share-btn').textContent();
    await page.locator('[data-go="palms"]').click();
    await bowThreeTimes(page);
    await expect(burnerStep(page, 'done')).toBeVisible();
    await expect(page.locator('#share-btn')).not.toHaveText(shareBefore || '');
    expect(calls.filter((c) => c.startsWith('POST /incense'))).toHaveLength(0);
  });

  test('total stays hidden below 100 and only your own count shows', async ({ page }) => {
    await mockHall(page, { total: 5, today: 5, sittingNow: 0, sitToday: 0 });
    await page.goto('/online-temple');
    await expect(page.locator('#hud-count')).toBeEmpty();
    await holdToLight(page);
    await bowThreeTimes(page);
    await page.locator('#plant-btn').click();
    await expect(page.locator('#hud-count')).toContainText('1');
    await expect(page.locator('#hud-count')).not.toContainText('6');
  });

  test('sit for one minute takes a seat and shows the others', async ({ page }) => {
    const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 2, sitToday: 20 });
    await page.goto('/online-temple');
    await holdToLight(page);
    await bowThreeTimes(page);
    await page.locator('#plant-btn').click();
    await page.locator('#sit-next').click();

    await expect(page.locator('.nav-btn').nth(1)).toHaveClass(/is-active/);
    await expect(page.locator('[data-panel="hall"] [data-step="sitting"]')).toBeVisible();
    await expect(page.locator('#sit-clock')).toHaveText(/^(00:5\d|01:00)$/);
    await expect.poll(() => calls.find((c) => c.startsWith('POST /sit'))).toContain('"minutes":1');
    // 計數器回 3 人在坐（含自己），畫面上是你加 2 個別人
    await expect(page.locator('#presence-hall .temple-flame')).toHaveCount(3);
    await expect(page.locator('#hall-count')).toContainText('2');

    await page.locator('#sit-stop').click();
    await expect.poll(() => calls.filter((c) => c.startsWith('POST /stand')).length).toBe(1);
    await expect(page.locator('#presence-hall .temple-flame')).toHaveCount(2);
  });

  test('each visitor gets a name that shows on the hud and on the cushion', async ({ page }) => {
    const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 1, sitToday: 20 });
    await page.goto('/online-temple');
    const tag = (await page.locator('#hud-name').textContent()) || '';
    expect(tag).toMatch(/^香客・\S+$/);
    const name = tag.replace('香客・', '');
    await page.reload();
    // 同一個瀏覽器再來，名字不變
    await expect(page.locator('#hud-name')).toHaveText(tag);
    await page.locator('.nav-btn').nth(1).click();
    await page.locator('#sit-start').click();
    await expect.poll(() => calls.find((c) => c.startsWith('POST /sit'))).toMatch(/"name":\d+/);
    await expect(page.locator('#presence-hall .seat-name').last()).toHaveText(name);
  });

  test('bowing to the others sitting is sent once per sit', async ({ page }) => {
    const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 2, sitToday: 20 });
    await page.goto('/online-temple');
    await page.locator('.nav-btn').nth(1).click();
    await page.locator('#sit-start').click();
    const bowAll = page.locator('#bow-all');
    await expect(bowAll).toBeVisible();
    await bowAll.click();
    await expect(page.locator('#hall-count')).toContainText('合十');
    await expect(bowAll).toBeHidden();
    expect(calls.filter((c) => c.startsWith('POST /bow'))).toHaveLength(1);
  });

  test('a large crowd fills the courtyard with a capped number of lights', async ({ page }) => {
    await mockHall(page, { total: 150, today: 12, sittingNow: 5000, sitToday: 9000 });
    await page.goto('/online-temple');
    await page.locator('.nav-btn').nth(1).click();
    await expect(page.locator('#hall-count')).toContainText('5,000');
    const dots = await page.locator('#presence-hall .hall-crowd circle').count();
    expect(dots).toBeGreaterThan(0);
    expect(dots).toBeLessThanOrEqual(400);
    // 鏡頭拉遠，殿和廟埕都在畫面裡
    await expect
      .poll(async () => Number((await page.locator('#hall-art').getAttribute('viewBox'))?.split(' ')[2]))
      .toBeGreaterThan(400);
  });

  test('the bow button stays hidden when you sit alone', async ({ page }) => {
    await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 0 });
    await page.goto('/online-temple');
    await page.locator('.nav-btn').nth(1).click();
    await page.locator('#sit-start').click();
    await expect(page.locator('[data-panel="hall"] [data-step="sitting"]')).toBeVisible();
    await expect(page.locator('#bow-all')).toBeHidden();
  });

  test('when nobody else is sitting, today’s sitters are shown instead', async ({ page }) => {
    await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 23 });
    await page.goto('/online-temple');
    await page.locator('.nav-btn').nth(1).click();
    await expect(page.locator('#hall-count')).toContainText('23');
    await expect(page.locator('#presence-hall .temple-flame')).toHaveCount(0);
  });

  test('when the counter is down the page still works and backs off', async ({ page }) => {
    const hits: string[] = [];
    await page.route(`${HALL}/**`, (route) => {
      hits.push(route.request().url());
      return route.abort();
    });
    await page.goto('/online-temple');
    await holdToLight(page);
    await bowThreeTimes(page);
    await page.locator('#plant-btn').click();
    await expect(burnerStep(page, 'done')).toBeVisible();
    await expect(page.locator('#hud-count')).toContainText('1');
    // 第一次失敗後 5 分鐘內不再請求，所以插香時沒有再送
    expect(hits).toHaveLength(1);
  });
});

test.describe('線上廟宇入口', () => {
  for (const [prefix, text] of [
    ['', '線上廟宇'],
    ['/en', 'Online Temple'],
    ['/ja', 'オンライン廟'],
  ]) {
    test(`選單有入口，連到同語言的頁面，整頁重新載入（${prefix || 'zh'}）`, async ({ page }) => {
      await page.goto(`${prefix}/fortune`);
      const link = page.locator(`header a[href="${prefix}/online-temple?from=nav"]`).first();
      await expect(link).toHaveText(text);
      await expect(link).toHaveAttribute('data-astro-reload', 'true');
    });

    test(`分享預覽圖用這頁自己的圖，不是全站預設圖，而且載得到（${prefix || 'zh'}）`, async ({ page, request }) => {
      await page.goto(`${prefix}/online-temple`);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      const fortune = await page
        .goto(`${prefix}/fortune`)
        .then(() => page.locator('meta[property="og:image"]').getAttribute('content'));
      expect(ogImage).toBeTruthy();
      expect(ogImage).not.toBe(fortune);
      const res = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(/^image\//);
    });
  }

  test('桌機最窄寬度時，選單排成一列，不壓到右邊的按鈕', async ({ page }) => {
    for (const [prefix, width] of ['', '/en', '/ja'].flatMap((p) => [1024, 1280].map((w) => [p, w] as const))) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${prefix}/fortune`);
      const box = await page.evaluate(() => {
        const nav = document.querySelector('header nav')!;
        const items = [...nav.querySelector('ul')!.children].filter((li) => getComputedStyle(li).display !== 'none');
        const icons = [...nav.nextElementSibling!.querySelectorAll('button, a')]
          .map((e) => e.getBoundingClientRect())
          .filter((r) => r.width > 0);
        return {
          overflow: nav.scrollWidth - nav.clientWidth,
          rows: new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))).size,
          lastRight: items[items.length - 1].getBoundingClientRect().right,
          iconLeft: Math.min(...icons.map((r) => r.left)),
        };
      });
      const where = `${prefix || 'zh'} ${width}px`;
      expect(box.overflow, where).toBe(0);
      expect(box.rows, where).toBe(1);
      expect(box.lastRight, where).toBeLessThan(box.iconLeft);
    }
  });
});

for (const [lang, title, bow1, nameTag] of [
  ['en', 'Online Temple', 'First bow', 'Pilgrim · '],
  ['ja', 'オンライン廟', '一拝', '参拝客・'],
] as const) {
  test.describe(`Online temple — ${lang}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript(() => {
        if (window.top !== window || sessionStorage.getItem('test:cleared')) return;
        localStorage.clear();
        sessionStorage.setItem('test:cleared', '1');
      });
    });

    test('整套參拜用這個語言，下一步連到同語言的頁面', async ({ page }) => {
      const calls = await mockHall(page, { total: 150, today: 12, sittingNow: 0, sitToday: 0 });
      await page.goto(`/${lang}/online-temple`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('.hud-title')).toContainText(title);
      await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0);
      await expect(page.locator('#hud-name')).toContainText(nameTag);

      await holdToLight(page);
      await expect(burnerStep(page, 'pray')).toBeVisible();
      await page.locator('#bow-btn').click();
      await expect(page.locator('#stage-pop')).toHaveText(bow1);
      await page.waitForTimeout(950);
      for (let i = 2; i <= 3; i++) {
        await page.locator('#bow-btn').click();
        await expect(page.locator('#bow-btn')).toContainText(`${i} / 3`);
        await page.waitForTimeout(950);
      }
      await page.locator('#plant-btn').click();
      await expect(burnerStep(page, 'done')).toBeVisible();
      await expect.poll(() => calls.filter((c) => c.startsWith('POST /incense')).length).toBe(1);
      await expect(page.locator('#temple-fortune-link')).toHaveAttribute(
        'href',
        `/${lang}/fortune?god=yuhuang&from=temple`
      );
      await expect(page.locator('#temple-list-link')).toHaveAttribute('href', `/${lang}/temples?from=temple`);
    });
  });
}
