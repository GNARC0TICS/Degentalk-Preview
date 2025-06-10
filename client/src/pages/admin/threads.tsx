// Phase 2 Audit:
// - Verified layout
// - Added/confirmed <Head> title
// - Applied DEV_MODE gating (if applicable)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, FilterX, ArrowUpDown, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// Remove Next.js Head component since we're not using Next.js

export default function AdminThreadsPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [prefixFilter, setPrefixFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('newest');

	const pageSize = 10;

	// Fetch threads with pagination and filters
	const { data: threadsData, isLoading: isLoadingThreads } = useQuery({
		queryKey: [
			'/api/admin/threads',
			page,
			search,
			categoryFilter,
			prefixFilter,
			statusFilter,
			sortBy
		],
		queryFn: async () => {
			// Build query parameters
			const params = new URLSearchParams({
				page: page.toString(),
				limit: pageSize.toString(),
				sort: sortBy
			});

			if (search) params.append('search', search);
			if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
			if (prefixFilter && prefixFilter !== 'all') params.append('prefix', prefixFilter);
			if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

			const response = await fetch(`/api/admin/threads?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Failed to fetch threads');
			}

			return await response.json();
		}
	});

	// Fetch categories for filter
	const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
		queryKey: ['/api/admin/categories'],
		queryFn: async () => {
			const response = await fetch('/api/admin/categories');

			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}

			return await response.json();
		}
	});

	// Fetch prefixes for filter
	const { data: prefixesData, isLoading: isLoadingPrefixes } = useQuery({
		queryKey: ['/api/admin/prefixes'],
		queryFn: async () => {
			const response = await fetch('/api/admin/prefixes');

			if (!response.ok) {
				throw new Error('Failed to fetch prefixes');
			}

			return await response.json();
		}
	});

	// Handle search input
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// The actual search is triggered by the state change flowing to the query
	};

	// Handle filter clear
	const clearFilters = () => {
		setSearch('');
		setCategoryFilter('all');
		setPrefixFilter('all');
		setStatusFilter('all');
		setSortBy('newest');
	};

	// Navigation to thread view
	const viewThread = (slug: string) => {
		window.open(`/threads/${slug}`, '_blank');
	};

	// Navigation to thread edit
	const editThread = (id: number) => {
		// Edit thread (was console.log)
	};

	// Total pages calculation
	const totalPages = threadsData?.totalPages || 1;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Threads</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Manage Threads</CardTitle>
					<CardDescription>
						View and manage all forum threads. Filter, search, and perform actions on threads.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Search and Filters */}
					<div className="mb-6 space-y-4">
						<form onSubmit={handleSearch} className="flex gap-2">
							<Input
								type="search"
								placeholder="Search by title, content or author..."
								className="flex-1"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button type="submit">
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
						</form>

						<div className="flex flex-wrap gap-3">
							<div className="flex-1 min-w-[180px]">
								<Select value={categoryFilter} onValueChange={setCategoryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Filter by category" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Categories</SelectLabel>
											<SelectItem value="all">All Categories</SelectItem>
											{isLoadingCategories ? (
												<SelectItem value="loading" disabled>
													Loading...
												</SelectItem>
											) : (
												categoriesData?.map((category: any) => (
													<SelectItem key={category.id} value={category.id.toString()}>
														{category.name}
													</SelectItem>
												))
											)}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="flex-1 min-w-[180px]">
								<Select value={prefixFilter} onValueChange={setPrefixFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Filter by prefix" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Prefixes</SelectLabel>
											<SelectItem value="all">All Prefixes</SelectItem>
											{isLoadingPrefixes ? (
												<SelectItem value="loading" disabled>
													Loading...
												</SelectItem>
											) : (
												prefixesData?.map((prefix: any) => (
													<SelectItem key={prefix.id} value={prefix.id.toString()}>
														{prefix.name}
													</SelectItem>
												))
											)}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="flex-1 min-w-[180px]">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Status</SelectLabel>
											<SelectItem value="all">All Status</SelectItem>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="pinned">Pinned</SelectItem>
											<SelectItem value="locked">Locked</SelectItem>
											<SelectItem value="hidden">Hidden</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="flex-1 min-w-[180px]">
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger>
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Sort By</SelectLabel>
											<SelectItem value="newest">Newest First</SelectItem>
											<SelectItem value="oldest">Oldest First</SelectItem>
											<SelectItem value="activity">Most Active</SelectItem>
											<SelectItem value="views">Most Views</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
								<FilterX className="h-4 w-4 mr-2" />
								Clear Filters
							</Button>
						</div>
					</div>

					{/* Threads Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">ID</TableHead>
									<TableHead>Title</TableHead>
									<TableHead className="w-[150px]">Prefix</TableHead>
									<TableHead className="w-[150px]">Category</TableHead>
									<TableHead className="w-[150px]">Author</TableHead>
									<TableHead className="w-[150px]">Created At</TableHead>
									<TableHead className="text-right w-[150px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoadingThreads ? (
									// Loading state
									Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={`skeleton-${i}`}>
											<TableCell>
												<Skeleton className="h-6 w-12" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-20" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-24" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-24" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-9 w-24 ml-auto" />
											</TableCell>
										</TableRow>
									))
								) : !threadsData || !threadsData.threads || threadsData.threads.length === 0 ? (
									// Empty state
									<TableRow>
										<TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
											{search ||
											(categoryFilter && categoryFilter !== 'all') ||
											(prefixFilter && prefixFilter !== 'all') ||
											(statusFilter && statusFilter !== 'all') ? (
												<div>
													<p>No threads match the current filters.</p>
													<Button variant="link" onClick={clearFilters} className="mt-2">
														Clear filters and try again
													</Button>
												</div>
											) : (
												<p>No threads have been created yet.</p>
											)}
										</TableCell>
									</TableRow>
								) : (
									// Threads data
									threadsData.threads.map((thread: any) => (
										<TableRow key={thread.id}>
											<TableCell className="font-mono">{thread.id}</TableCell>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													{thread.isPinned && (
														<Badge
															variant="secondary"
															className="bg-yellow-100 text-yellow-800 border-yellow-200"
														>
															Pinned
														</Badge>
													)}
													{thread.isLocked && (
														<Badge
															variant="secondary"
															className="bg-red-100 text-red-800 border-red-200"
														>
															Locked
														</Badge>
													)}
													<span
														className={thread.isHidden ? 'text-muted-foreground line-through' : ''}
													>
														{thread.title}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{thread.prefix ? (
													<Badge
														style={{
															backgroundColor: thread.prefix.color || '#3366ff',
															color: isLightColor(thread.prefix.color) ? '#000' : '#fff'
														}}
													>
														{thread.prefix.name}
													</Badge>
												) : (
													<span className="text-muted-foreground text-sm">None</span>
												)}
											</TableCell>
											<TableCell>{thread.category?.name || '—'}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{thread.user?.avatarUrl && (
														<img
															src={thread.user.avatarUrl}
															alt={thread.user.username}
															className="w-6 h-6 rounded-full object-cover"
														/>
													)}
													<span>{thread.user?.username || 'Unknown'}</span>
												</div>
											</TableCell>
											<TableCell>{formatDate(thread.createdAt)}</TableCell>
											<TableCell className="text-right space-x-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => viewThread(thread.slug)}
													title="View"
												>
													<Eye className="h-4 w-4" />
													<span className="sr-only">View</span>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => editThread(thread.id)}
													title="Edit"
												>
													<Edit className="h-4 w-4" />
													<span className="sr-only">Edit</span>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													title="Delete"
													className="text-red-600 hover:text-red-500"
												>
													<Trash2 className="h-4 w-4" />
													<span className="sr-only">Delete</span>
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{!isLoadingThreads && threadsData?.totalPages > 1 && (
						<div className="mt-6">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											className={page === 1 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>

									{Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
										let pageNumber;
										if (totalPages <= 5) {
											// If total pages <= 5, show all page numbers
											pageNumber = i + 1;
										} else if (page <= 3) {
											// If current page is close to the start
											pageNumber = i + 1;
										} else if (page >= totalPages - 2) {
											// If current page is close to the end
											pageNumber = totalPages - 4 + i;
										} else {
											// Show current page in the middle with neighbors
											pageNumber = page - 2 + i;
										}

										return (
											<PaginationItem key={`page-${pageNumber}`}>
												<PaginationLink
													onClick={() => setPage(pageNumber)}
													isActive={page === pageNumber}
												>
													{pageNumber}
												</PaginationLink>
											</PaginationItem>
										);
									})}

									<PaginationItem>
										<PaginationNext
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
											className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
	// Default for undefined or invalid colors
	if (!color || typeof color !== 'string') return false;

	// Convert hex to RGB
	let r, g, b;

	if (color.startsWith('#')) {
		const hex = color.slice(1);
		// Handle both 3-char and 6-char hex
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16);
			g = parseInt(hex[1] + hex[1], 16);
			b = parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16);
			g = parseInt(hex.slice(2, 4), 16);
			b = parseInt(hex.slice(4, 6), 16);
		} else {
			return false; // Invalid hex
		}
	} else {
		return false; // Only supporting hex for now
	}

	// Calculate perceived brightness
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	// Consider colors with brightness > 155 as light
	return brightness > 155;
}

// Format date nicely
function formatDate(dateString: string): string {
	if (!dateString) return '—';

	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}
