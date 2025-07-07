import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowUpDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { apiRequest } from '@/lib/queryClient';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { TitleMediaInput } from '@/components/admin/forms/xp/TitleMediaInput';
import { MediaAsset } from '@/components/media/MediaAsset';

// Title types
interface Title {
	id: string;
	name: string;
	description: string | null;
	color: string;
	icon: string | null;
	rarity: string;
	category: string;
	requiredPath: string | null;
	requiredLevel: number | null;
	isHidden: boolean;
	createdAt: string;
}

interface TitleFormData {
	name: string;
	description: string;
	color: string;
	icon: string;
	mediaId?: Id<'media'> | null;
	rarity: string;
	category: string;
	requiredPath: string;
	requiredLevel: number | null;
	isHidden: boolean;
}

// Title rarity options
const RARITIES = [
	{ value: 'common', label: 'Common', color: 'bg-slate-500' },
	{ value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
	{ value: 'rare', label: 'Rare', color: 'bg-blue-500' },
	{ value: 'epic', label: 'Epic', color: 'bg-purple-500' },
	{ value: 'legendary', label: 'Legendary', color: 'bg-amber-500' },
	{ value: 'mythic', label: 'Mythic', color: 'bg-red-500' }
];

// Title categories
const CATEGORIES = [
	{ value: 'path', label: 'Path Progression' },
	{ value: 'achievement', label: 'Achievement' },
	{ value: 'event', label: 'Special Event' },
	{ value: 'seasonal', label: 'Seasonal' },
	{ value: 'purchase', label: 'Shop Purchase' },
	{ value: 'other', label: 'Other' }
];

// Path specializations
const PATHS = [
	{ value: 'trader', label: 'Trader' },
	{ value: 'developer', label: 'Developer' },
	{ value: 'analyst', label: 'Analyst' },
	{ value: 'educator', label: 'Educator' },
	{ value: 'community', label: 'Community Builder' },
	{ value: 'none', label: 'None' }
];

export default function TitleManagementPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 300);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
	const [formData, setFormData] = useState<TitleFormData>({
		name: '',
		description: '',
		color: '#ffffff',
		icon: '',
		mediaId: null,
		rarity: 'common',
		category: 'other',
		requiredPath: 'none',
		requiredLevel: null,
		isHidden: false
	});
	const [sortField, setSortField] = useState<'name' | 'rarity' | 'category' | 'createdAt'>(
		'createdAt'
	);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState(1);
	const pageSize = 10;

	// Fetch titles
	const {
		data: titlesData,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: [
			'/api/admin/titles',
			{ search: debouncedSearchTerm, sort: sortField, direction: sortDirection, page, pageSize }
		],
		queryFn: async () => {
			const response = await fetch(
				`/api/admin/titles?search=${debouncedSearchTerm}&sort=${sortField}&direction=${sortDirection}&page=${page}&pageSize=${pageSize}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch titles');
			}
			return response.json();
		}
	});

	// Mutations
	const createTitleMutation = useMutation({
		mutationFn: async (data: TitleFormData) => {
			return apiRequest({ method: 'POST', url: '/api/admin/titles', data });
		},
		onSuccess: () => {
			toast({
				title: 'Title created',
				description: 'The title has been created successfully',
				variant: 'default'
			});
			setIsCreateDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/titles'] });
			resetForm();
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to create title: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const updateTitleMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: TitleFormData }) => {
			return apiRequest({ method: 'PUT', url: `/api/admin/titles/${id}`, data });
		},
		onSuccess: () => {
			toast({
				title: 'Title updated',
				description: 'The title has been updated successfully',
				variant: 'default'
			});
			setIsEditDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/titles'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to update title: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const deleteTitleMutation = useMutation({
		mutationFn: async (id: string) => {
			return apiRequest({ method: 'DELETE', url: `/api/admin/titles/${id}` });
		},
		onSuccess: () => {
			toast({
				title: 'Title deleted',
				description: 'The title has been deleted successfully',
				variant: 'default'
			});
			setIsDeleteDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/titles'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to delete title: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Handlers
	const handleSort = (field: 'name' | 'rarity' | 'category' | 'createdAt') => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditDialogOpen && selectedTitle) {
			updateTitleMutation.mutate({ id: selectedTitle.id, data: formData });
		} else {
			createTitleMutation.mutate(formData);
		}
	};

	const handleEditClick = (title: Title) => {
		setSelectedTitle(title);
		setFormData({
			name: title.name,
			description: title.description || '',
			color: title.color,
			icon: title.icon || '',
			mediaId: title.mediaId,
			rarity: title.rarity,
			category: title.category,
			requiredPath: title.requiredPath && title.requiredPath !== '' ? title.requiredPath : 'none',
			requiredLevel: title.requiredLevel,
			isHidden: title.isHidden
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteClick = (title: Title) => {
		setSelectedTitle(title);
		setIsDeleteDialogOpen(true);
	};

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			color: '#ffffff',
			icon: '',
			mediaId: null,
			rarity: 'common',
			category: 'other',
			requiredPath: 'none',
			requiredLevel: null,
			isHidden: false
		});
		setSelectedTitle(null);
	};

	// Render title preview
	const TitlePreview = ({ name, color, icon }: { name: string; color: string; icon: string }) => (
		<div className="border border-zinc-700 rounded-md p-3 mb-3 bg-zinc-800">
			<p className="text-center mb-2 text-xs text-muted-foreground">Preview</p>
			<div className="flex items-center justify-center gap-1">
				{icon && <span>{icon}</span>}
				<span style={{ color }} className="font-medium">
					{name || 'Title Preview'}
				</span>
			</div>
		</div>
	);

	// Render title dialog form
	const TitleFormDialog = ({
		isOpen,
		setIsOpen,
		isEdit
	}: {
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
		isEdit: boolean;
	}) => (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) resetForm();
			}}
		>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{isEdit ? 'Edit Title' : 'Create New Title'}</DialogTitle>
						<DialogDescription>
							{isEdit
								? 'Update the title details below.'
								: 'Add a new title that users can earn or purchase.'}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<TitlePreview name={formData.name} color={formData.color} icon={formData.icon} />

						<div className="grid gap-2">
							<Label htmlFor="name">Title Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Describe how this title is earned or what it represents..."
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="color">Text Color</Label>
								<div className="flex gap-2">
									<Input
										id="color"
										type="color"
										value={formData.color}
										onChange={(e) => setFormData({ ...formData, color: e.target.value })}
										className="w-12 p-1 h-10"
									/>
									<Input
										value={formData.color}
										onChange={(e) => setFormData({ ...formData, color: e.target.value })}
										className="flex-1"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="icon">Icon (Emoji)</Label>
								<TitleMediaInput
									value={formData.icon}
									onChange={(value) => setFormData({ ...formData, icon: value })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="rarity">Rarity</Label>
								<Select
									value={formData.rarity}
									onValueChange={(value) => setFormData({ ...formData, rarity: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select rarity" />
									</SelectTrigger>
									<SelectContent>
										{RARITIES.map((rarity) => (
											<SelectItem key={rarity.value} value={rarity.value}>
												<div className="flex items-center gap-2">
													<div className={`w-3 h-3 rounded-full ${rarity.color}`} />
													<span>{rarity.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="category">Category</Label>
								<Select
									value={formData.category}
									onValueChange={(value) => setFormData({ ...formData, category: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="requiredPath">Required Path</Label>
								<Select
									value={formData.requiredPath}
									onValueChange={(value) => setFormData({ ...formData, requiredPath: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select path" />
									</SelectTrigger>
									<SelectContent>
										{PATHS.map((path) => (
											<SelectItem key={path.value} value={path.value}>
												{path.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="requiredLevel">
									Required Level {formData.requiredLevel === null && '(None)'}
								</Label>
								<Input
									id="requiredLevel"
									type="number"
									min="1"
									value={formData.requiredLevel === null ? '' : formData.requiredLevel}
									onChange={(e) => {
										const value = e.target.value === '' ? null : parseInt(e.target.value);
										setFormData({ ...formData, requiredLevel: value });
									}}
									placeholder="Optional"
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isHidden"
								checked={formData.isHidden}
								onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
								className="rounded border-gray-300"
							/>
							<Label htmlFor="isHidden">Hidden title (not visible to users until earned)</Label>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="submit"
							disabled={createTitleMutation.isPending || updateTitleMutation.isPending}
						>
							{createTitleMutation.isPending || updateTitleMutation.isPending
								? 'Saving...'
								: isEdit
									? 'Update Title'
									: 'Create Title'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);

	// Delete confirmation dialog
	const DeleteConfirmationDialog = () => (
		<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Delete Title</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this title? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				{selectedTitle && (
					<div className="flex flex-col items-center gap-3 py-4">
						<div className="flex items-center gap-2">
							{selectedTitle.icon && <span className="text-xl">{selectedTitle.icon}</span>}
							<span className="font-medium text-lg" style={{ color: selectedTitle.color }}>
								{selectedTitle.name}
							</span>
						</div>
						<p className="text-sm text-center text-muted-foreground">{selectedTitle.description}</p>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => selectedTitle && deleteTitleMutation.mutate(selectedTitle.id)}
						disabled={deleteTitleMutation.isPending}
					>
						{deleteTitleMutation.isPending ? 'Deleting...' : 'Delete Title'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	// Get badge color based on rarity
	const getBadgeColor = (rarity: string) => {
		switch (rarity) {
			case 'common':
				return 'bg-slate-700 hover:bg-slate-800';
			case 'uncommon':
				return 'bg-green-700 hover:bg-green-800';
			case 'rare':
				return 'bg-blue-700 hover:bg-blue-800';
			case 'epic':
				return 'bg-purple-700 hover:bg-purple-800';
			case 'legendary':
				return 'bg-amber-700 hover:bg-amber-800';
			case 'mythic':
				return 'bg-red-700 hover:bg-red-800';
			default:
				return 'bg-slate-700 hover:bg-slate-800';
		}
	};

	// Get category badge color
	const getCategoryBadgeColor = (category: string) => {
		switch (category) {
			case 'path':
				return 'bg-cyan-900 text-cyan-300';
			case 'achievement':
				return 'bg-emerald-900 text-emerald-300';
			case 'event':
				return 'bg-purple-900 text-purple-300';
			case 'seasonal':
				return 'bg-blue-900 text-blue-300';
			case 'purchase':
				return 'bg-amber-900 text-amber-300';
			default:
				return 'bg-zinc-800 text-zinc-300';
		}
	};

	// Render title table
	const TitleTable = () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					<TableHead>
						<div className="flex items-center cursor-pointer" onClick={() => handleSort('rarity')}>
							Rarity
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead>
						<div
							className="flex items-center cursor-pointer"
							onClick={() => handleSort('category')}
						>
							Category
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead>Requirements</TableHead>
					<TableHead>
						<div
							className="flex items-center cursor-pointer"
							onClick={() => handleSort('createdAt')}
						>
							Created
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
								Loading titles...
							</TableCell>
						</TableRow>
					))
				) : isError ? (
					<TableRow>
						<TableCell colSpan={6} className="h-16 text-center text-destructive">
							Error loading titles: {error.message}
						</TableCell>
					</TableRow>
				) : titlesData?.titles?.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
							No titles found. Create your first title to get started.
						</TableCell>
					</TableRow>
				) : (
					titlesData?.titles?.map((title: Title) => (
						<TableRow key={title.id} className={title.isHidden ? 'opacity-60' : ''}>
							<TableCell>
								<div className="flex items-center gap-2">
									{title.icon && <span className="text-xl">{title.icon}</span>}
									<span className="font-medium" style={{ color: title.color }}>
										{title.name}
									</span>
									{title.isHidden && (
										<Badge variant="outline" className="ml-2 border-zinc-700 text-zinc-400">
											Hidden
										</Badge>
									)}
								</div>
								{title.description && (
									<p className="text-xs text-muted-foreground mt-1 max-w-[300px] truncate">
										{title.description}
									</p>
								)}
							</TableCell>
							<TableCell>
								<Badge className={getBadgeColor(title.rarity)}>
									{title.rarity.charAt(0).toUpperCase() + title.rarity.slice(1)}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge className={getCategoryBadgeColor(title.category)}>
									{CATEGORIES.find((c) => c.value === title.category)?.label || title.category}
								</Badge>
							</TableCell>
							<TableCell>
								{title.requiredPath || title.requiredLevel ? (
									<div className="flex flex-col gap-1">
										{title.requiredPath && (
											<Badge variant="outline" className="border-zinc-700 bg-zinc-800">
												{PATHS.find((p) => p.value === title.requiredPath)?.label} Path
											</Badge>
										)}
										{title.requiredLevel && (
											<Badge variant="outline" className="border-zinc-700 bg-zinc-800">
												Level {title.requiredLevel}+
											</Badge>
										)}
									</div>
								) : (
									<span className="text-zinc-500">None</span>
								)}
							</TableCell>
							<TableCell>{new Date(title.createdAt).toLocaleDateString()}</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button variant="outline" size="icon" onClick={() => handleEditClick(title)}>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										className="text-destructive"
										onClick={() => handleDeleteClick(title)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);

	// Main render
	return (
		<>
			<AdminPageShell title="Title Management">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div />
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create Title
						</Button>
					</div>

					<Tabs defaultValue="all-titles" className="space-y-4">
						<TabsList>
							<TabsTrigger value="all-titles">All Titles</TabsTrigger>
							<TabsTrigger value="statistics">Statistics</TabsTrigger>
						</TabsList>

						<TabsContent value="all-titles" className="space-y-4">
							<Card>
								<CardHeader className="pb-3">
									<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
										<CardTitle>Title Library</CardTitle>
										<div className="relative w-full sm:w-72">
											<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Search titles..."
												className="pl-8"
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
											/>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-0">
									<TitleTable />

									{/* Pagination */}
									{titlesData?.totalPages > 1 && (
										<div className="flex items-center justify-end gap-2 p-4">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.max(1, p - 1))}
												disabled={page === 1}
											>
												Previous
											</Button>
											<span className="text-sm">
												Page {page} of {titlesData.totalPages}
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.min(titlesData.totalPages, p + 1))}
												disabled={page === titlesData.totalPages}
											>
												Next
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="statistics" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Title Statistics</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
										<Card>
											<CardContent className="p-4">
												<div className="text-sm font-medium text-muted-foreground">
													Total Titles
												</div>
												<div className="text-2xl font-bold mt-1">
													{titlesData?.totalTitles || 0}
												</div>
											</CardContent>
										</Card>
										<Card>
											<CardContent className="p-4">
												<div className="text-sm font-medium text-muted-foreground">Path Titles</div>
												<div className="text-2xl font-bold mt-1">{titlesData?.pathTitles || 0}</div>
											</CardContent>
										</Card>
										<Card>
											<CardContent className="p-4">
												<div className="text-sm font-medium text-muted-foreground">
													Achievement Titles
												</div>
												<div className="text-2xl font-bold mt-1">
													{titlesData?.achievementTitles || 0}
												</div>
											</CardContent>
										</Card>
										<Card>
											<CardContent className="p-4">
												<div className="text-sm font-medium text-muted-foreground">
													Rarest Title
												</div>
												<div className="text-2xl font-bold mt-1 truncate">
													{titlesData?.rarestTitle?.name || 'N/A'}
												</div>
											</CardContent>
										</Card>
									</div>

									<div className="mt-6">
										<h3 className="text-lg font-medium mb-4">Title Distribution</h3>
										<div className="h-64 bg-zinc-800 rounded-md flex items-center justify-center">
											<span className="text-muted-foreground">
												Title distribution chart will be displayed here
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</AdminPageShell>

			{/* Dialogs */}
			<TitleFormDialog
				isOpen={isCreateDialogOpen}
				setIsOpen={setIsCreateDialogOpen}
				isEdit={false}
			/>
			<TitleFormDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} isEdit={true} />
			<DeleteConfirmationDialog />
		</>
	);
}
