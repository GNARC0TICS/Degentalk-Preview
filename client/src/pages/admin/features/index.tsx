import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiRequest } from '@/lib/queryClient';
import { ArrowUpDown, Lock, CheckCircle, Edit, Save, Plus, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Feature gate types
interface FeatureGate {
	id: string;
	name: string;
	description: string;
	minLevel: number;
	badgeRequired?: string;
	enabled: boolean;
}

/**
 * Admin page for managing feature gates
 */
export default function FeatureGatesPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingFeature, setEditingFeature] = useState<FeatureGate | null>(null);

	// Fetch feature gates
	const {
		data: featureGates,
		isLoading,
		error
	} = useQuery<FeatureGate[]>('adminFeatureGates', async () => apiRequest('/api/features/gates'));

	// Update feature gate mutation
	const updateFeatureMutation = useMutation({
		mutationFn: async (feature: FeatureGate) => {
			return apiRequest('PUT', `/api/admin/features/gates/${feature.id}`, feature);
		},
		onSuccess: () => {
			toast({
				title: 'Feature updated',
				description: 'Feature gate settings have been updated successfully'
			});
			queryClient.invalidateQueries('adminFeatureGates');
			setDialogOpen(false);
			setEditingFeature(null);
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to update feature: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Toggle feature enabled state
	const toggleFeatureMutation = useMutation({
		mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
			return apiRequest('PATCH', `/api/admin/features/gates/${id}/toggle`, { enabled });
		},
		onSuccess: () => {
			queryClient.invalidateQueries('adminFeatureGates');
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to toggle feature: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Create feature gate mutation
	const createFeatureMutation = useMutation({
		mutationFn: async (feature: Omit<FeatureGate, 'id'> & { id?: string }) => {
			return apiRequest('POST', `/api/admin/features/gates`, feature);
		},
		onSuccess: () => {
			toast({
				title: 'Feature created',
				description: 'New feature gate has been created successfully'
			});
			queryClient.invalidateQueries('adminFeatureGates');
			setDialogOpen(false);
			setEditingFeature(null);
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to create feature: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Handle edit button click
	const handleEdit = (feature: FeatureGate) => {
		setEditingFeature({ ...feature });
		setDialogOpen(true);
	};

	// Handle create new button click
	const handleCreateNew = () => {
		setEditingFeature({
			id: '',
			name: '',
			description: '',
			minLevel: 1,
			enabled: true
		});
		setDialogOpen(true);
	};

	// Handle save changes
	const handleSave = () => {
		if (!editingFeature) return;

		if (editingFeature.id) {
			updateFeatureMutation.mutate(editingFeature);
		} else {
			createFeatureMutation.mutate(editingFeature);
		}
	};

	// Handle toggle feature enabled
	const handleToggleFeature = (id: string, currentEnabled: boolean) => {
		toggleFeatureMutation.mutate({ id, enabled: !currentEnabled });
	};

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Feature Gates</h2>
					<Button onClick={handleCreateNew}>
						<Plus className="mr-2 h-4 w-4" />
						New Feature Gate
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>XP-Based Feature Access Control</CardTitle>
						<CardDescription>
							Manage which features are accessible based on user XP levels and badges
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="animate-pulse space-y-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-14 bg-zinc-800/50 rounded-md" />
								))}
							</div>
						) : error ? (
							<div className="p-4 text-center text-red-500">
								Error loading feature gates. Please try refreshing the page.
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[250px]">Feature</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-[150px]">
											<div className="flex items-center">
												<ArrowUpDown className="h-4 w-4 mr-1" />
												Level Required
											</div>
										</TableHead>
										<TableHead className="w-[100px]">Status</TableHead>
										<TableHead className="w-[120px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{featureGates?.map((feature) => (
										<TableRow key={feature.id}>
											<TableCell className="font-medium">
												<div className="flex items-center">
													<Lock className="h-4 w-4 mr-2 text-blue-500" />
													{feature.name}
												</div>
												<div className="text-xs text-muted-foreground mt-1">ID: {feature.id}</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">{feature.description}</div>
												{feature.badgeRequired && (
													<Badge variant="outline" className="mt-1">
														<Shield className="h-3 w-3 mr-1" />
														{feature.badgeRequired}
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<Badge className="bg-emerald-600/20 text-emerald-500 border-emerald-800">
													Level {feature.minLevel}+
												</Badge>
											</TableCell>
											<TableCell>
												<Switch
													checked={feature.enabled}
													onCheckedChange={() => handleToggleFeature(feature.id, feature.enabled)}
												/>
											</TableCell>
											<TableCell>
												<Button variant="outline" size="sm" onClick={() => handleEdit(feature)}>
													<Edit className="h-4 w-4 mr-1" />
													Edit
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
					<CardFooter className="border-t px-6 py-4">
						<p className="text-sm text-muted-foreground">
							Features are automatically checked when users attempt to access gated content.
						</p>
					</CardFooter>
				</Card>

				{/* Edit/Create Dialog */}
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>
								{editingFeature?.id ? 'Edit Feature Gate' : 'Create Feature Gate'}
							</DialogTitle>
							<DialogDescription>
								{editingFeature?.id
									? 'Update the settings for this feature gate'
									: 'Configure a new feature gate with level requirements'}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							{editingFeature?.id && (
								<div className="grid grid-cols-4 items-center gap-2">
									<Label className="text-sm" htmlFor="id">
										Feature ID
									</Label>
									<Input
										id="id"
										value={editingFeature.id}
										readOnly
										disabled
										className="col-span-3 bg-zinc-900"
									/>
								</div>
							)}

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="name">
									Feature Name
								</Label>
								<Input
									id="name"
									value={editingFeature?.name || ''}
									onChange={(e) =>
										setEditingFeature((prev) => (prev ? { ...prev, name: e.target.value } : null))
									}
									className="col-span-3"
									placeholder="e.g. Custom Emoji"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="featureId">
									Feature ID
								</Label>
								<Input
									id="featureId"
									value={editingFeature?.id || ''}
									onChange={(e) =>
										setEditingFeature((prev) => (prev ? { ...prev, id: e.target.value } : null))
									}
									className="col-span-3"
									placeholder="e.g. custom_emoji"
									disabled={!!editingFeature?.id}
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="description">
									Description
								</Label>
								<Input
									id="description"
									value={editingFeature?.description || ''}
									onChange={(e) =>
										setEditingFeature((prev) =>
											prev ? { ...prev, description: e.target.value } : null
										)
									}
									className="col-span-3"
									placeholder="e.g. Allows users to use custom emoji in posts"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="minLevel">
									Min Level
								</Label>
								<Input
									id="minLevel"
									type="number"
									min={1}
									max={100}
									value={editingFeature?.minLevel || 1}
									onChange={(e) =>
										setEditingFeature((prev) =>
											prev ? { ...prev, minLevel: parseInt(e.target.value) } : null
										)
									}
									className="col-span-3"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="badgeRequired">
									Badge Required
								</Label>
								<Input
									id="badgeRequired"
									value={editingFeature?.badgeRequired || ''}
									onChange={(e) =>
										setEditingFeature((prev) =>
											prev ? { ...prev, badgeRequired: e.target.value } : null
										)
									}
									className="col-span-3"
									placeholder="(Optional) e.g. Style Master"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-2">
								<Label className="text-sm" htmlFor="enabled">
									Enabled
								</Label>
								<div className="col-span-3 flex items-center">
									<Switch
										id="enabled"
										checked={editingFeature?.enabled}
										onCheckedChange={(checked) =>
											setEditingFeature((prev) => (prev ? { ...prev, enabled: checked } : null))
										}
									/>
									<span className="ml-2 text-sm text-muted-foreground">
										{editingFeature?.enabled ? 'Feature is active' : 'Feature is disabled'}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						<DialogFooter>
							<Button variant="outline" onClick={() => setDialogOpen(false)}>
								<X className="h-4 w-4 mr-1" />
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={!editingFeature?.name || !editingFeature?.id}>
								<Save className="h-4 w-4 mr-1" />
								{editingFeature?.id ? 'Save Changes' : 'Create Feature'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
	);
}
