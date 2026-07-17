'use client';
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newAddr, setNewAddr] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  const loadAddresses = async () => {
    try {
      const data = await fetchApi<any[]>('/api/address');
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/api/address', {
        method: 'POST',
        body: JSON.stringify(newAddr)
      });
      setIsAdding(false);
      loadAddresses();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <RevealOnScroll>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Saved Addresses</h2>
          {!isAdding && (
            <MagneticButton onClick={() => setIsAdding(true)} className="bg-foreground text-background px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-accent transition-colors">
              <Plus size={16} /> Add New
            </MagneticButton>
          )}
        </div>

        {isAdding && (
          <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Add New Address</h3>
              <button onClick={() => setIsAdding(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Address Line 1" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.address_line1} onChange={e => setNewAddr({...newAddr, address_line1: e.target.value})} />
              <input placeholder="Address Line 2" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.address_line2} onChange={e => setNewAddr({...newAddr, address_line2: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="City" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                <input required placeholder="State" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Country" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.country} onChange={e => setNewAddr({...newAddr, country: e.target.value})} />
                <input required placeholder="Postal Code" className="w-full px-4 py-2 rounded-md bg-background border border-gray-200 dark:border-gray-800" value={newAddr.postal_code} onChange={e => setNewAddr({...newAddr, postal_code: e.target.value})} />
              </div>
              <MagneticButton className="bg-foreground text-background px-6 py-2 rounded-md font-medium text-sm mt-4">
                Save Address
              </MagneticButton>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.length === 0 && !isAdding && (
            <p className="text-muted">No addresses saved yet.</p>
          )}
          {addresses.map((addr, idx) => (
            <div key={addr.id} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 relative">
              <p className="font-semibold mb-1">{addr.address_line1}</p>
              <p className="text-sm text-muted leading-relaxed">
                {addr.address_line2 && <>{addr.address_line2}<br/></>}
                {addr.city}, {addr.state} {addr.postal_code}<br/>
                {addr.country}
              </p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
