import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Lacianda POS',
  description: 'Mobile point of sale for Kenyan retail — M-Pesa, KRA eTIMS, thermal receipts.',
  manifest: '/manifest.json'
};

export const viewport = {
  themeColor: '#0b1220',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body style={{ minHeight: '100vh', paddingBottom: 72 }}>
        <div className="bg-glow" aria-hidden="true" />
        <Navbar />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>{children}</main>
      </body>
    </html>
  );
}
