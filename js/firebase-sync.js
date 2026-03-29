// F1 Fantasy League Challenge 2026 - Firebase Prediction Sync
// Syncs predictions across all players via Firebase Realtime Database

const FirebaseSync = (() => {
  // ┌─────────────────────────────────────────────────────────────────┐
  // │  FIREBASE CONFIG                                                │
  // │  Option A: Paste your config here (hardcoded)                   │
  // │  Option B: Use the on-page setup wizard (stored in localStorage)│
  // └─────────────────────────────────────────────────────────────────┘
  const HARDCODED_CONFIG = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT.firebaseapp.com",
    databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId:         "YOUR_PROJECT",
    storageBucket:     "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId:             "YOUR_APP_ID"
  };

  const CONFIG_STORAGE_KEY = 'f1-firebase-config';
  const DB_PATH = 'predictions';
  let db = null;
  let initialized = false;

  function getConfig() {
    // Prefer hardcoded config if it's been filled in
    if (HARDCODED_CONFIG.apiKey !== "YOUR_API_KEY") return HARDCODED_CONFIG;
    // Fall back to localStorage config (set via setup wizard)
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function isConfigured() {
    const cfg = getConfig();
    return cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY" && cfg.databaseURL;
  }

  function saveConfig(config) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }

  function clearConfig() {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }

  function init() {
    if (initialized) return true;
    const config = getConfig();
    if (!config) {
      console.warn('[FirebaseSync] Firebase not configured — predictions will only save locally.');
      return false;
    }
    try {
      if (typeof firebase === 'undefined') {
        console.warn('[FirebaseSync] Firebase SDK not loaded');
        return false;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      db = firebase.database();
      initialized = true;
      console.log('[FirebaseSync] Connected to Firebase');
      return true;
    } catch (err) {
      console.error('[FirebaseSync] Init failed:', err);
      return false;
    }
  }

  // Save a single prediction to Firebase
  async function savePrediction(playerName, raceIndex, prediction) {
    if (!init()) return false;
    try {
      const key = `${playerName}-${raceIndex}`;
      await db.ref(`${DB_PATH}/${key}`).set(prediction);
      console.log(`[FirebaseSync] Saved prediction: ${key}`);
      return true;
    } catch (err) {
      console.error('[FirebaseSync] Save failed:', err);
      return false;
    }
  }

  // Load all predictions from Firebase (one-time read)
  async function loadAll() {
    if (!init()) return null;
    try {
      const snapshot = await db.ref(DB_PATH).once('value');
      const data = snapshot.val();
      return data || {};
    } catch (err) {
      console.error('[FirebaseSync] Load failed:', err);
      return null;
    }
  }

  // Listen for real-time updates and call the callback with all predictions
  function onUpdate(callback) {
    if (!init()) return;
    db.ref(DB_PATH).on('value', (snapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });
  }

  // Stop listening for updates
  function offUpdate() {
    if (!db) return;
    db.ref(DB_PATH).off('value');
  }

  // Merge localStorage predictions into Firebase (each player's local data is pushed)
  async function migrateFromLocalStorage() {
    if (!init()) return;
    try {
      const raw = localStorage.getItem('f1-predictions');
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (!stored || Object.keys(stored).length === 0) return;

      const updates = {};
      for (const [key, value] of Object.entries(stored)) {
        updates[key] = value;
      }
      await db.ref(DB_PATH).update(updates);
      console.log('[FirebaseSync] Merged localStorage predictions into Firebase');
    } catch (err) {
      console.warn('[FirebaseSync] Migration failed:', err);
    }
  }

  // --- Setup Wizard UI ---

  function showSetupBanner() {
    if (isConfigured()) return;
    if (document.getElementById('firebase-setup-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'firebase-setup-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:10000;' +
      'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
      'border-bottom:2px solid #E10600;padding:12px 20px;' +
      'display:flex;align-items:center;justify-content:center;gap:12px;' +
      'font-family:"Titillium Web",sans-serif;font-size:0.9rem;color:#fff;';

    banner.innerHTML =
      '<span>⚠️ <strong>Predictions are local-only.</strong> Connect Firebase to sync across all players.</span>' +
      '<button id="firebase-setup-btn" style="' +
        'background:#E10600;color:#fff;border:none;padding:6px 16px;border-radius:4px;' +
        'cursor:pointer;font-family:inherit;font-weight:600;font-size:0.85rem;">' +
        '🔧 Setup Firebase</button>' +
      '<button id="firebase-dismiss-btn" style="' +
        'background:transparent;color:#9CA3AF;border:1px solid #9CA3AF;padding:6px 12px;border-radius:4px;' +
        'cursor:pointer;font-family:inherit;font-size:0.85rem;">' +
        'Dismiss</button>';

    document.body.prepend(banner);
    // Push page content down
    document.body.style.marginTop = banner.offsetHeight + 'px';

    document.getElementById('firebase-setup-btn').addEventListener('click', showSetupModal);
    document.getElementById('firebase-dismiss-btn').addEventListener('click', () => {
      banner.remove();
      document.body.style.marginTop = '';
    });
  }

  function showSetupModal() {
    if (document.getElementById('firebase-setup-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'firebase-setup-modal';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10001;' +
      'background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;
                  max-width:520px;width:90%;color:#fff;font-family:'Titillium Web',sans-serif;
                  max-height:90vh;overflow-y:auto;">
        <h3 style="margin:0 0 8px;color:#E10600;">🔧 Firebase Setup</h3>
        <p style="margin:0 0 16px;color:#9CA3AF;font-size:0.85rem;">
          In Firebase Console → ⚙️ Project Settings → scroll to "Your apps" → copy the config object.
          Paste the <strong>entire firebaseConfig block</strong> below (including the curly braces).
        </p>
        <textarea id="firebase-config-input" rows="10" style="
          width:100%;box-sizing:border-box;background:#0d1117;color:#e6edf3;border:1px solid #444;
          border-radius:6px;padding:10px;font-family:monospace;font-size:0.8rem;resize:vertical;
        " placeholder='Paste your config here, e.g.:
{
  apiKey: "AIzaSy...",
  authDomain: "f1fantasyleague.firebaseapp.com",
  databaseURL: "https://f1fantasyleague-default-rtdb.firebaseio.com",
  projectId: "f1fantasyleague",
  storageBucket: "f1fantasyleague.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
}'></textarea>
        <div id="firebase-setup-error" style="color:#ef4444;font-size:0.8rem;margin-top:6px;display:none;"></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
          <button id="firebase-save-config" style="
            flex:1;background:#E10600;color:#fff;border:none;padding:10px;border-radius:6px;
            cursor:pointer;font-family:inherit;font-weight:600;font-size:0.9rem;">
            ✅ Connect
          </button>
          <button id="firebase-cancel-setup" style="
            background:transparent;color:#9CA3AF;border:1px solid #9CA3AF;padding:10px 16px;
            border-radius:6px;cursor:pointer;font-family:inherit;font-size:0.9rem;">
            Cancel
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    document.getElementById('firebase-cancel-setup').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('firebase-save-config').addEventListener('click', () => {
      const raw = document.getElementById('firebase-config-input').value.trim();
      const errEl = document.getElementById('firebase-setup-error');
      try {
        const config = parseFirebaseConfig(raw);
        if (!config.apiKey || !config.databaseURL || !config.projectId) {
          throw new Error('Missing required fields: apiKey, databaseURL, projectId');
        }
        saveConfig(config);
        overlay.remove();
        const banner = document.getElementById('firebase-setup-banner');
        if (banner) { banner.remove(); document.body.style.marginTop = ''; }
        // Re-initialize with new config
        initialized = false;
        if (init()) {
          migrateFromLocalStorage();
          onUpdate((allPredictions) => {
            try {
              const local = JSON.parse(localStorage.getItem('f1-predictions') || '{}');
              localStorage.setItem('f1-predictions', JSON.stringify(Object.assign({}, local, allPredictions)));
            } catch (e) { /* ignore */ }
            if (typeof mergePredictionsFromData === 'function') mergePredictionsFromData(allPredictions);
            if (typeof renderAll === 'function') renderAll();
          });
          alert('✅ Firebase connected! Predictions will now sync across all browsers.');
        } else {
          throw new Error('Failed to connect — check your config and database URL.');
        }
      } catch (err) {
        errEl.textContent = '❌ ' + err.message;
        errEl.style.display = 'block';
      }
    });
  }

  function parseFirebaseConfig(raw) {
    // Handle various formats users might paste
    // Strip "const firebaseConfig = " prefix if present
    let cleaned = raw.replace(/^(const|let|var)\s+\w+\s*=\s*/, '').replace(/;$/, '').trim();
    // Try JSON parse first
    try { return JSON.parse(cleaned); } catch {}
    // Try evaluating as JS object literal (keys without quotes)
    try {
      cleaned = cleaned.replace(/(['"])?(\w+)(['"])?\s*:/g, '"$2":');
      // Ensure values are quoted
      cleaned = cleaned.replace(/:\s*"([^"]*)"/g, ': "$1"');
      return JSON.parse(cleaned);
    } catch {}
    // Last resort: extract key-value pairs with regex
    const config = {};
    const re = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let match;
    while ((match = re.exec(raw)) !== null) {
      config[match[1]] = match[2];
    }
    if (Object.keys(config).length === 0) {
      throw new Error('Could not parse config. Make sure you paste the full firebaseConfig object.');
    }
    return config;
  }

  return {
    init,
    isConfigured,
    saveConfig,
    clearConfig,
    savePrediction,
    loadAll,
    onUpdate,
    offUpdate,
    migrateFromLocalStorage,
    showSetupBanner
  };
})();
