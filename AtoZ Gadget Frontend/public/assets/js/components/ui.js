/**
 * Global UI Element Controller
 * Controls loader states, toast alerts, modals, dropdowns, and responsiveness toggles.
 */

export const ui = {
  /**
   * Display a programmatic Toast Notification
   */
  showToast(title, message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon mapping (SVG)
    let icon = '';
    if (type === 'success') {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close Toast">&times;</button>
    `;

    container.appendChild(toast);

    // Close button event
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.closeToast(toast);
    });

    // Auto dismiss
    setTimeout(() => {
      this.closeToast(toast);
    }, duration);
  },

  closeToast(toast) {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  },

  /**
   * Modal bindings
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Loader actions
   */
  showLoader() {
    const loader = document.getElementById('global-page-loader');
    if (loader) {
      loader.style.display = 'flex';
    }
  },

  hideLoader() {
    const loader = document.getElementById('global-page-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
};

// Document Load initializations
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu hamburger toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Bind all close-modal buttons
  document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-wrapper');
      if (modal) {
        ui.closeModal(modal.id);
      }
    });
  });

  // Global HTTP API Loading Listeners
  document.addEventListener('api:loading:start', () => {
    ui.showLoader();
  });
  
  document.addEventListener('api:loading:end', () => {
    ui.hideLoader();
  });
});
