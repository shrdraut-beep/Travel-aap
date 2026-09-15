const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function test() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('Launching browser at:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  
  console.log('Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const outPath = path.resolve('app_screenshots', '01_Authentication', '01_splash_screen.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Screenshot saved to:', outPath);
  
  await browser.close();
  console.log('Browser closed successfully.');
}

test().catch(err => {
  console.error('Error during test screenshot:', err);
  process.exit(1);
});
