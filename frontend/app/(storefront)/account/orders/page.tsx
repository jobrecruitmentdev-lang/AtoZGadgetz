'use client';
import Link from 'next/link';
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any[]>('/api/orders/mine').then(data => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <RevealOnScroll>
        <h2 className="text-2xl font-bold mb-6">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-12 text-center">
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <Link href="/products" className="text-accent font-medium hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <RevealOnScroll key={order.id} delay={idx * 0.1}>
                <Link href={`/account/orders/${order.id}`}>
                  <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent transition-colors group">
                    <div>
                      <p className="font-bold text-lg mb-1">{order.order_number}</p>
                      <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()} &middot; {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                        <p className={`text-sm font-medium ${order.order_status === 'delivered' ? 'text-green-500' : 'text-amber-500'} capitalize`}>
                          {order.order_status}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </RevealOnScroll>
    </div>
  );
}
