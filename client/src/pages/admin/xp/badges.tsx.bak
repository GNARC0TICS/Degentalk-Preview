import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowUpDown, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import AdminLayout from '../admin-layout';
import { apiRequest } from '@/lib/queryClient';

// Badge types
interface Badge {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string;
  rarity: string;
  createdAt: string;
}

interface BadgeFormData {
  name: string;
  description: string;
  iconUrl: string;
  rarity: string;
}

// Badge rarity options
const RARITIES = [
  { value: 'common', label: 'Common', color: 'bg-slate-500' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'bg-amber-500' },
  { value: 'mythic', label: 'Mythic', color: 'bg-red-500' },
];

export default function BadgeManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    iconUrl: '',
    rarity: 'common',
  });
  const [sortField, setSortField] = useState<'name' | 'rarity' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch badges
  const {
    data: badgesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/admin/badges', { search: debouncedSearchTerm, sort: sortField, direction: sortDirection, page, pageSize }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/badges?search=${debouncedSearchTerm}&sort=${sortField}&direction=${sortDirection}&page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      return response.json();
    }
  });

  // Mutations
  const createBadgeMutation = useMutation({
    mutationFn: async (data: BadgeFormData) => {
      return apiRequest('POST', '/api/admin/badges', data);
    },
    onSuccess: () => {
      toast({
        title: 'Badge created',
        description: 'The badge has been created successfully',
        variant: 'default',
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/badges'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create badge: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BadgeFormData }) => {
      return apiRequest('PUT', `/api/admin/badges/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Badge updated',
        description: 'The badge has been updated successfully',
        variant: 'default',
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/badges'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update badge: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/badges/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Badge deleted',
        description: 'The badge has been deleted successfully',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/badges'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete badge: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handlers
  const handleSort = (field: 'name' | 'rarity' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditDialogOpen && selectedBadge) {
      updateBadgeMutation.mutate({ id: selectedBadge.id, data: formData });
    } else {
      createBadgeMutation.mutate(formData);
    }
  };

  const handleEditClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      iconUrl: badge.iconUrl,
      rarity: badge.rarity,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconUrl: '',
      rarity: 'common',
    });
    setSelectedBadge(null);
  };

  // Render badge dialog form
  const BadgeFormDialog = ({ isOpen, setIsOpen, isEdit }: { isOpen: boolean; setIsOpen: (open: boolean) => void; isEdit: boolean }) => (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Badge' : 'Create New Badge'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the badge details below.' : 'Add a new badge to reward users.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Badge Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this badge is for..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="iconUrl">Icon URL</Label>
              <div className="flex gap-2">
                <Input
                  id="iconUrl"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="https://example.com/badge-icon.png"
                  required
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {formData.iconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img 
                    src={formData.iconUrl} 
                    alt="Badge Preview" 
                    className="w-10 h-10 object-contain border border-slate-700 rounded"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'}
                  />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rarity">Rarity</Label>
              <Select 
                value={formData.rarity} 
                onValueChange={(value) => setFormData({ ...formData, rarity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Badge Rarity</SelectLabel>
                    {RARITIES.map((rarity) => (
                      <SelectItem key={rarity.value} value={rarity.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${rarity.color}`} />
                          <span>{rarity.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={createBadgeMutation.isPending || updateBadgeMutation.isPending}
            >
              {(createBadgeMutation.isPending || updateBadgeMutation.isPending) ? 'Saving...' : (isEdit ? 'Update Badge' : 'Create Badge')}
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
          <DialogTitle>Delete Badge</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this badge? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {selectedBadge && (
          <div className="flex items-center gap-3 py-4">
            <img 
              src={selectedBadge.iconUrl} 
              alt={selectedBadge.name}
              className="w-12 h-12 object-contain border border-slate-700 rounded" 
              onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'}
            />
            <div>
              <h4 className="font-medium">{selectedBadge.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
            </div>
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
            onClick={() => selectedBadge && deleteBadgeMutation.mutate(selectedBadge.id)}
            disabled={deleteBadgeMutation.isPending}
          >
            {deleteBadgeMutation.isPending ? 'Deleting...' : 'Delete Badge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render badge table
  const BadgeTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Icon</TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('rarity')}
            >
              Rarity
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                Loading badges...
              </TableCell>
            </TableRow>
          ))
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={6} className="h-16 text-center text-destructive">
              Error loading badges: {error.message}
            </TableCell>
          </TableRow>
        ) : badgesData?.badges?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
              No badges found. Create your first badge to get started.
            </TableCell>
          </TableRow>
        ) : (
          badgesData?.badges?.map((badge: Badge) => (
            <TableRow key={badge.id}>
              <TableCell>
                <img 
                  src={badge.iconUrl} 
                  alt={badge.name}
                  className="w-10 h-10 object-contain border border-slate-700 rounded" 
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'}
                />
              </TableCell>
              <TableCell className="font-medium">{badge.name}</TableCell>
              <TableCell className="max-w-[300px] truncate">{badge.description}</TableCell>
              <TableCell>
                <Badge className={getBadgeColor(badge.rarity)}>
                  {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(badge.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEditClick(badge)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteClick(badge)}
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

  // Get badge color based on rarity
  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-700 hover:bg-slate-800';
      case 'uncommon': return 'bg-green-700 hover:bg-green-800';
      case 'rare': return 'bg-blue-700 hover:bg-blue-800';
      case 'epic': return 'bg-purple-700 hover:bg-purple-800';
      case 'legendary': return 'bg-amber-700 hover:bg-amber-800';
      case 'mythic': return 'bg-red-700 hover:bg-red-800';
      default: return 'bg-slate-700 hover:bg-slate-800';
    }
  };

  // Main render
  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Badge Management</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Badge
          </Button>
        </div>
        
        <Tabs defaultValue="all-badges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-badges">All Badges</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-badges" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <CardTitle>Badges</CardTitle>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search badges..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <BadgeTable />
                
                {/* Pagination */}
                {badgesData?.totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {badgesData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(badgesData.totalPages, p + 1))}
                      disabled={page === badgesData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Badge Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Total Badges</div>
                      <div className="text-2xl font-bold mt-1">{badgesData?.totalBadges || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Badges Awarded</div>
                      <div className="text-2xl font-bold mt-1">{badgesData?.badgesAwarded || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Most Common</div>
                      <div className="text-2xl font-bold mt-1">{badgesData?.mostCommonBadge?.name || 'N/A'}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Rarest</div>
                      <div className="text-2xl font-bold mt-1">{badgesData?.rarestBadge?.name || 'N/A'}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      <BadgeFormDialog isOpen={isCreateDialogOpen} setIsOpen={setIsCreateDialogOpen} isEdit={false} />
      <BadgeFormDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} isEdit={true} />
      <DeleteConfirmationDialog />
    </AdminLayout>
  );
} 