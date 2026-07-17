import { fetchApi } from '@/lib/api-client';
import { CjImportClient } from './CjImportClient';

export const dynamic = 'force-dynamic';

export default async function CjImportPage() {
  let categories: any[] = [];
  try {
    const data = await fetchApi<any[]>('/categories?include=subcategories');
    categories = data || [];
  } catch {
    // Non-fatal — form will show empty category selects
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CJ Dropshipping — Import Products</h1>
        <p className="text-muted mt-1">
          Search the CJ catalog, set your markup, and import products directly to your storefront.
          Each import creates a Product + CjProduct record and links them for auto-fulfilment.
        </p>
      </div>

      <CjImportClient categories={categories} />
    </div>
  );
}
