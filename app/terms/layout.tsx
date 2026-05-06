import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.vercel.app'

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan | TiketSepur',
  description: 'Baca syarat dan ketentuan penggunaan layanan TiketSepur. Hak dan kewajiban pengguna, kebijakan transaksi, dan dispute resolution.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Syarat dan Ketentuan - TiketSepur',
    description: 'Panduan lengkap hak dan kewajiban pengguna di marketplace TiketSepur.',
    url: `${baseUrl}/terms`,
    type: 'website',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
