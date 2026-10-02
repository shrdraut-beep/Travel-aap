// ==============================
// Mobile Simulator – Popup Logic
// ==============================

// Device presets database — viewport dimensions & metadata
const DEVICES = {
  // Apple
  'iphone-15-pro':     { name: 'iPhone 15 Pro',     w: 393, h: 852,  dpr: 3, ratio: '19.5:9',  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  'iphone-15-pro-max': { name: 'iPhone 15 Pro Max', w: 430, h: 932,  dpr: 3, ratio: '19.5:9',  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  'iphone-14':         { name: 'iPhone 14',          w: 390, h: 844,  dpr: 3, ratio: '19.5:9',  ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  'iphone-se':         { name: 'iPhone SE',          w: 375, h: 667,  dpr: 2, ratio: '16:9',    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  'ipad-pro-11':       { name: 'iPad Pro 11"',       w: 834, h: 1194, dpr: 2, ratio: '4.3:3',   ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  'ipad-mini':         { name: 'iPad Mini',          w: 768, h: 1024, dpr: 2, ratio: '4:3',     ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  // Samsung
  'galaxy-s24-ultra':  { name: 'Galaxy S24 Ultra',  w: 412, h: 915,  dpr: 3.5, ratio: '19.3:9',ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  'galaxy-s24':        { name: 'Galaxy S24',         w: 360, h: 780,  dpr: 3,   ratio: '19.5:9',ua: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  'galaxy-z-fold5':    { name: 'Galaxy Z Fold5',     w: 373, h: 846,  dpr: 3,   ratio: '21.6:18',ua: 'Mozilla/5.0 (Linux; Android 14; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  'galaxy-tab-s9':     { name: 'Galaxy Tab S9',      w: 800, h: 1280, dpr: 2,   ratio: '16:10', ua: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  // Google
  'pixel-8-pro':       { name: 'Pixel 8 Pro',       w: 412, h: 892,  dpr: 3.5, ratio: '20:9',  ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  'pixel-8':           { name: 'Pixel 8',            w: 412, h: 892,  dpr: 2.625, ratio: '20:9',ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  'pixel-7a':          { name: 'Pixel 7a',           w: 412, h: 892,  dpr: 2.625, ratio: '20:9',ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36' },
};

// DOM References
const deviceSelect = document.getElementById('deviceSelect');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const deviceRatio = document.getElementById('deviceRatio');
const deviceDPR = document.getElementById('deviceDPR');
const rotateToggle = document.getElementById('rotateToggle');
const frameToggle = document.getElementById('frameToggle');
const touchToggle = document.getElementById('touchToggle');
const uaToggle = document.getElementById('uaToggle');
const applyBtn = document.getElementById('applyBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

let currentSettings = {};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  try {
    const data = await chrome.storage.local.get('settings');
    if (data.settings) {
      currentSettings = data.settings;
      applySettingsToUI(currentSettings);
    } else {
      // Default
      currentSettings = {
        selectedDevice: 'iphone-15-pro',
        rotated: false,
        showFrame: true,
        touchSimulation: true,
        overrideUA: false,
        customWidth: 393,
        customHeight: 852,
        isActive: false
      };
      applySettingsToUI(currentSettings);
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function applySettingsToUI(s) {
  deviceSelect.value = s.selectedDevice || 'iphone-15-pro';
  rotateToggle.checked = s.rotated || false;
  frameToggle.checked = s.showFrame !== false;
  touchToggle.checked = s.touchSimulation !== false;
  uaToggle.checked = s.overrideUA || false;

  updateDimensions();
  updateStatus(s.isActive);
}

function updateDimensions() {
  const deviceId = deviceSelect.value;
  const isCustom = deviceId === 'custom';

  if (isCustom) {
    widthInput.readOnly = false;
    heightInput.readOnly = false;
    widthInput.value = currentSettings.customWidth || 375;
    heightInput.value = currentSettings.customHeight || 812;
    deviceRatio.textContent = '—';
    deviceDPR.textContent = '1x';
  } else {
    const device = DEVICES[deviceId];
    widthInput.readOnly = true;
    heightInput.readOnly = true;

    if (rotateToggle.checked) {
      widthInput.value = device.h;
      heightInput.value = device.w;
    } else {
      widthInput.value = device.w;
      heightInput.value = device.h;
    }

    deviceRatio.textContent = rotateToggle.checked
      ? device.ratio.split(':').reverse().join(':')
      : device.ratio;
    deviceDPR.textContent = device.dpr + 'x';
  }
}

function updateStatus(isActive) {
  if (isActive) {
    statusDot.classList.add('active');
    statusText.textContent = 'Simulating';
    statusText.style.color = 'var(--success)';
    applyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"/>
        <rect x="14" y="4" width="4" height="16"/>
      </svg>
      Stop Simulation
    `;
    applyBtn.classList.add('btn-stop');
    applyBtn.classList.remove('btn-primary');
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Inactive';
    statusText.style.color = '';
    applyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Apply to Current Tab
    `;
    applyBtn.classList.remove('btn-stop');
    applyBtn.classList.add('btn-primary');
  }
}

// ===== Event Listeners =====
function setupEventListeners() {
  deviceSelect.addEventListener('change', () => {
    currentSettings.selectedDevice = deviceSelect.value;
    updateDimensions();
    saveSettings();
  });

  rotateToggle.addEventListener('change', () => {
    currentSettings.rotated = rotateToggle.checked;
    updateDimensions();
    saveSettings();
  });

  frameToggle.addEventListener('change', () => {
    currentSettings.showFrame = frameToggle.checked;
    saveSettings();
  });

  touchToggle.addEventListener('change', () => {
    currentSettings.touchSimulation = touchToggle.checked;
    saveSettings();
  });

  uaToggle.addEventListener('change', () => {
    currentSettings.overrideUA = uaToggle.checked;
    saveSettings();
  });

  widthInput.addEventListener('change', () => {
    currentSettings.customWidth = parseInt(widthInput.value, 10) || 375;
    saveSettings();
  });

  heightInput.addEventListener('change', () => {
    currentSettings.customHeight = parseInt(heightInput.value, 10) || 812;
    saveSettings();
  });

  applyBtn.addEventListener('click', handleApply);
  resetBtn.addEventListener('click', handleReset);
}

async function saveSettings() {
  try {
    await chrome.storage.local.set({ settings: currentSettings });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// ===== Apply / Stop =====
async function handleApply() {
  const deviceId = deviceSelect.value;
  const device = DEVICES[deviceId];
  const isCustom = deviceId === 'custom';

  let w, h, dpr, ua;
  if (isCustom) {
    w = parseInt(widthInput.value, 10) || 375;
    h = parseInt(heightInput.value, 10) || 812;
    dpr = 2;
    ua = '';
  } else {
    w = device.w;
    h = device.h;
    dpr = device.dpr;
    ua = device.ua;
  }

  if (rotateToggle.checked) {
    [w, h] = [h, w];
  }

  if (currentSettings.isActive) {
    // Stop simulation
    currentSettings.isActive = false;
    updateStatus(false);
    await saveSettings();

    try {
      await chrome.runtime.sendMessage({ type: 'STOP_SIMULATION' });
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    }
  } else {
    // Start simulation
    currentSettings.isActive = true;
    currentSettings.customWidth = w;
    currentSettings.customHeight = h;
    updateStatus(true);
    await saveSettings();

    const simSettings = {
      width: w,
      height: h,
      dpr: dpr,
      deviceName: isCustom ? 'Custom' : device.name,
      showFrame: frameToggle.checked,
      touchSimulation: touchToggle.checked,
      overrideUA: uaToggle.checked,
      ua: ua
    };

    try {
      await chrome.runtime.sendMessage({
        type: 'APPLY_SIMULATION',
        settings: simSettings
      });

      // Brief haptic-like visual feedback
      applyBtn.style.transform = 'scale(0.97)';
      setTimeout(() => { applyBtn.style.transform = ''; }, 120);
    } catch (err) {
      console.error('Failed to apply simulation:', err);
      currentSettings.isActive = false;
      updateStatus(false);
      await saveSettings();
    }
  }
}

async function handleReset() {
  // Stop any active simulation
  if (currentSettings.isActive) {
    try {
      await chrome.runtime.sendMessage({ type: 'STOP_SIMULATION' });
    } catch (_) {}
  }

  currentSettings = {
    selectedDevice: 'iphone-15-pro',
    rotated: false,
    showFrame: true,
    touchSimulation: true,
    overrideUA: false,
    customWidth: 393,
    customHeight: 852,
    isActive: false
  };

  applySettingsToUI(currentSettings);
  await saveSettings();

  // Reset animation
  resetBtn.style.transform = 'rotate(-360deg)';
  resetBtn.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  setTimeout(() => {
    resetBtn.style.transform = '';
    resetBtn.style.transition = '';
  }, 500);
}
