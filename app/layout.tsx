import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue, Montserrat, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: 'College Football Fantasy App',
  description: 'Fantasy football for Power 4 conferences with elite matchups only',
  openGraph: {
    title: 'CFB Fantasy - Power 4 Conference Fantasy Football',
    description: 'Fantasy football for SEC, ACC, Big 12, and Big Ten. Elite matchups only.',
    url: 'https://cfbfantasy.app',
    siteName: 'CFB Fantasy',
    images: [
      {
        url: 'https://cfbfantasy.app/api/og/home',
        width: 1200,
        height: 630,
        alt: 'CFB Fantasy - Chrome Football',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CFB Fantasy - Power 4 Conference Fantasy Football',
    description: 'Fantasy football for SEC, ACC, Big 12, and Big Ten. Elite matchups only.',
    images: ['https://cfbfantasy.app/api/og/home'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8C1818',
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${inter.variable} ${bebasNeue.variable} ${montserrat.variable} ${robotoMono.variable} font-sans`}>
        <div className="min-h-screen flex flex-col">
          {/* Global Navbar */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          {/** Nav placed as component below */}
          <Navbar />
          <div className="flex-1">{children}</div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

