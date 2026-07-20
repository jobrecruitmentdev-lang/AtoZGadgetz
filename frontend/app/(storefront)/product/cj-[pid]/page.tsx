import { Shield, Truck, Star, Info, Package, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { CjProductActions } from "@/components/storefront/CjProductActions";
import { RevealText } from "@/components/motion/RevealText";

export const dynamic = 'force-dynamic';

export default async function CjProductDetailPage({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;

  let raw: any = null;
  try {
    raw = await fetchApi<any>(`/cj/products/public/${pid}`);
  } catch (err) {
    console.error('CJ product detail fetch failed:', err);
  }

  if (!raw) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-xl">
        Product not found or temporarily unavailable.
      </div>
    );
  }

  const name = raw.productEnName || raw.productName || 'Product';
  const description = raw.productDescription || '';
  const images: string[] = Array.isArray(raw.productImages) && raw.productImages.length
    ? raw.productImages
    : raw.bigImage
      ? [raw.bigImage]
      : ['/placeholder.svg'];
  const price = parseFloat(raw.sellPrice || raw.productPrice || '0') * 2;
  const variants: { name: string; value: string; price: number }[] = Array.isArray(raw.variants)
    ? raw.variants.map((v: any) => ({
        name: v.variantName || '',
        value: v.variantValue || '',
        price: parseFloat(v.variantSellPrice || v.variantPrice || '0') * 2,
      }))
    : [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

        <div className="w-full">
          <ProductGallery images={images} productName={name} />
        </div>

        <div className="relative">
          <div className="md:sticky md:top-24 space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold tracking-wider text-accent uppercase">AtoZ Gadgetz</p>
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(4)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  <Star size={16} fill="currentColor" className="opacity-40" />
                  <span className="text-xs text-muted ml-1">(Reviews)</span>
                </div>
              </div>

              <RevealText as="h1" className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {name}
              </RevealText>

              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock
                </span>
              </div>

              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
                <p className="text-sm text-muted line-through pb-1">${(price * 1.2).toFixed(2)}</p>
                <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded mb-1">Save 20%</span>
              </div>
            </div>

            <CjProductActions cjPid={pid} productName={name} variants={variants} />

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-y border-black/10 dark:border-white/10 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <Truck size={18} className="text-accent" />
                <span>Dispatch within <strong className="text-foreground">24 hrs</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Shield size={18} className="text-accent" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <RefreshCw size={18} className="text-accent" />
                <span>7 Days Easy Return</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Package size={18} className="text-accent" />
                <span>Wholesale Ready</span>
              </div>
            </div>

            {description && (
              <div className="space-y-4 pt-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Info size={18} /> Product Description
                </h3>
                <div className="bg-surface rounded-xl p-5 border border-black/5 dark:border-white/5">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
