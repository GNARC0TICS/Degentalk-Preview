import { useEffect } from 'react';
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
	// Users2, // For deprecated user-groups
	Megaphone,
	CloudRain,
	Clock,
	Sparkles,
	Trophy,
	BarChart3,
	BadgeIcon,
	Globe
} from 'lucide-react';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { AdminSidebarProvider, useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { useMediaQuery } from '@/hooks/use-media-query'; // Assuming this hook exists or will be created
import { Sheet, SheetContent } from '@/components/ui/sheet';
// import { Button } from '@/components/ui/button'; // Not used directly here anymore for toggle
// import { Badge } from '@/components/ui/badge'; // Not used
// import { AdminRoutePermission, adminRouteGroups, moderatorRouteGroups, ROUTES } from '@/config/admin-routes'; // Not used

interface AdminLayoutProps {
	children: ReactNode;
}

// This could be moved to a config file if it grows larger
const adminLinks = [
	{ href: '/admin', label: 'Dashboard', icon: <HomeIcon className="h-4 w-4" /> },
	{ href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
	{ href: '/admin/threads', label: 'Threads', icon: <MessageSquare className="h-4 w-4" /> },
	{ href: '/admin/categories', label: 'Categories', icon: <FolderIcon className="h-4 w-4" /> },
	{ href: '/admin/prefixes', label: 'Prefixes', icon: <TagIcon className="h-4 w-4" /> },
	{ href: '/admin/treasury', label: 'Treasury', icon: <CoinsIcon className="h-4 w-4" /> },
	{ href: '/admin/xp/adjust', label: 'Adjust User XP', icon: <Sparkles className="h-4 w-4" /> },
	{ href: '/admin/xp/settings', label: 'XP Settings', icon: <Settings className="h-4 w-4" /> },
	{ href: '/admin/xp/levels', label: 'User Levels', icon: <BarChart3 className="h-4 w-4" /> },
	{ href: '/admin/xp/badges', label: 'Badges', icon: <Trophy className="h-4 w-4" /> },
	{ href: '/admin/xp/titles', label: 'Titles', icon: <BadgeIcon className="h-4 w-4" /> },
	{ href: '/admin/dgt-packages', label: 'DGT Packages', icon: <Package className="h-4 w-4" /> },
	{ href: '/admin/emojis', label: 'Emojis', icon: <Smile className="h-4 w-4" /> },
	{ href: '/admin/config/tags', label: 'Tag Config', icon: <TagIcon className="h-4 w-4" /> },
	{ href: '/admin/config/xp', label: 'XP Config', icon: <Trophy className="h-4 w-4" /> },
	{ href: '/admin/config/zones', label: 'Forum Zones', icon: <Globe className="h-4 w-4" /> },
	{ href: '/admin/platform-settings', label: 'Platform Settings', icon: <Settings className="h-4 w-4" /> },
	{ href: '/admin/reports', label: 'Reports', icon: <Flag className="h-4 w-4" /> },
	// { href: '/admin/user-groups', label: 'User Groups', icon: <Users2 className="h-4 w-4" /> }, // Deprecated
	{ href: '/admin/announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
	{ href: '/admin/tip-rain-settings', label: 'Tip & Rain', icon: <CloudRain className="h-4 w-4" /> },
	{ href: '/admin/cooldowns', label: 'Cooldowns', icon: <Clock className="h-4 w-4" /> }
];


function AdminLayoutContent({ children }: AdminLayoutProps) {
	const { toggleSidebar, openMobileDrawer, isMobileDrawerOpen, closeMobileDrawer, isCollapsed, setIsCollapsed } = useAdminSidebar();
	const isSmallScreen = useMediaQuery('(max-width: 640px)'); // sm breakpoint
  const isMediumScreen = useMediaQuery('(max-width: 768px)'); // md breakpoint

  // Effect to handle automatic collapsing on medium screens
  useEffect(() => {
    if (isMediumScreen && !isSmallScreen) { // Only on medium screens, not small (where drawer is used)
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

					<Link href="/" className="flex items-center text-sm text-admin-text-secondary hover:text-admin-text-primary">
						<ExternalLink className="h-4 w-4 mr-1" />
						<span className="hidden md:inline">View Site</span>
					</Link>
				</div>
			</header>

			{/* Main layout with sidebar and content */}
			<div className="flex flex-1 overflow-hidden">
				{isSmallScreen ? (
          <Sheet open={isMobileDrawerOpen} onOpenChange={(open) => open ? openMobileDrawer() : closeMobileDrawer()}>
            <SheetContent side="left" className="p-0 w-64 bg-admin-surface border-r-admin-border-subtle">
              <AdminSidebar links={adminLinks} collapsed={false} onLinkClick={closeMobileDrawer} />
            </SheetContent>
          </Sheet>
				) : (
          <AdminSidebar links={adminLinks} collapsed={isCollapsed} />
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
  )
}
