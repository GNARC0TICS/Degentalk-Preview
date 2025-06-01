import React, { useState } from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Monitor, LayoutGrid, LayoutList, Eye } from 'lucide-react';

interface DisplaySettingsProps {
  user: User;
}

export function DisplaySettings({ user }: DisplaySettingsProps) {
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState('medium');
  const [threadDisplayMode, setThreadDisplayMode] = useState('card');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hideNsfw, setHideNsfw] = useState(true);
  const [showMatureContent, setShowMatureContent] = useState(false);
  const [showOfflineUsers, setShowOfflineUsers] = useState(true);
  
  const handleSaveChanges = () => {
    // Mock implementation - would send to API in real app
    console.log('Saving display settings:', {
      theme,
      fontSize,
      threadDisplayMode,
      reducedMotion,
      hideNsfw,
      showMatureContent,
      showOfflineUsers
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Display Settings</h2>
        <p className="text-zinc-400">Customize how DegenTalk looks for you</p>
      </div>
      
      {/* Theme Settings */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          
          <RadioGroup 
            value={theme} 
            onValueChange={setTheme}
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
      
      {/* Text Size Settings */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Text Size</h3>
            
            <Select value={fontSize} onValueChange={setFontSize}>
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
            <p className={`text-sm ${fontSize === 'small' ? 'text-sm' : fontSize === 'medium' ? 'text-base' : fontSize === 'large' ? 'text-lg' : 'text-xl'}`}>
              This is how text will appear in the forum.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Thread Display Settings */}
      <Card className="mb-6 bg-zinc-800/50 border-zinc-700">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Thread Display Mode</h3>
          
          <RadioGroup 
            value={threadDisplayMode} 
            onValueChange={setThreadDisplayMode}
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
      
      {/* Accessibility & Content Settings */}
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
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
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
                checked={hideNsfw}
                onCheckedChange={setHideNsfw}
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
                checked={showMatureContent}
                onCheckedChange={setShowMatureContent}
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
                checked={showOfflineUsers}
                onCheckedChange={setShowOfflineUsers}
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
