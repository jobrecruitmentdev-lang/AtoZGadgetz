'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { CjProductGrid, CjProduct } from './CjProductGrid';

interface CjBrowseProps {
  keyword: string;
  initialPage?: number;
  hideIfEmpty?: boolean;
}

export function CjBrowse({ keyword, initialPage = 1, hideIfEmpty = false }: CjBrowseProps) {
  const [products, setProducts] = useState<CjProduct[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  loadingRef.current = loading;
  hasMoreRef.current = hasMore;

  const fetchOnce = async (kw: string, p: number) => {
    const res = await fetch(
      `/server-proxy/cj/browse?keyword=${encodeURIComponent(kw)}&page=${p}&size=20`,
      { cache: 'no-store' },
    );
    const json = await res.json();
    let list = (json?.data?.list || json?.list || []) as CjProduct[];
    // Strip products with no image — nothing to show the customer
    list = list.filter((p) => p.imageUrl && p.imageUrl.trim() !== '');
    const total = Number(json?.data?.total ?? json?.total ?? 0);
    return { list, total };
  };

  const fetchProducts = useCallback(async (kw: string, p: number, append = false) => {
    setLoading(true);
    setError(null);
    try {
      let { list, total } = await fetchOnce(kw, p);
      // CJ's search API is flaky — the same keyword can return an empty list one call
      // and hundreds of results the next. One retry clears most of these false empties.
      if (list.length === 0) ({ list, total } = await fetchOnce(kw, p));
      setProducts((prev) => {
        const next = append ? [...prev, ...list] : list;
        setHasMore(list.length > 0 && next.length < total);
        return next;
      });
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

  const loadMore = useCallback(() => {
    setPage((p) => {
      const next = p + 1;
      fetchProducts(keyword, next, true);
      return next;
    });
  }, [keyword, fetchProducts]);

  // Infinite scroll: auto-load the next page once the sentinel at the bottom
  // of the grid scrolls into view, instead of requiring a manual click.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadMore();
        }
      },
      { rootMargin: '400px' }, // start loading before the user hits the very bottom
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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
    if (hideIfEmpty) return null;
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
        <div ref={sentinelRef} className="flex justify-center items-center mt-10 h-16">
          {loading ? (
            <span className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={18} className="animate-spin" /> Loading more…
            </span>
          ) : (
            // Fallback for when the observer hasn't fired yet (e.g. reduced-motion/observer
            // unsupported) — clicking still works even though scrolling normally triggers it.
            <button
              onClick={loadMore}
              className="text-sm text-accent hover:underline"
            >
              Load more products
            </button>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-muted mt-10">
          You&apos;ve reached the end — {products.length} products shown.
        </p>
      )}
    </div>
  );
}
