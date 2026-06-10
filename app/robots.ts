import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/upload', '/history', '/api/'],
    },
    sitemap: 'https://imagely.app/sitemap.xml',
  };
}
