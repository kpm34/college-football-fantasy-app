import '@/styles/animations.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import LenisProvider from './providers/LenisProvider'
import { getFlag } from '@/lib/edgeConfig'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = { title: 'App', description: '…' }

// Run at the edge for ultra-low latency reads
export const runtime = 'edge'

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const enableWebGL = (await getFlag('enableWebGL')) ?? false
  return (
    <html lang="en">
      <body
        data-webgl={enableWebGL ? 'on' : 'off'}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
