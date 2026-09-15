const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function captureScreen(page, relativePath, description = '') {
  const fullPath = path.resolve('app_screenshots', relativePath);
  ensureDir(path.dirname(fullPath));
  try {
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`[SAVED] ${relativePath} ${description ? '(' + description + ')' : ''}`);
  } catch (err) {
    console.error(`[ERROR] Failed saving ${relativePath}:`, err.message);
  }
}

async function runRemaining() {
  console.log('=== ROUTRIPO REMAINING SCREENSHOTS AUTOMATION STARTING ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // -------------------------------------------------------------
  // REMAINING CATEGORY 3: BOOKING FLOWS
  // -------------------------------------------------------------
  console.log('\n--- Category 3 Remaining: Booking Flows ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await wait(2000);

  // Login as User
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

  const remainingBooking = [
    { route: '/flights/results', file: '03_Booking_Flows/01_flights_search_results.png', desc: 'Flights Search Results' },
    { route: '/flights/fares', file: '03_Booking_Flows/02_flight_fare_selection.png', desc: 'Flight Fare Tier Selection' },
    { route: '/flights/passengers', file: '03_Booking_Flows/03_flight_passenger_details.png', desc: 'Passenger & Contact Details' },
    { route: '/flights/seats', file: '03_Booking_Flows/04_flight_seat_selection_map.png', desc: 'Aircraft Interactive Seat Map' },
    { route: '/flights/meals', file: '03_Booking_Flows/05_flight_meals_selection.png', desc: 'In-Flight Meals Selection' },
    { route: '/checkout', file: '03_Booking_Flows/07_flight_checkout_page.png', desc: 'Final Checkout Page' },
    { route: '/stays/results', file: '03_Booking_Flows/09_stays_hotel_results.png', desc: 'Hotel & Stays Search Results' },
    { route: '/stays/checkout', file: '03_Booking_Flows/11_stays_checkout.png', desc: 'Stays Checkout Page' }
  ];

  for (const b of remainingBooking) {
    try {
      await page.goto(`${BASE_URL}${b.route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await wait(1500);
      await captureScreen(page, b.file, b.desc);
    } catch (e) {
      console.warn(`Could not capture ${b.route}:`, e.message);
    }
  }

  // -------------------------------------------------------------
  // CATEGORY 6: BARGAINING & NEGOTIATION
  // -------------------------------------------------------------
  console.log('\n--- Category 6: Bargaining & Negotiation ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await wait(1500);

  // Click Bargaining tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bBtn = btns.find(b => b.textContent.includes('Bargaining'));
    if (bBtn) bBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/01_bargain_dashboard.png', 'Bargaining Hub Overview');

  // Click "MAKE AN OFFER"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const offerBtn = btns.find(b => b.textContent.includes('MAKE AN OFFER'));
    if (offerBtn) offerBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/02_bargain_new_request_modal.png', 'Bargain New Custom Trip Modal');

  // Close modal via escape
  await page.keyboard.press('Escape');
  await wait(400);

  // Click "SECRET"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const secretBtn = btns.find(b => b.textContent.includes('SECRET'));
    if (secretBtn) secretBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/05_secret_offers_modal.png', 'Secret Offers & Vouchers Modal');

  // -------------------------------------------------------------
  // CATEGORY 7: VAULT, SETTINGS & SAFETY
  // -------------------------------------------------------------
  console.log('\n--- Category 7: Vault, Settings & Safety ---');
  await page.keyboard.press('Escape');
  await wait(400);

  // Click Profile tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.textContent.includes('Profile'));
    if (pBtn) pBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/01_profile_settings.png', 'Profile & Settings Dashboard');

  // Click Legal Vault
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, div'));
    const vaultBtn = els.find(e => e.textContent.includes('Legal Vault') || e.textContent.includes('Vault'));
    if (vaultBtn) vaultBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/02_zero_trust_legal_vault.png', 'Zero-Trust AES-256 Legal Vault');

  // Language Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, div'));
    const langBtn = els.find(e => e.textContent.includes('Language'));
    if (langBtn) langBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/03_language_modal.png', 'Multilingual Switcher Modal');

  // Currency Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, div'));
    const currBtn = els.find(e => e.textContent.includes('Currency'));
    if (currBtn) currBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/04_currency_modal.png', 'Currency Switcher Modal');

  // SOS Emergency Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, div'));
    const sosBtn = els.find(e => e.textContent.includes('SOS') || e.textContent.includes('Emergency'));
    if (sosBtn) sosBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/05_sos_emergency_modal.png', 'SOS 24x7 Emergency Services Modal');

  // -------------------------------------------------------------
  // CATEGORY 8: AGENT PORTAL (B2B)
  // -------------------------------------------------------------
  console.log('\n--- Category 8: Agent Portal (B2B) ---');
  await page.goto(`${BASE_URL}/premium.html`, { waitUntil: 'domcontentloaded' });
  await wait(1500);

  // Click login as Vendor / Agent on preview or regular
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const vendorBtn = btns.find(b => b.textContent.includes('Login Vendor') || b.textContent.includes('Vendor'));
    if (vendorBtn) vendorBtn.click();
  });
  await wait(1500);

  // If on landing, click account -> agent portal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const actBtn = btns.find(b => b.getAttribute('aria-label') === 'Account' || b.textContent.includes('Account'));
    if (actBtn) actBtn.click();
  });
  await wait(600);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const agentItem = items.find(i => i.textContent.includes('Agent Portal') || i.textContent.includes('Vendor'));
    if (agentItem) agentItem.click();
  });
  await wait(1500);
  await captureScreen(page, '08_Agent_Portal_B2B/01_agent_overview_dashboard.png', 'Agent Sales Overview');

  // Agent Primary Tabs: Overview, Offers, Inventory, Earnings, Workspace
  const agentTabs = [
    { name: 'Bidding', file: '08_Agent_Portal_B2B/02_agent_bidding_offers.png', desc: 'Agent Bidding & Offers' },
    { name: 'Inventory', file: '08_Agent_Portal_B2B/03_agent_inventory_packages.png', desc: 'Tour Packages Inventory' },
    { name: 'Earnings', file: '08_Agent_Portal_B2B/04_agent_earnings_wallet.png', desc: 'Earnings Wallet & Withdrawals' },
    { name: 'Workspace', file: '08_Agent_Portal_B2B/05_agent_workspace_markups.png', desc: 'Agent Workspace Markups' }
  ];

  for (const t of agentTabs) {
    try {
      await page.evaluate((tabName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.textContent.includes(tabName));
        if (target) target.click();
      }, t.name);
      await wait(800);
      await captureScreen(page, t.file, t.desc);
    } catch (e) {}
  }

  // Workspace sub-tabs: Marketing, Profile, Support
  const workspaceSubTabs = [
    { name: 'Marketing', file: '08_Agent_Portal_B2B/06_agent_workspace_marketing.png', desc: 'Marketing Campaigns' },
    { name: 'Profile', file: '08_Agent_Portal_B2B/07_agent_workspace_profile_kyc.png', desc: 'Agency Profile & KYC' },
    { name: 'Support', file: '08_Agent_Portal_B2B/08_agent_workspace_support.png', desc: 'Agency Support Helpdesk' }
  ];

  for (const st of workspaceSubTabs) {
    try {
      await page.evaluate((subName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.textContent.includes(subName));
        if (target) target.click();
      }, st.name);
      await wait(800);
      await captureScreen(page, st.file, st.desc);
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // CATEGORY 9: ADMIN DASHBOARD (Super Admin Role)
  // -------------------------------------------------------------
  console.log('\n--- Category 9: Admin Dashboard ---');
  await page.goto(`${BASE_URL}/premium.html`, { waitUntil: 'domcontentloaded' });
  await wait(1500);

  // Trigger Admin Screen
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Login Admin') || b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await wait(1500);

  // If on landing, click account -> admin dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const actBtn = btns.find(b => b.getAttribute('aria-label') === 'Account' || b.textContent.includes('Account'));
    if (actBtn) actBtn.click();
  });
  await wait(600);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const adminItem = items.find(i => i.textContent.includes('Admin Dashboard') || i.textContent.includes('Admin'));
    if (adminItem) adminItem.click();
  });
  await wait(1500);
  await captureScreen(page, '09_Admin_Dashboard/01_admin_platform_analytics.png', 'Executive Platform Analytics');

  const adminTabs = [
    { name: 'Vendors', file: '09_Admin_Dashboard/02_admin_vendors_approvals.png', desc: 'Vendor Approvals Queue' },
    { name: 'Payouts', file: '09_Admin_Dashboard/03_admin_payouts_wallet.png', desc: 'Agent Payouts Queue' },
    { name: 'System', file: '09_Admin_Dashboard/04_admin_system_security_rasp.png', desc: 'System Security & RASP' },
    { name: 'Operations', file: '09_Admin_Dashboard/06_admin_operations_users.png', desc: 'User Directory Operations' }
  ];

  for (const t of adminTabs) {
    try {
      await page.evaluate((tabName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.textContent.includes(tabName));
        if (target) target.click();
      }, t.name);
      await wait(800);
      await captureScreen(page, t.file, t.desc);
    } catch (e) {}
  }

  // System sub-tab: APIs
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apiTab = buttons.find(b => b.textContent.includes('APIs') || b.textContent.includes('Health'));
      if (apiTab) apiTab.click();
    });
    await wait(800);
    await captureScreen(page, '09_Admin_Dashboard/05_admin_system_apis_health.png', 'APIs Health Monitor');
  } catch (e) {}

  // Operations sub-tabs: Support, Ads
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const opsTab = buttons.find(b => b.textContent.includes('Operations'));
      if (opsTab) opsTab.click();
    });
    await wait(600);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const supTab = buttons.find(b => b.textContent.includes('Support'));
      if (supTab) supTab.click();
    });
    await wait(800);
    await captureScreen(page, '09_Admin_Dashboard/07_admin_operations_support.png', 'Customer Support Tickets');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adsTab = buttons.find(b => b.textContent.includes('Ads'));
      if (adsTab) adsTab.click();
    });
    await wait(800);
    await captureScreen(page, '09_Admin_Dashboard/08_admin_operations_ads.png', 'Banner Ads Management');
  } catch (e) {}

  await browser.close();
  console.log('=== REMAINING SCREENSHOTS AUTOMATION FINISHED! ===');
}

runRemaining().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
