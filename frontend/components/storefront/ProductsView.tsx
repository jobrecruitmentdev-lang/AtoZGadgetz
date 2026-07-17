'use client';
import { useState } from 'react';
import { ProductCard } from "@/components/storefront/ProductCard";
import { CjBrowse } from "@/components/storefront/CjBrowse";
import { resolveCjKeyword } from "@/lib/cj-keywords";

export function ProductsView({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Matched by category_id, not name: callers flatten `category` down to a plain
  // name string before passing products here, so `p.category?.name` is always
  // undefined — id is the only field guaranteed to survive that mapping.
  const filteredProducts = activeCategory === 'All'
    ? initialProducts
    : initialProducts.filter(p => p.category_id?.toString() === activeCategory);

  const activeCategoryObj = categories.find(c => c.id.toString() === activeCategory);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-8">
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`hover:text-accent font-medium ${activeCategory === 'All' ? 'text-foreground' : ''}`}
                >
                  All
                </button>
              </li>
              {categories.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveCategory(c.id.toString())}
                    className={`hover:text-accent ${activeCategory === c.id.toString() ? 'text-foreground font-medium' : ''}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} {...product} delay={(idx % 6) * 0.1} />
          ))}
        </div>
        {filteredProducts.length === 0 && activeCategory !== 'All' && (
          <CjBrowse keyword={resolveCjKeyword(activeCategoryObj)} />
        )}
        {filteredProducts.length === 0 && activeCategory === 'All' && (
          <div className="py-12 text-center text-muted">No products found.</div>
        )}
      </div>
    </div>
  );
}
