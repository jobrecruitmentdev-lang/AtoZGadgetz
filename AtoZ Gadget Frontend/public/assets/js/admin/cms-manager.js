/**
 * Admin CMS & Media Manager
 * Handles Banners and Global Media Library.
 */

import { adminApi } from './admin-api.js';
import { ui } from '../components/ui.js';

let allBanners = [];
let allMedia = [];

export async function loadCMS() {
  await Promise.all([
    loadBanners(),
    loadMedia()
  ]);
}

// ── Banners ─────────────────────────────────────────────────────────────
async function loadBanners() {
  const tbody = document.getElementById('admin-banners-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading banners...</td></tr>';
  
  try {
    allBanners = await adminApi.getBanners();
    renderBannersTable(allBanners);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Error loading banners: ${e.message}</td></tr>`;
  }
}

function renderBannersTable(banners) {
  const tbody = document.getElementById('admin-banners-table');
  if (!tbody) return;

  if (banners.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No banners found.</td></tr>';
    return;
  }

  tbody.innerHTML = banners.map(b => `
    <tr>
      <td>
        <img src="http://localhost:8000${b.image_url}" alt="banner" style="width: 80px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-light);">
      </td>
      <td>
        <strong>${b.title}</strong><br>
        <small style="color:var(--text-secondary);">${b.subtitle || ''}</small>
      </td>
      <td><span class="admin-badge info" style="text-transform: capitalize;">${b.section}</span></td>
      <td><a href="${b.target_url}" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 12px;">${b.target_url}</a></td>
      <td>${b.display_order}</td>
      <td><span class="admin-badge ${b.is_active ? 'success' : 'danger'}">${b.is_active ? 'Active' : 'Hidden'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" onclick="window.adminCmsManager.openBannerModal(${b.id})">Edit</button>
        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: var(--danger); border-color: var(--danger);" onclick="window.adminCmsManager.deleteBanner(${b.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ── Media Library ───────────────────────────────────────────────────────
async function loadMedia() {
  const grid = document.getElementById('admin-media-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Loading media...</div>';
  
  try {
    allMedia = await adminApi.getMedia();
    renderMediaGrid(allMedia);
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:red;">Error loading media: ${e.message}</div>`;
  }
}

function renderMediaGrid(media) {
  const grid = document.getElementById('admin-media-grid');
  if (!grid) return;

  if (media.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">No media assets found.</div>';
    return;
  }

  grid.innerHTML = media.map(m => `
    <div class="media-card">
      <img src="http://localhost:8000${m.url}" alt="${m.filename}">
      <div class="media-actions">
        <button class="btn btn-outline" style="padding: 2px 6px; font-size: 10px;" onclick="navigator.clipboard.writeText('http://localhost:8000${m.url}'); alert('URL Copied!')">Copy URL</button>
        <button class="btn btn-outline" style="padding: 2px 6px; font-size: 10px; color: var(--danger); border-color: var(--danger);" onclick="window.adminCmsManager.deleteMedia(${m.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── DOM Listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('admin-banner-modal');
  const form = document.getElementById('admin-banner-form');
  if (!modal || !form) return;

  // Tabs logic
  const tabs = document.querySelectorAll('.cms-tab');
  const panels = document.querySelectorAll('.cms-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  window.adminCmsManager = {
    openBannerModal: (id = null) => {
      form.reset();
      const help = document.getElementById('banner_image_help');
      
      if (id) {
        const b = allBanners.find(x => x.id === id);
        if (!b) return;
        document.getElementById('banner-modal-title').textContent = 'Edit Banner';
        document.getElementById('banner_id').value = b.id;
        document.getElementById('banner_title').value = b.title;
        document.getElementById('banner_subtitle').value = b.subtitle || '';
        document.getElementById('banner_target_url').value = b.target_url;
        document.getElementById('banner_section').value = b.section;
        document.getElementById('banner_display_order').value = b.display_order;
        document.getElementById('banner_is_active').checked = b.is_active;
        
        document.getElementById('banner_image').required = false;
        help.style.display = 'block';
      } else {
        document.getElementById('banner-modal-title').textContent = 'Create Banner';
        document.getElementById('banner_id').value = '';
        document.getElementById('banner_image').required = true;
        help.style.display = 'none';
      }
      
      modal.classList.add('active');
    },

    deleteBanner: async (id) => {
      if (!confirm('Are you sure you want to delete this banner?')) return;
      try {
        await adminApi.deleteBanner(id);
        ui.showToast('Success', 'Banner deleted', 'success');
        loadBanners();
      } catch (e) {
        ui.showToast('Error', e.message, 'error');
      }
    },

    deleteMedia: async (id) => {
      if (!confirm('Are you sure you want to delete this asset? It may break images on the site.')) return;
      try {
        await adminApi.deleteMedia(id);
        ui.showToast('Success', 'Media deleted', 'success');
        loadMedia();
      } catch (e) {
        ui.showToast('Error', e.message, 'error');
      }
    }
  };

  // Submit Banner Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-banner-submit');
    const ogText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const fd = new FormData(form);
      // FormData sends string "on" if checkbox checked, or nothing if not. Fix it:
      fd.set('is_active', fd.has('is_active') ? 'true' : 'false');
      
      const id = fd.get('id');
      if (!id && !fd.get('image').size) {
        throw new Error("Image is required for new banners.");
      }
      
      // If editing and no new image, delete the empty file from formData so backend doesn't complain
      if (id && !fd.get('image').size) {
        fd.delete('image');
      }

      if (id) {
        await adminApi.updateBanner(id, fd);
        ui.showToast('Success', 'Banner updated', 'success');
      } else {
        await adminApi.createBanner(fd);
        ui.showToast('Success', 'Banner created', 'success');
      }
      
      modal.classList.remove('active');
      loadBanners();
    } catch (err) {
      ui.showToast('Error', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = ogText;
    }
  });

  // Media Upload Form
  const mediaForm = document.getElementById('cms-media-upload-form');
  if (mediaForm) {
    mediaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('cms-media-upload-btn');
      btn.disabled = true;
      btn.textContent = '...';

      try {
        const fd = new FormData(mediaForm);
        await adminApi.uploadMedia(fd);
        ui.showToast('Success', 'Media uploaded', 'success');
        mediaForm.reset();
        loadMedia();
      } catch (err) {
        ui.showToast('Error', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Upload';
      }
    });
  }

});
