import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/utils/utils';
import type { Tag } from '@/types/forum';
import type { TagId, PrefixId, ThreadId } from '@shared/types/ids';
import { createTagId, createPrefixId } from '@shared/src/utils/ids';

export type ThreadSortOption =
	| 'latest'
	| 'hot'
	| 'staked'
	| 'most-liked'
	| 'most-replied'
	| 'oldest';

export interface ThreadFiltersState {
	sortBy: ThreadSortOption;
	tags: string[];
	prefixId?: PrefixId;
	solved?: 'solved' | 'unsolved';
	bookmarked?: boolean;
	mine?: boolean;
	replied?: boolean;
	q?: string;
}

interface ThreadFiltersProps {
	availableTags?: Tag[];
	availablePrefixes?: Array<{ id: PrefixId; name: string; color: string }>;
	onFiltersChange: (filters: ThreadFiltersState) => void;
	forumSlug?: string;
	className?: string;
}

const sortOptions = [
	{ value: 'latest', label: 'Latest', icon: '🕐' },
	{ value: 'hot', label: 'Hot', icon: '🔥' },
	{ value: 'staked', label: 'Most Staked', icon: '💎' },
	{ value: 'most-liked', label: 'Most Liked', icon: '❤️' },
	{ value: 'most-replied', label: 'Most Replied', icon: '💬' },
	{ value: 'oldest', label: 'Oldest', icon: '📅' }
] as const;

export function ThreadFilters({
	availableTags = [],
	availablePrefixes = [],
	onFiltersChange,
	forumSlug = 'default',
	className
}: ThreadFiltersProps) {
	// Unique key for localStorage based on forum
	const storageKey = `thread-filters-${forumSlug}`;

	// Load saved filters from localStorage
	const [savedFilters, setSavedFilters] = useLocalStorage<ThreadFiltersState>(storageKey, {
		sortBy: 'latest',
		tags: [],
		prefixId: undefined,
		solved: undefined,
		bookmarked: false,
		mine: false,
		replied: false,
		q: ''
	});

	const [filters, setFilters] = useState<ThreadFiltersState>(savedFilters);
	const [tagSearchOpen, setTagSearchOpen] = useState(false);
	const [tagSearch, setTagSearch] = useState('');
	const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

	// Update parent component when filters change
	useEffect(() => {
		onFiltersChange(filters);
	}, [filters, onFiltersChange]);

	const updateFilter = <K extends keyof ThreadFiltersState>(
		key: K,
		value: ThreadFiltersState[K]
	) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const saveFilters = () => {
		setSavedFilters(filters);
	};

	const resetFilters = () => {
		const defaultFilters: ThreadFiltersState = {
			sortBy: 'latest',
			tags: [],
			prefixId: undefined,
			solved: undefined,
			bookmarked: false,
			mine: false,
			replied: false,
			q: ''
		};
		setFilters(defaultFilters);
		setSavedFilters(defaultFilters);
	};

	const toggleTag = (tagId: TagId) => {
		setFilters((prev) => ({
			...prev,
			tags: prev.tags.includes(tagId)
				? prev.tags.filter((id) => id !== tagId)
				: [...prev.tags, tagId]
		}));
	};

	const selectedTags = availableTags.filter((tag) => filters.tags.includes(createTagId(tag.id)));
	const selectedPrefix = availablePrefixes.find((p) => p.id === filters.prefixId);
	const currentSort = sortOptions.find((opt) => opt.value === filters.sortBy) || sortOptions[0];
	const hasActiveFilters =
		filters.tags.length > 0 ||
		filters.prefixId !== undefined ||
		filters.sortBy !== 'latest' ||
		filters.solved !== undefined ||
		filters.bookmarked ||
		filters.mine ||
		filters.replied ||
		(!!filters.q && filters.q.trim() !== '');

	// Desktop filters
	const DesktopFilters = () => (
		<div className={cn('flex items-center gap-3', className)}>
			{/* Sort Dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-2">
						<span>{currentSort.icon}</span>
						<span>{currentSort.label}</span>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-48">
					<DropdownMenuLabel>Sort Threads</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{sortOptions.map((option) => (
						<DropdownMenuItem
							key={option.value}
							onClick={() => updateFilter('sortBy', option.value)}
							className={cn('gap-2', filters.sortBy === option.value && 'bg-zinc-800')}
						>
							<span>{option.icon}</span>
							<span>{option.label}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Tag Filter */}
			{availableTags.length > 0 && (
				<Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Filter className="h-4 w-4" />
							Tags
							{selectedTags.length > 0 && (
								<Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
									{selectedTags.length}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-0" align="start">
						<Command>
							<CommandInput
								placeholder="Search tags..."
								value={tagSearch}
								onValueChange={setTagSearch}
							/>
							<CommandEmpty>No tags found.</CommandEmpty>
							<CommandGroup className="max-h-64 overflow-auto">
								{availableTags.map((tag) => (
									<CommandItem key={tag.id} onSelect={() => toggleTag(createTagId(tag.id))} className="gap-2">
										<div
											className={cn(
												'h-4 w-4 rounded border',
												filters.tags.includes(createTagId(tag.id))
													? 'bg-emerald-500 border-emerald-500'
													: 'border-zinc-600'
											)}
										/>
										<span>{tag.name}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			)}

			{/* Prefix Filter */}
			{availablePrefixes.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2">
							{selectedPrefix ? (
								<>
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: selectedPrefix.color }}
									/>
									{selectedPrefix.name}
								</>
							) : (
								<>Prefix</>
							)}
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-48">
						<DropdownMenuLabel>Filter by Prefix</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => updateFilter('prefixId', undefined)}>
							All Prefixes
						</DropdownMenuItem>
						{availablePrefixes.map((prefix) => (
							<DropdownMenuItem
								key={prefix.id}
								onClick={() => updateFilter('prefixId', prefix.id)}
								className="gap-2"
							>
								<div className="h-3 w-3 rounded-full" style={{ backgroundColor: prefix.color }} />
								{prefix.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{/* Active Filters Display */}
			{selectedTags.length > 0 && (
				<div className="flex items-center gap-1">
					{selectedTags.map((tag) => (
						<Badge
							key={tag.id}
							variant="secondary"
							className="gap-1 px-2 py-0.5 text-xs cursor-pointer hover:bg-zinc-700"
							onClick={() => toggleTag(createTagId(tag.id))}
						>
							{tag.name}
							<X className="h-3 w-3" />
						</Badge>
					))}
				</div>
			)}

			{/* Add search box in desktop filter row */}
			<Input
				placeholder="Search threads…"
				value={filters.q || ''}
				onChange={(e) => updateFilter('q', e.target.value)}
				className="w-48 h-9"
			/>

			{/* Toggle Solved */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-2">
						{filters.solved === 'solved'
							? 'Solved'
							: filters.solved === 'unsolved'
								? 'Unsolved'
								: 'Solved?'}
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-40">
					<DropdownMenuItem onClick={() => updateFilter('solved', undefined)}>Any</DropdownMenuItem>
					<DropdownMenuItem onClick={() => updateFilter('solved', 'solved')}>
						Solved
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => updateFilter('solved', 'unsolved')}>
						Unsolved
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Switches for bookmarked etc in desktop row */}
			<Button
				variant={filters.bookmarked ? 'default' : 'outline'}
				size="sm"
				onClick={() => updateFilter('bookmarked', !filters.bookmarked)}
			>
				🔖
			</Button>
			<Button
				variant={filters.mine ? 'default' : 'outline'}
				size="sm"
				onClick={() => updateFilter('mine', !filters.mine)}
			>
				🙋‍♂️
			</Button>
			<Button
				variant={filters.replied ? 'default' : 'outline'}
				size="sm"
				onClick={() => updateFilter('replied', !filters.replied)}
			>
				💬
			</Button>

			{/* Action Buttons */}
			<div className="flex items-center gap-2 ml-auto">
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-xs">
						<RotateCcw className="h-3 w-3" />
						Reset
					</Button>
				)}
				<Button variant="ghost" size="sm" onClick={saveFilters} className="gap-1 text-xs">
					<Save className="h-3 w-3" />
					Save
				</Button>
			</div>
		</div>
	);

	// Mobile filters
	const MobileFilters = () => (
		<Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" className="gap-2 w-full sm:hidden">
					<Filter className="h-4 w-4" />
					Filters
					{hasActiveFilters && (
						<Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
							Active
						</Badge>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent side="bottom" className="h-[85vh]">
				<SheetHeader>
					<SheetTitle>Filter Threads</SheetTitle>
					<SheetDescription>Customize how threads are displayed</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Sort Options */}
					<div>
						<h3 className="text-sm font-semibold mb-3">Sort By</h3>
						<div className="grid grid-cols-2 gap-2">
							{sortOptions.map((option) => (
								<Button
									key={option.value}
									variant={filters.sortBy === option.value ? 'default' : 'outline'}
									className="justify-start gap-2"
									onClick={() => updateFilter('sortBy', option.value)}
								>
									<span>{option.icon}</span>
									<span>{option.label}</span>
								</Button>
							))}
						</div>
					</div>

					{/* Tag Selection */}
					{availableTags.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold mb-3">Tags</h3>
							<Input
								placeholder="Search tags..."
								value={tagSearch}
								onChange={(e) => setTagSearch(e.target.value)}
								className="mb-3"
							/>
							<div className="space-y-1 max-h-48 overflow-y-auto">
								{availableTags
									.filter((tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase()))
									.map((tag) => (
										<Button
											key={tag.id}
											variant="ghost"
											className="w-full justify-start gap-2"
											onClick={() => toggleTag(createTagId(tag.id))}
										>
											<div
												className={cn(
													'h-4 w-4 rounded border',
													filters.tags.includes(createTagId(tag.id))
														? 'bg-emerald-500 border-emerald-500'
														: 'border-zinc-600'
												)}
											/>
											{tag.name}
										</Button>
									))}
							</div>
						</div>
					)}

					{/* Prefix Selection */}
					{availablePrefixes.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold mb-3">Prefix</h3>
							<div className="space-y-1">
								<Button
									variant={filters.prefixId === undefined ? 'default' : 'outline'}
									className="w-full justify-start"
									onClick={() => updateFilter('prefixId', undefined)}
								>
									All Prefixes
								</Button>
								{availablePrefixes.map((prefix) => (
									<Button
										key={prefix.id}
										variant={filters.prefixId === prefix.id ? 'default' : 'outline'}
										className="w-full justify-start gap-2"
										onClick={() => updateFilter('prefixId', prefix.id)}
									>
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: prefix.color }}
										/>
										{prefix.name}
									</Button>
								))}
							</div>
						</div>
					)}
				</div>

				<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t">
					<Button variant="outline" onClick={resetFilters} className="flex-1">
						Reset
					</Button>
					<Button
						onClick={() => {
							saveFilters();
							setIsMobileSheetOpen(false);
						}}
						className="flex-1"
					>
						Apply Filters
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);

	return (
		<>
			<div className="hidden sm:block">
				<DesktopFilters />
			</div>
			<div className="sm:hidden">
				<MobileFilters />
			</div>
		</>
	);
}
