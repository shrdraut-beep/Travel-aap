// =========================================
// Mobile Simulator – Content Script
// Injects viewport simulation into the page
// =========================================

(() => {
  // Guard against double-injection
  if (window.__mobileSimulatorActive) return;

  let simulationState = {
    active: false,
    settings: null,
    elements: {
      overlay: null,
      frame: null,
      infoPill: null,
      touchCursor: null,
      viewportMeta: null,
      originalMeta: null
    }
  };

  // ===== Message Handler =====
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SIMULATION') {
      startSimulation(message.settings);
      sendResponse({ success: true });
    } else if (message.type === 'STOP_SIMULATION') {
      stopSimulation();
      sendResponse({ success: true });
    }
    return true;
  });

  // ===== Start Simulation =====
  function startSimulation(settings) {
    if (simulationState.active) {
      stopSimulation();
    }

    window.__mobileSimulatorActive = true;
    simulationState.active = true;
    simulationState.settings = settings;

    const { width, height, deviceName, showFrame, touchSimulation, dpr } = settings;

    // Inject viewport meta tag
    injectViewportMeta(width);

    // Create device info pill
    createInfoPill(deviceName, width, height);

    if (showFrame) {
      createDeviceFrame(width, height);
    } else {
      // Just constrain the viewport without a frame
      constrainViewport(width, height);
    }

    if (touchSimulation) {
      enableTouchSimulation();
    }

    // Override screen dimensions via CSS custom properties
    document.documentElement.style.setProperty('--ms-device-width', width + 'px');
    document.documentElement.style.setProperty('--ms-device-height', height + 'px');
  }

  // ===== Stop Simulation =====
  function stopSimulation() {
    window.__mobileSimulatorActive = false;
    simulationState.active = false;

    // Remove overlay and frame
    const overlay = document.getElementById('ms-simulator-overlay');
    if (overlay) overlay.remove();

    // Remove viewport wrapper
    const wrapper = document.getElementById('ms-viewport-wrapper');
    if (wrapper) {
      // Move all children back to body
      while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
      }
      wrapper.remove();
    }

    // Remove info pill
    const pill = document.getElementById('ms-device-info-pill');
    if (pill) pill.remove();

    // Remove touch cursor
    const cursor = document.getElementById('ms-touch-cursor');
    if (cursor) cursor.remove();

    // Restore original viewport meta
    restoreViewportMeta();

    // Remove custom properties
    document.documentElement.style.removeProperty('--ms-device-width');
    document.documentElement.style.removeProperty('--ms-device-height');

    // Remove touch event listeners
    disableTouchSimulation();

    // Remove all ripples
    document.querySelectorAll('.ms-touch-ripple').forEach(el => el.remove());
  }

  // ===== Viewport Meta =====
  function injectViewportMeta(width) {
    // Save original
    const existing = document.querySelector('meta[name="viewport"]');
    if (existing) {
      simulationState.elements.originalMeta = existing.getAttribute('content');
      existing.setAttribute('content', `width=${width}, initial-scale=1, maximum-scale=1, user-scalable=no`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = `width=${width}, initial-scale=1, maximum-scale=1, user-scalable=no`;
      document.head.appendChild(meta);
      simulationState.elements.viewportMeta = meta;
    }
  }

  function restoreViewportMeta() {
    if (simulationState.elements.originalMeta) {
      const existing = document.querySelector('meta[name="viewport"]');
      if (existing) {
        existing.setAttribute('content', simulationState.elements.originalMeta);
      }
      simulationState.elements.originalMeta = null;
    }
    if (simulationState.elements.viewportMeta) {
      simulationState.elements.viewportMeta.remove();
      simulationState.elements.viewportMeta = null;
    }
  }

  // ===== Device Frame =====
  function createDeviceFrame(width, height) {
    // Dark background overlay
    const bg = document.createElement('div');
    bg.id = 'ms-simulator-bg';
    bg.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #0a0c14; z-index: 2147483644; pointer-events: none;
    `;
    document.body.appendChild(bg);

    // Scale the frame to fit inside the window
    const maxW = window.innerWidth - 60;
    const maxH = window.innerHeight - 40;
    const frameW = width + 28; // padding
    const frameH = height + 28;
    const scale = Math.min(maxW / frameW, maxH / frameH, 1);

    // Device frame container
    const frame = document.createElement('div');
    frame.id = 'ms-simulator-overlay';
    frame.className = 'ms-simulator-overlay';
    frame.style.pointerEvents = 'none';

    const device = document.createElement('div');
    device.className = 'ms-device-frame';
    device.style.width = frameW + 'px';
    device.style.height = frameH + 'px';
    device.style.transform = `scale(${scale})`;

    // Dynamic island / notch
    const notch = document.createElement('div');
    notch.className = 'ms-device-notch ms-dynamic-island';
    device.appendChild(notch);

    // Home indicator
    const homeBar = document.createElement('div');
    homeBar.className = 'ms-device-home-indicator';
    device.appendChild(homeBar);

    frame.appendChild(device);
    document.body.appendChild(frame);

    // Constrain the actual page inside an iframe-like viewport
    constrainViewport(width, height, scale);
  }

  function constrainViewport(width, height, scale = 1) {
    // Create a wrapper that constrains the visible area
    const wrapper = document.createElement('div');
    wrapper.id = 'ms-viewport-wrapper';
    wrapper.className = 'ms-viewport-wrapper';
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';

    if (scale < 1) {
      wrapper.style.transform = `translateX(-50%) scale(${scale})`;
      wrapper.style.transformOrigin = 'top center';
      wrapper.style.top = ((window.innerHeight - height * scale) / 2) + 'px';
    } else {
      wrapper.style.top = ((window.innerHeight - height) / 2) + 'px';
    }

    // Create iframe to show page at mobile width
    const iframe = document.createElement('iframe');
    iframe.id = 'ms-viewport-iframe';
    iframe.src = window.location.href;
    iframe.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      border: none;
      background: #fff;
      display: block;
    `;
    iframe.setAttribute('allowfullscreen', '');

    wrapper.appendChild(iframe);
    wrapper.style.pointerEvents = 'auto';

    // Hide the original body content
    document.documentElement.style.overflow = 'hidden';

    document.body.appendChild(wrapper);
  }

  // ===== Info Pill =====
  function createInfoPill(deviceName, width, height) {
    const pill = document.createElement('div');
    pill.id = 'ms-device-info-pill';
    pill.className = 'ms-device-info-pill';
    pill.innerHTML = `
      <span class="ms-pill-dot"></span>
      <span>${deviceName}</span>
      <span style="color: #5a6375;">|</span>
      <span>${width} × ${height}</span>
    `;
    document.body.appendChild(pill);
  }

  // ===== Touch Simulation =====
  let touchCursorEl = null;
  let touchMoveHandler = null;
  let touchClickHandler = null;

  function enableTouchSimulation() {
    // Create touch cursor
    touchCursorEl = document.createElement('div');
    touchCursorEl.id = 'ms-touch-cursor';
    touchCursorEl.className = 'ms-touch-cursor';
    touchCursorEl.style.display = 'none';
    document.body.appendChild(touchCursorEl);

    // Mouse move → touch cursor
    touchMoveHandler = (e) => {
      if (!touchCursorEl) return;
      touchCursorEl.style.display = 'block';
      touchCursorEl.style.left = e.clientX + 'px';
      touchCursorEl.style.top = e.clientY + 'px';
    };

    // Mouse down → press state + ripple
    touchClickHandler = (e) => {
      if (!touchCursorEl) return;

      // Press effect
      touchCursorEl.classList.add('ms-pressing');
      setTimeout(() => {
        if (touchCursorEl) touchCursorEl.classList.remove('ms-pressing');
      }, 150);

      // Ripple
      const ripple = document.createElement('div');
      ripple.className = 'ms-touch-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);

      setTimeout(() => ripple.remove(), 400);
    };

    document.addEventListener('mousemove', touchMoveHandler, { passive: true });
    document.addEventListener('mousedown', touchClickHandler, { passive: true });

    // Hide default cursor over the viewport area
    const wrapper = document.getElementById('ms-viewport-wrapper');
    if (wrapper) {
      wrapper.style.cursor = 'none';
    }
  }

  function disableTouchSimulation() {
    if (touchMoveHandler) {
      document.removeEventListener('mousemove', touchMoveHandler);
      touchMoveHandler = null;
    }
    if (touchClickHandler) {
      document.removeEventListener('mousedown', touchClickHandler);
      touchClickHandler = null;
    }
    touchCursorEl = null;
  }

})();
