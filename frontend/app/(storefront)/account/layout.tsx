'use client';
import Link from 'next/link';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-[70vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      <RevealOnScroll>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-10">My Account</h1>
      </RevealOnScroll>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2 sticky top-32">
            <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors font-medium">
              <User size={18} />
              Profile
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors font-medium">
              <Package size={18} />
              Orders
            </Link>
            <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors font-medium">
              <MapPin size={18} />
              Addresses
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors font-medium mt-4">
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </aside>
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
