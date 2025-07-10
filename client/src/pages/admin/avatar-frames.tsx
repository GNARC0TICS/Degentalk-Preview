import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { rarityColorMap } from '@/config/rarity.config';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Eye, Users as UsersIcon } from 'lucide-react';
import { FramedAvatar } from '@/components/users/framed-avatar';
import { GrantFrameModal } from '@/features/admin/components/GrantFrameModal';
import type { AvatarFrame } from '@/types/compat/avatar';
import type { FrameId } from '@shared/types/ids';

interface CreateFrameData {
	name: string;
	imageUrl: string;
	rarity: string;
	animated: boolean;
}

export default function AdminAvatarFramesPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingFrame, setEditingFrame] = useState<AvatarFrame | null>(null);
	const [previewFrame, setPreviewFrame] = useState<AvatarFrame | null>(null);
	const [grantFrame, setGrantFrame] = useState<AvatarFrame | null>(null);

	// Form state
	const [formData, setFormData] = useState<CreateFrameData>({
		name: '',
		imageUrl: '',
		rarity: 'common',
		animated: false
	});

	// Fetch avatar frames
	const {
		data: frames = [],
		isLoading,
		refetch
	} = useQuery<AvatarFrame[]>({
		queryKey: ['admin', 'avatar-frames'],
		queryFn: () => apiRequest({ url: '/api/admin/avatar-frames', method: 'GET' })
	});

	// Create frame mutation
	const createMutation = useMutation<AvatarFrame, Error, CreateFrameData>({
		mutationFn: (data) =>
			apiRequest({
				url: '/api/admin/avatar-frames',
				method: 'POST',
				data
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'avatar-frames'] });
			setIsCreateDialogOpen(false);
			resetForm();
			toast({
				title: 'Success',
				description: 'Avatar frame created successfully'
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create avatar frame',
				variant: 'destructive'
			});
		}
	});

	// Update frame mutation
	const updateMutation = useMutation<AvatarFrame, Error, { id: string; data: CreateFrameData }>({
		mutationFn: ({ id, data }) =>
			apiRequest({ url: `/api/admin/avatar-frames/${id}`,
				method: 'PUT',
				data
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'avatar-frames'] });
			setEditingFrame(null);
			resetForm();
			toast({
				title: 'Success',
				description: 'Avatar frame updated successfully'
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update avatar frame',
				variant: 'destructive'
			});
		}
	});

	// Delete frame mutation
	const deleteMutation = useMutation<void, Error, FrameId>({
		mutationFn: (id) =>
			apiRequest({ url: `/api/admin/avatar-frames/${id}`, method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'avatar-frames'] });
			toast({
				title: 'Success',
				description: 'Avatar frame deleted successfully'
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to delete avatar frame',
				variant: 'destructive'
			});
		}
	});

	const resetForm = () => {
		setFormData({
			name: '',
			imageUrl: '',
			rarity: 'common',
			animated: false
		});
	};

	const handleEdit = (frame: AvatarFrame) => {
		setFormData({
			name: frame.name,
			imageUrl: frame.imageUrl,
			rarity: frame.rarity,
			animated: frame.animated
		});
		setEditingFrame(frame);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editingFrame) {
			updateMutation.mutate({ id: editingFrame.id, data: formData });
		} else {
			createMutation.mutate(formData);
		}
	};

	const handleDelete = (frame: AvatarFrame) => {
		if (window.confirm(`Are you sure you want to delete the frame "${frame.name}"?`)) {
			deleteMutation.mutate(frame.id);
		}
	};

	const isSubmitting =
		createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">Avatar Frames</h1>
					<p className="text-muted-foreground">Manage avatar frames available in the shop</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Create Frame
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Avatar Frame</DialogTitle>
							<DialogDescription>Add a new avatar frame to the shop.</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="Frame name..."
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="imageUrl">Image URL</Label>
									<Input
										id="imageUrl"
										value={formData.imageUrl}
										onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
										placeholder="/assets/frames/my-frame.svg"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="rarity">Rarity</Label>
									<Select
										value={formData.rarity}
										onValueChange={(value) => setFormData({ ...formData, rarity: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="common">Common</SelectItem>
											<SelectItem value="rare">Rare</SelectItem>
											<SelectItem value="epic">Epic</SelectItem>
											<SelectItem value="legendary">Legendary</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="animated"
										checked={formData.animated}
										onChange={(e) => setFormData({ ...formData, animated: e.target.checked })}
									/>
									<Label htmlFor="animated">Animated</Label>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit" disabled={isSubmitting}>
									Create Frame
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Frames Table */}
			<Card>
				<CardHeader>
					<CardTitle>Avatar Frames ({frames.length})</CardTitle>
					<CardDescription>Manage all avatar frames available in the shop</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Preview</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Rarity</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{frames.map((frame) => (
								<TableRow key={frame.id}>
									<TableCell>
										<FramedAvatar
											avatarUrl="https://i.pravatar.cc/100"
											frameUrl={frame.imageUrl}
											username="Preview"
											size="sm"
										/>
									</TableCell>
									<TableCell className="font-medium">{frame.name}</TableCell>
									<TableCell>
										<Badge className={rarityColorMap[frame.rarity as keyof typeof rarityColorMap]}>
											{frame.rarity}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={frame.animated ? 'default' : 'secondary'}>
											{frame.animated ? 'Animated' : 'Static'}
										</Badge>
									</TableCell>
									<TableCell>{new Date(frame.createdAt).toLocaleDateString()}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end space-x-2">
											<Button variant="outline" size="sm" onClick={() => setPreviewFrame(frame)}>
												<Eye className="h-4 w-4" />
											</Button>
											<Button variant="outline" size="sm" onClick={() => handleEdit(frame)}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button variant="outline" size="sm" onClick={() => setGrantFrame(frame)}>
												<UsersIcon className="h-4 w-4" />
											</Button>
											<Button variant="destructive" size="sm" onClick={() => handleDelete(frame)}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={!!editingFrame} onOpenChange={() => setEditingFrame(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Avatar Frame</DialogTitle>
						<DialogDescription>Update the avatar frame details.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-name">Name</Label>
								<Input
									id="edit-name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-imageUrl">Image URL</Label>
								<Input
									id="edit-imageUrl"
									value={formData.imageUrl}
									onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-rarity">Rarity</Label>
								<Select
									value={formData.rarity}
									onValueChange={(value) => setFormData({ ...formData, rarity: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="common">Common</SelectItem>
										<SelectItem value="rare">Rare</SelectItem>
										<SelectItem value="epic">Epic</SelectItem>
										<SelectItem value="legendary">Legendary</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="edit-animated"
									checked={formData.animated}
									onChange={(e) => setFormData({ ...formData, animated: e.target.checked })}
								/>
								<Label htmlFor="edit-animated">Animated</Label>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={isSubmitting}>
								Update Frame
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={!!previewFrame} onOpenChange={() => setPreviewFrame(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Preview: {previewFrame?.name}</DialogTitle>
						<DialogDescription>
							See how this frame looks with different avatar sizes
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="flex items-center justify-center space-x-4">
							<div className="text-center">
								<FramedAvatar
									avatarUrl="https://i.pravatar.cc/100"
									frameUrl={previewFrame?.imageUrl || ''}
									username="Preview"
									size="xs"
								/>
								<p className="text-sm mt-2">Extra Small</p>
							</div>
							<div className="text-center">
								<FramedAvatar
									avatarUrl="https://i.pravatar.cc/100"
									frameUrl={previewFrame?.imageUrl || ''}
									username="Preview"
									size="sm"
								/>
								<p className="text-sm mt-2">Small</p>
							</div>
							<div className="text-center">
								<FramedAvatar
									avatarUrl="https://i.pravatar.cc/100"
									frameUrl={previewFrame?.imageUrl || ''}
									username="Preview"
									size="md"
								/>
								<p className="text-sm mt-2">Medium</p>
							</div>
							<div className="text-center">
								<FramedAvatar
									avatarUrl="https://i.pravatar.cc/100"
									frameUrl={previewFrame?.imageUrl || ''}
									username="Preview"
									size="lg"
								/>
								<p className="text-sm mt-2">Large</p>
							</div>
							<div className="text-center">
								<FramedAvatar
									avatarUrl="https://i.pravatar.cc/100"
									frameUrl={previewFrame?.imageUrl || ''}
									username="Preview"
									size="xl"
								/>
								<p className="text-sm mt-2">Extra Large</p>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Grant Modal */}
			<GrantFrameModal
				frame={grantFrame}
				open={!!grantFrame}
				onClose={() => setGrantFrame(null)}
				onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'avatar-frames'] })}
			/>
		</div>
	);
}
