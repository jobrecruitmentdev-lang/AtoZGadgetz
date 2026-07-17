import { Search, Eye } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'John Doe', email: 'john.doe@example.com', orders: 4, spent: 1254.00 },
  { id: 'CUST-002', name: 'Alice Smith', email: 'alice.smith@example.com', orders: 1, spent: 199.00 },
  { id: 'CUST-003', name: 'Bob Johnson', email: 'bob.j@example.com', orders: 12, spent: 4892.50 },
  { id: 'CUST-004', name: 'Eva Green', email: 'eva.g@example.com', orders: 0, spent: 0.00 },
];

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Orders</th>
                <th className="px-6 py-3">Total Spent</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {MOCK_CUSTOMERS.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 font-medium text-black dark:text-white">{cust.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cust.email}</td>
                  <td className="px-6 py-4">{cust.orders}</td>
                  <td className="px-6 py-4 font-medium">${cust.spent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
