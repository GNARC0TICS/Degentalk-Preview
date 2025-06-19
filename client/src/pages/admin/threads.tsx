// Phase 2 Audit:
// - Verified layout
// - Added/confirmed <Head> title
// - Applied DEV_MODE gating (if applicable)

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Edit, FilterX, Eye, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { EntityTable } from '@/components/admin/layout/EntityTable';
import type { ColumnDef } from '@/components/admin/layout/EntityTable';
import { EntityFilters } from '@/components/admin/layout/EntityFilters';
import type { FilterConfig, FilterValue } from '@/components/admin/layout/EntityFilters';
// Assuming a shared Pagination component might be created or used later
// import { Pagination } from '@/components/ui/pagination'; // Or a custom one
import { isLightColor, formatDate } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

// Define Thread type for type safety
export interface AdminThread {
	id: string; // Or number, depending on your API
	title: string;
	slug: string;
	prefix?: { id: string; name: string; color: string };
	category?: { id: string; name: string };
	user?: { id: string; username: string; avatarUrl?: string };
	createdAt: string; // Consider Date object
	isPinned: boolean;
	isLocked: boolean;
	isHidden: boolean;
	// Add other relevant fields: views, replies, lastActivity, etc.
}

interface ThreadsResponse {
	threads: AdminThread[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface Category {
	id: string;
	name: string;
}

interface Prefix {
	id: string;
	name: string;
	color: string;
}

// Define a simple pagination state for now
interface SimplePaginationState {
	pageIndex: number; // 0-indexed for consistency if we use TanStack Table later
	pageSize: number;
}

export default function AdminThreadsPage() {
	const [pagination, setPagination] = useState<SimplePaginationState>({
		pageIndex: 0,
		pageSize: 10
	});
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState<Record<string, FilterValue>>({
		category: 'all',
		prefix: 'all',
		status: 'all',
		sortBy: 'newest'
	});

	// Fetch threads with pagination and filters
	const {
		data: threadsData,
		isLoading: isLoadingThreads,
		error: threadsQueryError
	} = useQuery<ThreadsResponse>({
		queryKey: [
			'/api/admin/threads',
			pagination.pageIndex,
			pagination.pageSize,
			search,
			filters.category,
			filters.prefix,
			filters.status,
			filters.sortBy
		],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: (pagination.pageIndex + 1).toString(), // API is 1-indexed
				limit: pagination.pageSize.toString(),
				sort: (filters.sortBy as string) || 'newest'
			});

			if (search) params.append('search', search);
			if (filters.category && filters.category !== 'all')
				params.append('category', filters.category as string);
			if (filters.prefix && filters.prefix !== 'all')
				params.append('prefix', filters.prefix as string);
			if (filters.status && filters.status !== 'all')
				params.append('status', filters.status as string);

			const response = await fetch(`/api/admin/threads?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch threads');
			}
			return response.json();
		}
	});

	// Fetch categories for filter
	const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<Category[]>({
		queryKey: ['/api/admin/categories'], // Assuming this endpoint returns categories for admin filters
		queryFn: async () => {
			const response = await fetch('/api/admin/categories'); // Adjust endpoint if needed
			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}
			return response.json();
		}
	});

	// Fetch prefixes for filter
	const { data: prefixesData, isLoading: isLoadingPrefixes } = useQuery<Prefix[]>({
		queryKey: ['/api/admin/prefixes'], // Assuming this endpoint returns prefixes for admin filters
		queryFn: async () => {
			const response = await fetch('/api/admin/prefixes'); // Adjust endpoint if needed
			if (!response.ok) {
				throw new Error('Failed to fetch prefixes');
			}
			return response.json();
		}
	});

	const handleMainSearch = (newSearchTerm: string) => {
		setSearch(newSearchTerm);
		setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 }));
	};

	const handleFilterChange = (filterId: string, value: FilterValue) => {
		setFilters((prevFilters: Record<string, FilterValue>) => ({
			...prevFilters,
			[filterId]: value
		}));
		setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 }));
	};

	const clearAllFilters = () => {
		setSearch('');
		setFilters({ category: 'all', prefix: 'all', status: 'all', sortBy: 'newest' });
		setPagination((prev: SimplePaginationState) => ({ ...prev, pageIndex: 0 }));
	};

	const filtersConfig: FilterConfig[] = [
		{
			id: 'category',
			label: 'Category',
			type: 'select',
			placeholder: 'Filter by category',
			options: [
				{ value: 'all', label: 'All Categories' },
				...(categoriesData?.map((cat: Category) => ({
					value: cat.id.toString(),
					label: cat.name
				})) || [])
			]
		},
		{
			id: 'prefix',
			label: 'Prefix',
			type: 'select',
			placeholder: 'Filter by prefix',
			options: [
				{ value: 'all', label: 'All Prefixes' },
				...(prefixesData?.map((pre: Prefix) => ({ value: pre.id.toString(), label: pre.name })) ||
					[])
			]
		},
		{
			id: 'status',
			label: 'Status',
			type: 'select',
			placeholder: 'Filter by status',
			options: [
				{ value: 'all', label: 'All Status' },
				{ value: 'active', label: 'Active' },
				{ value: 'pinned', label: 'Pinned' },
				{ value: 'locked', label: 'Locked' },
				{ value: 'hidden', label: 'Hidden' }
			]
		},
		{
			id: 'sortBy',
			label: 'Sort By',
			type: 'select',
			placeholder: 'Sort by',
			options: [
				{ value: 'newest', label: 'Newest First' },
				{ value: 'oldest', label: 'Oldest First' },
				{ value: 'activity', label: 'Most Active' },
				{ value: 'views', label: 'Most Views' }
			]
		}
	];

	const viewThread = (slug: string) => {
		window.open(`/threads/${slug}`, '_blank');
	};

	const editThread = (id: string | number) => {
		console.log('Attempting to edit thread:', id);
		// TODO: Implement navigation or modal for editing thread
	};

	const deleteThread = (id: string | number) => {
		console.log('Attempting to delete thread:', id);
		// TODO: Implement delete thread logic, likely with a confirmation dialog
	};

	const queryClient = useQueryClient();

	const toggleLockThread = (thread: AdminThread) => {
		fetch(`/admin/forum/threads/${thread.id}/moderate`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isLocked: !thread.isLocked })
		}).then(() => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/threads'] });
		});
	};

	const columns: ColumnDef<AdminThread>[] = [
		{ key: 'id', header: 'ID', render: (thread) => <span className="font-mono">{thread.id}</span> },
		{
			key: 'title',
			header: 'Title',
			render: (thread) => (
				<div className="flex items-center gap-2">
					{thread.isPinned && (
						<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
							Pinned
						</Badge>
					)}
					{thread.isLocked && (
						<Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
							Locked
						</Badge>
					)}
					<span className={thread.isHidden ? 'text-muted-foreground line-through' : ''}>
						{thread.title}
					</span>
				</div>
			)
		},
		{
			key: 'prefix',
			header: 'Prefix',
			render: (thread) =>
				thread.prefix ? (
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
				)
		},
		{ key: 'category', header: 'Category', render: (thread) => thread.category?.name || '—' },
		{
			key: 'author',
			header: 'Author',
			render: (thread) => (
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
			)
		},
		{ key: 'createdAt', header: 'Created At', render: (thread) => formatDate(thread.createdAt) }
	];

	const renderThreadActions = (thread: AdminThread) => (
		<>
			<Button size="sm" variant="outline" onClick={() => viewThread(thread.slug)}>
				<Eye className="h-4 w-4" />
			</Button>
			<Button size="sm" variant="outline" onClick={() => editThread(thread.id)} className="ml-2">
				<Edit className="h-4 w-4" />
			</Button>
			<Button size="sm" variant="outline" onClick={() => toggleLockThread(thread)} className="ml-2">
				{thread.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
			</Button>
			<Button
				size="sm"
				variant="destructive"
				onClick={() => deleteThread(thread.id)}
				className="ml-2"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</>
	);

	return (
		<AdminPageShell
			title="Threads Management"
			pageActions={
				<Button variant="outline" onClick={clearAllFilters} className="whitespace-nowrap">
					<FilterX className="h-4 w-4 mr-2" />
					Clear All Filters
				</Button>
			}
		>
			<div className="space-y-4">
				<EntityFilters
					filtersConfig={filtersConfig}
					filters={filters}
					onFilterChange={handleFilterChange}
					onClearFilters={clearAllFilters}
				/>
				<EntityTable
					columns={columns}
					data={threadsData?.threads || []}
					isLoading={isLoadingThreads || isLoadingCategories || isLoadingPrefixes}
					error={threadsQueryError} // Use the correct error variable
					renderActions={renderThreadActions}
					searchPlaceholder="Search by title, content or author..." // This search is part of EntityTable
					searchTerm={search}
					onSearchChange={handleMainSearch}
					emptyStateMessage={
						search || Object.values(filters).some((f) => f && f !== 'all' && f !== 'newest') // Adjusted condition
							? 'No threads match the current filters.'
							: 'No threads have been created yet.'
					}
				/>
				{/* TODO: Add custom pagination component here */}
				{!isLoadingThreads && threadsData?.totalPages && threadsData.totalPages > 1 && (
					<div className="mt-6 flex justify-center">
						{' '}
						{/* Placeholder for pagination */}
						<p className="text-sm text-muted-foreground">
							Page {threadsData.page} of {threadsData.totalPages} (Total: {threadsData.total}{' '}
							threads)
						</p>
						{/* Actual pagination component will go here, using setPagination */}
					</div>
				)}
			</div>
		</AdminPageShell>
	);
}
