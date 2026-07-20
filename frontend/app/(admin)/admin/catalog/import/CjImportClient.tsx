'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Search, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<CjProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [importState, setImportState] = useState<ImportState>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [markup, setMarkup] = useState('2.0');
  const [isHunterMode, setIsHunterMode] = useState(false);
  const [minImages, setMinImages] = useState(3);
  const [searchError, setSearchError] = useState<string | null>(null);

  const selectedCat = categories.find((c) => String(c.id) === selectedCategory);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const endpoint = isHunterMode
        ? `/api/cj/products/hunt?keyword=${encodeURIComponent(keyword)}&page=1&size=20&minImages=${minImages}`
        : `/api/cj/products/search?keyword=${encodeURIComponent(keyword)}&page=1&size=20`;
      
      const data = await fetchApi<{ list?: CjProduct[] }>(endpoint);
      setResults(data?.list || []);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (pid: string) => {
    if (!selectedCategory || !selectedSubcategory) {
      alert('Please select a category and subcategory before importing.');
      return;
    }
    setImportState((prev) => ({ ...prev, [pid]: 'loading' }));
    try {
      await fetchApi('/api/cj/products/import', {
        method: 'POST',
        body: JSON.stringify({
          cjPid: pid,
          categoryId: Number(selectedCategory),
          subcategoryId: Number(selectedSubcategory),
          markupPercentage: Number(markup),
        }),
      });
      setImportState((prev) => ({ ...prev, [pid]: 'success' }));
    } catch (err: any) {
      setImportState((prev) => ({ ...prev, [pid]: 'error' }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Config bar */}
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Subcategory</label>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCat}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
          >
            <option value="">Select subcategory…</option>
            {selectedCat?.subcategories?.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Markup Multiplier (e.g. 2.0 = 100% markup)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-grow relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search CJ Dropshipping catalog (e.g. wireless earbuds, phone case)…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${isHunterMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-accent hover:bg-accent/90'}`}
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {isHunterMode ? 'Hunt Products' : 'Search'}
          </button>
        </div>
        
        <div className="flex items-center gap-4 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-amber-600 dark:text-amber-500">
            <input 
              type="checkbox" 
              checked={isHunterMode} 
              onChange={(e) => setIsHunterMode(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            Enable Hunter Mode
          </label>
          {isHunterMode && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>Minimum Images:</span>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={minImages} 
                onChange={(e) => setMinImages(parseInt(e.target.value) || 3)}
                className="w-16 px-2 py-1 rounded bg-background border border-foreground/20 text-center"
              />
            </div>
          )}
        </div>
      </form>

      {searchError && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {searchError}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-4">{results.length} products found on CJ Dropshipping</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((product) => {
              const state = importState[product.pid] || 'idle';
              return (
                <div
                  key={product.pid}
                  className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40 bg-background">
                    <Image
                      src={product.productImage || '/placeholder.svg'}
                      alt={product.productNameEn}
                      fill
                      className="object-contain p-3"
                    />
                    {product.huntedImageCount && product.huntedImageCount > 1 && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {product.huntedImageCount} Images
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted mb-1 truncate">{product.categoryName}</p>
                    <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-2">
                      {product.productNameEn}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted">CJ Cost</p>
                        <p className="font-bold text-accent">${product.sellPrice?.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted">Your Price</p>
                        <p className="font-bold">${(product.sellPrice * Number(markup)).toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(product.pid)}
                      disabled={state === 'loading' || state === 'success'}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                        state === 'success'
                          ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                          : state === 'error'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/30'
                          : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
                      }`}
                    >
                      {state === 'loading' && <Loader2 size={14} className="animate-spin" />}
                      {state === 'success' && <CheckCircle size={14} />}
                      {state === 'error' && <AlertCircle size={14} />}
                      {state === 'idle' && <Download size={14} />}
                      {state === 'idle' ? 'Import Product' : state === 'loading' ? 'Importing…' : state === 'success' ? 'Imported!' : 'Retry'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && !searching && !searchError && (
        <div className="text-center py-20 text-muted">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Search the CJ Catalog</p>
          <p className="text-sm">Try "wireless earbuds", "phone holder", "air fryer", "smartwatch"…</p>
        </div>
      )}
    </div>
  );
}
