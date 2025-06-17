import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, Edit, Plus, Trash, CheckCircle, X, Save, RefreshCw, Filter } from 'lucide-react';
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for missions
interface Mission {
	id: number;
	title: string;
	description: string;
	type: string;
	requiredAction: string;
	requiredCount: number;
	xpReward: number;
	dgtReward?: number;
	badgeReward?: string;
	icon?: string;
	isDaily: boolean;
	isWeekly: boolean;
	expiresAt?: string;
	isActive: boolean;
	minLevel: number;
	sortOrder: number;
}

// Mission types
const MISSION_TYPES = [
	{ value: 'POST_CREATE', label: 'Create Post', icon: 'message-square-plus' },
	{ value: 'POST_LIKE', label: 'Like Post', icon: 'thumbs-up' },
	{ value: 'POST_REPLY', label: 'Reply to Post', icon: 'reply' },
	{ value: 'LOGIN', label: 'Login', icon: 'log-in' },
	{ value: 'PROFILE_UPDATE', label: 'Update Profile', icon: 'user' },
	{ value: 'THREAD_CREATE', label: 'Create Thread', icon: 'plus-circle' },
	{ value: 'THREAD_REPLY', label: 'Reply to Thread', icon: 'message-circle' },
	{ value: 'THREAD_VIEW', label: 'View Thread', icon: 'eye' },
	{ value: 'SHOP_PURCHASE', label: 'Shop Purchase', icon: 'shopping-cart' },
	{ value: 'BADGE_EARN', label: 'Earn Badge', icon: 'award' },
	{ value: 'DGT_TIP', label: 'DGT Tip', icon: 'gift' },
	{ value: 'DGT_RAIN', label: 'DGT Rain', icon: 'cloud-rain' }
];

/**
 * Admin page for managing missions
 */
export default function AdminMissionsPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);
	const [filter, setFilter] = useState<'all' | 'daily' | 'weekly'>('all');

	// Fetch all missions
	const {
		data: missions,
		isLoading,
		error
	} = useQuery<Mission[]>('adminMissions', async () => {
		return apiRequest('/api/missions/admin/all');
	});

	// Create mission mutation
	const createMissionMutation = useMutation({
		mutationFn: async (mission: Omit<Mission, 'id'>) => {
			return apiRequest('POST', '/api/missions/admin/create', mission);
		},
		onSuccess: () => {
			toast({
				title: 'Mission created',
				description: 'New mission has been created successfully'
			});
			queryClient.invalidateQueries('adminMissions');
			setDialogOpen(false);
			setEditingMission(null);
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to create mission: ${error.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Update mission mutation
	const updateMissionMutation = useMutation({
		mutationFn: async (mission: Mission) => {
			return apiRequest('PUT', `/api/missions/admin/${mission.id}`, mission);
		},
		onSuccess: () => {
			toast({
				title: 'Mission updated',
				description: 'Mission has been updated successfully'
			});
			queryClient.invalidateQueries('adminMissions');
			setDialogOpen(false);
			setEditingMission(null);
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to update mission: ${error.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Reset daily missions mutation
	const resetDailyMissionsMutation = useMutation({
		mutationFn: async () => {
			return apiRequest('POST', '/api/missions/admin/reset-daily');
		},
		onSuccess: () => {
			toast({
				title: 'Daily missions reset',
				description: 'Daily missions have been reset successfully'
			});
			queryClient.invalidateQueries('adminMissions');
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to reset daily missions: ${error.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Reset weekly missions mutation
	const resetWeeklyMissionsMutation = useMutation({
		mutationFn: async () => {
			return apiRequest('POST', '/api/missions/admin/reset-weekly');
		},
		onSuccess: () => {
			toast({
				title: 'Weekly missions reset',
				description: 'Weekly missions have been reset successfully'
			});
			queryClient.invalidateQueries('adminMissions');
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to reset weekly missions: ${error.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Initialize default missions mutation
	const initializeDefaultMissionsMutation = useMutation({
		mutationFn: async () => {
			return apiRequest('POST', '/api/missions/admin/initialize-defaults');
		},
		onSuccess: () => {
			toast({
				title: 'Default missions initialized',
				description: 'Default missions have been created successfully'
			});
			queryClient.invalidateQueries('adminMissions');
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to initialize default missions: ${error.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Handle edit button click
	const handleEdit = (mission: Mission) => {
		setEditingMission({ ...mission });
		setDialogOpen(true);
	};

	// Handle create new button click
	const handleCreateNew = () => {
		setEditingMission({
			title: '',
			description: '',
			type: MISSION_TYPES[0].value,
			requiredAction: '',
			requiredCount: 1,
			xpReward: 10,
			isDaily: true,
			isWeekly: false,
			isActive: true,
			minLevel: 1,
			sortOrder: 0
		});
		setDialogOpen(true);
	};

	// Handle save changes
	const handleSave = () => {
		if (!editingMission) return;

		if ('id' in editingMission && editingMission.id !== undefined) {
			updateMissionMutation.mutate(editingMission as Mission);
		} else {
			createMissionMutation.mutate(editingMission as Omit<Mission, 'id'>);
		}
	};

	// Filter missions based on selection
	const filteredMissions = missions?.filter((mission) => {
		if (filter === 'all') return true;
		if (filter === 'daily') return mission.isDaily;
		if (filter === 'weekly') return mission.isWeekly;
		return true;
	});

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Mission Management</h2>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => initializeDefaultMissionsMutation.mutate()}
							disabled={initializeDefaultMissionsMutation.isLoading}
						>
							<Trophy className="mr-2 h-4 w-4" />
							Initialize Defaults
						</Button>
						<Button onClick={handleCreateNew}>
							<Plus className="mr-2 h-4 w-4" />
							New Mission
						</Button>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Daily Missions & Quests</CardTitle>
						<CardDescription>
							Manage missions that players can complete to earn XP, DGT, and badges
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between mb-4">
							<div className="flex items-center">
								<Filter className="mr-2 h-4 w-4 text-zinc-500" />
								<Select value={filter} onValueChange={(value: any) => setFilter(value)}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter missions" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Missions</SelectItem>
										<SelectItem value="daily">Daily Missions</SelectItem>
										<SelectItem value="weekly">Weekly Missions</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => resetDailyMissionsMutation.mutate()}
									disabled={resetDailyMissionsMutation.isLoading}
								>
									<RefreshCw className="mr-2 h-4 w-4" />
									Reset Daily
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => resetWeeklyMissionsMutation.mutate()}
									disabled={resetWeeklyMissionsMutation.isLoading}
								>
									<RefreshCw className="mr-2 h-4 w-4" />
									Reset Weekly
								</Button>
							</div>
						</div>

						{isLoading ? (
							<div className="animate-pulse space-y-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-14 bg-zinc-800/50 rounded-md" />
								))}
							</div>
						) : error ? (
							<div className="p-4 text-center text-red-500">
								Error loading missions. Please try refreshing the page.
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[200px]">Mission</TableHead>
										<TableHead>Description</TableHead>
										<TableHead className="w-[80px]">Type</TableHead>
										<TableHead className="w-[70px]">Count</TableHead>
										<TableHead className="w-[70px]">XP</TableHead>
										<TableHead className="w-[70px]">DGT</TableHead>
										<TableHead className="w-[70px]">Level</TableHead>
										<TableHead className="w-[100px]">Status</TableHead>
										<TableHead className="w-[80px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredMissions?.map((mission) => (
										<TableRow key={mission.id}>
											<TableCell className="font-medium">{mission.title}</TableCell>
											<TableCell>{mission.description}</TableCell>
											<TableCell>
												<Badge
													variant={mission.isDaily ? 'default' : 'secondary'}
													className={
														mission.isDaily
															? 'bg-blue-900/50 text-blue-300'
															: 'bg-purple-900/50 text-purple-300'
													}
												>
													{mission.isDaily ? 'Daily' : 'Weekly'}
												</Badge>
											</TableCell>
											<TableCell className="text-center">{mission.requiredCount}</TableCell>
											<TableCell className="text-center">{mission.xpReward}</TableCell>
											<TableCell className="text-center">{mission.dgtReward || '-'}</TableCell>
											<TableCell className="text-center">{mission.minLevel}+</TableCell>
											<TableCell>
												<div className="flex items-center">
													<Switch
														checked={mission.isActive}
														onCheckedChange={(checked) => {
															updateMissionMutation.mutate({
																...mission,
																isActive: checked
															});
														}}
													/>
													<span className="ml-2 text-xs text-zinc-400">
														{mission.isActive ? 'Active' : 'Inactive'}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="icon" onClick={() => handleEdit(mission)}>
													<Edit className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Edit/Create Dialog */}
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>
								{'id' in editingMission && editingMission.id !== undefined
									? 'Edit Mission'
									: 'Create Mission'}
							</DialogTitle>
							<DialogDescription>
								{editingMission && 'id' in editingMission && editingMission.id !== undefined
									? 'Update the settings for this mission'
									: 'Configure a new mission with requirements and rewards'}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title">Mission Title</Label>
									<Input
										id="title"
										value={editingMission?.title || ''}
										onChange={(e) =>
											setEditingMission((prev) =>
												prev ? { ...prev, title: e.target.value } : null
											)
										}
										placeholder="e.g. Daily Login"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="type">Mission Type</Label>
									<Select
										value={editingMission?.type || MISSION_TYPES[0].value}
										onValueChange={(value) =>
											setEditingMission((prev) => (prev ? { ...prev, type: value } : null))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select mission type" />
										</SelectTrigger>
										<SelectContent>
											{MISSION_TYPES.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="requiredAction">Required Action</Label>
									<Input
										id="requiredAction"
										value={editingMission?.requiredAction || ''}
										onChange={(e) =>
											setEditingMission((prev) =>
												prev ? { ...prev, requiredAction: e.target.value } : null
											)
										}
										placeholder="e.g. login"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="requiredCount">Required Count</Label>
									<Input
										id="requiredCount"
										type="number"
										min={1}
										value={editingMission?.requiredCount || 1}
										onChange={(e) =>
											setEditingMission((prev) =>
												prev ? { ...prev, requiredCount: parseInt(e.target.value) } : null
											)
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={editingMission?.description || ''}
									onChange={(e) =>
										setEditingMission((prev) =>
											prev ? { ...prev, description: e.target.value } : null
										)
									}
									placeholder="e.g. Login to the forum today"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="icon">Icon (Lucide Icon name)</Label>
									<Input
										id="icon"
										value={editingMission?.icon || ''}
										onChange={(e) =>
											setEditingMission((prev) => (prev ? { ...prev, icon: e.target.value } : null))
										}
										placeholder="e.g. trophy"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="minLevel">Minimum Level</Label>
									<Input
										id="minLevel"
										type="number"
										min={1}
										value={editingMission?.minLevel || 1}
										onChange={(e) =>
											setEditingMission((prev) =>
												prev ? { ...prev, minLevel: parseInt(e.target.value) } : null
											)
										}
									/>
								</div>
							</div>

							<Separator />

							<div className="space-y-2">
								<h3 className="text-base font-medium">Rewards</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="xpReward">XP Reward</Label>
										<Input
											id="xpReward"
											type="number"
											min={0}
											value={editingMission?.xpReward || 0}
											onChange={(e) =>
												setEditingMission((prev) =>
													prev ? { ...prev, xpReward: parseInt(e.target.value) } : null
												)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="dgtReward">DGT Reward (optional)</Label>
										<Input
											id="dgtReward"
											type="number"
											min={0}
											value={editingMission?.dgtReward || 0}
											onChange={(e) =>
												setEditingMission((prev) =>
													prev ? { ...prev, dgtReward: parseInt(e.target.value) } : null
												)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="badgeReward">Badge Reward (optional)</Label>
										<Input
											id="badgeReward"
											value={editingMission?.badgeReward || ''}
											onChange={(e) =>
												setEditingMission((prev) =>
													prev ? { ...prev, badgeReward: e.target.value } : null
												)
											}
											placeholder="e.g. Daily Streak"
										/>
									</div>
								</div>
							</div>

							<Separator />

							<div className="space-y-2">
								<h3 className="text-base font-medium">Mission Settings</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center space-x-2">
										<Switch
											id="isDaily"
											checked={editingMission?.isDaily}
											onCheckedChange={(checked) =>
												setEditingMission((prev) =>
													prev
														? {
																...prev,
																isDaily: checked,
																isWeekly: checked ? false : prev.isWeekly
															}
														: null
												)
											}
										/>
										<Label htmlFor="isDaily">Daily Mission</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											id="isWeekly"
											checked={editingMission?.isWeekly}
											onCheckedChange={(checked) =>
												setEditingMission((prev) =>
													prev
														? {
																...prev,
																isWeekly: checked,
																isDaily: checked ? false : prev.isDaily
															}
														: null
												)
											}
										/>
										<Label htmlFor="isWeekly">Weekly Mission</Label>
									</div>
								</div>

								<div className="flex items-center space-x-2">
									<Switch
										id="isActive"
										checked={editingMission?.isActive}
										onCheckedChange={(checked) =>
											setEditingMission((prev) => (prev ? { ...prev, isActive: checked } : null))
										}
									/>
									<Label htmlFor="isActive">Active</Label>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setDialogOpen(false)}>
								<X className="h-4 w-4 mr-1" />
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								disabled={
									!editingMission?.title ||
									!editingMission?.type ||
									!editingMission?.requiredAction ||
									createMissionMutation.isLoading ||
									updateMissionMutation.isLoading
								}
							>
								<Save className="h-4 w-4 mr-1" />
								Save Mission
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
	);
}
