'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { EmailSignup } from '@/components/sections/email-signup';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

// Code-split heavy components that are below the fold
const BannerCarousel = dynamic(
  () => import('@/components/landing/BannerCarousel').then(mod => ({ default: mod.BannerCarousel })),
  { 
    ssr: true,
    loading: () => <div className="h-96 bg-zinc-900 animate-pulse" />
  }
);

const StrategyMeetsCommunity = dynamic(
  () => import('@/components/sections/strategy-meets-community').then(mod => ({ default: mod.StrategyMeetsCommunity })),
  { ssr: true }
);

const FAQ = dynamic(
  () => import('@/components/sections/faq').then(mod => ({ default: mod.FAQ })),
  { ssr: true }
);

function HomePage() {
	return (
		<ErrorBoundary level="component">
			<HeroSection />
			<AnnouncementTicker />
			<StrategyMeetsCommunity />
			<BannerCarousel />
			<EmailSignup />
			<FAQ />
		</ErrorBoundary>
	);
}

export default HomePage;