# History Archive Design

## Overview
Add a History layer that automatically records closed tabs, independent of "Saved for later". History has its own page (`history.html`) with date-based grouping.

## Data
- Key: `"history"` in chrome.storage.local
- Shape: `{ id, url, title, domain, closedAt, source }`
- Source: `"close"` (auto) or `"save"` (user action via "Save for later")
- Cleanup: silent prune oldest 10% when count > 10000
- Storage: `"unlimitedStorage"` permission removes 5MB cap

## History Recording

Two layers, with dedup to prevent double-recording:

### Layer 1: app.js (primary)
- `recordHistory(tabs, source)` called in all close paths:
  - `closeTabsByUrls` — hostname-based batch close
  - `closeTabsExact` — exact URL batch close (landing pages, browser group)
  - `closeDuplicateTabs` — dedup close
  - `close-single-tab` — individual tab close
  - `saveTabForLater` — records with `source: 'save'`
- Writes directly to chrome.storage.local before calling `chrome.tabs.remove`

### Layer 2: background.js (fallback)
- `chrome.tabs.onRemoved` listener captures Ctrl+W, browser close, etc.
- Uses `tabCache` (populated by `onUpdated`) to recover URL/title before removal
- `addToHistory` checks for same URL within last 2 seconds to dedup with app.js writes
- Service worker may lose `tabCache` on hibernation — acceptable tradeoff

### What gets recorded
- All real web pages
- All browser-internal pages (`chrome://`, `about:`, etc.)
- Only skipped: Tab Out's own pages (`chrome-extension://<id>/index.html`)

## Browser Group (new)
- `chrome://`, `chrome-extension://`, `about:`, `edge://`, `brave://` pages are now displayed on the main dashboard as a "Browser" / "浏览器" group
- Group key: `__browser__`, label: `t('section.browser')`
- Sorted last among all domain groups
- Uses exact URL matching for close operations
- Footer count (`getRealTabs()`) now includes these pages

## Entry Points
- Main page footer: `中/EN` · `History` link → opens history.html
- History page footer: `中/EN` · `Clear all history` (with confirm dialog)

## History Page (`history.html`)
- Same design language (fonts, colors, paper texture)
- Header: back link + title + search box
- Body: grouped by date (Today / Yesterday / Wednesday / April 10, 2026)
- Each tab: favicon + title + domain + time + "Save for later" badge if source=save + delete (hover)
- Footer: record count stats + language toggle + clear all button
- Language toggle shared with main page, switches re-render entire page
- `← Back` link returns to main page

## Footer Changes
- Removed "Tab Out by Zara" branding from both pages
- Main page: `中/EN` · `History`
- History page: `中/EN` · `Clear all history`
- Footer stat uses `getRealTabs().length` (matches displayed card count, was `openTabs.length` before)

## Files Changed
- `manifest.json`: add `"unlimitedStorage"` permission
- `background.js`: add `addToHistory`, `tabCache`, `onUpdated`/`onRemoved` listeners
- `app.js`: add `recordHistory()`, `isBrowserInternal()`, rewrite `getRealTabs()`, add `__browser__` group, write history on all close paths, add History link i18n
- `index.html`: History link in footer, removed "Tab Out by Zara"
- `history.html`: new page
- `history.js`: new logic (render, search, delete, clear, language toggle)
- `history.css`: new styles
- `i18n.js`: add history + browser group translations (zh/en)
- `style.css`: footer `.last-refresh` flex gap
