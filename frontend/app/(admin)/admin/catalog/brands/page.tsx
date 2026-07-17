'use client';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', logo_url: '' });

  const loadBrands = async () => {
    try {
      const data = await fetchApi<any[]>('/api/brands');
      setBrands(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/api/brands/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/api/brands', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', logo_url: '' });
      loadBrands();
    } catch (e) {
      console.error(e);
      alert('Error saving brand');
    }
  };

  const handleEdit = (brand: any) => {
    setFormData({ name: brand.name, slug: brand.slug, description: brand.description || '', logo_url: brand.logo_url || '' });
    setEditingId(brand.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/api/brands/${id}`, { method: 'DELETE' });
      loadBrands();
    } catch (e) {
      console.error(e);
      alert('Error deleting brand');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        {!isFormOpen && (
          <button 
            onClick={() => { setFormData({name: '', slug: '', description: '', logo_url: ''}); setEditingId(null); setIsFormOpen(true); }}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} /> Add Brand
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm">
              {editingId ? 'Save Changes' : 'Create Brand'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Brand Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 font-medium">{brand.name}</td>
                  <td className="px-6 py-4 text-gray-500">/{brand.slug}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(brand)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(brand.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No brands found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
