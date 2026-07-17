import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <RevealOnScroll>
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-green-500" />
        </div>
      </RevealOnScroll>
      <RevealText as="h1" className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
        Order Confirmed
      </RevealText>
      <RevealOnScroll delay={0.2}>
        <p className="text-xl text-muted max-w-lg mx-auto mb-2">
          Thank you for your purchase!
        </p>
        <p className="text-muted max-w-lg mx-auto mb-10">
          Your order #ORD-{(Math.random() * 1000000).toFixed(0)} has been placed and is being processed. We'll send you an email confirmation shortly.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-accent transition-colors">
            <Link href="/account">View Order Status</Link>
          </MagneticButton>
          <MagneticButton className="bg-surface text-foreground border border-black/10 dark:border-white/10 px-8 py-3 rounded-full font-medium hover:bg-accent hover:text-white hover:border-accent transition-colors">
            <Link href="/products">Continue Shopping</Link>
          </MagneticButton>
        </div>
      </RevealOnScroll>
    </div>
  );
}
