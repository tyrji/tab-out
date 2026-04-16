/**
 * background.js — Service Worker for Badge Updates
 *
 * Chrome's "always-on" background script for Tab Out.
 * Its only job: keep the toolbar badge showing the current open tab count.
 *
 * Since we no longer have a server, we query chrome.tabs directly.
 * The badge counts real web tabs (skipping chrome:// and extension pages).
 *
 * Color coding gives a quick at-a-glance health signal:
 *   Green  (#3d7a4a) → 1–10 tabs  (focused, manageable)
 *   Amber  (#b8892e) → 11–20 tabs (getting busy)
 *   Red    (#b35a5a) → 21+ tabs   (time to cull!)
 */

/**
 * addToHistory(tab)
 *
 * Records a closed tab to the history list in chrome.storage.local.
 * Silently prunes oldest 10% when total exceeds 10000 records.
 */
async function addToHistory(tab) {
  if (!tab || !tab.url) return;

  const url = tab.url || '';

  // Skip Tab Out's own pages
  if (url.startsWith('chrome-extension://') && url.includes(chrome.runtime.id)) return;

  let domain = '';
  try { domain = new URL(url).hostname; } catch {}

  const entry = {
    id:       Date.now().toString() + Math.random().toString(36).slice(2, 6),
    url:      url,
    title:    tab.title || url,
    domain:   domain,
    closedAt: new Date().toISOString(),
    source:   tab.source || 'close',
  };

  try {
    const { history = [] } = await chrome.storage.local.get('history');

    // Deduplicate: skip if the same URL was recorded in the last 2 seconds
    // (prevents double-recording when app.js writes history and then background.js
    // also fires on chrome.tabs.remove)
    const twoSecondsAgo = Date.now() - 2000;
    const isDuplicate = history.some(item =>
      item.url === url &&
      new Date(item.closedAt).getTime() > twoSecondsAgo
    );
    if (isDuplicate) return;

    history.push(entry);

    // Prune oldest 10% when over 10000
    if (history.length > 10000) {
      history.splice(0, Math.floor(history.length * 0.1));
    }

    await chrome.storage.local.set({ history });
  } catch {}
}

// ─── Badge updater ────────────────────────────────────────────────────────────

/**
 * updateBadge()
 *
 * Counts open real-web tabs and updates the extension's toolbar badge.
 * "Real" tabs = not chrome://, not extension pages, not about:blank.
 */
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});

    // Only count actual web pages — skip browser internals and extension pages
    const count = tabs.filter(t => {
      const url = t.url || '';
      return (
        !url.startsWith('chrome://') &&
        !url.startsWith('chrome-extension://') &&
        !url.startsWith('about:') &&
        !url.startsWith('edge://') &&
        !url.startsWith('brave://')
      );
    }).length;

    // Don't show "0" — an empty badge is cleaner
    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });

    if (count === 0) return;

    // Pick badge color based on workload level
    let color;
    if (count <= 10) {
      color = '#3d7a4a'; // Green — you're in control
    } else if (count <= 20) {
      color = '#b8892e'; // Amber — things are piling up
    } else {
      color = '#b35a5a'; // Red — time to focus and close some tabs
    }

    await chrome.action.setBadgeBackgroundColor({ color });

  } catch {
    // If something goes wrong, clear the badge rather than show stale data
    chrome.action.setBadgeText({ text: '' });
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────

// Update badge when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

// Update badge when Chrome starts up
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is opened
chrome.tabs.onCreated.addListener(() => {
  updateBadge();
});

// Update badge whenever a tab is closed
// Also record tab to history using cached info
const tabCache = new Map();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  updateBadge();
  if (changeInfo.status === 'complete' || tab.url) {
    tabCache.set(tabId, { url: tab.url, title: tab.title });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  updateBadge();
  const info = tabCache.get(tabId);
  if (info) {
    tabCache.delete(tabId);
    info.source = 'close';
    await addToHistory(info);
  }
});

// ─── Initial run ─────────────────────────────────────────────────────────────

// Run once immediately when the service worker first loads
updateBadge();
