/**
 * Grid/List layout view toggle module (Caches layout selections in localStorage)
 */

export function initViewToggle(gridContainerId, onToggleCallback) {
  const container = document.getElementById(gridContainerId);
  const togglesWrapper = document.getElementById('view-toggles-container');
  if (!container || !togglesWrapper) return;

  // Retrieve cached setting or default to grid view layout
  const currentPreference = localStorage.getItem('catalog-view-preference') || 'grid';
  applyView(currentPreference);

  // Bind click handlers to triggers
  togglesWrapper.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      applyView(targetView);
    });
  });

  function applyView(view) {
    localStorage.setItem('catalog-view-preference', view);

    // Update active visual button elements state
    togglesWrapper.querySelectorAll('.view-toggle-btn').forEach(b => {
      if (b.dataset.view === view) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update container layout css targets
    if (view === 'list') {
      container.classList.remove('grid');
      container.classList.add('list-layout'); // Class for rendering list layout rows
    } else {
      container.classList.remove('list-layout');
      container.classList.add('grid');
    }

    if (typeof onToggleCallback === 'function') {
      onToggleCallback(view);
    }
  }
}
