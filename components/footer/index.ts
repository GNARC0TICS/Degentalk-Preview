// Main footer component
export { SiteFooter } from './SiteFooter';

// Atomic components
export { LiveStats } from './LiveStats';
export { FooterBrand } from './FooterBrand';
export { FooterSection } from './FooterSection';
export { RandomTagline } from './RandomTagline';
export { AnimatedStatCard } from './AnimatedStatCard';

// Configuration (re-export for convenience)
export {
	footerNavigation,
	getNavigationSection,
	getResourcesSection,
	getCommunitySection,
	getLegalSection
} from '@/config/footer-navigation';
export type { FooterNavigationSection, FooterLink } from '@/config/footer-navigation';
