import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react'; // Removed ArrowUpDown
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge as UiBadge } from '@/components/ui/badge'; // Renamed to avoid conflict
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Tabs components are now handled by AdminPageShell
import { useDebounce } from '@/hooks/use-debounce';
import { apiRequest } from '@/lib/queryClient';
import { useCrudMutation } from '@/hooks/useCrudMutation';

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { EntityTable } from '@/components/admin/layout/EntityTable';
import {
	BadgeFormDialogComponent,
	DeleteBadgeConfirmationDialog,
	getBadgeRarityDisplay
} from '@/components/admin/forms/xp/BadgeFormDialogs';
import type { Badge, BadgeFormData } from '@/components/admin/forms/xp/BadgeFormDialogs';

// Extended Badge type for this page, including createdAt
interface PageBadge extends Badge {
	createdAt: string;
}

// API response structure (assuming pagination)
interface BadgesApiResponse {
	badges: PageBadge[];
	totalPages: number;
	currentPage: number;
	totalBadges: number;
	// For stats tab
	badgesAwarded?: number;
	mostCommonBadge?: { name: string };
	rarestBadge?: { name: string };
}

export default function BadgeManagementPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const [selectedBadge, setSelectedBadge] = useState<PageBadge | null>(null);
	const [formData, setFormData] = useState<BadgeFormData>({
		name: '',
		description: '',
		iconUrl: '',
		rarity: 'common'
	});

	const [sortField] = useState<'name' | 'rarity' | 'createdAt'>('createdAt'); // setSortField removed
	const [sortDirection] = useState<'asc' | 'desc'>('desc'); // setSortDirection removed
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const {
		data: badgesApiResponse,
		isLoading,
		isError,
		error
	} = useQuery<BadgesApiResponse>({
		queryKey: [
			'/api/admin/badges',
			{ search: debouncedSearchTerm, sort: sortField, direction: sortDirection, page, pageSize }
		],
		queryFn: async () => {
			// Ensure apiRequest can handle query params or construct URL manually
			const params = new URLSearchParams({
				search: debouncedSearchTerm,
				sort: sortField,
				direction: sortDirection,
				page: page.toString(),
				pageSize: pageSize.toString()
			});
			return apiRequest({ url: `/api/admin/badges?${params.toString()}`, method: 'GET' });
		}
	});

	const badges = badgesApiResponse?.badges || [];

	const resetFormAndCloseDialogs = () => {
		setFormData({ name: '', description: '', iconUrl: '', rarity: 'common' });
		setSelectedBadge(null);
		setIsCreateDialogOpen(false);
		setIsEditDialogOpen(false);
	};

	const createBadgeMutation = useCrudMutation<unknown, Error, BadgeFormData>({
		mutationFn: (data) => apiRequest({ url: '/api/admin/badges', method: 'POST', data }),
		queryKeyToInvalidate: ['/api/admin/badges'],
		successMessage: 'Badge created',
		errorMessage: 'Failed to create badge.',
		onSuccessCallback: () => {
			resetFormAndCloseDialogs();
		}
	});

	const updateBadgeMutation = useCrudMutation<unknown, Error, { id: number; data: BadgeFormData }>({
		mutationFn: ({ id, data }) =>
			apiRequest({ url: `/api/admin/badges/${id}`, method: 'PUT', data }),
		queryKeyToInvalidate: ['/api/admin/badges'],
		successMessage: 'Badge updated',
		errorMessage: 'Failed to update badge.',
		onSuccessCallback: () => {
			resetFormAndCloseDialogs();
		}
	});

	const deleteBadgeMutation = useCrudMutation<unknown, Error, number>({
		mutationFn: (id) => apiRequest({ url: `/api/admin/badges/${id}`, method: 'DELETE' }),
		queryKeyToInvalidate: ['/api/admin/badges'],
		successMessage: 'Badge deleted',
		errorMessage: 'Failed to delete badge.',
		onSuccessCallback: () => {
			setIsDeleteDialogOpen(false);
			setSelectedBadge(null);
		}
	});

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditDialogOpen && selectedBadge) {
			updateBadgeMutation.mutate({ id: selectedBadge.id, data: formData });
		} else {
			createBadgeMutation.mutate(formData);
		}
	};

	const handleOpenCreateDialog = () => {
		resetFormAndCloseDialogs(); // Ensure form is clean
		setIsCreateDialogOpen(true);
	};

	const handleOpenEditDialog = (badge: PageBadge) => {
		setSelectedBadge(badge);
		setFormData({
			name: badge.name,
			description: badge.description || '',
			iconUrl: badge.iconUrl,
			rarity: badge.rarity
		});
		setIsEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (badge: PageBadge) => {
		setSelectedBadge(badge);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (selectedBadge) {
			deleteBadgeMutation.mutate(selectedBadge.id);
		}
	};

	// const handleSort = (field: 'name' | 'rarity' | 'createdAt') => { // Sorting handled by backend/API query params
	//   if (sortField === field) {
	//     setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
	//   } else {
	//     setSortField(field);
	//     setSortDirection('asc');
	//   }
	//   setPage(1); // Reset to first page on sort change
	// };

	const columns = [
		{
			key: 'iconUrl',
			header: 'Icon',
			render: (badge: PageBadge) => (
				<img
					src={badge.iconUrl}
					alt={badge.name}
					className="w-10 h-10 object-contain border border-slate-700 rounded"
					onError={(e) =>
						((e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Err')
					}
				/>
			)
		},
		{ key: 'name', header: 'Name' },
		{
			key: 'description',
			header: 'Description',
			render: (badge: PageBadge) => (
				<span className="block max-w-[300px] truncate">{badge.description}</span>
			)
		},
		{
			key: 'rarity',
			header: 'Rarity',
			render: (badge: PageBadge) => {
				const rarityDisplay = getBadgeRarityDisplay(badge.rarity);
				return (
					<UiBadge className={`${rarityDisplay.colorClass} hover:${rarityDisplay.colorClass}`}>
						{rarityDisplay.label}
					</UiBadge>
				);
			}
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (badge: PageBadge) => new Date(badge.createdAt).toLocaleDateString()
		}
	];

	const pageActions = (
		<Button onClick={handleOpenCreateDialog}>
			<Plus className="mr-2 h-4 w-4" /> Create Badge
		</Button>
	);

	const allBadgesTabContent = (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
					<CardTitle>All Badges</CardTitle>
					<div className="relative w-full sm:w-72">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search badges..."
							className="pl-8 bg-admin-input-bg border-admin-input-border"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<EntityTable<PageBadge>
					columns={columns}
					data={badges}
					isLoading={isLoading}
					isError={isError}
					error={error}
					emptyStateMessage="No badges found. Click 'Create Badge' to add one."
					renderActions={(badge) => (
						<div className="flex justify-end gap-2">
							<Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(badge)}>
								<Pencil className="h-4 w-4 mr-1" /> Edit
							</Button>
							<Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(badge)}>
								<Trash2 className="h-4 w-4 mr-1" /> Delete
							</Button>
						</div>
					)}
				/>
				{badgesApiResponse?.totalPages && badgesApiResponse.totalPages > 1 && (
					<div className="flex items-center justify-end gap-2 p-4 border-t border-admin-border-subtle">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1 || isLoading}
						>
							Previous
						</Button>
						<span className="text-sm text-admin-text-secondary">
							Page {badgesApiResponse.currentPage || page} of {badgesApiResponse.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(badgesApiResponse.totalPages, p + 1))}
							disabled={page === badgesApiResponse.totalPages || isLoading}
						>
							Next
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);

	const statisticsTabContent = (
		<Card>
			<CardHeader>
				<CardTitle>Badge Statistics</CardTitle>
				<CardDescription>Overview of badge distribution and usage.</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <p>Loading statistics...</p>}
				{isError && <p className="text-destructive">Error loading statistics.</p>}
				{!isLoading && !isError && badgesApiResponse && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4">
								<div className="text-sm font-medium text-admin-text-secondary">Total Badges</div>
								<div className="text-2xl font-bold mt-1">{badgesApiResponse.totalBadges || 0}</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="text-sm font-medium text-admin-text-secondary">Badges Awarded</div>
								<div className="text-2xl font-bold mt-1">
									{badgesApiResponse.badgesAwarded || 0}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="text-sm font-medium text-admin-text-secondary">Most Common</div>
								<div className="text-2xl font-bold mt-1">
									{badgesApiResponse.mostCommonBadge?.name || 'N/A'}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="text-sm font-medium text-admin-text-secondary">Rarest</div>
								<div className="text-2xl font-bold mt-1">
									{badgesApiResponse.rarestBadge?.name || 'N/A'}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</CardContent>
		</Card>
	);

	const tabsConfig = [
		{ value: 'all-badges', label: 'All Badges', content: allBadgesTabContent },
		{ value: 'statistics', label: 'Statistics', content: statisticsTabContent }
	];

	return (
		<AdminPageShell title="Badge Management" pageActions={pageActions} tabsConfig={tabsConfig}>
			{/* Content is now handled by tabsConfig. If no tabs, direct children would go here. */}
			<BadgeFormDialogComponent
				isOpen={isCreateDialogOpen || isEditDialogOpen}
				setIsOpen={isEditDialogOpen ? setIsEditDialogOpen : setIsCreateDialogOpen}
				isEdit={!!selectedBadge}
				formData={formData}
				setFormData={setFormData}
				handleSubmit={handleFormSubmit}
				isSubmitting={createBadgeMutation.isPending || updateBadgeMutation.isPending}
			/>
			<DeleteBadgeConfirmationDialog
				isOpen={isDeleteDialogOpen}
				setIsOpen={setIsDeleteDialogOpen}
				badge={selectedBadge}
				onConfirmDelete={confirmDelete}
				isDeleting={deleteBadgeMutation.isPending}
			/>
		</AdminPageShell>
	);
}
