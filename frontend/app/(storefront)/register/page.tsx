'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { useAuth } from '@/components/auth/AuthContext';

function RegisterClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [activationSession, setActivationSession] = useState('');
  const [verifyingLink, setVerifyingLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activationToken = searchParams.get('activationToken');

  useEffect(() => {
    if (!activationToken) return;

    const verifyToken = async () => {
      setVerifyingLink(true);
      setError('');
      try {
        const data = await fetchApi<{ activation_token: string; email: string }>('/api/auth/magic-link/verify', {
          method: 'POST',
          body: JSON.stringify({ token: activationToken }),
        });
        setActivationSession(data.activation_token);
        setEmail(data.email);
      } catch (err: any) {
        setError(err.message || 'Activation link is invalid or expired.');
      } finally {
        setVerifyingLink(false);
      }
    };

    void verifyToken();
  }, [activationToken]);

  const requestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchApi('/api/auth/magic-link/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Unable to send activation link.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationSession) return;
    setError('');
    setLoading(true);

    try {
      await fetchApi('/api/auth/register/complete', {
        method: 'POST',
        body: JSON.stringify({
          activation_token: activationSession,
          first_name: firstName,
          last_name: lastName,
          mobile,
          password,
        }),
      });

      await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await refreshUser();
      router.push('/account?registered=true');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <RevealOnScroll>
        <div className="bg-surface backdrop-blur-lg p-8 rounded-[var(--radius)] shadow-sm border border-black/5 dark:border-white/5">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted mb-8">Email activation + international mobile setup for secure checkout.</p>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

          {!activationToken && (
            <>
              {!emailSent ? (
                <form onSubmit={requestMagicLink} className="space-y-4">
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
                    <span className="block text-center">{loading ? 'Sending activation link...' : 'Send Magic Activation Link'}</span>
                  </MagneticButton>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">
                    Activation link sent. Check your email and open the link to continue registration.
                  </p>
                  <button
                    type="button"
                    className="text-sm text-accent hover:underline"
                    onClick={() => setEmailSent(false)}
                  >
                    Use another email
                  </button>
                </div>
              )}
            </>
          )}

          {activationToken && (
            <>
              {verifyingLink && <p className="text-sm text-muted">Verifying activation link...</p>}
              {!verifyingLink && !!activationSession && (
                <form onSubmit={completeRegistration} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Activated Email</label>
                    <input
                      type="email"
                      value={email}
                      className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background text-muted"
                      disabled
                    />
                  </div>
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
                    <label className="block text-sm font-medium mb-1">Mobile (International format)</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+14155550123"
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
                    <span className="block text-center">{loading ? 'Completing registration...' : 'Complete Registration'}</span>
                  </MagneticButton>
                </form>
              )}
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link href="/login" className="text-foreground hover:text-accent font-medium">Sign in</Link>
          </p>
        </div>
      </RevealOnScroll>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto my-20 px-4 text-sm text-muted">Loading registration flow...</div>}>
      <RegisterClientPage />
    </Suspense>
  );
}

