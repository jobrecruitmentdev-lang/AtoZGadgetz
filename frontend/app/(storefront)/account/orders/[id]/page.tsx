'use client';
import Link from 'next/link';
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ArrowLeft, Package } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';
import { use } from 'react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/api/orders/${id}`).then(data => {
      setOrder(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="space-y-8">
      <RevealOnScroll>
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Order {order.order_number}</h2>
            <p className="text-muted">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`inline-block px-4 py-1.5 font-medium rounded-full text-sm w-fit capitalize ${order.order_status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
            {order.order_status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2"><Package size={18} /> Items</h3>
              <div className="space-y-6">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-background rounded-lg overflow-hidden flex-shrink-0">
                      <Image src="/placeholder.svg" alt="Product" fill className="object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted mb-2">Qty: {item.quantity}</p>
                      <span className="font-semibold">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>${parseFloat(order.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between text-muted"><span>Shipping</span><span>${(parseFloat(order.total_amount) - parseFloat(order.subtotal)).toFixed(2)}</span></div>
                <div className="flex justify-between pt-3 border-t border-black/10 dark:border-white/10 mt-3 font-bold text-base">
                  <span>Total</span><span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 text-sm">
              <h3 className="font-semibold mb-4">Shipping Address</h3>
              <p className="text-muted leading-relaxed">
                Will be populated from address API.
              </p>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
