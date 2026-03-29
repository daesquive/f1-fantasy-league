// F1 Fantasy League Challenge 2026 - Application Logic
// Depends on F1Data from data.js

// ─── Utility Functions ─────────────────────────────────────────────────────────

function formatPoints(val) {
  if (val === null || val === undefined) return '—';
  if (val === 'DNF') return 'DNF';
  if (val === 'DNS') return 'DNS';
  if (val === 'DSQ') return 'DSQ';
  return String(val);
}

// Check if a driver is the joker for a specific race (handles joker swaps)
function isDriverJokerForRace(player, driverName, raceIndex) {
  const race = F1Data.races[raceIndex];
  if (player.jokerSwap) {
    if (race.date < player.jokerSwap.effectiveDate) {
      return driverName === player.joker;
    } else {
      return driverName === player.jokerSwap.newJoker;
    }
  }
  return driverName === player.joker;
}

// Check if a driver is the current/display joker (for row-level labels)
function isCurrentJoker(player, driverName) {
  if (player.jokerSwap) {
    return driverName === player.jokerSwap.newJoker;
  }
  return driverName === player.joker;
}

function getDriverTotal(player, driverName) {
  const pts = player.driverPoints[driverName];
  if (!pts) return 0;
  const exclusions = player.driverExclusions ? (player.driverExclusions[driverName] || []) : [];
  return pts.reduce((sum, v, i) => {
    if (F1Data.races[i] && F1Data.races[i].cancelled) return sum;
    if (exclusions.includes(i)) return sum;
    if (isDriverJokerForRace(player, driverName, i)) return sum;
    if (typeof v === 'number') return sum + v;
    return sum;
  }, 0);
}

// Dynamic podium points: 5 pts per correctly predicted driver on actual podium (any position)
function calculatePodiumPointsForEvent(player, eventIndex) {
  const pred = player.podiumPredictions ? player.podiumPredictions[eventIndex] : null;
  const actual = F1Data.actualPodiums ? F1Data.actualPodiums[eventIndex] : null;
  if (!pred || !actual) return null;
  let points = 0;
  for (const driverName of pred) {
    if (actual.includes(driverName)) points += 5;
  }
  return points;
}

// Dynamic pole points: 5 pts to the player whose prediction is closest to actual pole time
function calculatePolePointsForEvent(playerIndex, eventIndex) {
  const actual = F1Data.actualPoleTimes ? F1Data.actualPoleTimes[eventIndex] : null;
  if (actual == null) return null;
  let closestDiff = Infinity;
  let closestIdx = -1;
  F1Data.players.forEach((p, idx) => {
    const pred = p.polePredictions ? p.polePredictions[eventIndex] : null;
    if (pred == null) return;
    const diff = Math.abs(pred - actual);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIdx = idx;
    }
  });
  return closestIdx === playerIndex ? 5 : 0;
}

function calculatePlayerTotal(player) {
  let total = 0;
  const playerIndex = F1Data.players.indexOf(player);

  // Sum driver points (joker exclusion handled per-race in getDriverTotal)
  for (const driverName of player.drivers) {
    total += getDriverTotal(player, driverName);
  }

  // Sum podium points (dynamically calculated, skip cancelled)
  for (let i = 0; i < F1Data.races.length; i++) {
    if (F1Data.races[i] && F1Data.races[i].cancelled) continue;
    const podVal = calculatePodiumPointsForEvent(player, i);
    if (typeof podVal === 'number') total += podVal;
  }

  // Sum pole points (dynamically calculated, skip cancelled)
  for (let i = 0; i < F1Data.races.length; i++) {
    if (F1Data.races[i] && F1Data.races[i].cancelled) continue;
    const poleVal = calculatePolePointsForEvent(playerIndex, i);
    if (typeof poleVal === 'number') total += poleVal;
  }

  return total;
}

function pointsCellClass(val) {
  if (val === 'DNF') return 'cell-dnf';
  if (val === 'DNS') return 'cell-dns';
  if (val === 'DSQ') return 'cell-dnf';
  if (val === null || val === undefined) return 'cell-null';
  return '';
}

// ─── Leaderboard ────────────────────────────────────────────────────────────────

function renderLeaderboard() {
  const container = document.getElementById('leaderboard');
  if (!container) return;

  const ranked = F1Data.players
    .map(p => ({ ...p, total: calculatePlayerTotal(p) }))
    .sort((a, b) => b.total - a.total);

  const maxScore = Math.max(...ranked.map(r => r.total), 1);

  // Store rankings for player cards to use
  window._playerRankings = {};
  ranked.forEach((p, i) => { window._playerRankings[p.name] = i; });

  // Podium order: 2nd (left), 1st (center, tallest), 3rd (right)
  const podiumOrder = [ranked[1], ranked[0], ranked[2]].filter(Boolean);
  const podiumClasses = ['podium-2nd', 'podium-1st', 'podium-3rd'];
  const podiumLabels = ['2ND', '1ST', '3RD'];
  const trophyIcons = [
    '<i class="fa-solid fa-trophy trophy-silver"></i>',
    '<i class="fa-solid fa-trophy trophy-gold"></i>',
    '<i class="fa-solid fa-trophy trophy-bronze"></i>'
  ];
  const scoreColors = ['#8E8E8E', '#FFD700', '#CD7F32'];

  let html = '<div class="podium-container">';

  podiumOrder.forEach((p, i) => {
    if (!p) return;
    html += `
      <div class="podium-block ${podiumClasses[i]}">
        <div class="podium-player">
          <span class="podium-avatar">${trophyIcons[i]}</span>
          <span class="podium-name">${p.name}</span>
          <span class="podium-score" style="color:${scoreColors[i]}">${p.total}</span>
          <span class="podium-pts-label">pts</span>
        </div>
        <div class="podium-step" style="border-color: ${p.color}">
          <span class="podium-position">${trophyIcons[i]}</span>
          <span class="podium-pos-label">${podiumLabels[i]}</span>
        </div>
      </div>`;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ─── Player Cards ───────────────────────────────────────────────────────────────

function renderPlayerCards() {
  const container = document.getElementById('player-cards');
  if (!container) return;

  let html = '';

  F1Data.players.forEach(player => {
    const total = calculatePlayerTotal(player);
    html += buildPlayerCard(player, total);
  });

  container.innerHTML = html;
}

function buildPlayerCard(player, total) {
  const races = F1Data.races;
  const numEvents = races.length;

  // Header row with event labels (flag image + label)
  let headerCells = '<th class="sticky-col">Driver</th>';
  races.forEach(race => {
    const shortLabel = race.label.replace('Race ', 'R').replace('Sprint ', 'S');
    const sprintClass = race.type === 'sprint' ? ' sprint-col' : '';
    const cancelledClass = race.cancelled ? ' cancelled-col' : '';
    const countryLower = race.country ? race.country.toLowerCase() : '';
    const flagImg = countryLower
      ? `<img src="https://flagcdn.com/w40/${countryLower}.png" alt="${race.code}" class="col-flag">`
      : '🏁';
    const cancelledLabel = race.cancelled ? '<span class="cancelled-label">✕</span>' : '';
    headerCells += `<th class="${sprintClass}${cancelledClass}" title="${race.gp} — ${race.date}${race.cancelled ? ' (CANCELLED)' : ''}"><div class="col-header">${flagImg}<span>${shortLabel}</span>${cancelledLabel}</div></th>`;
  });
  headerCells += '<th class="total-col">Total</th>';

  // Driver rows
  let driverRows = '';
  player.drivers.forEach(driverName => {
    const isFullJoker = !player.jokerSwap && driverName === player.joker;
    const isSwapJoker = player.jokerSwap && isCurrentJoker(player, driverName);
    const teamColor = F1Data.getTeamColor(driverName);
    const driverTotal = isFullJoker ? '—' : getDriverTotal(player, driverName);
    const rowClass = isFullJoker ? 'joker-driver' : '';
    const jkrTag = (isFullJoker || isSwapJoker) ? ' <span class="jkr-tag">(JKR)</span>' : '';

    let cells = `<td class="sticky-col${isSwapJoker ? ' joker-name' : ''}"><span class="team-color-bar" style="background:${teamColor}"></span>${driverName}${jkrTag}</td>`;

    const pts = player.driverPoints[driverName] || [];
    const exclusions = player.driverExclusions ? (player.driverExclusions[driverName] || []) : [];
    for (let i = 0; i < numEvents; i++) {
      const val = i < pts.length ? pts[i] : null;
      const sprintClass = races[i].type === 'sprint' ? ' sprint-col' : '';
      const cancelledClass = races[i].cancelled ? ' cancelled-col' : '';
      const isExcluded = exclusions.includes(i);
      if (isFullJoker || isDriverJokerForRace(player, driverName, i) || isExcluded) {
        const display = val !== null && val !== undefined ? `<s>${formatPoints(val)}</s>` : '—';
        const jokerCellClass = (!isFullJoker && player.jokerSwap) ? ' joker-cell' : '';
        cells += `<td class="cell-null${jokerCellClass}${sprintClass}${cancelledClass}">${display}</td>`;
      } else {
        cells += `<td class="${pointsCellClass(val)}${sprintClass}${cancelledClass}">${formatPoints(val)}</td>`;
      }
    }

    cells += `<td class="total-col">${driverTotal}</td>`;
    driverRows += `<tr class="${rowClass}">${cells}</tr>`;
  });

  // Podium points row (dynamically calculated)
  let podiumCells = '<td class="sticky-col">🏆 Podium</td>';
  let podiumTotal = 0;
  for (let i = 0; i < numEvents; i++) {
    const val = calculatePodiumPointsForEvent(player, i);
    if (typeof val === 'number' && !(races[i].cancelled)) podiumTotal += val;
    const sprintClass = races[i].type === 'sprint' ? ' sprint-col' : '';
    const cancelledClass = races[i].cancelled ? ' cancelled-col' : '';
    podiumCells += `<td class="${pointsCellClass(val)}${sprintClass}${cancelledClass}">${formatPoints(val)}</td>`;
  }
  podiumCells += `<td class="total-col">${podiumTotal}</td>`;

  // Pole points row (dynamically calculated)
  let poleCells = '<td class="sticky-col">⏱️ Pole Time</td>';
  let poleTotal = 0;
  const playerIndex = F1Data.players.indexOf(player);
  for (let i = 0; i < numEvents; i++) {
    const val = calculatePolePointsForEvent(playerIndex, i);
    if (typeof val === 'number' && !(races[i].cancelled)) poleTotal += val;
    const sprintClass = races[i].type === 'sprint' ? ' sprint-col' : '';
    const cancelledClass = races[i].cancelled ? ' cancelled-col' : '';
    poleCells += `<td class="${pointsCellClass(val)}${sprintClass}${cancelledClass}">${formatPoints(val)}</td>`;
  }
  poleCells += `<td class="total-col">${poleTotal}</td>`;

  // Subtotal row
  let subtotalCells = '<td class="sticky-col">Subtotal</td>';
  for (let i = 0; i < numEvents; i++) {
    let eventTotal = 0;
    let hasAny = false;
    player.drivers.forEach(d => {
      if (isDriverJokerForRace(player, d, i)) return;
      const excl = player.driverExclusions ? (player.driverExclusions[d] || []) : [];
      if (excl.includes(i)) return;
      const pts = player.driverPoints[d];
      const val = pts ? pts[i] : null;
      if (typeof val === 'number') { eventTotal += val; hasAny = true; }
    });
    const podVal = calculatePodiumPointsForEvent(player, i);
    if (typeof podVal === 'number') { eventTotal += podVal; hasAny = true; }
    const poleVal = calculatePolePointsForEvent(playerIndex, i);
    if (typeof poleVal === 'number') { eventTotal += poleVal; hasAny = true; }

    const sprintClass = races[i].type === 'sprint' ? ' sprint-col' : '';
    const cancelledClass = races[i].cancelled ? ' cancelled-col' : '';
    subtotalCells += `<td class="subtotal-cell${sprintClass}${cancelledClass}">${hasAny ? eventTotal : '—'}</td>`;
  }
  subtotalCells += `<td class="total-col subtotal-cell">${total}</td>`;

  // Predictions section
  let predictionsHtml = buildPredictionsSection(player);

  // Dynamic rank-based trophy and color for player card
  const rank = window._playerRankings ? window._playerRankings[player.name] : -1;
  const rankTrophies = [
    '<i class="fa-solid fa-trophy trophy-gold"></i>',
    '<i class="fa-solid fa-trophy trophy-silver"></i>',
    '<i class="fa-solid fa-trophy trophy-bronze"></i>'
  ];
  const rankColors = ['#FFD700', '#8E8E8E', '#CD7F32'];
  const trophyIcon = rank >= 0 && rank < 3 ? rankTrophies[rank] : '<i class="fa-solid fa-user"></i>';
  const totalColor = rank >= 0 && rank < 3 ? rankColors[rank] : '#E10600';

  return `
    <div class="player-card" style="border-top: 4px solid ${player.color}">
      <div class="player-card-header">
        <span class="player-card-avatar">${trophyIcon}</span>
        <span class="player-card-name">${player.name}</span>
        <span class="player-card-total" style="color:${totalColor}">${total} pts</span>
      </div>
      <div class="table-scroll-wrapper">
        <table class="points-table">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>
            ${driverRows}
            <tr class="bonus-row">${podiumCells}</tr>
            <tr class="bonus-row">${poleCells}</tr>
            <tr class="subtotal-row">${subtotalCells}</tr>
          </tbody>
        </table>
      </div>
      ${predictionsHtml}
    </div>`;
}

function buildPredictionsSection(player) {
  const races = F1Data.races;
  let podiumHtml = '';
  let poleHtml = '';

  for (let i = 0; i < races.length; i++) {
    const race = races[i];
    const flag = F1Data.getFlag(race.country);
    const shortLabel = race.label.replace('Race ', 'R').replace('Sprint ', 'S');

    // Podium predictions
    const pred = player.podiumPredictions ? player.podiumPredictions[i] : null;
    if (pred) {
      const actual = F1Data.actualPodiums ? F1Data.actualPodiums[i] : null;
      let predItems = pred.map((name, pos) => {
        const posLabel = `P${pos + 1}`;
        const isOnActualPodium = actual && actual.includes(name);
        const teamColor = isOnActualPodium ? F1Data.getTeamColor(name) : '';
        const style = teamColor ? ` style="color:${teamColor}"` : '';
        const correctMark = isOnActualPodium ? ' ✓' : '';
        return `<span class="pred-item"${style}>${posLabel}: ${name}${correctMark}</span>`;
      }).join(', ');

      let actualStr = '';
      if (actual) {
        actualStr = ` <span class="actual-result">| Actual: ${actual.map((n, j) => `P${j + 1}: ${n}`).join(', ')}</span>`;
      }

      podiumHtml += `<div class="prediction-line">${flag} ${shortLabel}: ${predItems}${actualStr}</div>`;
    }

    // Pole time predictions
    const polePred = player.polePredictions ? player.polePredictions[i] : null;
    if (polePred !== null && polePred !== undefined) {
      const formatted = F1Data.formatLapTime(polePred);
      const actualPole = F1Data.actualPoleTimes ? F1Data.actualPoleTimes[i] : null;
      let actualStr = '';
      let isWinner = false;
      if (actualPole !== null && actualPole !== undefined) {
        const diff = Math.abs(polePred - actualPole);
        const pIdx = F1Data.players.indexOf(player);
        isWinner = calculatePolePointsForEvent(pIdx, i) === 5;
        actualStr = ` <span class="actual-result">| Actual: ${F1Data.formatLapTime(actualPole)} (Δ ${diff.toFixed(3)}s)</span>`;
      }
      const winnerClass = isWinner ? ' pole-winner' : '';
      poleHtml += `<div class="prediction-line${winnerClass}">${flag} ${shortLabel}: ${formatted}${actualStr}${isWinner ? ' 🏆' : ''}</div>`;
    }
  }

  if (!podiumHtml && !poleHtml) return '';

  return `
    <div class="predictions-section">
      <h4>📋 Predictions</h4>
      ${podiumHtml ? `<div class="prediction-group"><h5>🏆 Podium Predictions</h5>${podiumHtml}</div>` : ''}
      ${poleHtml ? `<div class="prediction-group"><h5>⏱️ Pole Time Predictions</h5>${poleHtml}</div>` : ''}
    </div>`;
}

// ─── WDC Standings ──────────────────────────────────────────────────────────────

function renderWDC() {
  const container = document.getElementById('wdc-standings');
  if (!container) return;

  const medals = ['🥇', '🥈', '🥉'];
  let rows = '';

  const sortedWdc = [...F1Data.wdc].sort((a, b) => b.points - a.points);
  sortedWdc.forEach((entry, i) => {
    const driverInfo = F1Data.drivers[entry.driver];
    const teamColor = F1Data.getTeamColor(entry.driver);
    const num = driverInfo ? driverInfo.num : '?';
    const countryCode = driverInfo ? driverInfo.country.toLowerCase() : '';
    const flagImg = countryCode
      ? `<img src="https://flagcdn.com/w40/${countryCode}.png" alt="" class="flag">`
      : '';
    const teamName = driverInfo ? driverInfo.team : '—';
    const teamLogo = F1Data.teamLogos[teamName] || '';
    const teamLogoImg = teamLogo ? `<img src="${teamLogo}" alt="${teamName}" class="team-logo-sm" onerror="this.style.display='none'">` : '';
    const medal = medals[i] || '';
    const firstName = driverInfo ? driverInfo.firstName : '';

    rows += `
      <tr style="border-left: 3px solid ${teamColor}">
        <td class="pos-cell">${medal || (i + 1)}</td>
        <td><span class="driver-num-badge" style="background:${teamColor}">${num}</span></td>
        <td>${flagImg}</td>
        <td class="driver-name-cell">${firstName} <strong>${entry.driver}</strong></td>
        <td class="team-cell" style="color:${teamColor}">${teamLogoImg} ${teamName}</td>
        <td class="points-cell"><strong>${entry.points}</strong></td>
      </tr>`;
  });

  container.innerHTML = `
    <table class="standings-table wdc-table">
      <thead>
        <tr>
          <th>Pos</th><th>#</th><th></th><th>Driver</th><th>Team</th><th>Points</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── WCC Standings ──────────────────────────────────────────────────────────────

function renderWCC() {
  const container = document.getElementById('wcc-standings');
  if (!container) return;

  const medals = ['🥇', '🥈', '🥉'];
  let rows = '';

  const sortedWcc = [...F1Data.wcc].sort((a, b) => b.points - a.points);
  sortedWcc.forEach((entry, i) => {
    const teamInfo = F1Data.teams[entry.team];
    const teamColor = teamInfo ? teamInfo.color : '#666';
    const teamLogo = F1Data.teamLogos[entry.team] || '';
    const teamLogoImg = teamLogo ? `<img src="${teamLogo}" alt="${entry.team}" class="team-logo-md" onerror="this.style.display='none'">` : '';
    const medal = medals[i] || '';

    rows += `
      <tr style="border-left: 3px solid ${teamColor}; background: ${teamColor}11">
        <td class="pos-cell">${medal || (i + 1)}</td>
        <td class="team-name-cell" style="color:${teamColor}">${teamLogoImg} ${entry.team}</td>
        <td class="points-cell"><strong>${entry.points}</strong></td>
      </tr>`;
  });

  container.innerHTML = `
    <table class="standings-table wcc-table">
      <thead>
        <tr>
          <th>Pos</th><th>Team</th><th>Points</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── Prediction Modal ───────────────────────────────────────────────────────────

function openPredictionModal() {
  const modal = document.getElementById('prediction-modal');
  if (!modal) return;

  populateModalSelects();
  modal.classList.add('active');
  modal.style.display = 'flex';
}

function closePredictionModal() {
  const modal = document.getElementById('prediction-modal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.style.display = 'none';
}

function populateModalSelects() {
  // Player select
  const playerSelect = document.getElementById('pred-player');
  if (playerSelect) {
    playerSelect.innerHTML = F1Data.players
      .map(p => `<option value="${p.name}">${p.name}</option>`)
      .join('');
  }

  // Race event select
  const raceSelect = document.getElementById('pred-race');
  if (raceSelect) {
    raceSelect.innerHTML = F1Data.races
      .map((r, i) => {
        const flag = F1Data.getFlag(r.country);
        const cancelledText = r.cancelled ? ' [CANCELLED]' : '';
        return `<option value="${i}">${flag} ${r.label} — ${r.gp}${cancelledText}</option>`;
      })
      .join('');
    // Listen for changes to lock/unlock fields
    raceSelect.addEventListener('change', updatePredictionLocks);
  }

  // Driver selects for P1, P2, P3
  const driverNames = Object.keys(F1Data.drivers).sort();
  const driverOptions = driverNames
    .map(d => `<option value="${d}">${d}</option>`)
    .join('');

  ['pred-p1', 'pred-p2', 'pred-p3'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.innerHTML = '<option value="">— Select —</option>' + driverOptions;
  });

  // Apply initial lock state
  updatePredictionLocks();
}

function updatePredictionLocks() {
  const raceSelect = document.getElementById('pred-race');
  if (!raceSelect) return;
  const raceIdx = parseInt(raceSelect.value, 10);
  if (isNaN(raceIdx)) return;

  const race = F1Data.races[raceIdx];
  if (!race) return;

  const now = new Date();
  const raceDate = new Date(race.date + 'T00:00:00');

  // Qualifying typically happens the day before the race (or same day for sprints)
  // Lock pole predictions if qualifying has passed (race date - 1 day for races, same day for sprints)
  const qualDate = new Date(raceDate);
  if (race.type === 'race' && !race.sprintWeekend) {
    qualDate.setDate(qualDate.getDate() - 1); // Qualifying is Saturday (day before Sunday race)
  }

  // Also check if we already have actual results — that's a definitive lock
  const hasActualPole = F1Data.actualPoleTimes && F1Data.actualPoleTimes[raceIdx] != null;
  const hasActualPodium = F1Data.actualPodiums && F1Data.actualPodiums[raceIdx] != null;

  const poleInput = document.getElementById('pred-pole');
  const p1Select = document.getElementById('pred-p1');
  const p2Select = document.getElementById('pred-p2');
  const p3Select = document.getElementById('pred-p3');

  const isCancelled = race.cancelled === true;
  const poleLocked = isCancelled || hasActualPole || now >= qualDate;
  const podiumLocked = isCancelled || hasActualPodium || now >= raceDate;

  const poleLockMsg = isCancelled ? '🚫 Race cancelled' : '🔒 Locked — qualifying has passed';
  const podiumLockMsg = isCancelled ? '🚫 Race cancelled' : '🔒 Locked — race has started';

  // Pole time
  if (poleInput) {
    poleInput.disabled = poleLocked;
    poleInput.parentElement.classList.toggle('field-locked', poleLocked);
    const lockNote = poleInput.parentElement.querySelector('.lock-note');
    if (poleLocked && !lockNote) {
      const note = document.createElement('span');
      note.className = 'lock-note';
      note.textContent = poleLockMsg;
      poleInput.parentElement.appendChild(note);
    } else if (poleLocked && lockNote) {
      lockNote.textContent = poleLockMsg;
    } else if (!poleLocked && lockNote) {
      lockNote.remove();
    }
  }

  // Podium predictions
  [p1Select, p2Select, p3Select].forEach(sel => {
    if (!sel) return;
    sel.disabled = podiumLocked;
    sel.parentElement.classList.toggle('field-locked', podiumLocked);
    const lockNote = sel.parentElement.querySelector('.lock-note');
    if (podiumLocked && !lockNote) {
      const note = document.createElement('span');
      note.className = 'lock-note';
      note.textContent = podiumLockMsg;
      sel.parentElement.appendChild(note);
    } else if (podiumLocked && lockNote) {
      lockNote.textContent = podiumLockMsg;
    } else if (!podiumLocked && lockNote) {
      lockNote.remove();
    }
  });
}

function parseLapTime(str) {
  if (!str || !str.trim()) return null;
  const clean = str.trim();
  // Accept m:ss.sss or ss.sss
  const matchMS = clean.match(/^(\d+):(\d+\.\d+)$/);
  if (matchMS) {
    return parseFloat(matchMS[1]) * 60 + parseFloat(matchMS[2]);
  }
  const matchS = clean.match(/^(\d+\.\d+)$/);
  if (matchS) {
    return parseFloat(matchS[1]);
  }
  return null;
}

function savePrediction() {
  const playerName = document.getElementById('pred-player')?.value;
  const raceIdx = parseInt(document.getElementById('pred-race')?.value, 10);
  const p1 = document.getElementById('pred-p1')?.value || null;
  const p2 = document.getElementById('pred-p2')?.value || null;
  const p3 = document.getElementById('pred-p3')?.value || null;
  const poleTimeStr = document.getElementById('pred-pole')?.value || '';

  if (!playerName || isNaN(raceIdx)) return;

  const poleSeconds = parseLapTime(poleTimeStr);

  // Build prediction entry
  const prediction = {
    player: playerName,
    raceIndex: raceIdx,
    podium: (p1 && p2 && p3) ? [p1, p2, p3] : null,
    poleTime: poleSeconds
  };

  // Save to localStorage (offline fallback)
  let stored = loadPredictions();
  const key = `${playerName}-${raceIdx}`;
  stored[key] = prediction;
  localStorage.setItem('f1-predictions', JSON.stringify(stored));

  // Save to Firebase (shared across all players)
  if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isConfigured()) {
    FirebaseSync.savePrediction(playerName, raceIdx, prediction);
  }

  // Merge with F1Data
  mergePredictions();

  // Re-render
  renderAll();
  closePredictionModal();
}

function loadPredictions() {
  try {
    const raw = localStorage.getItem('f1-predictions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mergePredictions() {
  const stored = loadPredictions();
  mergePredictionsFromData(stored);
}

// Merge prediction data (from localStorage or Firebase) into F1Data
function mergePredictionsFromData(stored) {
  if (!stored) return;

  Object.values(stored).forEach(pred => {
    const player = F1Data.players.find(p => p.name === pred.player);
    if (!player) return;

    const idx = pred.raceIndex;

    if (pred.podium) {
      if (!player.podiumPredictions) {
        player.podiumPredictions = new Array(F1Data.races.length).fill(null);
      }
      player.podiumPredictions[idx] = pred.podium;
    }

    if (pred.poleTime !== null && pred.poleTime !== undefined) {
      if (!player.polePredictions) {
        player.polePredictions = new Array(F1Data.races.length).fill(null);
      }
      player.polePredictions[idx] = pred.poleTime;
    }
  });
}

// ─── F1 News ────────────────────────────────────────────────────────────────────

async function fetchViaProxy(url) {
  const proxies = [
    (u) => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u),
    (u) => 'https://corsproxy.io/?' + encodeURIComponent(u),
    (u) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
  ];

  for (const makeUrl of proxies) {
    try {
      const resp = await fetch(makeUrl(url));
      if (!resp.ok) continue;
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const json = await resp.json();
        return json.contents || json.body || '';
      }
      return await resp.text();
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function renderF1News() {
  const container = document.getElementById('f1-news');
  if (!container) return;

  const CACHE_KEY = 'f1-news-cache';
  const CACHE_TIME_KEY = 'f1-news-cache-time';
  const ONE_DAY = 24 * 60 * 60 * 1000;

  let articles = null;
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < ONE_DAY)) {
    try { articles = JSON.parse(cachedData); } catch (e) { /* ignore */ }
  }

  if (!articles) {
    try {
      // Fetch RSS feed
      const rssText = await fetchViaProxy('https://www.formula1.com/content/fom-website/en/latest/all.xml');
      if (rssText) {
        const rssArticles = parseF1News(rssText);

        // Fetch the /en/latest page to extract article images
        let imageMap = {};
        try {
          const pageHtml = await fetchViaProxy('https://www.formula1.com/en/latest');
          if (pageHtml) {
            imageMap = extractArticleImages(pageHtml);
          }
        } catch (e) {
          console.warn('[News] Could not fetch latest page for images');
        }

        // Match images to articles
        if (rssArticles && rssArticles.length > 0) {
          rssArticles.forEach(article => {
            const urlParts = article.link.split('.');
            const articleId = urlParts[urlParts.length - 1];
            const slugPart = (article.link.split('/').pop() || '').split('.')[0];

            if (imageMap[articleId]) {
              article.image = imageMap[articleId];
            } else if (imageMap[slugPart]) {
              article.image = imageMap[slugPart];
            } else {
              // Try partial matching on any key
              for (const [key, imgUrl] of Object.entries(imageMap)) {
                if (article.link.includes(key)) {
                  article.image = imgUrl;
                  break;
                }
              }
            }
          });

          articles = rssArticles.slice(0, 6);
          localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        }
      }
    } catch (err) {
      console.warn('[News] Failed to fetch F1 news:', err.message);
    }
  }

  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="news-empty">Unable to load latest F1 news. Visit <a href="https://www.formula1.com/en/latest" target="_blank">formula1.com</a> for the latest.</p>';
    return;
  }

  let html = '';
  articles.forEach(article => {
    html += `
      <a href="${article.link}" target="_blank" rel="noopener" class="news-card">
        <div class="news-text">
          <h4 class="news-title">${article.title}</h4>
          <p class="news-caption">${article.description || ''}</p>
        </div>
        ${article.image ? `<img src="${article.image}" alt="" class="news-img" loading="lazy" onerror="this.style.display='none'">` : ''}
      </a>`;
  });

  container.innerHTML = html;
}

function parseF1News(xmlText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    const articles = [];
    items.forEach(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const desc = item.querySelector('description')?.textContent || '';
      if (title && link) {
        articles.push({ title, link, description: desc.substring(0, 200), image: '' });
      }
    });
    return articles;
  } catch {
    return [];
  }
}

function extractArticleImages(htmlText) {
  // Extract image URLs from preload tags and img tags, keyed by nearby article IDs
  const imageMap = {};
  try {
    // Find all preloaded images from media.formula1.com that are article-related
    const preloadMatches = htmlText.matchAll(/href="(https:\/\/media\.formula1\.com\/image\/upload\/[^"]*(?:fom-website|trackside)[^"]*\.webp)"/g);
    const articleImages = [];
    for (const match of preloadMatches) {
      articleImages.push(match[1]);
    }

    // Find all article links with their IDs
    const linkMatches = htmlText.matchAll(/href="\/en\/latest\/article\/([^"]+)\.([A-Za-z0-9]+)"/g);
    const articleIds = [];
    for (const match of linkMatches) {
      const slug = match[1];
      const id = match[2];
      if (!articleIds.some(a => a.id === id)) {
        articleIds.push({ slug, id });
      }
    }

    // Map images to articles sequentially (F1 page typically orders them together)
    articleIds.forEach((article, i) => {
      if (i < articleImages.length) {
        imageMap[article.id] = articleImages[i];
        imageMap[article.slug] = articleImages[i];
      }
    });
  } catch (e) {
    console.warn('[News] Image extraction failed:', e);
  }
  return imageMap;
}

// ─── Live Timing Board ──────────────────────────────────────────────────────────

async function renderLiveTiming() {
  const container = document.getElementById('live-timing');
  if (!container) return;

  let timingData = null;

  // Check cache
  const CACHE_KEY = 'f1-timing-cache';
  const CACHE_TIME_KEY = 'f1-timing-cache-time';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
    try { timingData = JSON.parse(cachedData); } catch (e) { /* ignore */ }
  }

  // Always check if hardcoded data is newer than cache/API
  if (F1Data.latestQualifying && timingData) {
    const lqRound = parseInt(F1Data.latestQualifying.round, 10);
    const curRound = parseInt(timingData.round, 10);
    if (lqRound > curRound) {
      timingData = F1Data.latestQualifying;
      localStorage.setItem(CACHE_KEY, JSON.stringify(timingData));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    }
  }

  if (!timingData) {
    try {
      const resp = await fetch(`https://api.jolpi.ca/ergast/f1/${F1Data.season}/qualifying.json?limit=1000`);
      if (resp.ok) {
        const data = await resp.json();
        const races = data?.MRData?.RaceTable?.Races;
        if (races && races.length > 0) {
          // Find latest race that has actual qualifying times
          let targetRace = null;
          for (let ri = races.length - 1; ri >= 0; ri--) {
            const qr = races[ri].QualifyingResults || [];
            const hasTime = qr.some(r => r.Q3 || r.Q2 || r.Q1);
            if (hasTime) { targetRace = races[ri]; break; }
          }
          if (!targetRace) targetRace = races[races.length - 1];
          const results = targetRace.QualifyingResults || [];
          timingData = {
            sessionName: targetRace.raceName || 'Qualifying',
            round: targetRace.round,
            entries: results.map(r => {
              const bestTime = r.Q3 || r.Q2 || r.Q1 || '';
              return {
                pos: parseInt(r.position, 10),
                code: r.Driver?.code || '???',
                familyName: r.Driver?.familyName || '',
                constructorName: r.Constructor?.name || '',
                time: bestTime
              };
            })
          };
        }
      }
    } catch (e) {
      console.warn('[Timing] Could not fetch qualifying data:', e.message);
    }
  }

  // Use hardcoded latestQualifying if it's newer than what the API returned
  if (F1Data.latestQualifying) {
    const lq = F1Data.latestQualifying;
    const lqRound = parseInt(lq.round, 10);
    const apiRound = timingData ? parseInt(timingData.round, 10) : 0;
    if (lqRound > apiRound || (lqRound === apiRound && timingData && timingData.entries.every(e => !e.time))) {
      timingData = lq;
    }
  }

  // Cache the result
  if (timingData) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(timingData));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  }

  // Build entries from qualifying data or fall back to WDC
  let entries = [];
  let sessionLabel = 'STANDINGS';

  if (timingData && timingData.entries.length > 0) {
    entries = timingData.entries;
    sessionLabel = (timingData.sessionName || '').replace(' Grand Prix', ' GP') + ' — LATEST QUALIFYING TIMES';
  } else {
    const sortedWdc = [...F1Data.wdc].sort((a, b) => b.points - a.points);
    entries = sortedWdc.map((entry, i) => {
      const info = F1Data.drivers[entry.driver];
      return {
        pos: i + 1,
        code: info ? info.code : '???',
        familyName: entry.driver,
        constructorName: info ? info.team : '',
        time: `${entry.points} pts`
      };
    });
  }

  // Parse leader time for gap calculations
  const leaderSeconds = entries.length > 0 ? parseLapTime(entries[0].time) : null;

  // Render 2-column grid
  let gridItems = '';
  entries.forEach((e) => {
    // Map constructor name to team color
    const teamKey = Object.keys(F1Data.teams).find(
      t => t.toLowerCase() === (e.constructorName || '').toLowerCase() ||
           (e.constructorName || '').toLowerCase().includes(t.toLowerCase()) ||
           t.toLowerCase().includes((e.constructorName || '').toLowerCase())
    );
    const teamColor = teamKey ? F1Data.teams[teamKey].color : '#555';
    const posClass = e.pos <= 3 ? ' timing-top3' : '';

    // Calculate gap
    let gap = '';
    if (e.pos > 1 && leaderSeconds) {
      const thisSeconds = parseLapTime(e.time);
      if (thisSeconds) {
        gap = '+' + (thisSeconds - leaderSeconds).toFixed(3);
      }
    }

    gridItems += `
      <div class="timing-item${posClass}">
        <span class="timing-pos">${e.pos}</span>
        <span class="timing-color-bar" style="background:${teamColor}"></span>
        <span class="timing-code">${e.code}</span>
        <span class="timing-time">${e.time || '—'}</span>
        <span class="timing-gap">${gap}</span>
      </div>`;
  });

  const now = new Date();
  const nextRace = F1Data.races.find(r => {
    if (r.cancelled) return false;
    if (r.type !== 'race') return false; // Qualifying is for races, not sprints
    // Skip if we already have actual qualifying results for this event
    const idx = F1Data.races.indexOf(r);
    if (F1Data.actualPoleTimes && F1Data.actualPoleTimes[idx] != null) return false;
    return new Date(r.date) > now;
  });
  const nextLabel = nextRace ? `Next: ${nextRace.gp} — ${nextRace.date}` : '';

  container.innerHTML = `
    <div class="timing-header">
      <span class="timing-title">${sessionLabel}</span>
      <span class="timing-session">${nextLabel}</span>
    </div>
    <div class="timing-scroll">
      <div class="timing-grid">${gridItems}</div>
    </div>`;
}

// ─── F1 YouTube Video ───────────────────────────────────────────────────────────

async function renderF1Video() {
  const container = document.getElementById('f1-video');
  if (!container) return;

  const CACHE_KEY = 'f1-video-cache';
  const CACHE_TIME_KEY = 'f1-video-cache-time';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  let videoId = null;
  let videoTitle = '';

  // Check cache
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
    try {
      const cached = JSON.parse(cachedData);
      videoId = cached.videoId;
      videoTitle = cached.title || '';
    } catch (e) { /* ignore */ }
  }

  // Attempt 1: YouTube RSS feed for @F1Gamer via CORS proxy
  if (!videoId) {
    const F1GAMER_CHANNEL_ID = 'UCEZB-L3YDFrOSbyAnYHJYCQ';
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${F1GAMER_CHANNEL_ID}`;
    try {
      const rssText = await fetchViaProxy(rssUrl);
      if (rssText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rssText, 'text/xml');
        const entries = doc.querySelectorAll('entry');
        for (const entry of entries) {
          const titleEl = entry.querySelector('title');
          const vidIdEl = entry.querySelector('yt\\:videoId, videoId');
          const title = titleEl ? titleEl.textContent : '';
          if (!vidIdEl) continue;
          videoId = vidIdEl.textContent;
          videoTitle = title;
          break;
        }
      }
    } catch (e) {
      console.warn('[Video] RSS fetch failed:', e.message);
    }
  }

  // Attempt 2: Scrape @F1Gamer YouTube videos page via proxy
  if (!videoId) {
    try {
      const pageHtml = await fetchViaProxy('https://www.youtube.com/@F1Gamer/videos');
      if (pageHtml) {
        const idMatches = [...pageHtml.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)];
        const titleMatches = [...pageHtml.matchAll(/"title":\{"runs":\[\{"text":"([^"]+)"/g)];
        const seen = new Set();
        for (let k = 0; k < idMatches.length && k < titleMatches.length; k++) {
          const vid = idMatches[k][1];
          const title = titleMatches[k] ? titleMatches[k][1] : '';
          if (seen.has(vid)) continue;
          seen.add(vid);
          videoId = vid;
          videoTitle = title;
          break;
        }
      }
    } catch (e) {
      console.warn('[Video] Channel page fetch failed:', e.message);
    }
  }

  // Cache the result
  if (videoId) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ videoId, title: videoTitle }));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  }

  // Render
  if (videoId) {
    container.innerHTML = `
      <div class="video-embed">
        <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          frameborder="0" allowfullscreen loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe>
      </div>
      ${videoTitle ? `<p class="video-title">${videoTitle}</p>` : ''}`;
  } else {
    // Fallback: show a link card to F1Gamer YouTube channel
    container.innerHTML = `
      <a href="https://www.youtube.com/@F1Gamer/videos" target="_blank" rel="noopener" class="video-fallback-card">
        <i class="fa-brands fa-youtube" style="font-size:3rem;color:#E10600"></i>
        <p>Watch the latest F1 videos</p>
        <span class="video-fallback-link">Open F1Gamer YouTube Channel →</span>
      </a>`;
  }
}

// ─── Initialization ─────────────────────────────────────────────────────────────

function renderAll() {
  renderLeaderboard();
  renderLiveTiming();
  renderPlayerCards();
  renderWDC();
  renderWCC();
  renderF1News();
  renderF1Video();
}

// ─── Race Countdown Timer ───────────────────────────────────────────────────────

function startRaceCountdown() {
  const container = document.getElementById('race-countdown');
  if (!container) return;

  // Compare by date only (ignore time of day)
  const now = new Date();
  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  // Find today's event (if any) and the next future event
  const todayEvent = F1Data.races.find(r => !r.cancelled && r.date === todayStr);
  const nextEvent = F1Data.races.find(r => !r.cancelled && r.date > todayStr);

  // Show "Race Day!" for today, then countdown to next event
  if (!todayEvent && !nextEvent) {
    container.innerHTML = '';
    return;
  }

  if (todayEvent && !nextEvent) {
    const flag = F1Data.getFlag ? F1Data.getFlag(todayEvent.country) : '';
    const typeLabel = todayEvent.type === 'sprint' ? 'Sprint' : 'Race';
    container.innerHTML = `<span class="countdown-label">${typeLabel}</span>` +
      `<span class="countdown-location">${flag} ${todayEvent.gp}</span>` +
      `<span style="color:#22c55e;font-weight:600;">Race Day! 🏁</span>`;
    return;
  }

  const countdownTarget = nextEvent;
  const flag = F1Data.getFlag ? F1Data.getFlag(countdownTarget.country) : '';
  const typeLabel = countdownTarget.type === 'sprint' ? 'Sprint' : 'Race';
  const targetDate = new Date(countdownTarget.date + 'T00:00:00');

  // If there's also a race today, show both
  const todayHtml = todayEvent ? (() => {
    const tf = F1Data.getFlag ? F1Data.getFlag(todayEvent.country) : '';
    const tl = todayEvent.type === 'sprint' ? 'Sprint' : 'Race';
    return `<span class="countdown-label">${tl}</span>` +
      `<span class="countdown-location">${tf} ${todayEvent.gp}</span>` +
      `<span style="color:#22c55e;font-weight:600;">Race Day! 🏁</span>` +
      `<span style="color:#444;margin:0 0.3rem;">|</span>`;
  })() : '';

  function update() {
    const diff = targetDate - Date.now();
    if (diff <= 0) {
      container.innerHTML = `<span class="countdown-label">${typeLabel}</span>` +
        `<span class="countdown-location">${flag} ${countdownTarget.gp}</span>` +
        `<span style="color:#22c55e;font-weight:600;">Race Day! 🏁</span>`;
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    container.innerHTML = todayHtml +
      `<span class="countdown-label">${typeLabel}</span>` +
      `<span class="countdown-location">${flag} ${countdownTarget.gp}</span>` +
      `<span class="countdown-digits">` +
        `<span class="countdown-unit"><span class="countdown-val">${String(days).padStart(2,'0')}</span><span class="countdown-lbl">Days</span></span>` +
        `<span class="countdown-sep">:</span>` +
        `<span class="countdown-unit"><span class="countdown-val">${String(hrs).padStart(2,'0')}</span><span class="countdown-lbl">Hrs</span></span>` +
        `<span class="countdown-sep">:</span>` +
        `<span class="countdown-unit"><span class="countdown-val">${String(mins).padStart(2,'0')}</span><span class="countdown-lbl">Min</span></span>` +
        `<span class="countdown-sep">:</span>` +
        `<span class="countdown-unit"><span class="countdown-val">${String(secs).padStart(2,'0')}</span><span class="countdown-lbl">Sec</span></span>` +
      `</span>`;
  }

  update();
  setInterval(update, 1000);
}

function init() {
  // Load and merge localStorage predictions (immediate, offline-first)
  mergePredictions();

  // Render all sections
  renderAll();

  // Start countdown timer
  startRaceCountdown();

  // Initialize Firebase sync: load shared predictions and listen for real-time updates
  if (typeof FirebaseSync !== 'undefined') {
    if (FirebaseSync.isConfigured()) {
      // Migrate any local-only predictions to Firebase (one-time)
      FirebaseSync.migrateFromLocalStorage();

      // Listen for real-time prediction updates from all players
      FirebaseSync.onUpdate((allPredictions) => {
        // Merge Firebase data into localStorage for offline fallback
        try {
          const local = loadPredictions();
          const merged = Object.assign({}, local, allPredictions);
          localStorage.setItem('f1-predictions', JSON.stringify(merged));
        } catch (e) { /* ignore */ }

        // Re-merge and re-render with shared predictions
        mergePredictionsFromData(allPredictions);
        renderAll();
      });
    } else {
      // Show setup banner prompting admin to connect Firebase
      FirebaseSync.showSetupBanner();
    }
  }

  // FAB button for adding predictions
  const fab = document.getElementById('prediction-fab');
  if (fab) {
    fab.addEventListener('click', openPredictionModal);
  }

  // Modal close button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePredictionModal);
  }

  // Modal overlay click to close
  const modal = document.getElementById('prediction-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePredictionModal();
    });
  }

  // Prediction form submit
  const form = document.getElementById('prediction-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      savePrediction();
    });
  }

  // Save button (if outside form)
  const saveBtn = document.getElementById('pred-save');
  if (saveBtn && !form) {
    saveBtn.addEventListener('click', savePrediction);
  }

  // Cancel button
  const cancelBtn = document.getElementById('pred-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closePredictionModal);
  }

  // Initialize F1 API (auto-fetches if stale, re-renders on new data)
  if (typeof F1API !== 'undefined') {
    F1API.init(renderAll);

    // Refresh button handler
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => F1API.refresh(renderAll));
    }
  }

  // Auto-refresh every 5 minutes
  setInterval(() => {
    if (typeof F1API !== 'undefined' && F1API.shouldRefresh()) {
      F1API.updateFromAPI().then(hasNew => { if (hasNew) renderAll(); });
    }
  }, 5 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
