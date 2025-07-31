import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { BannerCarousel } from '@/components/landing/BannerCarousel';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function HomePage() {
	return (
		<ErrorBoundary level="component">
			<HeroSection />
			<AnnouncementTicker />
			<BannerCarousel />
		</ErrorBoundary>
	);
}

export default HomePage;