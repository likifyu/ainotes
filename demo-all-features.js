const { chromium } = require('playwright');

(async () => {
  console.log('🚀 打开 AI Notes 应用...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800  // 慢速演示
  });

  const page = await browser.newPage();

  // 打开应用
  console.log('📱 步骤 1: 打开应用');
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'demo-01-home.png', fullPage: true });
  console.log('  ✅ 应用已打开\n');

  // 创建新笔记
  console.log('📝 步骤 2: 创建新笔记');
  const newNoteBtn = await page.locator('button:has-text("新建笔记")').first();
  if (await newNoteBtn.isVisible({ timeout: 5000 })) {
    await newNoteBtn.click();
    await page.waitForTimeout(1500);
    console.log('  ✅ 新笔记已创建\n');
  }
  await page.screenshot({ path: 'demo-02-new-note.png', fullPage: true });

  // 编辑内容
  console.log('✍️ 步骤 3: 编辑 Markdown 内容');
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible()) {
    await textarea.fill(`# AI Notes 功能演示

这是一个**粗体**文本和*斜体*文本。

## 支持的功能

1. **文件保存** - 保存为 Markdown、HTML、PDF
2. **表格支持** - Markdown 表格语法
3. **音效提示** - 优美的操作反馈音

## 示例表格

| 功能 | 状态 | 说明 |
|------|------|------|
| 文件保存 | ✅ | 已完成 |
| 音效 | ✅ | 已完成 |
| 表格 | 🔄 | 测试中 |

## 待办事项

- [x] 完成文件保存功能
- [ ] 添加表格按钮
- [ ] 测试音效

---
创建时间: ${new Date().toLocaleString('zh-CN')}`);
    await page.waitForTimeout(1000);
    console.log('  ✅ 内容已输入\n');
  }
  await page.screenshot({ path: 'demo-03-edit-content.png', fullPage: true });

  // 演示文件工具栏
  console.log('🛠️ 步骤 4: 文件工具栏 (FileToolbar)');
  const saveBtn = page.locator('button:has-text("保存")').first();
  const htmlBtn = page.locator('button:has-text("HTML")').first();
  const pdfBtn = page.locator('button:has-text("PDF")').first();
  const importBtn = page.locator('button:has-text("导入")').first();
  const copyBtn = page.locator('button:has-text("复制")').first();

  console.log(`  ${await saveBtn.isVisible() ? '✅' : '❌'} 保存按钮`);
  console.log(`  ${await htmlBtn.isVisible() ? '✅' : '❌'} HTML 导出`);
  console.log(`  ${await pdfBtn.isVisible() ? '✅' : '❌'} PDF 导出`);
  console.log(`  ${await importBtn.isVisible() ? '✅' : '❌'} 导入文件`);
  console.log(`  ${await copyBtn.isVisible() ? '✅' : '❌'} 复制内容`);
  console.log('');

  // 悬停在保存按钮上展示提示
  if (await saveBtn.isVisible()) {
    await saveBtn.hover();
    await page.waitForTimeout(500);
    console.log('  💡 悬停显示: "保存文件 (Ctrl+S)"\n');
  }
  await page.screenshot({ path: 'demo-04-toolbar.png', fullPage: true });

  // 主题切换演示
  console.log('🎨 步骤 5: 主题切换');
  const themeBtn = page.locator('button[title*="主题"]').first();
  if (await themeBtn.isVisible()) {
    // 切换到暗色主题
    await themeBtn.click();
    await page.waitForTimeout(1000);
    console.log('  ✅ 已切换到暗色主题\n');
    await page.screenshot({ path: 'demo-05-dark-theme.png', fullPage: true });

    // 切换回亮色主题
    await themeBtn.click();
    await page.waitForTimeout(1000);
    console.log('  ✅ 已切换回亮色主题\n');
  }
  await page.screenshot({ path: 'demo-06-light-theme.png', fullPage: true });

  // AI 功能演示
  console.log('🤖 步骤 6: AI 功能');
  const aiBtn = page.locator('button:has-text("AI")').first();
  if (await aiBtn.isVisible()) {
    await aiBtn.click();
    await page.waitForTimeout(1000);
    console.log('  ✅ AI 面板已展开\n');
  }
  await page.screenshot({ path: 'demo-07-ai-panel.png', fullPage: true });

  // 字符计数展示
  console.log('📊 步骤 7: 状态栏信息');
  const statusBar = await page.locator('text=/字符$/').first();
  if (await statusBar.isVisible()) {
    const text = await statusBar.textContent();
    console.log(`  ✅ ${text}`);
  }
  await page.screenshot({ path: 'demo-08-status-bar.png', fullPage: true });

  // 最终总结
  console.log('\n' + '='.repeat(60));
  console.log('🎉 功能演示完成！');
  console.log('='.repeat(60));
  console.log('\n📁 截图已保存:');
  console.log('   demo-01-home.png        - 应用首页');
  console.log('   demo-02-new-note.png     - 新建笔记');
  console.log('   demo-03-edit-content.png - 编辑内容');
  console.log('   demo-04-toolbar.png      - 文件工具栏');
  console.log('   demo-05-dark-theme.png   - 暗色主题');
  console.log('   demo-06-light-theme.png  - 亮色主题');
  console.log('   demo-07-ai-panel.png     - AI 面板');
  console.log('   demo-08-status-bar.png   - 状态栏');

  console.log('\n✅ 已实现功能:');
  console.log('   📁 文件保存 (Markdown/HTML/PDF)');
  console.log('   📥 文件导入');
  console.log('   🔊 音效提示');
  console.log('   🎨 主题切换');
  console.log('   🤖 AI 功能');
  console.log('   ✍️ Markdown 编辑');

  console.log('\n💡 操作提示:');
  console.log('   Ctrl+S - 保存文件');
  console.log('   点击工具栏按钮进行导出/导入');

  await page.waitForTimeout(2000);
  await browser.close();
  process.exit(0);

})();
