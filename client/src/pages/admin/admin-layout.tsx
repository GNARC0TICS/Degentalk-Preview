import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import {
	Search,
	ExternalLink,
	Bell,
	Menu,
	HomeIcon,
	Users,
	MessageSquare,
	FolderIcon,
	TagIcon,
	CoinsIcon,
	Package,
	Smile,
	Settings,
	Flag,
	Megaphone,
	CloudRain,
	Clock,
	Sparkles,
	Trophy,
	BarChart3,
	BadgeIcon,
	Globe,
	Database,
	Film,
	Gift,
	TrendingUp,
	Shield,
	Zap,
	Star,
	UserCog,
	Crown
} from 'lucide-react';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { AdminSidebarProvider, useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { useMediaQuery } from '@/hooks/use-media-query'; // Assuming this hook exists or will be created
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAdminNavigation } from '@/hooks/use-admin-modules';
// import { Button } from '@/components/ui/button'; // Not used directly here anymore for toggle
// import { Badge } from '@/components/ui/badge'; // Not used
// import { AdminRoutePermission, adminRouteGroups, moderatorRouteGroups, ROUTES } from '@/config/admin-routes'; // Not used

// New: economy overrides flag
import { useEconomyConfig } from '@/features/admin/services/economyConfigService';

interface AdminLayoutProps {
	children: ReactNode;
}

// Organized Admin Navigation - Core Config Pages (MUST SHIP)
const BASE_ADMIN_LINKS = [
	{ href: '/admin', label: 'Dashboard', icon: <HomeIcon className="h-4 w-4" /> },

	// Core Config (Primary Priority)
	{
		href: '#',
		label: 'Core Config',
		icon: <Settings className="h-4 w-4" />,
		submenu: [
			{ href: '/admin/forum-structure', label: 'Forum Structure' },
			{ href: '/admin/config/tags', label: 'Tags & Prefixes' },
			{ href: '/admin/users', label: 'Users' },
			{ href: '/admin/roles-titles', label: 'Roles & Titles' },
			{ href: '/admin/xp-system', label: 'XP System' },
			{ href: '/admin/clout', label: 'Clout System' }
		]
	},

	// Economy (Secondary Priority)
	{
		href: '#',
		label: 'Economy',
		icon: <CoinsIcon className="h-4 w-4" />,
		submenu: [
			{ href: '/admin/config/economy', label: 'Economy Config' },
			{ href: '/admin/treasury', label: 'Treasury' },
			{ href: '/admin/dgt-packages', label: 'DGT Packages' },
			{ href: '/admin/xp/adjust', label: 'XP Adjustments' },
			{ href: '/admin/clout/grants', label: 'Clout Grants' }
		]
	},

	// Shop & Items (Secondary Priority)
	{
		href: '#',
		label: 'Shop',
		icon: <Package className="h-4 w-4" />,
		submenu: [
			{ href: '/admin/emojis', label: 'Emojis' },
			{ href: '/admin/avatar-frames', label: 'Avatar Frames' },
			{ href: '/admin/ui/animations', label: 'Animation Packs' }
		]
	},

	// Social Features (Secondary Priority)
	{
		href: '#',
		label: 'Social',
		icon: <Users className="h-4 w-4" />,
		submenu: [{ href: '/admin/social-config', label: 'Social Configuration' }]
	},

	// Analytics (Secondary Priority)
	{
		href: '#',
		label: 'Analytics',
		icon: <BarChart3 className="h-4 w-4" />,
		submenu: [
			{ href: '/admin/stats', label: 'Platform Stats' },
			{ href: '/admin/system-analytics', label: 'System Analytics' }
		]
	},

	// Moderation (Secondary Priority)
	{
		href: '#',
		label: 'Moderation',
		icon: <Shield className="h-4 w-4" />,
		submenu: [
			{ href: '/admin/reports', label: 'Reports' },
			{ href: '/admin/announcements', label: 'Announcements' }
		]
	}
];

// Development Tools (Dev Mode Only)
if (import.meta.env.MODE === 'development') {
	BASE_ADMIN_LINKS.push({
		href: '#',
		label: 'Dev Tools',
		icon: <Database className="h-4 w-4" />,
		submenu: [{ href: '/admin/dev/seeding', label: 'Database Seeding' }]
	});
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
	const {
		toggleSidebar,
		openMobileDrawer,
		isMobileDrawerOpen,
		closeMobileDrawer,
		isCollapsed,
		setIsCollapsed
	} = useAdminSidebar();
	const isSmallScreen = useMediaQuery('(max-width: 640px)'); // sm breakpoint
	const isMediumScreen = useMediaQuery('(max-width: 768px)'); // md breakpoint

	// Get dynamic navigation from modular system
	const { navigationItems, isLoading: isLoadingNavigation } = useAdminNavigation();

	// Fetch economy override flag
	const { data: economyData } = useEconomyConfig();

	// Transform modular navigation to sidebar format
	const sidebarLinks = useMemo(() => {
		if (isLoadingNavigation) {
			return BASE_ADMIN_LINKS; // Fallback to static links while loading
		}

		const dynamicLinks = navigationItems.map((module) => {
			// Map lucide icon names to actual icon components
			const iconMap: Record<string, React.ReactNode> = {
				LayoutDashboard: <HomeIcon className="h-4 w-4" />,
				Users: <Users className="h-4 w-4" />,
				TrendingUp: <TrendingUp className="h-4 w-4" />,
				Wallet: <CoinsIcon className="h-4 w-4" />,
				ShoppingBag: <Package className="h-4 w-4" />,
				MessageSquare: <MessageSquare className="h-4 w-4" />,
				Flag: <Flag className="h-4 w-4" />,
				BarChart3: <BarChart3 className="h-4 w-4" />,
				Sparkles: <Sparkles className="h-4 w-4" />,
				Settings: <Settings className="h-4 w-4" />,
				Shield: <Shield className="h-4 w-4" />,
				Landmark: <CoinsIcon className="h-4 w-4" />,
				Package: <Package className="h-4 w-4" />,
				Activity: <BarChart3 className="h-4 w-4" />,
				Smile: <Smile className="h-4 w-4" />,
				Sticker: <Star className="h-4 w-4" />,
				Zap: <Zap className="h-4 w-4" />,
				ToggleLeft: <Settings className="h-4 w-4" />,
				Megaphone: <Megaphone className="h-4 w-4" />
			};

			const icon = iconMap[module.icon] || <Settings className="h-4 w-4" />;

			// Check for economy overrides
			let label = module.name;
			if (module.route === '/admin/config/economy' && economyData?.hasOverrides) {
				label = label + ' •';
			}

			return {
				href: module.route,
				label,
				icon,
				submenu: module.subModules?.map((subModule) => ({
					href: subModule.route,
					label: subModule.name
				}))
			};
		});

		// Add dev tools in development mode
		if (import.meta.env.MODE === 'development') {
			dynamicLinks.push({
				href: '#',
				label: 'Dev Tools',
				icon: <Database className="h-4 w-4" />,
				submenu: [{ href: '/admin/dev/seeding', label: 'Database Seeding' }]
			});
		}

		return dynamicLinks;
	}, [navigationItems, isLoadingNavigation, economyData]);

	// Effect to handle automatic collapsing on medium screens
	useEffect(() => {
		if (isMediumScreen && !isSmallScreen) {
			// Only on medium screens, not small (where drawer is used)
			setIsCollapsed(true);
		} else if (!isMediumScreen && !isSmallScreen) {
			// Optionally, uncollapse on larger screens if it was auto-collapsed
			// setIsCollapsed(false); // Or maintain user preference
		}
	}, [isMediumScreen, isSmallScreen, setIsCollapsed]);

	// Mocked admin permissions - in a real app, these would come from auth context
	// const userPermissions = useMemo<AdminRoutePermission[]>(() => Object.values(AdminRoutePermission), []);

	const handleMenuClick = () => {
		if (isSmallScreen) {
			openMobileDrawer();
		} else {
			toggleSidebar();
		}
	};

	return (
		<div className="h-screen flex flex-col bg-admin-bg-page text-admin-text-primary overflow-hidden">
			{/* Admin top navbar */}
			<header className="border-b border-admin-border-subtle bg-admin-surface px-4 h-14 flex items-center justify-between flex-shrink-0">
				<div className="flex items-center gap-2">
					<button
						onClick={handleMenuClick}
						className="p-2 hover:bg-admin-bg-surface-hover rounded-md"
						aria-label="Toggle sidebar"
					>
						<Menu className="h-5 w-5" />
					</button>
					<Link href="/admin" className="font-bold text-lg text-admin-text-primary">
						DegenTalk Admin
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<div className="relative hidden md:flex items-center text-admin-text-secondary focus-within:text-admin-text-primary">
						<Search className="absolute left-2.5 h-4 w-4" />
						<input
							type="search"
							placeholder="Search..."
							className="h-9 rounded-md border border-admin-input-border bg-admin-input-bg pl-8 pr-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-admin-input-focus-border"
						/>
					</div>

					<button className="relative" aria-label="Notifications">
						<Bell className="h-5 w-5" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center">
							3
						</span>
					</button>

					<Link
						href="/"
						className="flex items-center text-sm text-admin-text-secondary hover:text-admin-text-primary"
					>
						<ExternalLink className="h-4 w-4 mr-1" />
						<span className="hidden md:inline">View Site</span>
					</Link>
				</div>
			</header>

			{/* Main layout with sidebar and content */}
			<div className="flex flex-1 overflow-hidden">
				{isSmallScreen ? (
					<Sheet
						open={isMobileDrawerOpen}
						onOpenChange={(open) => (open ? openMobileDrawer() : closeMobileDrawer())}
					>
						<SheetContent
							side="left"
							className="p-0 w-64 bg-admin-surface border-r-admin-border-subtle"
						>
							<AdminSidebar
								links={sidebarLinks}
								collapsed={false}
								onLinkClick={closeMobileDrawer}
							/>
						</SheetContent>
					</Sheet>
				) : (
					<AdminSidebar links={sidebarLinks} collapsed={isCollapsed} />
				)}

				<main className="flex-1 overflow-auto bg-gradient-to-b from-admin-bg-surface to-admin-bg-page">
					{children}
				</main>
			</div>
		</div>
	);
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<AdminSidebarProvider>
			<AdminLayoutContent>{children}</AdminLayoutContent>
		</AdminSidebarProvider>
	);
}
