'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

import { useCart } from '@/components/storefront/CartContext';
import { useAuth } from '@/components/auth/AuthContext';
import { fetchApi } from '@/lib/api-client';
import { TrustBadges } from '@/components/storefront/TrustBadges';

declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'razorpay'>('paypal');
  const paypalCaptureRef = useRef(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
  });

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(String((item.product as any)?.price ?? 0)) * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 30 ? 0 : 5.99;
  const total = subtotal + shippingFee;
  const profileIncomplete = !!user && (!user.first_name?.trim() || !user.last_name?.trim() || !user.mobile?.trim());

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      mobile: user.mobile || '',
    });
    setForm((prev) => ({
      ...prev,
      firstName: user.first_name || prev.firstName,
      lastName: user.last_name || prev.lastName,
      email: user.email || prev.email,
      phone: user.mobile || prev.phone,
    }));
  }, [user]);

  useEffect(() => {
    // Load Razorpay script
    const existingRp = document.getElementById('razorpay-script');
    if (!existingRp) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (paypalCaptureRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const isPaypalReturn = params.get('paypal') === '1';
    const orderId = params.get('orderId');
    const token = params.get('token');

    if (!isPaypalReturn || !orderId || !token) return;

    paypalCaptureRef.current = true;
    setStep(2);
    setLoading(true);
    setError(null);

    const captureAfterReturn = async () => {
      await fetchApi('/api/payment/paypal/capture-order', {
        method: 'POST',
        body: JSON.stringify({
          paypalOrderId: token,
          orderId: Number(orderId),
        }),
      });
      await refreshCart();
      router.replace('/order-success');
    };

    captureAfterReturn().catch((err: any) => {
      setError(err.message || 'PayPal capture failed. Please retry checkout.');
      setLoading(false);
      paypalCaptureRef.current = false;
    });
  }, [refreshCart, router]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep(2);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setError(null);
    try {
      await fetchApi('/api/auth/profile/complete', {
        method: 'POST',
        body: JSON.stringify({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          mobile: profileForm.mobile,
        }),
      });
      await refreshUser();
      setForm((prev) => ({
        ...prev,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.mobile,
      }));
    } catch (e: any) {
      setError(e.message || 'Failed to complete profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePayPalPayment = async (orderId: number) => {
    const ppOrder = await fetchApi<{
      paypal_order_id: string;
      status: string;
      approve_url: string;
    }>('/api/payment/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });

    if (!ppOrder.approve_url) {
      throw new Error('Unable to start PayPal approval flow.');
    }
    window.location.href = ppOrder.approve_url;
  };

  const handleRazorpayPayment = async (orderId: number) => {
    const rpOrder = await fetchApi<{
      razorpay_order_id: string;
      amount: number;
      currency: string;
      key_id: string;
    }>('/api/payment/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: total, currency: 'USD', orderId }),
    });

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: rpOrder.key_id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'AtoZ Gadgetz',
        description: `Order #${orderId}`,
        order_id: rpOrder.razorpay_order_id,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#c9a962' },
        handler: async (response: any) => {
          try {
            await fetchApi('/api/payment/razorpay/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }),
            });
            resolve();
          } catch (err: any) {
            reject(new Error(err.message || 'Payment verification failed'));
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user')),
        },
      };

      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please refresh and try again.'));
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        reject(new Error(res.error?.description || 'Payment failed'));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Create the order in our DB first
      const order = await fetchApi<{ id: number }>('/api/order/place', {
        method: 'POST',
        body: JSON.stringify({
          address: {
            address_line1: form.address,
            address_line2: form.address2,
            city: form.city,
            state: form.state,
            postal_code: form.postalCode,
            country: form.country,
          },
          items: items.map((i) => ({
            product_id: (i.product as any)?.id || i.product_id,
            quantity: i.quantity,
            price: (i.product as any)?.price || i.price,
            name: (i.product as any)?.name || 'Product',
          }))
        }),
      });

      // 2. Execute selected payment gateway
      if (paymentMethod === 'paypal') {
        await handlePayPalPayment(order.id);
        return;
      } else {
        await handleRazorpayPayment(order.id);
      }

      // 3. Payment verified — clear cart and redirect to order success
      await refreshCart();
      router.push('/order-success');
    } catch (e: any) {
      setError(e.message || 'Something went wrong with your payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <RevealOnScroll>
        <h1 className="text-3xl font-bold tracking-tighter mb-10">Checkout</h1>
      </RevealOnScroll>

      {!authLoading && !user && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="text-xl font-bold mb-2">Sign in required for checkout</h2>
          <p className="text-sm text-muted mb-4">
            Please sign in first. After login, complete your profile once, then continue checkout.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login?from=/checkout')}
            className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            Sign in to Continue
          </button>
        </div>
      )}

      {!authLoading && user && profileIncomplete && (
        <form onSubmit={handleCompleteProfile} className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 space-y-4">
          <h2 className="text-xl font-bold">Complete your profile before purchase</h2>
          <p className="text-sm text-muted">
            Your account must have verified personal details and international mobile number (E.164 format, e.g. +14155550123).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              required
              value={profileForm.firstName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
              className={inputCls}
              placeholder="First name"
            />
            <input
              required
              value={profileForm.lastName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
              className={inputCls}
              placeholder="Last name"
            />
            <input
              required
              value={profileForm.mobile}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, mobile: e.target.value }))}
              className={inputCls}
              placeholder="+14155550123"
            />
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
          >
            {profileLoading ? 'Saving Profile...' : 'Save Profile and Continue'}
          </button>
        </form>
      )}

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left — Forms */}
        <div className="flex-grow">
          {/* Step progress */}
          <div className="flex items-center gap-2 mb-10 border-b border-foreground/10 pb-4 text-sm">
            <button onClick={() => step > 1 && setStep(1)} className={`font-medium ${step >= 1 ? 'text-foreground' : 'text-muted'}`}>
              1. Shipping
            </button>
            <span className="text-muted">/</span>
            <span className={`font-medium ${step >= 2 ? 'text-foreground' : 'text-muted'}`}>
              2. Payment
            </span>
          </div>

          {user && !profileIncomplete && (
          <AnimatePresence mode="wait">
            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <motion.form
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNextStep}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">First Name *</label>
                    <input required type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Last Name *</label>
                    <input required type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+1 234 567 8900" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Address Line 1 *</label>
                  <input required type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Address Line 2</label>
                  <input type="text" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} className={inputCls} placeholder="Apt, Suite, Floor (optional)" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City *</label>
                    <input required type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State / Province</label>
                    <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Postal Code *</label>
                    <input required type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Country *</label>
                    <select required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                      <option value="SG">Singapore</option>
                      <option value="AE">UAE</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-accent text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Select Payment Method</h2>
                  <button onClick={() => setStep(1)} className="text-sm text-accent hover:underline">
                    ← Edit Shipping
                  </button>
                </div>

                {/* Priority Payment Gateway Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Gateway #1: PayPal (Priority #1) */}
                  <div
                    onClick={() => setPaymentMethod('paypal')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-500 bg-blue-500/5 shadow-md'
                        : 'border-foreground/10 hover:border-foreground/30 bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-600 text-lg tracking-tight">PayPal</span>
                        <span className="text-[10px] uppercase font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Priority #1
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted">
                      Fast, secure global checkout with PayPal balance, Credit Card, or Pay Later.
                    </p>
                  </div>

                  {/* Gateway #2: Razorpay (Cards & Local) */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                      paymentMethod === 'razorpay'
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-foreground/10 hover:border-foreground/30 bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">Credit / Debit Card / UPI</span>
                      </div>
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="w-4 h-4 text-accent cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted">
                      Powered by Razorpay. Supports Visa, Mastercard, Amex, UPI & Net Banking.
                    </p>
                  </div>
                </div>

                {/* Gateway Info Banner */}
                {paymentMethod === 'paypal' ? (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={20} className="text-blue-500" />
                      <p className="font-semibold text-blue-600 dark:text-blue-400">PayPal Express Gateway</p>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      You will complete your order securely with PayPal REST API v2. Includes full buyer protection & instant order confirmation.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['PayPal Express', 'PayPal Credit', 'Pay in 4', 'Debit / Credit Card'].map((m) => (
                        <span key={m} className="text-xs px-2.5 py-1 bg-background rounded border border-foreground/10 font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={20} className="text-green-500" />
                      <p className="font-semibold">Razorpay Secure Checkout</p>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      We accept Visa, Mastercard, Amex, Maestro, UPI, Net Banking, and Debit Cards.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Visa', 'Mastercard', 'Amex', 'UPI', 'Net Banking', 'Maestro'].map((m) => (
                        <span key={m} className="text-xs px-2.5 py-1 bg-background rounded border border-foreground/10 font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 shadow-lg disabled:opacity-60 ${
                    paymentMethod === 'paypal'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                      : 'bg-accent hover:bg-accent/90 shadow-accent/25'
                  }`}
                >
                  {loading ? <Loader2 size={22} className="animate-spin" /> : <ShieldCheck size={22} />}
                  {loading
                    ? 'Processing Order…'
                    : paymentMethod === 'paypal'
                    ? `Pay $${total.toFixed(2)} with PayPal`
                    : `Pay $${total.toFixed(2)} — Razorpay`}
                </button>

                <p className="text-xs text-center text-muted">
                  By placing your order you agree to our{' '}
                  <a href="/terms-conditions" className="hover:underline text-accent">Terms</a> and{' '}
                  <a href="/privacy-policy" className="hover:underline text-accent">Privacy Policy</a>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <RevealOnScroll delay={0.2}>
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 sticky top-28">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const p = item.product as any;
                  return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-background rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={String(p?.thumbnail_image || '/placeholder.svg')}
                        alt={String(p?.name || 'Product')}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{String(p?.name || '')}</p>
                      <p className="text-xs text-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      ${(parseFloat(String(p?.price ?? 0)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  );
                })}
              </div>

              <div className="border-t border-foreground/10 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                {shippingFee === 0 && (
                  <p className="text-xs text-green-600">Free shipping applied (order over $30)</p>
                )}
                <div className="flex justify-between pt-3 border-t border-foreground/10 font-bold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted">
                <ShieldCheck size={14} className="text-green-500 shrink-0" />
                <span>SSL encrypted · Powered by Razorpay</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
      
      <div className="mt-12 max-w-4xl mx-auto">
        <TrustBadges />
      </div>
    </div>
  );
}
