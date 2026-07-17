'use client';
import { Search, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any[]>('/api/orders').then(res => {
      setOrders(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <Filter size={16} /> Advanced Filters
        </button>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <select className="bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-4 text-sm focus:outline-none">
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 font-medium text-black dark:text-white">{order.order_number}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{order.user_id}</td>
                    <td className="px-6 py-4">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 font-medium">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          order.order_status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                          order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                      `}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/commerce/orders/${order.id}`} className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
