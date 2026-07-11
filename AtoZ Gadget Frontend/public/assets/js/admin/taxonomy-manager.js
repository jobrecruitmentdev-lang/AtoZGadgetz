/**
 * Admin Taxonomy Manager Controller
 * Handles Categories, SubCategories, and Brands
 */

import { adminApi } from './admin-api.js';
import { ui } from '../components/ui.js';

// ── Categories & SubCategories ──────────────────────────────────────────

export async function loadCategories() {
  const catBody = document.getElementById('admin-categories-table');
  const subBody = document.getElementById('admin-subcategories-table');
  
  catBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';
  subBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

  try {
    const [categories, subcategories] = await Promise.all([
      adminApi.getCategories(),
      adminApi.getSubCategories()
    ]);

    // Render Categories
    if (categories.length === 0) {
      catBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No categories found.</td></tr>';
    } else {
      catBody.innerHTML = categories.map(c => `
        <tr>
          <td>#${c.id}</td>
          <td>${c.image ? `<img src="${c.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);">` : '-'}</td>
          <td><strong>${c.name}</strong><br><small style="color:var(--admin-text-muted)">${c.slug}</small></td>
          <td>${c.description ? c.description.substring(0, 30) + '...' : '-'}</td>
          <td><span class="admin-badge ${c.status === 'active' ? 'success' : 'danger'}">${c.status || 'Active'}</span></td>
          <td>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" onclick="window.adminApp.editCategory(${c.id}, false)">Edit</button>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: var(--admin-danger); border-color: var(--admin-danger);" onclick="window.adminApp.deleteCategory(${c.id}, false)">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    // Render SubCategories
    if (subcategories.length === 0) {
      subBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No subcategories found.</td></tr>';
    } else {
      subBody.innerHTML = subcategories.map(s => `
        <tr>
          <td>#${s.id}</td>
          <td><strong>${s.name}</strong><br><small style="color:var(--admin-text-muted)">${s.slug}</small></td>
          <td>Category ID: ${s.parent_category_id}</td>
          <td><span class="admin-badge ${s.status === 'active' ? 'success' : 'danger'}">${s.status || 'Active'}</span></td>
          <td>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" onclick="window.adminApp.editCategory(${s.id}, true)">Edit</button>
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: var(--admin-danger); border-color: var(--admin-danger);" onclick="window.adminApp.deleteCategory(${s.id}, true)">Delete</button>
          </td>
        </tr>
      `).join('');
    }

  } catch (e) {
    catBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error: ${e.message}</td></tr>`;
  }
}

// ── Brands ──────────────────────────────────────────────────────────────

export async function loadBrands() {
  const tbody = document.getElementById('admin-brands-table');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading brands...</td></tr>';
  
  try {
    const brands = await adminApi.getBrands();
    
    if (brands.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No brands found.</td></tr>';
      return;
    }

    tbody.innerHTML = brands.map(b => `
      <tr>
        <td>#${b.id}</td>
        <td>${b.logo ? `<img src="${b.logo}" style="width:50px;height:auto;border-radius:4px;border:1px solid var(--admin-border);">` : '-'}</td>
        <td><strong>${b.name}</strong><br><small style="color:var(--admin-text-muted)">${b.slug}</small></td>
        <td><span class="admin-badge ${b.status === 'active' ? 'success' : 'danger'}">${b.status || 'Active'}</span></td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" onclick="window.adminApp.editBrand(${b.id})">Edit</button>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: var(--admin-danger); border-color: var(--admin-danger);" onclick="window.adminApp.deleteBrand(${b.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error loading brands.</td></tr>`;
  }
}

// ── DOM Listeners & Actions ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ---- Categories UI Logic ----
  const catModal = document.getElementById('admin-category-modal');
  if (catModal) {
    document.getElementById('btn-admin-add-category').addEventListener('click', () => {
      openCategoryModal('category');
    });

    document.getElementById('btn-admin-add-subcategory').addEventListener('click', () => {
      openCategoryModal('subcategory');
    });

    document.getElementById('cat-image-upload').addEventListener('change', async (e) => {
      await handleGlobalUpload(e, 'categories', 'cat-image-url', 'cat-image-preview');
    });

    document.getElementById('admin-category-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const mode = document.getElementById('cat-mode').value;
      const id = document.getElementById('cat-id').value;
      
      const data = {
        name: document.getElementById('cat-name').value,
        status: 'active'
      };

      if (mode === 'category') {
        data.description = document.getElementById('cat-desc').value;
        data.image = document.getElementById('cat-image-url').value || null;
      } else {
        data.parent_category_id = parseInt(document.getElementById('cat-parent-id').value, 10);
      }

      const btn = document.getElementById('btn-cat-save');
      try {
        btn.disabled = true;
        btn.innerHTML = 'Saving...';
        
        if (id) {
          if (mode === 'category') await adminApi.updateCategory(id, data);
          else await adminApi.updateSubCategory(id, data);
          ui.showToast('Success', 'Updated successfully', 'success');
        } else {
          if (mode === 'category') await adminApi.createCategory(data);
          else await adminApi.createSubCategory(data);
          ui.showToast('Success', 'Created successfully', 'success');
        }
        
        catModal.classList.remove('active');
        loadCategories();
      } catch (err) {
        ui.showToast('Error', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Category';
      }
    });
  }

  // ---- Brands UI Logic ----
  const brandModal = document.getElementById('admin-brand-modal');
  if (brandModal) {
    document.getElementById('btn-admin-add-brand').addEventListener('click', () => {
      document.getElementById('brand-modal-title').textContent = 'Create Brand';
      document.getElementById('admin-brand-form').reset();
      document.getElementById('brand-id').value = '';
      document.getElementById('brand-logo-url').value = '';
      document.getElementById('brand-logo-preview').style.display = 'none';
      brandModal.classList.add('active');
    });

    document.getElementById('brand-logo-upload').addEventListener('change', async (e) => {
      await handleGlobalUpload(e, 'brands', 'brand-logo-url', 'brand-logo-preview');
    });

    document.getElementById('admin-brand-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('brand-id').value;
      
      const data = {
        name: document.getElementById('brand-name').value,
        logo: document.getElementById('brand-logo-url').value || null,
        status: 'active'
      };

      const btn = document.getElementById('btn-brand-save');
      try {
        btn.disabled = true;
        btn.innerHTML = 'Saving...';
        
        if (id) {
          await adminApi.updateBrand(id, data);
          ui.showToast('Success', 'Brand updated', 'success');
        } else {
          await adminApi.createBrand(data);
          ui.showToast('Success', 'Brand created', 'success');
        }
        
        brandModal.classList.remove('active');
        loadBrands();
      } catch (err) {
        ui.showToast('Error', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Brand';
      }
    });
  }

  // Helpers
  async function handleGlobalUpload(e, type, urlInputId, previewContainerId) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      ui.showToast('Uploading', 'Uploading file...', 'info');
      const res = await adminApi.uploadGlobalFile(file, type);
      
      // Update DOM
      document.getElementById(urlInputId).value = res.file_path;
      const preview = document.getElementById(previewContainerId);
      preview.querySelector('img').src = res.file_path;
      preview.style.display = 'block';
      
      ui.showToast('Success', 'File uploaded', 'success');
    } catch (err) {
      ui.showToast('Error', err.message, 'error');
    } finally {
      e.target.value = '';
    }
  }

  function openCategoryModal(mode) {
    document.getElementById('cat-modal-title').textContent = mode === 'category' ? 'Create Category' : 'Create SubCategory';
    document.getElementById('admin-category-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-mode').value = mode;
    
    // Toggle fields
    document.getElementById('cat-desc-group').style.display = mode === 'category' ? 'block' : 'none';
    document.getElementById('cat-image-group').style.display = mode === 'category' ? 'block' : 'none';
    document.getElementById('cat-parent-group').style.display = mode === 'subcategory' ? 'block' : 'none';
    
    document.getElementById('cat-image-url').value = '';
    document.getElementById('cat-image-preview').style.display = 'none';

    document.getElementById('admin-category-modal').classList.add('active');
  }

  // Global Attached Methods
  window.adminApp.editCategory = async (id, isSub) => {
    try {
      const mode = isSub ? 'subcategory' : 'category';
      // Fetch full list and find (simple approach for now)
      let item;
      if (isSub) {
        const list = await adminApi.getSubCategories();
        item = list.find(x => x.id === id);
      } else {
        const list = await adminApi.getCategories();
        item = list.find(x => x.id === id);
      }
      if (!item) return;

      openCategoryModal(mode);
      document.getElementById('category-modal-title').textContent = `Edit ${item.name}`;
      document.getElementById('cat-id').value = item.id;
      document.getElementById('cat-name').value = item.name;

      if (!isSub) {
        document.getElementById('cat-desc').value = item.description || '';
        if (item.image) {
          document.getElementById('cat-image-url').value = item.image;
          const preview = document.getElementById('cat-image-preview');
          preview.querySelector('img').src = item.image;
          preview.style.display = 'block';
        }
      } else {
        document.getElementById('cat-parent-id').value = item.parent_category_id;
      }
    } catch (e) {
      ui.showToast('Error', 'Failed to load details', 'error');
    }
  };

  window.adminApp.deleteCategory = async (id, isSub) => {
    if (!confirm(`Delete this ${isSub ? 'SubCategory' : 'Category'}?`)) return;
    try {
      if (isSub) await adminApi.deleteSubCategory(id);
      else await adminApi.deleteCategory(id);
      ui.showToast('Success', 'Deleted successfully', 'success');
      loadCategories();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

  window.adminApp.editBrand = async (id) => {
    try {
      const list = await adminApi.getBrands();
      const item = list.find(x => x.id === id);
      if (!item) return;

      document.getElementById('brand-modal-title').textContent = `Edit Brand`;
      document.getElementById('brand-id').value = item.id;
      document.getElementById('brand-name').value = item.name;

      if (item.logo) {
        document.getElementById('brand-logo-url').value = item.logo;
        const preview = document.getElementById('brand-logo-preview');
        preview.querySelector('img').src = item.logo;
        preview.style.display = 'block';
      } else {
        document.getElementById('brand-logo-url').value = '';
        document.getElementById('brand-logo-preview').style.display = 'none';
      }

      document.getElementById('admin-brand-modal').classList.add('active');
    } catch (e) {
      ui.showToast('Error', 'Failed to load details', 'error');
    }
  };

  window.adminApp.deleteBrand = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await adminApi.deleteBrand(id);
      ui.showToast('Success', 'Brand deleted', 'success');
      loadBrands();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

});
