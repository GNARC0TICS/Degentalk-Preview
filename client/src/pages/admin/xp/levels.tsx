import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowUpDown, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.ts';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
<<<<<<< HEAD
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import AdminLayout from '../admin-layout';
import { apiRequest } from '@/lib/queryClient';
=======
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useDebounce } from '@/hooks/use-debounce.ts';
import AdminLayout from '../admin-layout.tsx';
import { apiRequest } from '@/lib/queryClient.ts';
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a

// Level types
interface Level {
	id: number;
	level: number;
	xpRequired: number;
	rewardDgt: number;
	rewardTitle: string | null;
	description: string | null;
	createdAt: string;
}

interface LevelFormData {
	level: number;
	xpRequired: number;
	rewardDgt: number;
	rewardTitle: string;
	description: string;
}

export default function LevelManagementPage() {
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
	const [sortField, setSortField] = useState<'level' | 'xpRequired' | 'rewardDgt'>('level');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	// Fetch levels
	const {
		data: levelsData,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['/api/admin/levels', { sort: sortField, direction: sortDirection }],
		queryFn: async () => {
			const response = await fetch(
				`/api/admin/levels?sort=${sortField}&direction=${sortDirection}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch levels');
			}
			return response.json();
		}
	});

	// Mutations
	const createLevelMutation = useMutation({
		mutationFn: async (data: LevelFormData) => {
			return apiRequest('POST', '/api/admin/levels', data);
		},
		onSuccess: () => {
			toast({
				title: 'Level created',
				description: 'The level has been created successfully',
				variant: 'default'
			});
			setIsCreateDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
			resetForm();
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to create level: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const updateLevelMutation = useMutation({
		mutationFn: async ({ id, data }: { id: number; data: LevelFormData }) => {
			return apiRequest('PUT', `/api/admin/levels/${id}`, data);
		},
		onSuccess: () => {
			toast({
				title: 'Level updated',
				description: 'The level has been updated successfully',
				variant: 'default'
			});
			setIsEditDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to update level: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	const deleteLevelMutation = useMutation({
		mutationFn: async (id: number) => {
			return apiRequest('DELETE', `/api/admin/levels/${id}`);
		},
		onSuccess: () => {
			toast({
				title: 'Level deleted',
				description: 'The level has been deleted successfully',
				variant: 'default'
			});
			setIsDeleteDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to delete level: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Generate levels automatically
	const generateLevelsMutation = useMutation({
		mutationFn: async (data: {
			startLevel: number;
			endLevel: number;
			baseXp: number;
			multiplier: number;
		}) => {
			return apiRequest('POST', '/api/admin/levels/generate', data);
		},
		onSuccess: () => {
			toast({
				title: 'Levels generated',
				description: 'Multiple levels have been generated successfully',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: `Failed to generate levels: ${error.message}`,
				variant: 'destructive'
			});
		}
	});

	// Handlers
	const handleSort = (field: 'level' | 'xpRequired' | 'rewardDgt') => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEditDialogOpen && selectedLevel) {
			updateLevelMutation.mutate({ id: selectedLevel.id, data: formData });
		} else {
			createLevelMutation.mutate(formData);
		}
	};

	const handleEditClick = (level: Level) => {
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

	const handleDeleteClick = (level: Level) => {
		setSelectedLevel(level);
		setIsDeleteDialogOpen(true);
	};

<<<<<<< HEAD
	const resetForm = () => {
		setFormData({
			level: 1,
			xpRequired: 100,
			rewardDgt: 0,
			rewardTitle: '',
			description: ''
		});
		setSelectedLevel(null);
	};

	const handleGenerateLevels = () => {
		const startLevel = 1;
		const endLevel = 100;
		const baseXp = 100;
		const multiplier = 1.1;

		generateLevelsMutation.mutate({ startLevel, endLevel, baseXp, multiplier });
	};

	// Render level dialog form
	const LevelFormDialog = ({
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
						<DialogTitle>{isEdit ? 'Edit Level' : 'Create New Level'}</DialogTitle>
						<DialogDescription>
							{isEdit
								? 'Update the level details below.'
								: 'Define a new XP level with its requirements and rewards.'}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label htmlFor="level">Level Number</Label>
								<Input
									id="level"
									type="number"
									min="1"
									value={formData.level}
									onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
									required
								/>
							</div>
							<div>
								<Label htmlFor="xpRequired">XP Required</Label>
								<Input
									id="xpRequired"
									type="number"
									min="0"
									value={formData.xpRequired}
									onChange={(e) =>
										setFormData({ ...formData, xpRequired: parseInt(e.target.value) })
									}
									required
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Level up description (optional)"
							/>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div>
								<Label htmlFor="rewardDgt">DGT Reward</Label>
								<Input
									id="rewardDgt"
									type="number"
									min="0"
									value={formData.rewardDgt}
									onChange={(e) =>
										setFormData({ ...formData, rewardDgt: parseInt(e.target.value) })
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="rewardTitle">Title Reward</Label>
								<Input
									id="rewardTitle"
									value={formData.rewardTitle}
									onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
									placeholder="Optional title reward"
								/>
							</div>
						</div>

						<div className="text-sm text-muted-foreground">
							<p>
								Level {formData.level} will require {formData.xpRequired} XP
							</p>
							{formData.level > 1 && levelsData?.levels && (
								<p className="mt-1">
									{(() => {
										const prevLevel = levelsData.levels.find((l) => l.level === formData.level - 1);
										if (prevLevel) {
											const diff = formData.xpRequired - prevLevel.xpRequired;
											return `Difference from level ${prevLevel.level}: +${diff} XP`;
										}
										return null;
									})()}
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="submit"
							disabled={createLevelMutation.isPending || updateLevelMutation.isPending}
						>
							{createLevelMutation.isPending || updateLevelMutation.isPending
								? 'Saving...'
								: isEdit
									? 'Update Level'
									: 'Create Level'}
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
					<DialogTitle>Delete Level</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this level? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				{selectedLevel && (
					<div className="py-4">
						<p className="font-medium">Level {selectedLevel.level}</p>
						<p className="text-sm text-muted-foreground">Required XP: {selectedLevel.xpRequired}</p>
						{selectedLevel.description && (
							<p className="text-sm mt-2">{selectedLevel.description}</p>
						)}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => selectedLevel && deleteLevelMutation.mutate(selectedLevel.id)}
						disabled={deleteLevelMutation.isPending}
					>
						{deleteLevelMutation.isPending ? 'Deleting...' : 'Delete Level'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	// Render level table
	const LevelTable = () => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>
						<div className="flex items-center cursor-pointer" onClick={() => handleSort('level')}>
							Level
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead>
						<div
							className="flex items-center cursor-pointer"
							onClick={() => handleSort('xpRequired')}
						>
							XP Required
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>
						<div
							className="flex items-center cursor-pointer"
							onClick={() => handleSort('rewardDgt')}
						>
							DGT Reward
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead>Title Reward</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
								Loading levels...
							</TableCell>
						</TableRow>
					))
				) : isError ? (
					<TableRow>
						<TableCell colSpan={6} className="h-16 text-center text-destructive">
							Error loading levels: {error.message}
						</TableCell>
					</TableRow>
				) : levelsData?.levels?.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
							No levels found. Create your first level to get started.
						</TableCell>
					</TableRow>
				) : (
					levelsData?.levels?.map((level: Level) => (
						<TableRow key={level.id}>
							<TableCell className="font-medium">
								<Badge variant="outline" className="bg-zinc-800 border-zinc-700">
									{level.level}
								</Badge>
							</TableCell>
							<TableCell>{level.xpRequired.toLocaleString()}</TableCell>
							<TableCell className="max-w-[300px] truncate">{level.description || '-'}</TableCell>
							<TableCell>
								{level.rewardDgt > 0 ? (
									<Badge className="bg-emerald-900 text-emerald-300">{level.rewardDgt} DGT</Badge>
								) : (
									'-'
								)}
							</TableCell>
							<TableCell>
								{level.rewardTitle ? (
									<Badge variant="outline" className="bg-zinc-800 border-amber-700 text-amber-300">
										{level.rewardTitle}
									</Badge>
								) : (
									'-'
								)}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button variant="outline" size="icon" onClick={() => handleEditClick(level)}>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										className="text-destructive"
										onClick={() => handleDeleteClick(level)}
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
		<AdminLayout>
			<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Level Management</h2>
					<div className="flex gap-2">
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create Level
						</Button>
						<Button
							variant="outline"
							onClick={handleGenerateLevels}
							disabled={generateLevelsMutation.isPending}
						>
							{generateLevelsMutation.isPending ? 'Generating...' : 'Generate Levels'}
						</Button>
					</div>
				</div>

				<Tabs defaultValue="all-levels" className="space-y-4">
					<TabsList>
						<TabsTrigger value="all-levels">All Levels</TabsTrigger>
						<TabsTrigger value="statistics">Level Stats</TabsTrigger>
					</TabsList>

					<TabsContent value="all-levels" className="space-y-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle>XP Levels</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<LevelTable />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="statistics" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Level Statistics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4">
											<div className="text-sm font-medium text-muted-foreground">Total Levels</div>
											<div className="text-2xl font-bold mt-1">{levelsData?.totalLevels || 0}</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="text-sm font-medium text-muted-foreground">Highest Level</div>
											<div className="text-2xl font-bold mt-1">{levelsData?.highestLevel || 0}</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="text-sm font-medium text-muted-foreground">
												Max XP Required
											</div>
											<div className="text-2xl font-bold mt-1">
												{(levelsData?.maxXpRequired || 0).toLocaleString()}
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="text-sm font-medium text-muted-foreground">
												Total DGT Rewards
											</div>
											<div className="text-2xl font-bold mt-1">
												{(levelsData?.totalDgtRewards || 0).toLocaleString()}
											</div>
										</CardContent>
									</Card>
								</div>

								<div className="mt-6">
									<h3 className="text-lg font-medium mb-4">XP Progression Chart</h3>
									<div className="h-64 bg-zinc-800 rounded-md flex items-center justify-center">
										<span className="text-muted-foreground">
											XP progression chart will be displayed here
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			{/* Dialogs */}
			<LevelFormDialog
				isOpen={isCreateDialogOpen}
				setIsOpen={setIsCreateDialogOpen}
				isEdit={false}
			/>
			<LevelFormDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} isEdit={true} />
			<DeleteConfirmationDialog />
		</AdminLayout>
	);
}
=======
  const resetForm = () => {
    setFormData({
      level: 1,
      xpRequired: 100,
      rewardDgt: 0,
      rewardTitle: '',
      description: '',
    });
    setSelectedLevel(null);
  };

  const handleGenerateLevels = () => {
    const startLevel = 1;
    const endLevel = 100;
    const baseXp = 100;
    const multiplier = 1.1;

    generateLevelsMutation.mutate({ startLevel, endLevel, baseXp, multiplier });
  };

  // Render level dialog form
  const LevelFormDialog = ({ isOpen, setIsOpen, isEdit }: { isOpen: boolean; setIsOpen: (open: boolean) => void; isEdit: boolean }) => (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Level' : 'Create New Level'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the level details below.' : 'Define a new XP level with its requirements and rewards.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="level">Level Number</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="xpRequired">XP Required</Label>
                <Input
                  id="xpRequired"
                  type="number"
                  min="0"
                  value={formData.xpRequired}
                  onChange={(e) => setFormData({ ...formData, xpRequired: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Level up description (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rewardDgt">DGT Reward</Label>
                <Input
                  id="rewardDgt"
                  type="number"
                  min="0"
                  value={formData.rewardDgt}
                  onChange={(e) => setFormData({ ...formData, rewardDgt: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rewardTitle">Title Reward</Label>
                <Input
                  id="rewardTitle"
                  value={formData.rewardTitle}
                  onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
                  placeholder="Optional title reward"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Level {formData.level} will require {formData.xpRequired} XP</p>
              {formData.level > 1 && levelsData?.levels && (
                <p className="mt-1">
                  {(() => {
                    const prevLevel = levelsData.levels.find(l => l.level === formData.level - 1);
                    if (prevLevel) {
                      const diff = formData.xpRequired - prevLevel.xpRequired;
                      return `Difference from level ${prevLevel.level}: +${diff} XP`;
                    }
                    return null;
                  })()}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createLevelMutation.isPending || updateLevelMutation.isPending}
            >
              {(createLevelMutation.isPending || updateLevelMutation.isPending) ? 'Saving...' : (isEdit ? 'Update Level' : 'Create Level')}
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
          <DialogTitle>Delete Level</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this level? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {selectedLevel && (
          <div className="py-4">
            <p className="font-medium">Level {selectedLevel.level}</p>
            <p className="text-sm text-muted-foreground">Required XP: {selectedLevel.xpRequired}</p>
            {selectedLevel.description && (
              <p className="text-sm mt-2">{selectedLevel.description}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => selectedLevel && deleteLevelMutation.mutate(selectedLevel.id)}
            disabled={deleteLevelMutation.isPending}
          >
            {deleteLevelMutation.isPending ? 'Deleting...' : 'Delete Level'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render level table
  const LevelTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('level')}
            >
              Level
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('xpRequired')}
            >
              XP Required
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('rewardDgt')}
            >
              DGT Reward
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead>Title Reward</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                Loading levels...
              </TableCell>
            </TableRow>
          ))
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={6} className="h-16 text-center text-destructive">
              Error loading levels: {error.message}
            </TableCell>
          </TableRow>
        ) : levelsData?.levels?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
              No levels found. Create your first level to get started.
            </TableCell>
          </TableRow>
        ) : (
          levelsData?.levels?.map((level: Level) => (
            <TableRow key={level.id}>
              <TableCell className="font-medium">
                <Badge variant="outline" className="bg-zinc-800 border-zinc-700">
                  {level.level}
                </Badge>
              </TableCell>
              <TableCell>{level.xpRequired.toLocaleString()}</TableCell>
              <TableCell className="max-w-[300px] truncate">{level.description || '-'}</TableCell>
              <TableCell>
                {level.rewardDgt > 0 ? (
                  <Badge className="bg-emerald-900 text-emerald-300">
                    {level.rewardDgt} DGT
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell>
                {level.rewardTitle ? (
                  <Badge variant="outline" className="bg-zinc-800 border-amber-700 text-amber-300">
                    {level.rewardTitle}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(level)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteClick(level)}
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
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Level Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Level
          </Button>
          <Button variant="outline" onClick={handleGenerateLevels} disabled={generateLevelsMutation.isPending}>
            {generateLevelsMutation.isPending ? 'Generating...' : 'Generate Levels'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all-levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-levels">All Levels</TabsTrigger>
          <TabsTrigger value="statistics">Level Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="all-levels" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>XP Levels</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LevelTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Level Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Levels</div>
                    <div className="text-2xl font-bold mt-1">{levelsData?.totalLevels || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Highest Level</div>
                    <div className="text-2xl font-bold mt-1">{levelsData?.highestLevel || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Max XP Required</div>
                    <div className="text-2xl font-bold mt-1">{(levelsData?.maxXpRequired || 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total DGT Rewards</div>
                    <div className="text-2xl font-bold mt-1">{(levelsData?.totalDgtRewards || 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">XP Progression Chart</h3>
                <div className="h-64 bg-zinc-800 rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground">XP progression chart will be displayed here</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LevelFormDialog isOpen={isCreateDialogOpen} setIsOpen={setIsCreateDialogOpen} isEdit={false} />
      <LevelFormDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} isEdit={true} />
      <DeleteConfirmationDialog />
    </AdminLayout>
  );
} 
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
