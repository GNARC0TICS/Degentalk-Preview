import { Link } from 'react-router-dom';
import {
	Home,
	Users,
	TrendingUp,
	Star,
	MessageSquare,
	FlameIcon,
	Clock,
	PanelsTopLeft,
	LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import { useLocation } from 'react-router-dom';
import ForumTreeNav from '@/features/forum/components/ForumTreeNav';
import { ROUTES } from '@/constants/routes';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { useAuth } from '@/hooks/use-auth';
import type { CategoryId, ForumId } from '@shared/types/ids';

// Helper function to determine icon for a category
function getCategoryEmoji(name: string): string {
	const nameLower = name.toLowerCase();
	if (nameLower.includes('pit')) return '🔥';
	if (nameLower.includes('crypto')) return '📊';
	if (nameLower.includes('gambling')) return '🎲';
	if (nameLower.includes('trading') || nameLower.includes('analysis')) return '📈';
	if (nameLower.includes('defi') || nameLower.includes('yield')) return '🏦';
	if (nameLower.includes('nft') || nameLower.includes('art')) return '🖼️';
	if (nameLower.includes('layer') || nameLower.includes('chain')) return '⛓️';
	if (nameLower.includes('development') || nameLower.includes('code')) return '💻';
	if (nameLower.includes('news') || nameLower.includes('announcement')) return '📣';
	if (nameLower.includes('meme') || nameLower.includes('culture')) return '😂';
	if (nameLower.includes('irl') || nameLower.includes('off-chain')) return '🌎';
	if (nameLower.includes('general')) return '💬';
	if (nameLower.includes('brag') || nameLower.includes('bust')) return '🏆';
	if (nameLower.includes('altcoin') || nameLower.includes('token')) return '🪙';
	if (nameLower.includes('bitcoin') || nameLower.includes('ethereum')) return '₿';
	if (nameLower.includes('casino')) return '🎰';
	if (nameLower.includes('theory') || nameLower.includes('tactics')) return '🧠';
	if (nameLower.includes('tokenomics') || nameLower.includes('whitepaper')) return '📄';
	return '💬';
}

type SidebarProps = {
	activeCategoryId?: CategoryId;
	forumId?: ForumId;
};

export function Sidebar({ activeCategoryId, forumId }: SidebarProps) {
	const location = useLocation();
	const { isAuthenticated, user } = useAuth();

	const navItems = [
		{ icon: Home, label: 'Home', href: ROUTES.HOME },
		{ icon: LayoutGrid, label: 'Forum', href: ROUTES.FORUMS },
		{ icon: FlameIcon, label: 'Hot Threads', href: '/hot' },
		{ icon: Clock, label: 'Recent', href: '/recent' },
		{ icon: PanelsTopLeft, label: 'All Categories', href: ROUTES.FORUMS },
		{ icon: Star, label: 'Favorites', href: '/favorites' },
		{ icon: Users, label: 'Members', href: '/members' }
	];

	return (
		<div className="w-full space-y-6">
			{/* Profile Card - Show at top when authenticated */}
			{isAuthenticated && user && <ProfileCard username={user.username} variant="sidebar" />}

			{/* Navigation */}
			<Card className="bg-zinc-900/50 border border-zinc-800 shadow-md rounded-lg transition-all">
				<CardHeader className="bg-zinc-900 border-b border-zinc-800 py-3">
					<CardTitle className="text-sm font-semibold text-zinc-200 flex items-center">
						<MessageSquare className="w-4 h-4 mr-2 text-emerald-500" />
						Navigation
					</CardTitle>
				</CardHeader>
				<CardContent className="p-2">
					<nav className="space-y-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								to={item.href}
								className={cn(
									'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
									location.pathname === item.href
										? 'text-emerald-400 bg-emerald-900/20 border border-emerald-800/30 shadow-inner'
										: 'text-zinc-300 hover:bg-zinc-800/70 hover:text-emerald-400 focus:text-emerald-400 focus:bg-zinc-800'
								)}
							>
								<item.icon className="w-4 h-4 mr-2" />
								<span>{item.label}</span>
							</Link>
						))}
					</nav>
				</CardContent>
			</Card>

			{/* Who's Online */}
			<Card className="bg-zinc-900/50 border border-zinc-800 shadow-md rounded-lg transition-all">
				<CardHeader className="bg-zinc-900 border-b border-zinc-800 py-3">
					<CardTitle className="text-sm font-semibold text-zinc-200 flex items-center">
						<Users className="w-4 h-4 mr-2 text-emerald-500" />
						Online Members
						<Badge
							variant="outline"
							className="ml-2 bg-emerald-900/20 text-emerald-400 border-emerald-800/30"
						>
							12
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-2">
						{/* Avatar placeholders - these would be populated with real users */}
						{Array.from({ length: 5 }).map((_, i) => (
							<Avatar key={i} className="h-8 w-8 border border-zinc-700">
								<AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
									{String.fromCharCode(65 + i)}
								</AvatarFallback>
							</Avatar>
						))}
						<div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
							+7
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
