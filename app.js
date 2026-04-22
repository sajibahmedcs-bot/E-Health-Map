
/* ── Page Registry ───────────────────────────────────────── */
const PAGE_RENDERERS = {
  'home':       renderHome,
  'routine':    renderRoutine,
  'dashboard':  renderDashboard,
  'insights':   renderInsights,
  'tips':       renderTips,
  'gp-finder':  renderGPFinder,
  'brain-body': renderBrainBody,
  'about':      renderAbout,
  'contact':    renderContact,
  'login':      renderAuth,
  'profile':    renderProfile
};


/* ── Cleanup ─────────────────────────────────────────────── */

function cleanupPage(nextPage) {
  if (nextPage !== 'dashboard') {
    if (state.barChart)  { state.barChart.destroy();  state.barChart  = null; }
    if (state.lineChart) { state.lineChart.destroy(); state.lineChart = null; }
  }
  if (nextPage !== 'gp-finder' && state.gpMap) {
    state.gpMap.remove();
    state.gpMap = null;
  }
  // Delegated events that are re-bound each render
  $(document).off('click', '.cond-btn');
  $(document).off('click', '.gp-card');
}


/* ── Router ──────────────────────────────────────────────── */

function navigate(page) {
  const validPage = PAGE_RENDERERS[page] ? page : 'home';
  cleanupPage(validPage);
  $('.page').removeClass('active');
  $(`#page-${validPage}`).addClass('active');
  updateNav(validPage);
  PAGE_RENDERERS[validPage]();
  window.scrollTo(0, 0);
}

/** Parse the current URL hash into a page name. */
function getHashPage() {
  return window.location.hash.replace('#', '') || 'home';
}


/* ── jQuery Initialisation ───────────────────────────────── */
$(document).ready(function () {

  // 1. Load persisted data and preferences
  loadState();

  // 2. Apply saved theme
  applyTheme();

  // 3. Set footer year
  $('#year').text(new Date().getFullYear());


  /* -- Theme toggle buttons (desktop + mobile) -- */
  $('#theme-toggle, #theme-toggle-m').on('click', function () {
    toggleTheme();
  });


  /* -- Hamburger (mobile menu open/close) -- */
  $('#hamburger').on('click', function () {
    const isOpen = $('#mobile-menu').hasClass('open');
    $('#mobile-menu').toggleClass('open');
    $('#ham-icon').html(
      isOpen
        // Hamburger icon (menu closed)
        ? `<line x1="3" y1="12" x2="21" y2="12"/>
           <line x1="3" y1="6"  x2="21" y2="6"/>
           <line x1="3" y1="18" x2="21" y2="18"/>`
        // X icon (menu open)
        : `<line x1="18" y1="6"  x2="6"  y2="18"/>
           <line x1="6"  y1="6"  x2="18" y2="18"/>`
    );
  });


  /* -- In-app link clicks (any href starting with #) -- */
  // Intercepts all anchor clicks whose href matches a registered page.
  $(document).on('click', 'a[href^="#"], [data-page]', function (e) {
    const href = $(this).attr('href') || '#' + $(this).data('page');
    const page = href.replace('#', '');
    if (PAGE_RENDERERS[page]) {
      e.preventDefault();
      history.pushState(null, '', '#' + page);
      $('#mobile-menu').removeClass('open');
      navigate(page);
    }
  });


  /* -- Footer links (same mechanism, explicit for clarity) -- */
  $(document).on('click', 'footer a', function (e) {
    const href = $(this).attr('href');
    if (href && href.startsWith('#')) {
      const page = href.replace('#', '');
      if (PAGE_RENDERERS[page]) {
        e.preventDefault();
        history.pushState(null, '', href);
        navigate(page);
      }
    }
  });


  /* -- Browser back/forward navigation -- */
  $(window).on('popstate', function () {
    navigate(getHashPage());
  });


  /* -- Reset data modal -- */
  $('#modal-cancel').on('click', () => {
    $('#reset-modal').removeClass('open');
  });
  $('#modal-confirm').on('click', () => {
    state.weekData = [];
    saveWeekData();
    $('#reset-modal').removeClass('open');
    renderRoutine();                         // refresh the routine page
  });
  // Close modal on backdrop click
  $('#reset-modal').on('click', function (e) {
    if ($(e.target).is('#reset-modal')) $(this).removeClass('open');
  });


  /* -- Render the initial page from the URL hash -- */
  navigate(getHashPage());
});
