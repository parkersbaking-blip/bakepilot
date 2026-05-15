import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import PasswordGate from '@/components/PasswordGate'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#1C1410',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'BakePilot — Van recept naar winst',
  description: 'Professionele bakkerij calculator voor thuisbakkers en kleine bakkerijen. Bereken kostprijs, verkoopprijs, BTW en winstmarge.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BakePilot',
    startupImage: '/apple-touch-icon.png',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: 'bakkerij calculator, kostprijs berekenen, verkoopprijs bakkerij, recepten schalen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={inter.variable}>
      <head>
        {/* PWA - iOS Safari specifiek */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BakePilot" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Splash screen kleur voor iOS */}
        <meta name="msapplication-TileColor" content="#1C1410" />
      </head>
      <body className="bg-cream min-h-screen">
        <PasswordGate>
          <main className="max-w-lg mx-auto pb-20 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </PasswordGate>
      </body>
    </html>
  )
}
