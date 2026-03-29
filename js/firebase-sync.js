// F1 Fantasy League Challenge 2026 - Firebase Prediction Sync
// Syncs predictions across all players via Firebase Realtime Database

const FirebaseSync = (() => {
  // ┌─────────────────────────────────────────────────────────────────┐
  // │  FIREBASE CONFIG — Replace with your own Firebase project      │
  // │  See README.md for setup instructions                          │
  // └─────────────────────────────────────────────────────────────────┘
  const FIREBASE_CONFIG = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT.firebaseapp.com",
    databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId:         "YOUR_PROJECT",
    storageBucket:     "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId:             "YOUR_APP_ID"
  };

  const DB_PATH = 'predictions';
  let db = null;
  let initialized = false;

  function isConfigured() {
    return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
           FIREBASE_CONFIG.databaseURL !== "https://YOUR_PROJECT-default-rtdb.firebaseio.com";
  }

  function init() {
    if (initialized) return true;
    if (!isConfigured()) {
      console.warn('[FirebaseSync] Firebase not configured — predictions will only save locally. See README.md for setup.');
      return false;
    }
    try {
      if (typeof firebase === 'undefined') {
        console.warn('[FirebaseSync] Firebase SDK not loaded');
        return false;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
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

  // Migrate localStorage predictions to Firebase (one-time)
  async function migrateFromLocalStorage() {
    if (!init()) return;
    try {
      const raw = localStorage.getItem('f1-predictions');
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (!stored || Object.keys(stored).length === 0) return;

      // Only migrate if Firebase is empty
      const existing = await loadAll();
      if (existing && Object.keys(existing).length > 0) return;

      // Push all local predictions to Firebase
      await db.ref(DB_PATH).set(stored);
      console.log('[FirebaseSync] Migrated localStorage predictions to Firebase');
    } catch (err) {
      console.warn('[FirebaseSync] Migration failed:', err);
    }
  }

  return {
    init,
    isConfigured,
    savePrediction,
    loadAll,
    onUpdate,
    offUpdate,
    migrateFromLocalStorage
  };
})();
