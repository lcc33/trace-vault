import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/settings/',
        '/api/',
        '/profile/',
        '/claims/'
      ],
    },
    sitemap: 'https://app.tracevault.xyz/sitemap.xml',
  };
}