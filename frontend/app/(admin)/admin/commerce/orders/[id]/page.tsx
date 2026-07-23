'use client';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, Truck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, use } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cjActionLoading, setCjActionLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);

  const loadOrder = () => {
    fetchApi<any>(`/api/order/${id}`).then(res => {
      setOrder(res);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await fetchApi(`/api/order/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadOrder();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const placeCjOrder = async () => {
    setCjActionLoading(true);
    setActionMessage(null);
    try {
      const response = await fetchApi<{ cjOrderId: string }>(`/api/cj/orders/${id}/place`, {
        method: 'POST',
      });
      setActionMessage(`CJ order placed: ${response.cjOrderId}`);
      loadOrder();
    } catch (e: any) {
      setActionMessage(e?.message || 'Failed to place CJ order');
    } finally {
      setCjActionLoading(false);
    }
  };

  const cancelCjOrder = async () => {
    const cjOrderId = order?.cj_order?.cj_order_id;
    if (!cjOrderId) return;
    setCjActionLoading(true);
    setActionMessage(null);
    try {
      await fetchApi(`/api/cj/orders/${cjOrderId}/cancel`, {
        method: 'POST',
      });
      setActionMessage(`CJ order ${cjOrderId} cancelled.`);
      loadOrder();
    } catch (e: any) {
      setActionMessage(e?.message || 'Failed to cancel CJ order');
    } finally {
      setCjActionLoading(false);
    }
  };

  const syncTracking = async () => {
    setTrackingLoading(true);
    setActionMessage(null);
    try {
      const tracking = await fetchApi<any>(`/api/order/${id}/tracking`);
      setTrackingData(tracking);
      setActionMessage('Tracking synced from CJ.');
      loadOrder();
    } catch (e: any) {
      setActionMessage(e?.message || 'Failed to sync tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found.</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/commerce/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Order {order.order_number}
              <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full capitalize
                ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                  order.order_status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                  order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
              `}>
                {order.order_status}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Update Status:</span>
            <select 
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-md text-sm outline-none"
              value={order.order_status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={statusUpdating}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={placeCjOrder}
              disabled={cjActionLoading || !!order?.cj_order}
              className="px-3 py-2 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-50"
            >
              {cjActionLoading ? 'Placing CJ Order...' : order?.cj_order ? 'CJ Order Placed' : 'Place CJ Order'}
            </button>
            <button
              type="button"
              onClick={syncTracking}
              disabled={trackingLoading}
              className="px-3 py-2 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-800 disabled:opacity-50"
            >
              {trackingLoading ? 'Syncing Tracking...' : 'Sync CJ Tracking'}
            </button>
            <button
              type="button"
              onClick={cancelCjOrder}
              disabled={cjActionLoading || !order?.cj_order?.cj_order_id}
              className="px-3 py-2 rounded-md text-sm font-medium border border-red-200 text-red-600 dark:border-red-900/50 disabled:opacity-50"
            >
              Cancel CJ Order
            </button>
          </div>
          {actionMessage && (
            <p className="mt-2 text-sm text-gray-500">{actionMessage}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Package size={18} /> Line Items</h3>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden flex-shrink-0">
                    <Image src="/placeholder.svg" alt="Product" fill className="object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="font-medium text-sm">{item.product_name}</h4>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <span className="text-sm text-gray-500">{item.quantity} &times; ${parseFloat(item.price).toFixed(2)}</span>
                    <span className="font-semibold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="w-full max-w-xs ml-auto space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${parseFloat(order.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>${(parseFloat(order.total_amount) - parseFloat(order.subtotal)).toFixed(2)}</span></div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-800 font-bold">
                  <span>Total</span><span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 text-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><User size={18} /> Customer</h3>
            <p className="font-medium">User ID: {order.user_id}</p>
          </div>

          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 text-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={18} /> Shipping Address</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Address details for Address ID: {order.address_id}
            </p>
          </div>

          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 text-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck size={18} /> CJ Fulfillment</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p><span className="font-medium text-black dark:text-white">CJ Order:</span> {order?.cj_order?.cj_order_id || 'Not created yet'}</p>
              <p><span className="font-medium text-black dark:text-white">CJ Status:</span> {order?.cj_order?.cj_status || 'N/A'}</p>
              <p><span className="font-medium text-black dark:text-white">Tracking Number:</span> {trackingData?.tracking_number || order?.shipment?.tracking_number || 'N/A'}</p>
              <p><span className="font-medium text-black dark:text-white">Carrier:</span> {trackingData?.courier_name || order?.shipment?.courier_name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
