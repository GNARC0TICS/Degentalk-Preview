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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Plus, Pencil, Trash2, Tag, Search, AlertTriangle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ForumTag } from '@/types/compat/forum';
import type { TagId } from '@shared/types/ids';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';

// Define validation schema for tags
const tagSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(30, 'Name must be at most 30 characters'),
	slug: z
		.string()
		.min(2, 'Slug must be at least 2 characters')
		.max(50, 'Slug must be at most 50 characters')
		.regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
	description: z.string().max(200, 'Description must be at most 200 characters').optional()
});

export default function AdminTagsPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTag, setSelectedTag] = useState<ForumTag | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const form = useForm<z.infer<typeof tagSchema>>({
		resolver: zodResolver(tagSchema),
		defaultValues: {
			name: '',
			slug: '',
			description: ''
		}
	});

	// Fetch tags
	const {
		data: tags,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['/api/admin/forum/tags'],
		queryFn: async () => {
			const response = await fetch('/api/admin/forum/tags');
			if (!response.ok) {
				throw new Error('Failed to fetch tags');
			}
			return response.json();
		}
	});

	// Create tag mutation
	const createTagMutation = useMutation({
		mutationFn: async (data: z.infer<typeof tagSchema>) => {
			const response = await fetch('/api/admin/forum/tags', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to create tag');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/forum/tags'] });
			setIsCreateDialogOpen(false);
			form.reset();
		}
	});

	// Edit tag mutation
	const editTagMutation = useMutation({
		mutationFn: async (data: z.infer<typeof tagSchema> & { id: TagId }) => {
			const { id, ...tagData } = data;
			const response = await fetch(`/api/admin/forum/tags/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(tagData)
			});

			if (!response.ok) {
				throw new Error('Failed to update tag');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/forum/tags'] });
			setIsEditDialogOpen(false);
			setSelectedTag(null);
		}
	});

	// Delete tag mutation
	const deleteTagMutation = useMutation({
		mutationFn: async (id: TagId) => {
			const response = await fetch(`/api/admin/forum/tags/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete tag');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/forum/tags'] });
			setIsDeleteDialogOpen(false);
			setSelectedTag(null);
		}
	});

	// Generate a slug from the name
	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-');
	};

	const onCreateSubmit = (data: z.infer<typeof tagSchema>) => {
		createTagMutation.mutate(data);
	};

	const onEditSubmit = (data: z.infer<typeof tagSchema>) => {
		if (selectedTag) {
			editTagMutation.mutate({ id: selectedTag.id, ...data });
		}
	};

	const handleDeleteTag = () => {
		if (selectedTag) {
			deleteTagMutation.mutate(selectedTag.id);
		}
	};

	const handleEditTag = (tag: ForumTag) => {
		setSelectedTag(tag);
		form.reset({
			name: tag.name,
			slug: tag.slug,
			description: tag.description || ''
		});
		setIsEditDialogOpen(true);
	};

	const handleOpenCreateDialog = () => {
		setSelectedTag(null);
		form.reset({
			name: '',
			slug: '',
			description: ''
		});
		setIsCreateDialogOpen(true);
	};

	// Filter tags based on search query
	const filteredTags = tags
		? tags.filter(
				(tag: ForumTag) =>
					tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: [];

	return (
		<AdminPageShell title="Tag Management">
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
					<h1 className="text-3xl font-bold">Forum Tags</h1>
					<Button onClick={handleOpenCreateDialog}>
						<Plus className="h-4 w-4 mr-2" />
						Create Tag
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Manage Tags</CardTitle>
						<CardDescription>
							Create and organize forum tags for thread categorization
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap gap-2">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search tags..."
										className="pl-8"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{isLoading ? (
							<div className="flex justify-center items-center h-40">
								<p>Loading tags...</p>
							</div>
						) : isError ? (
							<div className="flex justify-center items-center h-40">
								<p className="text-red-500">Failed to load tags</p>
							</div>
						) : filteredTags.length === 0 ? (
							<div className="flex justify-center items-center h-40">
								<p>No tags found</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Slug</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Thread Count</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredTags.map((tag: ForumTag & { threadCount?: number }) => (
											<TableRow key={tag.id}>
												<TableCell className="font-medium">
													<Badge
														variant="outline"
														className="bg-zinc-900 text-zinc-200 border-zinc-700"
													>
														<Tag className="h-3 w-3 mr-1" />
														{tag.name}
													</Badge>
												</TableCell>
												<TableCell className="font-mono text-xs">{tag.slug}</TableCell>
												<TableCell className="max-w-xs truncate">
													{tag.description || (
														<span className="text-muted-foreground italic">No description</span>
													)}
												</TableCell>
												<TableCell>{tag.threadCount || 0}</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
																<span className="sr-only">Actions</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem onClick={() => handleEditTag(tag)}>
																<Pencil className="h-4 w-4 mr-2" />
																Edit Tag
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => {
																	setSelectedTag(tag);
																	setIsDeleteDialogOpen(true);
																}}
																className="text-red-600"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Delete Tag
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Create Tag Dialog */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Create New Tag</DialogTitle>
							<DialogDescription>
								Create a new forum tag for thread categorization.
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tag Name</FormLabel>
											<FormControl>
												<Input
													placeholder="NFTs"
													{...field}
													onChange={(e) => {
														field.onChange(e);
														// Autogenerate the slug if empty
														if (!form.getValues('slug')) {
															form.setValue('slug', generateSlug(e.target.value));
														}
													}}
												/>
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
												<Input placeholder="nfts" {...field} className="font-mono text-sm" />
											</FormControl>
											<FormDescription>
												Used in URLs and APIs. Lowercase letters, numbers, and hyphens only.
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
											<FormLabel>Description (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Threads about NFT projects, collections, and trading."
													className="resize-y min-h-24"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Brief description of what this tag represents
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
									<Button type="submit" disabled={createTagMutation.isPending}>
										{createTagMutation.isPending ? 'Creating...' : 'Create Tag'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Edit Tag Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="sm:max-w-[550px]">
						<DialogHeader>
							<DialogTitle>Edit Tag</DialogTitle>
							<DialogDescription>Update tag information and settings.</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tag Name</FormLabel>
											<FormControl>
												<Input placeholder="NFTs" {...field} />
											</FormControl>
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
												<Input placeholder="nfts" {...field} className="font-mono text-sm" />
											</FormControl>
											<FormDescription>
												<Alert variant="warning" className="mt-2">
													<AlertTriangle className="h-4 w-4" />
													<AlertTitle>Warning</AlertTitle>
													<AlertDescription>
														Changing the slug may break existing links to this tag.
													</AlertDescription>
												</Alert>
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
											<FormLabel>Description (Optional)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Threads about NFT projects, collections, and trading."
													className="resize-y min-h-24"
													{...field}
												/>
											</FormControl>
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
									<Button type="submit" disabled={editTagMutation.isPending}>
										{editTagMutation.isPending ? 'Updating...' : 'Update Tag'}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				{/* Delete Tag Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Tag</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this tag? All thread associations will be removed.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							{selectedTag && (
								<div className="flex flex-col gap-2 p-4 border rounded-md">
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="bg-zinc-900 text-zinc-200 border-zinc-700">
											<Tag className="h-3 w-3 mr-1" />
											{selectedTag.name}
										</Badge>
										<span className="text-sm font-mono">{selectedTag.slug}</span>
									</div>
									{selectedTag.description && (
										<p className="text-sm text-muted-foreground">{selectedTag.description}</p>
									)}
								</div>
							)}

							{selectedTag && (selectedTag as any).threadCount > 0 && (
								<Alert variant="destructive" className="mt-4">
									<AlertTriangle className="h-4 w-4" />
									<AlertTitle>Warning</AlertTitle>
									<AlertDescription>
										This tag is currently used by {(selectedTag as any).threadCount} threads.
										Deleting it will remove the tag from all threads.
									</AlertDescription>
								</Alert>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteTag}
								disabled={deleteTagMutation.isPending}
							>
								{deleteTagMutation.isPending ? 'Deleting...' : 'Delete Tag'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AdminPageShell>
	);
}
