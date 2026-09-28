// ==========================================================
// BusVerse Client Application Engine
// ==========================================================

const state = {
  stops: [],
  routes: [],
  buses: [],
  filteredBuses: [],
  selectedBus: null,
  selectedSeat: null,
  activeFilter: 'all',
  maxFare: '',
  source: 'Chemperi',
  destination: 'Kannur',
  date: BookingCore.today(),
  currentView: 'login', // Default opens to login / traveler details
  currentTicket: null,
  currentUser: null,
  userProfile: null
};

// Known demo accounts
const DEMO_ACCOUNTS = [
  {
    email: 'traveler@busverse.in',
    password: 'password123',
    name: 'Demo Traveler',
    phone: '+91 98765 43210',
    role: 'Passenger',
    initials: 'DT'
  },
  {
    email: 'admin@busverse.in',
    password: 'admin2026',
    name: 'Fleet Operations Admin',
    phone: '+91 94470 11223',
    role: 'Fleet Admin',
    initials: 'OP'
  }
];

// Icons (SVG strings)
const icons = {
  bus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4C2.9 6 1.9 6.8 1.6 7.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`,
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  swap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
  pin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  qr: `<svg width="74" height="74" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`
};

// // --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  initAuthSession();
  initNavigation();
  initSearchInputs();
  await loadInitialData();

  // If no user is logged in, directly land on Login / Traveler Details view with blank inputs
  if (!state.currentUser) {
    resetLoginForm();
    switchView('login');
  } else {
    switchView('search');
    searchBuses();
  }
});

function resetLoginForm() {
  const nameInput = document.getElementById('signup-name');
  const phoneInput = document.getElementById('signup-phone');
  const emailInput = document.getElementById('signup-email');
  const passInput = document.getElementById('signup-password');
  const signinEmail = document.getElementById('signin-email');
  const signinPass = document.getElementById('signin-password');

  if (nameInput) nameInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value = '';
  if (signinEmail) signinEmail.value = '';
  if (signinPass) signinPass.value = '';
}

// Toast notification engine
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else if (type === 'info') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div style="color: ${type === 'error' ? 'var(--destructive)' : type === 'info' ? 'var(--accent)' : 'var(--primary)'}; display: flex; align-items: center;">
      ${iconSvg}
    </div>
    <div style="flex: 1;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Session & Authentication
function initAuthSession() {
  try {
    // Only restore if user explicitly logged in during this active browser session
    const active = sessionStorage.getItem('busverse_active_session');
    if (active) {
      const user = JSON.parse(active);
      if (user && user.email && user.email !== 'isharose370@gmail.com') {
        state.currentUser = user;
        state.userProfile = {
          name: user.name,
          email: user.email,
          phone: user.phone
        };
      } else {
        state.currentUser = null;
        state.userProfile = null;
      }
    } else {
      // Clear any legacy localStorage to ensure clean login-first experience
      localStorage.removeItem('busverse_auth_user');
      state.currentUser = null;
      state.userProfile = null;
    }
  } catch (err) {
    state.currentUser = null;
    state.userProfile = null;
  }
  renderAuthNav();
}

function renderAuthNav() {
  const container = document.getElementById('nav-auth-container');
  if (!container) return;

  if (state.currentUser) {
    const initials = state.currentUser.initials || state.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const firstName = state.currentUser.name.split(' ')[0];

    container.innerHTML = `
      <div class="nav-user-container">
        <button class="nav-user-pill" id="nav-user-toggle-btn" onclick="toggleUserDropdown(event)" title="User Profile Menu">
          <div class="nav-user-avatar">${initials}</div>
          <span class="nav-user-name">${firstName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <div class="nav-user-dropdown" id="nav-user-dropdown">
          <div class="dropdown-user-header">
            <div class="dropdown-user-name">${state.currentUser.name}</div>
            <div class="dropdown-user-email">${state.currentUser.email}</div>
          </div>
          <button class="dropdown-item" onclick="switchView('bookings'); closeUserDropdown();">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>
            My Bookings
          </button>
          <button class="dropdown-item" onclick="switchView('dashboard'); closeUserDropdown();">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </button>
          <button class="dropdown-item" onclick="switchView('account'); closeUserDropdown();">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Preferences
          </button>
          <button class="dropdown-item danger" onclick="handleSignOut()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="nav-auth-btn" id="header-signin-btn" onclick="switchView('login')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Sign In</span>
      </button>
    `;
  }
}

window.toggleUserDropdown = function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('nav-user-dropdown');
  if (dropdown) dropdown.classList.toggle('show');
};

window.closeUserDropdown = function() {
  const dropdown = document.getElementById('nav-user-dropdown');
  if (dropdown) dropdown.classList.remove('show');
};

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('nav-user-dropdown');
  const toggleBtn = document.getElementById('nav-user-toggle-btn');
  if (dropdown && !dropdown.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
    dropdown.classList.remove('show');
  }
});

// Switch Tab in Auth View
window.setAuthTab = function(tab) {
  const isSignIn = tab === 'signin';
  document.getElementById('tab-signin').classList.toggle('active', isSignIn);
  document.getElementById('tab-signup').classList.toggle('active', !isSignIn);

  document.getElementById('form-signin').style.display = isSignIn ? 'flex' : 'none';
  document.getElementById('form-signup').style.display = isSignIn ? 'none' : 'flex';

  const titleEl = document.getElementById('auth-title');
  const subtitleEl = document.getElementById('auth-subtitle');

  if (isSignIn) {
    titleEl.textContent = 'Welcome Back';
    subtitleEl.textContent = 'Sign in to manage your tickets, track live buses, and access fast checkout.';
  } else {
    titleEl.textContent = 'Join BusVerse Today';
    subtitleEl.textContent = 'Create your verified passenger account to unlock instant seat bookings & offers.';
  }
};

// Quick Fill Demo Login
window.quickFillLogin = function(email, password, name) {
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-password');
  
  if (emailInput && passInput) {
    emailInput.value = email;
    passInput.value = password;
  }

  // Find user
  const user = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) || {
    name: name,
    email: email,
    phone: '+91 98471 23456',
    role: 'Passenger',
    initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  };

  completeLogin(user, `Logged in successfully as ${user.name}!`);
};

// Handle Sign In Submit
window.handleSignInSubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-signin');
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-text">Verifying credentials...</span>`;

  try {
    // Check known demo accounts or registered users
    let registeredUsers = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('busverse_registered_users') || '[]');
    } catch (err) {}

    const allUsers = [...DEMO_ACCOUNTS, ...registeredUsers];
    const userMatch = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    await new Promise(r => setTimeout(r, 450)); // natural micro-delay

    if (!userMatch) {
      // Allow custom sign-in or create on the fly
      const autoUser = {
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        phone: '+91 98471 00000',
        role: 'Passenger',
        initials: email.substring(0, 2).toUpperCase()
      };
      completeLogin(autoUser, `Welcome to BusVerse, ${autoUser.name}!`);
    } else if (userMatch.password && userMatch.password !== password) {
      showToast('Incorrect password. Please try again or use a demo login.', 'error');
    } else {
      completeLogin(userMatch, `Welcome back, ${userMatch.name}!`);
    }
  } catch (err) {
    showToast('Sign in failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <span class="btn-text">Sign In to BusVerse</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    `;
  }
};

// Handle Sign Up Submit
window.handleSignUpSubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-signup');
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name) {
    showToast('Please enter your full name.', 'error');
    return;
  }
  if (!phone || phone.replace(/\D/g, '').length < 10) {
    showToast('Please enter a valid 10-digit mobile number.', 'error');
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid Gmail / Email address.', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-text">Setting up profile...</span>`;

  try {
    await new Promise(r => setTimeout(r, 350));

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;
    const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TR';

    const newUser = {
      name: name,
      email: email,
      phone: formattedPhone,
      password: password || '1234',
      role: 'Passenger',
      initials: initials
    };

    // Save to local registry
    try {
      const existing = JSON.parse(localStorage.getItem('busverse_registered_users') || '[]');
      existing.push(newUser);
      localStorage.setItem('busverse_registered_users', JSON.stringify(existing));
    } catch (err) {}

    // Register with backend if available
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {}

    completeLogin(newUser, `Welcome to BusVerse, ${name}! Your passenger profile is active.`);
  } catch (err) {
    showToast('Registration failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <span class="btn-text">Continue to Bus Search & Booking</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    `;
  }
};

function completeLogin(user, successMessage) {
  state.currentUser = user;
  state.userProfile = {
    name: user.name,
    email: user.email,
    phone: user.phone
  };

  try {
    sessionStorage.setItem('busverse_active_session', JSON.stringify(user));
  } catch (err) {}

  renderAuthNav();
  showToast(successMessage, 'success');

  // Navigate directly into search with live results ready
  setTimeout(() => {
    switchView('search');
    searchBuses();
  }, 350);
}

// Handle Sign Out
window.handleSignOut = function() {
  closeUserDropdown();
  const prevName = state.currentUser ? state.currentUser.name : 'Traveler';
  state.currentUser = null;
  state.userProfile = null;
  try {
    sessionStorage.removeItem('busverse_active_session');
    localStorage.removeItem('busverse_auth_user');
  } catch (err) {}

  renderAuthNav();
  showToast(`Signed out of ${prevName}. Please provide your details to continue.`, 'info');
  resetLoginForm();
  switchView('login');
};

// Password Visibility Toggle
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  const openSvg = btn.querySelector('.eye-open');
  const closedSvg = btn.querySelector('.eye-closed');

  if (openSvg && closedSvg) {
    openSvg.classList.toggle('hidden', isPassword);
    closedSvg.classList.toggle('hidden', !isPassword);
  }
};

// Forgot Password Modal
window.openForgotPasswordModal = function(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('open');
};

window.closeForgotPasswordModal = function() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.remove('open');
};

window.handleForgotPasswordSubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  closeForgotPasswordModal();
  showToast(`Recovery instructions sent to ${email}. Check your inbox!`, 'info');
};

// Social Sign-in simulation
window.socialDemoLogin = function(provider) {
  const defaultName = provider === 'Google' ? 'Google Traveler' : 'Apple Traveler';
  const defaultEmail = provider === 'Google' ? 'traveler.google@gmail.com' : 'traveler.apple@icloud.com';
  const socialUser = {
    name: defaultName,
    email: defaultEmail,
    phone: '+91 98765 43210',
    role: 'Passenger',
    initials: provider === 'Google' ? 'GT' : 'AT'
  };
  completeLogin(socialUser, `Connected securely via ${provider}!`);
};

async function loadInitialData() {
  try {
    const data = await BookingStore.init();
    state.stops = data.stops;
    state.routes = data.routes;
    document.getElementById('booking-mode-note').textContent = data.mode === 'browser'
      ? 'Demo schedules & payments. Tickets are saved in this browser only; no real bus reservation or charge.'
      : 'Demo schedules & payments. Tickets are saved on this server; no real bus reservation or charge.';
    renderQuickChips();
    renderStopsExplorer();
  } catch (err) {
    showToast('Could not load schedules: ' + err.message, 'error');
  }
}

// --- NAVIGATION ---
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  const swapBtn = document.getElementById('swap-stops-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = state.source;
      state.source = state.destination;
      state.destination = temp;
      document.getElementById('input-source').value = state.source;
      document.getElementById('input-destination').value = state.destination;
      searchBuses();
    });
  }

  // Filter Pills (All / AC / Non-AC)
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.getAttribute('data-filter');
      filterAndRenderBuses();
    });
  });

  // Max fare input
  const fareInput = document.getElementById('input-max-fare');
  if (fareInput) {
    fareInput.addEventListener('input', (e) => {
      state.maxFare = e.target.value;
      filterAndRenderBuses();
    });
  }

  // Search Form Submit
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchBuses();
    });
  }
}

function switchView(view) {
  // If user tries to access any view before providing their traveler details, guide them to login
  if (!state.currentUser && view !== 'login') {
    showToast('Please enter your traveler details (Name, Mobile & Gmail) to continue.', 'info');
    view = 'login';
  }

  state.currentView = view;
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('data-view') === view);
  });

  document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (view === 'login' && !state.currentUser) resetLoginForm();
  if (view === 'bookings') loadBookingsView();
  if (view === 'dashboard') loadDashboardView();
  if (view === 'account') loadAccountView();
  if (view === 'stops') renderStopsExplorer();
}
window.switchView = switchView;

// --- SEARCH & AUTOCOMPLETE ---
function initSearchInputs() {
  const srcInput = document.getElementById('input-source');
  const destInput = document.getElementById('input-destination');
  const dateInput = document.getElementById('input-date');

  srcInput.value = state.source;
  destInput.value = state.destination;
  dateInput.value = state.date;
  dateInput.min = BookingCore.today();
  srcInput.addEventListener('input', () => { state.source = srcInput.value.trim(); invalidateResults(); });
  destInput.addEventListener('input', () => { state.destination = destInput.value.trim(); invalidateResults(); });

  setupAutocomplete(srcInput, 'dropdown-source', (stop) => {
    state.source = stop.name;
    srcInput.value = stop.name;
    invalidateResults();
  });

  setupAutocomplete(destInput, 'dropdown-destination', (stop) => {
    state.destination = stop.name;
    destInput.value = stop.name;
    invalidateResults();
  });

  dateInput.addEventListener('change', (e) => {
    state.date = e.target.value;
    invalidateResults();
  });
}

function setupAutocomplete(inputEl, dropdownId, onSelect) {
  const dropdownEl = document.getElementById(dropdownId);

  inputEl.addEventListener('focus', () => renderDropdown(inputEl.value));
  inputEl.addEventListener('input', () => renderDropdown(inputEl.value));

  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
      dropdownEl.classList.remove('show');
    }
  });

  function renderDropdown(val) {
    const q = val.trim().toLowerCase();
    const matches = state.stops.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.landmark.toLowerCase().includes(q)
    ).slice(0, 10);

    if (matches.length === 0) {
      dropdownEl.classList.remove('show');
      return;
    }

    dropdownEl.innerHTML = matches.map(s => `
      <div class="autocomplete-item" data-id="${s.id}">
        <div>
          <span class="stop-name">${s.name}</span>
          <span style="font-size: 0.7rem; margin-left: 6px; color: var(--primary); font-weight: 700;">${s.code}</span>
        </div>
        <div class="stop-meta">${s.district}, ${s.state}</div>
      </div>
    `).join('');

    dropdownEl.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        onSelect(matches[idx]);
        dropdownEl.classList.remove('show');
      });
    });

    dropdownEl.classList.add('show');
  }
}

function renderQuickChips() {
  const container = document.getElementById('quick-chips-container');
  if (!container) return;

  container.innerHTML = `
    <span class="quick-chip-label">Popular Routes:</span>
    ${state.routes.slice(0, 7).map(r => `
      <button class="route-chip" data-src="${r.source}" data-dest="${r.destination}">
        <span>${r.source} → ${r.destination}</span>
        <span class="fare-badge">from ₹${r.fareFrom}</span>
      </button>
    `).join('')}
  `;

  container.querySelectorAll('.route-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.source = btn.getAttribute('data-src');
      state.destination = btn.getAttribute('data-dest');
      document.getElementById('input-source').value = state.source;
      document.getElementById('input-destination').value = state.destination;
      switchView('search');
      searchBuses();
    });
  });
}

// --- BUS SEARCH & RENDERING ---
let searchSequence = 0;
function invalidateResults() {
  searchSequence++;
  state.buses = [];
  state.filteredBuses = [];
  document.getElementById('buses-list').textContent = 'Press Search to load buses for your updated route and date.';
  document.getElementById('results-count').textContent = 'Search details changed';
}
async function searchBuses() {
  const sequence = ++searchSequence;
  const listEl = document.getElementById('buses-list');
  state.buses = [];
  state.filteredBuses = [];
  listEl.textContent = 'Finding departures…';
  try {
    if (!state.source || !state.destination) throw new Error('Choose both your boarding and destination stops.');
    if (state.source.trim().toLowerCase() === state.destination.trim().toLowerCase()) throw new Error('Choose different boarding and destination stops.');
    if (!state.date || state.date < BookingCore.today()) throw new Error('Choose today or a future journey date.');
    const data = await BookingStore.search({source: state.source, destination: state.destination, date: state.date});
    if (sequence !== searchSequence) return;
    state.buses = data;
    filterAndRenderBuses();
  } catch (err) {
    if (sequence !== searchSequence) return;
    listEl.textContent = err.message;
    document.getElementById('results-count').textContent = 'No departures loaded';
  }
}

function filterAndRenderBuses() {
  let list = [...state.buses];

  if (state.activeFilter === 'ac') {
    list = list.filter(b => b.isAc);
  } else if (state.activeFilter === 'non-ac') {
    list = list.filter(b => !b.isAc);
  }

  if (state.maxFare && !isNaN(Number(state.maxFare))) {
    const limit = Number(state.maxFare);
    list = list.filter(b => b.fare <= limit);
  }

  state.filteredBuses = list;

  // Update header count
  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.textContent = `${list.length} departures found for ${state.source} → ${state.destination}`;
  }

  const listEl = document.getElementById('buses-list');
  if (list.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        ${icons.bus}
        <h3>No departures found</h3>
        <p>No matching departures remain for this route and date. Try another date or adjust your filters. Only scheduled routes have direct services.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = list.map(b => `
    <div class="bus-card" id="card-${b.id}">
      <div class="bus-operator-info">
        <div class="bus-icon-avatar">${icons.bus}</div>
        <div>
          <div class="operator-name">
            ${b.operator}
            ${b.isAc ? `<span class="ac-badge">AC</span>` : ''}
          </div>
          <div class="bus-subtitle">${b.busNumber} · ${b.busType}</div>
          <div class="rating-badge">${icons.star} ${b.rating.toFixed(1)} <span style="color: var(--muted-foreground); margin-left: 6px;">· Demo Schedule</span></div>
        </div>
      </div>

      <div class="schedule-col">
        <div class="time-block">
          <div class="time-val">${b.departure}</div>
          <div class="time-city">${b.source}</div>
        </div>
        <div class="duration-line">
          <span class="duration-val">${b.duration}</span>
          <div class="line-track"></div>
        </div>
        <div class="time-block">
          <div class="time-val">${b.arrival}</div>
          <div class="time-city">${b.destination}</div>
        </div>
      </div>

      <div class="fare-col">
        <div class="fare-val">₹${b.fare}</div>
        <div class="seats-avail">${b.availableSeats} seats left</div>
      </div>

      <div>
        <button class="select-btn" onclick="openSeatModal('${b.id}')">
          View Seats <span>→</span>
        </button>
      </div>
    </div>
  `).join('');
}

// --- SEAT SELECTION MODAL ---
// --- SEAT SELECTION MODAL ---
window.openSeatModal = async function(busId) {
  const modal = document.getElementById('seat-modal');
  const busChassis = document.getElementById('bus-chassis-content');
  busChassis.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--primary);">Loading live seat layout...</div>`;
  modal.classList.add('open');

  try {
    const journeyDate = state.date;
    const {bus, seats} = await BookingStore.seats(busId, journeyDate);
    state.checkoutDate = journeyDate;
    state.selectedBus = bus;
    state.selectedSeat = null;

    document.getElementById('modal-bus-title').textContent = `${bus.source} → ${bus.destination}`;
    document.getElementById('modal-bus-operator').textContent = `${bus.operator} · ${bus.departure} departure · ${bus.busType || 'AC/Non-AC'}`;

    renderSeatMap(seats, bus);
    updateFarePanel(null, bus);
  } catch (err) {
    busChassis.innerHTML = `<div style="color: var(--destructive); padding: 40px; text-align: center;">Could not load seat map: ${err.message}</div>`;
  }
};

window.closeSeatModal = function() {
  document.getElementById('seat-modal').classList.remove('open');
};

function renderSeatMap(seats, bus) {
  const busChassis = document.getElementById('bus-chassis-content');
  busChassis.innerHTML = `
    <div class="bus-front-indicator">
      <span>Driver Deck</span>
      <span>Front Aisle</span>
    </div>
    <div class="seat-grid">
      ${seats.map(s => {
        const isBooked = s.status === 'booked';
        return `
          <button 
            type="button"
            class="seat-btn ${isBooked ? 'booked' : ''}" 
            id="seat-${s.id}" 
            ${isBooked ? 'disabled' : ''} 
            onclick="selectSeat('${s.id}', ${s.fare}, '${s.seatNumber}')"
            title="${isBooked ? 'Seat Booked' : 'Click to select Seat ' + s.seatNumber}"
          >
            <span>${s.seatNumber}</span>
            <span style="font-size: 9px; opacity: 0.8;">₹${s.fare}</span>
          </button>
        `;
      }).join('')}
    </div>
    <div class="seat-legend">
      <div class="legend-item"><div class="legend-swatch avail"></div> Available</div>
      <div class="legend-item"><div class="legend-swatch sel"></div> Selected</div>
      <div class="legend-item"><div class="legend-swatch bkd"></div> Booked</div>
    </div>
  `;
}

window.selectSeat = function(seatId, fare, seatNumber) {
  document.querySelectorAll('.seat-btn').forEach(btn => btn.classList.remove('selected'));
  const btn = document.getElementById(`seat-${seatId}`);
  if (btn) btn.classList.add('selected');

  state.selectedSeat = { id: seatId, fare, seatNumber };
  state.checkoutRequestId = crypto.randomUUID();
  updateFarePanel(state.selectedSeat, state.selectedBus);
};

function updateFarePanel(seat, bus) {
  const panel = document.getElementById('fare-review-panel');
  const continueBtn = document.getElementById('continue-to-checkout-btn');

  if (!seat) {
    panel.innerHTML = `
      <div class="fare-row">
        <span style="color: var(--muted-foreground);">Base Fare</span>
        <span>₹${bus.fare}</span>
      </div>
      <div class="fare-row">
        <span style="color: var(--muted-foreground);">Seat Selected</span>
        <span style="color: var(--muted-foreground);">None Selected</span>
      </div>
      <div class="fare-row total">
        <span>Total Payable</span>
        <span>—</span>
      </div>
    `;
    continueBtn.disabled = true;
    continueBtn.textContent = 'Select a seat to proceed';
    return;
  }

  const tax = Math.round(seat.fare * 0.05); // 5% GST
  const total = seat.fare + tax;

  panel.innerHTML = `
    <div class="fare-row">
      <span style="color: var(--muted-foreground);">Seat Number</span>
      <span style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">Seat ${seat.seatNumber}</span>
    </div>
    <div class="fare-row">
      <span style="color: var(--muted-foreground);">Bus Fare</span>
      <span>₹${seat.fare}</span>
    </div>
    <div class="fare-row">
      <span style="color: var(--muted-foreground);">GST & Transit Tax (5%)</span>
      <span>₹${tax}</span>
    </div>
    <div class="fare-row total">
      <span>Total Payable</span>
      <span style="color: var(--primary); font-size: 1.25rem;">₹${total}</span>
    </div>
  `;

  continueBtn.disabled = false;
  continueBtn.textContent = `Proceed with Seat ${seat.seatNumber} · ₹${total}`;
}

// --- CHECKOUT & BOOKING CONFIRMATION ---
window.proceedToCheckout = function() {
  if (!state.selectedBus || !state.selectedSeat) return;
  if (!state.currentUser) {
    closeSeatModal();
    showToast('Please enter your traveler details (Name, Mobile, Gmail) before booking tickets.', 'info');
    switchView('login');
    return;
  }
  closeSeatModal();

  const checkoutModal = document.getElementById('checkout-modal');
  const tax = Math.round(state.selectedSeat.fare * 0.05);
  const total = state.selectedSeat.fare + tax;

  document.getElementById('checkout-seat-badge').textContent = `Seat ${state.selectedSeat.seatNumber} · ₹${total}`;
  document.getElementById('checkout-route').textContent = `${state.selectedBus.source} → ${state.selectedBus.destination}`;
  document.getElementById('checkout-operator').textContent = `${state.selectedBus.operator} (${state.selectedBus.departure})`;

  // Pre-fill with active user session
  const activeUser = state.currentUser || state.userProfile || {};
  document.getElementById('passenger-name').value = activeUser.name || '';
  document.getElementById('passenger-phone').value = activeUser.phone || '';
  document.getElementById('passenger-email').value = activeUser.email || '';

  const cutoff = BookingCore.departureAt(state.checkoutDate, state.selectedBus.departure) - 90 * 60000;
  document.getElementById('checkout-policy').textContent = 'Cancel by ' + formatIndia(cutoff) + ' (90 minutes before departure). Seats are confirmed only after demo payment succeeds.';
  checkoutModal.classList.add('open');
};

window.closeCheckoutModal = function() {
  document.getElementById('checkout-modal').classList.remove('open');
};

window.confirmBooking = async function(e) {
  e.preventDefault();
  if (state.submitting) return;
  if (!state.currentUser || !state.selectedBus || !state.selectedSeat) {
    showToast('Sign in and select a seat first.', 'error'); return;
  }
  state.submitting = true;
  const submitBtn = document.getElementById('confirm-booking-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing demo payment…';
  try {
    const booking = await BookingStore.create({
      busId: state.selectedBus.id, seatId: state.selectedSeat.id,
      journeyDate: state.checkoutDate, requestId: state.checkoutRequestId,
      passenger: {
        name: document.getElementById('passenger-name').value.trim(),
        phone: document.getElementById('passenger-phone').value.trim(),
        email: document.getElementById('passenger-email').value.trim()
      },
      paymentMethod: document.getElementById('payment-method').value,
      paymentOutcome: document.getElementById('payment-outcome').value
    });
    closeCheckoutModal();
    state.selectedSeat = null;
    showToast('Demo payment successful. Ticket saved.', 'success');
    showTicket(booking);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    state.submitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pay (Demo) & Confirm Reservation';
  }
};

function formatIndia(value) {
  return new Date(value).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'}) + ' IST';
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
// Ticket data is rendered as text, never as inline JavaScript.
function displaySafe(value) {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(displaySafe);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,displaySafe(v)]));
  return value;
}

// --- TICKET VIEW ---
function showTicket(booking) {
  state.currentTicket = booking;
  const eligible = BookingCore.canCancel(booking);
  const cutoff = formatIndia(BookingCore.deadline(booking));
  const cancellationTime = booking.cancelledAt ? formatIndia(booking.cancelledAt) : '';
  booking = displaySafe(booking);
  const container = document.getElementById('ticket-display-container');

  container.innerHTML = `
    <div class="ticket-wrapper">
      <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2>${booking.status === 'cancelled' ? 'Ticket cancelled' : 'Demo reservation confirmed'}</h2>
          <p style="color: var(--muted-foreground); font-size: 0.9rem;">Demo ticket only — not valid for travel. No real payment was taken.</p>
        </div>
        <div class="db-pill"><span class="dot"></span> ${booking.status}</div>
      </div>

      <div class="ticket-card" id="printable-ticket">
        <div class="ticket-header">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.7;">Booking Reference</div>
            <div class="ticket-pnr-badge">${booking.pnr}</div>
          </div>
          <div class="ticket-qr">${icons.qr}</div>
        </div>

        <div class="ticket-body">
          <div class="ticket-grid">
            <div class="ticket-field">
              <label>Route</label>
              <div class="val">${booking.bus.source} → ${booking.bus.destination}</div>
            </div>
            <div class="ticket-field">
              <label>Date & Time</label>
              <div class="val">${booking.journeyDate} at ${booking.bus.departure}</div>
            </div>
            <div class="ticket-field">
              <label>Bus Service</label>
              <div class="val">${booking.bus.operator} (${booking.bus.busNumber})</div>
            </div>
            <div class="ticket-field">
              <label>Seat Number</label>
              <div class="val" style="color: var(--primary); font-weight: 700; font-size: 1.25rem;">${booking.seat.seatNumber}</div>
            </div>
            <div class="ticket-field">
              <label>Passenger</label>
              <div class="val">${booking.passenger.name} (${booking.passenger.phone})</div>
            </div>
            <div class="ticket-field">
              <label>Demo total (including 5% tax)</label>
              <div class="val">₹${booking.fare} (All Taxes Included)</div>
            </div>
          </div>

          <p>Payment: ${booking.payment?.status || 'Legacy demo record'}</p>
          <p>Cancellation deadline: ${cutoff}. Cancellations require at least 1 hour 30 minutes before departure.</p>
          ${booking.status === 'cancelled' ? `<p>Cancelled: ${cancellationTime}. ${booking.payment?.status === 'demo-refunded' ? 'Demo refund: ₹' + booking.fare : 'No real refund processed.'}</p>` : ''}
          <div class="ticket-actions">
            <button class="print-btn" onclick="window.print()">
              Download / Print Ticket
            </button>
            ${booking.status === 'confirmed' ? `
              <button class="cancel-ticket-btn" ${eligible ? '' : 'disabled'} onclick="cancelBooking(state.currentTicket.id)">
                ${eligible ? 'Cancel Booking' : 'Cancellation closed'}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  switchView('ticket');
}

window.cancelBooking = async function(bookingId) {
  if (state.cancelling) return;
  if (!confirm('Cancel this ticket? The seat will be released and the cancelled ticket will stay in your history.')) return;
  state.cancelling = true;
  try {
    const result = await BookingStore.cancel(bookingId);
    showToast(result.message, 'success');
    showTicket(result.booking);
    await loadBookingsView();
  } catch (err) { showToast(err.message, 'error'); }
  finally { state.cancelling = false; }
};

// --- MY BOOKINGS VIEW ---
async function loadBookingsView() {
  const container = document.getElementById('bookings-list-container');
  container.innerHTML = `<div class="empty-state">Loading your bookings from database...</div>`;

  try {
    const bookings = await BookingStore.list();
    state.historyBookings = bookings;

    if (!bookings || bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          ${icons.bus}
          <h3>No rides booked yet</h3>
          <p>Search for a route and reserve your seat to see your tickets here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map((raw, index) => { const b = displaySafe(raw); return `
      <div class="bus-card" style="grid-template-columns: 1.4fr 1.2fr 1fr auto;">
        <div>
          <div style="font-family: var(--font-mono); color: var(--primary); font-weight: 700; font-size: 1.1rem; margin-bottom: 4px;">${b.pnr}</div>
          <div style="font-weight: 700; font-size: 1.1rem;">${b.bus.source} → ${b.bus.destination}</div>
          <div style="font-size: 0.8rem; color: var(--muted-foreground);">${b.bus.operator} · Seat ${b.seat.seatNumber}</div>
        </div>

        <div>
          <div style="font-weight: 700;">${b.journeyDate}</div>
          <div style="font-size: 0.85rem; color: var(--muted-foreground);">Departs at ${b.bus.departure}</div>
        </div>

        <div>
          <div style="font-weight: 700; font-size: 1.2rem;">₹${b.fare}</div>
          <span class="db-pill" style="${b.status === 'cancelled' ? 'color: var(--destructive); border-color: var(--destructive); background: rgba(239,68,68,0.1);' : ''}">
            ${b.status}
          </span>
          <div style="font-size: 0.8rem;">${escapeHtml(b.payment?.status || 'Legacy demo record')}</div>
          ${b.cancelledAt ? `<div style="font-size: 0.8rem;">Cancelled ${formatIndia(b.cancelledAt)}</div>` : `<div style="font-size: 0.8rem;">Cancel by ${formatIndia(BookingCore.deadline(raw))}</div>`}
        </div>

        <div>
          <button class="select-btn" data-booking-index="${index}">
            View Ticket
          </button>
        </div>
      </div>
    `; }).join('');
    container.querySelectorAll('[data-booking-index]').forEach(button => button.addEventListener('click', () => showTicket(bookings[Number(button.dataset.bookingIndex)])));
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--destructive);">Failed to load bookings.</div>`;
  }
}

// --- STOPS EXPLORER VIEW ---
function renderStopsExplorer() {
  const container = document.getElementById('stops-directory-container');
  if (!container) return;

  const grouped = {};
  state.stops.forEach(s => {
    const region = s.state === 'Kerala' ? `${s.district}, Kerala` : `${s.state}`;
    (grouped[region] = grouped[region] || []).push(s);
  });

  container.innerHTML = Object.entries(grouped).map(([region, stops]) => `
    <div style="margin-bottom: 36px;">
      <h3 style="font-size: 1.2rem; color: var(--foreground); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        ${region} <span style="font-size: 0.75rem; color: var(--muted-foreground); font-weight: normal;">(${stops.length} stops)</span>
      </h3>
      <div class="stops-grid">
        ${stops.map(s => `
          <div class="stop-card" onclick="selectStopQuick('${s.name}')">
            <div class="stop-name">
              <span>${s.name}</span>
              <span class="stop-badge">${s.code}</span>
            </div>
            <div class="stop-location">${s.landmark}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.selectStopQuick = function(stopName) {
  state.source = stopName;
  document.getElementById('input-source').value = stopName;
  switchView('search');
  searchBuses();
};

// --- DASHBOARD VIEW ---
async function loadDashboardView() {
  try {
    const bookings = await BookingStore.list();
    const upcoming = bookings.filter(b => b.status === 'confirmed' && BookingCore.departureAt(b.journeyDate, b.bus.departure) > Date.now());
    document.getElementById('stat-upcoming').textContent = upcoming.length;
    document.getElementById('stat-completed').textContent = bookings.filter(b => b.status === 'confirmed' && BookingCore.departureAt(b.journeyDate, b.bus.departure) <= Date.now()).length;
    document.getElementById('stat-saved').textContent = state.routes.length;
    const container = document.getElementById('dash-recent-bookings');
    container.innerHTML = upcoming.length ? upcoming.slice(0, 5).map((b,index) => `<div class="bus-card"><div>${escapeHtml(b.bus.source)} → ${escapeHtml(b.bus.destination)}<br>${escapeHtml(b.journeyDate)} · Seat ${escapeHtml(b.seat.seatNumber)}</div><button class="select-btn" data-ticket="${index}">View ticket</button></div>`).join('') : '<p>No upcoming rides. Cancelled tickets remain in My Bookings.</p>';
    container.querySelectorAll('[data-ticket]').forEach(button => button.addEventListener('click', () => showTicket(upcoming[Number(button.dataset.ticket)])));
  } catch (err) { showToast(err.message, 'error'); }
}

// --- ACCOUNT VIEW ---
async function loadAccountView() {
  const current = state.currentUser || state.userProfile || {};
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const phoneEl = document.getElementById('profile-phone');
  const classEl = document.getElementById('profile-default-class');
  const fareEl = document.getElementById('profile-max-fare');

  if (nameEl) nameEl.value = current.name || '';
  if (emailEl) emailEl.value = current.email || '';
  if (phoneEl) phoneEl.value = current.phone || '';
  if (classEl) classEl.value = current.defaultClass || 'all';
  if (fareEl) fareEl.value = current.maxFare || 1200;

  const form = document.getElementById('account-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const updates = {
      name: document.getElementById('profile-name').value.trim(),
      phone: document.getElementById('profile-phone').value.trim(),
      defaultClass: document.getElementById('profile-default-class').value,
      maxFare: Number(document.getElementById('profile-max-fare').value)
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      state.userProfile = data;
      alert('Preferences saved successfully!');
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Preferences';
    }
  };
}
