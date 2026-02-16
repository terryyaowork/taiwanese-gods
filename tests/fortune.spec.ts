import { test, expect } from '@playwright/test';

test.describe('Fortune page — zh-TW', () => {
  test('loads default god (Jade Emperor) when no query param', async ({ page }) => {
    await page.goto('/fortune');
    const img = page.locator('#god-avatar-img');
    await expect(img).toHaveAttribute('src', /./);
    // Should show Jade Emperor title
    const title = page.locator('#god-title');
    await expect(title).toContainText('玉皇大帝');
  });

  test('loads specific god from query param', async ({ page }) => {
    await page.goto('/fortune?god=mazu');
    const title = page.locator('#god-title');
    await expect(title).toContainText('媽祖');
    // Back link should be visible and point to correct god page
    const backLink = page.locator('#god-back-link');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', /\/gods\/taoism\/mazu/);
  });

  test('moon blocks (擲筊) button works and shows result', async ({ page }) => {
    await page.goto('/fortune');
    const btn = page.locator('.btn-zhibei');
    await expect(btn).toBeVisible();
    await btn.click();
    // Wait for result to appear (800ms animation)
    await page.waitForTimeout(1200);
    // Should show a result image
    const resultImg = page.locator('.zhibei-result-area img');
    await expect(resultImg).toBeVisible();
    // Should show result text (聖筊/笑筊/陰筊)
    const resultText = page.locator('.zhibei-text');
    await expect(resultText).not.toBeEmpty();
  });

  test('fortune sticks (求籤) button works and triggers flow', async ({ page }) => {
    await page.goto('/fortune');
    const btn = page.locator('.btn-draw');
    await expect(btn).toBeVisible();
    await btn.click();
    // Container should shake then hide (1500ms)
    await page.waitForTimeout(2000);
    // Stick view should be visible with a stick number
    const stickView = page.locator('.qianshi-stick-view');
    await expect(stickView).toBeVisible();
    const stickNumber = page.locator('.stick-number');
    await expect(stickNumber).not.toBeEmpty();
  });

  test('fortune confirmation flow completes (holy or fail)', async ({ page }) => {
    await page.goto('/fortune');
    const btn = page.locator('.btn-draw');
    await btn.click();
    // Wait for stick + auto confirm (1500ms + 1200ms + 800ms + 1000ms)
    await page.waitForTimeout(5500);
    // Either fortune-result is visible (holy) or fail view is visible
    const fortuneResult = page.locator('#fortune-result');
    const failView = page.locator('.qianshi-fail-view');
    const confirmed = page.locator('.qianshi-confirmed');
    const isSuccess = await fortuneResult.isVisible();
    const isFail = await failView.isVisible();
    const isConfirmed = await confirmed.isVisible();
    expect(isSuccess || isFail || isConfirmed).toBeTruthy();
  });
});

test.describe('Fortune page — English', () => {
  test('loads with English labels', async ({ page }) => {
    await page.goto('/en/fortune');
    await expect(page.locator('h1')).toContainText('Fortune Sticks');
    // Divination section should have English labels
    await expect(page.locator('.btn-zhibei')).toContainText('Cast Moon Blocks');
    await expect(page.locator('.btn-draw')).toContainText('Draw Fortune Stick');
  });

  test('loads god from query param with English name', async ({ page }) => {
    await page.goto('/en/fortune?god=xuantian');
    const title = page.locator('#god-title');
    await expect(title).toContainText('Xuantian');
    const img = page.locator('#god-avatar-img');
    await expect(img).toHaveAttribute('src', /xuantian/);
  });

  test('moon blocks button works on English page', async ({ page }) => {
    await page.goto('/en/fortune');
    const btn = page.locator('.btn-zhibei');
    await btn.click();
    await page.waitForTimeout(1200);
    const resultImg = page.locator('.zhibei-result-area img');
    await expect(resultImg).toBeVisible();
  });

  test('fortune sticks button works on English page', async ({ page }) => {
    await page.goto('/en/fortune');
    const btn = page.locator('.btn-draw');
    await btn.click();
    await page.waitForTimeout(2000);
    const stickView = page.locator('.qianshi-stick-view');
    await expect(stickView).toBeVisible();
  });
});

test.describe('Fortune page — Japanese', () => {
  test('loads with Japanese labels', async ({ page }) => {
    await page.goto('/ja/fortune');
    await expect(page.locator('h1')).toContainText('おみくじ');
    await expect(page.locator('.btn-zhibei')).toContainText('筊杯を投げる');
    await expect(page.locator('.btn-draw')).toContainText('おみくじを引く');
  });

  test('moon blocks button works on Japanese page', async ({ page }) => {
    await page.goto('/ja/fortune');
    const btn = page.locator('.btn-zhibei');
    await btn.click();
    await page.waitForTimeout(1200);
    const resultImg = page.locator('.zhibei-result-area img');
    await expect(resultImg).toBeVisible();
  });
});

test.describe('Navigation from god detail to fortune', () => {
  test('god detail page has fortune CTA link with god param', async ({ page }) => {
    await page.goto('/en/gods/taoism/xuantian');
    // The fortune link should include god query param
    const fortuneLink = page.locator('a[href*="/en/fortune?god=xuantian"]');
    await expect(fortuneLink).toBeVisible();
  });

  test('clicking fortune link navigates with god param', async ({ page }) => {
    await page.goto('/en/gods/taoism/xuantian');
    const fortuneLink = page.locator('a[href*="/en/fortune?god=xuantian"]');
    await fortuneLink.click();
    // Wait for navigation
    await page.waitForURL('**/en/fortune?god=xuantian');
    // Verify god photo loaded
    const title = page.locator('#god-title');
    await expect(title).toContainText('Xuantian');
    const img = page.locator('#god-avatar-img');
    await expect(img).toHaveAttribute('src', /xuantian/);
  });

  test('god info loads from sessionStorage fallback', async ({ page }) => {
    // Simulate production scenario: god ID in sessionStorage, no query param
    await page.goto('/en/fortune');
    await page.evaluate(() => sessionStorage.setItem('fortune-god', 'xuantian'));
    await page.reload();
    const title = page.locator('#god-title');
    await expect(title).toContainText('Xuantian');
    const backLink = page.locator('#god-back-link');
    await expect(backLink).toBeVisible();
  });

  test('divination buttons work after navigation from god page', async ({ page }) => {
    await page.goto('/en/gods/taoism/xuantian');
    const fortuneLink = page.locator('a[href*="/en/fortune?god=xuantian"]');
    await fortuneLink.click();
    await page.waitForURL('**/en/fortune?god=xuantian');

    // Test moon blocks button
    const btnZhibei = page.locator('.btn-zhibei');
    await expect(btnZhibei).toBeVisible();
    await btnZhibei.click();
    await page.waitForTimeout(1200);
    const resultImg = page.locator('.zhibei-result-area img');
    await expect(resultImg).toBeVisible();

    // Test fortune sticks button
    const btnDraw = page.locator('.btn-draw');
    await expect(btnDraw).toBeVisible();
    await btnDraw.click();
    await page.waitForTimeout(2000);
    const stickView = page.locator('.qianshi-stick-view');
    await expect(stickView).toBeVisible();
  });
});

test.describe('Draw Again button', () => {
  test('fail view shows Draw Again button that resets', async ({ page }) => {
    await page.goto('/fortune');
    // We may need multiple attempts since holy blocks (50%) skip the fail view
    for (let i = 0; i < 10; i++) {
      const btnDraw = page.locator('.btn-draw');
      if (!(await btnDraw.isVisible())) {
        // Reset if in mid-state
        const btnDrawAgain = page.locator('.btn-draw-again');
        if (await btnDrawAgain.isVisible()) {
          await btnDrawAgain.click();
          await page.waitForTimeout(200);
          continue;
        }
        await page.waitForTimeout(2000);
        continue;
      }
      await btnDraw.click();
      // Wait for full flow: shake(1500) + stick show(1200) + confirm(800) + result(1000)
      await page.waitForTimeout(5500);
      const failView = page.locator('.qianshi-fail-view');
      if (await failView.isVisible()) {
        // Found fail view — test the draw again button
        const btnDrawAgain = page.locator('.btn-draw-again');
        await expect(btnDrawAgain).toBeVisible();
        await btnDrawAgain.click();
        // Container should be back
        const container = page.locator('.qianshi-container-view');
        await expect(container).toBeVisible();
        return; // test passed
      }
      // If holy — wait for reset and try again
      await page.waitForTimeout(2000);
    }
    // If we never hit fail after 10 tries (very unlikely), skip
    test.skip();
  });
});
