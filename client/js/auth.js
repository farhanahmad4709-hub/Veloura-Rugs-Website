/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — AUTH SYSTEM (API DRIVEN)
   ═══════════════════════════════════════════════════════════════ */

// auth.js now relies on the global showToast from app.js to avoid inconsistencies.

/* ─── VALIDATION HELPERS ─────────────────────────────────────── */
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }
function setFieldError(inputEl, msgEl, message) {
  inputEl.classList.add('error');
  if (msgEl) { msgEl.className = 'field-msg error'; msgEl.textContent = message; }
}
function setFieldSuccess(inputEl, msgEl) {
  inputEl.classList.remove('error');
  if (msgEl) { msgEl.className = 'field-msg'; msgEl.textContent = ''; }
}

/* ─── REGISTER USER ──────────────────────────────────────────── */
async function registerUser() {
  const nameEl    = document.getElementById('fullName');
  const emailEl   = document.getElementById('email');
  const pwEl      = document.getElementById('password');
  const cpwEl     = document.getElementById('confirmPassword');
  const nameMsgEl = document.getElementById('nameMsg');
  const emailMsgEl= document.getElementById('emailMsg');
  const pwMsgEl   = document.getElementById('pwMsg');
  const cpwMsgEl  = document.getElementById('cpwMsg');

  const name     = nameEl.value.trim();
  const email    = emailEl.value.trim().toLowerCase();
  const password = pwEl.value;
  const confirmPw= cpwEl.value;

  let valid = true;
  if (!name || name.length < 2) { setFieldError(nameEl, nameMsgEl, 'Name required.'); valid = false; }
  if (!email || !isValidEmail(email)) { setFieldError(emailEl, emailMsgEl, 'Valid email required.'); valid = false; }
  if (!password || password.length < 6) { setFieldError(pwEl, pwMsgEl, 'Min 6 chars.'); valid = false; }
  if (password !== confirmPw) { setFieldError(cpwEl, cpwMsgEl, 'Passwords mismatch.'); valid = false; }

  if (!valid) return;

  const btn = document.querySelector('.btn-auth');
  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  const res = await VelouraAPI.register(name, email, password);
  if (res.ok) {
    showToast('Account created! Sign in now.', '✓', 'toast-gold');
    setTimeout(() => window.location.href = 'login.html', 1500);
  } else {
    showToast(res.data?.error || 'Registration failed', '✕', 'toast-error');
    btn.disabled = false;
    btn.textContent = 'Sign Up';
  }
}

/* ─── LOGIN USER ─────────────────────────────────────────────── */
async function loginUser() {
  const emailEl  = document.getElementById('email');
  const pwEl     = document.getElementById('password');
  const emailMsgEl = document.getElementById('emailMsg');
  const pwMsgEl    = document.getElementById('pwMsg');

  const email    = emailEl.value.trim().toLowerCase();
  const password = pwEl.value;

  if (!email || !password) {
    showToast('Please enter credentials', 'error');
    return;
  }

  const btn = document.querySelector('.btn-auth');
  btn.disabled = true;
  btn.textContent = 'Signing In...';

  const res = await VelouraAPI.login(email, password);
  if (res.ok && res.data?.user) {
    showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, '✓', 'toast-gold');
    setTimeout(() => window.location.href = 'index.html', 1200);
  } else {
    showToast(res.data?.error || 'Login failed - unexpected response', '✕', 'toast-error');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

/* ─── PASSWORD TOGGLES ───────────────────────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrap').querySelector('input');
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.querySelector('.eye-open').style.display = isText ? 'block' : 'none';
      btn.querySelector('.eye-closed').style.display = isText ? 'none' : 'block';
    });
  });
}

/* ─── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => { e.preventDefault(); registerUser(); });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => { e.preventDefault(); loginUser(); });
    // Only redirect if actually logged in (double check token)
    if (VelouraAPI.isLoggedIn()) {
      const user = VelouraAPI.getCurrentUser();
      if (user) window.location.href = 'index.html';
      else VelouraAPI.logout(); // Stale state, clean up
    }
  }
});