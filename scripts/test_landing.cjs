const puppeteer = require('puppeteer-core');
const path = require('path');

async function checkUserLanding() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2500));
  
  // Click "Login User →" button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Login User')) {
      console.log('Clicking Login User button');
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve('app_screenshots/02_User_Landing_Search/01_landing_hero.png'), fullPage: true });
  console.log('Landing hero captured!');

  await browser.close();
}

checkUserLanding().catch(console.error);
