import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/index.css';
import '@/styles/animations.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DegenTalk - Where Strategy Meets Community',
  description: 'The premier crypto community forum for serious traders and enthusiasts. Join discussions, share strategies, and stay ahead of the market.',
  keywords: 'crypto, trading, forum, community, bitcoin, ethereum, defi, nft',
  authors: [{ name: 'DegenTalk Team' }],
  openGraph: {
    title: 'DegenTalk - Where Strategy Meets Community',
    description: 'The premier crypto community forum for serious traders and enthusiasts.',
    url: 'https://degentalk.com',
    siteName: 'DegenTalk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DegenTalk - Crypto Community Forum',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DegenTalk - Where Strategy Meets Community',
    description: 'The premier crypto community forum for serious traders and enthusiasts.',
    images: ['/og-image.png'],
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

import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-zinc-950 text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}