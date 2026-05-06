import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.vercel.app'

export const metadata: Metadata = {
  title: 'Jual Tiket Kereta | TiketSepur',
  description: 'Posting tiket kereta Anda di marketplace TiketSepur. Mudah, cepat, dan aman. Jukkan foto tiket, harga, dan nomor WA untuk dihubungi pembeli.',
  keywords: ['jual tiket', 'posting tiket', 'jual tiket kereta online'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Jual Tiket Kereta - TiketSepur',
    description: 'Posting dan jual tiket kereta Anda dengan mudah di platform TiketSepur.',
    url: `${baseUrl}/upload`,
    type: 'website',
  },
}

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
