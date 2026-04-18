/* ----------------------------------------------------------------
   i18n.js — Internationalization for Tab Out

   Usage:
     t('greeting.morning')  →  '早上好' / 'Good morning'
     t('tabs', 5)           →  '5 个标签页' / '5 tabs'
   ---------------------------------------------------------------- */

const translations = {
  zh: {
    // Greeting
    'greeting.morning':   '早上好',
    'greeting.afternoon': '下午好',
    'greeting.evening':   '晚上好',

    // Date locale
    'date.locale': 'zh-CN',

    // Section headers
    'section.openTabs':  '打开的标签页',
    'section.homepages': '主页',
    'section.history':   'History',
    'section.oneTab':    'OneTab',
    'section.browser':   '浏览器',

    // Popup
    'popup.archiveAll':  '归档为 1 个标签页',
    'popup.viewSaved':   '查看已归档',
    'popup.done':        '完成！',
    'popup.noTabs':      '没有标签页',
    'popup.archiving':   '归档中…',

    // Footer
    'footer.openTabs': '打开的标签页',

    // Tab counts
    'label.tabs':    '个标签页',
    'label.domains': '个域名',

    // Actions
    'action.closeAll':     (n) => `关闭全部 ${n} 个标签页`,
    'action.closeDomain':  (n) => `关闭全部 ${n} 个标签页`,
    'action.closeDupes':   (n) => `关闭 ${n} 个重复项`,
    'action.closeExtras':  '关闭多余的',
    'action.refresh':      '刷新',
    'action.dismiss':      '移除',
    'action.save':         '稍后查看',
    'action.closeTab':     '关闭此标签页',

    // Dupe badge
    'badge.duplicate': (n) => `${n}x`,

    // Time ago
    'time.justNow':   '刚刚',
    'time.minutesAgo': (n) => `${n} 分钟前`,
    'time.hoursAgo':   (n) => `${n} 小时前`,
    'time.yesterday':  '昨天',
    'time.daysAgo':    (n) => `${n} 天前`,

    // Toast messages
    'toast.closedExtra':    '已关闭多余的 Tab Out 标签页',
    'toast.tabClosed':      '标签页已关闭',
    'toast.closedFrom':     (n, label) => `已关闭来自 ${label} 的 ${n} 个标签页`,
    'toast.closedDupes':    '已关闭重复项，每个保留一份',
    'toast.allClosed':      '全部标签页已关闭，焕然一新',

    // Banner
    'banner.dupeText':  (n) => `你有 ${n} 个 Tab Out 标签页打开。只保留这一个？`,

    // Empty states
    'empty.inboxZeroTitle':   '标签页清零，收工。',
    'empty.inboxZeroSubtitle':'自由了。',

    // History page
    'history.title':       'History',
    'history.search':      '搜索历史记录...',
    'history.today':       '今天',
    'history.yesterday':   '昨天',
    'history.thisWeek':    '本周',
    'history.monthFormat': (year, month) => `${year}年${month}月`,
    'history.dateFormat':  (month, day) => `${month}月${day}日`,
    'history.clearAll':    '清空所有历史',
    'history.total':       (n) => `共 ${n} 条记录`,
    'history.empty':       '暂无历史记录。',
    'history.confirmClear': '确定清空所有历史记录？',
    'history.restored':    '已在新标签页打开',
    'history.deleted':     '已删除',
    'history.cleared':     '历史记录已清空',
    'history.back':        '← 返回',

    // OneTab page
    'onetab.title':        'OneTab',
    'onetab.search':       '搜索保存的标签页...',
    'onetab.today':        '今天',
    'onetab.yesterday':    '昨天',
    'onetab.thisWeek':     '本周',
    'onetab.monthFormat':  (year, month) => `${year}年${month}月`,
    'onetab.dateFormat':   (month, day) => `${month}月${day}日`,
    'onetab.clearAll':     '清空所有',
    'onetab.total':        (n) => `共 ${n} 条`,
    'onetab.empty':        '暂无保存的标签页。',
    'onetab.confirmClear': '确定清空所有保存的标签页？',
    'onetab.deleted':      '已删除',
    'onetab.cleared':      '已清空',
    'onetab.back':         '← 返回',

    // Overflow
    'overflow.more':   (n) => `+${n} 更多`,
  },

  en: {
    // Greeting
    'greeting.morning':   'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening':   'Good evening',

    // Date locale
    'date.locale': 'en-US',

    // Section headers
    'section.openTabs':   'Open tabs',
    'section.homepages':  'Homepages',
    'section.history':    'History',
    'section.oneTab':     'OneTab',
    'section.browser':    'Browser',

    // Popup
    'popup.archiveAll':  'Send to OneTab',
    'popup.viewSaved':   'View saved tabs',
    'popup.done':       'Done!',
    'popup.noTabs':     'No tabs open',
    'popup.archiving':  'Sending…',

    // Footer
    'footer.openTabs': 'Open tabs',

    // Tab counts
    'label.tabs':    (n) => n === 1 ? 'tab' : 'tabs',
    'label.domains': (n) => n === 1 ? 'domain' : 'domains',

    // Actions
    'action.closeAll':     (n) => `Close all ${n} tab${n !== 1 ? 's' : ''}`,
    'action.closeDomain':  (n) => `Close all ${n} tab${n !== 1 ? 's' : ''}`,
    'action.closeDupes':   (n) => `Close ${n} duplicate${n !== 1 ? 's' : ''}`,
    'action.closeExtras':  'Close extras',
    'action.refresh':      'Refresh',
    'action.dismiss':      'Dismiss',
    'action.save':         'Save for later',
    'action.closeTab':     'Close this tab',

    // Dupe badge
    'badge.duplicate': (n) => `${n}x`,

    // Time ago
    'time.justNow':    'just now',
    'time.minutesAgo': (n) => `${n} min ago`,
    'time.hoursAgo':   (n) => `${n} hr${n !== 1 ? 's' : ''} ago`,
    'time.yesterday':  'yesterday',
    'time.daysAgo':    (n) => `${n} days ago`,

    // Toast messages
    'toast.closedExtra':    'Closed extra Tab Out tabs',
    'toast.tabClosed':      'Tab closed',
    'toast.closedFrom':     (n, label) => `Closed ${n} tab${n !== 1 ? 's' : ''} from ${label}`,
    'toast.closedDupes':    'Closed duplicates, kept one copy each',
    'toast.allClosed':      'All tabs closed. Fresh start.',

    // Banner
    'banner.dupeText':  (n) => `You have ${n} Tab Out tabs open. Keep just this one?`,

    // Empty states
    'empty.inboxZeroTitle':   'Inbox zero, but for tabs.',
    'empty.inboxZeroSubtitle':"You're free.",

    // History page
    'history.title':       'History',
    'history.search':      'Search history...',
    'history.today':       'Today',
    'history.yesterday':   'Yesterday',
    'history.thisWeek':    'This week',
    'history.monthFormat': (year, month) => `${year} ${month}`,
    'history.dateFormat':  (month, day) => `${month} ${day}`,
    'history.clearAll':    'Clear all history',
    'history.total':       (n) => `${n} record${n !== 1 ? 's' : ''}`,
    'history.empty':       'No history yet.',
    'history.confirmClear': 'Clear all history records?',
    'history.restored':    'Opened in new tab',
    'history.deleted':     'Deleted',
    'history.cleared':     'History cleared',
    'history.back':        '← Back',

    // OneTab page
    'onetab.title':        'OneTab',
    'onetab.search':       'Search saved tabs...',
    'onetab.today':        'Today',
    'onetab.yesterday':    'Yesterday',
    'onetab.thisWeek':     'This week',
    'onetab.monthFormat':  (year, month) => `${year} ${month}`,
    'onetab.dateFormat':   (month, day) => `${month} ${day}`,
    'onetab.clearAll':     'Clear all',
    'onetab.total':        (n) => `${n} item${n !== 1 ? 's' : ''}`,
    'onetab.empty':        'No saved tabs yet.',
    'onetab.confirmClear': 'Clear all saved tabs?',
    'onetab.deleted':      'Deleted',
    'onetab.cleared':      'Cleared',
    'onetab.back':         '← Back',

    // Overflow
    'overflow.more':   (n) => `+${n} more`,
  },
};

// ---- Current language (persisted in chrome.storage.local) ----
let _lang = 'en';

/**
 * t(key, ...args)
 *
 * Looks up a translated string. If the value is a function, calls it with args.
 */
function t(key, ...args) {
  const dict = translations[_lang] || translations.en;
  const val  = dict[key];
  if (val === undefined) {
    // Fallback to English
    const enVal = translations.en[key];
    if (typeof enVal === 'function') return enVal(...args);
    return enVal || key;
  }
  if (typeof val === 'function') return val(...args);
  return val;
}

/**
 * getLang() / setLang(lang)
 */
function getLang() { return _lang; }

async function setLang(lang) {
  _lang = lang;
  await chrome.storage.local.set({ lang });
}

/**
 * loadLang() — loads persisted language preference
 */
/**
 * Detect browser language — returns 'zh' if browser prefers Chinese, else 'en'.
 */
function detectLang() {
  try {
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('zh')) return 'zh';
  } catch {}
  return 'en';
}

async function loadLang() {
  try {
    const { lang } = await chrome.storage.local.get('lang');
    if (lang && translations[lang]) {
      _lang = lang;
    } else {
      // No stored preference — auto-detect from browser
      _lang = detectLang();
    }
  } catch {
    _lang = detectLang();
  }
}
