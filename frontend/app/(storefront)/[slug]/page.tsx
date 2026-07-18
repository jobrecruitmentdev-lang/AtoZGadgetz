import { RevealText } from "@/components/motion/RevealText";
import { fetchApi } from "@/lib/api-client";
import { ProductsView } from "@/components/storefront/ProductsView";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [
    { slug: 'under-99-gadgetz' },
    { slug: 'under-149-gadgetz' },
    { slug: 'under-199-gadgetz' },
    { slug: 'under-249-gadgetz' },
    { slug: 'under-299-gadgetz' },
    { slug: 'under-499-gadgetz' },
    { slug: 'under-999-gadgetz' },
    { slug: 'limited-time-offers' },
  ];
}

export default async function DealsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let products = [];
  let categories = [];
  let errorMsg = null;
  
  let pageTitle = "Special Deals";
  let pageDesc = "Grab these amazing deals before they are gone.";
  
  if (slug === 'under-99-gadgetz') { pageTitle = "Under $10 / ₹99"; pageDesc = "Great gadgets under $10."; }
  else if (slug === 'under-149-gadgetz') { pageTitle = "Under ₹149"; pageDesc = "Great gadgets under ₹149."; }
  else if (slug === 'under-199-gadgetz') { pageTitle = "Under $20 / ₹199"; pageDesc = "Great gadgets under $20."; }
  else if (slug === 'under-249-gadgetz') { pageTitle = "Under ₹249"; pageDesc = "Great gadgets under ₹249."; }
  else if (slug === 'under-299-gadgetz') { pageTitle = "Under ₹299"; pageDesc = "Great gadgets under ₹299."; }
  else if (slug === 'under-499-gadgetz') { pageTitle = "Under $50 / ₹499"; pageDesc = "Great gadgets under $50."; }
  else if (slug === 'under-999-gadgetz') { pageTitle = "Under $100 / ₹999"; pageDesc = "Great gadgets under $100."; }
  else if (slug === 'limited-time-offers') { pageTitle = "Limited Time Offers"; pageDesc = "Exclusive discounts ending soon."; }
  else {
    return notFound();
  }
  
  try {
    const pData = await fetchApi<any[]>(`/products?v=1.1`);
    let allProducts = (pData || []).map(p => ({
      ...p,
      image: p.thumbnail_image,
      category: p.category?.name || 'Uncategorized'
    }));
    
    // Filter by price/deal
    if (slug === 'under-99-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 10);
    } else if (slug === 'under-149-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 15);
    } else if (slug === 'under-199-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 20);
    } else if (slug === 'under-249-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 25);
    } else if (slug === 'under-299-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 30);
    } else if (slug === 'under-499-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 50);
    } else if (slug === 'under-999-gadgetz') {
      products = allProducts.filter(p => Number(p.price) < 100);
    } else if (slug === 'limited-time-offers') {
      products = allProducts.filter(p => Number(p.discount_price) > 0 && Number(p.discount_price) < Number(p.price));
    } else {
      products = allProducts;
    }
    
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
          {pageTitle}
        </RevealText>
        <p className="text-muted max-w-xl">
          {pageDesc}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8">
          <strong>Server Data Fetch Error:</strong> {errorMsg}
        </div>
      )}

      {products.length === 0 && !errorMsg ? (
        <div className="text-center py-24 text-muted">
          No deals found in this category currently.
        </div>
      ) : (
        <ProductsView initialProducts={products} categories={categories} />
      )}
    </div>
  );
}
