import React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { AccountSettings } from '@/components/settings/account-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { DisplaySettings } from '@/components/settings/display-settings';
import { SessionSettings } from '@/components/settings/session-settings';
import { User, Shield, Bell, Monitor, Lock } from 'lucide-react';
import { useProfile } from '@/contexts/profile-context';
import { ProtectedRoute } from '@/lib/protected-route';

/**
 * Settings page with tabbed interface for different setting categories.
 * This page is protected and only accessible to logged-in users.
 */
function SettingsPage() {
  console.log("SettingsPage component started rendering.");
  const { user } = useAuth();
  console.log("User in SettingsPage:", user);
  
  if (!user) {
    console.log("User is null, rendering authentication required message.");
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SiteHeader />
        <div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>You need to be logged in to access settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Please log in to view and manage your settings.</p>
            </CardContent>
          </Card>
        </div>
        <SiteFooter />
      </div>
    );
  }
  
  console.log("User is present, rendering main settings content.");
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-6 md:py-12 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-zinc-400">Manage your account preferences and settings</p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-5 mb-8">
              <TabsTrigger value="profile" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800">
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800">
                <Shield className="h-5 w-5" />
                <span className="text-xs">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800">
                <Bell className="h-5 w-5" />
                <span className="text-xs">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800">
                <Monitor className="h-5 w-5" />
                <span className="text-xs">Display</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800">
                <Lock className="h-5 w-5" />
                <span className="text-xs">Sessions</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <TabsContent value="profile">
                <ProfileSettings user={user} />
              </TabsContent>
              
              <TabsContent value="account">
                <AccountSettings user={user} />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationSettings user={user} />
              </TabsContent>
              
              <TabsContent value="display">
                <DisplaySettings user={user} />
              </TabsContent>
              
              <TabsContent value="sessions">
                <SessionSettings user={user} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}

// Wrap with protected route to ensure authentication
export default function ProtectedSettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}
