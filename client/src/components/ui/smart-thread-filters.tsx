import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Filter,
	X,
	ChevronDown,
	Search,
	SlidersHorizontal,
	TrendingUp,
	Clock,
	MessageSquare,
	Crown,
	Bookmark,
	User,
	Tag,
	Zap,
	RotateCcw,
	Save,
	Star
} from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Switch } from '@app/components/ui/switch';
import { Slider } from '@app/components/ui/slider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem
} from '@app/components/ui/command';
import { cn } from '@app/utils/utils';
import { useBreakpoint } from '@app/hooks/useMediaQuery';
import { useLocalStorage } from '@app/hooks/use-local-storage';
import type { PrefixId, EntityId } from '@shared/types/ids';

export interface ThreadFiltersState {
	sortBy: string;
	search?: string;
	tags: string[];
	prefixId?: PrefixId | null;
	solved?: 'all' | 'solved' | 'unsolved';
	bookmarked?: boolean;
	mine?: boolean;
	replied?: boolean;
	minViews?: number;
	minReplies?: number;
	timeRange?: 'all' | '24h' | '7d' | '30d' | '90d';
	hasMedia?: boolean;
	isPinned?: boolean;
}

export interface SmartThreadFiltersProps {
	filters: ThreadFiltersState;
	onFiltersChange: (filters: ThreadFiltersState) => void;
	availableTags?: Array<{ id: EntityId; name: string; slug: string; color?: string }>;
	availablePrefixes?: Array<{ id: EntityId; name: string; color?: string }>;
	className?: string;
	compact?: boolean;
}

const sortOptions = [
	{ value: 'latest', label: 'Latest Activity', icon: Clock },
	{ value: 'hot', label: 'Hot Threads', icon: TrendingUp },
	{ value: 'most-liked', label: 'Most Liked', icon: Star },
	{ value: 'most-replied', label: 'Most Replies', icon: MessageSquare },
	{ value: 'staked', label: 'Most Staked', icon: Zap }
];

const timeRangeOptions = [
	{ value: 'all', label: 'All Time' },
	{ value: '24h', label: 'Last 24 Hours' },
	{ value: '7d', label: 'Last Week' },
	{ value: '30d', label: 'Last Month' },
	{ value: '90d', label: 'Last 3 Months' }
];

const SmartThreadFilters = memo(
	({
		filters,
		onFiltersChange,
		availableTags = [],
		availablePrefixes = [],
		className,
		compact = false
	}: SmartThreadFiltersProps) => {
		const { isMobile, isTablet } = useBreakpoint();
		const [isExpanded, setIsExpanded] = useState(false);
		const [tagSearchOpen, setTagSearchOpen] = useState(false);
		const [savedFilters, setSavedFilters] = useLocalStorage<Record<string, ThreadFiltersState>>(
			'forum-saved-filters',
			{}
		);

		// Calculate active filter count
		const activeFilterCount = useMemo(() => {
			let count = 0;
			if (filters.search) count++;
			if (filters.tags.length > 0) count++;
			if (filters.prefixId) count++;
			if (filters.solved && filters.solved !== 'all') count++;
			if (filters.bookmarked) count++;
			if (filters.mine) count++;
			if (filters.replied) count++;
			if (filters.minViews && filters.minViews > 0) count++;
			if (filters.minReplies && filters.minReplies > 0) count++;
			if (filters.timeRange && filters.timeRange !== 'all') count++;
			if (filters.hasMedia) count++;
			if (filters.isPinned) count++;
			return count;
		}, [filters]);

		// Quick filter presets
		const quickFilters = [
			{
				name: 'My Content',
				icon: User,
				filters: { ...filters, mine: true, replied: false, bookmarked: false } as ThreadFiltersState
			},
			{
				name: 'Bookmarked',
				icon: Bookmark,
				filters: { ...filters, bookmarked: true, mine: false, replied: false } as ThreadFiltersState
			},
			{
				name: 'Hot Today',
				icon: TrendingUp,
				filters: { ...filters, sortBy: 'hot', timeRange: '24h' as const } as ThreadFiltersState
			},
			{
				name: 'Unsolved',
				icon: Crown,
				filters: { ...filters, solved: 'unsolved' as const, sortBy: 'latest' } as ThreadFiltersState
			}
		];

		const updateFilter = <K extends keyof ThreadFiltersState>(
			key: K,
			value: ThreadFiltersState[K]
		) => {
			onFiltersChange({ ...filters, [key]: value });
		};

		const clearAllFilters = () => {
			onFiltersChange({
				sortBy: 'latest',
				search: '',
				tags: [],
				prefixId: null,
				solved: 'all',
				bookmarked: false,
				mine: false,
				replied: false,
				minViews: 0,
				minReplies: 0,
				timeRange: 'all',
				hasMedia: false,
				isPinned: false
			});
		};

		const saveCurrentFilters = () => {
			const name = `Filter ${Object.keys(savedFilters).length + 1}`;
			setSavedFilters({ ...savedFilters, [name]: filters });
		};

		const loadSavedFilter = (name: string) => {
			const saved = savedFilters[name];
			if (saved) {
				onFiltersChange(saved);
			}
		};

		// Animation variants
		const expandVariants = {
			collapsed: { height: 0, opacity: 0 },
			expanded: {
				height: 'auto',
				opacity: 1,
				transition: {
					height: { duration: 0.3 },
					opacity: { duration: 0.2, delay: 0.1 }
				}
			}
		};

		const quickFilterVariants = {
			hidden: { opacity: 0, scale: 0.9 },
			visible: (i: number) => ({
				opacity: 1,
				scale: 1,
				transition: {
					delay: i * 0.05,
					duration: 0.2
				}
			})
		};

		// Compact mobile layout
		if (compact || isMobile) {
			return (
				<div className={cn('bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4', className)}>
					{/* Quick Controls */}
					<div className="flex items-center gap-2 mb-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
								<Input
									placeholder="Search threads..."
									value={filters.search || ''}
									onChange={(e) => updateFilter('search', e.target.value)}
									className="pl-10 bg-zinc-800/50 border-zinc-700/50"
								/>
							</div>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsExpanded(!isExpanded)}
							className={cn('relative', activeFilterCount > 0 && 'border-emerald-500/50')}
						>
							<Filter className="h-4 w-4" />
							{activeFilterCount > 0 && (
								<Badge
									variant="destructive"
									className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
								>
									{activeFilterCount}
								</Badge>
							)}
						</Button>
					</div>

					{/* Sort Selection */}
					<div className="mb-4">
						<Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
							<SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700/50">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<div className="flex items-center gap-2">
											<option.icon className="h-4 w-4" />
											{option.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Quick Filter Pills */}
					<div className="flex gap-2 mb-4 overflow-x-auto">
						{quickFilters.map((preset, index) => (
							<motion.button
								key={preset.name}
								custom={index}
								variants={quickFilterVariants}
								initial="hidden"
								animate="visible"
								onClick={() => onFiltersChange(preset.filters)}
								className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 text-zinc-300 rounded-lg text-sm whitespace-nowrap hover:bg-zinc-700/50 transition-colors"
							>
								<preset.icon className="h-3 w-3" />
								{preset.name}
							</motion.button>
						))}
					</div>

					{/* Expanded Filters */}
					<AnimatePresence>
						{isExpanded && (
							<motion.div
								variants={expandVariants}
								initial="collapsed"
								animate="expanded"
								exit="collapsed"
								className="space-y-4 border-t border-zinc-800/50 pt-4"
							>
								{/* Tags */}
								{availableTags.length > 0 && (
									<div>
										<Label className="text-sm font-medium text-zinc-300 mb-2 block">Tags</Label>
										<Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-start bg-zinc-800/50 border-zinc-700/50"
												>
													{filters.tags.length > 0 ? (
														<div className="flex gap-1 flex-wrap">
															{filters.tags.slice(0, 2).map((tagId) => {
																const tag = availableTags.find((t) => t.id === tagId);
																return tag ? (
																	<Badge key={tagId} variant="secondary" className="text-xs">
																		{tag.name}
																	</Badge>
																) : null;
															})}
															{filters.tags.length > 2 && (
																<Badge variant="secondary" className="text-xs">
																	+{filters.tags.length - 2}
																</Badge>
															)}
														</div>
													) : (
														<span className="text-zinc-400">Select tags...</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full p-0">
												<Command>
													<CommandInput placeholder="Search tags..." />
													<CommandEmpty>No tags found.</CommandEmpty>
													<CommandGroup className="max-h-64 overflow-y-auto">
														{availableTags.map((tag) => (
															<CommandItem
																key={tag.id}
																onSelect={() => {
																	const isSelected = filters.tags.includes(tag.id);
																	if (isSelected) {
																		updateFilter(
																			'tags',
																			filters.tags.filter((id) => id !== tag.id)
																		);
																	} else {
																		updateFilter('tags', [...filters.tags, tag.id]);
																	}
																}}
															>
																<div className="flex items-center justify-between w-full">
																	<span>{tag.name}</span>
																	{filters.tags.includes(tag.id) && <X className="h-3 w-3" />}
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
								)}

								{/* Advanced Filters */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-sm">Solved Status</Label>
										<Select
											value={filters.solved || 'all'}
											onValueChange={(value) => updateFilter('solved', value as any)}
										>
											<SelectTrigger className="w-32">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All</SelectItem>
												<SelectItem value="solved">Solved</SelectItem>
												<SelectItem value="unsolved">Unsolved</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<Label className="text-sm">Time Range</Label>
										<Select
											value={filters.timeRange || 'all'}
											onValueChange={(value) => updateFilter('timeRange', value as any)}
										>
											<SelectTrigger className="w-32">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{timeRangeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2 pt-2">
									<Button variant="outline" size="sm" onClick={clearAllFilters} className="flex-1">
										<RotateCcw className="h-3 w-3 mr-2" />
										Clear
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={saveCurrentFilters}
										className="flex-1"
									>
										<Save className="h-3 w-3 mr-2" />
										Save
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			);
		}

		// Full desktop layout
		return (
			<div className={cn('bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6', className)}>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-white flex items-center gap-2">
						<SlidersHorizontal className="h-5 w-5 text-emerald-400" />
						Thread Filters
					</h3>
					{activeFilterCount > 0 && (
						<Badge
							variant="outline"
							className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
						>
							{activeFilterCount} active
						</Badge>
					)}
				</div>

				{/* Search */}
				<div className="mb-6">
					<Label className="text-sm font-medium text-zinc-300 mb-2 block">Search</Label>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
						<Input
							placeholder="Search threads..."
							value={filters.search || ''}
							onChange={(e) => updateFilter('search', e.target.value)}
							className="pl-10 bg-zinc-800/50 border-zinc-700/50"
						/>
					</div>
				</div>

				{/* Sort */}
				<div className="mb-6">
					<Label className="text-sm font-medium text-zinc-300 mb-2 block">Sort By</Label>
					<Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
						<SelectTrigger className="w-full bg-zinc-800/50 border-zinc-700/50">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<div className="flex items-center gap-2">
										<option.icon className="h-4 w-4" />
										{option.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Quick Filters */}
				<div className="mb-6">
					<Label className="text-sm font-medium text-zinc-300 mb-3 block">Quick Filters</Label>
					<div className="grid grid-cols-2 gap-2">
						{quickFilters.map((preset, index) => (
							<motion.button
								key={preset.name}
								custom={index}
								variants={quickFilterVariants}
								initial="hidden"
								animate="visible"
								onClick={() => onFiltersChange(preset.filters)}
								className="flex items-center gap-2 p-3 bg-zinc-800/50 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700/50 transition-colors"
							>
								<preset.icon className="h-4 w-4" />
								{preset.name}
							</motion.button>
						))}
					</div>
				</div>

				{/* Advanced Filters */}
				<div className="space-y-4 border-t border-zinc-800/50 pt-6">
					<h4 className="text-sm font-medium text-zinc-300">Advanced Filters</h4>

					{/* Toggle Filters */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-sm">My Threads</Label>
							<Switch
								checked={filters.mine || false}
								onCheckedChange={(checked) => updateFilter('mine', checked)}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label className="text-sm">Bookmarked</Label>
							<Switch
								checked={filters.bookmarked || false}
								onCheckedChange={(checked) => updateFilter('bookmarked', checked)}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label className="text-sm">Threads I Replied To</Label>
							<Switch
								checked={filters.replied || false}
								onCheckedChange={(checked) => updateFilter('replied', checked)}
							/>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 mt-6 pt-4 border-t border-zinc-800/50">
					<Button variant="outline" onClick={clearAllFilters} className="flex-1">
						<RotateCcw className="h-4 w-4 mr-2" />
						Clear All
					</Button>
					<Button variant="outline" onClick={saveCurrentFilters} className="flex-1">
						<Save className="h-4 w-4 mr-2" />
						Save Preset
					</Button>
				</div>
			</div>
		);
	}
);

SmartThreadFilters.displayName = 'SmartThreadFilters';

export default SmartThreadFilters;
