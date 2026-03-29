// F1 Fantasy League Challenge 2026 - Shared Prediction Sync
// Syncs predictions across all players via JSONBlob (free, no accounts needed)

const FirebaseSync = (() => {
  // JSONBlob endpoint - shared storage for all players
  const BLOB_ID = '019d37df-c819-7a2c-be07-8de0df52a699';
  const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;
  const POLL_INTERVAL_MS = 15 * 1000; // Check for new predictions every 15s

  let pollTimer = null;

  function isConfigured() {
    return true; // Always configured - no setup needed
  }

  // Read all predictions from the shared store
  async function loadAll() {
    try {
      const resp = await fetch(BLOB_URL, {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (err) {
      console.warn('[Sync] Load failed:', err.message);
      return null;
    }
  }

  // Save all predictions (merges with existing remote data)
  async function saveAll(predictions) {
    try {
      // Read current remote data first to merge
      const remote = await loadAll() || {};
      const merged = Object.assign({}, remote, predictions);

      const resp = await fetch(BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      console.log('[Sync] Predictions saved to shared store');
      return true;
    } catch (err) {
      console.error('[Sync] Save failed:', err.message);
      return false;
    }
  }

  // Save a single prediction
  async function savePrediction(playerName, raceIndex, prediction) {
    const key = `${playerName}-${raceIndex}`;
    return saveAll({ [key]: prediction });
  }

  // Poll for updates and call callback when data changes
  function onUpdate(callback) {
    let lastHash = '';

    async function poll() {
      const data = await loadAll();
      if (!data) return;

      const hash = JSON.stringify(data);
      if (hash !== lastHash) {
        lastHash = hash;
        callback(data);
      }
    }

    // Initial load
    poll();
    // Poll periodically
    pollTimer = setInterval(poll, POLL_INTERVAL_MS);
  }

  function offUpdate() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // Merge any localStorage predictions into the shared store
  async function migrateFromLocalStorage() {
    try {
      const raw = localStorage.getItem('f1-predictions');
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (!stored || Object.keys(stored).length === 0) return;

      await saveAll(stored);
      console.log('[Sync] Merged localStorage predictions into shared store');
    } catch (err) {
      console.warn('[Sync] Migration failed:', err.message);
    }
  }

  function init() {
    return true; // Always ready
  }

  function showSetupBanner() {
    // No setup needed - nothing to show
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
