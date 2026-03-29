// F1 Fantasy League Challenge 2026 - Shared Prediction Sync
// Uses Firebase Realtime Database REST API (no SDK needed, just fetch)

const FirebaseSync = (() => {
  const DB_URL = 'https://f1fantasyleague-4a7ce-default-rtdb.firebaseio.com';
  const DB_PATH = 'predictions';
  const POLL_INTERVAL_MS = 10 * 1000;

  let pollTimer = null;

  function isConfigured() { return true; }
  function init() { return true; }
  function showSetupBanner() { }

  async function readAll() {
    try {
      const resp = await fetch(`${DB_URL}/${DB_PATH}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json() || {};
    } catch (err) {
      console.warn('[Sync] Read failed:', err.message);
      return null;
    }
  }

  async function writeKey(key, value) {
    try {
      const resp = await fetch(`${DB_URL}/${DB_PATH}/${key}.json`, {
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
    try {
      const resp = await fetch(`${DB_URL}/${DB_PATH}.json`, {
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
    poll();
    pollTimer = setInterval(poll, POLL_INTERVAL_MS);
  }

  function offUpdate() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  async function migrateFromLocalStorage() {
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
