/**
 * JSON Formatter Pro - Background Service Worker
 */

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'jfp-format-selection',
    title: 'Format JSON Selection',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'jfp-open-formatter',
    title: 'Open JSON Formatter Pro',
    contexts: ['all']
  });

  console.log('JSON Formatter Pro installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'jfp-format-selection') {
    // Try to format selected text as JSON
    if (info.selectionText) {
      try {
        const parsed = JSON.parse(info.selectionText);
        const formatted = JSON.stringify(parsed, null, 2);

        // Copy formatted to clipboard
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (text) => {
            navigator.clipboard.writeText(text);
          },
          args: [formatted]
        });

        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icons/icon48.png',
          title: 'JSON Formatter Pro',
          message: 'Formatted JSON copied to clipboard!'
        });
      } catch (e) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icons/icon48.png',
          title: 'JSON Formatter Pro',
          message: 'Invalid JSON selected'
        });
      }
    }
  } else if (info.menuItemId === 'jfp-open-formatter') {
    chrome.action.openPopup();
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'format_json') {
    chrome.action.openPopup();
  } else if (command === 'toggle_theme') {
    // Send message to popup to toggle theme
    chrome.runtime.sendMessage({ action: 'toggleTheme' });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    chrome.storage.sync.get(['theme', 'darkMode', 'indent', 'sortKeys'], (result) => {
      sendResponse(result);
    });
    return true; // Will respond asynchronously
  }

  if (message.action === 'saveSettings') {
    chrome.storage.sync.set(message.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'formatJson') {
    try {
      const parsed = JSON.parse(message.json);
      const indent = message.indent || 2;
      const formatted = JSON.stringify(parsed, null, indent);
      sendResponse({ success: true, result: formatted });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior)
});

// Optional: Handle web requests to detect JSON responses
// Note: This requires additional permissions (webRequest, webRequestBlocking)
// chrome.webRequest.onHeadersReceived.addListener(
//   (details) => {
//     const contentType = details.responseHeaders.find(
//       h => h.name.toLowerCase() === 'content-type'
//     );
//     if (contentType && contentType.value.includes('application/json')) {
//       // Could send message to content script
//     }
//   },
//   { urls: ['<all_urls>'] },
//   ['responseHeaders']
// );

console.log('JSON Formatter Pro background script loaded');
