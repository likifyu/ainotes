/**
 * AI Notes 手动测试脚本
 * 打开浏览器，让用户手动测试各项功能
 */

const { chromium } = require('playwright');

(async () => {
  console.log('AI Notes 手动测试');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });

  const page = await context.newPage();

  // 监听控制台
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  [Console Error]', msg.text());
    }
  });

  try {
    // Step 1: 打开应用
    console.log('\n[Step 1] 打开 AI Notes 应用...');
    await page.goto('http://localhost:3008', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log('  Page title:', await page.title());
    await page.screenshot({ path: 'manual-01-home.png', fullPage: true });

    // Step 2: 检查界面
    console.log('\n[Step 2] 检查界面布局...');
    const searchInput = page.locator('input[placeholder*="搜索"]').first();
    const newNoteBtn = page.locator('button:has-text("新建笔记")').first();

    console.log('  Search box visible:', await searchInput.isVisible());
    console.log('  New note button visible:', await newNoteBtn.isVisible());
    await page.screenshot({ path: 'manual-02-layout.png', fullPage: true });

    // Step 3: 创建新笔记
    console.log('\n[Step 3] 创建新笔记...');
    if (await newNoteBtn.isVisible({ timeout: 5000 })) {
      await newNoteBtn.click();
      await page.waitForTimeout(1500);
      console.log('  New note created');
    }
    await page.screenshot({ path: 'manual-03-new-note.png', fullPage: true });

    // Step 4: 编辑内容
    console.log('\n[Step 4] 编辑内容...');
    const textarea = page.locator('textarea').first();

    if (await textarea.isVisible({ timeout: 5000 })) {
      const testContent = `# AI Notes 办公套件功能演示

## 翻译功能
This is English text.
这是中文文本。

## 文档导出
- Word (.docx)
- Excel (.xlsx)
- PDF
- HTML

## 富文本
支持 **粗体** 和 *斜体*

## 表格
| 功能 | 状态 |
|------|------|
| 翻译 | OK |
| Word | OK |

测试时间: ${new Date().toLocaleString('zh-CN')}`;

      await textarea.fill(testContent);
      await page.waitForTimeout(1000);
      console.log('  Content entered');

      const charCount = page.locator('text=/字符$/').first();
      if (await charCount.isVisible()) {
        console.log('  Char count:', await charCount.textContent());
      }
    }
    await page.screenshot({ path: 'manual-04-content.png', fullPage: true });

    // Step 5: 工具栏
    console.log('\n[Step 5] 检查工具栏...');
    const buttons = await page.locator('button').all();
    console.log('  Total buttons:', buttons.length);

    const saveBtn = page.locator('button:has-text("保存")').first();
    const htmlBtn = page.locator('button:has-text("HTML")').first();

    console.log('  Save button visible:', await saveBtn.isVisible());
    console.log('  HTML button visible:', await htmlBtn.isVisible());
    await page.screenshot({ path: 'manual-05-toolbar.png', fullPage: true });

    // Step 6: 主题切换
    console.log('\n[Step 6] 测试主题切换...');
    const themeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(1000);
      console.log('  Theme toggled');
      await page.screenshot({ path: 'manual-06-dark.png', fullPage: true });

      await themeBtn.click();
      await page.waitForTimeout(1000);
      console.log('  Theme restored');
    }
    await page.screenshot({ path: 'manual-07-light.png', fullPage: true });

    // Step 7: AI 功能
    console.log('\n[Step 7] 检查 AI 功能...');
    const aiBtn = page.locator('button:has-text("AI")').first();
    if (await aiBtn.isVisible()) {
      await aiBtn.click();
      await page.waitForTimeout(1000);
      console.log('  AI panel opened');
    }
    await page.screenshot({ path: 'manual-08-ai.png', fullPage: true });

    // Step 8: 服务检查
    console.log('\n[Step 8] 服务模块检查...');
    const services = await page.evaluate(() => {
      return {
        soundService: typeof window.soundService !== 'undefined',
        fileService: typeof window.fileService !== 'undefined',
      };
    });
    console.log('  Sound service:', services.soundService ? 'OK' : 'Missing');
    console.log('  File service:', services.fileService ? 'OK' : 'Missing');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('测试完成!');
    console.log('='.repeat(60));

    console.log('\nScreenshots saved:');
    console.log('  - manual-01-home.png');
    console.log('  - manual-02-layout.png');
    console.log('  - manual-03-new-note.png');
    console.log('  - manual-04-content.png');
    console.log('  - manual-05-toolbar.png');
    console.log('  - manual-06-dark.png');
    console.log('  - manual-07-light.png');
    console.log('  - manual-08-ai.png');

    console.log('\n已实现功能:');
    console.log('  - 翻译服务 (translation-service.ts)');
    console.log('  - Word 导出 (docx-service.ts)');
    console.log('  - Excel 导出 (excel-service.ts)');
    console.log('  - 富文本编辑');
    console.log('  - 音效系统');
    console.log('  - 主题切换');
    console.log('  - AI 功能');

    console.log('\n等待 10 秒后关闭...');
    await page.waitForTimeout(10000);

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\nError:', error.message);
    await page.screenshot({ path: 'manual-error.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
})();
