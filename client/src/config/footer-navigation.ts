export interface FooterLink {
	label: string;
	href: string;
	external?: boolean;
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
			{ label: 'Forums', href: '/forums' },
			{ label: 'Shop', href: '/shop' },
			{ label: 'Degen Index', href: '/degen-index' },
			{ label: 'Leaderboard', href: '/leaderboard' }
		]
	},
	{
		title: 'Resources',
		animationDelay: 0.2,
		links: [
			{ label: 'Degen Dictionary', href: '/dictionary' },
			{ label: 'API Docs', href: '/docs', external: true },
			{ label: 'FAQ', href: '/help/faq' },
			{ label: 'Status', href: 'https://status.degentalk.com', external: true }
		]
	},
	{
		title: 'Community',
		animationDelay: 0.4,
		links: [
			{ label: 'Discord', href: 'https://discord.gg/degentalk', external: true },
			{ label: 'Twitter', href: 'https://twitter.com/degentalk', external: true },
			{ label: 'Telegram', href: 'https://t.me/degentalk', external: true },
			{ label: 'GitHub', href: 'https://github.com/degentalk', external: true }
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
