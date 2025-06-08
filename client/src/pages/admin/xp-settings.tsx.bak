import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save, Sparkles, BarChart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from "./admin-layout";
import { Badge } from "@/components/ui/badge";

// Define types
type EconomySetting = {
  key: string;
  value: number;
};

// Settings descriptive information
const settingsInfo = {
  xp_per_post: {
    label: "XP per Post",
    description: "Base XP awarded for creating a new post",
    min: 0,
    max: 100
  },
  xp_per_reply: {
    label: "XP per Reply",
    description: "Base XP awarded for replying to a thread",
    min: 0,
    max: 50
  },
  clout_per_upvote: {
    label: "Clout per Upvote",
    description: "Clout awarded to a user when their post is upvoted",
    min: 0,
    max: 10
  },
  clout_per_helpful: {
    label: "Clout per Helpful",
    description: "Clout awarded to a user when their post is marked as helpful",
    min: 0,
    max: 20
  },
  clout_max_cap: {
    label: "Clout Maximum Cap",
    description: "Maximum clout a user can have",
    min: 100,
    max: 10000
  },
  daily_xp_cap: {
    label: "Daily XP Cap",
    description: "Maximum XP a user can earn in a day",
    min: 10,
    max: 1000
  },
  xp_post_cooldown: {
    label: "Post XP Cooldown",
    description: "Time in minutes before a user can earn XP from posting again",
    min: 0,
    max: 60
  },
  featured_xp_boost: {
    label: "Featured Thread XP Boost",
    description: "Multiplier for XP earned in featured threads",
    min: 1,
    max: 5
  }
};

export default function XpSettings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("xp");
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Fetch economy settings
  const { data: settings, isLoading, error, refetch } = useQuery<EconomySetting[]>({
    queryKey: ["economy-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/economy-settings");
      if (!response.ok) throw new Error("Failed to load settings");
      return response.json();
    },
  });

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      const values: Record<string, number> = {};
      settings.forEach(setting => {
        values[setting.key] = setting.value;
      });
      setFormValues(values);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Record<string, number>) => {
      const response = await fetch("/api/admin/economy-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["economy-settings"] });
      toast({
        title: "Settings saved",
        description: "XP and clout settings have been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormValues(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(formValues);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 text-center">
          <p className="text-destructive">Failed to load settings: {error.message}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">XP & Economy Settings</h1>
            <p className="text-muted-foreground">
              Configure how users earn XP and clout across the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Reset form values to original settings
                    if (settings) {
                      const values: Record<string, number> = {};
                      settings.forEach(setting => {
                        values[setting.key] = setting.value;
                      });
                      setFormValues(values);
                    }
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saveSettingsMutation.isPending}
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Settings
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="xp" value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="xp">
              <Sparkles className="h-4 w-4 mr-2" />
              XP Settings
            </TabsTrigger>
            <TabsTrigger value="clout">
              <BarChart className="h-4 w-4 mr-2" />
              Clout Settings
            </TabsTrigger>
          </TabsList>

          {/* XP Settings Tab */}
          <TabsContent value="xp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Experience Points Configuration</CardTitle>
                <CardDescription>
                  Define how users earn XP from various activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    {settings?.filter(s => s.key.startsWith('xp_')).map(setting => (
                      <div key={setting.key} className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={setting.key} className="text-base">
                              {settingsInfo[setting.key as keyof typeof settingsInfo]?.label || setting.key}
                            </Label>
                            <Badge variant="outline">XP</Badge>
                          </div>
                          <Input
                            id={setting.key}
                            type="number"
                            value={formValues[setting.key] || 0}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                            disabled={!isEditing}
                            min={settingsInfo[setting.key as keyof typeof settingsInfo]?.min || 0}
                            max={settingsInfo[setting.key as keyof typeof settingsInfo]?.max || 100}
                            className="w-24"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {settingsInfo[setting.key as keyof typeof settingsInfo]?.description || ""}
                        </p>
                      </div>
                    ))}
                    
                    {/* Add daily XP cap if it doesn't exist */}
                    {!settings?.find(s => s.key === "daily_xp_cap") && (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="daily_xp_cap" className="text-base">
                              Daily XP Cap
                            </Label>
                            <Badge variant="outline">XP</Badge>
                          </div>
                          <Input
                            id="daily_xp_cap"
                            type="number"
                            value={formValues["daily_xp_cap"] || 100}
                            onChange={(e) => handleInputChange("daily_xp_cap", e.target.value)}
                            disabled={!isEditing}
                            min={10}
                            max={1000}
                            className="w-24"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Maximum XP a user can earn in a day
                        </p>
                      </div>
                    )}
                    
                    {/* Add XP post cooldown if it doesn't exist */}
                    {!settings?.find(s => s.key === "xp_post_cooldown") && (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="xp_post_cooldown" className="text-base">
                              Post XP Cooldown
                            </Label>
                            <Badge variant="outline">Time</Badge>
                          </div>
                          <Input
                            id="xp_post_cooldown"
                            type="number"
                            value={formValues["xp_post_cooldown"] || 5}
                            onChange={(e) => handleInputChange("xp_post_cooldown", e.target.value)}
                            disabled={!isEditing}
                            min={0}
                            max={60}
                            className="w-24"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Time in minutes before a user can earn XP from posting again
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clout Settings Tab */}
          <TabsContent value="clout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clout Settings</CardTitle>
                <CardDescription>
                  Define how users earn clout from reactions and other interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    {settings?.filter(s => s.key.includes('clout')).map(setting => (
                      <div key={setting.key} className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={setting.key} className="text-base">
                              {settingsInfo[setting.key as keyof typeof settingsInfo]?.label || setting.key}
                            </Label>
                            <Badge variant="outline">Clout</Badge>
                          </div>
                          <Input
                            id={setting.key}
                            type="number"
                            value={formValues[setting.key] || 0}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                            disabled={!isEditing}
                            min={settingsInfo[setting.key as keyof typeof settingsInfo]?.min || 0}
                            max={settingsInfo[setting.key as keyof typeof settingsInfo]?.max || 100}
                            className="w-24"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {settingsInfo[setting.key as keyof typeof settingsInfo]?.description || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 