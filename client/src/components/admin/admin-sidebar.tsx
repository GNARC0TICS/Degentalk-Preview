/**
 * Admin Sidebar Component
 *
 * An improved sidebar with better mobile responsiveness
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
	links: {
		href: string;
		label: string;
		icon: React.ReactNode;
		submenu?: {
			href: string;
			label: string;
		}[];
	}[];
	collapsed: boolean;
}

export default function AdminSidebar({ links, collapsed }: AdminSidebarProps) {
	const [location] = useLocation();
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

	// Helper to expand/collapse a submenu category
	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category]
		}));
	};

	return (
		<aside
			className={cn(
				'h-full bg-black border-r border-zinc-800 flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden',
				collapsed ? 'w-16' : 'w-64'
			)}
		>
			<div className="flex-1 overflow-y-auto py-4">
				<div className="px-3 mb-6">
					{!collapsed && (
						<div className="text-xs font-medium text-zinc-500 uppercase mb-2 px-2">Dashboard</div>
					)}

					<nav className="space-y-1">
						{links.map((link) => {
							// Check if link or any submenu is active
							const isActive =
								location === link.href ||
								link.submenu?.some((item) => location === item.href) ||
								false;
							const hasSubmenu = link.submenu && link.submenu.length > 0;
							const isExpanded = expandedCategories[link.label];

							return (
								<div key={link.href} className="space-y-1">
									{/* Main menu item */}
									<Link
										href={hasSubmenu ? '#' : link.href}
										onClick={hasSubmenu ? () => toggleCategory(link.label) : undefined}
										className={cn(
											'flex items-center px-2 py-2 text-sm font-medium rounded-md group',
											isActive
												? 'bg-zinc-800 text-white'
												: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
											hasSubmenu && 'justify-between'
										)}
									>
										<div className="flex items-center">
											<span className="mr-3 flex-shrink-0 h-5 w-5 text-zinc-500">{link.icon}</span>
											{!collapsed && <span>{link.label}</span>}
										</div>

										{!collapsed && hasSubmenu && (
											<span className="ml-2">
												{isExpanded ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												)}
											</span>
										)}
									</Link>

									{/* Submenu items */}
									{!collapsed && hasSubmenu && isExpanded && (
										<div className="ml-8 space-y-1">
											{link.submenu?.map((subitem) => (
												<Link
													key={subitem.href}
													href={subitem.href}
													className={cn(
														'block px-3 py-2 text-sm rounded-md',
														location === subitem.href
															? 'bg-zinc-800 text-white'
															: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
													)}
												>
													{subitem.label}
												</Link>
											))}
										</div>
									)}
								</div>
							);
						})}
					</nav>
				</div>
			</div>

			{/* Bottom section with view site link */}
			{!collapsed && (
				<div className="p-4 border-t border-zinc-800">
					<Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-white">
						<ExternalLink className="h-4 w-4 mr-2" />
						View Site
					</Link>
				</div>
			)}
		</aside>
	);
}
