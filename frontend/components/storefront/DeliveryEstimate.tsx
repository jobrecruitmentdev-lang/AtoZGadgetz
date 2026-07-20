'use client';
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";

export function DeliveryEstimate() {
  const [deliveryDate, setDeliveryDate] = useState<string>('');

  useEffect(() => {
    // Calculate delivery date as 3 days from now, skipping Sundays
    const date = new Date();
    let daysToAdd = 3;
    
    while (daysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0) { // Skip Sundays
        daysToAdd--;
      }
    }
    
    setDeliveryDate(date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
  }, []);

  if (!deliveryDate) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl my-4 text-sm">
      <div className="bg-accent/10 p-2 rounded-full text-accent shrink-0">
        <Truck size={18} />
      </div>
      <div>
        <p className="font-semibold text-foreground">Free Delivery by {deliveryDate}</p>
        <p className="text-muted text-xs mt-0.5">Order within the next 2 hours for dispatch today.</p>
      </div>
    </div>
  );
}
