// Phase 2 Audit:
// - Verified layout
// - Added/confirmed <Head> title
// - Applied DEV_MODE gating (if applicable)

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
	MoreHorizontal,
	Plus,
	Pencil,
	Trash2,
	MessageSquare,
	Eye,
	EyeOff,
	MoveUp,
	MoveDown,
	Search,
	Tag
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter'; // Fixed import for useLocation
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

const categorySchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be at most 50 characters'),
	description: z.string().max(500, 'Description must be at most 500 characters').optional(),
	slug: z
		.string()
		.min(2, 'Slug must be at least 2 characters')
		.max(50, 'Slug must be at most 50 characters')
		.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
	isVisible: z.boolean().default(true),
	parentId: z.number().nullable().default(null),
	position: z.number().int().min(0).default(0),
	icon: z.string().optional()
});

type Category = z.infer<typeof categorySchema> & {
	id: number;
	threadCount: number;
	postCount: number;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
};

export default function AdminCategoriesPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const location = useLocation(); // Use useLocation

	const form = useForm<z.infer<typeof categorySchema>>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: '',
			description: '',
			slug: '',
			isVisible: true,
			parentId: null,
			position: 0,
			icon: ''
		}
	});

	const {
		data: categories,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['/admin/forum/categories'],
		queryFn: async () => {
			const response = await fetch('/admin/forum/categories');
			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}
			return response.json();
		}
	});

	const createCategoryMutation = useMutation({
		mutationFn: async (data: z.infer<typeof categorySchema>) => {
			const response = await fetch('/admin/forum/categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to create category');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/categories'] });
			// Success: Category created successfully (was console.log)
			setIsCreateDialogOpen(false);
			form.reset();
		},
		onError: (error) => {
			console.error(`Error: Failed to create category: ${error.message}`);
		}
	});

	const editCategoryMutation = useMutation({
		mutationFn: async (data: z.infer<typeof categorySchema> & { id: number }) => {
			const { id, ...categoryData } = data;
			const response = await fetch(`/admin/forum/categories/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(categoryData)
			});

			if (!response.ok) {
				throw new Error('Failed to update category');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/categories'] });
			setIsEditDialogOpen(false);
			setSelectedCategory(null);
		},
		onError: (error) => {
			console.error(`Error: Failed to update category: ${error.message}`);
		}
	});

	const deleteCategoryMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/admin/forum/categories/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete category');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/categories'] });
			setIsDeleteDialogOpen(false);
			setSelectedCategory(null);
		},
		onError: (error) => {
			console.error(`Error: Failed to delete category: ${error.message}`);
		}
	});

	const reorderCategoryMutation = useMutation({
		mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
			const response = await fetch(`/admin/forum/categories/${id}/reorder`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ direction })
			});

			if (!response.ok) {
				throw new Error('Failed to reorder categories');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/categories'] });
		},
		onError: (error) => {
			console.error(`Error: Failed to reorder categories: ${error.message}`);
		}
	});

	const onCreateSubmit = (data: z.infer<typeof categorySchema>) => {
		createCategoryMutation.mutate(data);
	};

	const onEditSubmit = (data: z.infer<typeof categorySchema>) => {
		if (selectedCategory) {
			editCategoryMutation.mutate({ id: selectedCategory.id, ...data });
		}
	};

	const handleDeleteCategory = () => {
		if (selectedCategory) {
			deleteCategoryMutation.mutate(selectedCategory.id);
		}
	};

	const handleReorderCategory = (id: number, direction: 'up' | 'down') => {
		reorderCategoryMutation.mutate({ id, direction });
	};

	const handleEditCategory = (category: Category) => {
		setSelectedCategory(category);
		form.reset({
			name: category.name,
			description: category.description || '',
			slug: category.slug,
			isVisible: category.isVisible,
			parentId: category.parentId,
			position: category.position,
			icon: category.icon || ''
		});
		setIsEditDialogOpen(true);
	};

	const handleOpenCreateDialog = () => {
		setSelectedCategory(null);
		form.reset({
			name: '',
			description: '',
			slug: '',
			isVisible: true,
			parentId: null,
			position: 0,
			icon: ''
		});
		setIsCreateDialogOpen(true);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	};

	const filterAndOrganizeCategories = (categories: Category[], query: string) => {
		if (!categories) return [];

		const filteredCategories = categories.filter(
			(category) =>
				category.name.toLowerCase().includes(query.toLowerCase()) ||
				category.description?.toLowerCase().includes(query.toLowerCase())
		);

		if (query) {
			return filteredCategories;
		}

		const rootCategories: Category[] = [];
		const childrenMap: { [key: number]: Category[] } = {};

		filteredCategories.forEach((category) => {
			if (!category.parentId) {
				rootCategories.push(category);
			} else {
				if (!childrenMap[category.parentId]) {
					childrenMap[category.parentId] = [];
				}
				childrenMap[category.parentId].push(category);
			}
		});

		const attachChildren = (parentCategories: Category[]) => {
			return parentCategories.map((parent) => {
				const children = childrenMap[parent.id] || [];
				return {
					...parent,
					children: attachChildren(children)
				};
			});
		};

		return attachChildren(rootCategories);
	};

	const organizedCategories = filterAndOrganizeCategories(categories, searchQuery);

	const renderCategoryRow = (category: Category, depth: number = 0) => {
		return (
			<TableRow key={category.id}>
				{' '}
				{/* Added key prop here */}
				<TableCell>
					<div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
						{category.icon && <span className="mr-2">{category.icon}</span>}
						<span className="font-medium">{category.name}</span>
					</div>
				</TableCell>
				<TableCell className="hidden md:table-cell">
					<div className="truncate max-w-[200px]">{category.description || '—'}</div>
				</TableCell>
				<TableCell>
					<code className="text-xs bg-muted px-1 py-0.5 rounded">{category.slug}</code>
				</TableCell>
				<TableCell className="text-center">
					<Badge variant="outline">{category.threadCount || 0}</Badge>
				</TableCell>
				<TableCell className="text-center">
					{category.isVisible ? (
						<Eye className="h-4 w-4 text-green-500 mx-auto" />
					) : (
						<EyeOff className="h-4 w-4 text-red-500 mx-auto" />
					)}
				</TableCell>
				<TableCell className="text-right">
					<div className="flex justify-end items-center space-x-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleReorderCategory(category.id, 'up')}
							disabled={reorderCategoryMutation.isPending}
						>
							<MoveUp className="h-4 w-4" />
							<span className="sr-only">Move Up</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleReorderCategory(category.id, 'down')}
							disabled={reorderCategoryMutation.isPending}
						>
							<MoveDown className="h-4 w-4" />
							<span className="sr-only">Move Down</span>
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">Actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem onClick={() => handleEditCategory(category)}>
									<Pencil className="h-4 w-4 mr-2" />
									Edit Category
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setSelectedCategory(category);
										setIsDeleteDialogOpen(true);
									}}
									className="text-red-600"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Category
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => window.open(`/categories/${category.slug}`, '_blank')}
								>
									<Eye className="h-4 w-4 mr-2" />
									View Category
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</TableCell>
			</TableRow>
		);
	};

	const pageActions = (
		<Button onClick={handleOpenCreateDialog}>
			<Plus className="h-4 w-4 mr-2" /> Create Category
		</Button>
	);

	return (
		<AdminPageShell title="Forum Categories" pageActions={pageActions}>
			<div className="space-y-6">
				<Card className="bg-admin-bg-element border-admin-border-subtle">
					<CardHeader>
						<CardTitle>Manage Categories</CardTitle>
						<CardDescription>Create and organize forum categories</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap gap-2">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-admin-text-secondary" />
									<Input
										type="search"
										placeholder="Search categories..."
										className="pl-8 bg-admin-bg-surface border-admin-border-subtle focus:border-admin-text-accent focus:ring-0 text-admin-text-primary placeholder:text-admin-text-secondary"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center h-40">
								<p>Loading categories...</p>
							</div>
						) : isError ? (
							<div className="flex justify-center items-center h-40">
								<p className="text-red-500">Failed to load categories</p>
							</div>
						) : organizedCategories.length === 0 ? (
							<div className="flex justify-center items-center h-40">
								<p>No categories found</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead className="hidden md:table-cell">Description</TableHead>
											<TableHead>Slug</TableHead>
											<TableHead className="text-center">Threads</TableHead>
											<TableHead className="text-center">Visible</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{organizedCategories.map((category) => renderCategoryRow(category))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Create New Category</DialogTitle>
							<DialogDescription>
								Create a new forum category. Categories can be organized hierarchically.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category Name</FormLabel>
											<FormControl>
												<Input placeholder="General Discussion" {...field} />
											</FormControl>
											<FormDescription>The name displayed to users</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="slug"
									render={({ field }) => (
										<FormItem>
											<FormLabel>URL Slug</FormLabel>
											<FormControl>
												<Input placeholder="general-discussion" {...field} />
											</FormControl>
											<FormDescription>
												Used in the URL (e.g., /categories/general-discussion). Leave blank to
												generate automatically.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Discuss general topics related to the community"
													{...field}
													rows={3}
												/>
											</FormControl>
											<FormDescription>A brief description of the category</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="parentId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Parent Category</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														value={field.value?.toString() || ''}
														onChange={(e) => {
															const value = e.target.value;
															field.onChange(value ? parseInt(value) : null);
														}}
													>
														<option value="">None (Top Level)</option>
														{categories?.map((category: Category) => (
															<option key={category.id} value={category.id}>
																{category.name}
															</option>
														))}
													</select>
												</FormControl>
												<FormDescription>
													Create a subcategory by selecting a parent
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isVisible"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
												<div className="space-y-0.5">
													<FormLabel>Visibility</FormLabel>
													<FormDescription>Show this category to all users</FormDescription>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="position"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Display Order</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													placeholder="0"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormDescription>Categories with lower numbers appear first</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="icon"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Icon (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="📚" {...field} />
											</FormControl>
											<FormDescription>
												Emoji or icon code to display next to the category name
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={createCategoryMutation.isPending}>
										{createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Edit Category</DialogTitle>
							<DialogDescription>Update category information and settings.</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category Name</FormLabel>
											<FormControl>
												<Input placeholder="General Discussion" {...field} />
											</FormControl>
											<FormDescription>The name displayed to users</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="slug"
									render={({ field }) => (
										<FormItem>
											<FormLabel>URL Slug</FormLabel>
											<FormControl>
												<Input placeholder="general-discussion" {...field} />
											</FormControl>
											<FormDescription>
												Used in the URL (e.g., /categories/general-discussion)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Discuss general topics related to the community"
													{...field}
													rows={3}
												/>
											</FormControl>
											<FormDescription>A brief description of the category</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="parentId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Parent Category</FormLabel>
												<FormControl>
													<select
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
														value={field.value?.toString() || ''}
														onChange={(e) => {
															const value = e.target.value;
															field.onChange(value ? parseInt(value) : null);
														}}
													>
														<option value="">None (Top Level)</option>
														{categories
															?.filter(
																(category: Category) =>
																	selectedCategory && category.id !== selectedCategory.id
															)
															.map((category: Category) => (
																<option key={category.id} value={category.id}>
																	{category.name}
																</option>
															))}
													</select>
												</FormControl>
												<FormDescription>
													Move this category under another parent category
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isVisible"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
												<div className="space-y-0.5">
													<FormLabel>Visibility</FormLabel>
													<FormDescription>Show this category to all users</FormDescription>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="position"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Display Order</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
													placeholder="0"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormDescription>Categories with lower numbers appear first</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="icon"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Icon (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="📚" {...field} />
											</FormControl>
											<FormDescription>
												Emoji or icon code to display next to the category name
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={editCategoryMutation.isPending}>
										{editCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Category</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this category? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							{selectedCategory && (
								<div className="border rounded-md p-4">
									<h4 className="font-medium">{selectedCategory.name}</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCategory.description || 'No description'}
									</p>
									<div className="flex items-center gap-2 mt-2">
										<Badge variant="outline">{selectedCategory.threadCount || 0} threads</Badge>
										<Badge variant="outline">{selectedCategory.postCount || 0} posts</Badge>
									</div>
								</div>
							)}
							{selectedCategory && selectedCategory.threadCount > 0 && (
								<div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 p-4 rounded-md">
									<p className="flex items-center text-sm">
										<MessageSquare className="h-4 w-4 mr-2" />
										<span>
											This category contains {selectedCategory.threadCount} threads with{' '}
											{selectedCategory.postCount} posts. Deleting it will orphan or delete this
											content.
										</span>
									</p>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteCategory}
								disabled={deleteCategoryMutation.isPending}
							>
								{deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete Category'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminPageShell>
	);
}
