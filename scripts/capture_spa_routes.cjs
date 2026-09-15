const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureSpaRoutes() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // Initial load
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await wait(1500);

  // Set logged in user in localStorage and state
  await page.evaluate(() => {
    const user = {
      id: 'user-1',
      name: 'Demo Traveller (Aditi)',
      email: 'user@routripo.app',
      avatar: 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&bold=true',
      role: 'user'
    };
    const enc = 'pwt_enc_' + btoa(encodeURIComponent(JSON.stringify(user)));
    localStorage.setItem('routripo_user', enc);
    sessionStorage.setItem('routripo_user', JSON.stringify(user));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(2000);

  const missingRoutes = [
    { route: '/flights/fares', file: '03_Booking_Flows/02_flight_fare_selection.png' },
    { route: '/flights/passengers', file: '03_Booking_Flows/03_flight_passenger_details.png' },
    { route: '/flights/meals', file: '03_Booking_Flows/05_flight_meals_selection.png' },
    { route: '/stays/results', file: '03_Booking_Flows/09_stays_hotel_results.png' },
    { route: '/stays/checkout', file: '03_Booking_Flows/11_stays_checkout.png' }
  ];

  for (const item of missingRoutes) {
    console.log('Navigating SPA to:', item.route);
    await page.evaluate((r) => {
      window.history.pushState({}, '', r);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, item.route);
    await wait(1500);
    const fullPath = path.resolve('app_screenshots', item.file);
    await page.screenshot({ path: fullPath });
    console.log('Saved:', item.file);
  }

  await browser.close();
  console.log('SPA routes captured successfully!');
}

captureSpaRoutes().catch(console.error);
