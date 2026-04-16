/* ================================================================
   Tab Out — History Page

   Displays a searchable, date-grouped list of all closed tabs.
   Data is read from chrome.storage.local under the "history" key.
   ================================================================ */

'use strict';

let allHistory = [];

/* ----------------------------------------------------------------
   TIME HELPERS
   ---------------------------------------------------------------- */

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
}

function isYesterday(dateStr) {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getFullYear() === yesterday.getFullYear() &&
         d.getMonth() === yesterday.getMonth() &&
         d.getDate() === yesterday.getDate();
}

function getDayKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(
    getLang() === 'zh' ? 'zh-CN' : 'en-US',
    { hour: 'numeric', minute: '2-digit' }
  );
}

function formatGroupLabel(dateStr) {
  if (isToday(dateStr)) return t('history.today');
  if (isYesterday(dateStr)) return t('history.yesterday');

  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);

  if (diffDays < 7) {
    return d.toLocaleDateString(
      getLang() === 'zh' ? 'zh-CN' : 'en-US',
      { weekday: 'long' }
    );
  }

  // Show full date for older entries
  return d.toLocaleDateString(
    getLang() === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

function friendlyDomain(hostname) {
  if (!hostname) return '';
  return hostname.replace(/^www\./, '');
}


/* ----------------------------------------------------------------
   GROUPING
   ---------------------------------------------------------------- */

/**
 * groupByDate(items)
 *
 * Groups history items by day (most recent first).
 * Returns [{ label, dateKey, items }]
 */
function groupByDate(items) {
  const groups = {};
  const order = [];

  for (const item of items) {
    const key = getDayKey(item.closedAt);
    if (!groups[key]) {
      groups[key] = { label: formatGroupLabel(item.closedAt), dateKey: key, items: [] };
      order.push(key);
    }
    groups[key].items.push(item);
  }

  // Sort keys descending (most recent first)
  order.sort((a, b) => b.localeCompare(a));

  return order.map(k => groups[k]);
}


/* ----------------------------------------------------------------
   RENDERING
   ---------------------------------------------------------------- */

function renderHistoryItem(item) {
  const domain = friendlyDomain(item.domain);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : '';
  const time = formatTime(item.closedAt);
  const safeUrl = (item.url || '').replace(/"/g, '&quot;');
  const safeTitle = (item.title || item.url || '').replace(/"/g, '&quot;');
  const sourceLabel = item.source === 'save' ? t('action.save') : '';

  return `
    <div class="history-item" data-history-id="${item.id}">
      ${faviconUrl ? `<img class="history-item-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">` : ''}
      <div class="history-item-content">
        <a href="${safeUrl}" target="_blank" rel="noopener" class="history-item-title" title="${safeTitle}">${item.title || item.url}</a>
        <div class="history-item-meta">
          ${domain ? `<span>${domain}</span>` : ''}
          ${sourceLabel ? `<span class="history-item-source save">${sourceLabel}</span>` : ''}
        </div>
      </div>
      <span class="history-item-time">${time}</span>
      <button class="history-item-delete" data-action="delete-history" data-history-id="${item.id}" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>`;
}

function renderGroups(groups) {
  const container = document.getElementById('historyGroups');
  if (!container) return;

  if (groups.length === 0) {
    container.innerHTML = '';
    const empty = document.getElementById('historyEmpty');
    if (empty) {
      empty.style.display = 'flex';
      empty.innerHTML = `
        <div class="history-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div class="history-empty-text">${t('history.empty')}</div>`;
    }
    return;
  }

  document.getElementById('historyEmpty').style.display = 'none';

  container.innerHTML = groups.map(group => `
    <div class="history-group">
      <div class="history-group-header">
        <span class="history-group-title">${group.label}</span>
        <div class="history-group-line"></div>
        <span class="history-group-count">${group.items.length}</span>
      </div>
      ${group.items.map(item => renderHistoryItem(item)).join('')}
    </div>
  `).join('');
}


/* ----------------------------------------------------------------
   TOAST
   ---------------------------------------------------------------- */

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}


/* ----------------------------------------------------------------
   MAIN RENDER
   ---------------------------------------------------------------- */

async function renderHistory(filter = '') {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    // Newest first
    allHistory = history.slice().reverse();

    let filtered = allHistory;
    if (filter.length >= 2) {
      const q = filter.toLowerCase();
      filtered = allHistory.filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.url || '').toLowerCase().includes(q) ||
        (item.domain || '').toLowerCase().includes(q)
      );
    }

    const groups = groupByDate(filtered);
    renderGroups(groups);

    // Update stats
    const countEl = document.getElementById('statHistoryCount');
    if (countEl) countEl.textContent = allHistory.length;
    const labelEl = document.getElementById('statHistoryLabel');
    if (labelEl) labelEl.textContent = t('history.total', allHistory.length);

  } catch (err) {
    console.warn('[tab-out] Failed to load history:', err);
  }
}


/* ----------------------------------------------------------------
   EVENT HANDLERS
   ---------------------------------------------------------------- */

document.addEventListener('click', async (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;

  // ---- Delete a single history item ----
  if (action === 'delete-history') {
    const id = actionEl.dataset.historyId;
    if (!id) return;

    const { history = [] } = await chrome.storage.local.get('history');
    const updated = history.filter(item => item.id !== id);
    await chrome.storage.local.set({ history: updated });

    const item = actionEl.closest('.history-item');
    if (item) {
      item.style.transition = 'opacity 0.2s, transform 0.2s';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      setTimeout(() => renderHistory(document.getElementById('historySearch').value.trim()), 200);
    }
    showToast(t('history.deleted'));
    return;
  }
});

// ---- Clear all history ----
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('#clearHistoryBtn');
  if (!btn) return;

  if (!confirm(t('history.confirmClear'))) return;

  await chrome.storage.local.set({ history: [] });
  showToast(t('history.cleared'));
  await renderHistory();
});

// ---- Language toggle ----
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('#langToggle');
  if (!btn) return;

  const newLang = getLang() === 'zh' ? 'en' : 'zh';
  await setLang(newLang);
  document.body.classList.toggle('lang-zh', newLang === 'zh');
  btn.textContent = newLang === 'zh' ? '中/EN' : 'EN/中';
  await initHistoryPage();
});

// ---- Search ----
document.addEventListener('input', (e) => {
  if (e.target.id !== 'historySearch') return;
  renderHistory(e.target.value.trim());
});


/* ----------------------------------------------------------------
   INITIALIZE
   ---------------------------------------------------------------- */

async function initHistoryPage() {
  const search = document.getElementById('historySearch');
  if (search) search.placeholder = t('history.search');
  const title = document.getElementById('historyTitle');
  if (title) title.textContent = t('history.title');
  const back = document.getElementById('backLink');
  if (back) back.textContent = t('history.back');
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) clearBtn.textContent = t('history.clearAll');

  await renderHistory();
}

(async () => {
  await loadLang();
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = getLang() === 'zh' ? '中/EN' : 'EN/中';
  document.body.classList.toggle('lang-zh', getLang() === 'zh');
  await initHistoryPage();
})();
