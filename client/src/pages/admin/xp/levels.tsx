import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react'; // Removed ArrowUpDown, Search, Chevrons
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge as UiBadge } from '@/components/ui/badge'; // Renamed to avoid conflict
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Handled by AdminPageShell
// import { useDebounce } from '@/hooks/use-debounce'; // Not used for levels page search
import { apiRequest } from '@/lib/queryClient';

import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { EntityTable } from '@/components/admin/layout/EntityTable';
import { 
  LevelFormDialogComponent, 
  DeleteLevelConfirmationDialog,
} from '@/components/admin/forms/xp/LevelFormDialogs';
import type { Level, LevelFormData } from '@/components/admin/forms/xp/LevelFormDialogs';

// API response structure (assuming pagination or full list)
interface LevelsApiResponse {
  levels: Level[];
  // Stats for the stats tab
  totalLevels?: number;
  highestLevel?: number;
  maxXpRequired?: number;
  totalDgtRewards?: number;
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
    description: '',
  });

  // For now, assuming sorting is handled by backend or not critical for this view
  // const [sortField, setSortField] = useState<'level' | 'xpRequired' | 'rewardDgt'>('level');
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const {
    data: levelsApiResponse,
    isLoading,
    isError,
    error,
  } = useQuery<LevelsApiResponse>({
    // queryKey: ['/api/admin/levels', { sort: sortField, direction: sortDirection }],
    queryKey: ['/api/admin/levels'], // Simplified query key if no client-side sort params sent
    queryFn: async () => {
      // const params = new URLSearchParams({ sort: sortField, direction: sortDirection });
      // return apiRequest({ url: `/api/admin/levels?${params.toString()}`, method: 'GET' });
      return apiRequest({ url: `/api/admin/levels`, method: 'GET' });
    },
  });
  
  const levels = levelsApiResponse?.levels || [];

  const resetFormAndCloseDialogs = () => {
    setFormData({ level: 1, xpRequired: 100, rewardDgt: 0, rewardTitle: '', description: '' });
    setSelectedLevel(null);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const createLevelMutation = useMutation({
    mutationFn: (data: LevelFormData) => apiRequest({ url: '/api/admin/levels', method: 'POST', data }),
    onSuccess: () => {
      toast({ title: 'Level created', description: 'The level has been created successfully.' });
      resetFormAndCloseDialogs();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to create level.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LevelFormData }) => apiRequest({ url: `/api/admin/levels/${id}`, method: 'PUT', data }),
    onSuccess: () => {
      toast({ title: 'Level updated', description: 'The level has been updated successfully.' });
      resetFormAndCloseDialogs();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update level.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id: number) => apiRequest({ url: `/api/admin/levels/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Level deleted', description: 'The level has been deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setSelectedLevel(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete level.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });
  
  const generateLevelsMutation = useMutation({
		mutationFn: async (data: { startLevel: number; endLevel: number; baseXp: number; multiplier: number; }) => {
			return apiRequest({url: '/api/admin/levels/generate', method: 'POST', data});
		},
		onSuccess: () => {
			toast({ title: 'Levels generated', description: 'Multiple levels have been generated successfully' });
			queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
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
      description: level.description || '',
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
		// These values could come from a form in the future
		generateLevelsMutation.mutate({ startLevel: 1, endLevel: 100, baseXp: 100, multiplier: 1.1 });
	};
  
  const columns = [
    { key: 'level', header: 'Level', render: (level: Level) => <UiBadge variant="outline">{level.level}</UiBadge> },
    { key: 'xpRequired', header: 'XP Required', render: (level: Level) => level.xpRequired.toLocaleString() },
    { key: 'description', header: 'Description', render: (level: Level) => <span className="block max-w-[300px] truncate">{level.description || '-'}</span> },
    { key: 'rewardDgt', header: 'DGT Reward', render: (level: Level) => level.rewardDgt > 0 ? <UiBadge className="bg-emerald-700 hover:bg-emerald-800">{level.rewardDgt} DGT</UiBadge> : '-' },
    { key: 'rewardTitle', header: 'Title Reward', render: (level: Level) => level.rewardTitle ? <UiBadge variant="secondary">{level.rewardTitle}</UiBadge> : '-' },
  ];

  const pageActions = (
    <div className="flex gap-2">
      <Button onClick={handleOpenCreateDialog}>
        <Plus className="mr-2 h-4 w-4" /> Create Level
      </Button>
      <Button variant="outline" onClick={handleGenerateLevels} disabled={generateLevelsMutation.isPending}>
        {generateLevelsMutation.isPending ? 'Generating...' : 'Generate Levels (1-100)'}
      </Button>
    </div>
  );

  const allLevelsTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>XP Levels Configuration</CardTitle>
        <CardDescription>Define the XP thresholds and rewards for each user level.</CardDescription>
      </CardHeader>
      <CardContent>
        <EntityTable<Level>
          columns={columns}
          data={levels.sort((a,b) => a.level - b.level)} // Ensure client-side sort by level for display
          isLoading={isLoading}
          isError={isError}
          error={error}
          emptyStateMessage="No levels found. Click 'Create Level' or 'Generate Levels'."
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
        <CardTitle>Level Statistics</CardTitle>
        <CardDescription>Overview of level configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading statistics...</p>}
        {isError && <p className="text-destructive">Error loading statistics.</p>}
        {!isLoading && !isError && levelsApiResponse && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-admin-text-secondary">Total Levels</div>
                <div className="text-2xl font-bold mt-1">{levelsApiResponse.totalLevels || levels.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-admin-text-secondary">Highest Level</div>
                <div className="text-2xl font-bold mt-1">{levelsApiResponse.highestLevel || (levels.length > 0 ? Math.max(...levels.map(l => l.level)) : 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-admin-text-secondary">Max XP Required</div>
                <div className="text-2xl font-bold mt-1">
                  {(levelsApiResponse.maxXpRequired || (levels.length > 0 ? Math.max(...levels.map(l => l.xpRequired)) : 0)).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-admin-text-secondary">Total DGT Rewards</div>
                <div className="text-2xl font-bold mt-1">
                  {(levelsApiResponse.totalDgtRewards || levels.reduce((sum, l) => sum + l.rewardDgt, 0)).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
         <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">XP Progression Chart</h3>
            <div className="h-64 bg-admin-bg-element rounded-md flex items-center justify-center">
                <span className="text-admin-text-secondary">
                    XP progression chart will be displayed here (Placeholder)
                </span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const tabsConfig = [
    { value: 'all-levels', label: 'All Levels', content: allLevelsTabContent },
    { value: 'statistics', label: 'Level Stats', content: statisticsTabContent },
  ];

  return (
    <AdminPageShell title="Level Management" pageActions={pageActions} tabsConfig={tabsConfig}>
      <LevelFormDialogComponent
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        setIsOpen={isEditDialogOpen ? setIsEditDialogOpen : setIsCreateDialogOpen}
        isEdit={!!selectedLevel}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleFormSubmit}
        isSubmitting={createLevelMutation.isPending || updateLevelMutation.isPending}
        levelsData={{ levels: levels.map(l => ({ level: l.level, xpRequired: l.xpRequired })) }}
      />
      <DeleteLevelConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        level={selectedLevel ? { level: selectedLevel.level, xpRequired: selectedLevel.xpRequired, description: selectedLevel.description || '' } : null}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteLevelMutation.isPending}
      />
    </AdminPageShell>
  );
}
