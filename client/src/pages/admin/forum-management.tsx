import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Globe,
  Folder,
  MessageSquare,
  Settings,
  ChevronRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Trophy,
  ShoppingBag,
  Users,
  BarChart,
  Shield,
  Coins,
  Target,
  Dices,
  FileText,
  Archive,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types based on our forum structure
interface ForumEntity {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  type: 'zone' | 'category' | 'forum';
  parentId?: number | null;
  position: number;
  isVip: boolean;
  isLocked: boolean;
  isHidden: boolean;
  minXp: number;
  color?: string | null;
  icon?: string | null;
  colorTheme?: string | null;
  tippingEnabled: boolean;
  xpMultiplier: number;
  pluginData?: any;
  threadCount?: number;
  postCount?: number;
  isPrimary?: boolean;
  features?: string[];
  customComponents?: string[];
}

// Icon map for zones
const ZONE_ICONS: Record<string, React.ComponentType<any>> = {
  flame: Flame,
  target: Target,
  dices: Dices,
  'file-text': FileText,
  archive: Archive,
  coins: Coins,
};

// Available features for primary zones
const AVAILABLE_FEATURES = [
  { id: 'xpChallenges', label: 'XP Challenges', icon: Trophy },
  { id: 'airdrops', label: 'Airdrops', icon: Sparkles },
  { id: 'zoneShop', label: 'Zone Shop', icon: ShoppingBag },
  { id: 'staffBoard', label: 'Staff Board', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'customBadges', label: 'Custom Badges', icon: Target },
];

// Available components for primary zones
const AVAILABLE_COMPONENTS = [
  'DailyTaskWidget',
  'FlashChallengeBar',
  'LiveBetsWidget',
  'IsItRiggedPoll',
  'ShopCard',
  'HotItemsSlider',
  'CosmeticsGrid',
  'LiveOddsWidget',
  'CasinoLeaderboard',
  'AlphaQuestWidget',
];

export default function ForumManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('zones');
  const [editingEntity, setEditingEntity] = useState<ForumEntity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<ForumEntity | null>(null);

  // Fetch forum structure
  const { data: forumStructure, isLoading } = useQuery({
    queryKey: ['/api/forum/structure'],
    queryFn: () => apiRequest<{
      zones: ForumEntity[];
      categories: ForumEntity[];
      forums: ForumEntity[];
    }>({ url: '/api/forum/structure' }),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (entity: Partial<ForumEntity>) => {
      const url = entity.id 
        ? `/api/admin/forum/entities/${entity.id}`
        : '/api/admin/forum/entities';
      const method = entity.id ? 'PUT' : 'POST';
      
      return apiRequest({
        url,
        method,
        data: entity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/structure'] });
      setIsEditDialogOpen(false);
      setEditingEntity(null);
      toast({
        title: 'Success',
        description: 'Forum entity saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save forum entity',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/admin/forum/entities/${id}`,
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/structure'] });
      setIsDeleteDialogOpen(false);
      setEntityToDelete(null);
      toast({
        title: 'Success',
        description: 'Forum entity deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete forum entity',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (entity: ForumEntity) => {
    setEditingEntity(entity);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (entity: ForumEntity) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = (type: 'zone' | 'category' | 'forum') => {
    setEditingEntity({
      id: 0,
      name: '',
      slug: '',
      type,
      position: 0,
      isVip: false,
      isLocked: false,
      isHidden: false,
      minXp: 0,
      tippingEnabled: false,
      xpMultiplier: 1,
      pluginData: {},
    });
    setIsEditDialogOpen(true);
  };

  const renderEntityIcon = (entity: ForumEntity) => {
    if (entity.type === 'zone' && entity.icon) {
      const IconComponent = ZONE_ICONS[entity.icon] || Globe;
      return <IconComponent className="h-4 w-4" />;
    }
    switch (entity.type) {
      case 'zone':
        return <Globe className="h-4 w-4" />;
      case 'category':
        return <Folder className="h-4 w-4" />;
      case 'forum':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const renderEntityRow = (entity: ForumEntity, depth: number = 0) => {
    const childEntities = forumStructure
      ? [...(forumStructure.categories || []), ...(forumStructure.forums || [])]
          .filter(e => e.parentId === entity.id)
          .sort((a, b) => a.position - b.position)
      : [];

    return (
      <React.Fragment key={entity.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 1.5}rem` }}>
              {renderEntityIcon(entity)}
              <div>
                <div className="font-medium">{entity.name}</div>
                {entity.description && (
                  <div className="text-sm text-muted-foreground">{entity.description}</div>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={entity.type === 'zone' ? 'default' : 'secondary'}>
              {entity.type}
            </Badge>
          </TableCell>
          <TableCell>
            <code className="text-xs">{entity.slug}</code>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {entity.isHidden && <EyeOff className="h-4 w-4 text-muted-foreground" />}
              {entity.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              {entity.isVip && <Sparkles className="h-4 w-4 text-yellow-500" />}
              {entity.isPrimary && <Badge variant="outline">Primary</Badge>}
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {entity.threadCount || 0} threads / {entity.postCount || 0} posts
            </div>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(entity)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/forums/${entity.slug}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(entity)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {childEntities.map(child => renderEntityRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const zones = forumStructure?.zones || [];
  const categories = forumStructure?.categories || [];
  const forums = forumStructure?.forums || [];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Forum Management</h1>
          <div className="flex gap-2">
            <Button onClick={() => handleCreate('zone')}>
              <Plus className="h-4 w-4 mr-2" />
              New Zone
            </Button>
            <Button onClick={() => handleCreate('forum')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Forum
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="all">All Forums</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="zones" className="space-y-4">
            {zones.map(zone => (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {renderEntityIcon(zone)}
                      <div>
                        <CardTitle>{zone.name}</CardTitle>
                        {zone.description && (
                          <CardDescription>{zone.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {zone.isPrimary && <Badge>Primary Zone</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(zone)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {zone.isPrimary && zone.features && zone.features.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Features</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {zone.features.map(feature => (
                            <Badge key={feature} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Forums</Label>
                      <div className="mt-2 space-y-2">
                        {forums
                          .filter(f => f.parentId === zone.id)
                          .map(forum => (
                            <div
                              key={forum.id}
                              className="flex items-center justify-between p-2 rounded-lg border"
                            >
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{forum.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(forum)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Forums</CardTitle>
                <CardDescription>
                  Complete hierarchy of zones, categories, and forums
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map(zone => renderEntityRow(zone))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Forum Settings</CardTitle>
                <CardDescription>
                  Global configuration for the forum system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Primary Zones</Label>
                    <p className="text-sm text-muted-foreground">
                      Show primary zones with enhanced features
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zone Gamification</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable XP multipliers and challenges
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntity?.id ? 'Edit' : 'Create'} {editingEntity?.type}
              </DialogTitle>
              <DialogDescription>
                Configure the forum entity settings
              </DialogDescription>
            </DialogHeader>

            {editingEntity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editingEntity.name}
                      onChange={(e) =>
                        setEditingEntity({ ...editingEntity, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editingEntity.slug}
                      onChange={(e) =>
                        setEditingEntity({ ...editingEntity, slug: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingEntity.description || ''}
                    onChange={(e) =>
                      setEditingEntity({ ...editingEntity, description: e.target.value })
                    }
                  />
                </div>

                {editingEntity.type === 'zone' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Select
                          value={editingEntity.icon || ''}
                          onValueChange={(value) =>
                            setEditingEntity({ ...editingEntity, icon: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ZONE_ICONS).map(([key, Icon]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{key}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="colorTheme">Color Theme</Label>
                        <Input
                          id="colorTheme"
                          value={editingEntity.colorTheme || ''}
                          onChange={(e) =>
                            setEditingEntity({ ...editingEntity, colorTheme: e.target.value })
                          }
                          placeholder="theme-pit"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Zone Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_FEATURES.map(feature => (
                          <label
                            key={feature.id}
                            className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                          >
                            <input
                              type="checkbox"
                              checked={(editingEntity.pluginData?.features || []).includes(feature.id)}
                              onChange={(e) => {
                                const features = editingEntity.pluginData?.features || [];
                                const newFeatures = e.target.checked
                                  ? [...features, feature.id]
                                  : features.filter((f: string) => f !== feature.id);
                                setEditingEntity({
                                  ...editingEntity,
                                  pluginData: {
                                    ...editingEntity.pluginData,
                                    features: newFeatures,
                                  },
                                });
                              }}
                            />
                            <feature.icon className="h-4 w-4" />
                            <span className="text-sm">{feature.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={editingEntity.isHidden}
                      onCheckedChange={(checked) =>
                        setEditingEntity({ ...editingEntity, isHidden: checked })
                      }
                    />
                    <span>Hidden</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={editingEntity.isLocked}
                      onCheckedChange={(checked) =>
                        setEditingEntity({ ...editingEntity, isLocked: checked })
                      }
                    />
                    <span>Locked</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={editingEntity.isVip}
                      onCheckedChange={(checked) =>
                        setEditingEntity({ ...editingEntity, isVip: checked })
                      }
                    />
                    <span>VIP Only</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="xpMultiplier">XP Multiplier</Label>
                    <Input
                      id="xpMultiplier"
                      type="number"
                      step="0.1"
                      value={editingEntity.xpMultiplier}
                      onChange={(e) =>
                        setEditingEntity({
                          ...editingEntity,
                          xpMultiplier: parseFloat(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="minXp">Minimum XP Required</Label>
                    <Input
                      id="minXp"
                      type="number"
                      value={editingEntity.minXp}
                      onChange={(e) =>
                        setEditingEntity({
                          ...editingEntity,
                          minXp: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => editingEntity && saveMutation.mutate(editingEntity)}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {entityToDelete?.type}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{entityToDelete?.name}"? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => entityToDelete && deleteMutation.mutate(entityToDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
} 