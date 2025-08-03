// This is a wrapper that imports the existing Home component
// No modifications to the original component are needed
export const dynamic = 'force-dynamic';
import Home from '@/components/pages/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Degentalk - The future of Crypto Forums | Satirical Trading Community',
  description: 'Join Degentalk, the most addictive and unhinged cryptocurrency forum where strategy meets community. Experience satirical crypto trading, contrarian bets, and connect with degens worldwide.',
  keywords: 'degentalk, crypto forum, cryptocurrency community, bitcoin forum, ethereum community, defi platform, crypto trading, satirical trading, contrarian bets, crypto degens',
  openGraph: {
    title: 'Degentalk - The future of Crypto Forums | Satirical Trading Community',
    description: 'The most addictive crypto trading community. Join degens worldwide in satirical casino-floor style cryptocurrency discussions.',
    siteName: 'Degentalk™',
    type: 'website',
    url: 'https://degentalk.net',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Degentalk - The future of Crypto Forums',
    description: 'Join the most addictive and unhinged cryptocurrency trading community.',
  },
  alternates: {
    canonical: 'https://degentalk.net',
  },
};

export default Home;