import { RevealText } from "@/components/motion/RevealText";
import { fetchApi } from "@/lib/api-client";
import { ProductsView } from "@/components/storefront/ProductsView";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products = [];
  let categories = [];
  let errorMsg = null;
  
  try {
    const pData = await fetchApi<any[]>(`/products?v=1.1`);
    products = (pData || []).map(p => ({
      ...p,
      image: p.thumbnail_image,
      category: p.category?.name || 'Uncategorized'
    }));
    
    const cData = await fetchApi<any[]>(`/categories?v=1.1`);
    categories = cData || [];
  } catch (err: any) {
    console.error("Failed to load products/categories", err);
    errorMsg = err?.message || String(err);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-12 border-b border-black/10 dark:border-white/10 pb-8">
        <RevealText as="h1" className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          All Products
        </RevealText>
        <p className="text-muted max-w-xl">
          Browse our entire collection of thoughtfully curated technology.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8">
          <strong>Server Data Fetch Error:</strong> {errorMsg}
        </div>
      )}

      <ProductsView initialProducts={products} categories={categories} />
    </div>
  );
}
