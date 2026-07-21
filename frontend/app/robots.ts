import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/server-proxy', '/cart', '/checkout'],
      },
      {
        userAgent: [
          'ChatGPT-User',
          'GPTBot',
          'Anthropic-ai',
          'Claude-Web',
          'Google-Extended',
          'PerplexityBot',
          'OAI-SearchBot'
        ],
        allow: '/', // Explicitly allow all major AI bots to index the store
      }
    ],
    sitemap: 'https://atozgadgetz.com/sitemap.xml',
  }
}
