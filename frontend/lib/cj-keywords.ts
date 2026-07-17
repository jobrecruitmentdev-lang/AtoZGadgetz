// CJ's search API returns far fewer/zero results for generic single-word keywords
// (e.g. "office" -> 0, "storage" -> 0) than for 2-4 word compound phrases (e.g.
// "office desk stationery gadget"). Most storefront nav slugs (Header.tsx,
// Footer.tsx) aren't real DB categories, so they'd otherwise fall through to
// `slug.replace(/-/g, ' ')`, which is exactly the weak single-word case. This map
// keeps a curated compound keyword for those virtual slugs until they're modeled
// as real Category/SubCategory rows with their own cj_keyword.
export const FALLBACK_KEYWORDS: Record<string, string> = {
  electronics: 'electronics gadget', 'home-kitchen': 'kitchen home gadget',
  beauty: 'beauty tools skincare', health: 'health fitness',
  'mobile-accessories': 'mobile phone accessories', 'laptop-accessories': 'laptop accessories bag',
  'smart-home': 'smart home device', audio: 'bluetooth earphones speaker',
  cameras: 'camera photography', gaming: 'gaming accessories controller',
  'power-banks': 'power bank charger', smartwatches: 'smartwatch fitness band',
  'chargers-cables': 'charger usb cable', 'kitchen-gadgets': 'kitchen gadgets tools',
  'air-fryers': 'air fryer kitchen', blenders: 'blender juicer mixer',
  'coffee-accessories': 'coffee accessories mug', storage: 'storage organizer box',
  'cleaning-supplies': 'cleaning supplies tools', 'home-decor': 'home decor wall art',
  lighting: 'led light bulb lamp', bathroom: 'bathroom accessories organizer',
  'skin-care': 'skin care serum', 'hair-care': 'hair care tools brush',
  grooming: 'grooming shaver trimmer', makeup: 'makeup cosmetics tools',
  'nail-care': 'nail care tools kit', 'beauty-tools': 'beauty facial device',
  'personal-care': 'personal care electric massager', wellness: 'wellness relaxation massage',
  'fitness-equipment': 'fitness gym equipment', supplements: 'health supplement vitamin bottle',
  massage: 'massage gun device', yoga: 'yoga mat exercise fitness',
  'health-monitors': 'blood pressure monitor oximeter', cycling: 'cycling bike accessories',
  camping: 'camping outdoor survival gear', 'travel-gear': 'travel accessories bag organizer',
  automotive: 'car accessories auto interior', 'pet-supplies': 'pet dog cat accessories',
  office: 'office desk stationery gadget', fashion: 'fashion accessories watch jewelry',
  baby: 'baby care kids accessories', 'toys-games': 'toys games rc gadgets',
  garden: 'garden tools outdoor plant', seasonal: 'seasonal holiday gifts decor',
  'under-99-gadgetz': 'cheap gadgets accessories', 'under-149-gadgetz': 'affordable gadgets accessories',
  'under-199-gadgetz': 'budget gadgets phone accessories', 'under-249-gadgetz': 'gadgets accessories tools',
  'under-299-gadgetz': 'smart gadgets home accessories', 'under-349-gadgetz': 'electronics accessories gadget',
  'under-499-gadgetz': 'gadgets electronics home tools', 'under-999-gadgetz': 'premium gadgets electronics',
  'limited-time-offers': 'trending gadgets best deals', 'best-sellers': 'popular gadgets bestseller',
  new: 'new gadgets trending',
  // Real DB categories (prisma Category rows) — kept here too since they're
  // looked up by slug the same way as the virtual nav slugs above.
  furniture: 'furniture home decor', 'home-assets': 'home appliances',
  clothes: 'clothing fashion apparel', gadgets: 'gadgets electronics',
};

export function resolveCjKeyword(cat: { slug?: string | null; cj_keyword?: string | null; name?: string | null } | null | undefined): string {
  if (!cat) return 'gadgets electronics';
  return cat.cj_keyword || (cat.slug && FALLBACK_KEYWORDS[cat.slug]) || cat.name || (cat.slug ?? '').replace(/-/g, ' ') || 'gadgets electronics';
}
