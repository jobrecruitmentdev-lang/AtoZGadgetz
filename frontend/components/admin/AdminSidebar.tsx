import Link from 'next/link';
import { Package, LayoutGrid, Tags, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react';

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-black dark:bg-white text-white dark:text-black flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10 dark:border-black/10">
        <h2 className="text-xl font-bold tracking-tight">AtoZ Admin</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-white/50 dark:text-black/50 uppercase tracking-wider mb-3 px-3">Catalog</h3>
          <nav className="space-y-1">
            <Link href="/admin/catalog/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <Package size={16} /> Products
            </Link>
            <Link href="/admin/catalog/categories" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <LayoutGrid size={16} /> Categories
            </Link>
            <Link href="/admin/catalog/brands" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <Tags size={16} /> Brands
            </Link>
          </nav>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-white/50 dark:text-black/50 uppercase tracking-wider mb-3 px-3">Commerce</h3>
          <nav className="space-y-1">
            <Link href="/admin/commerce/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <ShoppingCart size={16} /> Orders
            </Link>
            <Link href="/admin/commerce/customers" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <Users size={16} /> Customers
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white/50 dark:text-black/50 uppercase tracking-wider mb-3 px-3">System</h3>
          <nav className="space-y-1">
            <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <BarChart3 size={16} /> Reports
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-sm font-medium">
              <Settings size={16} /> Settings
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
