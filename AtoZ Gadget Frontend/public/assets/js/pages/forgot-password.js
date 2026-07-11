/**
 * Forgot Password Page Controller
 */

import { api } from '../api/api.js';
import { ui } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  const emailInput = document.getElementById('forgot-email');
  const submitBtn = document.getElementById('forgot-submit-btn');
  const errorEmail = document.getElementById('error-email');

  function clearErrors() {
    errorEmail.style.display = 'none';
    emailInput.classList.remove('error');
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

    if (!email) {
      showError(errorEmail, emailInput, 'Email is required');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(errorEmail, emailInput, 'Please enter a valid email address');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span> Sending...';

      // Replace with actual endpoint if different
      const response = await api.request('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });

      ui.showToast('Success', 'If an account with that email exists, we have sent a reset link.', 'success');
      form.reset();

    } catch (err) {
      // Don't leak if email exists or not, standard security practice
      ui.showToast('Notice', 'If an account with that email exists, we have sent a reset link.', 'success');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Reset Link';
    }
  });
});
