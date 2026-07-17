'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingCart, User, X, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { useAuth } from '@/components/auth/AuthContext';
import { useCart } from '@/components/storefront/CartContext';

const NAV_CATEGORIES = [
  {
    label: 'Electronics',
    slug: 'electronics',
    subs: ['Mobile Accessories', 'Laptop Accessories', 'Smart Home', 'Audio', 'Cameras', 'Gaming', 'Power Banks', 'Smartwatches', 'Chargers & Cables'],
  },
  {
    label: 'Home & Kitchen',
    slug: 'home-kitchen',
    subs: ['Kitchen Gadgets', 'Air Fryers', 'Blenders', 'Coffee Accessories', 'Storage', 'Cleaning Supplies', 'Home Decor', 'Lighting', 'Bathroom'],
  },
  {
    label: 'Beauty',
    slug: 'beauty',
    subs: ['Skin Care', 'Hair Care', 'Grooming', 'Makeup', 'Nail Care', 'Beauty Tools', 'Personal Care', 'Wellness'],
  },
  {
    label: 'Health & Sports',
    slug: 'health',
    subs: ['Fitness Equipment', 'Supplements', 'Massage', 'Yoga', 'Health Monitors', 'Cycling', 'Camping', 'Travel Gear'],
  },
  {
    label: 'More',
    slug: null,
    subs: [],
    megaLinks: [
      { label: 'Automotive', slug: 'automotive' },
      { label: 'Pet Supplies', slug: 'pet-supplies' },
      { label: 'Office & Stationery', slug: 'office' },
      { label: 'Fashion & Accessories', slug: 'fashion' },
      { label: 'Baby', slug: 'baby' },
      { label: 'Toys & Games', slug: 'toys-games' },
      { label: 'Garden', slug: 'garden' },
      { label: 'Seasonal', slug: 'seasonal' },
    ],
  },
] as const;

const PRICE_LINKS = [
  { label: 'Under $10', slug: 'under-99-gadgetz' },
  { label: 'Under $20', slug: 'under-199-gadgetz' },
  { label: 'Under $50', slug: 'under-499-gadgetz' },
  { label: 'Under $100', slug: 'under-999-gadgetz' },
  { label: 'Limited Offers', slug: 'limited-time-offers' },
];

export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setOpenMega(null);
    setSearchOpen(false);
  }, [pathname]);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMega(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMega(null), 150);
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm py-2'
            : 'bg-transparent py-4'
        }`}
      >
        {/* Top bar */}
        <div className="bg-accent/5 text-center py-1.5 text-xs font-medium text-muted hidden md:block">
          Free worldwide shipping on orders over $30 · 7–15 day delivery · Secure checkout
        </div>

        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/brand/atoz-icon.png"
              alt="AtoZ Gadgetz Logo"
              width={48}
              height={48}
              priority
              className="rounded-full invert dark:invert-0"
            />
            <span className="font-bold text-lg tracking-tight hidden sm:block">AtoZ Gadgetz</span>
          </Link>

          {/* Desktop Mega Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/products" className="px-3 py-3 rounded-lg hover:bg-foreground/5 hover:text-accent transition-colors">
              All Products
            </Link>

            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-3 rounded-lg hover:bg-foreground/5 hover:text-accent transition-colors ${openMega === cat.label ? 'text-accent bg-foreground/5' : ''}`}
                >
                  {cat.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openMega === cat.label ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {openMega === cat.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 min-w-[220px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-3 z-50"
                      onMouseEnter={() => handleMouseEnter(cat.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {'subs' in cat && cat.subs.length > 0 && (
                        <>
                          {cat.slug && (
                            <Link
                              href={`/category/${cat.slug}`}
                              className="block px-3 py-2 rounded-lg font-semibold text-accent hover:bg-accent/5 mb-1 text-sm"
                            >
                              All {cat.label} →
                            </Link>
                          )}
                          <div className="h-px bg-foreground/10 mb-2" />
                          {cat.subs.map((sub) => (
                            <Link
                              key={sub}
                              href={`/category/${sub.toLowerCase().replace(/\s+/g, '-').replace(/&\s*/g, '').replace(/--+/g, '-')}`}
                              className="block px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                            >
                              {sub}
                            </Link>
                          ))}
                        </>
                      )}

                      {'megaLinks' in cat && cat.megaLinks && (
                        <div className="grid grid-cols-2 gap-1">
                          {cat.megaLinks.map((link) => (
                            <Link
                              key={link.slug}
                              href={`/category/${link.slug}`}
                              className="block px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Price Deals dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('deals')}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`flex items-center gap-1 px-3 py-3 rounded-lg text-accent font-semibold hover:bg-accent/5 transition-colors ${openMega === 'deals' ? 'bg-accent/5' : ''}`}>
                Deals
                <ChevronDown size={14} className={`transition-transform duration-200 ${openMega === 'deals' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openMega === 'deals' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 min-w-[200px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-3 z-50"
                    onMouseEnter={() => handleMouseEnter('deals')}
                    onMouseLeave={handleMouseLeave}
                  >
                    {PRICE_LINKS.map((link) => (
                      <Link
                        key={link.slug}
                        href={`/${link.slug}`}
                        className="block px-3 py-2 text-sm text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden hidden sm:block"
                >
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search gadgets..."
                    className="w-full px-3 py-1.5 text-sm rounded-full border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                    onBlur={() => setSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-foreground hover:text-accent hover:bg-foreground/5 transition-colors hidden sm:flex"
            >
              <Search size={20} />
            </button>

            <Link
              href={user ? '/account' : '/login'}
              aria-label="Account"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-foreground hover:text-accent hover:bg-foreground/5 transition-colors"
            >
              <User size={20} />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-foreground hover:text-accent hover:bg-foreground/5 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-background z-50 p-6 md:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/brand/atoz-logo.png"
                    alt="AtoZ Gadgetz Logo"
                    width={36}
                    height={36}
                    className="rounded-full invert dark:invert-0"
                  />
                  <span className="font-bold">AtoZ Gadgetz</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Menu" className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors">
                  <X size={22} />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="search"
                  placeholder="Search gadgets..."
                  className="w-full px-4 py-2.5 text-sm rounded-full border border-foreground/20 bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <nav className="flex flex-col gap-1 text-sm font-medium flex-grow">
                <Link href="/products" className="px-3 py-2.5 rounded-lg hover:bg-foreground/5">All Products</Link>
                <div className="h-px bg-foreground/10 my-2" />
                <p className="text-xs text-muted uppercase tracking-widest px-3 py-1">Categories</p>
                {NAV_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.slug ? `/category/${cat.slug}` : '/products'}
                    className="px-3 py-2.5 rounded-lg hover:bg-foreground/5 hover:text-accent transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="h-px bg-foreground/10 my-2" />
                <p className="text-xs text-muted uppercase tracking-widest px-3 py-1">Deals</p>
                {PRICE_LINKS.map((link) => (
                  <Link
                    key={link.slug}
                    href={`/${link.slug}`}
                    className="px-3 py-2.5 rounded-lg hover:bg-foreground/5 text-accent font-semibold transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-foreground/10 my-2" />
                <Link href={user ? '/account' : '/login'} className="px-3 py-2.5 rounded-lg hover:bg-foreground/5">
                  {user ? 'My Account' : 'Sign In'}
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
