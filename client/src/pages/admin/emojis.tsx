import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Pencil, Trash, Plus, Image, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { MediaLibraryModal } from '@/components/admin/media/MediaLibraryModal';
import { mediaApiService } from '@/features/admin/services/media-api.service';
import { MediaAsset } from '@/components/media/MediaAsset';
import type { EmojiId } from '@db/types';

// Type for emoji schema validation
const emojiFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	code: z.string().min(1, 'Code is required'),
	imageUrl: z.string().min(1, 'Image URL is required'),
	previewUrl: z.string().nullable().optional(),
	category: z.string().default('standard'),
	isLocked: z.boolean().default(true),
	unlockType: z.string().default('free'),
	type: z.enum(['static', 'lottie']).default('static'),
	priceDgt: z.number().nullable().optional(),
	requiredPathXP: z.number().nullable().optional()
});

type EmojiFormValues = z.infer<typeof emojiFormSchema>;

interface Emoji {
	id: EmojiId;
	name: string;
	code: string;
	imageUrl: string;
	previewUrl: string | null;
	category: string;
	isLocked: boolean;
	unlockType: string;
	type: 'static' | 'lottie';
	priceDgt: number | null;
	requiredPathXP: number | null;
	accessible?: boolean;
}

export default function AdminEmojisPage() {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [currentEmoji, setCurrentEmoji] = useState<Emoji | null>(null);
	const [activeTab, setActiveTab] = useState('all');
	const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch emojis
	const { data: emojis, isLoading } = useQuery({
		queryKey: ['/api/admin/emojis'],
		select: (data: any) =>
			data.map((emoji: any) => ({
				...emoji,
				imageUrl: emoji.url, // Map fields for consistency
				previewUrl: emoji.preview_url || null,
				isLocked: emoji.is_locked,
				unlockType: emoji.unlock_type || 'free',
				type: emoji.type || 'static',
				priceDgt: emoji.price_dgt || null,
				requiredPathXP: emoji.required_path_xp || null
			}))
	});

	// Create emoji mutation
	const createEmojiMutation = useMutation({
		mutationFn: (newEmoji: EmojiFormValues) =>
			apiRequest('/api/admin/emojis', {
				method: 'POST',
				data: {
					...newEmoji,
					url: newEmoji.imageUrl,
					preview_url: newEmoji.previewUrl,
					is_locked: newEmoji.isLocked,
					unlock_type: newEmoji.unlockType,
					price_dgt: newEmoji.priceDgt,
					required_path_xp: newEmoji.requiredPathXP
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/emojis'] });
			setIsOpen(false);
			toast({
				title: 'Emoji created',
				description: 'The emoji has been created successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to create emoji',
				description: error.message || 'There was an error creating the emoji.',
				variant: 'destructive'
			});
		}
	});

	// Update emoji mutation
	const updateEmojiMutation = useMutation({
		mutationFn: ({ id, emoji }: { id: EmojiId; emoji: EmojiFormValues }) =>
			apiRequest(`/api/admin/emojis/${id}`, {
				method: 'PUT',
				data: {
					...emoji,
					url: emoji.imageUrl,
					preview_url: emoji.previewUrl,
					is_locked: emoji.isLocked,
					unlock_type: emoji.unlockType,
					price_dgt: emoji.priceDgt,
					required_path_xp: emoji.requiredPathXP
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/emojis'] });
			setIsOpen(false);
			setCurrentEmoji(null);
			toast({
				title: 'Emoji updated',
				description: 'The emoji has been updated successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to update emoji',
				description: error.message || 'There was an error updating the emoji.',
				variant: 'destructive'
			});
		}
	});

	// Delete emoji mutation
	const deleteEmojiMutation = useMutation({
		mutationFn: (id: EmojiId) =>
			apiRequest(`/api/admin/emojis/${id}`, {
				method: 'DELETE'
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/emojis'] });
			setIsDeleteOpen(false);
			setCurrentEmoji(null);
			toast({
				title: 'Emoji deleted',
				description: 'The emoji has been deleted successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to delete emoji',
				description: error.message || 'There was an error deleting the emoji.',
				variant: 'destructive'
			});
		}
	});

	// Form definition
	const form = useForm<EmojiFormValues>({
		resolver: zodResolver(emojiFormSchema),
		defaultValues: {
			name: '',
			code: '',
			imageUrl: '',
			previewUrl: '',
			category: 'standard',
			isLocked: true,
			unlockType: 'free',
			type: 'static',
			priceDgt: null,
			requiredPathXP: null
		}
	});

	// Handle edit emoji
	const handleEditEmoji = (emoji: Emoji) => {
		setCurrentEmoji(emoji);
		form.reset({
			name: emoji.name,
			code: emoji.code,
			imageUrl: emoji.imageUrl,
			previewUrl: emoji.previewUrl || '',
			category: emoji.category,
			isLocked: emoji.isLocked,
			unlockType: emoji.unlockType,
			type: emoji.type,
			priceDgt: emoji.priceDgt,
			requiredPathXP: emoji.requiredPathXP
		});
		setIsOpen(true);
	};

	// Handle new emoji
	const handleNewEmoji = () => {
		setCurrentEmoji(null);
		form.reset({
			name: '',
			code: '',
			imageUrl: '',
			previewUrl: '',
			category: 'standard',
			isLocked: true,
			unlockType: 'free',
			type: 'static',
			priceDgt: null,
			requiredPathXP: null
		});
		setIsOpen(true);
	};

	// Form submission
	const onSubmit = (values: EmojiFormValues) => {
		if (currentEmoji) {
			updateEmojiMutation.mutate({ id: currentEmoji.id, emoji: values });
		} else {
			createEmojiMutation.mutate(values);
		}
	};

	// Delete emoji
	const handleDeleteEmoji = (emoji: Emoji) => {
		setCurrentEmoji(emoji);
		setIsDeleteOpen(true);
	};

	const confirmDelete = () => {
		if (currentEmoji) {
			deleteEmojiMutation.mutate(currentEmoji.id);
		}
	};

	// Group emojis by category for display
	const emojisGroupedByCategory = () => {
		if (!emojis) return {};

		return emojis.reduce((acc: { [key: string]: Emoji[] }, emoji: Emoji) => {
			const category = emoji.category || 'standard';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(emoji);
			return acc;
		}, {});
	};

	// Component to preview emoji
	const EmojiPreview = ({ emoji }: { emoji: Emoji }) => {
		return (
			<div className="w-10 h-10 flex items-center justify-center">
				<MediaAsset url={emoji.previewUrl || emoji.imageUrl} mediaType={emoji.type} size={32} />
			</div>
		);
	};

	const pageActions = (
		<div className="flex gap-2">
			<Button onClick={handleNewEmoji}>
				<Plus className="mr-2 h-4 w-4" /> Add New Emoji
			</Button>
			<Button variant="secondary" onClick={() => setIsMediaModalOpen(true)}>
				<Image className="mr-2 h-4 w-4" /> Upload .lottie
			</Button>
		</div>
	);

	return (
		<AdminPageShell title="Emoji Management" pageActions={pageActions}>
			<div className="space-y-6">
				{isLoading ? (
					<div className="text-center p-8">Loading emojis...</div>
				) : (
					<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="mb-4">
							<TabsTrigger value="all">All Emojis</TabsTrigger>
							<TabsTrigger value="static">Static</TabsTrigger>
							<TabsTrigger value="lottie">Lottie</TabsTrigger>
							<TabsTrigger value="locked">Locked</TabsTrigger>
						</TabsList>

						<TabsContent value="all">
							<Card>
								<CardHeader>
									<CardTitle>All Emojis</CardTitle>
									<CardDescription>Manage all emojis available in the system.</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-8">
										{Object.entries(emojisGroupedByCategory()).map(([category, categoryEmojis]) => (
											<div key={category} className="space-y-4">
												<h3 className="text-lg font-semibold capitalize">{category}</h3>
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Preview</TableHead>
															<TableHead>Name</TableHead>
															<TableHead>Code</TableHead>
															<TableHead>Type</TableHead>
															<TableHead>Unlock Method</TableHead>
															<TableHead>Actions</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{categoryEmojis.map((emoji: Emoji) => (
															<TableRow key={emoji.id}>
																<TableCell>
																	<EmojiPreview emoji={emoji} />
																</TableCell>
																<TableCell>{emoji.name}</TableCell>
																<TableCell>{emoji.code}</TableCell>
																<TableCell className="capitalize">{emoji.type}</TableCell>
																<TableCell className="capitalize">
																	{emoji.isLocked ? emoji.unlockType : 'Free'}
																	{emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
																</TableCell>
																<TableCell>
																	<div className="flex gap-2">
																		<Button
																			variant="outline"
																			size="icon"
																			onClick={() => handleEditEmoji(emoji)}
																		>
																			<Pencil className="h-4 w-4" />
																		</Button>
																		<Button
																			variant="destructive"
																			size="icon"
																			onClick={() => handleDeleteEmoji(emoji)}
																		>
																			<Trash className="h-4 w-4" />
																		</Button>
																	</div>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="static">
							<Card>
								<CardHeader>
									<CardTitle>Static Emojis</CardTitle>
									<CardDescription>Standard static image emojis.</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Preview</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Code</TableHead>
												<TableHead>Category</TableHead>
												<TableHead>Unlock Method</TableHead>
												<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{emojis
												?.filter((emoji: Emoji) => emoji.type === 'static')
												.map((emoji: Emoji) => (
													<TableRow key={emoji.id}>
														<TableCell>
															<div className="w-10 h-10 flex items-center justify-center">
																<img
																	src={emoji.imageUrl}
																	alt={emoji.name}
																	className="max-w-full max-h-full"
																/>
															</div>
														</TableCell>
														<TableCell>{emoji.name}</TableCell>
														<TableCell>{emoji.code}</TableCell>
														<TableCell className="capitalize">{emoji.category}</TableCell>
														<TableCell className="capitalize">
															{emoji.isLocked ? emoji.unlockType : 'Free'}
															{emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
														</TableCell>
														<TableCell>
															<div className="flex gap-2">
																<Button
																	variant="outline"
																	size="icon"
																	onClick={() => handleEditEmoji(emoji)}
																>
																	<Pencil className="h-4 w-4" />
																</Button>
																<Button
																	variant="destructive"
																	size="icon"
																	onClick={() => handleDeleteEmoji(emoji)}
																>
																	<Trash className="h-4 w-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="lottie">
							<Card>
								<CardHeader>
									<CardTitle>Lottie Emojis</CardTitle>
									<CardDescription>Animated Lottie-based emojis.</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Preview</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Code</TableHead>
												<TableHead>Category</TableHead>
												<TableHead>Unlock Method</TableHead>
												<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{emojis
												?.filter((emoji: Emoji) => emoji.type === 'lottie')
												.map((emoji: Emoji) => (
													<TableRow key={emoji.id}>
														<TableCell>
															<EmojiPreview emoji={emoji} />
														</TableCell>
														<TableCell>{emoji.name}</TableCell>
														<TableCell>{emoji.code}</TableCell>
														<TableCell className="capitalize">{emoji.category}</TableCell>
														<TableCell className="capitalize">
															{emoji.isLocked ? emoji.unlockType : 'Free'}
															{emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
														</TableCell>
														<TableCell>
															<div className="flex gap-2">
																<Button
																	variant="outline"
																	size="icon"
																	onClick={() => handleEditEmoji(emoji)}
																>
																	<Pencil className="h-4 w-4" />
																</Button>
																<Button
																	variant="destructive"
																	size="icon"
																	onClick={() => handleDeleteEmoji(emoji)}
																>
																	<Trash className="h-4 w-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="locked">
							<Card>
								<CardHeader>
									<CardTitle>Locked Emojis</CardTitle>
									<CardDescription>
										Emojis that require unlocking through various methods.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Preview</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Code</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Category</TableHead>
												<TableHead>Unlock Method</TableHead>
												<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{emojis
												?.filter((emoji: Emoji) => emoji.isLocked)
												.map((emoji: Emoji) => (
													<TableRow key={emoji.id}>
														<TableCell>
															<EmojiPreview emoji={emoji} />
														</TableCell>
														<TableCell>{emoji.name}</TableCell>
														<TableCell>{emoji.code}</TableCell>
														<TableCell className="capitalize">{emoji.type}</TableCell>
														<TableCell className="capitalize">{emoji.category}</TableCell>
														<TableCell className="capitalize">
															{emoji.unlockType}
															{emoji.priceDgt && ` (${emoji.priceDgt} DGT)`}
															{emoji.requiredPathXP && ` (${emoji.requiredPathXP} XP)`}
														</TableCell>
														<TableCell>
															<div className="flex gap-2">
																<Button
																	variant="outline"
																	size="icon"
																	onClick={() => handleEditEmoji(emoji)}
																>
																	<Pencil className="h-4 w-4" />
																</Button>
																<Button
																	variant="destructive"
																	size="icon"
																	onClick={() => handleDeleteEmoji(emoji)}
																>
																	<Trash className="h-4 w-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</div>

			{/* Dialog for adding/editing emoji */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{currentEmoji ? 'Edit Emoji' : 'Add New Emoji'}</DialogTitle>
						<DialogDescription>
							{currentEmoji
								? 'Update the details for this emoji.'
								: 'Fill in the details to create a new emoji.'}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="Smile" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Code</FormLabel>
											<FormControl>
												<Input placeholder=":smile:" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="basic">Basic</SelectItem>
													<SelectItem value="premium">Premium</SelectItem>
													<SelectItem value="special">Special</SelectItem>
													<SelectItem value="seasonal">Seasonal</SelectItem>
													<SelectItem value="crypto">Crypto</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="static">Static</SelectItem>
													<SelectItem value="lottie">Lottie</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image URL</FormLabel>
										<FormControl>
											<Input placeholder="https://example.com/emoji.svg" {...field} />
										</FormControl>
										<FormDescription>URL to the static image for this emoji.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{form.watch('type') === 'lottie' && (
								<FormField
									control={form.control}
									name="previewUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lottie Animation JSON URL</FormLabel>
											<FormControl>
												<Input placeholder="https://example.com/animation.json" {...field} />
											</FormControl>
											<FormDescription>URL to the Lottie animation JSON file.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name="isLocked"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Locked Emoji</FormLabel>
											<FormDescription>Determine if this emoji requires unlocking.</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>

							{form.watch('isLocked') && (
								<>
									<FormField
										control={form.control}
										name="unlockType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Unlock Method</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select unlock method" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="free">Free</SelectItem>
														<SelectItem value="shop">Shop Purchase</SelectItem>
														<SelectItem value="xp">XP Achievement</SelectItem>
														<SelectItem value="event">Special Event</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{form.watch('unlockType') === 'shop' && (
										<FormField
											control={form.control}
											name="priceDgt"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Price (DGT)</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="100"
															{...field}
															onChange={(e) =>
																field.onChange(e.target.value ? Number(e.target.value) : undefined)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{form.watch('unlockType') === 'xp' && (
										<FormField
											control={form.control}
											name="requiredPathXP"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Required XP</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder="1000"
															{...field}
															onChange={(e) =>
																field.onChange(e.target.value ? Number(e.target.value) : undefined)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</>
							)}

							<DialogFooter>
								<Button
									type="submit"
									disabled={createEmojiMutation.isPending || updateEmojiMutation.isPending}
								>
									{createEmojiMutation.isPending || updateEmojiMutation.isPending
										? 'Saving...'
										: currentEmoji
											? 'Update Emoji'
											: 'Add Emoji'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the emoji "{currentEmoji?.name}"? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteEmojiMutation.isPending}
						>
							{deleteEmojiMutation.isPending ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<MediaLibraryModal
				open={isMediaModalOpen}
				onClose={() => setIsMediaModalOpen(false)}
				onUploaded={(media) => {
					// optimistically push into emoji grid as static name; user can edit later
					queryClient.invalidateQueries({ queryKey: ['/api/admin/emojis'] });
				}}
			/>
		</AdminPageShell>
	);
}
