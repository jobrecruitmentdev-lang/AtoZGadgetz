import { RevealText } from "@/components/motion/RevealText";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import Image from "next/image";
import { ShoppingCart, Heart, Shield, Truck } from "lucide-react";

import { fetchApi } from "@/lib/api-client";

import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let productData = null;
  try {
    productData = await fetchApi<any>(`/products/${slug}?_t=${Date.now()}`);
  } catch (err) {
    console.error("Product not found:", err);
  }

  if (!productData) {
    return <div className="container mx-auto px-4 py-20 text-center text-xl">Product not found</div>;
  }

  const product = {
    id: productData.id,
    name: productData.name,
    price: parseFloat(productData.price) || 0,
    description: productData.description || '',
    category: productData.category?.name || 'Uncategorized',
    features: (productData.key_features ? (typeof productData.key_features === 'string' ? JSON.parse(productData.key_features) : productData.key_features) : []) as string[],
    images: (productData.images?.map((img: any) => img.url).filter(Boolean) || []) as string[],
  };
  
  if (productData.thumbnail_image && product.images.length === 0) {
    product.images.push(productData.thumbnail_image);
  }
  
  if (!product.images || product.images.length === 0) {
    product.images = ['/placeholder.svg'];
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        <div className="space-y-4">
          <RevealOnScroll>
            <div className="relative aspect-[4/5] md:aspect-square bg-surface rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
              <Image 
                src={product.images[0]} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-2 gap-4">
            {product.images.slice(1).map((img, idx) => (
              <RevealOnScroll key={idx} delay={0.1 * (idx + 1)}>
                <div className="relative aspect-square bg-surface rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                  <Image src={img} alt={`Gallery image ${idx+1}`} fill className="object-cover" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="md:sticky md:top-32 space-y-8">
            <div>
              <p className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">{product.category}</p>
              <RevealText as="h1" className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                {product.name}
              </RevealText>
              <p className="text-2xl font-medium">${product.price.toFixed(2)}</p>
            </div>

            <p className="text-muted leading-relaxed">
              {product.description}
            </p>

            <ul className="space-y-3">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {feat}
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-black/10 dark:border-white/10 flex gap-4">
              <AddToCartButton productId={product.id} />
              <button className="w-14 h-14 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:bg-surface transition-colors text-muted hover:text-red-500">
                <Heart size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted">
              <div className="flex items-center gap-3">
                <Truck size={18} />
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={18} />
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
