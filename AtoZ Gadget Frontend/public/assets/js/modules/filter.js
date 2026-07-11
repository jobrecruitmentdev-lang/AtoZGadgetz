import { fetchAPI } from '../api/api.js';

export class FilterManager {
  constructor(options = {}) {
    this.containerId = options.containerId || 'catalog-filter-sidebar';
    this.onChange = options.onChange || (() => {});
    
    // Holds active selection states
    this.state = {
      categories: [],
      brands: [],
      priceMax: 150000,
      inStock: false,
      discount: false
    };

    this.categoriesData = [];
    this.brandsData = [];
    this.lockedCategory = options.lockedCategory || null; // category id if locked
    this.lockedBrand = options.lockedBrand || null;       // brand id if locked
  }

  async loadMetadata() {
    try {
      // Parallel fetch categories and brands
      const [catsRes, brandsRes] = await Promise.all([
        fetchAPI('/api/categories'),
        fetchAPI('/api/brands')
      ]);

      if (catsRes && catsRes.success) {
        this.categoriesData = catsRes.data || [];
      }
      if (brandsRes && brandsRes.success) {
        this.brandsData = brandsRes.data || [];
      }

      this.renderFilterOptions();
    } catch (err) {
      console.error('Failed to load filter labels:', err);
    }
  }

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Categories parsing
    if (this.lockedCategory) {
      this.state.categories = [this.lockedCategory];
    } else {
      const catsStr = urlParams.get('category');
      this.state.categories = catsStr ? catsStr.split(',').map(Number) : [];
    }

    // Brands parsing
    if (this.lockedBrand) {
      this.state.brands = [this.lockedBrand];
    } else {
      const brandsStr = urlParams.get('brand');
      this.state.brands = brandsStr ? brandsStr.split(',').map(Number) : [];
    }

    // Max Price
    const maxVal = urlParams.get('price_max');
    this.state.priceMax = maxVal ? Number(maxVal) : 150000;

    // Statuses
    this.state.inStock = urlParams.get('instock') === 'true';
    this.state.discount = urlParams.get('discount') === 'true';

    this.syncInputsWithState();
    this.renderChips();
  }

  updateUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Save states to URL (except locked ones)
    if (this.state.categories.length > 0 && !this.lockedCategory) {
      urlParams.set('category', this.state.categories.join(','));
    } else {
      urlParams.delete('category');
    }

    if (this.state.brands.length > 0 && !this.lockedBrand) {
      urlParams.set('brand', this.state.brands.join(','));
    } else {
      urlParams.delete('brand');
    }

    if (this.state.priceMax < 150000) {
      urlParams.set('price_max', this.state.priceMax.toString());
    } else {
      urlParams.delete('price_max');
    }

    if (this.state.inStock) {
      urlParams.set('instock', 'true');
    } else {
      urlParams.delete('instock');
    }

    if (this.state.discount) {
      urlParams.set('discount', 'true');
    } else {
      urlParams.delete('discount');
    }

    // Replace browser location query without hard reload
    const queryStr = urlParams.toString();
    const cleanPath = window.location.pathname + (queryStr ? '?' + queryStr : '');
    window.history.replaceState({ path: cleanPath }, '', cleanPath);
  }

  renderFilterOptions() {
    const catsBox = document.getElementById('filter-categories-container');
    const brandsBox = document.getElementById('filter-brands-container');

    if (catsBox) {
      if (this.lockedCategory) {
        // If locked category, hide categories filters group or show text
        const grp = catsBox.closest('.filter-group');
        if (grp) grp.style.display = 'none';
      } else if (this.categoriesData.length > 0) {
        catsBox.innerHTML = this.categoriesData.map(c => `
          <label class="filter-checkbox-label">
            <input type="checkbox" class="filter-checkbox category-chk" value="${c.id}" data-name="${c.name}">
            <span>${c.name}</span>
          </label>
        `).join('');
      }
    }

    if (brandsBox) {
      if (this.lockedBrand) {
        const grp = brandsBox.closest('.filter-group');
        if (grp) grp.style.display = 'none';
      } else if (this.brandsData.length > 0) {
        brandsBox.innerHTML = this.brandsData.map(b => `
          <label class="filter-checkbox-label">
            <input type="checkbox" class="filter-checkbox brand-chk" value="${b.id}" data-name="${b.name}">
            <span>${b.name}</span>
          </label>
        `).join('');
      }
    }

    this.bindEvents();
    this.syncInputsWithState();
  }

  bindEvents() {
    const sidebar = document.getElementById(this.containerId);
    if (!sidebar) return;

    // Categories chk triggers
    sidebar.querySelectorAll('.category-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const val = Number(chk.value);
        if (chk.checked) {
          if (!this.state.categories.includes(val)) this.state.categories.push(val);
        } else {
          this.state.categories = this.state.categories.filter(id => id !== val);
        }
        this.onStateChanged();
      });
    });

    // Brands chk triggers
    sidebar.querySelectorAll('.brand-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const val = Number(chk.value);
        if (chk.checked) {
          if (!this.state.brands.includes(val)) this.state.brands.push(val);
        } else {
          this.state.brands = this.state.brands.filter(id => id !== val);
        }
        this.onStateChanged();
      });
    });

    // Slider ranges
    const slider = document.getElementById('filter-price-slider');
    const label = document.getElementById('price-slider-max-display');
    if (slider) {
      slider.addEventListener('input', () => {
        const value = Number(slider.value);
        if (label) label.innerText = `Max: ₹${value.toLocaleString('en-IN')}`;
      });
      slider.addEventListener('change', () => {
        this.state.priceMax = Number(slider.value);
        this.onStateChanged();
      });
    }

    // Availability
    const stockChk = document.getElementById('filter-in-stock-only');
    if (stockChk) {
      stockChk.addEventListener('change', () => {
        this.state.inStock = stockChk.checked;
        this.onStateChanged();
      });
    }

    // Offers
    const discountChk = document.getElementById('filter-discount-only');
    if (discountChk) {
      discountChk.addEventListener('change', () => {
        this.state.discount = discountChk.checked;
        this.onStateChanged();
      });
    }

    // Drawer reset button
    const clearBtn = document.getElementById('filter-clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.resetFilters());
    }

    const emptyClearBtn = document.getElementById('empty-state-clear-btn');
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  syncInputsWithState() {
    const sidebar = document.getElementById(this.containerId);
    if (!sidebar) return;

    sidebar.querySelectorAll('.category-chk').forEach(chk => {
      chk.checked = this.state.categories.includes(Number(chk.value));
    });

    sidebar.querySelectorAll('.brand-chk').forEach(chk => {
      chk.checked = this.state.brands.includes(Number(chk.value));
    });

    const slider = document.getElementById('filter-price-slider');
    const label = document.getElementById('price-slider-max-display');
    if (slider) {
      slider.value = this.state.priceMax.toString();
      if (label) label.innerText = `Max: ₹${this.state.priceMax.toLocaleString('en-IN')}`;
    }

    const stockChk = document.getElementById('filter-in-stock-only');
    if (stockChk) stockChk.checked = this.state.inStock;

    const discountChk = document.getElementById('filter-discount-only');
    if (discountChk) discountChk.checked = this.state.discount;
  }

  onStateChanged() {
    this.updateUrlParams();
    this.renderChips();
    this.onChange(this.state);
  }

  resetFilters() {
    this.state = {
      categories: this.lockedCategory ? [this.lockedCategory] : [],
      brands: this.lockedBrand ? [this.lockedBrand] : [],
      priceMax: 150000,
      inStock: false,
      discount: false
    };
    this.syncInputsWithState();
    this.onStateChanged();
  }

  renderChips() {
    const panel = document.getElementById('active-filters-panel');
    const list = document.getElementById('active-chips-list');
    const template = document.getElementById('filter-chip-template');

    if (!panel || !list || !template) return;

    list.innerHTML = '';
    let chipCount = 0;

    // Categories
    this.state.categories.forEach(id => {
      if (id === this.lockedCategory) return; // Hide locked items from chips list
      const info = this.categoriesData.find(c => c.id === id);
      const label = info ? info.name : `Category ${id}`;
      this.appendChip(list, template, 'category', id, label);
      chipCount++;
    });

    // Brands
    this.state.brands.forEach(id => {
      if (id === this.lockedBrand) return;
      const info = this.brandsData.find(b => b.id === id);
      const label = info ? info.name : `Brand ${id}`;
      this.appendChip(list, template, 'brand', id, label);
      chipCount++;
    });

    // Price Max
    if (this.state.priceMax < 150000) {
      this.appendChip(list, template, 'price_max', this.state.priceMax, `Under ₹${this.state.priceMax.toLocaleString('en-IN')}`);
      chipCount++;
    }

    // Availability
    if (this.state.inStock) {
      this.appendChip(list, template, 'instock', 'true', 'In Stock');
      chipCount++;
    }

    // Offer discounts
    if (this.state.discount) {
      this.appendChip(list, template, 'discount', 'true', 'Offers Only');
      chipCount++;
    }

    if (chipCount > 0) {
      panel.style.display = 'flex';
      
      // Bind chip remove events
      list.querySelectorAll('.filter-chip').forEach(chip => {
        const type = chip.dataset.filterType;
        const val = chip.dataset.filterValue;
        chip.querySelector('.remove-chip-btn').addEventListener('click', () => {
          this.removeChip(type, val);
        });
      });

      const clearBtn = document.getElementById('clear-all-chips-btn');
      if (clearBtn) {
        clearBtn.onclick = () => this.resetFilters();
      }
    } else {
      panel.style.display = 'none';
    }
  }

  appendChip(container, template, type, value, label) {
    const clone = template.content.cloneNode(true);
    const chip = clone.querySelector('.filter-chip');
    chip.dataset.filterType = type;
    chip.dataset.filterValue = value.toString();
    clone.querySelector('.chip-label').innerText = label;
    container.appendChild(clone);
  }

  removeChip(type, value) {
    if (type === 'category') {
      this.state.categories = this.state.categories.filter(x => x !== Number(value));
    } else if (type === 'brand') {
      this.state.brands = this.state.brands.filter(x => x !== Number(value));
    } else if (type === 'price_max') {
      this.state.priceMax = 150000;
    } else if (type === 'instock') {
      this.state.inStock = false;
    } else if (type === 'discount') {
      this.state.discount = false;
    }

    this.syncInputsWithState();
    this.onStateChanged();
  }
}
