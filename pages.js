/* ============================================================
   pages.js — Page initialisation & dynamic render functions
============================================================ */


/* ─────────────────────────────────────────────────────────
   HOME PAGE — animate preview bars on entry
───────────────────────────────────────────────────────── */
function renderHome() {
  // Inject DNA helix SVG
  $('#dna-hero').html(dnaHelixSVG(12));

  // Animate the progress bars in the preview panel
  setTimeout(() => {
    $('.preview-bar-fill').each(function () {
      const target = $(this).data('width') + '%';
      $(this).css('width', '0').animate({ width: target }, 1200);
    });
  }, 200);
}


/* ─────────────────────────────────────────────────────────
   ROUTINE CHECK PAGE — wire up live score, history & submit
───────────────────────────────────────────────────────── */
function renderRoutine() {
  // Restore form values from state
  const form = state.routineForm;
  $('#f-sleepStart').val(form.sleepStart);
  $('#f-sleepEnd').val(form.sleepEnd);
  $('#f-water').val(form.water);
  $('#f-meals').val(form.meals);
  $('#f-exercise').val(form.exercise);
  $('#f-workHours').val(form.workHours);
  $('#f-screenTime').val(form.screenTime);
  $('#f-stress').val(form.stress);
  $('#stress-val').text(form.stress);

  // Render history list
  $('#history-list').html(renderHistoryList());

  // Set initial score ring
  updateRoutineScore();

  // Live updates: numeric inputs
  ['sleepStart','sleepEnd','water','meals','exercise','workHours','screenTime'].forEach(field => {
    $(`#f-${field}`).off('input change').on('input change', function () {
      const val = $(this).val();
      state.routineForm[field] = (field === 'water') ? parseFloat(val)
        : (field === 'sleepStart' || field === 'sleepEnd') ? val
        : parseInt(val);
      updateRoutineScore();
    });
  });

  // Stress slider
  $('#f-stress').off('input').on('input', function () {
    state.routineForm.stress = parseInt($(this).val());
    $('#stress-val').text($(this).val());
    updateRoutineScore();
  });

  // Submit
  $('#routine-submit').off('click').on('click', function () {
    const day = { ...state.routineForm, id: 'id_' + Date.now() };
    state.weekData = [...state.weekData, day].slice(-7);
    saveWeekData();
    $(this).removeClass('idle').addClass('done').html(
      'Log Verified ' + ic('check', 24)
    );
    $('#history-list').html(renderHistoryList());
    setTimeout(() => {
      $(this).removeClass('done').addClass('idle').html(
        'Commit Daily Entry ' + ic('plus', 24)
      );
    }, 3000);
  });

  // Reset button
  $('#open-reset').off('click').on('click', () => $('#reset-modal').addClass('open'));
}

/** Build the recent-logs list HTML */
function renderHistoryList() {
  if (!state.weekData.length) {
    return `<div class="history-empty">
      ${ic('clipboard', 40)}
      <p class="history-empty-text">Ready for first log</p>
    </div>`;
  }
  return [...state.weekData].reverse().map((day, i) => {
    const r = calculateDailyScore(day);
    const s = scoreConditionStyle(r.score);
    return `<div class="history-card">
      <div class="history-card-top">
        <span class="history-entry-num">Entry ${state.weekData.length - i}</span>
        <span class="history-badge" style="color:${s.color};background:${s.bg}">${s.label}</span>
      </div>
      <div class="history-card-bottom">
        <div class="history-details">
          <span>${ic('moon',12)} ${day.sleepStart} Bedtime</span>
          <span>${ic('droplets',12)} ${day.water}L Hydration</span>
        </div>
        <div class="history-score">
          <div class="history-score-num">${r.score}</div>
          <div class="history-score-lbl">Rating</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

/** Update only the score ring & label without re-rendering */
function updateRoutineScore() {
  const d      = calculateDailyScore(state.routineForm);
  const s      = scoreConditionStyle(d.score);
  const circ   = 2 * Math.PI * 34;
  const offset = circ - (circ * d.score) / 100;

  $('#ring-score').text(d.score).css('color', s.color);
  $('#ring-label').text(s.label).css('color', s.color);
  $('#ring-progress')
    .attr({ stroke: s.color, 'stroke-dashoffset': offset.toFixed(1) });
  $('#habit-condition-icon').css('background', s.bg);
}


/* ─────────────────────────────────────────────────────────
   DASHBOARD PAGE — fully JS-rendered (data-dependent)
───────────────────────────────────────────────────────── */
function renderDashboard() {
  if (!state.weekData.length) {
    $('#page-dashboard').html(`
    <div class="empty-state fade-in">
      <div class="empty-icon">${ic('activity', 48)}</div>
      <div>
        <h1 class="empty-title">No data yet</h1>
        <p class="empty-sub">Complete your first routine check to unlock your health map dashboard and insights.</p>
      </div>
      <a href="#routine" class="btn-primary dash-start-btn">Start Your First Log</a>
    </div>`);
    return;
  }

  const report = calculateScore(state.weekData);
  const sim    = calculateScore(Array(7).fill(null).map(() => ({
    sleepStart: '22:00',
    sleepEnd:   String((22 + state.simData.sleep) % 24).padStart(2, '0') + ':00',
    water:      state.simData.water, meals: 3,
    exercise:   state.simData.exercise,
    screenTime: state.simData.screen,
    stress:     state.simData.stress,
    workHours:  state.simData.work
  })));

  const riskClass  = { Low: 'risk-low', Moderate: 'risk-moderate', Higher: 'risk-higher' }[report.riskLevel];
  const heroCirc   = 2 * Math.PI * 50;
  const heroOffset = heroCirc - (heroCirc * report.overallScore) / 100;

  $('#page-dashboard').html(`
  <div class="fade-in dash-page">
    <div class="dash-top-bar">
      <div>
        <h1 class="dash-title">Daily Overview</h1>
        <p class="dash-sub">Welcome back, your routine is looking stable today.</p>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-main">

        <div class="score-hero score-gradient slide-up">
          <div>
            <h2 class="score-hero-eyebrow">Routine Health Score</h2>
            <div class="score-hero-num">${report.overallScore}</div>
            <div class="score-hero-badge">${report.overallScore >= 70 ? 'Optimal Habit Alignment' : report.overallScore >= 40 ? 'Moderate Consistency' : 'Needs Immediate Adjustment'}</div>
          </div>
          <div class="score-hero-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="10"
                stroke-dasharray="${heroCirc.toFixed(1)}" stroke-dashoffset="${heroOffset.toFixed(1)}"
                stroke-linecap="round" class="hero-ring-progress"/>
            </svg>
          </div>
        </div>

        <div class="habit-grid">
          ${[
            { label:'Sleep Duration', value:`${Math.floor(report.averages.sleep)}h ${Math.round((report.averages.sleep%1)*60)}m`, meta:'Current average' },
            { label:'Water Intake',   value:`${report.averages.water.toFixed(1)} Liters`,                                         meta:'Daily average'   },
            { label:'Active Minutes', value:`${Math.round(report.averages.activity)}m`,                                           meta:'Session average'  },
            { label:'Screen Time',    value:`${report.averages.screen.toFixed(1)}h`,                                              meta:'Digital usage'   },
            { label:'Stress Level',   value:`${report.averages.stress.toFixed(1)} / 10`,                                         meta:'Tension average' },
            { label:'Work Hours',     value:`${report.averages.work.toFixed(1)}h`,                                                meta:'Focus period'    }
          ].map(h => `
          <div class="habit-cell">
            <span class="habit-cell-lbl">${h.label}</span>
            <div class="habit-cell-val">${h.value}</div>
            <div class="habit-cell-meta">${h.meta}</div>
          </div>`).join('')}
        </div>

        <div class="charts-row">
          <div class="chart-card"><h3>Performance Distribution</h3><canvas id="bar-chart"  height="250"></canvas></div>
          <div class="chart-card"><h3>Habit Correlation</h3>        <canvas id="line-chart" height="250"></canvas></div>
        </div>
      </div>

      <aside class="dash-aside">
        <div class="card dash-risk-card">
          <h3 class="dash-aside-title">Risk Indicator</h3>
          <div class="risk-card ${riskClass}">
            <span class="risk-level">${report.riskLevel} Risk</span>
            <p>${report.riskLevel === 'Low'      ? 'Your current habits support long-term heart and brain health. Keep up the consistency.'
               : report.riskLevel === 'Moderate' ? 'Minor lifestyle gaps identified. Consider focusing on sleep and activity alignment.'
                                                 : 'Critical routine imbalances detected. Prioritize wellness recovery today.'}</p>
          </div>
        </div>

        <div class="card dash-patterns-card">
          <h3 class="dash-aside-title">Pattern Insights</h3>
          ${report.patterns.length
            ? report.patterns.map(p => `
              <div class="pattern-item">
                <span class="pattern-label">Observation</span>
                <p>${p}</p>
              </div>`).join('')
            : `<div class="pattern-empty"><p>Generating data...</p></div>`}
        </div>

        <div class="efficiency-hub">
          <h3 class="efficiency-title">Efficiency Hub ${ic('lightbulb', 18)}</h3>
          <div class="efficiency-item">
            <span class="efficiency-label">Morning Routine</span>
            <p>Morning sunlight (5-10 mins) triggers cortisol release, setting your internal clock for better energy and sleep.</p>
          </div>
          <div class="efficiency-item efficiency-item-bordered">
            <span class="efficiency-label">Work Optimization</span>
            <p>The '90-Minute Rule': Work in ultradian rhythms. Focus for 90 mins, then disconnect for 15 mins for peak brain health.</p>
          </div>
        </div>
      </aside>
    </div>

    <section class="sim-section">
      <div class="sim-header">
        <div>
          <div class="section-badge sim-badge">${ic('sparkles', 12)} Optimization Engine</div>
          <h2 class="sim-title">Scenario Simulator</h2>
          <p class="sim-sub">"What if I sleep more or reduce my screen time?" — Adjust sliders to see projected impact.</p>
        </div>
        <div class="sim-scores pro-shadow">
          <div>
            <div class="sim-score-val" id="sim-score" style="color:var(--primary)">${sim.overallScore}</div>
            <div class="sim-score-lbl">Projected Score</div>
          </div>
          <div class="sim-divider"></div>
          <div>
            <div class="sim-score-val" id="sim-recovery">${sim.recoveryScore}%</div>
            <div class="sim-score-lbl">Recovery</div>
          </div>
        </div>
      </div>
      <div class="sim-sliders">
        ${[
          { label:'Sleep (Hrs)',    key:'sleep',    min:4,   max:12,  step:0.5 },
          { label:'Water (L)',      key:'water',    min:0.5, max:5,   step:0.1 },
          { label:'Exercise (Min)',key:'exercise', min:0,   max:120, step:5   },
          { label:'Stress (1-10)', key:'stress',   min:1,   max:10,  step:1   },
          { label:'Work (Hrs)',     key:'work',     min:0,   max:16,  step:0.5 },
          { label:'Screen (Hrs)',   key:'screen',   min:0,   max:16,  step:0.5 }
        ].map(s => `
        <div class="sim-slider-card">
          <div class="slider-header">
            <span>${s.label}</span>
            <span class="val" id="sim-val-${s.key}">${state.simData[s.key]}</span>
          </div>
          <input type="range" min="${s.min}" max="${s.max}" step="${s.step}"
            value="${state.simData[s.key]}" data-key="${s.key}" class="sim-slider">
        </div>`).join('')}
      </div>
    </section>

    <section class="card energy-section">
      <h3 class="energy-title">Projected Energy Timeline ${ic('info', 16)}</h3>
      <div class="energy-bar" id="energy-bar">
        <div class="energy-seg" style="width:30%;background:#2dd4bf;opacity:${(0.5 + sim.recoveryScore / 200).toFixed(2)}"></div>
        <div class="energy-seg" style="width:40%;background:#14b8a6;opacity:${(0.5 + sim.recoveryScore / 200).toFixed(2)}"></div>
        <div class="energy-seg" style="width:30%;background:#0d9488;opacity:${(0.5 + sim.recoveryScore / 200).toFixed(2)}"></div>
      </div>
      <div class="energy-labels">
        <span>Morning Focus</span><span>Peak Performance</span><span>Recovery Mode</span>
      </div>
    </section>
  </div>`);

  // Charts
  if (state.barChart)  { state.barChart.destroy();  state.barChart  = null; }
  if (state.lineChart) { state.lineChart.destroy(); state.lineChart = null; }
  const isDark    = state.theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#627282';

  state.barChart = new Chart(document.getElementById('bar-chart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Sleep','Water','Activity','Stress','Balance'],
      datasets: [{ data: [report.factors.sleep, report.factors.water, report.factors.activity, report.factors.stress, report.factors.balance], backgroundColor: '#4DA6A6', borderRadius: 8, barThickness: 32 }]
    },
    options: { responsive: true, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--card)', titleColor: textColor, bodyColor: textColor, borderColor: 'rgba(0,0,0,.05)', borderWidth: 1 } }, scales: { x: { grid: { display: false }, ticks: { color: textColor, font: { weight: '700', size: 10 } } }, y: { display: false, max: 100 } } }
  });

  state.lineChart = new Chart(document.getElementById('line-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: state.weekData.map((_, i) => 'Day ' + (i + 1)),
      datasets: [
        { label: 'Screen',   data: state.weekData.map(d => d.screenTime), borderColor: '#f43f5e', borderWidth: 3, tension: .4, pointRadius: 0 },
        { label: 'Exercise', data: state.weekData.map(d => d.exercise),   borderColor: '#4DA6A6', borderWidth: 3, tension: .4, pointRadius: 0 }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--card)', titleColor: textColor, bodyColor: textColor, borderColor: 'rgba(0,0,0,.05)', borderWidth: 1 } }, scales: { x: { display: false }, y: { display: false } } }
  });

  // Simulator events
  $('.sim-slider').on('input', function () {
    const key = $(this).data('key');
    state.simData[key] = parseFloat($(this).val());
    $(`#sim-val-${key}`).text(state.simData[key]);
    const newSim = calculateScore(Array(7).fill(null).map(() => ({
      sleepStart: '22:00', sleepEnd: String((22 + state.simData.sleep) % 24).padStart(2, '0') + ':00',
      water: state.simData.water, meals: 3, exercise: state.simData.exercise,
      screenTime: state.simData.screen, stress: state.simData.stress, workHours: state.simData.work
    })));
    $('#sim-score').text(newSim.overallScore);
    $('#sim-recovery').text(newSim.recoveryScore + '%');
    const op = (0.5 + newSim.recoveryScore / 200).toFixed(2);
    $('#energy-bar .energy-seg').css('opacity', op);
  });
}


/* ─────────────────────────────────────────────────────────
   HEALTH INSIGHTS — hover effect only (content is static)
───────────────────────────────────────────────────────── */
function renderInsights() {
  $('.insight-card').off('mouseenter mouseleave')
    .hover(
      function () { $(this).find('.insight-icon').addClass('insight-icon-hover'); },
      function () { $(this).find('.insight-icon').removeClass('insight-icon-hover'); }
    );
}


/* ─────────────────────────────────────────────────────────
   TIPS — content is fully static, no JS needed
───────────────────────────────────────────────────────── */
function renderTips() { /* static page — no JS interaction required */ }


/* ─────────────────────────────────────────────────────────
   GP FINDER — search and map
───────────────────────────────────────────────────────── */
function renderGPFinder() {
  $('#gp-postcode')
    .off('focus blur')
    .on('focus', function () { $(this).addClass('input-focused'); })
    .on('blur',  function () { $(this).removeClass('input-focused'); });

  $('#gp-search').off('click').on('click', function () {
    if (!$('#gp-postcode').val().trim()) return;
    $('#gp-results').html(`
      <div class="gp-searching">
        <div class="spinner"></div>
        <p>Scanning NHS Database...</p>
      </div>`);
    setTimeout(() => {
      state.gpResults = MOCK_GPS;
      state.activeGP  = null;
      renderGPResults();
    }, 1500);
  });
}

function renderGPResults() {
  $('#gp-results').html(`
  <div class="gp-grid">
    <div class="custom-scrollbar gp-list" id="gp-list">
      ${state.gpResults.map(gp => `
      <div class="gp-card ${state.activeGP === gp.id ? 'active' : ''}" data-gp="${gp.id}">
        <div class="gp-card-header">
          <h3>${gp.name}</h3>
          <span class="gp-distance">${gp.distance}</span>
        </div>
        <p class="gp-address">${ic('map-pin', 12)} ${gp.address}</p>
        <div class="gp-actions">
          <a href="tel:${gp.phone}" class="gp-btn-call">${ic('phone', 14)} Call</a>
          <button class="gp-btn-register">Register ${ic('arrow-right', 14)}</button>
        </div>
      </div>`).join('')}
    </div>
    <div id="gp-map" class="gp-map"></div>
  </div>`);

  if (state.gpMap) { state.gpMap.remove(); state.gpMap = null; }
  state.gpMap = L.map('gp-map').setView([51.505, -0.11], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(state.gpMap);

  const customIcon = L.divIcon({
    html: `<div class="gp-marker-dot"><div class="gp-marker-inner"></div></div>`,
    className: '', iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-32]
  });

  state.gpResults.forEach(gp => {
    L.marker([gp.lat, gp.lng], { icon: customIcon })
      .addTo(state.gpMap)
      .bindPopup(`<b>${gp.name}</b><br><small>${gp.address}</small>`)
      .on('click', () => {
        state.activeGP = gp.id;
        $('.gp-card').removeClass('active');
        $(`[data-gp="${gp.id}"]`).addClass('active');
        state.gpMap.setView([gp.lat, gp.lng], 16);
      });
  });

  $(document).on('click', '.gp-card', function () {
    const id = parseInt($(this).data('gp'));
    state.activeGP = id;
    $('.gp-card').removeClass('active');
    $(this).addClass('active');
    const gp = state.gpResults.find(g => g.id === id);
    if (gp && state.gpMap) state.gpMap.setView([gp.lat, gp.lng], 16);
  });
}


/* ─────────────────────────────────────────────────────────
   BRAIN & BODY — inject DNA helix + conditions accordion
───────────────────────────────────────────────────────── */
function renderBrainBody() {
  // DNA helix
  $('#dna-bb').html(dnaHelixSVG(18));

  // Render condition cards into #cond-grid
  $('#cond-grid').html(
    HEALTH_CONTENT.conditions.map((c, i) => `
    <div class="cond-card">
      <button class="cond-btn" data-idx="${i}">
        <div>
          <h3>${c.name}</h3>
          <p>${c.impact.substring(0, 60)}...</p>
        </div>
        <div class="cond-toggle ${state.expandedCondition === i ? 'open' : ''}">
          ${state.expandedCondition === i ? ic('chevron-up', 20) : ic('chevron-down', 20)}
        </div>
      </button>
      <div class="cond-body ${state.expandedCondition === i ? 'open' : ''}">
        <div class="cond-body-inner">
          <span class="cond-indicators-label">${ic('alert-triangle', 12)} Key Indicators</span>
          <div class="cond-symptoms">
            ${c.symptoms.map(s => `<div class="cond-symptom"><div class="cond-sym-dot"></div>${s}</div>`).join('')}
          </div>
          <div class="cond-insight">
            <span class="cond-insight-label">Long-term Insight</span>
            <p>${c.impact}</p>
          </div>
        </div>
      </div>
    </div>`).join('')
  );

  $(document).off('click', '.cond-btn').on('click', '.cond-btn', function () {
    const idx = parseInt($(this).data('idx'));
    state.expandedCondition = state.expandedCondition === idx ? null : idx;
    renderBrainBody();
  });
}


/* ─────────────────────────────────────────────────────────
   ABOUT — static page
───────────────────────────────────────────────────────── */
function renderAbout() { /* static page */ }


/* ─────────────────────────────────────────────────────────
   CONTACT — wire up form submission
───────────────────────────────────────────────────────── */
function renderContact() {
  // Reset the form to its initial state on page entry
  $('#contact-form-area').html(`
    <div class="form-group">
      <span class="form-label">Full Name</span>
      <input type="text" class="form-input" id="c-name" placeholder="John Doe" required>
    </div>
    <div class="form-group">
      <span class="form-label">Email Address</span>
      <input type="email" class="form-input" id="c-email" placeholder="john@example.com" required>
    </div>
    <div class="form-group">
      <span class="form-label">Message</span>
      <textarea class="form-input" id="c-msg" rows="5" placeholder="How can we help?"></textarea>
    </div>
    <button class="btn-primary btn-full" id="contact-submit">
      ${ic('send', 20)} Send Message
    </button>`);

  $('#contact-submit').on('click', function () {
    const name  = $('#c-name').val().trim();
    const email = $('#c-email').val().trim();
    const msg   = $('#c-msg').val().trim();
    if (!name || !email || !msg) return;
    $('#contact-form-area').html(`
    <div class="success-state">
      <div class="success-icon">${ic('check-circle', 40)}</div>
      <h3 class="success-title">Message Sent!</h3>
      <p>Thank you for your feedback. We will get back to you shortly.</p>
      <button id="contact-again" class="contact-again-btn">Send another message</button>
    </div>`);
    $('#contact-again').on('click', () => renderContact());
  });
}


/* ─────────────────────────────────────────────────────────
   AUTH PAGE — toggle login/signup mode, handle submit
───────────────────────────────────────────────────────── */
function renderAuth() {
  const isLogin = state.authMode === 'login';

  // Update heading text
  $('#auth-heading').html(
    isLogin
      ? 'Welcome back to<br><span class="text-primary text-italic">E Health</span> Map'
      : 'Join the elite<br><span class="text-primary text-italic">E Health</span> Map'
  );

  // Show/hide name field
  if (isLogin) {
    $('#auth-name-group').hide();
    $('#auth-form-title').text('Login');
    $('#auth-submit').html('Access Profile ' + ic('arrow-right', 24));
    $('#auth-switch').text("Don't have an account? Join now");
  } else {
    $('#auth-name-group').show();
    $('#auth-form-title').text('Create Account');
    $('#auth-submit').html('Start Journey ' + ic('arrow-right', 24));
    $('#auth-switch').text('Already a member? Sign in');
  }

  $('#auth-switch').off('click').on('click', () => {
    state.authMode = isLogin ? 'signup' : 'login';
    renderAuth();
  });

  $('#auth-submit').off('click').on('click', () => {
    const email = $('#auth-email').val().trim();
    if (!email) return;
    const name = isLogin
      ? email.split('@')[0]
      : ($('#auth-name').val().trim() || email.split('@')[0]);
    state.user = {
      uid: 'u' + Math.random().toString(36).substr(2, 9),
      email, name,
      joinDate: new Date().toISOString(),
      photoURL: `https://picsum.photos/seed/${encodeURIComponent(email)}/200`
    };
    saveUser();
    updateNav('profile');
    window.location.hash = '#profile';
    navigate('profile');
  });
}


/* ─────────────────────────────────────────────────────────
   PROFILE PAGE — fully JS-rendered (user-state dependent)
───────────────────────────────────────────────────────── */
function renderProfile() {
  if (!state.user) {
    $('#profile-content').html(`
    <div class="empty-state fade-in">
      <div class="empty-icon">${ic('user', 48)}</div>
      <div>
        <h1 class="empty-title">Not logged in</h1>
        <p class="empty-sub">Please log in to view and manage your health profile.</p>
      </div>
      <a href="#login" class="btn-primary">Go to Login</a>
    </div>`);
    return;
  }

  const user     = state.user;
  const photoURL = user.photoURL || `https://picsum.photos/seed/${encodeURIComponent(user.email)}/200`;
  const joinYear = new Date(user.joinDate).getFullYear();
  const joinDate = new Date(user.joinDate).toLocaleDateString();

  $('#profile-content').html(`
  <div class="fade-in profile-wrap">
    <div class="profile-header">
      <div class="profile-photo-wrap">
        <div class="photo-ring"></div>
        <img src="${photoURL}" alt="${user.name}" class="profile-photo" referrerpolicy="no-referrer">
        ${state.isEditing ? `<div class="camera-overlay">${ic('camera', 24)}</div>` : ''}
      </div>
      <div class="profile-info">
        <div class="profile-name-row">
          <h1>${user.name}</h1>
          <div class="profile-badge">${ic('shield-check', 12)} Pro Member</div>
        </div>
        <p class="profile-email">${ic('mail', 16)} ${user.email}</p>
        <p class="profile-joined">${ic('calendar', 14)} Joined ${joinDate}</p>
      </div>
      <div class="profile-actions">
        <button id="prof-edit" class="prof-edit-btn">${state.isEditing ? 'Cancel' : 'Edit Profile'}</button>
        <button id="prof-logout" class="prof-logout-btn">${ic('logout', 18)} Logout</button>
      </div>
    </div>

    <div class="profile-form-grid">
      <div class="card-xl profile-form-card">
        <h3 class="profile-form-title">${ic('user', 20)} Personal Information</h3>
        <div class="form-group">
          <span class="form-label">Full Name</span>
          <input type="text" class="form-input" id="prof-name" value="${user.name}" ${state.isEditing ? '' : 'disabled'}>
        </div>
        <div class="form-group">
          <span class="form-label">Email Address</span>
          <input type="email" class="form-input" id="prof-email" value="${user.email}" ${state.isEditing ? '' : 'disabled'}>
        </div>
        <div class="form-group">
          <span class="form-label">Bio / Health Philosophy</span>
          <textarea class="form-input" id="prof-bio" rows="4" ${state.isEditing ? '' : 'disabled'} placeholder="Tell us about your health goals...">${user.bio || ''}</textarea>
        </div>
        ${state.isEditing ? `<button class="btn-primary btn-full" id="prof-save">${ic('save', 24)} Save Changes</button>` : ''}
      </div>

      <div class="profile-sidebar">
        <div class="card-lg profile-member-card">
          <div class="profile-member-icon">${ic('heart-pulse', 32)}</div>
          <div>
            <h4>Member Since</h4>
            <p class="profile-member-year">${joinYear} Edition</p>
          </div>
        </div>
        <div class="profile-privacy-card">
          <h4>Your health data is safe.</h4>
          <p>We use local storage technology to keep your routine logs private to this browser session.</p>
          <a href="#about" class="profile-privacy-link">Read our Privacy Policy ${ic('arrow-right', 14)}</a>
        </div>
      </div>
    </div>
  </div>`);

  $('#prof-edit').on('click', () => { state.isEditing = !state.isEditing; renderProfile(); });
  $('#prof-save').on('click', () => {
    state.user = { ...state.user, name: $('#prof-name').val(), email: $('#prof-email').val(), bio: $('#prof-bio').val() };
    saveUser(); state.isEditing = false; renderProfile(); updateNav('profile');
  });
  $('#prof-logout')
    .on('click', () => {
      state.user = null; saveUser(); updateNav('home');
      window.location.hash = '#home'; navigate('home');
    })
    .on('mouseenter', function () { $(this).addClass('prof-logout-hover'); })
    .on('mouseleave', function () { $(this).removeClass('prof-logout-hover'); });
}
