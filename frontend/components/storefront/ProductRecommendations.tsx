'use client';
import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductRecommendationsProps {
  currentSlug: string;
}

export function ProductRecommendations({ currentSlug }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(`/server-proxy/products/${currentSlug}/recommendations`);
        const json = await res.json();
        if (json.success && json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [currentSlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-zinc-500 h-8 w-8" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-12 border-t border-zinc-800">
      <h2 className="text-2xl font-bold mb-8 tracking-tight">You May Also Like</h2>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            id={product.id.toString()}
            slug={product.slug}
            name={product.name}
            price={parseFloat(product.price)}
            image={product.thumbnail_image || (product.images && product.images[0] ? product.images[0].url : '/placeholder.svg')}
            category={product.category?.name || 'Uncategorized'}
          />
        ))}
      </motion.div>
    </div>
  );
}
