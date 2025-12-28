/**
 * 百度翻译功能测试
 */

const { chromium } = require('playwright');

(async () => {
  console.log('百度翻译功能测试');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  }).then(ctx => ctx.newPage());

  try {
    console.log('\n[1] 打开应用...');
    await page.goto('http://localhost:3008', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('  标题:', await page.title());

    console.log('\n[2] 打开翻译面板...');
    const translateBtn = page.locator('button').filter({ hasText: '🌐' }).first();
    if (await translateBtn.isVisible()) {
      await translateBtn.click();
      await page.waitForTimeout(1000);
      console.log('  翻译面板已打开');
    }

    console.log('\n[3] 选择百度翻译引擎...');
    const baiduBtn = page.locator('button:has-text("百度翻译")').first();
    if (await baiduBtn.isVisible()) {
      await baiduBtn.click();
      console.log('  已选择百度翻译');
    }

    console.log('\n[4] 输入测试文本...');
    const inputArea = page.locator('textarea[placeholder*="翻译"]').first();
    if (await inputArea.isVisible()) {
      await inputArea.fill('Hello World! This is a test.');
      console.log('  已输入: Hello World! This is a test.');
    }

    console.log('\n[5] 点击翻译按钮...');
    const translateButton = page.locator('button:has-text("立即翻译")').first();
    if (await translateButton.isVisible()) {
      await translateButton.click();
      console.log('  正在翻译...');

      // 等待翻译结果
      await page.waitForTimeout(5000);

      // 检查输出
      const outputArea = page.locator('text=/翻译结果/').first();
      if (await outputArea.isVisible()) {
        console.log('  ✅ 翻译完成!');
      }
    }

    await page.screenshot({ path: 'baidu-translation-test.png', fullPage: true });

    console.log('\n' + '='.repeat(60));
    console.log('测试完成!');
    console.log('='.repeat(60));

    console.log('\n📸 截图: baidu-translation-test.png');

    console.log('\n💡 如果翻译成功，说明百度 API 配置正确！');

    await page.waitForTimeout(10000);
    await browser.close();

  } catch (error) {
    console.error('\n错误:', error.message);
    await page.screenshot({ path: 'translation-error.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
})();
