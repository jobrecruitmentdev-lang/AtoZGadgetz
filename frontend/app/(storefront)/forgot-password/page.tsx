'use client';
import { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MagneticButton } from '@/components/motion/MagneticButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await fetchApi('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      setMessage('If an account exists, a password reset link has been sent to your email.');
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
          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted mb-8">Enter your email and we'll send you a link to reset your password.</p>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
          {message && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">{message}</div>}

          <form onSubmit={handleReset} className="space-y-4">
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
            <MagneticButton className="w-full bg-foreground text-background py-3 rounded-md font-medium hover:bg-accent transition-colors mt-6">
              <span className="block text-center">{loading ? 'Sending link...' : 'Send Reset Link'}</span>
            </MagneticButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered your password? <Link href="/login" className="text-foreground hover:text-accent font-medium">Sign in</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
