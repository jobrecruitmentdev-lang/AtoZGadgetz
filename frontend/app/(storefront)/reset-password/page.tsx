'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MagneticButton } from '@/components/motion/MagneticButton';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await fetchApi('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      });
      
      router.push('/login?reset=success');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <MagneticButton className="w-full bg-foreground text-background py-3 rounded-md font-medium hover:bg-accent transition-colors mt-6">
          <span className="block text-center">{loading ? 'Resetting...' : 'Reset Password'}</span>
        </MagneticButton>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <RevealOnScroll>
        <div className="bg-surface backdrop-blur-lg p-8 rounded-[var(--radius)] shadow-sm border border-black/5 dark:border-white/5">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted mb-8">Enter your new password below.</p>

          <Suspense fallback={<div className="text-sm text-muted">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered your password? <Link href="/login" className="text-foreground hover:text-accent font-medium">Sign in</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
