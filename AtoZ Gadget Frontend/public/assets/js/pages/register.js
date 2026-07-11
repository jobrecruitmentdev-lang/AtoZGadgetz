/**
 * Register Page Controller
 */

import { auth } from '../modules/auth.js';
import { ui } from '../components/ui.js';

function initRegisterPage() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const fnameInput = document.getElementById('reg-firstname');
  const lnameInput = document.getElementById('reg-lastname');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');
  const termsCheckbox = document.getElementById('reg-terms');
  const submitBtn = document.getElementById('reg-submit-btn');

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

    const first_name = fnameInput.value.trim();
    const last_name = lnameInput.value.trim();
    const email = emailInput.value.trim();
    const mobileInput = document.getElementById('reg-mobile');
    const mobile = mobileInput ? mobileInput.value.trim() : '';
    const password = passwordInput.value;

    let isValid = true;

    if (!first_name) {
      showError('firstname', fnameInput, 'First name is required');
      isValid = false;
    }
    if (!last_name) {
      showError('lastname', lnameInput, 'Last name is required');
      isValid = false;
    }
    if (!email) {
      showError('email', emailInput, 'Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', emailInput, 'Enter a valid email');
      isValid = false;
    }
    
    if (!mobile) {
      if(mobileInput) showError('mobile', mobileInput, 'Mobile number is required');
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(mobile.replace(/[- ]/g, ''))) {
      if(mobileInput) showError('mobile', mobileInput, 'Enter a valid mobile number');
      isValid = false;
    }

    if (!password || password.length < 8) {
      showError('password', passwordInput, 'Password must be at least 8 characters');
      isValid = false;
    }
    if (!termsCheckbox.checked) {
      ui.showToast('Validation Error', 'You must agree to the Terms of Service.', 'error');
      isValid = false;
    }

    if (!isValid) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span> Creating account...';

      // Depends on backend expected schema:
      // Typically: { first_name, last_name, email, mobile, password }
      await auth.register({ first_name, last_name, email, mobile, password });

      ui.showToast('Welcome!', 'Your account has been created successfully.', 'success');
      
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);

    } catch (err) {
      ui.showToast('Registration Failed', err.message || 'Could not create account.', 'error');
      // If error mentions email, highlight it
      if (err.message && err.message.toLowerCase().includes('email')) {
        showError('email', emailInput, err.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account';
    }
  }); // end form submit

} // end initRegisterPage

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRegisterPage);
} else {
  initRegisterPage();
}
