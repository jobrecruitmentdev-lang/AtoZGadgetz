'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MagneticButton } from '@/components/motion/MagneticButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <RevealOnScroll>
        <div className="bg-surface backdrop-blur-lg p-8 rounded-[var(--radius)] shadow-sm border border-black/5 dark:border-white/5">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted mb-8">Sign in to your account to continue.</p>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <MagneticButton className="w-full bg-foreground text-background py-3 rounded-md font-medium hover:bg-accent transition-colors mt-6">
              <span className="block text-center">{loading ? 'Signing in...' : 'Sign In'}</span>
            </MagneticButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account? <Link href="/register" className="text-foreground hover:text-accent font-medium">Sign up</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
