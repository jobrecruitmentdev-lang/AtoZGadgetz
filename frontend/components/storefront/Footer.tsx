import Link from 'next/link';
import Image from 'next/image';
import { Mail, ExternalLink } from 'lucide-react';

// All subdued text in the footer uses text-background/XX (not text-muted/XX).
// bg-foreground is near-black in light mode (#0a0a0a) and near-white in dark mode (#fafaf9).
// text-background is near-white in light mode and near-black in dark mode — always high contrast.
// text-muted/70 on bg-foreground fails WCAG AA because --muted (#6b6b6b) at 70% opacity
// on a dark surface gives ~1.5:1 contrast ratio. text-background/75 gives ~9:1.

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/brand/atoz-icon.png"
                alt="AtoZ Gadgetz Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="text-xs text-background/75">Get all the gadgets under one Roof</div>
            </Link>
            <p className="text-sm text-background/80 max-w-xs leading-relaxed mb-4">
              Shop trending gadgets at affordable prices. Free shipping on qualifying orders.
              100% trusted. Delivered worldwide from 50+ global warehouses.
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/75">
              <a href="mailto:contact@atozgadgetz.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail size={14} />
                contact@atozgadgetz.com
              </a>
              <a href="https://www.instagram.com/atozgadgetzofficial/" className="flex items-center gap-2 hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                Instagram @atozgadgetzofficial
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Shop</h4>
            <ul className="space-y-2 text-sm text-background/75">
              <li><Link href="/products" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/category/electronics" className="hover:text-accent transition-colors">Electronics</Link></li>
              <li><Link href="/category/home-kitchen" className="hover:text-accent transition-colors">Home & Kitchen</Link></li>
              <li><Link href="/category/smart-home" className="hover:text-accent transition-colors">Smart Home</Link></li>
              <li><Link href="/category/gaming" className="hover:text-accent transition-colors">Gaming</Link></li>
              <li><Link href="/limited-time-offers" className="hover:text-accent transition-colors">Limited Time Offers</Link></li>
            </ul>
          </div>

          {/* Deals */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Shop by Price</h4>
            <ul className="space-y-2 text-sm text-background/75">
              <li><Link href="/under-99-gadgetz" className="hover:text-accent transition-colors">Under $10 / ₹99</Link></li>
              <li><Link href="/under-149-gadgetz" className="hover:text-accent transition-colors">Under ₹149</Link></li>
              <li><Link href="/under-199-gadgetz" className="hover:text-accent transition-colors">Under $20 / ₹199</Link></li>
              <li><Link href="/under-249-gadgetz" className="hover:text-accent transition-colors">Under ₹249</Link></li>
              <li><Link href="/under-299-gadgetz" className="hover:text-accent transition-colors">Under ₹299</Link></li>
              <li><Link href="/under-499-gadgetz" className="hover:text-accent transition-colors">Under $50 / ₹499</Link></li>
              <li><Link href="/under-999-gadgetz" className="hover:text-accent transition-colors">Under $100 / ₹999</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Support & Legal</h4>
            <ul className="space-y-2 text-sm text-background/75">
              <li><Link href="/about-us" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-payment-policy-2" className="hover:text-accent transition-colors">Shipping & Payment Policy</Link></li>
              <li><Link href="/return-and-refund-policy" className="hover:text-accent transition-colors">Cancellation, Return & Refund</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-accent transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment badges */}
        <div className="border-t border-background/20 pt-8 mb-6">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {['Visa', 'Mastercard', 'Amex', 'Maestro', 'UPI', 'Net Banking', 'Debit Card', 'IMPS'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 bg-background/15 rounded text-xs font-medium text-background/85"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-background/70">
            We Accept all the payment options so get all the gadgets now.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/20 pt-6 text-xs text-background/65 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Atoz Gadgetz ·Premium Gadgets with AtoZ· All rights reserved.</p>
          <div className="flex gap-4">
            <span>All Days 11am – 9pm IST</span>
            <span>·</span>
            <span>Worldwide Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
