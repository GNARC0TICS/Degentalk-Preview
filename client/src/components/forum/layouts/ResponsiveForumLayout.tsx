import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Sidebar,
	Menu,
	X,
	ChevronLeft,
	Filter,
	SortAsc,
	Grid3X3,
	List,
	Maximize2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';

import MobileForumNavigation from '@/components/forum/enhanced/MobileForumNavigation';
import HierarchicalZoneNav from '@/features/forum/components/HierarchicalZoneNav';

export interface ResponsiveForumLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
	header?: React.ReactNode;
	filters?: React.ReactNode;
	breadcrumbs?: React.ReactNode;
	showNavigation?: boolean;
	showFilters?: boolean;
	layout?: 'grid' | 'list' | 'masonry';
	onLayoutChange?: (layout: 'grid' | 'list' | 'masonry') => void;
	className?: string;
}

const ResponsiveForumLayout = memo(
	({
		children,
		sidebar,
		header,
		filters,
		breadcrumbs,
		showNavigation = true,
		showFilters = true,
		layout = 'list',
		onLayoutChange,
		className
	}: ResponsiveForumLayoutProps) => {
		const [sidebarOpen, setSidebarOpen] = useState(false);
		const [filtersOpen, setFiltersOpen] = useState(false);
		const [isCollapsed, setIsCollapsed] = useState(false);

		// Media queries for responsive behavior
		const breakpoint = useBreakpoint();
		const { isMobile, isTablet, isDesktop } = breakpoint;

		// Auto-collapse sidebar on tablet
		useEffect(() => {
			if (isTablet && !isMobile) {
				setIsCollapsed(true);
			} else if (isDesktop) {
				setIsCollapsed(false);
			}
		}, [isMobile, isTablet, isDesktop]);

		// Close modals on route change (mobile)
		useEffect(() => {
			setSidebarOpen(false);
			setFiltersOpen(false);
		}, [children]);

		const layoutIcons = {
			grid: Grid3X3,
			list: List,
			masonry: Maximize2
		};

		const containerVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.1,
					delayChildren: 0.2
				}
			}
		};

		const itemVariants = {
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 }
		};

		return (
			<div
				data-testid="responsive-forum-layout"
				className={cn('min-h-screen bg-zinc-950', className)}
			>
				{/* Mobile Navigation */}
				{isMobile && showNavigation && <MobileForumNavigation />}

				<div className="flex h-screen overflow-hidden">
					{/* Desktop Sidebar */}
					{!isMobile && showNavigation && (
						<motion.aside
							data-testid="desktop-sidebar"
							initial={false}
							animate={{
								width: isCollapsed ? '64px' : '280px'
							}}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							className="hidden md:flex flex-col bg-zinc-900/50 border-r border-zinc-800/50 backdrop-blur-sm"
						>
							{/* Sidebar Header */}
							<div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
								{!isCollapsed && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="flex items-center gap-3"
									>
										<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
											<span className="text-black font-bold text-sm">DT</span>
										</div>
										<span className="font-bold text-white">Forums</span>
									</motion.div>
								)}

								<Button
									variant="ghost"
									size="icon"
									className="text-zinc-400 hover:text-white h-8 w-8"
									onClick={() => setIsCollapsed(!isCollapsed)}
								>
									{isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
								</Button>
							</div>

							{/* Sidebar Content */}
							<div className="flex-1 overflow-hidden">
								{sidebar || (
									<HierarchicalZoneNav
										className={cn(
											'h-full transition-all duration-300',
											isCollapsed ? 'px-2' : 'px-4'
										)}
									/>
								)}
							</div>
						</motion.aside>
					)}

					{/* Main Content Area */}
					<div className="flex-1 flex flex-col overflow-hidden">
						{/* Top Bar - Sticky for better navigation */}
						<motion.header
							data-testid="top-bar"
							variants={itemVariants}
							className={cn(
								'flex items-center justify-between p-4 bg-zinc-900/30 border-b border-zinc-800/50 backdrop-blur-sm',
								// Sticky positioning for better UX
								'sticky top-0 z-30',
								// Mobile: Reduce padding for more content space
								isMobile ? 'p-3' : 'p-4'
							)}
						>
							<div className="flex items-center gap-4">
								{/* Mobile Sidebar Toggle */}
								{!isMobile && isTablet && (
									<Button
										variant="ghost"
										size="icon"
										className="text-zinc-400 hover:text-white"
										onClick={() => setSidebarOpen(true)}
									>
										<Sidebar className="h-5 w-5" />
									</Button>
								)}

								{/* Breadcrumbs */}
								{breadcrumbs}
							</div>

							{/* Layout Controls */}
							<div className="flex items-center gap-2">
								{/* Layout Switcher - Hide more complex controls on mobile */}
								{onLayoutChange && !isMobile && (
									<div
										data-testid="layout-controls"
										className="hidden sm:flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg"
									>
										{Object.entries(layoutIcons).map(([layoutType, Icon]) => (
											<Button
												key={layoutType}
												variant={layout === layoutType ? 'default' : 'ghost'}
												size="sm"
												className={cn(
													'h-8 w-8 p-0',
													layout === layoutType
														? 'bg-emerald-600 hover:bg-emerald-700'
														: 'text-zinc-400 hover:text-white'
												)}
												onClick={() => onLayoutChange(layoutType as any)}
											>
												<Icon className="h-4 w-4" />
											</Button>
										))}
									</div>
								)}

								{/* Filter Toggle */}
								{showFilters && filters && (
									<Button
										variant="ghost"
										size="icon"
										className="text-zinc-400 hover:text-white md:hidden"
										onClick={() => setFiltersOpen(true)}
									>
										<Filter className="h-5 w-5" />
									</Button>
								)}
							</div>
						</motion.header>

						{/* Header Content */}
						{header && (
							<motion.div variants={itemVariants} className="px-4 py-6 bg-zinc-900/20">
								{header}
							</motion.div>
						)}

						{/* Main Content */}
						<motion.main
							data-testid="main-content"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="flex-1 overflow-auto"
						>
							<div className="flex h-full">
								{/* Content Area */}
								<div className="flex-1 p-4 md:p-6">
									<motion.div
										data-testid="content-area"
										variants={itemVariants}
										className={cn(
											'transition-all duration-300',
											layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
											layout === 'list' && 'space-y-4',
											layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3 gap-6'
										)}
									>
										{children}
									</motion.div>
								</div>

								{/* Desktop Filters Sidebar */}
								{showFilters && filters && !isMobile && (
									<motion.aside
										data-testid="filters-sidebar"
										variants={itemVariants}
										className="hidden lg:block w-80 p-6 bg-zinc-900/20 border-l border-zinc-800/50"
									>
										<div className="sticky top-6">
											<h3 className="text-lg font-semibold text-white mb-4">Filters & Options</h3>
											{filters}
										</div>
									</motion.aside>
								)}
							</div>
						</motion.main>
					</div>
				</div>

				{/* Mobile/Tablet Sheets */}

				{/* Tablet Sidebar Sheet */}
				{isTablet && !isMobile && (
					<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
						<SheetContent side="left" className="w-80 p-0 bg-zinc-900/95 backdrop-blur-xl">
							<div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
										<span className="text-black font-bold text-sm">DT</span>
									</div>
									<span className="font-bold text-white">Forums</span>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="text-zinc-400 hover:text-white"
									onClick={() => setSidebarOpen(false)}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>
							<div className="p-4 h-full overflow-auto">{sidebar || <HierarchicalZoneNav />}</div>
						</SheetContent>
					</Sheet>
				)}

				{/* Mobile Filters Sheet */}
				{isMobile && showFilters && filters && (
					<Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
						<SheetContent side="right" className="w-full sm:w-96 bg-zinc-900/95 backdrop-blur-xl">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-white">Filters & Options</h3>
								<Button
									variant="ghost"
									size="icon"
									className="text-zinc-400 hover:text-white"
									onClick={() => setFiltersOpen(false)}
								>
									<X className="h-5 w-5" />
								</Button>
							</div>
							{filters}
						</SheetContent>
					</Sheet>
				)}
			</div>
		);
	}
);

ResponsiveForumLayout.displayName = 'ResponsiveForumLayout';

export default ResponsiveForumLayout;
