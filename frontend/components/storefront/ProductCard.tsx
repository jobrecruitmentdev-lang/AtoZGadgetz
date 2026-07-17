import Link from 'next/link';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  delay?: number;
}

export function ProductCard({ id, slug, name, price, image, category, delay = 0 }: ProductCardProps) {
  return (
    <RevealOnScroll delay={delay}>
      <Link href={`/product/${slug || id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 mb-4">
          <Image
            src={image || '/placeholder.svg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">{category}</p>
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-medium leading-tight group-hover:text-accent transition-colors">{name}</h3>
            <span className="font-semibold">${Number(price).toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  );
}
