import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { fetchApi } from '@/lib/api-client';

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let activeCategorySlugs: string[] = [];
  try {
    const data = await fetchApi<any[]>('/categories?hasProducts=true');
    if (Array.isArray(data)) {
      activeCategorySlugs = data.map(c => c.slug);
    } else if (data && (data as any).data && Array.isArray((data as any).data)) {
      activeCategorySlugs = (data as any).data.map((c: any) => c.slug);
    }
  } catch (err) {
    console.error('Failed to fetch categories for Header', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeCategorySlugs={activeCategorySlugs} />
      <main className="flex-grow pt-40 md:pt-52">
        {children}
      </main>
      <Footer />
    </div>
  );
}
