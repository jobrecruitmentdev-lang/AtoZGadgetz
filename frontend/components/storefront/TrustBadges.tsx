import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";

export function TrustBadges() {
  const badges = [
    { icon: <ShieldCheck size={24} className="text-accent" />, label: "Secure Checkout", sublabel: "256-bit Encryption" },
    { icon: <Truck size={24} className="text-accent" />, label: "Fast Shipping", sublabel: "Across the country" },
    { icon: <RotateCcw size={24} className="text-accent" />, label: "Easy Returns", sublabel: "14-day return policy" },
    { icon: <CreditCard size={24} className="text-accent" />, label: "Flexible Payments", sublabel: "Multiple options available" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-black/5 dark:border-white/5 my-8">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center space-y-2 p-2">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            {badge.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{badge.label}</h4>
            <p className="text-xs text-muted mt-1">{badge.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
