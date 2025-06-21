import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, TrendingUp, Award, Zap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { EntityTable } from '@/components/admin/layout/EntityTable';
import {
	LevelFormDialogComponent,
	DeleteLevelConfirmationDialog
} from '@/components/admin/forms/xp/LevelFormDialogs';
import type { Level, LevelFormData } from '@/components/admin/forms/xp/LevelFormDialogs';

// API response structure
interface LevelsApiResponse {
	levels: Level[];
	totalLevels?: number;
	highestLevel?: number;
	maxXpRequired?: number;
	totalDgtRewards?: number;
}

export default function XPSystemPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
	const [formData, setFormData] = useState<LevelFormData>({
		level: 1,
		xpRequired: 100,
		rewardDgt: 0,
		rewardTitle: '',
		description: ''
	});

	const {
		data: levelsApiResponse,
		isLoading,
		isError,
		error
	} = useQuery<LevelsApiResponse>({
		queryKey: ['/api/admin/xp/levels'],
		queryFn: async () => {
			return apiRequest({ url: `/api/admin/xp/levels`, method: 'GET' });
		}
	});

	const levels = levelsApiResponse?.levels || [];

	const resetFormAndCloseDialogs = () => {
		setFormData({ level: 1, xpRequired: 100, rewardDgt: 0, rewardTitle: '', description: '' });
		setSelectedLevel(null);
		setIsCreateDialogOpen(false);
		setIsEditDialogOpen(false);
	};

	const createLevelMutation = useMutation({
		mutationFn: (data: LevelFormData) =>
			apiRequest({ url: '/api/admin/xp/levels', method: 'POST', data }),
		onSuccess: () => {
			toast({ title: 'Level created', description: 'The XP level has been created successfully.' });
			resetFormAndCloseDialogs();
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/levels'] });
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to create level.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const updateLevelMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: LevelFormData }) =>
			apiRequest({ url: `/api/admin/xp/levels/${id}`, method: 'PUT', data }),
		onSuccess: () => {
			toast({ title: 'Level updated', description: 'The XP level has been updated successfully.' });
			resetFormAndCloseDialogs();
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/levels'] });
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to update level.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const deleteLevelMutation = useMutation({
		mutationFn: (id: number) => apiRequest({ url: `/api/admin/xp/levels/${id}`, method: 'DELETE' }),
		onSuccess: () => {
			toast({ title: 'Level deleted', description: 'The XP level has been deleted successfully.' });
			setIsDeleteDialogOpen(false);
			setSelectedLevel(null);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/levels'] });
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to delete level.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const generateLevelsMutation = useMutation({
		mutationFn: async (data: {
			startLevel: number;
			endLevel: number;
			baseXp: number;
			multiplier: number;
		}) => {
			return apiRequest({ url: '/api/admin/xp/levels/generate', method: 'POST', data });
		},
		onSuccess: () => {
			toast({
				title: 'Levels generated',
				description: 'Multiple XP levels have been generated successfully'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/levels'] });
		},
		onError: (err: unknown) => {
			const message = err instanceof Error ? err.message : 'Failed to generate levels.';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	});

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditDialogOpen && selectedLevel) {
			updateLevelMutation.mutate({ id: selectedLevel.id, data: formData });
		} else {
			createLevelMutation.mutate(formData);
		}
	};

	const handleOpenCreateDialog = () => {
		resetFormAndCloseDialogs();
		setIsCreateDialogOpen(true);
	};

	const handleOpenEditDialog = (level: Level) => {
		setSelectedLevel(level);
		setFormData({
			level: level.level,
			xpRequired: level.xpRequired,
			rewardDgt: level.rewardDgt,
			rewardTitle: level.rewardTitle || '',
			description: level.description || ''
		});
		setIsEditDialogOpen(true);
	};

	const handleOpenDeleteDialog = (level: Level) => {
		setSelectedLevel(level);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (selectedLevel) {
			deleteLevelMutation.mutate(selectedLevel.id);
		}
	};

	const handleGenerateLevels = () => {
		generateLevelsMutation.mutate({ startLevel: 1, endLevel: 100, baseXp: 100, multiplier: 1.1 });
	};

	const columns = [
		{
			key: 'level',
			header: 'Level',
			render: (level: Level) => (
				<UiBadge variant="outline" className="flex items-center gap-1">
					<TrendingUp className="h-3 w-3" />
					{level.level}
				</UiBadge>
			)
		},
		{
			key: 'xpRequired',
			header: 'XP Required',
			render: (level: Level) => (
				<div className="flex items-center gap-2">
					<Zap className="h-4 w-4 text-blue-500" />
					<span className="font-mono">{level.xpRequired.toLocaleString()}</span>
				</div>
			)
		},
		{
			key: 'description',
			header: 'Description',
			render: (level: Level) => (
				<span className="block max-w-[300px] truncate">{level.description || '-'}</span>
			)
		},
		{
			key: 'rewardDgt',
			header: 'DGT Reward',
			render: (level: Level) =>
				level.rewardDgt > 0 ? (
					<UiBadge className="bg-emerald-700 hover:bg-emerald-800">{level.rewardDgt} DGT</UiBadge>
				) : (
					'-'
				)
		},
		{
			key: 'rewardTitle',
			header: 'Title Reward',
			render: (level: Level) =>
				level.rewardTitle ? (
					<UiBadge variant="secondary" className="flex items-center gap-1">
						<Award className="h-3 w-3" />
						{level.rewardTitle}
					</UiBadge>
				) : (
					'-'
				)
		}
	];

	const pageActions = (
		<div className="flex gap-2">
			<Button onClick={handleOpenCreateDialog}>
				<Plus className="mr-2 h-4 w-4" /> Create Level
			</Button>
			<Button
				variant="outline"
				onClick={handleGenerateLevels}
				disabled={generateLevelsMutation.isPending}
			>
				{generateLevelsMutation.isPending ? 'Generating...' : 'Generate Levels (1-100)'}
			</Button>
		</div>
	);

	const allLevelsTabContent = (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					XP Level Configuration
				</CardTitle>
				<CardDescription>
					Define the experience point thresholds and rewards for each user level in the system.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<EntityTable<Level>
					columns={columns}
					data={levels.sort((a, b) => a.level - b.level)}
					isLoading={isLoading}
					isError={isError}
					error={error}
					emptyStateMessage="No XP levels found. Click 'Create Level' or 'Generate Levels' to get started."
					renderActions={(level) => (
						<div className="flex justify-end gap-2">
							<Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(level)}>
								<Pencil className="h-4 w-4 mr-1" /> Edit
							</Button>
							<Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(level)}>
								<Trash2 className="h-4 w-4 mr-1" /> Delete
							</Button>
						</div>
					)}
				/>
			</CardContent>
		</Card>
	);

	const statisticsTabContent = (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					XP System Statistics
				</CardTitle>
				<CardDescription>
					Overview and analytics of the experience point system configuration.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <p>Loading statistics...</p>}
				{isError && <p className="text-destructive">Error loading statistics.</p>}
				{!isLoading && !isError && levelsApiResponse && (
					<div className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-sm font-medium text-admin-text-secondary">
												Total Levels
											</div>
											<div className="text-2xl font-bold mt-1">
												{levelsApiResponse.totalLevels || levels.length}
											</div>
										</div>
										<TrendingUp className="h-8 w-8 text-blue-500" />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-sm font-medium text-admin-text-secondary">
												Highest Level
											</div>
											<div className="text-2xl font-bold mt-1">
												{levelsApiResponse.highestLevel ||
													(levels.length > 0 ? Math.max(...levels.map((l) => l.level)) : 0)}
											</div>
										</div>
										<Award className="h-8 w-8 text-yellow-500" />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-sm font-medium text-admin-text-secondary">
												Max XP Required
											</div>
											<div className="text-2xl font-bold mt-1">
												{(
													levelsApiResponse.maxXpRequired ||
													(levels.length > 0 ? Math.max(...levels.map((l) => l.xpRequired)) : 0)
												).toLocaleString()}
											</div>
										</div>
										<Zap className="h-8 w-8 text-purple-500" />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-sm font-medium text-admin-text-secondary">
												Total DGT Rewards
											</div>
											<div className="text-2xl font-bold mt-1">
												{(
													levelsApiResponse.totalDgtRewards ||
													levels.reduce((sum, l) => sum + l.rewardDgt, 0)
												).toLocaleString()}
											</div>
										</div>
										<div className="h-8 w-8 bg-emerald-500 rounded flex items-center justify-center text-white font-bold text-sm">
											DGT
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<div>
							<h3 className="text-lg font-medium mb-4 flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								XP Progression Overview
							</h3>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Level Distribution</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-48 bg-admin-bg-element rounded-md flex items-center justify-center">
											<span className="text-admin-text-secondary text-sm">
												Level distribution chart (Coming Soon)
											</span>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle className="text-base">XP Requirements</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-48 bg-admin-bg-element rounded-md flex items-center justify-center">
											<span className="text-admin-text-secondary text-sm">
												XP progression curve (Coming Soon)
											</span>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>

						{/* XP System Configuration Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">System Configuration</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div>
										<h4 className="font-semibold mb-2">Level Rewards</h4>
										<ul className="space-y-1 text-muted-foreground">
											<li>• DGT token rewards for milestone levels</li>
											<li>• Custom title unlocks at specific thresholds</li>
											<li>• Progressive XP requirements with scaling</li>
											<li>• Automatic level-up notifications</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold mb-2">System Features</h4>
										<ul className="space-y-1 text-muted-foreground">
											<li>• Real-time XP tracking and updates</li>
											<li>• Forum activity XP multipliers</li>
											<li>• Daily XP caps and bonuses</li>
											<li>• Achievement integration</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</CardContent>
		</Card>
	);

	const tabsConfig = [
		{ value: 'all-levels', label: 'XP Levels', content: allLevelsTabContent },
		{ value: 'statistics', label: 'System Stats', content: statisticsTabContent }
	];

	return (
		<AdminPageShell title="XP System" pageActions={pageActions} tabsConfig={tabsConfig}>
			<LevelFormDialogComponent
				isOpen={isCreateDialogOpen || isEditDialogOpen}
				setIsOpen={isEditDialogOpen ? setIsEditDialogOpen : setIsCreateDialogOpen}
				isEdit={!!selectedLevel}
				formData={formData}
				setFormData={setFormData}
				handleSubmit={handleFormSubmit}
				isSubmitting={createLevelMutation.isPending || updateLevelMutation.isPending}
				levelsData={{ levels: levels.map((l) => ({ level: l.level, xpRequired: l.xpRequired })) }}
			/>
			<DeleteLevelConfirmationDialog
				isOpen={isDeleteDialogOpen}
				setIsOpen={setIsDeleteDialogOpen}
				level={
					selectedLevel
						? {
								level: selectedLevel.level,
								xpRequired: selectedLevel.xpRequired,
								description: selectedLevel.description || ''
							}
						: null
				}
				onConfirmDelete={confirmDelete}
				isDeleting={deleteLevelMutation.isPending}
			/>
		</AdminPageShell>
	);
}
