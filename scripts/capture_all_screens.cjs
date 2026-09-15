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

async function setAuthUser(page, role = 'user') {
  const user = {
    id: role === 'admin' ? 'admin-1' : role === 'agent' ? 'vendor-1' : 'user-1',
    name: role === 'admin' ? 'System Admin' : role === 'agent' ? 'Shree Ganesh Travels (Vendor)' : 'Demo Traveller (Aditi)',
    email: role === 'admin' ? 'admin@routripo.app' : role === 'agent' ? 'vendor@routripo.app' : 'user@routripo.app',
    avatar: 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&bold=true',
    role: role
  };

  await page.evaluate((u) => {
    const enc = 'pwt_enc_' + btoa(encodeURIComponent(JSON.stringify(u)));
    localStorage.setItem('routripo_user', enc);
    sessionStorage.setItem('routripo_user', JSON.stringify(u));
  }, user);
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

async function run() {
  console.log('=== ROUTRIPO COMPLETE SCREENSHOT AUTOMATION STARTING ===');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // -------------------------------------------------------------
  // CATEGORY 1: AUTHENTICATION
  // -------------------------------------------------------------
  console.log('\n--- Category 1: Authentication ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await wait(500);
  await captureScreen(page, '01_Authentication/01_splash_screen.png', 'Splash with Animated Compass');

  await wait(2000); // Wait for auto-transition to Login
  await captureScreen(page, '01_Authentication/02_login_screen.png', 'Login Screen Default');

  // Click Sign up tab
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signupBtn = buttons.find(b => b.textContent.includes('Sign up'));
      if (signupBtn) signupBtn.click();
    });
    await wait(400);
    await captureScreen(page, '01_Authentication/03_signup_mode.png', 'Sign Up Registration Form');
  } catch (e) {}

  // Switch to Agent Account Type
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const agentBtn = buttons.find(b => b.textContent.includes('Agent'));
      if (agentBtn) agentBtn.click();
    });
    await wait(400);
    await captureScreen(page, '01_Authentication/04_account_type_agent.png', 'Agent / Vendor Login Tab');
  } catch (e) {}

  // Switch to Admin Account Type
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await wait(400);
    await captureScreen(page, '01_Authentication/05_account_type_admin.png', 'Admin Portal Login Tab');
  } catch (e) {}

  // -------------------------------------------------------------
  // CATEGORY 2: USER LANDING & SEARCH
  // -------------------------------------------------------------
  console.log('\n--- Category 2: User Landing & Search ---');
  await setAuthUser(page, 'user');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await wait(1500);

  // Default Home (Bargaining tab)
  await captureScreen(page, '02_User_Landing_Search/01_bargaining_home.png', 'Traveller Home Shell');

  // Switch to Booking tab in bottom nav
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bookBtn = buttons.find(b => b.textContent.includes('Booking'));
    if (bookBtn) bookBtn.click();
  });
  await wait(1000);
  await captureScreen(page, '02_User_Landing_Search/02_booking_search_home.png', 'Multi-Modal Search Home');

  // Preview Mobile layout at /premium.html
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });
  await mobilePage.goto(`${BASE_URL}/premium.html`, { waitUntil: 'networkidle2' });
  await wait(1200);

  // Click continue as guest if login appears on preview
  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const guestBtn = btns.find(b => b.textContent.includes('Continue as Guest') || b.textContent.includes('Login User'));
    if (guestBtn) guestBtn.click();
  });
  await wait(1000);
  await captureScreen(mobilePage, '02_User_Landing_Search/03_premium_mobile_home.png', 'Premium Mobile Home View');

  // Search mode tabs on mobile
  await mobilePage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const hotelTab = tabs.find(t => t.textContent.includes('Hotels'));
    if (hotelTab) hotelTab.click();
  });
  await wait(500);
  await captureScreen(mobilePage, '02_User_Landing_Search/04_search_hotel_picker.png', 'Hotels Search Card');

  await mobilePage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const busTab = tabs.find(t => t.textContent.includes('Buses'));
    if (busTab) busTab.click();
  });
  await wait(500);
  await captureScreen(mobilePage, '02_User_Landing_Search/05_search_bus_picker.png', 'Buses Search Card');

  await mobilePage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const cabTab = tabs.find(t => t.textContent.includes('Cabs'));
    if (cabTab) cabTab.click();
  });
  await wait(500);
  await captureScreen(mobilePage, '02_User_Landing_Search/06_search_cabs_picker.png', 'Cabs Search Card');

  await mobilePage.close();

  // On desktop page: scroll to trending destinations and offers
  await captureScreen(page, '02_User_Landing_Search/07_trending_destinations.png', 'Trending Destinations Rail');
  await captureScreen(page, '02_User_Landing_Search/08_offers_rail.png', 'Promotional Offers & Coupons');

  // -------------------------------------------------------------
  // CATEGORY 3: BOOKING FLOWS (Multi-step Routes)
  // -------------------------------------------------------------
  console.log('\n--- Category 3: Booking Flows ---');
  const bookingRoutes = [
    { route: '/flights/results', file: '03_Booking_Flows/01_flights_search_results.png', desc: 'Flights Search Results List' },
    { route: '/flights/fares', file: '03_Booking_Flows/02_flight_fare_selection.png', desc: 'Flight Fare Tier Selection (Saver, Flex, VIP)' },
    { route: '/flights/passengers', file: '03_Booking_Flows/03_flight_passenger_details.png', desc: 'Passenger & Contact Details Form' },
    { route: '/flights/seats', file: '03_Booking_Flows/04_flight_seat_selection_map.png', desc: 'Interactive Aircraft Seat Map' },
    { route: '/flights/meals', file: '03_Booking_Flows/05_flight_meals_selection.png', desc: 'In-Flight Gourmet Meals Selection' },
    { route: '/flights/baggage', file: '03_Booking_Flows/06_flight_baggage_selection.png', desc: 'Excess Baggage Options' },
    { route: '/checkout', file: '03_Booking_Flows/07_flight_checkout_page.png', desc: 'Final Booking Checkout & Payment' },
    { route: '/order-review', file: '03_Booking_Flows/08_order_review_page.png', desc: 'Order Review & Confirmation Summary' },
    { route: '/stays/results', file: '03_Booking_Flows/09_stays_hotel_results.png', desc: 'Hotel & Resort Search Results' },
    { route: '/stays/details', file: '03_Booking_Flows/10_stays_hotel_details.png', desc: 'Hotel Room Details & Amenities' },
    { route: '/stays/checkout', file: '03_Booking_Flows/11_stays_checkout.png', desc: 'Hotel Room Booking Checkout' },
    { route: '/buses', file: '03_Booking_Flows/12_bus_search_results.png', desc: 'Intercity Bus Search Results' },
    { route: '/buses/seatmap', file: '03_Booking_Flows/13_bus_seat_map.png', desc: 'Interactive Bus Sleeper/Seater Seat Map' },
    { route: '/cars/results', file: '03_Booking_Flows/14_car_rental_results.png', desc: 'Car & Cab Rental Fleet Results' },
    { route: '/cars', file: '03_Booking_Flows/15_car_rental_overview.png', desc: 'Cab Booking Interface' },
    { route: '/ancillaries', file: '03_Booking_Flows/16_ancillaries_flow.png', desc: 'Travel Insurance & Ancillaries' }
  ];

  for (const b of bookingRoutes) {
    try {
      await page.goto(`${BASE_URL}${b.route}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await wait(1000);
      await captureScreen(page, b.file, b.desc);
    } catch (err) {
      console.warn(`Could not load ${b.route}:`, err.message);
    }
  }

  // -------------------------------------------------------------
  // CATEGORY 4: TRIPS & PLANNING
  // -------------------------------------------------------------
  console.log('\n--- Category 4: Trips & Planning ---');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await wait(1000);

  // Click My Trips
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tripsBtn = buttons.find(b => b.textContent.includes('My Trips'));
    if (tripsBtn) tripsBtn.click();
  });
  await wait(1000);
  await captureScreen(page, '04_Trips_Planning/01_my_trips_overview.png', 'My Trips Timeline & Active Trip');

  // Enter Trip (Trip Plan tab)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.textContent.includes('View Details') || b.textContent.includes('Manage') || b.textContent.includes('Itinerary'));
    if (enterBtn) enterBtn.click();
  });
  await wait(800);
  await captureScreen(page, '04_Trips_Planning/02_trip_itinerary_plan.png', 'Trip Day-by-Day Itinerary Plan');

  // Open Community Hub Modal via CustomEvent or Profile menu
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-community-hub'));
  });
  await wait(800);
  await captureScreen(page, '04_Trips_Planning/03_community_hub_view.png', 'Community Travel Hub & Tips');

  // Open Group Decision Polls
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-group-polls'));
  });
  await wait(800);
  await captureScreen(page, '04_Trips_Planning/04_group_decision_polls.png', 'Group Decision Polls Voting');

  // Open Shared Memories Gallery
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-trip-memories'));
  });
  await wait(800);
  await captureScreen(page, '04_Trips_Planning/05_shared_memories_gallery.png', 'Shared Trip Photo Memories Journal');

  // -------------------------------------------------------------
  // CATEGORY 5: KHARCH & EXPENSES
  // -------------------------------------------------------------
  console.log('\n--- Category 5: Kharch & Expenses ---');
  // Trigger Kharch tab
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-kharch-modal'));
  });
  await wait(1200);
  await captureScreen(page, '05_Kharch_Expenses/01_kharch_expenses_dashboard.png', 'Kharch (Expenses) Dashboard');

  // Open Fuel Calculator Modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-fuel-calculator'));
  });
  await wait(800);
  await captureScreen(page, '05_Kharch_Expenses/02_fuel_calculator_modal.png', 'Fuel Calculator Modal');

  // Open Smart Expense Scanner Modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-scanner-modal'));
  });
  await wait(800);
  await captureScreen(page, '05_Kharch_Expenses/03_smart_expense_scanner_modal.png', 'Smart OCR Receipt Scanner Modal');

  // Open Budget Dashboard Modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-budget-dashboard'));
  });
  await wait(800);
  await captureScreen(page, '05_Kharch_Expenses/04_budget_dashboard_modal.png', 'Budget Category Breakdown Modal');

  // Open Group Split Payment Modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-group-split'));
  });
  await wait(800);
  await captureScreen(page, '05_Kharch_Expenses/05_group_split_payment_modal.png', 'Group Split Payment Modal');

  // Open UPI QR Modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-upi-qr'));
  });
  await wait(800);
  await captureScreen(page, '05_Kharch_Expenses/06_upi_qr_payment_modal.png', 'Dynamic UPI QR Payment Modal');

  // -------------------------------------------------------------
  // CATEGORY 6: BARGAINING & NEGOTIATION
  // -------------------------------------------------------------
  console.log('\n--- Category 6: Bargaining & Negotiation ---');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await wait(1000);

  // Click Bargaining tab in bottom nav
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bBtn = buttons.find(b => b.textContent.includes('Bargaining'));
    if (bBtn) bBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/01_bargain_dashboard.png', 'Bargaining Hub Overview');

  // Click "MAKE AN OFFER"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const offerBtn = buttons.find(b => b.textContent.includes('MAKE AN OFFER'));
    if (offerBtn) offerBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/02_bargain_new_request_modal.png', 'Bargain New Custom Trip Request Modal');

  // Close modal and open Secret Offers
  await page.keyboard.press('Escape');
  await wait(400);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const secretBtn = buttons.find(b => b.textContent.includes('SECRET'));
    if (secretBtn) secretBtn.click();
  });
  await wait(800);
  await captureScreen(page, '06_Bargaining_Negotiation/05_secret_offers_modal.png', 'Secret Offers & Flash Deals Modal');

  // -------------------------------------------------------------
  // CATEGORY 7: VAULT, SETTINGS & SAFETY
  // -------------------------------------------------------------
  console.log('\n--- Category 7: Vault, Settings & Safety ---');
  await page.keyboard.press('Escape');
  await wait(400);

  // Click Profile tab in bottom nav
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const profBtn = buttons.find(b => b.textContent.includes('Profile'));
    if (profBtn) profBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/01_profile_settings.png', 'Profile & Settings Dashboard');

  // Open Legal Vault
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const vaultBtn = items.find(el => el.textContent.includes('Legal Vault') || el.textContent.includes('Vault'));
    if (vaultBtn) vaultBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/02_zero_trust_legal_vault.png', 'Zero-Trust AES-256 Legal Document Vault');

  // Open Language Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const langBtn = items.find(el => el.textContent.includes('Language'));
    if (langBtn) langBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/03_language_modal.png', 'Multilingual Selector (English / मराठी / हिंदी)');

  // Open Currency Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const currBtn = items.find(el => el.textContent.includes('Currency'));
    if (currBtn) currBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/04_currency_modal.png', 'Currency Switcher Modal (INR / USD / EUR)');

  // Open SOS Emergency Modal
  await page.keyboard.press('Escape');
  await wait(400);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, div'));
    const sosBtn = items.find(el => el.textContent.includes('SOS') || el.textContent.includes('Emergency'));
    if (sosBtn) sosBtn.click();
  });
  await wait(800);
  await captureScreen(page, '07_Vault_Settings_Safety/05_sos_emergency_modal.png', 'SOS 24x7 Emergency Services Modal');

  // -------------------------------------------------------------
  // CATEGORY 8: AGENT PORTAL (B2B Partner Role)
  // -------------------------------------------------------------
  console.log('\n--- Category 8: Agent Portal (B2B) ---');
  await setAuthUser(page, 'agent');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await wait(2000);

  // Agent Overview
  await captureScreen(page, '08_Agent_Portal_B2B/01_agent_overview_dashboard.png', 'Agent Sales & Revenue Overview');

  // Click Bidding / Offers tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Bidding') || t.textContent.includes('Offers'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/02_agent_offers_leads.png', 'Traveller Leads & Custom Quotes Submission');

  // Click Inventory tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Inventory'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/03_agent_inventory_packages.png', 'Custom Tour Packages & Inventory Listings');

  // Click Earnings tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Earnings'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/04_agent_earnings_wallet.png', 'Agent Wallet Balance & Payout Withdrawal');

  // Click Workspace tab -> Markups
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Workspace'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/05_agent_workspace_markups.png', 'Dynamic Commission & Markup Sliders');

  // Workspace -> Marketing tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Marketing'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/06_agent_workspace_marketing.png', 'Agency Marketing & Banner Ads Campaigns');

  // Workspace -> Profile & KYC tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Profile'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/07_agent_workspace_profile_kyc.png', 'Agency KYC Verification & Business Profile');

  // Workspace -> Support tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Support'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '08_Agent_Portal_B2B/08_agent_workspace_support.png', 'Agency B2B Helpdesk & Tickets');

  // -------------------------------------------------------------
  // CATEGORY 9: ADMIN DASHBOARD (Super Admin Role)
  // -------------------------------------------------------------
  console.log('\n--- Category 9: Admin Dashboard ---');
  await setAuthUser(page, 'admin');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await wait(2000);

  // Admin Analytics
  await captureScreen(page, '09_Admin_Dashboard/01_admin_platform_analytics.png', 'Super Admin Executive Platform Analytics');

  // Click Vendors tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Vendors'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/02_admin_vendors_approvals.png', 'Agent / Vendor KYC Verification Queue');

  // Click Payouts tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Payouts'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/03_admin_payouts_wallet.png', 'Agent Wallet Payouts & TDS Settlement');

  // Click System tab -> Security
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('System'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/04_admin_system_security_rasp.png', 'RASP Threat Logs & Anti-Tamper Security Monitoring');

  // System -> APIs Health tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('APIs') || t.textContent.includes('Health'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/05_admin_system_apis_health.png', '3rd-Party APIs Health & Circuit Breaker Status');

  // Click Operations tab -> Users
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Operations'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/06_admin_operations_users.png', 'Platform User Directory & Account Actions');

  // Operations -> Support
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Support'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/07_admin_operations_support.png', 'Customer Support Tickets & Resolution');

  // Operations -> Ads
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const tab = tabs.find(t => t.textContent.includes('Ads'));
    if (tab) tab.click();
  });
  await wait(800);
  await captureScreen(page, '09_Admin_Dashboard/08_admin_operations_ads.png', 'Banner Ads Campaigns & Promo Management');

  await browser.close();
  console.log('\n=== ALL SCREENSHOTS SUCCESSFULLY CAPTURED! ===');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
