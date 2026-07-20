'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface Suggestion {
  pid: string;
  name: string;
  imageUrl: string;
  price: number;
}

const POPULAR = [
  'Wireless Earbuds', 'Smart Watch', 'Gaming Mouse', 'LED Strip Lights',
  'Phone Stand', 'Bluetooth Speaker', 'Mechanical Keyboard', 'Car Charger',
];

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      // Hybrid Search: Fetch from our local DB and CJ Dropshipping concurrently
      const [localRes, cjRes] = await Promise.allSettled([
        fetch(`/server-proxy/products/search/live?keyword=${encodeURIComponent(q)}`, { cache: 'no-store' }),
        fetch(`/server-proxy/cj/browse?keyword=${encodeURIComponent(q)}&page=1&size=6`, { cache: 'no-store' })
      ]);

      let localList: Suggestion[] = [];
      if (localRes.status === 'fulfilled' && localRes.value.ok) {
        const localJson = await localRes.value.json();
        localList = (localJson.list || []).map((p: any) => ({ ...p, isLocal: true }));
      }

      let cjList: Suggestion[] = [];
      if (cjRes.status === 'fulfilled' && cjRes.value.ok) {
        const cjJson = await cjRes.value.json();
        const rawCjList = (cjJson?.data?.list || cjJson?.list || []) as Suggestion[];
        // Filter out CJ products that don't have images
        cjList = rawCjList.filter((p) => p.imageUrl && p.imageUrl.trim() !== '');
      }

      // Merge results: Local first, then CJ Dropshipping to fill the rest (up to 6 total)
      const combined = [...localList, ...cjList].slice(0, 6);
      setSuggestions(combined);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const submit = (q: string) => {
    if (!q.trim()) return;
    setOpen(false);
    setQuery(q);
    
    // Save to recent searches
    const updatedRecents = [q.trim(), ...recentSearches.filter((s) => s !== q.trim())].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecents));
    
    router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit(query);
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut and local storage load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showPopular = open && query.trim().length === 0;
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className={`flex items-center bg-white dark:bg-zinc-900 border-2 rounded-full transition-colors ${open ? 'border-accent shadow-lg shadow-accent/10' : 'border-foreground/15'}`}>
        <Search size={18} className="ml-4 text-muted shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search gadgets, electronics, smart home..."
          className="flex-1 px-3 py-2.5 bg-transparent text-sm focus:outline-none placeholder:text-muted"
          autoComplete="off"
        />
        <div className="hidden sm:flex items-center justify-center mr-3 px-2 py-0.5 rounded border border-foreground/10 bg-foreground/5 text-muted font-medium text-[10px] tracking-widest pointer-events-none select-none">
          <span className="font-sans mr-0.5">⌘</span>K
        </div>
        {loading && <Loader2 size={15} className="mr-3 text-muted animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }} className="mr-2 text-muted hover:text-foreground">
            <X size={15} />
          </button>
        )}
        <button
          onClick={() => submit(query)}
          className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full mr-0.5 hover:bg-accent/90 transition-colors shrink-0"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {(showPopular || showSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-50">

          {showPopular && (
            <div className="p-3 flex flex-col gap-4">
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">Recent Searches</p>
                  <div className="flex flex-col">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => submit(term)}
                        className="px-3 py-2 text-sm text-foreground hover:bg-foreground/5 rounded-lg transition-colors text-left flex items-center gap-3 font-medium"
                      >
                        <Search size={14} className="text-muted shrink-0" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      onClick={() => submit(term)}
                      className="px-3 py-1.5 text-xs bg-foreground/5 hover:bg-accent/10 hover:text-accent rounded-full transition-colors font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showSuggestions && (
            <ul>
              {suggestions.map((item) => (
                <li key={item.pid}>
                  <button
                    onClick={() => router.push((item as any).isLocal ? `/product/${item.pid}` : `/product/cj-${item.pid}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/4 transition-colors text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-foreground/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-accent font-semibold">${(item.price * 2).toFixed(2)}</p>
                    </div>
                    <Search size={14} className="text-muted shrink-0" />
                  </button>
                </li>
              ))}
              <li className="border-t border-foreground/5">
                <button
                  onClick={() => submit(query)}
                  className="w-full px-4 py-3 text-sm text-accent font-medium hover:bg-accent/5 transition-colors text-left flex items-center gap-2"
                >
                  <Search size={14} />
                  See all results for &quot;{query}&quot;
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
