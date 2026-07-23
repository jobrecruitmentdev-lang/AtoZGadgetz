'use client';
import { Plus, Search, Edit, Trash, X, Download, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api-client';

function formatDisplayTitle(name: string): string {
  if (!name) return 'Product';
  let cleaned = name.trim();
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleaned = parsed[parsed.length - 1] || parsed[0] || 'Product';
      }
    } catch {
      cleaned = cleaned.replace(/^\["|"\]$/g, '').replace(/","/g, ' ');
    }
  }

  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    if (cleaned.includes('充电宝') || cleaned.includes('Power bank')) return 'AtoZ Portable Power Bank';
    if (cleaned.includes('耳机') || cleaned.includes('Earbuds')) return 'AtoZ Wireless Bluetooth Earbuds';
    if (cleaned.includes('鼠标') || cleaned.includes('Mouse')) return 'AtoZ RGB Gaming Mouse';
    if (cleaned.includes('小夜灯') || cleaned.includes('Light')) return 'AtoZ Smart LED Night Light';
    return 'AtoZ Smart Gadget';
  }

  return cleaned;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: 0,
    subcategory_id: 0,
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
        subcategory_id: Number(formData.subcategory_id),
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
      setFormData({ name: '', slug: '', description: '', price: 0, stock_quantity: 0, category_id: 0, subcategory_id: 0, brand_id: 0 });
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
      stock_quantity: prod.stock_quantity || 0,
      category_id: prod.category_id || 0,
      subcategory_id: prod.subcategory_id || 0,
      brand_id: prod.brand_id || 0
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

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-sm text-muted">Manage your local products or import trending items from CJDropshipping.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Import Products Button */}
          <Link
            href="/admin/catalog/import"
            className="bg-accent text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-accent/90 transition-all shadow-md"
          >
            <Download size={16} /> Import Products from CJ
          </Link>

          {!isFormOpen && (
            <button 
              onClick={() => { 
                setFormData({ name: '', slug: '', description: '', price: 0, stock_quantity: 0, category_id: categories[0]?.id || 0, subcategory_id: categories[0]?.subcategories?.[0]?.id || 0, brand_id: brands[0]?.id || 0 }); 
                setEditingId(null); 
                setIsFormOpen(true); 
              }}
              className="bg-foreground text-background px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-colors"
            >
              <Plus size={16} /> Manual Add Product
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-surface border border-foreground/10 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'Add Manual Product'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-foreground"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Slug</label>
                <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Price ($)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Stock Quantity</label>
                <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Category</label>
                <select required value={formData.category_id || 0} onChange={e => {
                  const newCatId = Number(e.target.value);
                  const selectedCat = categories.find(c => c.id === newCatId);
                  setFormData({
                    ...formData, 
                    category_id: newCatId,
                    subcategory_id: selectedCat?.subcategories?.[0]?.id || 0
                  });
                }} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value={0} disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Subcategory</label>
                <select required value={formData.subcategory_id || 0} onChange={e => setFormData({...formData, subcategory_id: Number(e.target.value)})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value={0} disabled>Select Subcategory</option>
                  {categories.find(c => c.id === formData.category_id)?.subcategories?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Brand</label>
                <select required value={formData.brand_id || 0} onChange={e => setFormData({...formData, brand_id: Number(e.target.value)})} className="w-full bg-background border border-foreground/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value={0} disabled>Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="bg-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-surface border border-foreground/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-foreground/10 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full bg-background border border-foreground/20 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <span className="text-xs text-muted font-medium">
            Showing {filteredProducts.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-muted">Loading product catalog...</div> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-foreground/10 text-muted font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Fulfillment</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filteredProducts.map((prod) => {
                  const displayTitle = formatDisplayTitle(prod.name);
                  const isCj = prod.fulfillment_type === 'cj';

                  return (
                    <tr key={prod.id} className="hover:bg-background/60 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-lg overflow-hidden relative flex-shrink-0 border border-foreground/10">
                          <Image src={prod.thumbnail_image || "/placeholder.svg"} alt={displayTitle} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block line-clamp-1">{displayTitle}</span>
                          <span className="text-[11px] text-muted font-mono">{prod.sku}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-accent">${parseFloat(prod.price).toFixed(2)}</td>
                      <td className="px-6 py-4 font-medium">{prod.available ?? prod.stock_quantity ?? 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isCj 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isCj && <Sparkles className="w-3 h-3 text-amber-500" />}
                          {isCj ? 'CJ Dropship' : 'Own Inventory'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(prod)} className="text-muted hover:text-foreground transition-colors p-1.5"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(prod.id)} className="text-muted hover:text-red-500 transition-colors p-1.5 ml-1"><Trash size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      No products found. Click <strong>Import Products from CJ</strong> to fetch items.
                    </td>
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
