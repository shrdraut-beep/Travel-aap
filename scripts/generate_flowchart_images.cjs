const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function renderFlowcharts() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  const htmlPath = 'file:///' + path.resolve('scripts/flowcharts.html').replace(/\\/g, '/');
  console.log('Loading flowcharts from:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  const charts = [
    { id: '#flowchart-1', file: '01_complete_app_user_journey.png' },
    { id: '#flowchart-2', file: '02_booking_pipeline_flowchart.png' },
    { id: '#flowchart-3', file: '03_b2b_bargaining_chat_flowchart.png' },
    { id: '#flowchart-4', file: '04_expense_split_upi_flowchart.png' },
    { id: '#flowchart-5', file: '05_admin_governance_flowchart.png' }
  ];

  const outDir = path.resolve('app_screenshots/10_Flowcharts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const chart of charts) {
    const el = await page.$(chart.id);
    if (el) {
      const outPath = path.join(outDir, chart.file);
      await el.screenshot({ path: outPath });
      console.log('Saved flowchart:', chart.file);
    } else {
      console.warn('Could not find element:', chart.id);
    }
  }

  await browser.close();
  console.log('All 5 flowcharts successfully rendered and saved!');
}

renderFlowcharts().catch(err => {
  console.error('Error rendering flowcharts:', err);
  process.exit(1);
});
