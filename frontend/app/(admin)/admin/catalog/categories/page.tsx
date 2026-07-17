'use client';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = { name: '', slug: '', description: '', cj_keyword: '', seo_title: '', seo_description: '' };
  const [formData, setFormData] = useState(emptyForm);

  const loadCategories = async () => {
    try {
      const data = await fetchApi<any[]>('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/api/categories', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      loadCategories();
    } catch (e) {
      console.error(e);
      alert('Error saving category');
    }
  };

  const handleEdit = (cat: any) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      cj_keyword: cat.cj_keyword || '',
      seo_title: cat.seo_title || '',
      seo_description: cat.seo_description || '',
    });
    setEditingId(cat.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/api/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (e) {
      console.error(e);
      alert('Error deleting category');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        {!isFormOpen && (
          <button 
            onClick={() => { setFormData(emptyForm); setEditingId(null); setIsFormOpen(true); }}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
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
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CJDropshipping search keyword</label>
              <input value={formData.cj_keyword} onChange={e => setFormData({...formData, cj_keyword: e.target.value})} placeholder="e.g. smart home device" className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO title</label>
              <input value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="e.g. Smart Home Devices — AtoZ Gadgetz" className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO description</label>
              <textarea value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium text-sm">
              {editingId ? 'Save Changes' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? <div className="p-6 text-center text-gray-500">Loading...</div> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Category Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">/{cat.slug}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{cat.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
