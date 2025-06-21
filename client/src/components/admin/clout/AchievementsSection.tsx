import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Trophy,
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	Power,
	PowerOff,
	Zap,
	Target,
	Award
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CloutAchievement } from '@/pages/admin/clout';

interface AchievementsSectionProps {
	achievements: CloutAchievement[];
	isLoading: boolean;
}

const achievementSchema = z.object({
	achievementKey: z
		.string()
		.min(1, 'Achievement key is required')
		.regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().optional(),
	cloutReward: z.number().min(0, 'Clout reward must be positive'),
	criteriaType: z.string().optional(),
	criteriaValue: z.number().optional(),
	enabled: z.boolean().default(true),
	iconUrl: z.string().url().optional().or(z.literal(''))
});

type AchievementForm = z.infer<typeof achievementSchema>;

const CRITERIA_TYPES = [
	{ value: 'likes_received', label: 'Likes Received', description: 'Total likes on user posts' },
	{ value: 'thread_likes', label: 'Thread Likes', description: 'Total likes on user threads' },
	{ value: 'posts_count', label: 'Posts Count', description: 'Total number of posts created' },
	{
		value: 'threads_count',
		label: 'Threads Count',
		description: 'Total number of threads created'
	},
	{ value: 'xp_earned', label: 'XP Earned', description: 'Total XP accumulated' },
	{ value: 'days_active', label: 'Days Active', description: 'Number of active days on platform' },
	{
		value: 'referrals_made',
		label: 'Referrals Made',
		description: 'Number of successful referrals'
	},
	{
		value: 'shop_purchases',
		label: 'Shop Purchases',
		description: 'Number of shop items purchased'
	},
	{ value: 'dgt_earned', label: 'DGT Earned', description: 'Total DGT tokens earned' }
];

export function AchievementsSection({ achievements, isLoading }: AchievementsSectionProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedAchievement, setSelectedAchievement] = useState<CloutAchievement | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const form = useForm<AchievementForm>({
		resolver: zodResolver(achievementSchema),
		defaultValues: {
			achievementKey: '',
			name: '',
			description: '',
			cloutReward: 10,
			criteriaType: '',
			criteriaValue: 1,
			enabled: true,
			iconUrl: ''
		}
	});

	// Create achievement mutation
	const createAchievementMutation = useMutation({
		mutationFn: async (data: AchievementForm) => {
			return apiRequest({
				url: '/api/admin/clout/achievements',
				method: 'POST',
				data
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-clout-achievements'] });
			setIsCreateDialogOpen(false);
			form.reset();
			toast({
				title: 'Achievement Created',
				description: 'New achievement has been created successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Creation Failed',
				description: error.message || 'Failed to create achievement',
				variant: 'destructive'
			});
		}
	});

	// Update achievement mutation
	const updateAchievementMutation = useMutation({
		mutationFn: async (data: AchievementForm & { id: number }) => {
			const { id, ...updateData } = data;
			return apiRequest({
				url: `/api/admin/clout/achievements/${id}`,
				method: 'PUT',
				data: updateData
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-clout-achievements'] });
			setIsEditDialogOpen(false);
			setSelectedAchievement(null);
			toast({
				title: 'Achievement Updated',
				description: 'Achievement has been updated successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Update Failed',
				description: error.message || 'Failed to update achievement',
				variant: 'destructive'
			});
		}
	});

	// Delete achievement mutation
	const deleteAchievementMutation = useMutation({
		mutationFn: async (id: number) => {
			return apiRequest({
				url: `/api/admin/clout/achievements/${id}`,
				method: 'DELETE'
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-clout-achievements'] });
			setIsDeleteDialogOpen(false);
			setSelectedAchievement(null);
			toast({
				title: 'Achievement Deleted',
				description: 'Achievement has been deleted successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Delete Failed',
				description: error.message || 'Failed to delete achievement',
				variant: 'destructive'
			});
		}
	});

	// Toggle achievement mutation
	const toggleAchievementMutation = useMutation({
		mutationFn: async (id: number) => {
			return apiRequest({
				url: `/api/admin/clout/achievements/${id}/toggle`,
				method: 'POST'
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-clout-achievements'] });
			toast({
				title: 'Achievement Toggled',
				description: 'Achievement status has been updated.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Toggle Failed',
				description: error.message || 'Failed to toggle achievement',
				variant: 'destructive'
			});
		}
	});

	const handleCreateAchievement = () => {
		form.reset();
		setIsCreateDialogOpen(true);
	};

	const handleEditAchievement = (achievement: CloutAchievement) => {
		setSelectedAchievement(achievement);
		form.reset({
			achievementKey: achievement.achievementKey,
			name: achievement.name,
			description: achievement.description || '',
			cloutReward: achievement.cloutReward,
			criteriaType: achievement.criteriaType || '',
			criteriaValue: achievement.criteriaValue || 1,
			enabled: achievement.enabled,
			iconUrl: achievement.iconUrl || ''
		});
		setIsEditDialogOpen(true);
	};

	const handleDeleteAchievement = (achievement: CloutAchievement) => {
		setSelectedAchievement(achievement);
		setIsDeleteDialogOpen(true);
	};

	const handleToggleAchievement = (achievement: CloutAchievement) => {
		toggleAchievementMutation.mutate(achievement.id);
	};

	const onCreateSubmit = (data: AchievementForm) => {
		createAchievementMutation.mutate(data);
	};

	const onEditSubmit = (data: AchievementForm) => {
		if (selectedAchievement) {
			updateAchievementMutation.mutate({ ...data, id: selectedAchievement.id });
		}
	};

	const confirmDelete = () => {
		if (selectedAchievement) {
			deleteAchievementMutation.mutate(selectedAchievement.id);
		}
	};

	const getCriteriaTypeLabel = (type?: string) => {
		const criteriaType = CRITERIA_TYPES.find((c) => c.value === type);
		return criteriaType?.label || type || 'Manual';
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<p>Loading achievements...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5" />
								Clout Achievements
							</CardTitle>
							<CardDescription>
								Create and manage achievements that award clout to users
							</CardDescription>
						</div>
						<Button onClick={handleCreateAchievement}>
							<Plus className="h-4 w-4 mr-2" />
							Create Achievement
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Achievement</TableHead>
									<TableHead>Criteria</TableHead>
									<TableHead>Clout Reward</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{achievements.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8">
											<div className="flex flex-col items-center gap-2">
												<Trophy className="h-8 w-8 text-muted-foreground" />
												<p className="text-muted-foreground">No achievements created yet</p>
												<Button variant="outline" onClick={handleCreateAchievement}>
													Create First Achievement
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									achievements.map((achievement) => (
										<TableRow key={achievement.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													{achievement.iconUrl ? (
														<img
															src={achievement.iconUrl}
															alt={achievement.name}
															className="w-8 h-8 rounded"
														/>
													) : (
														<div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
															<Award className="h-4 w-4" />
														</div>
													)}
													<div>
														<p className="font-medium">{achievement.name}</p>
														<p className="text-sm text-muted-foreground">
															{achievement.achievementKey}
														</p>
														{achievement.description && (
															<p className="text-xs text-muted-foreground mt-1">
																{achievement.description}
															</p>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<Badge variant="outline">
														{getCriteriaTypeLabel(achievement.criteriaType)}
													</Badge>
													{achievement.criteriaValue && (
														<p className="text-xs text-muted-foreground">
															Threshold: {achievement.criteriaValue}
														</p>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="flex items-center gap-1">
													<Zap className="h-3 w-3" />
													{achievement.cloutReward}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{achievement.enabled ? (
														<Badge variant="default">Enabled</Badge>
													) : (
														<Badge variant="secondary">Disabled</Badge>
													)}
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleToggleAchievement(achievement)}
														disabled={toggleAchievementMutation.isPending}
													>
														{achievement.enabled ? (
															<PowerOff className="h-3 w-3" />
														) : (
															<Power className="h-3 w-3" />
														)}
													</Button>
												</div>
											</TableCell>
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
														<DropdownMenuItem onClick={() => handleEditAchievement(achievement)}>
															<Edit className="h-4 w-4 mr-2" />
															Edit Achievement
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleDeleteAchievement(achievement)}
															className="text-red-600"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete Achievement
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Create Achievement Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Create New Achievement</DialogTitle>
						<DialogDescription>
							Create a new achievement that awards clout when users meet specific criteria.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Achievement Name</FormLabel>
											<FormControl>
												<Input placeholder="First Post" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="achievementKey"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Achievement Key</FormLabel>
											<FormControl>
												<Input placeholder="first_post" {...field} />
											</FormControl>
											<FormDescription>
												Unique identifier (lowercase, underscores only)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Awarded for creating your first post on the platform"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="cloutReward"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Clout Reward</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
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
									name="criteriaType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Criteria Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select criteria" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{CRITERIA_TYPES.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="criteriaValue"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Threshold Value</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="iconUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Icon URL (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="https://example.com/icon.png" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="enabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
											<div className="space-y-0.5">
												<FormLabel>Enabled</FormLabel>
												<FormDescription>Achievement is active and can be earned</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
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
								<Button type="submit" disabled={createAchievementMutation.isPending}>
									{createAchievementMutation.isPending ? 'Creating...' : 'Create Achievement'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Edit Achievement Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit Achievement</DialogTitle>
						<DialogDescription>Modify achievement settings and criteria.</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
							{/* Same form fields as create */}
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Achievement Name</FormLabel>
											<FormControl>
												<Input placeholder="First Post" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="achievementKey"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Achievement Key</FormLabel>
											<FormControl>
												<Input placeholder="first_post" {...field} />
											</FormControl>
											<FormDescription>
												Unique identifier (lowercase, underscores only)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Awarded for creating your first post on the platform"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="cloutReward"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Clout Reward</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="0"
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
									name="criteriaType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Criteria Type</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select criteria" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{CRITERIA_TYPES.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="criteriaValue"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Threshold Value</FormLabel>
											<FormControl>
												<Input
													type="number"
													min="1"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="iconUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Icon URL (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="https://example.com/icon.png" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="enabled"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
											<div className="space-y-0.5">
												<FormLabel>Enabled</FormLabel>
												<FormDescription>Achievement is active and can be earned</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={updateAchievementMutation.isPending}>
									{updateAchievementMutation.isPending ? 'Updating...' : 'Update Achievement'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Achievement Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Achievement</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this achievement? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{selectedAchievement && (
						<div className="py-4">
							<div className="flex items-center space-x-3 p-3 border rounded-md">
								{selectedAchievement.iconUrl ? (
									<img
										src={selectedAchievement.iconUrl}
										alt={selectedAchievement.name}
										className="w-8 h-8 rounded"
									/>
								) : (
									<div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
										<Award className="h-4 w-4" />
									</div>
								)}
								<div>
									<p className="font-medium">{selectedAchievement.name}</p>
									<p className="text-sm text-muted-foreground">
										{selectedAchievement.achievementKey}
									</p>
									<Badge variant="outline" className="mt-1">
										{selectedAchievement.cloutReward} clout reward
									</Badge>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteAchievementMutation.isPending}
						>
							{deleteAchievementMutation.isPending ? 'Deleting...' : 'Delete Achievement'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
