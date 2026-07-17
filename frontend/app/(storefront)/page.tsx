import type { Metadata } from 'next';
import { RevealText } from "@/components/motion/RevealText";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Marquee } from "@/components/motion/Marquee";
import { ProductCard } from "@/components/storefront/ProductCard";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";
import {
  Smartphone, Home as HomeIcon, Car, Sparkles, HeartPulse, Dumbbell,
  PawPrint, Briefcase, Watch, Baby, Gamepad2, Leaf, Star,
  ShieldCheck, RotateCcw, Truck, CreditCard, Award, Globe
} from 'lucide-react';

export const metadata: Metadata = {
  title: "AtoZ Gadgetz — Shop Gadgets Worldwide | Electronics, Home & Kitchen, Beauty",
  description:
    "Shop trending gadgets at AtoZ Gadgetz — free worldwide shipping on qualifying orders. Electronics, home gadgets, beauty tools and 1,000+ products. 100% trusted. Fast delivery.",
  openGraph: {
    title: "AtoZ Gadgetz — Shop Gadgets Worldwide",
    description: "1,000+ curated gadgets. Electronics, home, beauty, fitness & more. Free shipping. 7-day exchange. Secure checkout.",
    type: "website",
  },
};

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Smartphone, color: "from-blue-500/20 to-blue-600/10", border: "border-blue-200 dark:border-blue-800" },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: HomeIcon, color: "from-orange-500/20 to-orange-600/10", border: "border-orange-200 dark:border-orange-800" },
  { name: "Automotive", slug: "automotive", icon: Car, color: "from-slate-500/20 to-slate-600/10", border: "border-slate-200 dark:border-slate-800" },
  { name: "Beauty", slug: "beauty", icon: Sparkles, color: "from-pink-500/20 to-pink-600/10", border: "border-pink-200 dark:border-pink-800" },
  { name: "Health", slug: "health", icon: HeartPulse, color: "from-red-500/20 to-red-600/10", border: "border-red-200 dark:border-red-800" },
  { name: "Sports", slug: "sports", icon: Dumbbell, color: "from-green-500/20 to-green-600/10", border: "border-green-200 dark:border-green-800" },
  { name: "Pet Supplies", slug: "pet-supplies", icon: PawPrint, color: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-200 dark:border-yellow-800" },
  { name: "Office", slug: "office", icon: Briefcase, color: "from-indigo-500/20 to-indigo-600/10", border: "border-indigo-200 dark:border-indigo-800" },
  { name: "Fashion", slug: "fashion", icon: Watch, color: "from-purple-500/20 to-purple-600/10", border: "border-purple-200 dark:border-purple-800" },
  { name: "Baby", slug: "baby", icon: Baby, color: "from-sky-500/20 to-sky-600/10", border: "border-sky-200 dark:border-sky-800" },
  { name: "Toys & Games", slug: "toys-games", icon: Gamepad2, color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-200 dark:border-emerald-800" },
  { name: "Garden", slug: "garden", icon: Leaf, color: "from-lime-500/20 to-lime-600/10", border: "border-lime-200 dark:border-lime-800" },
] as const;

const PRICE_RANGES = [
  { label: "Under $10", slug: "under-99-gadgetz", color: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900", tag: "Budget Buys" },
  { label: "Under $20", slug: "under-199-gadgetz", color: "bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-900", tag: "Best Value" },
  { label: "Under $50", slug: "under-499-gadgetz", color: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900", tag: "Popular" },
  { label: "Under $100", slug: "under-999-gadgetz", color: "bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900", tag: "Premium" },
] as const;

const TRUST_SIGNALS = [
  {
    icon: Truck,
    title: "Free Worldwide Shipping",
    desc: "Free shipping on orders over $30. Delivered in 10–15 days — as fast as possible for our beloved customers.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    desc: "SSL encrypted payments. Razorpay, Visa, Mastercard, Amex & more accepted.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    icon: RotateCcw,
    title: "7-Day Exchange",
    desc: "Received a defective item? Contact us within 7 days for an easy exchange.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: Star,
    title: "100% Trusted",
    desc: "Verified seller with thousands of happy customers across 50+ countries.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
] as const;

export default async function Home() {
  let featuredProducts: any[] = [];
  try {
    const pData = await fetchApi<{ data: any[] }>('/products?limit=8');
    featuredProducts = pData?.data?.slice(0, 8).map((p) => ({
      ...p,
      image: p.thumbnail_image,
      category: p.category?.name || 'Gadgets',
    })) || [];
  } catch {
    // Non-fatal — show empty grid
  }

  return (
    <div>
      {/* ── JSON-LD Organization Schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://atozgadgetz.com/#organization",
                "name": "AtoZ Gadgetz",
                "url": "https://atozgadgetz.com/",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "contact@atozgadgetz.com",
                  "contactType": "customer service",
                  "availableLanguage": ["English", "Hindi", "Gujarati"],
                  "hoursAvailable": "Mo-Su 11:00-21:00",
                },
                "sameAs": ["https://www.instagram.com/atozgadgetzofficial/"],
              },
              {
                "@type": "WebSite",
                "@id": "https://atozgadgetz.com/#website",
                "url": "https://atozgadgetz.com/",
                "name": "AtoZ Gadgetz",
                "description": "Shop trending gadgets at affordable prices. Free shipping on qualifying orders. 100% trusted. Delivered worldwide.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://atozgadgetz.com/products?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <RevealOnScroll delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 border border-accent/20">
            <Globe size={14} />
            <span>Worldwide Shipping to 50+ Countries</span>
          </div>
        </RevealOnScroll>

        <RevealText
          as="h1"
          split="words"
          className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 max-w-4xl"
        >
          You Deserve Gadgets Today!!
        </RevealText>

        <RevealOnScroll delay={0.4}>
          <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Get all the gadgets under one Roof — 1,000+ curated products from Electronics
            to Beauty, delivered worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton className="bg-accent text-white px-8 py-4 rounded-full font-semibold hover:bg-accent/90 transition-all duration-300 shadow-lg shadow-accent/25">
              <Link href="/products">Shop All Products</Link>
            </MagneticButton>
            <MagneticButton className="bg-foreground/5 text-foreground px-8 py-4 rounded-full font-medium hover:bg-foreground/10 transition-all duration-300 border border-foreground/10">
              <Link href="/category/electronics">Browse Electronics</Link>
            </MagneticButton>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.6} className="mt-16 flex gap-8 justify-center flex-wrap text-sm text-muted">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> SSL Secure</span>
          <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> 10,000+ Reviews</span>
          <span className="flex items-center gap-1.5"><Truck size={14} className="text-blue-500" /> 10–15 Day Delivery</span>
          <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-purple-500" /> Visa · Mastercard · PayPal</span>
        </RevealOnScroll>
      </section>

      {/* ── Marquee ── */}
      <Marquee
        text="Premium Gadgets · Worldwide Shipping · Secure Checkout · 7-Day Exchange · 10,000+ Customers"
        speed={1.5}
      />

      {/* ── Category Grid ── */}
      <section className="py-20 container mx-auto px-4 md:px-6">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
              Shop by Category
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              From cutting-edge electronics to everyday essentials — find everything in one place.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <RevealOnScroll key={cat.slug} delay={idx * 0.05}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-105 hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} />
                  </div>
                  <span className="font-semibold text-sm leading-tight">{cat.name}</span>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* ── Shop by Price ── */}
      <section className="py-20 bg-foreground/3">
        <div className="container mx-auto px-4 md:px-6">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">
                Shop by Price
              </h2>
              <p className="text-muted text-lg">
                Gadgets for every budget — from daily deals to premium picks.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICE_RANGES.map((range, idx) => (
              <RevealOnScroll key={range.slug} delay={idx * 0.1}>
                <Link
                  href={`/${range.slug}`}
                  className={`group relative overflow-hidden rounded-2xl p-8 flex flex-col gap-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${range.color}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {range.tag}
                  </span>
                  <span className="text-3xl font-extrabold tracking-tighter">
                    {range.label}
                  </span>
                  <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                    Shop now →
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <RevealOnScroll>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                    Featured Collection
                  </h2>
                  <p className="text-muted mt-2">Hand-picked products trending right now.</p>
                </div>
                <Link
                  href="/products"
                  className="text-accent hover:underline font-medium hidden md:flex items-center gap-1"
                >
                  View all →
                </Link>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, idx) => (
                <ProductCard key={product.id} {...product} delay={idx * 0.1} />
              ))}
            </div>

            {featuredProducts.length > 4 && (
              <>
                <RevealOnScroll className="mt-4">
                  <h3 className="text-2xl font-semibold tracking-tight mb-6">New Arrivals</h3>
                </RevealOnScroll>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.slice(4, 8).map((product, idx) => (
                    <ProductCard key={product.id} {...product} delay={idx * 0.1} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-all duration-300"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Signals ── */}
      <section className="py-20 bg-foreground/3">
        <div className="container mx-auto px-4 md:px-6">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Why Shop with AtoZ Gadgetz?</h2>
              <p className="text-muted">Your Destination for Premium Tech — Worldwide</p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_SIGNALS.map((signal, idx) => {
              const Icon = signal.icon;
              return (
                <RevealOnScroll key={idx} delay={idx * 0.1}>
                  <div className={`rounded-2xl p-6 ${signal.bg} border border-black/5 dark:border-white/5`}>
                    <div className={`w-12 h-12 rounded-xl bg-white/70 dark:bg-black/30 flex items-center justify-center mb-4`}>
                      <Icon size={22} className={signal.color} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{signal.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{signal.desc}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About Strip ── */}
      <section className="py-20 container mx-auto px-4 md:px-6 text-center max-w-4xl">
        <RevealOnScroll>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award size={20} className="text-accent" />
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">AtoZ Gadgetz</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">
            Get all the trending gadgets under one Roof
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            From cutting-edge <strong>smartwatches</strong> and high-fidelity <strong>audio gear</strong> to essential{' '}
            <strong>mobile accessories</strong> and smart home gadgets — AtoZ Gadgetz is your one-stop destination.
            We source directly from 50+ global warehouses so you get the best prices,
            fast dispatch, and delivery worldwide. We Accept all the payment options so get all the gadgets now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/about-us" className="text-accent hover:underline font-medium">
              About Us →
            </Link>
            <Link href="/contact" className="text-accent hover:underline font-medium">
              Contact Support →
            </Link>
            <Link href="/shipping-payment-policy-2" className="text-accent hover:underline font-medium">
              Shipping Policy →
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Payment Methods ── */}
      <section className="py-10 border-t border-black/5 dark:border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted">
              <span className="font-medium text-foreground">We Accept:</span>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Visa', 'Mastercard', 'Amex', 'UPI', 'Net Banking', 'Maestro', 'Debit Card', 'IMPS'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 bg-foreground/5 rounded-lg text-xs font-medium border border-foreground/10"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
