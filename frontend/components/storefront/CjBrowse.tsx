'use client';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { CjProductGrid, CjProduct } from './CjProductGrid';

interface CjBrowseProps {
  keyword: string;
  initialPage?: number;
}

export function CjBrowse({ keyword, initialPage = 1 }: CjBrowseProps) {
  const [products, setProducts] = useState<CjProduct[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchOnce = async (kw: string, p: number) => {
    const res = await fetch(
      `/api/cj/browse?keyword=${encodeURIComponent(kw)}&page=${p}&size=20`,
      { cache: 'no-store' },
    );
    const json = await res.json();
    return (json?.data?.list || json?.list || []) as CjProduct[];
  };

  const fetchProducts = useCallback(async (kw: string, p: number, append = false) => {
    setLoading(true);
    setError(null);
    try {
      let list = await fetchOnce(kw, p);
      // CJ's search API is flaky — the same keyword can return an empty list one call
      // and hundreds of results the next. One retry clears most of these false empties.
      if (list.length === 0) list = await fetchOnce(kw, p);
      setProducts((prev) => append ? [...prev, ...list] : list);
      setHasMore(list.length === 20);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(keyword, 1, false);
  }, [keyword, fetchProducts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(keyword, next, true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 size={28} className="animate-spin mr-3" />
        <span>Loading products…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 text-muted gap-3">
        <p>{error}</p>
        <button
          onClick={() => fetchProducts(keyword, 1)}
          className="flex items-center gap-2 text-sm text-accent hover:underline"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20 text-muted">
        <p className="font-medium mb-1">No products found for this category.</p>
        <p className="text-sm">Try browsing a different subcategory.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted">
          Showing live results
        </p>
        <span className="text-xs text-muted bg-foreground/5 px-2.5 py-1 rounded-full">
          {products.length} products
        </span>
      </div>

      <CjProductGrid products={products} />

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-foreground/20 text-sm font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
