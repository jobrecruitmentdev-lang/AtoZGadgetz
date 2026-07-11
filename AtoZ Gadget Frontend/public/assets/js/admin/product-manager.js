/**
 * Admin Product Manager Controller
 */

import { adminApi } from './admin-api.js';
import { formatCurrency } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';

let allProducts = [];
let editingProductId = null;

export async function loadProducts() {
  const tbody = document.getElementById('admin-products-table');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading products...</td></tr>';
  
  try {
    allProducts = await adminApi.getProducts();
    
    if (allProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
      return;
    }

    tbody.innerHTML = allProducts.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><img src="${p.primary_image || '/public/assets/images/placeholder.png'}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);"></td>
        <td><strong>${p.name}</strong><br><small style="color:var(--admin-text-muted)">${p.slug}</small></td>
        <td>${formatCurrency(p.price)}</td>
        <td>${p.stock_quantity}</td>
        <td><span class="admin-badge ${p.is_active ? 'success' : 'danger'}">${p.is_active ? 'Active' : 'Draft'}</span></td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; margin-right: 4px;" onclick="window.adminApp.editProduct(${p.id})">Edit</button>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: var(--admin-danger); border-color: var(--admin-danger);" onclick="window.adminApp.deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Error loading products.</td></tr>`;
  }
}

// ── Modal State & Tabbing ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('admin-product-modal');
  if (!modal) return;

  // Tabs
  const tabs = document.querySelectorAll('.pm-tab');
  const panels = document.querySelectorAll('.pm-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.disabled) return;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  // Open Modal logic
  document.getElementById('btn-admin-add-product').addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('product-modal-title').textContent = 'Create Product';
    document.getElementById('pm-info-form').reset();
    document.getElementById('pm-id').value = '';
    
    // Disable secondary tabs until product is created
    document.getElementById('tab-pm-images').disabled = true;
    document.getElementById('tab-pm-variants').disabled = true;
    document.getElementById('tab-pm-attributes').disabled = true;
    
    // Switch to first tab
    tabs[0].click();
    modal.classList.add('active');
  });

  // ── Form Submissions ──────────────────────────────────────────────────
  
  // Basic Info Save
  document.getElementById('pm-info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-pm-save');
    const data = {
      name: document.getElementById('pm-name').value,
      slug: document.getElementById('pm-slug').value,
      description: document.getElementById('pm-desc').value,
      price: parseFloat(document.getElementById('pm-price').value),
      stock_quantity: parseInt(document.getElementById('pm-stock').value, 10),
      category_id: parseInt(document.getElementById('pm-cat-id').value, 10),
      brand_id: parseInt(document.getElementById('pm-brand-id').value, 10),
      is_active: true
    };

    try {
      btn.disabled = true;
      btn.innerHTML = 'Saving...';
      
      let savedProduct;
      if (editingProductId) {
        savedProduct = await adminApi.updateProduct(editingProductId, data);
        ui.showToast('Success', 'Product updated', 'success');
      } else {
        savedProduct = await adminApi.createProduct(data);
        editingProductId = savedProduct.id;
        document.getElementById('pm-id').value = savedProduct.id;
        document.getElementById('product-modal-title').textContent = `Edit: ${savedProduct.name}`;
        ui.showToast('Success', 'Product created! You can now add images, variants, and specs.', 'success');
        
        // Unlock tabs
        document.getElementById('tab-pm-images').disabled = false;
        document.getElementById('tab-pm-variants').disabled = false;
        document.getElementById('tab-pm-attributes').disabled = false;
      }
      loadProducts();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save & Continue';
    }
  });

  // Image Upload
  document.getElementById('pm-image-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !editingProductId) return;
    
    const isPrimary = document.getElementById('pm-image-primary').checked;

    try {
      ui.showToast('Uploading', 'Uploading image...', 'info');
      await adminApi.uploadProductImage(editingProductId, file, isPrimary);
      ui.showToast('Success', 'Image uploaded', 'success');
      refreshProductDetails(editingProductId);
      loadProducts();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    } finally {
      e.target.value = ''; // Reset input
    }
  });

  // Add Variant
  document.getElementById('pm-variant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingProductId) return;
    
    const data = {
      name: document.getElementById('pm-var-name').value,
      price_modifier: parseFloat(document.getElementById('pm-var-price').value || 0),
      stock_quantity: 10 // default
    };

    try {
      await adminApi.addProductVariant(editingProductId, data);
      document.getElementById('pm-variant-form').reset();
      refreshProductDetails(editingProductId);
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  });

  // Add Attribute
  document.getElementById('pm-attr-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingProductId) return;
    
    const data = {
      key_name: document.getElementById('pm-attr-key').value,
      value: document.getElementById('pm-attr-val').value
    };

    try {
      await adminApi.addProductAttribute(editingProductId, data);
      document.getElementById('pm-attr-form').reset();
      refreshProductDetails(editingProductId);
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  });

  // Global actions attachment
  window.adminApp.editProduct = async (id) => {
    editingProductId = id;
    const modal = document.getElementById('admin-product-modal');
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    
    // Unlock tabs
    document.getElementById('tab-pm-images').disabled = false;
    document.getElementById('tab-pm-variants').disabled = false;
    document.getElementById('tab-pm-attributes').disabled = false;
    
    // Switch to first tab
    document.querySelectorAll('.pm-tab')[0].click();
    modal.classList.add('active');
    
    await refreshProductDetails(id);
  };

  window.adminApp.deleteProduct = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await adminApi.deleteProduct(id);
      ui.showToast('Success', 'Product deleted.', 'success');
      loadProducts();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

  window.adminApp.deleteProductImage = async (imgId) => {
    if (!confirm('Delete this image?')) return;
    try {
      await adminApi.deleteProductImage(imgId);
      refreshProductDetails(editingProductId);
      loadProducts();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

  window.adminApp.deleteProductVariant = async (varId) => {
    try {
      await adminApi.deleteProductVariant(varId);
      refreshProductDetails(editingProductId);
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

  window.adminApp.deleteProductAttribute = async (attrId) => {
    try {
      await adminApi.deleteProductAttribute(attrId);
      refreshProductDetails(editingProductId);
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

  async function refreshProductDetails(id) {
    try {
      const p = await adminApi.getProduct(id);
      if (!p) return;

      // Populate Basic Info
      document.getElementById('pm-id').value = p.id;
      document.getElementById('pm-name').value = p.name;
      document.getElementById('pm-slug').value = p.slug;
      document.getElementById('pm-desc').value = p.description || '';
      document.getElementById('pm-price').value = p.price;
      document.getElementById('pm-stock').value = p.stock_quantity;
      document.getElementById('pm-cat-id').value = p.category_id || 1;
      document.getElementById('pm-brand-id').value = p.brand_id || 1;

      // Populate Images
      const imgList = document.getElementById('pm-image-list');
      if (p.images && p.images.length > 0) {
        imgList.innerHTML = p.images.map(i => `
          <div style="position:relative; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
            <img src="${i.image_url}" style="width:100%; height:100px; object-fit:cover; display:block;">
            ${i.is_primary ? '<div style="position:absolute; bottom:0; width:100%; background:var(--primary); color:#fff; font-size:10px; text-align:center; padding:2px;">Primary</div>' : ''}
            <button onclick="window.adminApp.deleteProductImage(${i.id})" style="position:absolute; top:4px; right:4px; background:var(--danger); color:#fff; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer;">&times;</button>
          </div>
        `).join('');
      } else {
        imgList.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No images.</div>';
      }

      // Populate Variants
      const varList = document.getElementById('pm-variant-list');
      if (p.variants && p.variants.length > 0) {
        varList.innerHTML = p.variants.map(v => `
          <div style="display:flex; justify-content:space-between; padding:8px 12px; border:1px solid var(--border-light); border-radius:6px; background:#fff;">
            <span><strong>${v.name}</strong> (${formatCurrency(v.price_modifier)})</span>
            <button class="btn btn-outline" style="padding:2px 6px; font-size:12px; color:var(--danger); border:none;" onclick="window.adminApp.deleteProductVariant(${v.id})">Remove</button>
          </div>
        `).join('');
      } else {
        varList.innerHTML = '<div class="empty-state">No variants added.</div>';
      }

      // Populate Attributes
      const attrList = document.getElementById('pm-attr-list');
      if (p.attributes && p.attributes.length > 0) {
        attrList.innerHTML = p.attributes.map(a => `
          <div style="display:flex; justify-content:space-between; padding:8px 12px; border:1px solid var(--border-light); border-radius:6px; background:#fff;">
            <span><strong>${a.key_name}:</strong> ${a.value}</span>
            <button class="btn btn-outline" style="padding:2px 6px; font-size:12px; color:var(--danger); border:none;" onclick="window.adminApp.deleteProductAttribute(${a.id})">Remove</button>
          </div>
        `).join('');
      } else {
        attrList.innerHTML = '<div class="empty-state">No specifications added.</div>';
      }

    } catch (e) {
      console.error(e);
    }
  }

});
