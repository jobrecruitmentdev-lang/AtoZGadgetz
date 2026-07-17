import { Search, Bell, User } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center w-96 relative">
        <Search size={16} className="absolute left-3 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search admin..." 
          className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline">View Storefront</Link>
        <button className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
