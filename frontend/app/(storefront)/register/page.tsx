'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MagneticButton } from '@/components/motion/MagneticButton';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
      });
      
      router.push('/login?registered=true');
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted mb-8">Join us to shop the latest gadgets.</p>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <MagneticButton className="w-full bg-foreground text-background py-3 rounded-md font-medium hover:bg-accent transition-colors mt-6">
              <span className="block text-center">{loading ? 'Creating account...' : 'Sign Up'}</span>
            </MagneticButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link href="/login" className="text-foreground hover:text-accent font-medium">Sign in</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}
