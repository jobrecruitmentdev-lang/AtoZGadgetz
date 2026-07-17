import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input type="text" defaultValue="AtoZ Gadgets" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Support Email</label>
              <input type="email" defaultValue="support@atozgadgets.com" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Store Description</label>
              <textarea rows={3} defaultValue="Engineered for the way you live. Curated gadgets, no noise." className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Payment Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-md">
              <div>
                <p className="font-medium">Stripe Integration</p>
                <p className="text-sm text-gray-500">Accept credit cards and digital wallets</p>
              </div>
              <button className="text-sm font-medium text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">Disconnect</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-md">
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-gray-500">Accept PayPal payments</p>
              </div>
              <button className="text-sm font-medium text-black dark:text-white border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
