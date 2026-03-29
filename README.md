# 🏎️ F1 Fantasy League Challenge 2026

A live-updating web dashboard for tracking an F1 Fantasy League between 3 players. Built with vanilla HTML/CSS/JS and deployable on GitHub Pages.

![F1 Fantasy League](https://img.shields.io/badge/F1-Fantasy_League-E10600?style=for-the-badge&logo=f1&logoColor=white)

## Features

- **Live Leaderboard** — 3 players ranked by total points with visual progress bars
- **Player Score Cards** — Per-driver points across all 30 events (24 races + 6 sprints)
- **Podium & Pole Predictions** — Track predictions vs actual results with delta display
- **WDC/WCC Standings** — Full World Drivers' and Constructors' Championship tables
- **Auto-updating** — Fetches live race results from the [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/)
- **Prediction Input** — Add/edit predictions via a floating action button modal
- **Dark F1 Theme** — Professional racing dashboard design with team colors
- **Mobile Responsive** — Works on desktop, tablet, and mobile
- **GitHub Action** — Scheduled workflow auto-updates data every 2 hours on race weekends

## Scoring System

| Category | Points |
|----------|--------|
| Driver WDC points | F1 standard (25-18-15-12-10-8-6-4-2-1) |
| Sprint points | F1 sprint (8-7-6-5-4-3-2-1) |
| Podium prediction | 5 pts per correct driver on podium |
| Pole time prediction | 5 pts to closest prediction |
| Joker driver (JKR) | Does not score |

## Players

| Player | Drivers |
|--------|---------|
| **Alonso** | Hadjar, Hamilton, Norris, Russell, Gasly, ~~Piastri (JKR)~~ |
| **Daniel** | Perez, Piastri, Russell, Verstappen, Leclerc, Antonelli |
| **Roger** | Piastri, Hamilton, Verstappen, Russell, Sainz, ~~Norris (JKR)~~ |

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` / `root`
4. Your site will be live at `https://yourusername.github.io/repo-name/`

## Auto-Updates

The GitHub Action (`.github/workflows/update-f1-data.yml`) runs:
- **Every 2 hours** on race weekends (Fri–Sun)
- **Daily at 8 AM UTC** on weekdays
- **On demand** via manual trigger

It fetches the latest F1 data and commits updated results automatically.

## Project Structure

```
f1-fantasy-league/
├── index.html                          # Main page
├── css/
│   └── style.css                       # F1-themed dark styling
├── js/
│   ├── data.js                         # Player data, predictions, race calendar
│   ├── app.js                          # Rendering & interaction logic
│   ├── api.js                          # F1 API integration & caching
│   ├── firebase-sync.js               # Firebase prediction sync (shared storage)
│   └── api-cache.json                  # Cached API responses
├── .github/
│   └── workflows/
│       └── update-f1-data.yml          # Scheduled data update action
└── README.md
```

## Shared Predictions Setup (Firebase)

Predictions entered via the **+** button are shared across all players in real-time using Firebase Realtime Database. Without Firebase configured, predictions only save locally in each browser.

### Quick Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project**
2. Name it (e.g. `f1-fantasy-league`) → disable Google Analytics → **Create Project**
3. In the project dashboard, click the **</>** (Web) icon to add a web app
4. Register the app (any name) → copy the `firebaseConfig` object shown
5. Go to **Build → Realtime Database → Create Database**
6. Choose a location → select **Start in test mode** → **Enable**
7. Open `js/firebase-sync.js` and replace the placeholder config:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",          // from step 4
  authDomain:        "f1-fantasy.firebaseapp.com",
  databaseURL:       "https://f1-fantasy-default-rtdb.firebaseio.com",
  projectId:         "f1-fantasy",
  storageBucket:     "f1-fantasy.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

8. **Set security rules** — in the Firebase Console go to **Realtime Database → Rules** and set:

```json
{
  "rules": {
    "predictions": {
      ".read": true,
      ".write": true
    }
  }
}
```

> ⚠️ Test mode rules expire after 30 days. Use the rules above to keep predictions readable/writable permanently. For a private league, consider adding Firebase Authentication.

9. Deploy your changes to GitHub Pages — predictions will now sync across all players!

### How It Works

- When a player saves a prediction, it's written to both **localStorage** (offline fallback) and **Firebase** (shared)
- On page load, the app loads predictions from Firebase and merges them with local data
- **Real-time sync**: when any player saves a prediction, all other open browsers update automatically
- If Firebase is not configured, the app falls back to localStorage-only mode (current behavior)

## Editing Predictions

**Via the UI:** Click the red **+** button (bottom-right) to open the prediction form. Predictions are automatically synced to all players via Firebase.

**Via code:** Edit `js/data.js` — update the `podiumPredictions` and `polePredictions` arrays for each player.

## Technologies

- Vanilla HTML5, CSS3, JavaScript (no frameworks)
- [Titillium Web](https://fonts.google.com/specimen/Titillium+Web) (F1 font)
- [Font Awesome 6](https://fontawesome.com/) icons
- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) (Ergast successor)
- [Flag CDN](https://flagcdn.com/) for country flags
- GitHub Actions for CI/CD

## License

MIT — For personal/hobby use.
