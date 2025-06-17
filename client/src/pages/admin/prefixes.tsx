import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Pencil, Trash2, MoveUp, MoveDown, Tag, Search } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ThreadPrefix } from '@db_types/forum.types';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

// Define validation schema for prefixes
const prefixSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(30, 'Name must be at most 30 characters'),
	color: z.string().min(3, 'Please select a valid color'),
	isActive: z.boolean().default(true),
	position: z.number().int().min(0).default(0),
	categoryId: z.number().nullable().default(null)
});

export default function AdminPrefixesPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedPrefix, setSelectedPrefix] = useState<ThreadPrefix | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const form = useForm<z.infer<typeof prefixSchema>>({
		resolver: zodResolver(prefixSchema),
		defaultValues: {
			name: '',
			color: 'zinc',
			isActive: true,
			position: 0,
			categoryId: null
		}
	});

	// Available colors based on Tailwind CSS
	const availableColors = [
		{ name: 'Slate', value: 'slate' },
		{ name: 'Gray', value: 'gray' },
		{ name: 'Zinc', value: 'zinc' },
		{ name: 'Red', value: 'red' },
		{ name: 'Orange', value: 'orange' },
		{ name: 'Amber', value: 'amber' },
		{ name: 'Yellow', value: 'yellow' },
		{ name: 'Lime', value: 'lime' },
		{ name: 'Green', value: 'green' },
		{ name: 'Emerald', value: 'emerald' },
		{ name: 'Teal', value: 'teal' },
		{ name: 'Cyan', value: 'cyan' },
		{ name: 'Blue', value: 'blue' },
		{ name: 'Indigo', value: 'indigo' },
		{ name: 'Violet', value: 'violet' },
		{ name: 'Purple', value: 'purple' },
		{ name: 'Fuchsia', value: 'fuchsia' },
		{ name: 'Pink', value: 'pink' },
		{ name: 'Rose', value: 'rose' }
	];

	// Fetch prefixes
	const {
		data: prefixes,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['/admin/forum/prefixes'],
		queryFn: async () => {
			const response = await fetch('/admin/forum/prefixes');
			if (!response.ok) {
				throw new Error('Failed to fetch prefixes');
			}
			return response.json();
		}
	});

	// Fetch categories for the dropdown
	const { data: categories } = useQuery({
		queryKey: ['/admin/forum/categories'],
		queryFn: async () => {
			const response = await fetch('/admin/forum/categories');
			if (!response.ok) {
				throw new Error('Failed to fetch categories');
			}
			return response.json();
		}
	});

	// Create prefix mutation
	const createPrefixMutation = useMutation({
		mutationFn: async (data: z.infer<typeof prefixSchema>) => {
			const response = await fetch('/admin/forum/prefixes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to create prefix');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/prefixes'] });
			setIsCreateDialogOpen(false);
			form.reset();
		}
	});

	// Edit prefix mutation
	const editPrefixMutation = useMutation({
		mutationFn: async (data: z.infer<typeof prefixSchema> & { id: number }) => {
			const { id, ...prefixData } = data;
			const response = await fetch(`/admin/forum/prefixes/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(prefixData)
			});

			if (!response.ok) {
				throw new Error('Failed to update prefix');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/prefixes'] });
			setIsEditDialogOpen(false);
			setSelectedPrefix(null);
		}
	});

	// Delete prefix mutation
	const deletePrefixMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/admin/forum/prefixes/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete prefix');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/prefixes'] });
			setIsDeleteDialogOpen(false);
			setSelectedPrefix(null);
		}
	});

	// Reorder prefix mutation
	const reorderPrefixMutation = useMutation({
		mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
			const response = await fetch(`/admin/forum/prefixes/${id}/reorder`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ direction })
			});

			if (!response.ok) {
				throw new Error('Failed to reorder prefixes');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/admin/forum/prefixes'] });
		}
	});

	const onCreateSubmit = (data: z.infer<typeof prefixSchema>) => {
		createPrefixMutation.mutate(data);
	};

	const onEditSubmit = (data: z.infer<typeof prefixSchema>) => {
		if (selectedPrefix) {
			editPrefixMutation.mutate({ id: selectedPrefix.id, ...data });
		}
	};

	const handleDeletePrefix = () => {
		if (selectedPrefix) {
			deletePrefixMutation.mutate(selectedPrefix.id);
		}
	};

	const handleReorderPrefix = (id: number, direction: 'up' | 'down') => {
		reorderPrefixMutation.mutate({ id, direction });
	};

	const handleEditPrefix = (prefix: ThreadPrefix) => {
		setSelectedPrefix(prefix);
		form.reset({
			name: prefix.name,
			color: prefix.color || 'zinc',
			isActive: prefix.isActive,
			position: prefix.position,
			categoryId: prefix.categoryId
		});
		setIsEditDialogOpen(true);
	};

	const handleOpenCreateDialog = () => {
		setSelectedPrefix(null);
		form.reset({
			name: '',
			color: 'zinc',
			isActive: true,
			position: 0,
			categoryId: null
		});
		setIsCreateDialogOpen(true);
	};

	// Filter prefixes based on search query
	const filteredPrefixes = prefixes
		? prefixes.filter((prefix: ThreadPrefix) =>
				prefix.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: [];

	// Generate a badge with the selected color for preview
	const ColorPreview = ({ color }: { color: string }) => {
		const themeClassName = `theme-badge-${color || 'zinc'}`; // Default to zinc if color is undefined
		const staticBadgeClasses = 'bg-badge-bg-dark text-badge-text-dark border-badge-border-dark'; // Using dark variants for admin preview
		return <Badge className={`${themeClassName} ${staticBadgeClasses}`}>Preview</Badge>;
	};

	const pageActions = (
		<Button onClick={handleOpenCreateDialog}>
			<Plus className="h-4 w-4 mr-2" /> Create Prefix
		</Button>
	);

	return (
		<AdminPageShell title="Thread Prefixes" pageActions={pageActions}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Manage Prefixes</CardTitle>
						<CardDescription>
							Create and organize thread prefixes to categorize forum threads
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap gap-2">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search prefixes..."
										className="pl-8"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center h-40">
								<p>Loading prefixes...</p>
							</div>
						) : isError ? (
							<div className="flex justify-center items-center h-40">
								<p className="text-red-500">Failed to load prefixes</p>
							</div>
						) : filteredPrefixes.length === 0 ? (
							<div className="flex justify-center items-center h-40">
								<p>No prefixes found</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Preview</TableHead>
											<TableHead>Color</TableHead>
											<TableHead className="text-center">Status</TableHead>
											<TableHead>Position</TableHead>
											<TableHead>Category</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredPrefixes.map((prefix: ThreadPrefix) => (
											<TableRow key={prefix.id}>
												<TableCell className="font-medium">{prefix.name}</TableCell>
												<TableCell>
													<Badge
														className={`theme-badge-${prefix.color || 'zinc'} bg-badge-bg-dark text-badge-text-dark border-badge-border-dark`}
													>
														{prefix.name}
													</Badge>
												</TableCell>
												<TableCell>{prefix.color}</TableCell>
												<TableCell className="text-center">
													{prefix.isActive ? (
														<Badge variant="outline" className="bg-green-900/20 text-green-300">
															Active
														</Badge>
													) : (
														<Badge variant="outline" className="bg-red-900/20 text-red-300">
															Inactive
														</Badge>
													)}
												</TableCell>
												<TableCell>{prefix.position}</TableCell>
												<TableCell>
													{prefix.categoryId
														? categories?.find((cat: any) => cat.id === prefix.categoryId)?.name ||
															'Unknown'
														: 'Global'}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end items-center space-x-1">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleReorderPrefix(prefix.id, 'up')}
															disabled={reorderPrefixMutation.isPending}
														>
															<MoveUp className="h-4 w-4" />
															<span className="sr-only">Move Up</span>
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleReorderPrefix(prefix.id, 'down')}
															disabled={reorderPrefixMutation.isPending}
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
																<DropdownMenuItem onClick={() => handleEditPrefix(prefix)}>
																	<Pencil className="h-4 w-4 mr-2" />
																	Edit Prefix
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => {
																		setSelectedPrefix(prefix);
																		setIsDeleteDialogOpen(true);
																	}}
																	className="text-red-600"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete Prefix
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Create Prefix Dialog */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Create New Prefix</DialogTitle>
							<DialogDescription>
								Create a new thread prefix for categorizing forum threads.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Prefix Name</FormLabel>
											<FormControl>
												<Input placeholder="Hot" {...field} />
											</FormControl>
											<FormDescription>The name displayed to users</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="color"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Color</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													value={field.value}
													onChange={field.onChange}
												>
													{availableColors.map((color) => (
														<option key={color.value} value={color.value}>
															{color.name}
														</option>
													))}
												</select>
											</FormControl>
											<FormDescription className="flex items-center gap-2">
												<span>Preview:</span>
												<ColorPreview color={field.value} />
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="categoryId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category (Optional)</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													value={field.value?.toString() || ''}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value ? parseInt(value) : null);
													}}
												>
													<option value="">Global (All Categories)</option>
													{categories?.map((category: any) => (
														<option key={category.id} value={category.id}>
															{category.name}
														</option>
													))}
												</select>
											</FormControl>
											<FormDescription>Limit this prefix to a specific category</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
												<FormDescription>Prefixes with lower numbers appear first</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
												<div className="space-y-0.5">
													<FormLabel>Active</FormLabel>
													<FormDescription>Allow this prefix to be used</FormDescription>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={createPrefixMutation.isPending}>
										{createPrefixMutation.isPending ? 'Creating...' : 'Create Prefix'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Edit Prefix Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Edit Prefix</DialogTitle>
							<DialogDescription>Update prefix information and settings.</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
								{/* Same form fields as create dialog */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Prefix Name</FormLabel>
											<FormControl>
												<Input placeholder="Hot" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="color"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Color</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													value={field.value}
													onChange={field.onChange}
												>
													{availableColors.map((color) => (
														<option key={color.value} value={color.value}>
															{color.name}
														</option>
													))}
												</select>
											</FormControl>
											<FormDescription className="flex items-center gap-2">
												<span>Preview:</span>
												<ColorPreview color={field.value} />
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="categoryId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category (Optional)</FormLabel>
											<FormControl>
												<select
													className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													value={field.value?.toString() || ''}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value ? parseInt(value) : null);
													}}
												>
													<option value="">Global (All Categories)</option>
													{categories?.map((category: any) => (
														<option key={category.id} value={category.id}>
															{category.name}
														</option>
													))}
												</select>
											</FormControl>
											<FormDescription>Limit this prefix to a specific category</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isActive"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
												<div className="space-y-0.5">
													<FormLabel>Active</FormLabel>
													<FormDescription>Allow this prefix to be used</FormDescription>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={editPrefixMutation.isPending}>
										{editPrefixMutation.isPending ? 'Updating...' : 'Update Prefix'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Delete Prefix Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Prefix</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this prefix? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							{selectedPrefix && (
								<div className="flex items-center justify-center gap-4 p-4 border rounded-md">
									<Badge
										className={`theme-badge-${selectedPrefix.color || 'zinc'} bg-badge-bg-dark text-badge-text-dark border-badge-border-dark`}
									>
										{selectedPrefix.name}
									</Badge>
									<span className="text-sm">{selectedPrefix.name}</span>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeletePrefix}
								disabled={deletePrefixMutation.isPending}
							>
								{deletePrefixMutation.isPending ? 'Deleting...' : 'Delete Prefix'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminPageShell>
	);
}
