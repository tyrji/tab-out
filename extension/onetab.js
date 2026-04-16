/* ================================================================
   Tab Out — OneTab Page

   Displays a searchable, date-grouped list of all closed tabs.
   Data is read from chrome.storage.local under the "onetab" key.
   ================================================================ */

'use strict';

let allOneTab = [];

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
  if (isToday(dateStr)) return t('onetab.today');
  if (isYesterday(dateStr)) return t('onetab.yesterday');

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
    const key = getDayKey(item.savedAt);
    if (!groups[key]) {
      groups[key] = { label: formatGroupLabel(item.savedAt), dateKey: key, items: [] };
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

function renderOneTabItem(item) {
  const domain = friendlyDomain(item.domain);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : '';
  const time = formatTime(item.savedAt);
  const safeUrl = (item.url || '').replace(/"/g, '&quot;');
  const safeTitle = (item.title || item.url || '').replace(/"/g, '&quot;');
  return `
    <div class="onetab-item" data-onetab-id="${item.id}">
      ${faviconUrl ? `<img class="onetab-item-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">` : ''}
      <div class="onetab-item-content">
        <a href="${safeUrl}" target="_blank" rel="noopener" class="onetab-item-title" title="${safeTitle}">${item.title || item.url}</a>
        <div class="onetab-item-meta">
          ${domain ? `<span>${domain}</span>` : ''}
        </div>
      </div>
      <span class="onetab-item-time">${time}</span>
      <button class="onetab-item-delete" data-action="delete-onetab" data-onetab-id="${item.id}" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>`;
}

function renderGroups(groups) {
  const container = document.getElementById('onetabGroups');
  if (!container) return;

  if (groups.length === 0) {
    container.innerHTML = '';
    const empty = document.getElementById('onetabEmpty');
    if (empty) {
      empty.style.display = 'flex';
      empty.innerHTML = `
        <div class="onetab-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div class="onetab-empty-text">${t('onetab.empty')}</div>`;
    }
    return;
  }

  document.getElementById('onetabEmpty').style.display = 'none';

  container.innerHTML = groups.map(group => `
    <div class="onetab-group">
      <div class="onetab-group-header">
        <span class="onetab-group-title">${group.label}</span>
        <div class="onetab-group-line"></div>
        <span class="onetab-group-count">${group.items.length}</span>
      </div>
      ${group.items.map(item => renderOneTabItem(item)).join('')}
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

async function renderOneTab(filter = '') {
  try {
    const { onetab = [] } = await chrome.storage.local.get('onetab');
    // Newest first
    allOneTab = onetab.slice().reverse();

    let filtered = allOneTab;
    if (filter.length >= 2) {
      const q = filter.toLowerCase();
      filtered = allOneTab.filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.url || '').toLowerCase().includes(q) ||
        (item.domain || '').toLowerCase().includes(q)
      );
    }

    const groups = groupByDate(filtered);
    renderGroups(groups);

    // Update stats
    const countEl = document.getElementById('statOneTabCount');
    if (countEl) countEl.textContent = allOneTab.length;
    const labelEl = document.getElementById('statOneTabLabel');
    if (labelEl) labelEl.textContent = t('onetab.total', allOneTab.length);

  } catch (err) {
    console.warn('[tab-out] Failed to load onetab:', err);
  }
}


/* ----------------------------------------------------------------
   EVENT HANDLERS
   ---------------------------------------------------------------- */

document.addEventListener('click', async (e) => {
  // ---- Open a link and remove it from the list ----
  const link = e.target.closest('.onetab-item-title');
  if (link) {
    const item = link.closest('.onetab-item');
    const id = item?.dataset.onetabId;
    if (id) {
      const { onetab = [] } = await chrome.storage.local.get('onetab');
      await chrome.storage.local.set({ onetab: onetab.filter(i => i.id !== id) });
      if (item) {
        item.style.transition = 'opacity 0.2s, transform 0.2s';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => renderOneTab(document.getElementById('onetabSearch')?.value.trim()), 200);
      }
    }
    return;
  }

  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;

  // ---- Delete a single onetab item ----
  if (action === 'delete-onetab') {
    const id = actionEl.dataset.onetabId;
    if (!id) return;

    const { onetab = [] } = await chrome.storage.local.get('onetab');
    const updated = onetab.filter(item => item.id !== id);
    await chrome.storage.local.set({ onetab: updated });

    const item = actionEl.closest('.onetab-item');
    if (item) {
      item.style.transition = 'opacity 0.2s, transform 0.2s';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      setTimeout(() => renderOneTab(document.getElementById('onetabSearch').value.trim()), 200);
    }
    showToast(t('onetab.deleted'));
    return;
  }
});

// ---- Clear all history ----
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('#clearOneTabBtn');
  if (!btn) return;

  if (!confirm(t('onetab.confirmClear'))) return;

  await chrome.storage.local.set({ onetab: [] });
  showToast(t('onetab.cleared'));
  await renderOneTab();
});

// ---- Language toggle ----
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('#langToggle');
  if (!btn) return;

  const newLang = getLang() === 'zh' ? 'en' : 'zh';
  await setLang(newLang);
  document.body.classList.toggle('lang-zh', newLang === 'zh');
  btn.textContent = newLang === 'zh' ? '中/EN' : 'EN/中';
  await initOneTabPage();
});

// ---- Search ----
document.addEventListener('input', (e) => {
  if (e.target.id !== 'onetabSearch') return;
  renderOneTab(e.target.value.trim());
});


/* ----------------------------------------------------------------
   INITIALIZE
   ---------------------------------------------------------------- */

async function initOneTabPage() {
  const search = document.getElementById('onetabSearch');
  if (search) search.placeholder = t('onetab.search');
  const title = document.getElementById('onetabTitle');
  if (title) title.textContent = t('onetab.title');
  const back = document.getElementById('backLink');
  if (back) back.textContent = t('onetab.back');
  const clearBtn = document.getElementById('clearOneTabBtn');
  if (clearBtn) clearBtn.textContent = t('onetab.clearAll');

  await renderOneTab();
}

(async () => {
  await loadLang();
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = getLang() === 'zh' ? '中/EN' : 'EN/中';
  document.body.classList.toggle('lang-zh', getLang() === 'zh');
  await initOneTabPage();
})();
