// Service Worker — Mobile Simulator Extension
// Ephemeral: stores NO state in globals, uses chrome.storage instead

chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings on install
  const existing = await chrome.storage.local.get('settings');
  if (!existing.settings) {
    await chrome.storage.local.set({
      settings: {
        selectedDevice: 'iphone-15-pro',
        rotated: false,
        showFrame: true,
        touchSimulation: true,
        customWidth: 390,
        customHeight: 844,
        isActive: false
      }
    });
  }
});

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === 'GET_SETTINGS') {
      const data = await chrome.storage.local.get('settings');
      sendResponse({ settings: data.settings });
    } else if (message.type === 'SAVE_SETTINGS') {
      await chrome.storage.local.set({ settings: message.settings });
      sendResponse({ success: true });
    } else if (message.type === 'APPLY_SIMULATION') {
      // Forward to content script of active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'START_SIMULATION',
            settings: message.settings
          });
          sendResponse({ success: true });
        } catch (err) {
          // Content script might not be loaded yet, inject it
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content/content.js']
            });
            await chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ['content/content.css']
            });
            // Retry
            await chrome.tabs.sendMessage(tab.id, {
              type: 'START_SIMULATION',
              settings: message.settings
            });
            sendResponse({ success: true });
          } catch (retryErr) {
            sendResponse({ success: false, error: retryErr.message });
          }
        }
      }
    } else if (message.type === 'STOP_SIMULATION') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'STOP_SIMULATION' });
        } catch (_) { /* ignore if content script not loaded */ }
      }
      sendResponse({ success: true });
    }
  })();
  return true; // keeps channel open for async responses
});
