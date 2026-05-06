import { MetadataRoute } from 'next'
import db from '@/lib/db'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let ticketRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'hourly'; priority: number }> = []

  try {
    const ticketsData = await db.ticket.findMany({
      where: { status: 'available' },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit to 1000 URLs per sitemap
    })

    ticketRoutes = ticketsData.map(ticket => ({
      url: `${baseUrl}/ticket/${ticket.id}`,
      lastModified: ticket.createdAt,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    // Gracefully handle DB connection issues during build
    console.warn('Sitemap: Could not fetch tickets from database', err)
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticRoutes, ...ticketRoutes]
}
