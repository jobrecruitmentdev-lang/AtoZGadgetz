/**
 * Reset Password Page Controller
 */

import { api } from '../api/api.js';
import { ui } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  if (!form) return;

  const passwordInput = document.getElementById('reset-password');
  const confirmInput = document.getElementById('reset-confirm');
  const tokenInput = document.getElementById('reset-token');
  const submitBtn = document.getElementById('reset-submit-btn');

  // Toggle Password Visibility
  const toggleBtn = form.querySelector('.pwd-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  function clearErrors() {
    form.querySelectorAll('.auth-error').forEach(el => el.style.display = 'none');
    form.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
  }

  function showError(id, input, msg) {
    const el = document.getElementById(`error-${id}`);
    if (el) {
      el.innerText = msg;
      el.style.display = 'block';
    }
    input.classList.add('error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const password = passwordInput.value;
    const confirm = confirmInput.value;
    const token = tokenInput.value;

    let isValid = true;

    if (!token) {
      ui.showToast('Invalid Request', 'Reset token is missing from the URL.', 'error');
      return;
    }

    if (!password || password.length < 8) {
      showError('password', passwordInput, 'Password must be at least 8 characters');
      isValid = false;
    }

    if (password !== confirm) {
      showError('confirm', confirmInput, 'Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span> Resetting...';

      // Replace with actual backend endpoint
      await api.request('/api/auth/reset-password', {
        method: 'POST',
        body: { token, new_password: password }
      });

      ui.showToast('Success', 'Your password has been successfully reset. Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      ui.showToast('Error', err.message || 'Failed to reset password. The link might be expired.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Reset Password';
    }
  });
});
