import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.vercel.app'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | TiketSepur',
  description: 'Pelajari bagaimana TiketSepur menggunakan dan melindungi data pribadi Anda. Kebijakan privasi lengkap dan transparan.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Kebijakan Privasi - TiketSepur',
    description: 'Informasi lengkap tentang bagaimana kami melindungi privasi Anda.',
    url: `${baseUrl}/privacy`,
    type: 'website',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
