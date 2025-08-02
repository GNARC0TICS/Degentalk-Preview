import { About } from '@/components/pages/about';
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Degentalk™ - The Satirical Crypto Community',
  description: 'Learn about Degentalk, the most addictive and unhinged cryptocurrency forum. Our mission is to create a satirical casino floor for degens, traders, and contrarians.',
  keywords: 'about degentalk, crypto community, cryptocurrency forum, defi community, crypto trading platform, blockchain community',
  openGraph: {
    title: 'About Degentalk™ - The Satirical Crypto Community',
    description: 'Discover the story behind Degentalk, where strategy meets community in the world of cryptocurrency trading.',
    type: 'website',
    url: 'https://degentalk.net/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Degentalk™ - The Satirical Crypto Community',
    description: 'Learn about the most addictive crypto trading community platform.',
  },
  alternates: {
    canonical: 'https://degentalk.net/about',
  },
};

export default function AboutPage() {
  return <About />;
}