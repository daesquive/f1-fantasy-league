// F1 Fantasy League Challenge 2026 - Data
const F1Data = {
  season: 2026,
  
  // Team info with colors
  teams: {
    'Mercedes':      { color: '#27F4D2', secondColor: '#00A19C', logo: 'mercedes' },
    'Ferrari':       { color: '#E8002D', secondColor: '#FF2800', logo: 'ferrari' },
    'McLaren':       { color: '#FF8000', secondColor: '#FF8700', logo: 'mclaren' },
    'Red Bull':      { color: '#3671C6', secondColor: '#1B3C73', logo: 'redbull' },
    'Aston Martin':  { color: '#229971', secondColor: '#006F62', logo: 'astonmartin' },
    'Alpine':        { color: '#0093CC', secondColor: '#2293D1', logo: 'alpine' },
    'Williams':      { color: '#64C4FF', secondColor: '#005AFF', logo: 'williams' },
    'Racing Bulls':  { color: '#6692FF', secondColor: '#2B4562', logo: 'racingbulls' },
    'Haas':          { color: '#B6BABD', secondColor: '#B6BABD', logo: 'haas' },
    'Audi':          { color: '#9EA0A3', secondColor: '#7C7E80', logo: 'audi' },
    'Cadillac':      { color: '#4A4D51', secondColor: '#1E1E1E', logo: 'cadillac' }
  },

  // All drivers with their numbers, teams, and 3-letter codes
  drivers: {
    'Russell':    { num: 63, code: 'RUS', team: 'Mercedes', firstName: 'George', country: 'GB' },
    'Antonelli':  { num: 12, code: 'ANT', team: 'Mercedes', firstName: 'Kimi', country: 'IT' },
    'Leclerc':    { num: 16, code: 'LEC', team: 'Ferrari', firstName: 'Charles', country: 'MC' },
    'Hamilton':   { num: 44, code: 'HAM', team: 'Ferrari', firstName: 'Lewis', country: 'GB' },
    'Norris':     { num: 1,  code: 'NOR', team: 'McLaren', firstName: 'Lando', country: 'GB' },
    'Piastri':    { num: 81, code: 'PIA', team: 'McLaren', firstName: 'Oscar', country: 'AU' },
    'Verstappen': { num: 3,  code: 'VER', team: 'Red Bull', firstName: 'Max', country: 'NL' },
    'Hadjar':     { num: 6,  code: 'HAD', team: 'Red Bull', firstName: 'Isack', country: 'FR' },
    'Alonso':     { num: 14, code: 'ALO', team: 'Aston Martin', firstName: 'Fernando', country: 'ES' },
    'Stroll':     { num: 18, code: 'STR', team: 'Aston Martin', firstName: 'Lance', country: 'CA' },
    'Colapinto':  { num: 43, code: 'COL', team: 'Alpine', firstName: 'Franco', country: 'AR' },
    'Gasly':      { num: 10, code: 'GAS', team: 'Alpine', firstName: 'Pierre', country: 'FR' },
    'Albon':      { num: 23, code: 'ALB', team: 'Williams', firstName: 'Alexander', country: 'TH' },
    'Sainz':      { num: 55, code: 'SAI', team: 'Williams', firstName: 'Carlos', country: 'ES' },
    'Lindblad':   { num: 41, code: 'LIN', team: 'Racing Bulls', firstName: 'Arvid', country: 'GB' },
    'Lawson':     { num: 22, code: 'LAW', team: 'Racing Bulls', firstName: 'Liam', country: 'NZ' },
    'Ocon':       { num: 31, code: 'OCO', team: 'Haas', firstName: 'Esteban', country: 'FR' },
    'Bearman':    { num: 87, code: 'BEA', team: 'Haas', firstName: 'Oliver', country: 'GB' },
    'Hulkenberg': { num: 27, code: 'HUL', team: 'Audi', firstName: 'Nico', country: 'DE', altName: 'Hülkenberg' },
    'Bortoleto':  { num: 5,  code: 'BOR', team: 'Audi', firstName: 'Gabriel', country: 'BR' },
    'Perez':      { num: 11, code: 'PER', team: 'Cadillac', firstName: 'Sergio', country: 'MX', altName: 'Pérez' },
    'Bottas':     { num: 77, code: 'BOT', team: 'Cadillac', firstName: 'Valtteri', country: 'FI' }
  },

  // Race calendar - events in order
  races: [
    { id: 'R01', label: 'Race 1',    gp: 'Australia',     code: 'AUS', country: 'AU', circuit: 'Albert Park',           type: 'race',   sprintWeekend: false, date: '2026-03-08' },
    { id: 'S01', label: 'Sprint 1',  gp: 'China',         code: 'CHN', country: 'CN', circuit: 'Shanghai',              type: 'sprint', sprintWeekend: true,  date: '2026-03-14' },
    { id: 'R02', label: 'Race 2',    gp: 'China',         code: 'CHN', country: 'CN', circuit: 'Shanghai',              type: 'race',   sprintWeekend: true,  date: '2026-03-15' },
    { id: 'R03', label: 'Race 3',    gp: 'Japan',         code: 'JPN', country: 'JP', circuit: 'Suzuka',                type: 'race',   sprintWeekend: false, date: '2026-03-29' },
    { id: 'R04', label: 'Race 4',    gp: 'Bahrain',       code: 'BRN', country: 'BH', circuit: 'Sakhir',                type: 'race',   sprintWeekend: false, date: '2026-04-13', cancelled: true },
    { id: 'R05', label: 'Race 5',    gp: 'Saudi Arabia',  code: 'SAU', country: 'SA', circuit: 'Jeddah',                type: 'race',   sprintWeekend: false, date: '2026-04-20', cancelled: true },
    { id: 'S02', label: 'Sprint 2',  gp: 'Miami',         code: 'MIA', country: 'US', circuit: 'Miami Gardens',         type: 'sprint', sprintWeekend: true,  date: '2026-05-02', startTimeUTC: '2026-05-02T16:00:00Z' },
    { id: 'R06', label: 'Race 6',    gp: 'Miami',         code: 'MIA', country: 'US', circuit: 'Miami Gardens',         type: 'race',   sprintWeekend: true,  date: '2026-05-03', startTimeUTC: '2026-05-03T20:00:00Z' },
    { id: 'S03', label: 'Sprint 3',  gp: 'Canada',        code: 'CAN', country: 'CA', circuit: 'Montreal',              type: 'sprint', sprintWeekend: true,  date: '2026-05-23' },
    { id: 'R07', label: 'Race 7',    gp: 'Canada',        code: 'CAN', country: 'CA', circuit: 'Montreal',              type: 'race',   sprintWeekend: true,  date: '2026-05-24' },
    { id: 'R08', label: 'Race 8',    gp: 'Monaco',        code: 'MON', country: 'MC', circuit: 'Circuit de Monaco',     type: 'race',   sprintWeekend: false, date: '2026-06-07' },
    { id: 'R09', label: 'Race 9',    gp: 'Barcelona',     code: 'ESP', country: 'ES', circuit: 'Circuit de Barcelona',  type: 'race',   sprintWeekend: false, date: '2026-06-14' },
    { id: 'R10', label: 'Race 10',   gp: 'Austria',       code: 'AUT', country: 'AT', circuit: 'Red Bull Ring',         type: 'race',   sprintWeekend: false, date: '2026-06-28' },
    { id: 'S04', label: 'Sprint 4',  gp: 'British',       code: 'GBR', country: 'GB', circuit: 'Silverstone',           type: 'sprint', sprintWeekend: true,  date: '2026-07-04' },
    { id: 'R11', label: 'Race 11',   gp: 'British',       code: 'GBR', country: 'GB', circuit: 'Silverstone',           type: 'race',   sprintWeekend: true,  date: '2026-07-05' },
    { id: 'R12', label: 'Race 12',   gp: 'Belgium',       code: 'BEL', country: 'BE', circuit: 'Spa-Francorchamps',     type: 'race',   sprintWeekend: false, date: '2026-07-19' },
    { id: 'R13', label: 'Race 13',   gp: 'Hungary',       code: 'HUN', country: 'HU', circuit: 'Hungaroring',           type: 'race',   sprintWeekend: false, date: '2026-07-26' },
    { id: 'S05', label: 'Sprint 5',  gp: 'Dutch',         code: 'NED', country: 'NL', circuit: 'Zandvoort',             type: 'sprint', sprintWeekend: true,  date: '2026-08-22' },
    { id: 'R14', label: 'Race 14',   gp: 'Dutch',         code: 'NED', country: 'NL', circuit: 'Zandvoort',             type: 'race',   sprintWeekend: true,  date: '2026-08-23' },
    { id: 'R15', label: 'Race 15',   gp: 'Italy',         code: 'ITA', country: 'IT', circuit: 'Monza',                 type: 'race',   sprintWeekend: false, date: '2026-09-06' },
    { id: 'R16', label: 'Race 16',   gp: 'Spain',         code: 'MAD', country: 'ES', circuit: 'Madrid Street Circuit', type: 'race',   sprintWeekend: false, date: '2026-09-13' },
    { id: 'R17', label: 'Race 17',   gp: 'Azerbaijan',    code: 'AZB', country: 'AZ', circuit: 'Baku',                  type: 'race',   sprintWeekend: false, date: '2026-09-26' },
    { id: 'S06', label: 'Sprint 6',  gp: 'Singapore',     code: 'SIN', country: 'SG', circuit: 'Marina Bay',            type: 'sprint', sprintWeekend: true,  date: '2026-10-10' },
    { id: 'R18', label: 'Race 18',   gp: 'Singapore',     code: 'SIN', country: 'SG', circuit: 'Marina Bay',            type: 'race',   sprintWeekend: true,  date: '2026-10-11' },
    { id: 'R19', label: 'Race 19',   gp: 'United States', code: 'USA', country: 'US', circuit: 'COTA',                  type: 'race',   sprintWeekend: false, date: '2026-10-25' },
    { id: 'R20', label: 'Race 20',   gp: 'Mexico',        code: 'MEX', country: 'MX', circuit: 'Hermanos Rodriguez',    type: 'race',   sprintWeekend: false, date: '2026-11-01' },
    { id: 'R21', label: 'Race 21',   gp: 'Brazil',        code: 'BRA', country: 'BR', circuit: 'Interlagos',            type: 'race',   sprintWeekend: false, date: '2026-11-08' },
    { id: 'R22', label: 'Race 22',   gp: 'Las Vegas',     code: 'LAS', country: 'US', circuit: 'Las Vegas Strip',       type: 'race',   sprintWeekend: false, date: '2026-11-22' },
    { id: 'R23', label: 'Race 23',   gp: 'Qatar',         code: 'QAT', country: 'QA', circuit: 'Lusail',                type: 'race',   sprintWeekend: false, date: '2026-11-29' },
    { id: 'R24', label: 'Race 24',   gp: 'Abu Dhabi',     code: 'ARE', country: 'AE', circuit: 'Yas Marina',            type: 'race',   sprintWeekend: false, date: '2026-12-06' }
  ],

  // Player data
  players: [
    {
      name: 'Alonso',
      avatar: '🏎️',
      color: '#E8002D',
      drivers: ['Hadjar', 'Hamilton', 'Norris', 'Russell', 'Gasly', 'Piastri'],
      joker: 'Piastri',
      jokerSwap: { newJoker: 'Gasly', effectiveDate: '2026-03-29' },
      // Points per event (index matches races array)
      driverPoints: {
        'Hadjar':   ['DNF', 0, 4, 0, null, null, 0, 0, 0, 10, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Hamilton': [12, 6, 15, 8, null, null, 2, 8, 3, 18, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Norris':   [10, 5, 'DNS', 10, null, null, 8, 18, 7, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Russell':  [25, 8, 18, 12, null, null, 5, 12, 8, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Gasly':    [1, 0, 8, 6, null, null, 1, 0, 0, 4, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Piastri':  [null, 3, null, 18, null, null, 7, 15, 5, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      },
      podiumPoints: [10, 10, 10, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      polePoints:   [0, 0, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // Podium predictions per event [P1, P2, P3]
      podiumPredictions: [
        ['Piastri', 'Russell', 'Leclerc'],
        ['Russell', 'Piastri', 'Leclerc'],
        ['Russell', 'Leclerc', 'Antonelli'],
        null, null, null, ['Russell', 'Antonelli', 'Piastri'], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
      ],
      // Pole time predictions in seconds (mm:ss.sss → total seconds)
      polePredictions: [76.800, 93.400, 90.900, 87.271, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    },
    {
      name: 'Daniel',
      avatar: '🏁',
      color: '#3671C6',
      drivers: ['Perez', 'Piastri', 'Russell', 'Verstappen', 'Leclerc', 'Antonelli'],
      joker: 'Perez',
      // Drivers excluded from specific race indices (not picked for that race)
      driverExclusions: { 'Antonelli': [0] },
      driverPoints: {
        'Perez':      [0, null, null, 0, null, null, 0, 0, 0, 'DNF', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Piastri':    ['DNF', 3, 'DNS', 18, null, null, 7, 15, 5, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Russell':    [25, 8, 18, 12, null, null, 5, 12, 8, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Verstappen': [8, 0, 0, 4, null, null, 4, 10, 2, 15, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Leclerc':    [15, 7, 12, 15, null, null, 6, 4, 4, 12, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Antonelli':  [null, 4, 25, 25, null, null, 3, 25, 6, 25, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      },
      podiumPoints: [5, 10, 10, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      polePoints:   [5, 5, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      podiumPredictions: [
        ['Russell', 'Piastri', 'Verstappen'],
        ['Verstappen', 'Russell', 'Leclerc'],
        ['Russell', 'Leclerc', 'Antonelli'],
        null, null, null, ['Antonelli', 'Norris', 'Leclerc'], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
      ],
      polePredictions: [78.720, 92.723, 91.237, 87.27, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    },
    {
      name: 'Roger',
      avatar: '🏆',
      color: '#FF8000',
      drivers: ['Piastri', 'Hamilton', 'Verstappen', 'Russell', 'Sainz', 'Norris'],
      joker: 'Norris',
      jokerSwap: { newJoker: 'Sainz', effectiveDate: '2026-05-03' },
      driverPoints: {
        'Piastri':    ['DNF', 3, 'DNS', 18, null, null, 7, 15, 5, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Hamilton':   [12, 6, 15, 8, null, null, 2, 8, 3, 18, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Verstappen': [8, 0, 0, 4, null, null, 4, 10, 2, 15, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Russell':    [25, 8, 18, 12, null, null, 5, 12, 8, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Sainz':      [0, 0, 2, 0, null, null, 0, 0, 0, 2, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        'Norris':     [null, null, null, 10, null, null, 8, 18, 7, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      },
      podiumPoints: [10, 10, 10, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      polePoints:   [0, 0, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      podiumPredictions: [
        ['Russell', 'Verstappen', 'Leclerc'],
        ['Russell', 'Hamilton', 'Piastri'],
        ['Russell', 'Antonelli', 'Leclerc'],
        null, null, null, ['Norris', 'Piastri', 'Antonelli'], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
      ],
      polePredictions: [78.300, 93.228, 90.108, 87.7, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    }
  ],

  // Actual race results - actual pole times in seconds
  actualPoleTimes: [78.518, 91.520, 92.064, 88.778, null, null, 87.869, 87.798, null, 72.578, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],

  // Latest qualifying results (fallback when Jolpica API lags behind)
  latestQualifying: {
    sessionName: 'Miami Grand Prix Sprint Qualifying',
    round: '4',
    entries: [
      { pos: 1,  code: 'NOR', familyName: 'Norris',      constructorName: 'McLaren',      time: '1:27.869' },
      { pos: 2,  code: 'ANT', familyName: 'Antonelli',    constructorName: 'Mercedes',     time: '1:28.091' },
      { pos: 3,  code: 'PIA', familyName: 'Piastri',      constructorName: 'McLaren',      time: '1:28.108' },
      { pos: 4,  code: 'LEC', familyName: 'Leclerc',      constructorName: 'Ferrari',      time: '1:28.239' },
      { pos: 5,  code: 'VER', familyName: 'Verstappen',   constructorName: 'Red Bull',     time: '1:28.461' },
      { pos: 6,  code: 'RUS', familyName: 'Russell',      constructorName: 'Mercedes',     time: '1:28.493' },
      { pos: 7,  code: 'HAM', familyName: 'Hamilton',     constructorName: 'Ferrari',      time: '1:28.618' },
      { pos: 8,  code: 'COL', familyName: 'Colapinto',    constructorName: 'Alpine',       time: '1:29.320' },
      { pos: 9,  code: 'HAD', familyName: 'Hadjar',       constructorName: 'Red Bull',     time: '1:29.422' },
      { pos: 10, code: 'GAS', familyName: 'Gasly',        constructorName: 'Alpine',       time: '1:29.474' },
      { pos: 11, code: 'BOR', familyName: 'Bortoleto',    constructorName: 'Audi',         time: '1:29.994' },
      { pos: 12, code: 'HUL', familyName: 'Hulkenberg',   constructorName: 'Audi',         time: '1:30.019' },
      { pos: 13, code: 'BEA', familyName: 'Bearman',      constructorName: 'Haas',         time: '1:30.116' },
      { pos: 14, code: 'ALB', familyName: 'Albon',        constructorName: 'Williams',     time: '1:30.216' },
      { pos: 15, code: 'SAI', familyName: 'Sainz',        constructorName: 'Williams',     time: '1:30.224' },
      { pos: 16, code: 'LIN', familyName: 'Lindblad',     constructorName: 'Racing Bulls', time: '1:30.573' },
      { pos: 17, code: 'LAW', familyName: 'Lawson',       constructorName: 'Racing Bulls', time: '1:31.043' },
      { pos: 18, code: 'OCO', familyName: 'Ocon',         constructorName: 'Haas',         time: '1:31.245' },
      { pos: 19, code: 'PER', familyName: 'Perez',        constructorName: 'Cadillac',     time: '1:31.255' },
      { pos: 20, code: 'BOT', familyName: 'Bottas',       constructorName: 'Cadillac',     time: '1:31.826' },
      { pos: 21, code: 'ALO', familyName: 'Alonso',       constructorName: 'Aston Martin', time: '1:41.311' },
      { pos: 22, code: 'STR', familyName: 'Stroll',       constructorName: 'Aston Martin', time: '' }
    ]
  },

  // Actual podium results per event [P1, P2, P3]
  actualPodiums: [
    ['Russell', 'Antonelli', 'Hamilton'],
    ['Russell', 'Leclerc', 'Hamilton'],
    ['Antonelli', 'Russell', 'Hamilton'],
    ['Antonelli', 'Piastri', 'Leclerc'],
    null, null,
    ['Norris', 'Piastri', 'Leclerc'],
    ['Antonelli', 'Norris', 'Piastri'],
    ['Russell', 'Norris', 'Antonelli'],
    ['Antonelli', 'Hamilton', 'Verstappen'], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
  ],

  // WDC Standings (current - after Round 5 Canada)
  wdc: [
    { driver: 'Antonelli',  points: 131 },
    { driver: 'Russell',    points: 88 },
    { driver: 'Leclerc',    points: 75 },
    { driver: 'Hamilton',   points: 72 },
    { driver: 'Norris',     points: 58 },
    { driver: 'Piastri',    points: 48 },
    { driver: 'Verstappen', points: 43 },
    { driver: 'Gasly',      points: 20 },
    { driver: 'Bearman',    points: 18 },
    { driver: 'Colapinto',  points: 15 },
    { driver: 'Hadjar',     points: 14 },
    { driver: 'Lawson',     points: 14 },
    { driver: 'Lindblad',   points: 5 },
    { driver: 'Sainz',      points: 4 },
    { driver: 'Bortoleto',  points: 2 },
    { driver: 'Alonso',     points: 0 },
    { driver: 'Stroll',     points: 0 },
    { driver: 'Ocon',       points: 0 },
    { driver: 'Albon',      points: 0 },
    { driver: 'Hulkenberg', points: 0 },
    { driver: 'Perez',      points: 0 },
    { driver: 'Bottas',     points: 0 }
  ],

  // WCC Standings (current - after Round 5 Canada)
  wcc: [
    { team: 'Mercedes',      points: 219 },
    { team: 'Ferrari',       points: 147 },
    { team: 'McLaren',       points: 106 },
    { team: 'Red Bull',      points: 57 },
    { team: 'Alpine',        points: 35 },
    { team: 'Racing Bulls',  points: 19 },
    { team: 'Haas',          points: 18 },
    { team: 'Williams',      points: 4 },
    { team: 'Audi',          points: 2 },
    { team: 'Aston Martin',  points: 0 },
    { team: 'Cadillac',      points: 0 }
  ],  // F1 Points system
  racePoints: { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 },
  sprintPoints: { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 },

  // Country code to flag emoji mapping
  countryFlags: {
    'AU': '🇦🇺', 'CN': '🇨🇳', 'JP': '🇯🇵', 'BH': '🇧🇭', 'SA': '🇸🇦',
    'US': '🇺🇸', 'CA': '🇨🇦', 'MC': '🇲🇨', 'ES': '🇪🇸', 'AT': '🇦🇹',
    'GB': '🇬🇧', 'BE': '🇧🇪', 'HU': '🇭🇺', 'NL': '🇳🇱', 'IT': '🇮🇹',
    'AZ': '🇦🇿', 'SG': '🇸🇬', 'MX': '🇲🇽', 'BR': '🇧🇷', 'QA': '🇶🇦',
    'AE': '🇦🇪', 'FR': '🇫🇷', 'DE': '🇩🇪', 'FI': '🇫🇮', 'TH': '🇹🇭',
    'NZ': '🇳🇿', 'AR': '🇦🇷', ''  : '🏁'
  },

  // Team logo URLs (official F1 2026 CDN)
  teamLogos: {
    'Mercedes':      'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
    'Ferrari':       'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
    'McLaren':       'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
    'Red Bull':      'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
    'Aston Martin':  'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
    'Alpine':        'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
    'Williams':      'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
    'Racing Bulls':  'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
    'Haas':          'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp',
    'Audi':          'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    'Cadillac':      'https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp'
  },

  // Helper: get flag for country code
  getFlag(countryCode) {
    return this.countryFlags[countryCode] || '🏁';
  },

  // Helper: format seconds to mm:ss.sss
  formatLapTime(seconds) {
    if (seconds == null) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  },

  // Helper: get team color for a driver
  getTeamColor(driverName) {
    const driver = this.drivers[driverName];
    if (!driver) return '#666';
    const team = this.teams[driver.team];
    return team ? team.color : '#666';
  }
};
