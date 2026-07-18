import { MetadataRoute } from 'next';

const DOMAIN = 'https://atozgadgetz.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/products',
    '/about-us',
    '/contact',
    '/shipping-payment-policy-2',
    '/return-and-refund-policy',
    '/privacy-policy',
    '/terms-conditions',
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${DOMAIN}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
