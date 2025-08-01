import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { BannerCarousel } from '@/components/landing/BannerCarousel';
import { StrategyMeetsCommunity } from '@/components/sections/strategy-meets-community';
import { EmailSignup } from '@/components/sections/email-signup';
import { FAQ } from '@/components/sections/faq';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

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