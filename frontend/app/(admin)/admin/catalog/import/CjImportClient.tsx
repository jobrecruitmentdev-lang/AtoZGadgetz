'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  SlidersHorizontal, 
  DollarSign, 
  Layers, 
  CheckSquare, 
  Square,
  Sparkles,
  Zap,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface CjProduct {
  pid: string;
  productNameEn: string;
  productSku: string;
  sellPrice: number;
  productImage: string;
  categoryName: string;
  huntedImageCount?: number;
}

interface ImportState {
  [pid: string]: 'idle' | 'loading' | 'success' | 'error';
}

export function CjImportClient({
  categories,
}: {
  categories: { id: number; name: string; subcategories?: { id: number; name: string }[] }[];
}) {
  // Navigation Tabs: 'database' (Default) vs 'cj_fetch'
  const [activeTab, setActiveTab] = useState<'database' | 'cj_fetch'>('database');

  // Database Staged Products State
  const [stagedProducts, setStagedProducts] = useState<any[]>([]);
  const [loadingStaged, setLoadingStaged] = useState(true);

  // CJ Live Search & Fetch State (Manual trigger only!)
  const [keyword, setKeyword] = useState('gadgets');
  const [results, setResults] = useState<CjProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [importState, setImportState] = useState<ImportState>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [markup, setMarkup] = useState('2.0');
  
  // Resource & Budget Filters
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Quality filter: min images (1 = no filter, fast fetch)
  const [minImages, setMinImages] = useState(1);
  const [searchError, setSearchError] = useState<string | null>(null);

  // CJ API health / visibility
  const [apiHealth, setApiHealth] = useState<{ connected: boolean; tokenType: string; message: string; sampleProductCount: number; totalAvailable: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [adminTaskLoading, setAdminTaskLoading] = useState<'categories' | 'inventory' | 'shipments' | null>(null);
  const [adminTaskMessage, setAdminTaskMessage] = useState<string | null>(null);

  // Selection & Batch Import State
  const [selectedPids, setSelectedPids] = useState<Set<string>>(new Set());
  const [batchImporting, setBatchImporting] = useState(false);

  const selectedCat = categories.find((c) => String(c.id) === selectedCategory);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!selectedCategory) {
      const firstCategoryWithSub = categories.find((cat) => (cat.subcategories?.length || 0) > 0);
      const fallbackCategory = firstCategoryWithSub || categories[0];
      setSelectedCategory(String(fallbackCategory.id));
      const firstSub = fallbackCategory.subcategories?.[0];
      if (firstSub) {
        setSelectedSubcategory(String(firstSub.id));
      }
    }
  }, [categories, selectedCategory]);

  // Load locally saved CJ products from database on initial page load (NO CJ API calls on mount!)
  const loadStagedProducts = async () => {
    setLoadingStaged(true);
    try {
      const data = await fetchApi<any[]>('/api/products');
      if (Array.isArray(data)) {
        const cjProducts = data.filter((p: any) => p.fulfillment_type === 'cj');
        setStagedProducts(cjProducts);
      }
    } catch (err) {
      console.error('Failed to load staged products:', err);
    } finally {
      setLoadingStaged(false);
    }
  };

  useEffect(() => {
    loadStagedProducts();
  }, []);

  // Check CJ API connectivity so the admin can see whether live products are reachable.
  const checkApiHealth = async () => {
    setCheckingHealth(true);
    try {
      const data = await fetchApi<any>('/api/cj/health');
      setApiHealth(data);
    } catch (err: any) {
      setApiHealth({
        connected: false,
        tokenType: 'unknown',
        message: err.message || 'Unable to reach CJ API health endpoint.',
        sampleProductCount: 0,
        totalAvailable: 0,
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const handleDeleteStagedProduct = async (id: number) => {
    if (!confirm('Are you sure you want to remove this product from your database?')) return;
    try {
      await fetchApi(`/api/products/${id}`, { method: 'DELETE' });
      loadStagedProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Manual Trigger: Search/Fetch products from CJ API with consistent pagination.
  const handleFetchFromCj = async (
    e?: React.FormEvent | React.MouseEvent,
    targetPage: number = 1,
    keywordOverride?: string,
  ) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    const activeKeyword = (keywordOverride ?? keyword).trim();
    if (!activeKeyword) return;
    setSearching(true);
    setSearchError(null);
    setPageNum(targetPage);

    try {
      const params = new URLSearchParams();
      params.set('keyword', activeKeyword);
      params.set('page', String(targetPage));
      params.set('size', String(pageSize));
      params.set('minImages', String(minImages));
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const data = await fetchApi<{ list?: CjProduct[] }>(`/api/cj/browse?${params.toString()}`);
      setResults(data?.list || []);
      setSelectedPids(new Set());
    } catch (err: any) {
      setSearchError(err.message || 'Failed to fetch products from CJ Dropshipping');
    } finally {
      setSearching(false);
    }
  };

  const handleFetchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searching) return;
    const nextPage = results.length === 0 ? 1 : pageNum + 1;
    handleFetchFromCj(e, nextPage);
  };

  const handleQuickNiche = (nicheKeyword: string) => {
    setKeyword(nicheKeyword);
    setActiveTab('cj_fetch');
    setPageNum(1);
    setResults([]);
    void handleFetchFromCj(undefined, 1, nicheKeyword);
  };

  const toggleSelectProduct = (pid: string) => {
    const next = new Set(selectedPids);
    if (next.has(pid)) {
      next.delete(pid);
    } else {
      next.add(pid);
    }
    setSelectedPids(next);
  };

  const selectAll = () => {
    if (selectedPids.size === results.length) {
      setSelectedPids(new Set());
    } else {
      setSelectedPids(new Set(results.map((r) => r.pid)));
    }
  };

  const syncAdminTask = async (
    action: 'categories' | 'inventory' | 'shipments',
    endpoint: string,
    successMessage: string,
  ) => {
    setAdminTaskLoading(action);
    setAdminTaskMessage(null);
    try {
      await fetchApi(endpoint, { method: 'POST' });
      setAdminTaskMessage(successMessage);
      if (action === 'inventory') {
        loadStagedProducts();
      }
    } catch (err: any) {
      setAdminTaskMessage(err?.message || 'Action failed');
    } finally {
      setAdminTaskLoading(null);
    }
  };

  const resolveImportTarget = () => {
    const fallbackCategory = categories.find((cat) => (cat.subcategories?.length || 0) > 0) || categories[0];
    const targetCategoryId = selectedCategory ? Number(selectedCategory) : fallbackCategory?.id;
    const selectedCategoryObj = categories.find((cat) => cat.id === targetCategoryId);
    const targetSubcategoryId = selectedSubcategory
      ? Number(selectedSubcategory)
      : selectedCategoryObj?.subcategories?.[0]?.id;

    if (!targetCategoryId || !targetSubcategoryId) {
      throw new Error('Please select both a category and subcategory before importing.');
    }
    return { targetCategoryId, targetSubcategoryId };
  };

  const handleImportSingle = async (pid: string) => {
    setImportState((prev) => ({ ...prev, [pid]: 'loading' }));
    try {
      const { targetCategoryId, targetSubcategoryId } = resolveImportTarget();
      await fetchApi('/api/cj/products/import', {
        method: 'POST',
        body: JSON.stringify({
          cjPid: pid,
          categoryId: targetCategoryId,
          subcategoryId: targetSubcategoryId,
          markupPercentage: Number(markup),
        }),
      });
      setImportState((prev) => ({ ...prev, [pid]: 'success' }));
      // Refresh local staged list
      loadStagedProducts();
    } catch (err: any) {
      setImportState((prev) => ({ ...prev, [pid]: 'error' }));
    }
  };

  const handleBatchImport = async () => {
    if (selectedPids.size === 0) return;
    setBatchImporting(true);
    const pidsArray = Array.from(selectedPids);

    for (const pid of pidsArray) {
      await handleImportSingle(pid);
    }
    setBatchImporting(false);
  };

  return (
    <div className="space-y-8">
      {/* Workbench Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CJDropshipping Catalog Gateway</h1>
          <p className="text-sm text-muted">
            Manage CJ products staged in your local MySQL database, or search and import new trending items.
          </p>
          {/* CJ API live connection indicator */}
          <div className="mt-3 flex items-center gap-3">
            {checkingHealth ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted bg-background px-2.5 py-1 rounded-lg border border-foreground/10">
                <Loader2 size={12} className="animate-spin" /> Checking CJ API…
              </span>
            ) : apiHealth ? (
              <button
                type="button"
                onClick={checkApiHealth}
                title={apiHealth.message}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  apiHealth.connected
                    ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                <Activity size={12} />
                {apiHealth.connected ? 'CJ API Connected' : 'CJ API Sandbox'}
                {apiHealth.totalAvailable > 0 && (
                  <span className="text-muted">· {apiHealth.totalAvailable.toLocaleString()} products available</span>
                )}
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={adminTaskLoading !== null}
              onClick={() => syncAdminTask('categories', '/api/cj/categories/sync', 'CJ categories synced successfully.')}
              className="px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-semibold hover:bg-background disabled:opacity-50"
            >
              {adminTaskLoading === 'categories' ? 'Syncing Categories...' : 'Sync CJ Categories'}
            </button>
            <button
              type="button"
              disabled={adminTaskLoading !== null}
              onClick={() => syncAdminTask('inventory', '/api/cj/inventory/sync-all', 'CJ inventory synced successfully.')}
              className="px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-semibold hover:bg-background disabled:opacity-50"
            >
              {adminTaskLoading === 'inventory' ? 'Syncing Inventory...' : 'Sync All Inventory'}
            </button>
            <button
              type="button"
              disabled={adminTaskLoading !== null}
              onClick={() => syncAdminTask('shipments', '/api/cj/shipments/sync-all', 'CJ shipments synced successfully.')}
              className="px-3 py-1.5 rounded-lg border border-foreground/20 text-xs font-semibold hover:bg-background disabled:opacity-50"
            >
              {adminTaskLoading === 'shipments' ? 'Syncing Shipments...' : 'Sync All Shipments'}
            </button>
          </div>
          {adminTaskMessage && (
            <p className="mt-2 text-xs text-muted">{adminTaskMessage}</p>
          )}
        </div>

        {/* Tab Control Buttons */}
        <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-foreground/10">
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'database'
                ? 'bg-accent text-white shadow-md'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Database size={15} />
            Staged Products in DB ({stagedProducts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cj_fetch')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'cj_fetch'
                ? 'bg-accent text-white shadow-md'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Sparkles size={15} />
            Fetch New Products from CJ
          </button>
        </div>
      </div>

      {/* ── TAB 1: STAGED PRODUCTS IN LOCAL DATABASE (DEFAULT ACTIVE) ── */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Products Staged in Local Database ({stagedProducts.length})
            </h2>

            <button
              onClick={loadStagedProducts}
              className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <RefreshCw size={14} className={loadingStaged ? 'animate-spin' : ''} /> Refresh DB List
            </button>
          </div>

          <div className="bg-surface border border-foreground/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loadingStaged ? (
                <div className="p-12 text-center text-muted">Loading staged CJ products from local database...</div>
              ) : stagedProducts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Database size={48} className="mx-auto mb-4 opacity-20 text-accent" />
                  <p className="text-base font-bold text-foreground mb-1">No CJ Products Staged Yet</p>
                  <p className="text-sm text-muted max-w-md mx-auto mb-6">
                    Old test products have been purged. Click <strong>Fetch New Products from CJ</strong> below to search and import fresh items into your website database!
                  </p>
                  <button
                    onClick={() => setActiveTab('cj_fetch')}
                    className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md hover:bg-accent/90"
                  >
                    <Plus size={16} /> Fetch Products from CJ Catalog
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-background border-b border-foreground/10 text-muted font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Product Name</th>
                      <th className="px-6 py-3.5">SKU</th>
                      <th className="px-6 py-3.5">Selling Price</th>
                      <th className="px-6 py-3.5">Stock</th>
                      <th className="px-6 py-3.5">Fulfillment</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {stagedProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-background/60 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-background rounded-lg overflow-hidden relative flex-shrink-0 border border-foreground/10">
                            <Image
                              src={prod.thumbnail_image || '/placeholder.svg'}
                              alt={String(prod.name || 'Staged Product Image')}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-foreground line-clamp-1">{prod.name}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted">{prod.sku}</td>
                        <td className="px-6 py-4 font-bold text-accent">${parseFloat(prod.price).toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium">{prod.available ?? prod.stock_quantity ?? 100}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            CJ Dropship
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteStagedProduct(prod.id)}
                            className="text-muted hover:text-red-500 transition-colors p-1.5"
                            title="Remove from DB"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: FETCH NEW PRODUCTS FROM CJ DROPSHIPPING (MANUAL TRIGGER) ── */}
      {activeTab === 'cj_fetch' && (
        <div className="space-y-6">
          {/* Target Category & Markup Configuration */}
          <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <Layers className="w-5 h-5 text-accent" />
              Target Catalog & Pricing Markup Gateway
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Storefront Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">Select category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCat}
                  className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
                >
                  <option value="">Select subcategory…</option>
                  {selectedCat?.subcategories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Markup Multiplier (e.g. 2.0 = 100% Margin)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1.1"
                    max="10"
                    step="0.1"
                    value={markup}
                    onChange={(e) => setMarkup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent">
                    {(Number(markup) * 100 - 100).toFixed(0)}% ROI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Filters & Manual Search Form */}
          <div className="bg-surface/50 border border-black/5 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                Resource & Budget Allocation Filters
              </div>

              {/* Quick Niche Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickNiche('trending gadgets')}
                  className="px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Trending Gadgets
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNiche('smartwatch')}
                  className="px-3 py-1.5 rounded-full bg-surface border border-foreground/10 hover:border-accent text-foreground font-medium transition-colors"
                >
                  Smartwatches
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNiche('wireless earbud')}
                  className="px-3 py-1.5 rounded-full bg-surface border border-foreground/10 hover:border-accent text-foreground font-medium transition-colors"
                >
                  Wireless Audio
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNiche('drone')}
                  className="px-3 py-1.5 rounded-full bg-surface border border-foreground/10 hover:border-accent text-foreground font-medium transition-colors"
                >
                  Drones & Tech
                </button>
              </div>
            </div>

            <form onSubmit={handleFetchFromCj} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPageNum(0);
                      setResults([]);
                    }}
                    placeholder="Search CJ Dropshipping catalog (e.g. projector, drone, smart watch)..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    placeholder="Min Supplier Cost ($)"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPageNum(0);
                      setResults([]);
                    }}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                  />
                </div>

                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    placeholder="Max Supplier Cost ($)"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPageNum(0);
                      setResults([]);
                    }}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted bg-surface px-3.5 py-2.5 rounded-xl border border-foreground/10">
                    <span>Batch Limit:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPageNum(0);
                        setResults([]);
                      }}
                      className="bg-background border border-foreground/20 rounded px-2 py-1 font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value={12}>12 Items</option>
                      <option value={24}>24 Items</option>
                      <option value={48}>48 Items</option>
                      <option value={60}>60 Items</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-500">
                      <Zap className="w-3.5 h-3.5 fill-amber-500" />
                      Quality Filter
                    </label>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>Min Images:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={minImages}
                        onChange={(e) => {
                          setMinImages(Math.max(1, parseInt(e.target.value) || 1));
                          setPageNum(0);
                          setResults([]);
                        }}
                        className="w-14 px-2 py-1 rounded bg-background border border-foreground/20 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={searching}
                  onClick={handleFetchButtonClick}
                  title="Each click fetches the next page of CJ products."
                  className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-md bg-gradient-to-r from-accent to-accent/90 hover:opacity-95 select-none"
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                  Fetch Products from CJ
                </button>
              </div>
            </form>
          </div>

          {minImages > 1 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
              <Zap size={14} className="fill-amber-500" />
              Quality filter is on. Each candidate is verified against CJ, so this fetch may take 10–30 seconds depending on page size.
            </div>
          )}

          {searchError && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} />
              {searchError}
            </div>
          )}

          {/* Results Header & Batch Import Controls */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/20 hover:bg-background transition-colors"
                  >
                    {selectedPids.size === results.length ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-muted" />
                    )}
                    Select All ({selectedPids.size}/{results.length})
                  </button>
                  <span className="text-xs text-muted">
                    Showing {results.length} products fetched from CJ
                  </span>
                </div>

                {selectedPids.size > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchImport}
                    disabled={batchImporting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-md hover:bg-accent/90 transition-all disabled:opacity-50"
                  >
                    {batchImporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Import {selectedPids.size} Selected Items to Database
                  </button>
                )}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {results.map((product) => {
                  const state = importState[product.pid] || 'idle';
                  const isSelected = selectedPids.has(product.pid);
                  const costPrice = parseFloat(String(product.sellPrice || (product as any).productPrice || (product as any).nowPrice || (product as any).price || 0)) || 10.00;
                  const markupVal = parseFloat(String(markup)) || 2.0;
                  const retailPrice = (costPrice * markupVal).toFixed(2);
                  const estimatedProfit = (costPrice * markupVal - costPrice).toFixed(2);
                  const displayTitle = product.productNameEn || (product as any).productName || (product as any).title || 'Trending Gadget';
                  const displayImage = product.productImage || (product as any).bigImage || (product as any).thumbnail || '/placeholder.svg';

                  return (
                    <div
                      key={product.pid}
                      className={`relative bg-surface border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'border-accent ring-2 ring-accent/30 shadow-lg'
                          : 'border-black/5 dark:border-white/5 hover:shadow-md'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSelectProduct(product.pid)}
                        className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-foreground/10 hover:scale-105 transition-transform"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-accent" />
                        ) : (
                          <Square className="w-5 h-5 text-muted" />
                        )}
                      </button>

                      <div className="relative h-44 bg-background/50">
                        <Image
                          src={displayImage}
                          alt={String(displayTitle)}
                          fill
                          unoptimized
                          className="object-contain p-3"
                        />
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-[11px] font-semibold tracking-wider text-muted uppercase truncate">
                          {product.categoryName || 'Gadget'}
                        </p>
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                          {displayTitle}
                        </h3>

                        <div className="grid grid-cols-2 gap-2 bg-background/60 p-2.5 rounded-xl border border-foreground/5 text-xs">
                          <div>
                            <p className="text-[10px] text-muted">Supplier Cost</p>
                            <p className="font-bold text-foreground">${costPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted">Retail Target</p>
                            <p className="font-bold text-accent">${retailPrice}</p>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-foreground/5 flex items-center justify-between text-[11px]">
                            <span className="text-muted">Est. Profit/Unit:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              +${estimatedProfit}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleImportSingle(product.pid)}
                          disabled={state === 'loading' || state === 'success'}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            state === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                              : state === 'error'
                              ? 'bg-red-500/10 text-red-600 border border-red-500/30'
                              : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
                          }`}
                        >
                          {state === 'loading' && <Loader2 size={14} className="animate-spin" />}
                          {state === 'success' && <CheckCircle size={14} />}
                          {state === 'error' && <AlertCircle size={14} />}
                          {state === 'idle' && <Download size={14} />}
                          {state === 'idle'
                            ? 'Save & Import to Database'
                            : state === 'loading'
                            ? 'Saving to DB…'
                            : state === 'success'
                            ? 'Saved in DB!'
                            : 'Retry Import'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sleek Pagination Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-foreground/10">
                <button
                  type="button"
                  onClick={() => handleFetchFromCj(undefined, Math.max(1, pageNum - 1))}
                  disabled={pageNum <= 1 || searching}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-foreground/10 hover:bg-background text-xs font-semibold disabled:opacity-40 transition-all shadow-sm"
                >
                  <ChevronLeft size={16} /> Previous Page
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-surface px-4 py-2.5 rounded-xl border border-foreground/10 shadow-sm">
                  <span className="text-muted">Showing Page:</span>
                  <span className="text-accent text-sm font-extrabold">{pageNum}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchFromCj(undefined, pageNum + 1)}
                  disabled={searching}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 text-xs font-semibold disabled:opacity-40 transition-all shadow-sm"
                >
                  Next Page <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {results.length === 0 && !searching && (
            <div className="text-center py-16 text-muted bg-surface/30 rounded-2xl border border-dashed border-foreground/10">
              <TrendingUp size={44} className="mx-auto mb-4 opacity-30 text-accent" />
              <p className="text-base font-bold text-foreground mb-1">
                Fetch New Products from CJ Dropshipping
              </p>
              <p className="text-sm max-w-md mx-auto mb-6">
                Enter a keyword or click <strong>Fetch New Products from CJ</strong> above to retrieve live products. Selected items will be saved directly into your local database.
              </p>
              <button
                type="button"
                onClick={() => handleFetchFromCj()}
                className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md hover:bg-accent/90"
              >
                <TrendingUp size={16} /> Fetch Products Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
