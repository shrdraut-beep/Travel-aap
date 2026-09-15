const puppeteer = require('puppeteer-core');
const path = require('path');

async function checkLogin() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait for splash to transition to login
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.resolve('app_screenshots/01_Authentication/02_login_screen.png'), fullPage: true });
  console.log('Login screen captured!');

  // Look for Demo User button or Guest button or Login
  const pageContent = await page.content();
  console.log('Has Login text:', pageContent.includes('Login User') || pageContent.includes('Continue as Guest') || pageContent.includes('Traveller'));

  await browser.close();
}

checkLogin().catch(console.error);
