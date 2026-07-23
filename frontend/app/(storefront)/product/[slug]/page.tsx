import { RevealText } from "@/components/motion/RevealText";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import Image from "next/image";
import { ShoppingCart, Heart, Shield, Truck, Star, Info, Package, RefreshCw, ChevronDown } from "lucide-react";

import { fetchApi } from "@/lib/api-client";
import { ProductActions } from "@/components/storefront/ProductActions";

import { ProductGallery } from "@/components/storefront/ProductGallery";
import { StickyMobileCTA } from "@/components/storefront/StickyMobileCTA";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { DeliveryEstimate } from "@/components/storefront/DeliveryEstimate";
import { ProductRecommendations } from "@/components/storefront/ProductRecommendations";

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
    images: (productData.images?.map((img: any) => img.image || img.url).filter(Boolean) || []) as string[],
  };
  
  if (productData.thumbnail_image && product.images.length === 0) {
    product.images.push(productData.thumbnail_image);
  }
  
  if (!product.images || product.images.length === 0) {
    product.images = ['/placeholder.svg'];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.name,
        "image": product.images[0],
        "description": product.description,
        "sku": product.id.toString(),
        "offers": {
          "@type": "Offer",
          "url": `https://atozgadgetz.com/product/${slug}`,
          "priceCurrency": "USD",
          "price": product.price,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "124"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://atozgadgetz.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": product.category,
            "item": `https://atozgadgetz.com/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Does this product come with a warranty?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all our products come with a standard 1-year manufacturer warranty against defects."
            }
          },
          {
            "@type": "Question",
            "name": "How long does shipping take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Orders are typically dispatched within 24 hours. Standard delivery takes 3-7 business days depending on your location."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        <div className="w-full">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="relative">
          <div className="md:sticky md:top-24 space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-semibold tracking-wider text-accent uppercase">{product.category}</p>
                <div className="flex gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" className="opacity-50" />
                  <span className="text-xs text-muted ml-1">(124)</span>
                </div>
              </div>
              
              <RevealText as="h1" className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {product.name}
              </RevealText>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-muted">SKU: <span className="font-mono text-foreground">{product.id.toString().padStart(6, '0')}</span></span>
                <span className="text-muted">•</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  In Stock (150+ units)
                </span>
              </div>

              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-muted line-through pb-1">${(product.price * 1.2).toFixed(2)}</p>
                <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded mb-1">Save 20%</span>
              </div>
            </div>

            {/* Product Actions Component */}
            <ProductActions 
              productId={product.id} 
              productName={product.name}
              productDescription={product.description}
            />

            <DeliveryEstimate />

            {/* Trust Signals */}
            <TrustBadges />

            {/* Specifications Section */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold flex items-center gap-2">
                <Info size={18} /> Product Specifications
              </h3>
              
              <div className="bg-surface rounded-xl p-5 border border-black/5 dark:border-white/5 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t border-black/5 dark:border-white/5 pt-4">
                  <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">What's in the Box?</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    1x {product.name}, User Manual, Standard Packaging.
                  </p>
                </div>

                <div className="border-t border-black/5 dark:border-white/5 pt-4">
                  <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">Description</h4>
                  <div 
                    className="text-sm text-foreground/80 leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description.replace(/<p>\s*<\/p>/g, '') }}
                  />
                </div>

                <div className="border-t border-black/5 dark:border-white/5 pt-4">
                  <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wider">Frequently Asked Questions</h4>
                  <div className="space-y-4 mt-3">
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between font-medium text-sm text-foreground/90 hover:text-accent">
                        Does this product come with a warranty?
                        <ChevronDown className="w-5 h-5 text-muted transition group-open:rotate-180" />
                      </summary>
                      <p className="text-sm text-muted mt-2 group-open:animate-fadeIn">
                        Yes, all our products come with a standard 1-year manufacturer warranty against defects.
                      </p>
                    </details>
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between font-medium text-sm text-foreground/90 hover:text-accent">
                        How long does shipping take?
                        <ChevronDown className="w-5 h-5 text-muted transition group-open:rotate-180" />
                      </summary>
                      <p className="text-sm text-muted mt-2 group-open:animate-fadeIn">
                        Orders are typically dispatched within 24 hours. Standard delivery takes 3-7 business days depending on your location.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <div className="container mx-auto px-4 md:px-6">
      <ProductRecommendations currentSlug={slug} />
    </div>

    <StickyMobileCTA productId={product.id} productName={product.name} price={product.price.toString()} />
    </>
  );
}
