'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';

interface TrackingData {
  id: number;
  order_id: number;
  courier_name: string | null;
  tracking_number: string | null;
  shipping_status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cj_shipment: {
    cj_tracking_id: string | null;
    carrier_name: string | null;
    tracking_url: string | null;
    cj_status: string | null;
  } | null;
}

const STATUS_STEPS = [
  { key: 'ready', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing at Warehouse', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
] as const;

function getStepIndex(status: string | null | undefined) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('deliver')) return 3;
  if (s.includes('ship') || s.includes('transit') || s.includes('in_transit')) return 2;
  if (s.includes('process') || s.includes('produc')) return 1;
  return 0;
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi<TrackingData>(`/api/order/${id}/tracking`)
      .then(setTracking)
      .catch((e) => setError(e.message || 'Failed to load tracking'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const currentStep = getStepIndex(
    tracking?.cj_shipment?.cj_status || tracking?.shipping_status,
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <RevealOnScroll>
        <Link
          href={`/account/orders/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Order
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-1">Track Your Package</h1>
        <p className="text-muted text-sm mb-8">Order #{id}</p>
      </RevealOnScroll>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!tracking && !error && (
        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-8 text-center text-muted">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Shipment not yet dispatched</p>
          <p className="text-sm">Your order is being prepared. Tracking info will appear here once shipped.</p>
        </div>
      )}

      {tracking && (
        <RevealOnScroll>
          {/* Progress Steps */}
          <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-6">Delivery Progress</h2>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-foreground/10">
                <div
                  className="h-full bg-accent transition-all duration-700"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-4 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isComplete = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isComplete
                            ? 'bg-accent border-accent text-white'
                            : 'bg-background border-foreground/20 text-muted'
                        } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs text-center leading-tight font-medium ${isComplete ? 'text-foreground' : 'text-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tracking Details */}
          <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Shipment Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Carrier</p>
                <p className="font-medium">
                  {tracking.cj_shipment?.carrier_name || tracking.courier_name || 'CJPacket'}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Tracking Number</p>
                <p className="font-mono font-medium text-xs break-all">
                  {tracking.cj_shipment?.cj_tracking_id || tracking.tracking_number || '—'}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                  currentStep >= 3
                    ? 'bg-green-500/10 text-green-600'
                    : currentStep >= 2
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {tracking.cj_shipment?.cj_status || tracking.shipping_status || 'Processing'}
                </span>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Shipped At</p>
                <p className="font-medium">
                  {tracking.shipped_at
                    ? new Date(tracking.shipped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>

            {tracking.cj_shipment?.tracking_url && (
              <a
                href={tracking.cj_shipment.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <ExternalLink size={15} />
                Track Live on Carrier Site
              </a>
            )}
          </div>

          {/* Estimated delivery note */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-sm flex items-start gap-3">
            <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">Estimated Delivery</p>
              <p className="text-muted mt-0.5">
                Standard delivery takes 10–15 days worldwide — as fast as possible for our beloved customers.
                Express options may be available at checkout. Email contact@atozgadgetz.com for any delivery queries.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}
