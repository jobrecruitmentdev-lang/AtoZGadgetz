import { RevealText } from "@/components/motion/RevealText";
import { fetchApi } from "@/lib/api-client";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function WishlistPage() {
  let items = [];
  try {
    const data = await fetchApi<any[]>('/wishlist');
    items = data || [];
  } catch (err) {
    console.error("Failed to fetch wishlist:", err);
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-12 border-b border-black/10 dark:border-white/10 pb-8">
        <RevealText as="h1" className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Your Wishlist
        </RevealText>
        <p className="text-muted">Items you've saved for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((product, idx) => (
            <ProductCard key={product.id} {...product} delay={idx * 0.1} />
          ))}
        </div>
      )}
    </div>
  );
}
