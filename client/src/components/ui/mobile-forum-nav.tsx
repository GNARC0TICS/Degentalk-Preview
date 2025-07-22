import React, { useState, useRef, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import {
	Menu,
	X,
	ChevronRight,
	Home,
	Search,
	Bookmark,
	TrendingUp,
	MessageSquare,
	User,
	Settings,
	ChevronDown,
	Sparkles,
	Zap,
	Crown,
	ArrowLeft,
	Bell
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/utils';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import { useAuth } from '@/hooks/use-auth';

export interface MobileForumNavProps {
	className?: string;
}

interface NavItem {
	icon: React.ComponentType<any>;
	label: string;
	href: string;
	badge?: number;
	isActive?: boolean;
	children?: NavItem[];
}

const MobileForumNav = memo(({ className }: MobileForumNavProps) => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const { zones, isUsingFallback } = useForumStructure();
	const { user, isAuthenticated } = useAuth();
	const [dragY, setDragY] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	// Quick access navigation items
	const quickNavItems: NavItem[] = [
		{ icon: Home, label: 'Home', href: '/' },
		{ icon: TrendingUp, label: 'Trending', href: '/trending', badge: 5 },
		{ icon: MessageSquare, label: 'Latest Posts', href: '/latest' },
		{ icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
		...(isAuthenticated
			? [
					{ icon: Bell, label: 'Notifications', href: '/notifications', badge: 3 },
					{ icon: User, label: 'Profile', href: '/profile' }
				]
			: [{ icon: User, label: 'Login', href: '/login' }])
	];

	// Enhanced gesture handling for smooth drawer
	const handleDragEnd = (event: any, info: PanInfo) => {
		const threshold = 150;
		const velocity = info.velocity.y;

		if (velocity > 500 || info.offset.y > threshold) {
			setIsOpen(false);
		} else if (velocity < -500 || info.offset.y < -threshold) {
			setIsOpen(true);
		}
	};

	// Close on route change
	useEffect(() => {
		setIsOpen(false);
		setExpandedSection(null);
	}, [location]);

	// Enhanced backdrop blur and overlay
	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 0.3 }
		}
	};

	const drawerVariants = {
		hidden: {
			y: '100%',
			transition: {
				type: 'spring',
				damping: 25,
				stiffness: 300
			}
		},
		visible: {
			y: 0,
			transition: {
				type: 'spring',
				damping: 25,
				stiffness: 300
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: i * 0.05,
				duration: 0.3,
				ease: 'easeOut'
			}
		})
	};

	const isCurrentPath = (href: string) => {
		return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			// Navigate to search results
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
			setIsOpen(false);
		}
	};

	return (
		<div className={cn(className)}>
			{/* Mobile Navigation Trigger */}
			<div className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800/50">
				<div className="flex items-center justify-between p-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(true)}
						className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
					>
						<Menu className="h-5 w-5" />
					</Button>

					{/* Logo/Title */}
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
							<span className="text-black font-bold text-sm">DT</span>
						</div>
						<span className="font-bold text-white">DegenTalk</span>
					</Link>

					{/* Quick Search */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(true)}
						className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
					>
						<Search className="h-5 w-5" />
					</Button>
				</div>
			</div>

			{/* Enhanced Mobile Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="fixed inset-0 z-[60]"
					>
						{/* Enhanced backdrop */}
						<motion.div
							variants={backdropVariants}
							className="absolute inset-0 bg-black/60 backdrop-blur-sm"
							onClick={() => setIsOpen(false)}
						/>

						{/* Drawer */}
						<motion.div
							ref={containerRef}
							variants={drawerVariants}
							drag="y"
							dragConstraints={{ top: 0, bottom: 0 }}
							dragElastic={0.2}
							onDragEnd={handleDragEnd}
							onDrag={(event, info) => setDragY(info.offset.y)}
							className="absolute bottom-0 left-0 right-0 bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-800/50 rounded-t-2xl max-h-[85vh] overflow-hidden"
						>
							{/* Drag Handle */}
							<div className="flex justify-center py-3">
								<div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
							</div>

							{/* Header */}
							<div className="flex items-center justify-between px-6 pb-4">
								<h2 className="text-xl font-semibold text-white flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-emerald-400" />
									Navigation
								</h2>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsOpen(false)}
									className="text-zinc-400 hover:text-white h-8 w-8"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Search Bar */}
							<div className="px-6 mb-6">
								<form onSubmit={handleSearchSubmit}>
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
										<Input
											placeholder="Search forums, threads..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400 focus:border-emerald-500"
										/>
									</div>
								</form>
							</div>

							{/* Scrollable Content */}
							<div className="flex-1 overflow-y-auto px-6 pb-6">
								{/* Quick Navigation */}
								<div className="mb-8">
									<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
										Quick Access
									</h3>
									<div className="space-y-2">
										{quickNavItems.map((item, index) => (
											<motion.div
												key={item.href}
												custom={index}
												variants={itemVariants}
												initial="hidden"
												animate="visible"
											>
												<Link
													to={item.href}
													className={cn(
														'flex items-center justify-between p-3 rounded-xl transition-all duration-200',
														isCurrentPath(item.href)
															? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
															: 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
													)}
												>
													<div className="flex items-center gap-3">
														<item.icon className="w-5 h-5" />
														<span className="font-medium">{item.label}</span>
													</div>
													{item.badge && (
														<Badge variant="destructive" className="h-5 text-xs">
															{item.badge}
														</Badge>
													)}
												</Link>
											</motion.div>
										))}
									</div>
								</div>

								{/* Forum Zones */}
								{zones && zones.length > 0 && (
									<div className="mb-8">
										<h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
											Forum Categories
										</h3>
										<div className="space-y-2">
											{zones.map((zone, zoneIndex) => (
												<motion.div
													key={zone.slug}
													custom={zoneIndex + quickNavItems.length}
													variants={itemVariants}
													initial="hidden"
													animate="visible"
												>
													<div>
														{/* Zone Header */}
														<button
															onClick={() =>
																setExpandedSection(expandedSection === zone.slug ? null : zone.slug)
															}
															className="w-full flex items-center justify-between p-3 rounded-xl text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all duration-200"
														>
															<div className="flex items-center gap-3">
																<div
																	className={cn(
																		'w-3 h-3 rounded-full',
																		zone.theme?.colorTheme === 'pit' && 'bg-red-500',
																		zone.theme?.colorTheme === 'mission' && 'bg-blue-500',
																		zone.theme?.colorTheme === 'casino' && 'bg-purple-500',
																		!['pit', 'mission', 'casino'].includes(zone.theme?.colorTheme || '') &&
																			'bg-emerald-500'
																	)}
																/>
																<span className="font-medium">{zone.name}</span>
																<Badge variant="outline" className="text-xs">
																	{zone.forums?.length || 0}
																</Badge>
															</div>
															<motion.div
																animate={{ rotate: expandedSection === zone.slug ? 180 : 0 }}
																transition={{ duration: 0.2 }}
															>
																<ChevronDown className="w-4 h-4" />
															</motion.div>
														</button>

														{/* Zone Forums */}
														<AnimatePresence>
															{expandedSection === zone.slug && zone.forums && (
																<motion.div
																	initial={{ height: 0, opacity: 0 }}
																	animate={{ height: 'auto', opacity: 1 }}
																	exit={{ height: 0, opacity: 0 }}
																	transition={{ duration: 0.3 }}
																	className="ml-6 mt-2 space-y-1"
																>
																	{zone.forums.map((forum) => (
																		<Link
																			key={forum.slug}
																			to={`/forums/${forum.slug}`}
																			className={cn(
																				'flex items-center justify-between p-2 rounded-lg transition-all duration-200',
																				isCurrentPath(`/forums/${forum.slug}`)
																					? 'bg-emerald-500/20 text-emerald-400'
																					: 'text-zinc-400 hover:bg-zinc-800/30 hover:text-white'
																			)}
																		>
																			<span className="text-sm">{forum.name}</span>
																			<div className="flex items-center gap-2 text-xs text-zinc-500">
																				<span>{forum.threadCount || 0}</span>
																				<MessageSquare className="w-3 h-3" />
																			</div>
																		</Link>
																	))}
																</motion.div>
															)}
														</AnimatePresence>
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{/* User Section */}
								{isAuthenticated && user && (
									<div className="border-t border-zinc-800/50 pt-6">
										<div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
											<div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
												<span className="text-black font-bold text-sm">
													{user.username.slice(0, 2).toUpperCase()}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-white truncate">{user.username}</p>
												<div className="flex items-center gap-2 text-xs text-zinc-400">
													<Crown className="w-3 h-3" />
													Level {user.level || 1}
												</div>
											</div>
											<Link to="/settings">
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<Settings className="h-4 w-4" />
												</Button>
											</Link>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

MobileForumNav.displayName = 'MobileForumNav';

export default MobileForumNav;
