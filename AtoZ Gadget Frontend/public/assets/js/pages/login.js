/**
 * Login Page Controller
 */

import { auth } from '../modules/auth.js';
import { ui } from '../components/ui.js';

function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit-btn');
  const errorEmail = document.getElementById('error-email');
  const errorPassword = document.getElementById('error-password');

  // Toggle Password Visibility
  const toggleBtn = form.querySelector('.pwd-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  function clearErrors() {
    errorEmail.style.display = 'none';
    errorPassword.style.display = 'none';
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
  }

  function showError(el, input, msg) {
    el.innerText = msg;
    el.style.display = 'block';
    input.classList.add('error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;
    if (!email) {
      showError(errorEmail, emailInput, 'Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(errorEmail, emailInput, 'Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      showError(errorPassword, passwordInput, 'Password is required');
      isValid = false;
    }

    if (!isValid) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span> Logging in...';

      await auth.login(email, password);

      ui.showToast('Success', 'Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);

    } catch (err) {
      ui.showToast('Login Failed', err.message || 'Invalid credentials. Please try again.', 'error');
      showError(errorPassword, passwordInput, err.message || 'Invalid credentials');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Log In';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
  initLoginPage();
}
