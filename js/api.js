// F1 Fantasy League Challenge 2026 - API Integration
// Fetches live F1 data from the Jolpica (Ergast successor) API

const F1API = (() => {
  const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
  const SEASON = F1Data.season;
  const CACHE_KEY = 'f1-api-cache';
  const LAST_FETCH_KEY = 'f1-last-fetch';
  const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

  // --- Driver Name Mapping ---

  // Build a lookup from API familyName → F1Data driver key
  // Handles edge cases where multiple drivers share a surname
  // Normalize accented characters for matching
  function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function buildDriverLookup() {
    const lookup = {};
    for (const [key, info] of Object.entries(F1Data.drivers)) {
      const surname = key.replace(/_.*$/, ''); // strip suffixes like '_RB'
      const fullKey = `${info.firstName}|${surname}`;
      lookup[fullKey] = key;
      lookup[normalize(`${info.firstName}|${surname}`)] = key;
      if (!lookup[surname]) lookup[surname] = key;
      if (!lookup[normalize(surname)]) lookup[normalize(surname)] = key;

      // Handle alternate names (accented versions)
      if (info.altName) {
        lookup[info.altName] = key;
        lookup[normalize(info.altName)] = key;
        lookup[`${info.firstName}|${info.altName}`] = key;
        lookup[normalize(`${info.firstName}|${info.altName}`)] = key;
      }
    }
    return lookup;
  }

  const driverLookup = buildDriverLookup();

  function mapDriverName(apiDriver) {
    if (!apiDriver) return null;
    const family = apiDriver.familyName;
    const given = apiDriver.givenName;

    // Try exact first+last match first
    const fullKey = `${given}|${family}`;
    if (driverLookup[fullKey]) return driverLookup[fullKey];

    // Try normalized (accent-stripped) full match
    const normFull = normalize(`${given}|${family}`);
    if (driverLookup[normFull]) return driverLookup[normFull];

    // Fall back to surname-only match
    if (driverLookup[family]) return driverLookup[family];

    // Try normalized surname
    const normFamily = normalize(family);
    if (driverLookup[normFamily]) return driverLookup[normFamily];

    // Try case-insensitive search against F1Data.drivers
    for (const key of Object.keys(F1Data.drivers)) {
      if (key.toLowerCase() === family.toLowerCase()) return key;
      if (normalize(key) === normFamily) return key;
    }

    console.warn(`[F1API] Unknown driver: ${given} ${family}`);
    return null;
  }

  // --- Lap Time Parsing ---

  function parseLapTime(timeStr) {
    if (!timeStr) return null;
    // Format: "1:18.518" or "1:18.518" → 78.518
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
    }
    // If just seconds: "18.518"
    return parseFloat(timeStr) || null;
  }

  // --- Race Index Helpers ---

  // Find the race event index in F1Data.races that matches an API race result
  function findRaceIndex(apiRaceName, round, type) {
    // Try matching by GP name first
    for (let i = 0; i < F1Data.races.length; i++) {
      const race = F1Data.races[i];
      if (race.type !== type) continue;
      // Match by GP name (API uses raceName like "Australian Grand Prix")
      if (apiRaceName && apiRaceName.toLowerCase().includes(race.gp.toLowerCase())) {
        return i;
      }
    }
    // Fall back to sequential round matching
    let count = 0;
    for (let i = 0; i < F1Data.races.length; i++) {
      if (F1Data.races[i].type === type) {
        count++;
        if (count === parseInt(round, 10)) return i;
      }
    }
    return -1;
  }

  // --- Status Indicator ---

  function updateStatus(state, message) {
    const el = document.getElementById('api-status');
    if (!el) return;

    const colors = { live: '#22c55e', cached: '#eab308', error: '#ef4444' };
    const dotColor = colors[state] || colors.cached;

    el.innerHTML =
      `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;` +
      `background:${dotColor};margin-right:6px;vertical-align:middle;"></span>` +
      `<span style="vertical-align:middle;font-size:0.85em;">${message}</span>`;
  }

  function showTimeSinceUpdate() {
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    if (!lastFetch) {
      updateStatus('cached', 'Using cached data');
      return;
    }
    const mins = Math.round((Date.now() - parseInt(lastFetch, 10)) / 60000);
    if (mins < 1) {
      updateStatus('live', 'Live data \u2022 Updated just now');
    } else {
      updateStatus('live', `Live data \u2022 Updated ${mins} minute${mins !== 1 ? 's' : ''} ago`);
    }
  }

  // --- Loading Indicator ---

  function showLoading(show) {
    let loader = document.getElementById('api-loader');
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'api-loader';
        loader.style.cssText =
          'position:fixed;top:0;left:0;width:100%;height:3px;z-index:9999;' +
          'background:linear-gradient(90deg,#e10600,#ff8000,#e10600);' +
          'background-size:200% 100%;animation:f1loader 1.2s ease-in-out infinite;';
        const style = document.createElement('style');
        style.textContent =
          '@keyframes f1loader{0%{background-position:200% 0}100%{background-position:-200% 0}}';
        document.head.appendChild(style);
        document.body.appendChild(loader);
      }
      loader.style.display = 'block';
    } else if (loader) {
      loader.style.display = 'none';
    }
  }

  // --- localStorage Cache ---

  function getCachedData() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setCachedData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_FETCH_KEY, String(Date.now()));
    } catch (e) {
      console.warn('[F1API] Failed to write cache:', e.message);
    }
  }

  function shouldRefresh() {
    const last = localStorage.getItem(LAST_FETCH_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > REFRESH_INTERVAL_MS;
  }

  // --- Fetch Helpers ---

  async function fetchJSON(endpoint) {
    const url = `${BASE_URL}/${SEASON}/${endpoint}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
    return resp.json();
  }

  // --- Core Fetchers ---

  async function fetchRaceResults() {
    const data = await fetchJSON('results.json?limit=1000');
    const races = data?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) return null;

    const results = [];

    for (const race of races) {
      const round = race.round;
      const raceName = race.raceName;
      const eventIndex = findRaceIndex(raceName, round, 'race');
      if (eventIndex === -1) continue;

      const podium = [];
      const finishOrder = [];

      for (const result of race.Results || []) {
        const driverKey = mapDriverName(result.Driver);
        const position = parseInt(result.position, 10);
        const points = parseFloat(result.points) || 0;

        if (driverKey) {
          const status = result.status || 'Finished';
          finishOrder.push({ driver: driverKey, position, points, status });
          if (position >= 1 && position <= 3) {
            podium[position - 1] = driverKey;
          }
        }
      }

      results.push({ eventIndex, round, raceName, podium, finishOrder });
    }

    return results;
  }

  async function fetchQualifyingResults() {
    const data = await fetchJSON('qualifying.json?limit=1000');
    const races = data?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) return null;

    const results = [];

    for (const race of races) {
      const round = race.round;
      const raceName = race.raceName;
      // Qualifying corresponds to the main race event, not sprint
      const eventIndex = findRaceIndex(raceName, round, 'race');
      if (eventIndex === -1) continue;

      let bestTime = null;

      for (const result of race.QualifyingResults || []) {
        const position = parseInt(result.position, 10);
        if (position !== 1) continue;

        // Take best qualifying time: Q3 > Q2 > Q1
        const timeStr = result.Q3 || result.Q2 || result.Q1;
        bestTime = parseLapTime(timeStr);
        break;
      }

      results.push({ eventIndex, round, raceName, poleTime: bestTime });
    }

    return results;
  }

  async function fetchSprintResults() {
    const data = await fetchJSON('sprint.json?limit=1000');
    const races = data?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) return null;

    const results = [];

    for (const race of races) {
      const round = race.round;
      const raceName = race.raceName;
      const eventIndex = findRaceIndex(raceName, round, 'sprint');
      if (eventIndex === -1) continue;

      const podium = [];
      const finishOrder = [];

      for (const result of race.SprintResults || []) {
        const driverKey = mapDriverName(result.Driver);
        const position = parseInt(result.position, 10);
        const points = parseFloat(result.points) || 0;

        if (driverKey) {
          const status = result.status || 'Finished';
          finishOrder.push({ driver: driverKey, position, points, status });
          if (position >= 1 && position <= 3) {
            podium[position - 1] = driverKey;
          }
        }
      }

      results.push({ eventIndex, round, raceName, podium, finishOrder });
    }

    return results;
  }

  async function fetchDriverStandings() {
    const data = await fetchJSON('driverStandings.json');
    const lists = data?.MRData?.StandingsTable?.StandingsLists;
    if (!lists || lists.length === 0) return null;

    const standings = [];
    for (const entry of lists[0].DriverStandings || []) {
      const driverKey = mapDriverName(entry.Driver);
      if (driverKey) {
        standings.push({
          driver: driverKey,
          points: parseFloat(entry.points) || 0
        });
      }
    }

    return standings.length > 0 ? standings : null;
  }

  async function fetchConstructorStandings() {
    const data = await fetchJSON('constructorStandings.json');
    const lists = data?.MRData?.StandingsTable?.StandingsLists;
    if (!lists || lists.length === 0) return null;

    const standings = [];
    for (const entry of lists[0].ConstructorStandings || []) {
      const apiName = entry.Constructor?.name;
      // Match API constructor name to F1Data team names
      const teamKey = Object.keys(F1Data.teams).find(
        t => t.toLowerCase() === (apiName || '').toLowerCase() ||
             (apiName || '').toLowerCase().includes(t.toLowerCase())
      );
      if (teamKey) {
        standings.push({
          team: teamKey,
          points: parseFloat(entry.points) || 0
        });
      }
    }

    return standings.length > 0 ? standings : null;
  }

  // --- Apply Results to F1Data ---

  function applyRaceResults(raceResults) {
    if (!raceResults) return;
    for (const race of raceResults) {
      const idx = race.eventIndex;

      // Skip cancelled or future races
      const raceEvent = F1Data.races[idx];
      if (raceEvent && raceEvent.cancelled) continue;
      if (raceEvent && new Date(raceEvent.date + 'T00:00:00').getTime() > Date.now() + 86400000) continue;

      // Update actual podiums
      if (race.podium.length === 3) {
        F1Data.actualPodiums[idx] = race.podium;
      }

      // Update driver points for each player
      for (const player of F1Data.players) {
        for (const finish of race.finishOrder) {
          if (player.drivers.includes(finish.driver)) {
            if (player.driverPoints[finish.driver]) {
              let value = finish.points;
              if (finish.status) {
                const s = finish.status.toLowerCase();
                if (s === 'did not start' || s === 'did not qualify' || s === 'withdrew') {
                  value = 'DNS';
                } else if (s === 'disqualified') {
                  value = 'DSQ';
                } else if (s !== 'finished' && !s.startsWith('+') && finish.points === 0) {
                  value = 'DNF';
                }
              }
              player.driverPoints[finish.driver][idx] = value;
            }
          }
        }
      }
    }
  }

  function applySprintResults(sprintResults) {
    if (!sprintResults) return;
    for (const sprint of sprintResults) {
      const idx = sprint.eventIndex;

      // Skip cancelled or future races
      const raceEvent = F1Data.races[idx];
      if (raceEvent && raceEvent.cancelled) continue;
      if (raceEvent && new Date(raceEvent.date + 'T00:00:00').getTime() > Date.now() + 86400000) continue;

      if (sprint.podium.length === 3) {
        F1Data.actualPodiums[idx] = sprint.podium;
      }

      for (const player of F1Data.players) {
        for (const finish of sprint.finishOrder) {
          if (player.drivers.includes(finish.driver)) {
            if (player.driverPoints[finish.driver]) {
              let value = finish.points;
              if (finish.status) {
                const s = finish.status.toLowerCase();
                if (s === 'did not start' || s === 'did not qualify' || s === 'withdrew') {
                  value = 'DNS';
                } else if (s === 'disqualified') {
                  value = 'DSQ';
                } else if (s !== 'finished' && !s.startsWith('+') && finish.points === 0) {
                  value = 'DNF';
                }
              }
              player.driverPoints[finish.driver][idx] = value;
            }
          }
        }
      }
    }
  }

  function applyQualifyingResults(qualResults) {
    if (!qualResults) return;
    for (const qual of qualResults) {
      // Skip cancelled or future races
      const raceEvent = F1Data.races[qual.eventIndex];
      if (raceEvent && raceEvent.cancelled) continue;
      if (raceEvent && new Date(raceEvent.date + 'T00:00:00').getTime() > Date.now() + 86400000) continue;

      if (qual.poleTime != null) {
        F1Data.actualPoleTimes[qual.eventIndex] = qual.poleTime;
      }
    }
  }

  function applyDriverStandings(standings) {
    if (!standings) return;
    F1Data.wdc = standings;
  }

  function applyConstructorStandings(standings) {
    if (!standings) return;
    F1Data.wcc = standings;
  }

  // --- Master Update ---

  async function updateFromAPI() {
    showLoading(true);
    updateStatus('cached', 'Fetching live data\u2026');
    let hasNewData = false;

    try {
      const [raceResults, qualResults, sprintResults, wdc, wcc] =
        await Promise.allSettled([
          fetchRaceResults(),
          fetchQualifyingResults(),
          fetchSprintResults(),
          fetchDriverStandings(),
          fetchConstructorStandings()
        ]);

      const getValue = (r) => r.status === 'fulfilled' ? r.value : null;

      const races = getValue(raceResults);
      const quals = getValue(qualResults);
      const sprints = getValue(sprintResults);
      const drivers = getValue(wdc);
      const constructors = getValue(wcc);

      // Log any individual failures
      [raceResults, qualResults, sprintResults, wdc, wcc].forEach((r, i) => {
        if (r.status === 'rejected') {
          const labels = ['races', 'qualifying', 'sprints', 'WDC', 'WCC'];
          console.warn(`[F1API] Failed to fetch ${labels[i]}:`, r.reason?.message);
        }
      });

      if (races || quals || sprints || drivers || constructors) {
        hasNewData = true;
        applyRaceResults(races);
        applyQualifyingResults(quals);
        applySprintResults(sprints);
        applyDriverStandings(drivers);
        applyConstructorStandings(constructors);

        // Save to localStorage cache
        setCachedData({
          races, qualifying: quals, sprint: sprints, wdc: drivers, wcc: constructors,
          lastUpdated: new Date().toISOString()
        });

        showTimeSinceUpdate();
      } else {
        updateStatus('cached', 'No new data available');
      }
    } catch (err) {
      console.error('[F1API] Update failed:', err);
      updateStatus('error', 'API unavailable');
    } finally {
      showLoading(false);
    }

    return hasNewData;
  }

  // --- Restore from Cache ---

  function restoreFromCache() {
    const cached = getCachedData();
    if (!cached) return false;

    try {
      applyRaceResults(cached.races);
      applyQualifyingResults(cached.qualifying);
      applySprintResults(cached.sprint);
      applyDriverStandings(cached.wdc);
      applyConstructorStandings(cached.wcc);
      showTimeSinceUpdate();
      return true;
    } catch (err) {
      console.warn('[F1API] Failed to restore cache:', err);
      return false;
    }
  }

  // --- Auto-update on Page Load ---

  function init(renderCallback) {
    // Show initial status
    showTimeSinceUpdate();

    if (shouldRefresh()) {
      updateFromAPI().then((hasNew) => {
        if (hasNew && typeof renderCallback === 'function') {
          renderCallback();
        }
      });
    } else {
      restoreFromCache();
    }
  }

  // --- Refresh Handler (for "Refresh Data" button) ---

  async function refresh(renderCallback) {
    // Force clear the timer so shouldRefresh returns true
    localStorage.removeItem(LAST_FETCH_KEY);
    const hasNew = await updateFromAPI();
    if (hasNew && typeof renderCallback === 'function') {
      renderCallback();
    }
    return hasNew;
  }

  // --- Public API ---
  return {
    init,
    refresh,
    updateFromAPI,
    fetchRaceResults,
    fetchQualifyingResults,
    fetchSprintResults,
    fetchDriverStandings,
    fetchConstructorStandings,
    mapDriverName,
    shouldRefresh,
    restoreFromCache,
    showTimeSinceUpdate
  };
})();
