// Phase 2 Audit:
// - Verified layout
// - Added/confirmed <Head> title
// - Applied DEV_MODE gating (if applicable)

// Remove Next.js Head component since we're not using Next.js
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save, Settings, Edit, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

type SiteSetting = {
  id: number;
  key: string;
  value: string;
  valueType: string;
  group: string;
  description: string;
  isPublic: boolean;
  updatedAt: string;
  updatedBy: number | null;
};

export default function PlatformSettings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("xp");
  
  // Fetch all site settings
  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      return response.json();
    }
  });

  // Setting update mutation
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string | number | boolean }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update setting');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Setting updated",
        description: `The ${data.key} setting has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper to get a setting value
  const getSetting = (key: string): SiteSetting | undefined => {
    return settings?.find(s => s.key === key);
  };

  // Helper to update a setting
  const handleUpdateSetting = (key: string, value: string | number | boolean) => {
    updateSetting.mutate({ key, value });
  };

  // Helper to render setting value based on type
  const renderSettingInput = (setting: SiteSetting) => {
    const handleChange = (value: string | number | boolean) => {
      handleUpdateSetting(setting.key, value);
    };

    if (setting.valueType === 'boolean') {
      return (
        <Switch 
          checked={setting.value === 'true'} 
          onCheckedChange={(checked) => handleChange(checked)}
        />
      );
    }

    if (setting.valueType === 'number') {
      return (
        <Input
          type="number"
          value={setting.value}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="max-w-xs"
        />
      );
    }

    return (
      <Input
        type="text"
        value={setting.value}
        onChange={(e) => handleChange(e.target.value)}
        className="max-w-xs"
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <Tabs defaultValue="xp" value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="xp">XP & Rewards</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
          </TabsList>

          {/* XP & Rewards Tab */}
          <TabsContent value="xp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>XP & Reward Settings</CardTitle>
                <CardDescription>
                  Configure experience points, leveling, and reward systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {/* XP per Post */}
                  {getSetting('xp_per_post') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="xp_per_post" className="text-base">XP per Post</Label>
                        {renderSettingInput(getSetting('xp_per_post')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Base XP awarded for creating a post
                      </p>
                    </div>
                  )}

                  {/* XP per Thread */}
                  {getSetting('xp_per_thread') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="xp_per_thread" className="text-base">XP per Thread</Label>
                        {renderSettingInput(getSetting('xp_per_thread')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Base XP awarded for creating a thread
                      </p>
                    </div>
                  )}

                  {/* XP Multiplier Threshold */}
                  {getSetting('xp_multiplier_threshold') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="xp_multiplier_threshold" className="text-base">XP Multiplier Threshold</Label>
                        {renderSettingInput(getSetting('xp_multiplier_threshold')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        XP required in a path to receive a multiplier
                      </p>
                    </div>
                  )}

                  {/* Featured XP Boost */}
                  {getSetting('featured_xp_boost') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="featured_xp_boost" className="text-base">Featured Thread XP Boost</Label>
                        {renderSettingInput(getSetting('featured_xp_boost')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        XP multiplier for posts in featured threads
                      </p>
                    </div>
                  )}

                  {/* Referral XP Bonus */}
                  {getSetting('referral_xp_bonus') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="referral_xp_bonus" className="text-base">Referral XP Bonus</Label>
                        {renderSettingInput(getSetting('referral_xp_bonus')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        XP bonus awarded to referrer when someone they referred signs up
                      </p>
                    </div>
                  )}

                  {/* Referral DGT Bonus */}
                  {getSetting('referral_dgt_bonus') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="referral_dgt_bonus" className="text-base">Referral DGT Bonus</Label>
                        {renderSettingInput(getSetting('referral_dgt_bonus')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        DGT points bonus awarded to referrer when someone they referred signs up
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithms Tab */}
          <TabsContent value="algorithms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Settings</CardTitle>
                <CardDescription>
                  Configure algorithms for trending content, hot threads, and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {/* Hot Thread View Weight */}
                  {getSetting('hot_thread_view_weight') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hot_thread_view_weight" className="text-base">Hot Thread View Weight</Label>
                        {renderSettingInput(getSetting('hot_thread_view_weight')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Weight for views in hot thread algorithm
                      </p>
                    </div>
                  )}

                  {/* Hot Thread Reply Weight */}
                  {getSetting('hot_thread_reply_weight') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hot_thread_reply_weight" className="text-base">Hot Thread Reply Weight</Label>
                        {renderSettingInput(getSetting('hot_thread_reply_weight')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Weight for replies in hot thread algorithm
                      </p>
                    </div>
                  )}

                  {/* Hot Thread Like Weight */}
                  {getSetting('hot_thread_like_weight') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hot_thread_like_weight" className="text-base">Hot Thread Like Weight</Label>
                        {renderSettingInput(getSetting('hot_thread_like_weight')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Weight for likes in hot thread algorithm
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and maintenance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {/* Maintenance Mode */}
                  {getSetting('maintenance_mode_enabled') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="maintenance_mode" className="text-base">Maintenance Mode</Label>
                        {renderSettingInput(getSetting('maintenance_mode_enabled')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode (blocks all non-admin access)
                      </p>
                    </div>
                  )}

                  {/* Maintenance Message */}
                  {getSetting('maintenance_mode_message') && (
                    <div className="grid gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="maintenance_message" className="text-base">Maintenance Message</Label>
                        {renderSettingInput(getSetting('maintenance_mode_message')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Message to display during maintenance mode
                      </p>
                    </div>
                  )}

                  {/* Disable New Posts */}
                  {getSetting('disable_new_posts') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="disable_posts" className="text-base">Disable New Posts</Label>
                        {renderSettingInput(getSetting('disable_new_posts')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable creation of new posts
                      </p>
                    </div>
                  )}

                  {/* Disable New Signups */}
                  {getSetting('disable_new_signups') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="disable_signups" className="text-base">Disable New Signups</Label>
                        {renderSettingInput(getSetting('disable_new_signups')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable new user registrations
                      </p>
                    </div>
                  )}

                  {/* Beta Dev Tools */}
                  {getSetting('beta_dev_tools_enabled') && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="beta_dev_tools" className="text-base">Beta Development Tools</Label>
                        {renderSettingInput(getSetting('beta_dev_tools_enabled')!)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable beta development tools for testing
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Editor Settings</CardTitle>
                <CardDescription>
                  Configure rich text editor features and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">GIF Integration</h3>
                    
                    {/* Enable Giphy Integration */}
                    {getSetting('giphy_enabled') && (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="giphy_enabled" className="text-base">Enable Giphy Integration</Label>
                          {renderSettingInput(getSetting('giphy_enabled')!)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable the Giphy GIF search in the rich text editor
                        </p>
                      </div>
                    )}
                    
                    {/* Giphy Result Limit */}
                    {getSetting('giphy_result_limit') && (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="giphy_result_limit" className="text-base">Results Per Request</Label>
                          {renderSettingInput(getSetting('giphy_result_limit')!)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Number of GIF results to display per search (5-50 recommended)
                        </p>
                      </div>
                    )}
                    
                    {/* Giphy Content Rating */}
                    {getSetting('giphy_rating') && (
                      <div className="grid gap-2">
                        <div className="grid gap-2">
                          <Label htmlFor="giphy_rating" className="text-base">Content Rating</Label>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant={getSetting('giphy_rating')!.value === 'g' ? 'default' : 'outline'}
                              onClick={() => handleUpdateSetting('giphy_rating', 'g')}
                              className="w-24"
                            >
                              G
                            </Button>
                            <Button
                              type="button"
                              variant={getSetting('giphy_rating')!.value === 'pg' ? 'default' : 'outline'}
                              onClick={() => handleUpdateSetting('giphy_rating', 'pg')}
                              className="w-24"
                            >
                              PG
                            </Button>
                            <Button
                              type="button"
                              variant={getSetting('giphy_rating')!.value === 'pg-13' ? 'default' : 'outline'}
                              onClick={() => handleUpdateSetting('giphy_rating', 'pg-13')}
                              className="w-24"
                            >
                              PG-13
                            </Button>
                            <Button
                              type="button"
                              variant={getSetting('giphy_rating')!.value === 'r' ? 'default' : 'outline'}
                              onClick={() => handleUpdateSetting('giphy_rating', 'r')}
                              className="w-24"
                            >
                              R
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Content rating for Giphy results (G is most restrictive, R is least)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* API Key Status */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                        <Image className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        <span className="text-sm font-medium">
                          Giphy API Key: Configured via environment variables
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        The API key is configured in your environment variables and is not editable from this interface.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Treasury Settings</CardTitle>
                <CardDescription>
                  Configure treasury wallet and transaction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-6 text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Treasury Management Coming Soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Treasury management features are planned for a future update.
                      This will include wallet controls, transaction settings, and payment system configuration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}