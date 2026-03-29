// F1 Fantasy League Challenge 2026 - Shared Prediction Sync
// Uses Firebase Realtime Database REST API (no SDK needed, just fetch)

const FirebaseSync = (() => {
  const CONFIG_KEY = 'f1-firebase-db-url';
  const DB_PATH = 'predictions';
  const POLL_INTERVAL_MS = 10 * 1000; // Poll every 10 seconds

  let pollTimer = null;
  let dbUrl = null;

  function getDbUrl() {
    if (dbUrl) return dbUrl;
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) { dbUrl = stored.replace(/\/+$/, ''); return dbUrl; }
    return null;
  }

  function isConfigured() {
    return !!getDbUrl();
  }

  function init() {
    return isConfigured();
  }

  // --- REST API helpers ---

  async function readAll() {
    const url = getDbUrl();
    if (!url) return null;
    try {
      const resp = await fetch(`${url}/${DB_PATH}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json() || {};
    } catch (err) {
      console.warn('[Sync] Read failed:', err.message);
      return null;
    }
  }

  async function writeKey(key, value) {
    const url = getDbUrl();
    if (!url) return false;
    try {
      const resp = await fetch(`${url}/${DB_PATH}/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return true;
    } catch (err) {
      console.error('[Sync] Write failed:', err.message);
      return false;
    }
  }

  async function writeAll(data) {
    const url = getDbUrl();
    if (!url) return false;
    try {
      const resp = await fetch(`${url}/${DB_PATH}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return true;
    } catch (err) {
      console.error('[Sync] Write failed:', err.message);
      return false;
    }
  }

  // --- Public API (same interface as before) ---

  async function savePrediction(playerName, raceIndex, prediction) {
    const key = `${playerName}-${raceIndex}`;
    const ok = await writeKey(key, prediction);
    if (ok) console.log(`[Sync] Saved: ${key}`);
    return ok;
  }

  async function loadAll() {
    return readAll();
  }

  function onUpdate(callback) {
    let lastHash = '';

    async function poll() {
      const data = await readAll();
      if (!data) return;
      const hash = JSON.stringify(data);
      if (hash !== lastHash) {
        lastHash = hash;
        callback(data);
      }
    }

    poll(); // Initial load
    pollTimer = setInterval(poll, POLL_INTERVAL_MS);
  }

  function offUpdate() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  async function migrateFromLocalStorage() {
    if (!isConfigured()) return;
    try {
      const raw = localStorage.getItem('f1-predictions');
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (!stored || Object.keys(stored).length === 0) return;
      await writeAll(stored);
      console.log('[Sync] Migrated localStorage predictions');
    } catch (err) {
      console.warn('[Sync] Migration failed:', err.message);
    }
  }

  // --- Setup Banner & Modal ---

  function showSetupBanner() {
    if (isConfigured()) return;
    if (document.getElementById('firebase-setup-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'firebase-setup-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:10000;' +
      'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
      'border-bottom:2px solid #E10600;padding:12px 20px;' +
      'display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;' +
      'font-family:"Titillium Web",sans-serif;font-size:0.9rem;color:#fff;';

    banner.innerHTML =
      '<span>\u26A0\uFE0F <strong>Predictions are local-only.</strong> Connect Firebase to sync across all players.</span>' +
      '<button id="firebase-setup-btn" style="' +
        'background:#E10600;color:#fff;border:none;padding:6px 16px;border-radius:4px;' +
        'cursor:pointer;font-family:inherit;font-weight:600;font-size:0.85rem;">' +
        '\uD83D\uDD27 Setup</button>' +
      '<button id="firebase-dismiss-btn" style="' +
        'background:transparent;color:#9CA3AF;border:1px solid #9CA3AF;padding:6px 12px;border-radius:4px;' +
        'cursor:pointer;font-family:inherit;font-size:0.85rem;">Dismiss</button>';

    document.body.prepend(banner);
    document.body.style.paddingTop = (banner.offsetHeight + 8) + 'px';

    document.getElementById('firebase-setup-btn').addEventListener('click', showSetupModal);
    document.getElementById('firebase-dismiss-btn').addEventListener('click', () => {
      banner.remove();
      document.body.style.paddingTop = '';
    });
  }

  function showSetupModal() {
    if (document.getElementById('sync-setup-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sync-setup-modal';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10001;' +
      'background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = [
      '<div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;',
      'max-width:500px;width:90%;color:#fff;font-family:\'Titillium Web\',sans-serif;">',
      '<h3 style="margin:0 0 12px;color:#E10600;">\uD83D\uDD27 Connect Firebase</h3>',
      '<p style="margin:0 0 6px;color:#ccc;font-size:0.85rem;">Paste your Firebase <strong>Realtime Database URL</strong>.</p>',
      '<p style="margin:0 0 12px;color:#9CA3AF;font-size:0.8rem;">',
      'Find it in <a href="https://console.firebase.google.com/" target="_blank" style="color:#E10600;">Firebase Console</a>',
      ' \u2192 Build \u2192 Realtime Database \u2192 the URL at the top (starts with https://).</p>',
      '<input id="db-url-input" type="url" placeholder="https://your-project-default-rtdb.firebaseio.com"',
      ' style="width:100%;box-sizing:border-box;background:#0d1117;color:#e6edf3;border:1px solid #444;',
      'border-radius:6px;padding:10px;font-family:monospace;font-size:0.85rem;" />',
      '<div id="db-url-error" style="color:#ef4444;font-size:0.8rem;margin-top:6px;display:none;"></div>',
      '<div style="display:flex;gap:10px;margin-top:14px;">',
      '<button id="db-url-save" style="flex:1;background:#E10600;color:#fff;border:none;padding:10px;',
      'border-radius:6px;cursor:pointer;font-weight:600;font-size:0.9rem;">\u2705 Connect</button>',
      '<button id="db-url-cancel" style="background:transparent;color:#9CA3AF;border:1px solid #9CA3AF;',
      'padding:10px 16px;border-radius:6px;cursor:pointer;font-size:0.9rem;">Cancel</button>',
      '</div></div>'
    ].join('');

    document.body.appendChild(overlay);

    document.getElementById('db-url-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('db-url-save').addEventListener('click', async () => {
      const urlInput = document.getElementById('db-url-input').value.trim();
      const errEl = document.getElementById('db-url-error');

      if (!urlInput.startsWith('https://')) {
        errEl.textContent = '\u274C URL must start with https://';
        errEl.style.display = 'block';
        return;
      }

      // Test the connection
      errEl.textContent = 'Testing connection...';
      errEl.style.display = 'block';
      errEl.style.color = '#eab308';

      try {
        const testUrl = urlInput.replace(/\/+$/, '') + '/.json';
        const resp = await fetch(testUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} - make sure the Realtime Database is created and rules allow read/write`);

        // Save and activate
        localStorage.setItem(CONFIG_KEY, urlInput);
        dbUrl = urlInput.replace(/\/+$/, '');
        overlay.remove();
        const banner = document.getElementById('firebase-setup-banner');
        if (banner) { banner.remove(); document.body.style.paddingTop = ''; }

        // Start syncing
        migrateFromLocalStorage();
        onUpdate((allPredictions) => {
          try {
            const local = JSON.parse(localStorage.getItem('f1-predictions') || '{}');
            localStorage.setItem('f1-predictions', JSON.stringify(Object.assign({}, local, allPredictions)));
          } catch (e) { /* ignore */ }
          if (typeof mergePredictionsFromData === 'function') mergePredictionsFromData(allPredictions);
          if (typeof renderAll === 'function') renderAll();
        });

        alert('\u2705 Connected! Predictions will now sync across all browsers.');
      } catch (err) {
        errEl.textContent = '\u274C ' + err.message;
        errEl.style.color = '#ef4444';
        errEl.style.display = 'block';
      }
    });
  }

  return {
    init,
    isConfigured,
    savePrediction,
    loadAll,
    onUpdate,
    offUpdate,
    migrateFromLocalStorage,
    showSetupBanner
  };
})();
