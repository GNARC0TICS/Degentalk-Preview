import React, { useState, useEffect } from 'react';
import { User } from '@schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Monitor, LayoutGrid, LayoutList, Eye } from 'lucide-react';
import { useUserSettings } from '@/hooks/preferences/useUserSettings';
import { useUpdateUserSettings } from '@/hooks/preferences/useUpdateUserSettings';

interface DisplayPreferencesProps {
  user: User;
}

export function DisplayPreferences({ user }: DisplayPreferencesProps) {
  const { data: userSettings, isLoading } = useUserSettings();
  const updateDisplaySettings = useUpdateUserSettings('display');

  const [formData, setFormData] = useState({
    theme: 'system',
    fontSize: 'medium',
    threadDisplayMode: 'card',
    reducedMotion: false,
    hideNsfw: true,
    showMatureContent: false,
    showOfflineUsers: true,
  });

  useEffect(() => {
    if (userSettings?.display) {
      setFormData({
        theme: userSettings.display.theme || 'system',
        fontSize: userSettings.display.fontSize || 'medium',
        threadDisplayMode: userSettings.display.threadDisplayMode || 'card',
        reducedMotion: userSettings.display.reducedMotion || false,
        hideNsfw: userSettings.display.hideNsfw || true,
        showMatureContent: userSettings.display.showMatureContent || false,
        showOfflineUsers: userSettings.display.showOfflineUsers || true,
      });
    }
  }, [userSettings]);

  const handleValueChange = (key: keyof typeof formData) => (value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveChanges = () => {
    updateDisplaySettings.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading display preferences...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Display Preferences</h2>
        <p className="text-zinc-400">Customize how DegenTalk looks for you</p>
      </div>
      
      {/* Theme Preferences */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          
          <RadioGroup 
            value={formData.theme} 
            onValueChange={handleValueChange('theme')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-800">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                <Sun className="h-5 w-5 mr-3 text-amber-400" />
                <div>
                  <span className="font-medium">Light</span>
                  <p className="text-xs text-zinc-400">Light theme for daytime viewing</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-800">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                <Moon className="h-5 w-5 mr-3 text-indigo-400" />
                <div>
                  <span className="font-medium">Dark</span>
                  <p className="text-xs text-zinc-400">Dark theme for low-light environments</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-800">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="flex items-center cursor-pointer">
                <Monitor className="h-5 w-5 mr-3 text-emerald-400" />
                <div>
                  <span className="font-medium">System</span>
                  <p className="text-xs text-zinc-400">Follow your system preferences</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Text Size Preferences */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Text Size</h3>
            
            <Select value={formData.fontSize} onValueChange={handleValueChange('fontSize')}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="x-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-zinc-900 p-4 rounded-md">
            <p className={`text-sm ${formData.fontSize === 'small' ? 'text-sm' : formData.fontSize === 'medium' ? 'text-base' : formData.fontSize === 'large' ? 'text-lg' : 'text-xl'}`}>
              This is how text will appear in the forum.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Thread Display Preferences */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Thread Display Mode</h3>
          
          <RadioGroup 
            value={formData.threadDisplayMode} 
            onValueChange={handleValueChange('threadDisplayMode')}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-800">
              <RadioGroupItem value="card" id="display-card" />
              <Label htmlFor="display-card" className="flex items-center cursor-pointer">
                <LayoutGrid className="h-5 w-5 mr-3 text-blue-400" />
                <div>
                  <span className="font-medium">Card View</span>
                  <p className="text-xs text-zinc-400">Display threads as visual cards with previews</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-800">
              <RadioGroupItem value="list" id="display-list" />
              <Label htmlFor="display-list" className="flex items-center cursor-pointer">
                <LayoutList className="h-5 w-5 mr-3 text-purple-400" />
                <div>
                  <span className="font-medium">Compact List</span>
                  <p className="text-xs text-zinc-400">Display threads as a more condensed list</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Accessibility & Content Preferences */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Accessibility & Content</h3>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">Reduce Motion</Label>
                <p className="text-xs text-zinc-400">
                  Minimize animated effects throughout the interface
                </p>
              </div>
              <Switch
                checked={formData.reducedMotion}
                onCheckedChange={handleValueChange('reducedMotion')}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">Hide NSFW Content</Label>
                <p className="text-xs text-zinc-400">
                  Blur and hide content marked as not safe for work
                </p>
              </div>
              <Switch
                checked={formData.hideNsfw}
                onCheckedChange={handleValueChange('hideNsfw')}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">Show Mature Content</Label>
                <p className="text-xs text-zinc-400">
                  Display content marked for mature audiences
                </p>
              </div>
              <Switch
                checked={formData.showMatureContent}
                onCheckedChange={handleValueChange('showMatureContent')}
              />
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">Show Offline Users</Label>
                <p className="text-xs text-zinc-400">
                  Display users who are currently offline in user lists
                </p>
              </div>
              <Switch
                checked={formData.showOfflineUsers}
                onCheckedChange={handleValueChange('showOfflineUsers')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <Button 
          type="button" 
          variant="outline" 
          className="border-zinc-700 bg-zinc-800/50"
        >
          Reset to Defaults
        </Button>
        <Button 
          type="button" 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSaveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
