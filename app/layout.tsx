import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'Degentalk™ - Where Strategy Meets Community',
  description: 'The premier crypto community forum for serious traders and enthusiasts. Join discussions, share strategies, and stay ahead of the market.',
  keywords: 'crypto, trading, forum, community, bitcoin, ethereum, defi, nft',
  authors: [{ name: 'Degentalk Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '256x256' },
      { url: '/favicon-96x96.ico', sizes: '96x96', type: 'image/x-icon' },
      { url: '/favicon-72x72.ico', sizes: '72x72', type: 'image/x-icon' },
      { url: '/favicon-48x48.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-32x32.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.ico', sizes: '180x180', type: 'image/x-icon' },
      { url: '/favicon-72x72.ico', sizes: '72x72', type: 'image/x-icon' },
      { url: '/favicon-57x57.ico', sizes: '57x57', type: 'image/x-icon' },
    ],
  },
  openGraph: {
    title: 'Degentalk™ - Where Strategy Meets Community',
    description: 'The premier crypto community forum for serious traders and enthusiasts.',
    url: 'https://degentalk.net',
    siteName: 'Degentalk™',
    images: [
      {
        url: 'https://degentalk.net/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Degentalk – The future of Crypto Forums',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Degentalk™ - Where Strategy Meets Community',
    description: 'The premier crypto community forum for serious traders and enthusiasts.',
    images: ['https://degentalk.net/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';
import { SiteHeader } from '@/components/header/SiteHeader';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { WebVitals } from '@/components/WebVitals';
import { ScrollToTop } from '@/components/ScrollToTop';
import { GlobalErrorBoundary } from '@/components/errors/GlobalErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD structured data for the organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Degentalk™',
    url: 'https://degentalk.net',
    logo: 'https://degentalk.net/favicon.ico',
    description: 'Degentalk is a satirical cryptocurrency trading community platform where strategy meets community.',
    sameAs: [
      'https://twitter.com/degentalk',
      'https://discord.gg/degentalk',
      'https://github.com/degentalk'
    ],
    foundingDate: '2024',
  };

  // Website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Degentalk™',
    description: 'The future of Crypto Forums - A satirical trading community platform',
    url: 'https://degentalk.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://degentalk.net/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} ${inter.className}`}>
      <head>
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {process.env.NODE_ENV === 'production' && (
          <>
            <link rel="preconnect" href="https://vitals.vercel-analytics.com" />
            <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
          </>
        )}
        
        {/* Preload first carousel image for better LCP */}
        <link
          rel="preload"
          as="image"
          href="/banners/RainEvents.png.webp"
          type="image/webp"
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="bg-zinc-950 text-white overflow-x-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-md z-50">
          Skip to main content
        </a>
        <WebVitals />
        <GlobalErrorBoundary>
          <Providers>
            <Analytics />
            <ScrollToTop />
            <SiteHeader />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}