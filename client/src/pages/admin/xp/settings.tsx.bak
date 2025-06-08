import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '../admin-layout';
import { apiRequest } from '@/lib/queryClient';
import { economyConfig } from '@/config/economy.config.ts';

// XP Settings types
interface XpSettings {
  generalXpPerAction: number;
  postCreateXp: number;
  threadCreateXp: number;
  reactionReceivedXp: number;
  postLikedXp: number;
  dailyLoginXp: number;
  weeklyBonusXp: number;
  referralXp: number;
  commentXp: number;
  pathXpMultiplier: number;
  specialEventMultiplier: number;
  badgeAwardXp: number;
  xpBoostEnabled: boolean;
  levelUpNotificationsEnabled: boolean;
}

// Default settings when creating a new configuration
const defaultXpSettings: XpSettings = economyConfig.xp;

export default function XpSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<XpSettings>(defaultXpSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch current XP settings
  const {
    data: currentSettings,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/admin/xp/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/xp/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch XP settings');
      }
      return response.json();
    }
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
      setHasChanges(false);
    }
  }, [currentSettings]);

  // Handle settings update
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: XpSettings) => {
      return apiRequest('PUT', '/api/admin/xp/settings', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'XP system settings have been updated successfully',
        variant: 'default',
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update settings: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle reset to defaults
  const resetToDefaultsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/xp/settings/reset', {});
    },
    onSuccess: () => {
      toast({
        title: 'Settings reset',
        description: 'XP system settings have been reset to defaults',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/xp/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to reset settings: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle input change
  const handleInputChange = (field: keyof XpSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  // Handle reset to defaults
  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all XP settings to defaults? This cannot be undone.')) {
      resetToDefaultsMutation.mutate();
    }
  };

  // Render setting input with tooltip
  const SettingInput = ({
    label,
    field,
    tooltip,
    min = 0,
    max = 1000,
    step = 1
  }: {
    label: string;
    field: keyof XpSettings;
    tooltip: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor={field} className="text-sm font-medium mr-2">
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id={field}
        type="number"
        min={min}
        max={max}
        step={step}
        value={typeof settings[field] === 'number' ? settings[field] : ''}
        onChange={(e) => handleInputChange(field, parseFloat(e.target.value))}
        className="max-w-xs"
      />
    </div>
  );

  // Render toggle setting with tooltip
  const ToggleSetting = ({
    label,
    field,
    tooltip
  }: {
    label: string;
    field: keyof XpSettings;
    tooltip: string;
  }) => (
    <div className="flex items-center justify-between space-y-0 rounded-md border p-4 shadow-sm">
      <div className="space-y-0.5">
        <div className="flex items-center">
          <Label htmlFor={field} className="text-sm font-medium mr-2">
            {label}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="w-80">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Switch
        id={field}
        checked={!!settings[field]}
        onCheckedChange={(checked) => handleInputChange(field, checked)}
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">XP System Settings</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={resetToDefaultsMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetToDefaultsMutation.isPending ? 'Resetting...' : 'Reset to Defaults'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateSettingsMutation.isPending || !hasChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Card className="animate-pulse">
              <CardHeader className="bg-zinc-900 bg-opacity-50 h-24" />
              <CardContent className="bg-zinc-900 bg-opacity-30 h-96" />
            </Card>
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Error loading XP settings: {error.message}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Actions</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="multipliers">Multipliers & Bonuses</TabsTrigger>
                <TabsTrigger value="features">System Features</TabsTrigger>
              </TabsList>

              {/* Basic actions tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Action XP</CardTitle>
                    <CardDescription>
                      Configure XP awarded for basic user actions on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingInput
                      label="General XP Per Action"
                      field="generalXpPerAction"
                      tooltip="Base XP awarded for most general actions on the platform"
                    />

                    <SettingInput
                      label="Thread Creation XP"
                      field="threadCreateXp"
                      tooltip="XP awarded when a user creates a new thread"
                    />

                    <SettingInput
                      label="Post Creation XP"
                      field="postCreateXp"
                      tooltip="XP awarded when a user creates a new post in a thread"
                    />

                    <SettingInput
                      label="Comment XP"
                      field="commentXp"
                      tooltip="XP awarded when a user leaves a comment"
                    />

                    <SettingInput
                      label="Badge Award XP"
                      field="badgeAwardXp"
                      tooltip="Bonus XP awarded when a user earns a badge"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Engagement tab */}
              <TabsContent value="engagement" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement & Reactions XP</CardTitle>
                    <CardDescription>
                      Configure XP awarded for engagement-related activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingInput
                      label="Reaction Received XP"
                      field="reactionReceivedXp"
                      tooltip="XP awarded when a user's content receives a reaction"
                    />

                    <SettingInput
                      label="Post Liked XP"
                      field="postLikedXp"
                      tooltip="XP awarded when a user's post is liked"
                    />

                    <SettingInput
                      label="Daily Login XP"
                      field="dailyLoginXp"
                      tooltip="XP awarded for logging in daily"
                    />

                    <SettingInput
                      label="Weekly Bonus XP"
                      field="weeklyBonusXp"
                      tooltip="Bonus XP awarded for active users each week"
                    />

                    <SettingInput
                      label="Referral XP"
                      field="referralXp"
                      tooltip="XP awarded when referring a new user who creates an account"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Multipliers tab */}
              <TabsContent value="multipliers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>XP Multipliers & Bonuses</CardTitle>
                    <CardDescription>
                      Configure multipliers that affect XP calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SettingInput
                      label="Path XP Multiplier"
                      field="pathXpMultiplier"
                      tooltip="Multiplier applied to XP when a user is active in their chosen path specialization"
                      min={1}
                      max={5}
                      step={0.1}
                    />

                    <SettingInput
                      label="Special Event Multiplier"
                      field="specialEventMultiplier"
                      tooltip="Multiplier applied during special events"
                      min={1}
                      max={10}
                      step={0.1}
                    />

                    <Alert className="mt-6 bg-amber-900/20 text-amber-200 border-amber-900">
                      <AlertDescription>
                        <strong>Note:</strong> Changing multipliers affects all future XP calculations.
                        Existing XP amounts will not be retroactively recalculated.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features tab */}
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>XP System Features</CardTitle>
                    <CardDescription>
                      Enable or disable specific XP system features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ToggleSetting
                      label="XP Boost Feature"
                      field="xpBoostEnabled"
                      tooltip="Allow users to purchase and use XP boosts"
                    />

                    <ToggleSetting
                      label="Level Up Notifications"
                      field="levelUpNotificationsEnabled"
                      tooltip="Show notifications to users when they level up"
                    />

                    <Separator className="my-4" />

                    <Alert className="mt-2">
                      <AlertDescription>
                        Feature settings take effect immediately after saving.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-muted-foreground">
                    {hasChanges ? 'You have unsaved changes' : 'No changes to save'}
                  </div>
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending || !hasChanges}
                  >
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 