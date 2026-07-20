import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
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
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5 dark:bg-white/5">
          <SafeImage
            src={image || '/placeholder.svg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">{category}</p>
          <div className="mt-2 flex flex-col gap-1">
            <h3 className="text-lg font-medium leading-tight group-hover:text-accent transition-colors line-clamp-1">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-lg">${Number(price).toFixed(2)}</span>
              <span className="text-xs text-muted line-through">${(Number(price) * 1.2).toFixed(2)}</span>
              <span className="text-[10px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded">SAVE 20%</span>
            </div>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  );
}
