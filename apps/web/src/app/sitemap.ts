import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/pricing',
    '/features',
    '/blog',
    '/legal/terms',
    '/legal/privacy',
  ];

  return staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
