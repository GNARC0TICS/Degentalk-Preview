import React from 'react';
import { useLocation } from 'react-router-dom';
import {
	Home,
	MessageSquare,
	Users,
	ShoppingBag,
	BarChart2,
	Wallet,
	Target,
	Trophy
} from 'lucide-react';
import { NavItem } from './nav-item';
import type { NavItemProps } from './nav-item';
import { cn } from '@app/utils/utils';
import { useAuth } from '@app/hooks/use-auth';

export interface MobileNavBarProps {
	/** Custom navigation items (optional - will use defaults if not provided) */
	items?: NavItemProps[];
	/** Optional class name for additional styling */
	className?: string;
}

export function MobileNavBar({ items, className }: MobileNavBarProps) {
	const location = useLocation();
	const { isAuthenticated, user } = useAuth();

	// Default navigation items if none provided
	const defaultItems: NavItemProps[] = [
		{
			icon: <Home className="h-5 w-5" />,
			label: 'Home',
			href: '/',
			isActive: location.pathname === '/'
		},
		{
			icon: <MessageSquare className="h-5 w-5" />,
			label: 'Forum',
			href: '/forums',
			isActive:
				location.pathname.startsWith('/forums') ||
				location.pathname.startsWith('/threads') ||
				location.pathname.startsWith('/tags')
		},
		{
			icon: <ShoppingBag className="h-5 w-5" />,
			label: 'Shop',
			href: '/shop',
			isActive: location.pathname.startsWith('/shop')
		},
		{
			icon: <BarChart2 className="h-5 w-5" />,
			label: 'About',
			href: '/about',
			isActive: location.pathname.startsWith('/about')
		},
		{
			icon: <Trophy className="h-5 w-5" />,
			label: 'Progress',
			href: '/progress',
			isActive: location.pathname.startsWith('/progress')
		}
	];

	if (isAuthenticated) {
		defaultItems.push(
			{
				icon: <Wallet className="h-5 w-5" />,
				label: 'Wallet',
				href: '/wallet',
				isActive: location.pathname.startsWith('/wallet')
			},
			{
				icon: <Users className="h-5 w-5" />,
				label: 'Profile',
				href: user ? `/profile/${user.username}` : '/login?redirect=/profile',
				isActive: location.pathname.startsWith('/profile')
			}
		);
	}

	const navItems = items || defaultItems;

	return (
		<div
			className={cn(
				'fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 md:hidden',
				className
			)}
		>
			<div className="flex items-center justify-around px-1 py-1">
				{navItems.map((item, index) => (
					<div key={index} className="flex-1 flex justify-center py-1">
						<NavItem
							icon={item.icon}
							label={item.label}
							href={item.href}
							isActive={item.isActive ?? false}
							{...(item.badge && { badge: item.badge })}
							variant="ghost"
							size="sm"
							isMobile={true}
							{...(item.onClick && { onClick: item.onClick })}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
