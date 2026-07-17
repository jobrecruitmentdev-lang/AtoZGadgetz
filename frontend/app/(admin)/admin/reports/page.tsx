import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <select className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md py-2 px-4 text-sm focus:outline-none">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Sales</p>
          <h3 className="text-3xl font-bold mb-2">$124,592.00</h3>
          <p className="text-sm text-green-500 flex items-center gap-1"><TrendingUp size={14} /> +14.5% from last period</p>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Orders</p>
          <h3 className="text-3xl font-bold mb-2">1,204</h3>
          <p className="text-sm text-green-500 flex items-center gap-1"><TrendingUp size={14} /> +8.2% from last period</p>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Conversion Rate</p>
          <h3 className="text-3xl font-bold mb-2">3.42%</h3>
          <p className="text-sm text-red-500 flex items-center gap-1"><TrendingUp size={14} className="rotate-180" /> -0.8% from last period</p>
        </div>
        <div className="bg-white dark:bg-black p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium mb-1">Avg Order Value</p>
          <h3 className="text-3xl font-bold mb-2">$103.48</h3>
          <p className="text-sm text-green-500 flex items-center gap-1"><TrendingUp size={14} /> +2.1% from last period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><BarChart3 size={18} /> Revenue Over Time</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded">
            <p className="text-gray-500 text-sm">Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><ShoppingBag size={18} /> Top Selling Products</h3>
          <div className="space-y-4">
            {[
              { name: 'Aero Noise Cancelling Headphones', sales: 432 },
              { name: 'Nova Smart Watch Pro', sales: 218 },
              { name: 'Lumina Desk Lamp', sales: 156 },
              { name: 'Zenith Mechanical Keyboard', sales: 89 },
            ].map((prod, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-900 last:border-0">
                <span className="text-sm font-medium">{prod.name}</span>
                <span className="text-sm text-gray-500">{prod.sales} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
