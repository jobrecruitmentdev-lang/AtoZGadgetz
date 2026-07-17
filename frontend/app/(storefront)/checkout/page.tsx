'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

import { useCart } from '@/components/storefront/CartContext';
import { fetchApi } from '@/lib/api-client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const items = cart?.items || [];
  // product is Record<string,unknown> — cast to any for safe property access
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(String((item.product as any)?.price ?? 0)) * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 30 ? 0 : 5.99;
  const total = subtotal + shippingFee;

  useEffect(() => {
    // Load Razorpay script
    const existing = document.getElementById('razorpay-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep(2);
  };

  const handleRazorpayPayment = async (orderId: number) => {
    // 1. Create Razorpay order on backend
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
            // 2. Verify signature on backend — this also places the CJ order
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
      const order = await fetchApi<{ id: number }>('/orders/place', {
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
        }),
      });

      // 2. Open Razorpay
      await handleRazorpayPayment(order.id);

      // 3. Payment verified — clear cart and redirect
      await refreshCart();
      router.push('/order-success');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <RevealOnScroll>
        <h1 className="text-3xl font-bold tracking-tighter mb-10">Checkout</h1>
      </RevealOnScroll>

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
                  <h2 className="text-xl font-bold">Secure Payment</h2>
                  <button onClick={() => setStep(1)} className="text-sm text-accent hover:underline">
                    ← Edit Shipping
                  </button>
                </div>

                {/* Razorpay info */}
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={20} className="text-green-500" />
                    <p className="font-semibold">Razorpay Secure Checkout</p>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    After clicking Pay, you'll be securely redirected to Razorpay. We accept
                    Visa, Mastercard, Amex, Maestro, UPI, Net Banking, and Debit Cards.
                    Your card details are never stored on our servers.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['Visa', 'Mastercard', 'Amex', 'UPI', 'Net Banking', 'Maestro'].map((m) => (
                      <span key={m} className="text-xs px-2.5 py-1 bg-background rounded border border-foreground/10 font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  className="w-full flex items-center justify-center gap-3 bg-accent text-white py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all duration-300 shadow-lg shadow-accent/25 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={22} className="animate-spin" /> : <ShieldCheck size={22} />}
                  {loading ? 'Processing…' : `Pay $${total.toFixed(2)} — Razorpay`}
                </button>

                <p className="text-xs text-center text-muted">
                  By placing your order you agree to our{' '}
                  <a href="/terms-conditions" className="hover:underline text-accent">Terms</a> and{' '}
                  <a href="/privacy-policy" className="hover:underline text-accent">Privacy Policy</a>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
    </div>
  );
}
