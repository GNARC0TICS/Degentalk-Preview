import { ReactNode, useMemo, useState } from 'react';
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
	Users2,
	Megaphone,
	CloudRain,
	Clock,
	Sparkles,
	Trophy,
	BarChart3,
	BadgeIcon
} from 'lucide-react';
import AdminSidebar from '@/components/admin/admin-sidebar';
import {
	AdminRoutePermission,
	adminRouteGroups,
	moderatorRouteGroups,
	ROUTES
} from '@/config/admin-routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
	children: ReactNode;
}

const adminLinks = [
	{ href: '/admin', label: 'Dashboard', icon: <HomeIcon className="h-4 w-4 mr-2" /> },
	{ href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4 mr-2" /> },
	{ href: '/admin/threads', label: 'Threads', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
	{ href: '/admin/categories', label: 'Categories', icon: <FolderIcon className="h-4 w-4 mr-2" /> },
	{ href: '/admin/prefixes', label: 'Prefixes', icon: <TagIcon className="h-4 w-4 mr-2" /> },
	{ href: '/admin/treasury', label: 'Treasury', icon: <CoinsIcon className="h-4 w-4 mr-2" /> },
	{
		href: '/admin/xp/adjust',
		label: 'Adjust User XP',
		icon: <Sparkles className="h-4 w-4 mr-2" />
	},
	{ href: '/admin/xp/settings', label: 'XP Settings', icon: <Settings className="h-4 w-4 mr-2" /> }, // Changed icon for consistency
	{ href: '/admin/xp/levels', label: 'User Levels', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
	{ href: '/admin/xp/badges', label: 'Badges', icon: <Trophy className="h-4 w-4 mr-2" /> },
	{ href: '/admin/xp/titles', label: 'Titles', icon: <BadgeIcon className="h-4 w-4 mr-2" /> }, // Added Titles link
	{
		href: '/admin/dgt-packages',
		label: 'DGT Packages',
		icon: <Package className="h-4 w-4 mr-2" />
	},
	{ href: '/admin/emojis', label: 'Emojis', icon: <Smile className="h-4 w-4 mr-2" /> },
	{
		href: '/admin/platform-settings',
		label: 'Platform Settings',
		icon: <Settings className="h-4 w-4 mr-2" />
	},
	{ href: '/admin/reports', label: 'Reports', icon: <Flag className="h-4 w-4 mr-2" /> },
	{ href: '/admin/user-groups', label: 'User Groups', icon: <Users2 className="h-4 w-4 mr-2" /> },
	{
		href: '/admin/announcements',
		label: 'Announcements',
		icon: <Megaphone className="h-4 w-4 mr-2" />
	},
	{
		href: '/admin/tip-rain-settings',
		label: 'Tip & Rain',
		icon: <CloudRain className="h-4 w-4 mr-2" />
	},
	{ href: '/admin/cooldowns', label: 'Cooldowns', icon: <Clock className="h-4 w-4 mr-2" /> }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	// Mocked admin permissions - in a real app, these would come from auth context
	const userPermissions = useMemo<AdminRoutePermission[]>(
		() => Object.values(AdminRoutePermission),
		[]
	);

	return (
		<div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
			{/* Admin top navbar */}
			<header className="border-b border-zinc-800 bg-black/30 px-4 h-14 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<button
						onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
						className="p-2 hover:bg-zinc-800 rounded-md"
					>
						<Menu className="h-5 w-5" />
					</button>
					<Link href="/admin" className="font-bold text-lg">
						DegenTalk Admin
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<div className="relative hidden md:flex items-center text-muted-foreground focus-within:text-foreground">
						<Search className="absolute left-2.5 h-4 w-4" />
						<input
							type="search"
							placeholder="Search..."
							className="h-9 rounded-md border border-zinc-800 bg-zinc-950 pl-8 pr-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700"
						/>
					</div>

					<button className="relative">
						<Bell className="h-5 w-5" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center">
							3
						</span>
					</button>

					<Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-white">
						<ExternalLink className="h-4 w-4 mr-1" />
						<span className="hidden md:inline">View Site</span>
					</Link>
				</div>
			</header>

			{/* Main layout with sidebar and content */}
			<div className="flex flex-1 overflow-hidden">
				<AdminSidebar links={adminLinks} collapsed={sidebarCollapsed} />

				<main className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-zinc-950">
					{children}
				</main>
			</div>
		</div>
	);
}
