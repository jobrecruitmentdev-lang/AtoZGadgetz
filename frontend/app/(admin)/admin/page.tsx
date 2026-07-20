'use client';
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    customersCount: 0,
    productsCount: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [orders, products] = await Promise.all([
          fetchApi<any[]>('/api/order'),
          fetchApi<any[]>('/api/products')
        ]);

        const orderList = Array.isArray(orders) ? orders : [];
        const productList = Array.isArray(products) ? products : [];

        let revenue = 0;
        const customers = new Set<number>();
        orderList.forEach((o: any) => {
          if (o.order_status === 'delivered') revenue += parseFloat(o.total_amount);
          if (o.user_id) customers.add(o.user_id);
        });

        const productsCount = productList.reduce((sum: number, p: any) => sum + (p.stock_quantity || 0), 0);

        setStats({
          revenue,
          ordersCount: orderList.length,
          customersCount: customers.size,
          productsCount
        });
      } catch (e) {
        console.error(e);
      }
    };
    
    loadDashboard();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, trend: '+20.1%' },
          { title: 'Orders', value: stats.ordersCount, icon: ShoppingCart, trend: '+12.5%' },
          { title: 'Active Customers', value: stats.customersCount, icon: Users, trend: '+5.4%' },
          { title: 'Products in Stock', value: stats.productsCount, icon: Package, trend: '-1.2%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                <stat.icon size={20} className="text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight size={16} className={stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'} />
              <span className={`font-medium ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">Sales Chart Placeholder</p>
      </div>
    </div>
  );
}
