import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketsepur.com'

export const metadata: Metadata = {
  title: 'Masuk | TiketSepur',
  description: 'Masuk ke akun TiketSepur Anda dengan email atau Google. Akses aman menggunakan Supabase Auth.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Masuk - TiketSepur',
    description: 'Masuk ke akun TiketSepur Anda untuk mulai membeli atau menjual tiket kereta.',
    url: `${baseUrl}/login`,
    type: 'website',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
