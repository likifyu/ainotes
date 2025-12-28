const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3008');
    await page.waitForLoadState('networkidle');
    
    // Wait for the app to load
    await page.waitForSelector('text=/笔记列表|AI Notes/', { timeout: 10000 });
    
    console.log('✅ App loaded successfully!');
    
    // Take screenshot
    await page.screenshot({ path: 'app-test.png', fullPage: true });
    console.log('Screenshot saved to app-test.png');
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading app:', error.message);
    await page.screenshot({ path: 'app-error.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
})();
