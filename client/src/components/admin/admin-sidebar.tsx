/**
 * Admin Sidebar Component
 *
 * An improved sidebar with better mobile responsiveness
 */

import { useState, useRef, useCallback } from 'react';
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
	onLinkClick?: () => void; // Optional callback for when a link is clicked
}

export default function AdminSidebar({ links, collapsed, onLinkClick }: AdminSidebarProps) {
	const [location] = useLocation();
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Helper to expand/collapse a submenu category
	const toggleCategory = useCallback((category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category]
		}));
	}, []);

	// Handle link clicks to prevent unwanted scroll behavior
	const handleLinkClick = useCallback(
		(href: string, hasSubmenu: boolean, category?: string) => {
			return (e: React.MouseEvent) => {
				if (hasSubmenu) {
					e.preventDefault();
					if (category) {
						toggleCategory(category);
					}
				} else {
					// Let the Link component handle navigation naturally
					if (onLinkClick) {
						onLinkClick();
					}
				}
			};
		},
		[toggleCategory, onLinkClick]
	);

	return (
		<aside
			className={cn(
				'h-full bg-admin-surface border-r border-admin-border-subtle flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden',
				collapsed ? 'w-16' : 'w-64'
			)}
		>
			<div
				ref={scrollContainerRef}
				className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-admin-border-subtle scroll-smooth"
			>
				<div className="px-3 mb-6">
					{!collapsed && (
						<div className="text-xs font-medium text-admin-text-secondary uppercase mb-2 px-2">
							Admin Panel
						</div>
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
										onClick={handleLinkClick(link.href, hasSubmenu, link.label)}
										className={cn(
											'flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors duration-150',
											isActive
												? 'bg-admin-bg-element text-admin-text-accent'
												: 'text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg-surface',
											hasSubmenu && 'justify-between'
										)}
									>
										<div className="flex items-center">
											<span
												className={cn(
													'mr-3 flex-shrink-0 h-5 w-5',
													isActive
														? 'text-admin-text-accent'
														: 'text-admin-text-secondary group-hover:text-admin-text-primary'
												)}
											>
												{link.icon}
											</span>
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
													onClick={(e) => {
														// Close mobile drawer on submenu item click
														if (onLinkClick) {
															onLinkClick();
														}
													}}
													className={cn(
														'block px-3 py-2 text-sm rounded-md transition-colors duration-150',
														location === subitem.href
															? 'bg-admin-bg-element text-admin-text-accent'
															: 'text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg-surface'
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
				<div className="p-4 border-t border-admin-border-subtle">
					<Link
						href="/"
						className="flex items-center text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors duration-150"
					>
						<ExternalLink className="h-4 w-4 mr-2" />
						View Site
					</Link>
				</div>
			)}
		</aside>
	);
}
