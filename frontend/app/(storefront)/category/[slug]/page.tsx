import type { Metadata } from 'next';
import { RevealText } from "@/components/motion/RevealText";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { fetchApi } from "@/lib/api-client";
import { ProductsView } from "@/components/storefront/ProductsView";
import { CjBrowse } from "@/components/storefront/CjBrowse";
import { resolveCjKeyword } from "@/lib/cj-keywords";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

async function findCategoryBySlug(slug: string) {
  try {
    const cData = await fetchApi<{ data?: any[] } | any[]>('/categories');
    const categories = Array.isArray(cData) ? cData : cData?.data || [];
    for (const c of categories) {
      if (c.slug === slug) return c;
      const sub = c.subcategories?.find((s: any) => s.slug === slug);
      if (sub) return sub;
    }
  } catch {
    // fall through to slug-derived defaults
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await findCategoryBySlug(slug);
  const fallbackName = slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const specialTitle = slug === 'new' ? 'New Arrivals — Latest Gadgets' : slug === 'best-sellers' ? 'Best Sellers — Most Popular Gadgets' : undefined;
  const specialDesc = slug === 'new' ? 'Discover the newest gadgets and trending products at AtoZ Gadgetz. New arrivals added daily.' :
    slug === 'best-sellers' ? 'Shop our best-selling gadgets loved by thousands of customers worldwide.' : undefined;
  const title = cat?.seo_title || specialTitle || `${cat?.name || fallbackName} — AtoZ Gadgetz`;
  const description = cat?.seo_description || cat?.description || specialDesc || `Shop ${slug.replace(/-/g, ' ')} at AtoZ Gadgetz. Best prices with worldwide shipping.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `/category/${slug}` },
  };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const pData = await fetchApi<{ data?: any[] } | any[]>('/products');
    let allProducts = Array.isArray(pData) ? pData : pData?.data || [];

    if (slug === 'new') {
      products = [...allProducts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ).slice(0, 24);
    } else if (slug === 'best-sellers') {
      products = allProducts.filter((p: any) => p.is_featured);
    } else {
      products = allProducts.filter(
        (p: any) => p.category?.slug === slug || p.subcategory?.slug === slug,
      );
    }

    products = products.map((p: any) => ({
      ...p,
      image: p.thumbnail_image,
      category: p.category?.name || 'Uncategorized',
    }));

    const cData = await fetchApi<{ data?: any[] } | any[]>('/categories');
    categories = Array.isArray(cData) ? cData : cData?.data || [];
  } catch (err) {
    console.error('CategoryPage: failed to load', err);
  }

  const cat = categories.find((c: any) => c.slug === slug) ??
    categories.flatMap((c: any) => c.subcategories || []).find((s: any) => s.slug === slug);
  const displayName = cat?.name ||
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const description = cat?.seo_description || cat?.description ||
    (slug === 'new' ? 'The newest gadgets and trending products, added daily.' :
     slug === 'best-sellers' ? 'Our best-selling gadgets, loved by thousands of customers worldwide.' : undefined);
  const keyword = resolveCjKeyword({ slug, cj_keyword: cat?.cj_keyword, name: cat?.name });

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://atozgadgetz.com/" },
              { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://atozgadgetz.com/products" },
              { "@type": "ListItem", "position": 3, "name": displayName, "item": `https://atozgadgetz.com/category/${slug}` },
            ],
          }),
        }}
      />

      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-accent transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{displayName}</span>
        </nav>

        <div className="mb-10 border-b border-foreground/10 pb-8">
          <RevealText as="h1" className="text-4xl md:text-6xl font-bold tracking-tighter mb-3">
            {displayName}
          </RevealText>
          <p className="text-muted max-w-xl">
            {description?.split('.')[0]}.
            {products.length > 0 && ` ${products.length} products available.`}
          </p>
        </div>

        {products.length > 0 && (
          <ProductsView initialProducts={products} categories={categories} />
        )}

        {/* Live CJ products — shown for every category */}
        <RevealOnScroll>
          {products.length > 0 && (
            <div className="mt-14 mb-6 border-t border-foreground/10 pt-10">
              <h2 className="text-2xl font-bold tracking-tight mb-1">More from Our Catalog</h2>
              <p className="text-sm text-muted mb-6">Live catalog — add to cart to order</p>
            </div>
          )}
          <CjBrowse keyword={keyword} hideIfEmpty={products.length > 0} />
        </RevealOnScroll>
      </div>
    </>
  );
}
