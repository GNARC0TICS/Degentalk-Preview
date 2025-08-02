export interface FooterLink {
	label: string;
	href: string;
	external?: boolean;
	comingSoon?: boolean;
}

export interface FooterNavigationSection {
	title: string;
	links: FooterLink[];
	animationDelay?: number;
}

export const footerNavigation: FooterNavigationSection[] = [
	{
		title: 'Navigation',
		animationDelay: 0,
		links: [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '#', comingSoon: true },
			{ label: 'Shop', href: '#', comingSoon: true },
			{ label: 'Degen Index', href: '#', comingSoon: true },
			{ label: 'Leaderboard', href: '#', comingSoon: true }
		]
	},
	{
		title: 'Resources',
		animationDelay: 0.2,
		links: [
			{ label: 'Degen Dictionary', href: '#', comingSoon: true },
			{ label: 'API Docs', href: '#', comingSoon: true },
			{ label: 'FAQ', href: '/faq' },
			{ label: 'Status', href: '#', comingSoon: true }
		]
	},
	{
		title: 'Community',
		animationDelay: 0.4,
		links: [
			{ label: 'Discord', href: '#', comingSoon: true },
			{ label: 'Twitter', href: '#', comingSoon: true },
			{ label: 'Telegram', href: '#', comingSoon: true },
			{ label: 'GitHub', href: '#', comingSoon: true }
		]
	},
	{
		title: 'Legal',
		animationDelay: 0.6,
		links: [
			{ label: 'Privacy Policy', href: '/legal/privacy' },
			{ label: 'Terms of Service', href: '/legal/terms' },
			{ label: 'Contact Us', href: '/contact' }
		]
	}
];

// Quick access to specific sections
export const getNavigationSection = () => footerNavigation[0];
export const getResourcesSection = () => footerNavigation[1];
export const getCommunitySection = () => footerNavigation[2];
export const getLegalSection = () => footerNavigation[3];
