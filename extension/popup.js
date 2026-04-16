(async () => {
  await loadLang();

  const tabs = await chrome.tabs.query({});

  const countEl = document.getElementById('tabCount');
  const tabLabel = document.getElementById('tabLabel');
  const saveBtn = document.getElementById('saveBtn');
  const viewLink = document.getElementById('viewLink');

  countEl.textContent = tabs.length;
  tabLabel.textContent = t('label.tabs', tabs.length);
  saveBtn.textContent = t('popup.archiveAll');
  viewLink.textContent = t('popup.viewSaved');

  if (tabs.length === 0) {
    saveBtn.disabled = true;
    saveBtn.textContent = t('popup.noTabs');
    return;
  }

  saveBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'archiveTabs' });
    saveBtn.disabled = true;
    saveBtn.textContent = t('popup.archiving');
  });
})();
