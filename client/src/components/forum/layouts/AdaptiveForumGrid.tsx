import type { UserId } from '@shared/types';
import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Grid3X3, List, Columns, MoreHorizontal, Filter, SortAsc } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';

export interface AdaptiveForumGridProps<T> {
	items: T[];
	renderItem: (item: T, index: number) => React.ReactNode;
	layout?: 'grid' | 'list' | 'masonry' | 'auto';
	columns?: {
		mobile: number;
		tablet: number;
		desktop: number;
		large: number;
	};
	gap?: number;
	virtualized?: boolean;
	estimateSize?: number;
	onLayoutChange?: (layout: 'grid' | 'list' | 'masonry') => void;
	sortOptions?: Array<{
		value: string;
		label: string;
	}>;
	onSortChange?: (sort: string) => void;
	currentSort?: string;
	isLoading?: boolean;
	loadingSkeletons?: number;
	className?: string;
}

const AdaptiveForumGrid = memo(
	<T extends { id: UserId }>({
		items,
		renderItem,
		layout = 'auto',
		columns = {
			mobile: 1,
			tablet: 2,
			desktop: 3,
			large: 4
		},
		gap = 4,
		virtualized = false,
		estimateSize = 400,
		onLayoutChange,
		sortOptions,
		onSortChange,
		currentSort,
		isLoading = false,
		loadingSkeletons = 6,
		className
	}: AdaptiveForumGridProps<T>) => {
		// Ensure items is always an array to avoid runtime errors when callers pass
		// an object or undefined (e.g. from failed API calls).
		const safeItems = Array.isArray(items) ? items : ([] as T[]);

		const [currentLayout, setCurrentLayout] = useState<'grid' | 'list' | 'masonry'>(
			layout === 'auto' ? 'list' : (layout as 'grid' | 'list' | 'masonry')
		);
		const [masonryColumns, setMasonryColumns] = useState<Array<T[]>>([]);

		const breakpoint = useBreakpoint();
		const containerRef = useRef<HTMLDivElement>(null);
		const [containerWidth, setContainerWidth] = useState(0);

		// Auto-adjust layout based on screen size
		useEffect(() => {
			// Only auto-adjust if layout is explicitly set to 'auto'
			if (layout === 'auto') {
				if (breakpoint.isMobile) {
					setCurrentLayout('list');
				} else if (breakpoint.isTablet) {
					setCurrentLayout('grid');
				} else {
					setCurrentLayout('grid');
				}
			} else {
				// Respect explicit layout prop when layout is not 'auto'
				setCurrentLayout(layout);
			}
		}, [layout, breakpoint]);

		// Update container width for masonry calculations
		useEffect(() => {
			const updateWidth = () => {
				if (containerRef.current) {
					setContainerWidth(containerRef.current.offsetWidth);
				}
			};

			updateWidth();
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}, []);

		// Calculate masonry columns
		useEffect(() => {
			if (currentLayout === 'masonry' && safeItems.length > 0) {
				const columnCount = getColumnCount();
				const newColumns: Array<T[]> = Array.from({ length: columnCount }, () => []);

				safeItems.forEach((item, index) => {
					const columnIndex = index % columnCount;
					newColumns[columnIndex].push(item);
				});

				setMasonryColumns(newColumns);
			}
		}, [safeItems, currentLayout, breakpoint, containerWidth]);

		const getColumnCount = () => {
			if (breakpoint.isMobile) return columns.mobile;
			if (breakpoint.isTablet) return columns.tablet;
			if (breakpoint.isLarge) return columns.large;
			return columns.desktop;
		};

		const handleLayoutChange = (newLayout: 'grid' | 'list' | 'masonry') => {
			setCurrentLayout(newLayout);
			onLayoutChange?.(newLayout);
		};

		// Virtualization for list layout
		const rowVirtualizer = useVirtualizer({
			count: safeItems.length,
			getScrollElement: () => containerRef.current,
			estimateSize: () => estimateSize || 300,
			enabled: virtualized && currentLayout === 'list'
		});

		const layoutIcons = {
			grid: Grid3X3,
			list: List,
			masonry: Columns
		};

		const renderSkeletons = () => {
			return Array.from({ length: loadingSkeletons }).map((_, index) => (
				<motion.div
					key={`skeleton-${index}`}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: index * 0.1 }}
					className={cn(
						'bg-zinc-800/30 rounded-lg animate-pulse',
						currentLayout === 'list' ? 'h-32' : 'h-64'
					)}
				/>
			));
		};

		const containerVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.05,
					delayChildren: 0.1
				}
			}
		};

		const itemVariants = {
			hidden: { opacity: 0, y: 20 },
			visible: {
				opacity: 1,
				y: 0,
				transition: {
					type: 'spring',
					stiffness: 300,
					damping: 25
				}
			}
		};

		return (
			<div data-testid="adaptive-forum-grid" className={cn('space-y-4', className)}>
				{/* Controls Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{/* Layout Switcher */}
						{onLayoutChange && (
							<div
								data-testid="layout-switcher"
								className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg"
							>
								{Object.entries(layoutIcons).map(([layoutType, Icon]) => (
									<Button
										key={layoutType}
										variant={currentLayout === layoutType ? 'default' : 'ghost'}
										size="sm"
										className={cn(
											'h-8 w-8 p-0',
											currentLayout === layoutType
												? 'bg-emerald-600 hover:bg-emerald-700'
												: 'text-zinc-400 hover:text-white'
										)}
										onClick={() => handleLayoutChange(layoutType as any)}
									>
										<Icon className="h-4 w-4" />
									</Button>
								))}
							</div>
						)}

						{/* Sort Options */}
						{sortOptions && onSortChange && (
							<Select value={currentSort} onValueChange={onSortChange}>
								<SelectTrigger className="w-48 h-8 bg-zinc-800/50 border-zinc-700/50">
									<div className="flex items-center gap-2">
										<SortAsc className="h-3 w-3" />
										<SelectValue placeholder="Sort by..." />
									</div>
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{/* Grid Info */}
					<div className="text-xs text-zinc-400">
						{safeItems.length} items • {getColumnCount()} columns
					</div>
				</div>

				{/* Main Content Container */}
				<div
					data-testid="content-container"
					ref={containerRef}
					className={cn(
						'relative',
						virtualized && currentLayout === 'list' && 'h-[600px] overflow-auto'
					)}
				>
					<AnimatePresence mode="wait">
						{isLoading ? (
							<motion.div
								key="loading"
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className={cn(
									'gap-4',
									currentLayout === 'grid' && 'grid',
									currentLayout === 'grid' && getColumnCount() === 1 && 'grid-cols-1',
									currentLayout === 'grid' && getColumnCount() === 2 && 'grid-cols-2',
									currentLayout === 'grid' && getColumnCount() === 3 && 'grid-cols-3',
									currentLayout === 'grid' && getColumnCount() === 4 && 'grid-cols-4',
									currentLayout === 'list' && 'space-y-4',
									currentLayout === 'masonry' && 'grid',
									currentLayout === 'masonry' && getColumnCount() === 1 && 'grid-cols-1',
									currentLayout === 'masonry' && getColumnCount() === 2 && 'grid-cols-2',
									currentLayout === 'masonry' && getColumnCount() === 3 && 'grid-cols-3',
									currentLayout === 'masonry' && getColumnCount() === 4 && 'grid-cols-4'
								)}
							>
								{renderSkeletons()}
							</motion.div>
						) : (
							<motion.div
								key={`${currentLayout}-${getColumnCount()}`}
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								className="w-full"
							>
								{/* List Layout */}
								{currentLayout === 'list' && (
									<div
										className={cn(
											'space-y-4',
											gap === 1 && 'space-y-1',
											gap === 2 && 'space-y-2',
											gap === 3 && 'space-y-3',
											gap === 5 && 'space-y-5',
											gap === 6 && 'space-y-6',
											gap === 8 && 'space-y-8'
										)}
									>
										{virtualized ? (
											<div
												style={{
													height: rowVirtualizer.getTotalSize(),
													position: 'relative'
												}}
											>
												{rowVirtualizer.getVirtualItems().map((virtualItem) => (
													<motion.div
														key={virtualItem.key}
														variants={itemVariants}
														style={{
															position: 'absolute',
															top: 0,
															left: 0,
															width: '100%',
															height: virtualItem.size,
															transform: `translateY(${virtualItem.start}px)`
														}}
													>
														{renderItem(safeItems[virtualItem.index], virtualItem.index)}
													</motion.div>
												))}
											</div>
										) : (
											safeItems.map((item, index) => (
												<motion.div key={item.id} variants={itemVariants}>
													{renderItem(item, index)}
												</motion.div>
											))
										)}
									</div>
								)}

								{/* Grid Layout */}
								{currentLayout === 'grid' && (
									<div
										className={cn(
											'grid gap-4',
											gap === 1 && 'gap-1',
											gap === 2 && 'gap-2',
											gap === 3 && 'gap-3',
											gap === 5 && 'gap-5',
											gap === 6 && 'gap-6',
											gap === 8 && 'gap-8',
											// Use proper grid column classes based on breakpoint
											breakpoint.isMobile && columns.mobile === 1 && 'grid-cols-1',
											breakpoint.isMobile && columns.mobile === 2 && 'grid-cols-2',
											breakpoint.isMobile && columns.mobile === 3 && 'grid-cols-3',
											breakpoint.isMobile && columns.mobile === 4 && 'grid-cols-4',
											!breakpoint.isMobile &&
												breakpoint.isTablet &&
												columns.tablet === 1 &&
												'md:grid-cols-1',
											!breakpoint.isMobile &&
												breakpoint.isTablet &&
												columns.tablet === 2 &&
												'md:grid-cols-2',
											!breakpoint.isMobile &&
												breakpoint.isTablet &&
												columns.tablet === 3 &&
												'md:grid-cols-3',
											!breakpoint.isMobile &&
												breakpoint.isTablet &&
												columns.tablet === 4 &&
												'md:grid-cols-4',
											breakpoint.isDesktop && columns.desktop === 1 && 'lg:grid-cols-1',
											breakpoint.isDesktop && columns.desktop === 2 && 'lg:grid-cols-2',
											breakpoint.isDesktop && columns.desktop === 3 && 'lg:grid-cols-3',
											breakpoint.isDesktop && columns.desktop === 4 && 'lg:grid-cols-4',
											breakpoint.isLarge && columns.large === 1 && 'xl:grid-cols-1',
											breakpoint.isLarge && columns.large === 2 && 'xl:grid-cols-2',
											breakpoint.isLarge && columns.large === 3 && 'xl:grid-cols-3',
											breakpoint.isLarge && columns.large === 4 && 'xl:grid-cols-4'
										)}
									>
										{safeItems.map((item, index) => (
											<motion.div key={item.id} variants={itemVariants}>
												{renderItem(item, index)}
											</motion.div>
										))}
									</div>
								)}

								{/* Masonry Layout */}
								{currentLayout === 'masonry' && (
									<div
										className={cn(
											'flex gap-4',
											gap === 1 && 'gap-1',
											gap === 2 && 'gap-2',
											gap === 3 && 'gap-3',
											gap === 5 && 'gap-5',
											gap === 6 && 'gap-6',
											gap === 8 && 'gap-8'
										)}
									>
										{masonryColumns.map((column, columnIndex) => (
											<div
												key={columnIndex}
												className={cn(
													'flex-1 space-y-4',
													gap === 1 && 'space-y-1',
													gap === 2 && 'space-y-2',
													gap === 3 && 'space-y-3',
													gap === 5 && 'space-y-5',
													gap === 6 && 'space-y-6',
													gap === 8 && 'space-y-8'
												)}
											>
												{column.map((item, itemIndex) => (
													<motion.div key={item.id} variants={itemVariants}>
														{renderItem(item, itemIndex)}
													</motion.div>
												))}
											</div>
										))}
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		);
	}
);

AdaptiveForumGrid.displayName = 'AdaptiveForumGrid';

export default AdaptiveForumGrid;
