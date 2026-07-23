import { RevealText } from "@/components/motion/RevealText";
import { fetchApi } from "@/lib/api-client";
import { ProductsView } from "@/components/storefront/ProductsView";
import { CjBrowse } from "@/components/storefront/CjBrowse";

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() || '';

  let products = [];
  let categories = [];

  try {
    const pData = await fetchApi<any[]>(`/products?v=1.1`);
    products = (pData || []).map((p) => ({
      ...p,
      image: p.thumbnail_image,
      category: p.category?.name || 'Uncategorized',
    }));

    const cData = await fetchApi<any[]>(`/categories?hasProducts=true`);
    categories = cData || [];
  } catch (err: any) {
    console.error('Failed to load products/categories', err);
  }

  // Filter local products by search query
  const filtered = searchQuery
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-10 border-b border-black/10 dark:border-white/10 pb-8">
        {searchQuery ? (
          <>
            <p className="text-sm text-muted mb-1">Search results for</p>
            <RevealText as="h1" className="text-4xl md:text-5xl font-bold tracking-tighter">
              {`"${searchQuery}"`}
            </RevealText>
          </>
        ) : (
          <RevealText as="h1" className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">
            All Products
          </RevealText>
        )}
      </div>

      {/* Our own DB products */}
      {filtered.length > 0 && (
        <div className="mb-16">
          {searchQuery && (
            <h2 className="text-lg font-semibold mb-4 text-muted">
              From our store ({filtered.length})
            </h2>
          )}
          <ProductsView initialProducts={filtered} categories={categories} />
        </div>
      )}

      {/* CJ live results — always show on search, show as "More Products" otherwise */}
      <div>
        <h2 className="text-xl font-bold mb-6">
          {searchQuery ? `More results for "${searchQuery}"` : 'Browse Live Catalog'}
        </h2>
        <CjBrowse keyword={searchQuery || 'gadgets electronics'} />
      </div>
    </div>
  );
}
