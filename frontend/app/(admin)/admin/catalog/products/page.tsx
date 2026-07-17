'use client';
import { Plus, Search, Edit, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: 0,
    brand_id: 0,
  });

  const loadData = async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetchApi<any[]>('/api/products'),
        fetchApi<any[]>('/api/categories'),
        fetchApi<any[]>('/api/brands')
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setBrands(Array.isArray(brandRes) ? brandRes : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id)
      };

      if (editingId) {
        await fetchApi(`/api/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', price: 0, stock_quantity: 0, category_id: 0, brand_id: 0 });
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error saving product');
    }
  };

  const handleEdit = (prod: any) => {
    setFormData({
      name: prod.name,
      slug: prod.slug,
      description: prod.description || '',
      price: prod.price,
      stock_quantity: prod.stock_quantity,
      category_id: prod.category_id,
      brand_id: prod.brand_id
    });
    setEditingId(prod.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/api/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error deleting product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {!isFormOpen && (
          <button 
            onClick={() => { 
              setFormData({ name: '', slug: '', description: '', price: 0, stock_quantity: 0, category_id: categories[0]?.id || 0, brand_id: brands[0]?.id || 0 }); 
              setEditingId(null); 
              setIsFormOpen(true); 
            }}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value={0} disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <select required value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value={0} disabled>Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm">
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter products..." 
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                        <Image src="/placeholder.svg" alt={prod.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium">{prod.name}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">${parseFloat(prod.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{prod.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium
                        ${prod.stock_quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          prod.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                      `}>
                        {prod.stock_quantity > 10 ? 'Active' : prod.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(prod)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(prod.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"><Trash size={16} /></button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
