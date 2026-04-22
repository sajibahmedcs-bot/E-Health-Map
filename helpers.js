/* ============================================================
   helpers.js — Shared State, Storage, Theme, Nav & Utilities
============================================================ */


/* ── App State ───────────────────────────────────────────── */
let state = {
  weekData:  [],
  user:      null,
  theme:     'light',
  simData:   { sleep: 8, water: 2.5, exercise: 30, stress: 3, work: 8, screen: 3 },
  expandedCondition: null,
  authMode:  'login',
  isEditing: false,
  gpResults: [], gpSearching: false, activeGP: null, gpMap: null,
  barChart: null, lineChart: null,
  routineForm: {
    sleepStart: '22:30', sleepEnd: '06:30',
    water: 2, meals: 3, exercise: 30,
    screenTime: 4, stress: 5, workHours: 8, tag: ''
  }
};


/* ── LocalStorage Persistence ────────────────────────────── */
function loadState() {
  try {
    const d = localStorage.getItem('ehealth_week_data');
    if (d) state.weekData = JSON.parse(d);
  } catch (e) { localStorage.removeItem('ehealth_week_data'); }
  try {
    const u = localStorage.getItem('eh_user');
    if (u) state.user = JSON.parse(u);
  } catch (e) { localStorage.removeItem('eh_user'); }
  state.theme = localStorage.getItem('eh_theme') || 'light';
}

function saveWeekData() {
  localStorage.setItem('ehealth_week_data', JSON.stringify(state.weekData));
}

function saveUser() {
  if (state.user) localStorage.setItem('eh_user', JSON.stringify(state.user));
  else            localStorage.removeItem('eh_user');
}


/* ── Theme ───────────────────────────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const isDark = state.theme === 'dark';

  const moonSVG = `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunSVG  = `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const sunLg   = sunSVG.replace('width="18" height="18"', 'width="20" height="20"');
  const moonLg  = moonSVG.replace('width="18" height="18"', 'width="20" height="20"');

  $('#theme-icon').html(isDark ? sunSVG : moonSVG);
  $('#theme-icon-m').html(isDark ? sunLg : moonLg);

  if (isDark) {
    if (!$('#leaflet-dark').length) {
      $('<style id="leaflet-dark">.leaflet-layer,.leaflet-control-zoom-in,.leaflet-control-zoom-out,.leaflet-control-attribution{filter:invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)}</style>')
        .appendTo('head');
    }
  } else {
    $('#leaflet-dark').remove();
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('eh_theme', state.theme);
  applyTheme();
}


/* ── Navigation State ────────────────────────────────────── */
function updateNav(page) {
  $('#nav-links a, #mobile-menu a[data-page]').removeClass('active');
  $(`[data-page="${page}"]`).addClass('active');

  const user = state.user;

  if (user) {
    const photoURL = user.photoURL || `https://picsum.photos/seed/${user.email}/200`;
    $('#auth-nav-slot').html(
      `<a href="#profile" class="user-btn">
         <img src="${photoURL}" alt="${user.name}" referrerpolicy="no-referrer">
         <span>${user.name.split(' ')[0]}</span>
       </a>`
    );
    $('#mobile-auth-slot').html(
      `<a href="#profile" data-page="profile">
         <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
         </svg>
         My Profile
       </a>`
    );
  } else {
    $('#auth-nav-slot').html(
      `<a href="#login" class="login-btn">
         <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
           <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
         </svg>
         Login
       </a>`
    );
    $('#mobile-auth-slot').html(
      `<a href="#login" data-page="login" class="mobile-login-btn">
         <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
           <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
         </svg>
         Login / Sign Up
       </a>`
    );
  }
}


/* ── Icon Helper ─────────────────────────────────────────── */
function ic(name, size = 20, cls = '') {
  const paths = {
    heart:          `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
    moon:           `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`,
    droplets:       `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`,
    activity:       `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    monitor:        `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
    zap:            `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    plus:           `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
    trash:          `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>`,
    check:          `<polyline points="20 6 9 17 4 12"/>`,
    clipboard:      `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
    sparkles:       `<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z"/>`,
    'thumbs-up':    `<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>`,
    minus:          `<line x1="5" y1="12" x2="19" y2="12"/>`,
    'trending-down':`<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>`,
    'trending-up':  `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
    'alert-circle': `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    brain:          `<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.14Z"/>`,
    focus:          `<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>`,
    battery:        `<rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/>`,
    'cloud-rain':   `<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>`,
    lightbulb:      `<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>`,
    stethoscope:    `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`,
    'chevron-down': `<polyline points="6 9 12 15 18 9"/>`,
    'chevron-up':   `<polyline points="18 15 12 9 6 15"/>`,
    'alert-triangle':`<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    target:         `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
    users:          `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    'shield-alert': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
    send:           `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
    mail:           `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
    'map-pin':      `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    'message-square':`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    'check-circle': `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    user:           `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    camera:         `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
    calendar:       `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    save:           `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
    logout:         `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
    'heart-pulse':  `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 5 1.5-3h5.28"/>`,
    'shield-check': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>`,
    'arrow-right':  `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    search:         `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
    phone:          `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.35 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.85-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    'external-link':`<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
    'user-plus':    `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>`,
    info:           `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`
  };

  const path = paths[name] || `<circle cx="12" cy="12" r="5"/>`;
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}


/* ── DNA Helix SVG Generator ─────────────────────────────── */
function dnaHelixSVG(count = 12) {
  let nodes = '';
  for (let i = 0; i < count; i++) {
    const y    = (i / count) * 800;
    const s1x  = 100 + 60 * Math.sin((i / count) * Math.PI * 4);
    const s2x  = 100 + 60 * Math.sin((i / count) * Math.PI * 4 + Math.PI);
    const delay = (i / count) * -10;
    nodes += `
      <line x1="${s1x}" y1="${y}" x2="${s2x}" y2="${y}" stroke="currentColor" stroke-width="1" opacity="0.4"/>
      <circle cx="${s1x}" cy="${y}" r="4" fill="currentColor" style="animation:dnaFloat 10s ease-in-out ${delay}s infinite"/>
      <circle cx="${s2x}" cy="${y}" r="4" fill="currentColor" style="animation:dnaFloat 10s ease-in-out ${delay}s infinite;animation-direction:reverse"/>
    `;
  }
  return `<svg width="100%" height="100%" viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg">${nodes}</svg>`;
}


/* ── Score Display Helpers ───────────────────────────────── */
function scoreConditionStyle(score) {
  if (score >= 86) return { color: '#10b981', bg: 'rgba(16,185,129,.08)',  label: 'Optimal'   };
  if (score >= 71) return { color: '#4DA6A6', bg: 'rgba(77,166,166,.08)',  label: 'Good'      };
  if (score >= 51) return { color: '#f97316', bg: 'rgba(249,115,22,.08)',  label: 'Fair'      };
  if (score >= 31) return { color: '#fb7185', bg: 'rgba(251,113,133,.08)', label: 'Poor'      };
  return               { color: '#dc2626', bg: 'rgba(220,38,38,.08)',   label: 'Very Poor' };
}

function tipIconColor(cat) {
  return { sleep: 'var(--primary)', hydration: '#3b82f6', activity: 'var(--accent)', digital: '#f43f5e', stress: '#f97316' }[cat] || 'var(--navy)';
}
function tipCatIcon(cat) {
  return { sleep: 'moon', hydration: 'droplets', activity: 'activity', digital: 'monitor', stress: 'zap' }[cat] || 'sparkles';
}
function bbColor(cat) {
  return { cognitive: 'var(--primary)', physical: 'var(--accent)', mental: '#3b82f6' }[cat] || 'var(--navy)';
}
function bbIcon(cat) {
  return { cognitive: 'focus', physical: 'battery', mental: 'cloud-rain' }[cat] || 'focus';
}
