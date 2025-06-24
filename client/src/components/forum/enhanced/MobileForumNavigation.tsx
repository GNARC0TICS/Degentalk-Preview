import React, { useState, useRef, useEffect, memo } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Menu,
	X,
	ChevronRight,
	Home,
	Layers,
	Search,
	Bookmark,
	User,
	Settings,
	Flame,
	TrendingUp,
	MessageSquare,
	Users,
	Target,
	Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForumStructure } from '@/contexts/ForumStructureContext';

export interface MobileForumNavigationProps {
	className?: string;
}

const MobileForumNavigation = memo(({ className }: MobileForumNavigationProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSection, setActiveSection] = useState<'zones' | 'forums' | 'bookmarks'>('zones');
	const [location] = useLocation();
	const { zones, isLoading } = useForumStructure();

	const dragConstraintsRef = useRef<HTMLDivElement>(null);

	// Close on route change
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
		const shouldClose = info.velocity.x < -500 || info.offset.x < -150;
		if (shouldClose) {
			setIsOpen(false);
		}
	};

	const zoneThemes = {
		pit: {
			gradient: 'from-red-900/20 to-red-800/10',
			accent: 'text-red-400',
			icon: Flame
		},
		mission: {
			gradient: 'from-blue-900/20 to-blue-800/10',
			accent: 'text-blue-400',
			icon: Target
		},
		casino: {
			gradient: 'from-purple-900/20 to-purple-800/10',
			accent: 'text-purple-400',
			icon: Sparkles
		},
		briefing: {
			gradient: 'from-amber-900/20 to-amber-800/10',
			accent: 'text-amber-400',
			icon: MessageSquare
		},
		archive: {
			gradient: 'from-gray-900/20 to-gray-800/10',
			accent: 'text-gray-400',
			icon: MessageSquare
		},
		shop: {
			gradient: 'from-violet-900/20 to-pink-900/10',
			accent: 'text-violet-400',
			icon: Sparkles
		}
	};

	const filteredZones =
		zones?.filter(
			(zone) =>
				zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				zone.forums.some((forum) => forum.name.toLowerCase().includes(searchQuery.toLowerCase()))
		) || [];

	const navigationSections = [
		{ id: 'zones', label: 'Zones', icon: Layers },
		{ id: 'forums', label: 'Forums', icon: MessageSquare },
		{ id: 'bookmarks', label: 'Saved', icon: Bookmark }
	];

	return (
		<>
			{/* Mobile Menu Trigger */}
			<Button
				variant="ghost"
				size="icon"
				className={cn(
					'md:hidden fixed top-4 left-4 z-50 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50',
					'hover:bg-zinc-800/80',
					className
				)}
				onClick={() => setIsOpen(true)}
			>
				<Menu className="h-5 w-5" />
			</Button>

			{/* Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
						onClick={() => setIsOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Mobile Navigation Panel */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={dragConstraintsRef}
						initial={{ x: '-100%' }}
						animate={{ x: 0 }}
						exit={{ x: '-100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						drag="x"
						dragConstraints={{ left: -300, right: 0 }}
						dragElastic={0.1}
						onDragEnd={handleDragEnd}
						className="fixed top-0 left-0 h-full w-80 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/50 z-50 md:hidden overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
									<span className="text-black font-bold text-sm">DT</span>
								</div>
								<span className="font-bold text-white">DegenTalk</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="text-zinc-400 hover:text-white"
								onClick={() => setIsOpen(false)}
							>
								<X className="h-5 w-5" />
							</Button>
						</div>

						{/* Search */}
						<div className="p-4 border-b border-zinc-800/50">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
								<Input
									placeholder="Search zones & forums..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-400"
								/>
							</div>
						</div>

						{/* Navigation Sections */}
						<div className="flex border-b border-zinc-800/50">
							{navigationSections.map((section) => {
								const Icon = section.icon;
								return (
									<button
										key={section.id}
										onClick={() => setActiveSection(section.id as any)}
										className={cn(
											'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
											activeSection === section.id
												? 'text-emerald-400 bg-emerald-900/20 border-b-2 border-emerald-500'
												: 'text-zinc-400 hover:text-zinc-200'
										)}
									>
										<Icon className="w-4 h-4" />
										{section.label}
									</button>
								);
							})}
						</div>

						{/* Content Area */}
						<div className="flex-1 overflow-y-auto">
							{/* Quick Actions */}
							<div className="p-4 space-y-2 border-b border-zinc-800/50">
								<Link href="/">
									<Button
										variant="ghost"
										className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800/50"
										onClick={() => setIsOpen(false)}
									>
										<Home className="w-4 h-4 mr-3" />
										Home
									</Button>
								</Link>
								<Link href="/profile">
									<Button
										variant="ghost"
										className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800/50"
										onClick={() => setIsOpen(false)}
									>
										<User className="w-4 h-4 mr-3" />
										Profile
									</Button>
								</Link>
							</div>

							{/* Main Content */}
							<div className="p-4">
								{activeSection === 'zones' && (
									<div className="space-y-3">
										{isLoading ? (
											<div className="space-y-2">
												{Array.from({ length: 5 }).map((_, i) => (
													<div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
												))}
											</div>
										) : (
											filteredZones.map((zone) => {
												const theme =
													zoneThemes[zone.colorTheme as keyof typeof zoneThemes] ||
													zoneThemes.archive;
												const IconComponent = theme.icon;

												return (
													<motion.div
														key={zone.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
													>
														<Link href={`/zones/${zone.slug}`}>
															<div
																className={cn(
																	'p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600/50',
																	'bg-gradient-to-r transition-all duration-200 cursor-pointer',
																	theme.gradient
																)}
																onClick={() => setIsOpen(false)}
															>
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-3">
																		<div
																			className={cn(
																				'w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center',
																				theme.accent
																			)}
																		>
																			{zone.icon ? (
																				<span className="text-lg">{zone.icon}</span>
																			) : (
																				<IconComponent className="w-4 h-4" />
																			)}
																		</div>
																		<div>
																			<div className={cn('font-medium', theme.accent)}>
																				{zone.name}
																			</div>
																			<div className="text-xs text-zinc-400">
																				{zone.forums.length} forums
																			</div>
																		</div>
																	</div>
																	<ChevronRight className="w-4 h-4 text-zinc-500" />
																</div>
															</div>
														</Link>
													</motion.div>
												);
											})
										)}
									</div>
								)}

								{activeSection === 'forums' && (
									<div className="space-y-2">
										{filteredZones.flatMap((zone) =>
											zone.forums.map((forum) => (
												<motion.div
													key={forum.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
												>
													<Link href={`/forums/${forum.slug}`}>
														<div
															className="p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600/50 hover:bg-zinc-800/30 transition-all cursor-pointer"
															onClick={() => setIsOpen(false)}
														>
															<div className="flex items-center justify-between">
																<div>
																	<div className="font-medium text-zinc-200">{forum.name}</div>
																	<div className="text-xs text-zinc-400">{zone.name}</div>
																</div>
																<div className="flex items-center gap-2">
																	<Badge variant="outline" className="text-xs">
																		<MessageSquare className="w-3 h-3 mr-1" />
																		{forum.threadCount}
																	</Badge>
																	<ChevronRight className="w-4 h-4 text-zinc-500" />
																</div>
															</div>
														</div>
													</Link>
												</motion.div>
											))
										)}
									</div>
								)}

								{activeSection === 'bookmarks' && (
									<div className="text-center py-8">
										<Bookmark className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
										<p className="text-zinc-400 text-sm">No bookmarks yet</p>
										<p className="text-zinc-500 text-xs mt-1">Save threads to see them here</p>
									</div>
								)}
							</div>
						</div>

						{/* Bottom Actions */}
						<div className="p-4 border-t border-zinc-800/50">
							<Button
								variant="ghost"
								className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50"
							>
								<Settings className="w-4 h-4 mr-3" />
								Settings
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
});

MobileForumNavigation.displayName = 'MobileForumNavigation';

export default MobileForumNavigation;
