import React, { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Mail, 
  MessageSquare,
  AtSign,
  Heart,
  Award,
  ShoppingBag, 
  AlertTriangle,
  Users,
  BarChart
} from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { SettingsGroup } from './SettingsGroup';
import { SettingsToggle } from './SettingsToggle';
import { useUserSettings } from '@/hooks/settings/useUserSettings';
import { useUpdateUserSettings } from '@/hooks/settings/useUpdateUserSettings';

interface NotificationSettingsProps {
  user: User;
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const { data: userSettings, isLoading } = useUserSettings();
  const updateNotificationSettings = useUpdateUserSettings('notifications');
  
  const [notificationForm, setNotificationForm] = useState({
    receiveEmailNotifications: false,
    notifyOnMentions: true,
    notifyOnNewReplies: true,
    notifyOnLevelUp: true,
    notifyOnMissionUpdates: true,
    notifyOnWalletTransactions: true,
  });
  
  // Initialize form with user data when loaded
  useEffect(() => {
    if (userSettings?.notifications) {
      setNotificationForm({
        receiveEmailNotifications: userSettings.notifications.receiveEmailNotifications,
        notifyOnMentions: userSettings.notifications.notifyOnMentions,
        notifyOnNewReplies: userSettings.notifications.notifyOnNewReplies,
        notifyOnLevelUp: userSettings.notifications.notifyOnLevelUp,
        notifyOnMissionUpdates: userSettings.notifications.notifyOnMissionUpdates,
        notifyOnWalletTransactions: userSettings.notifications.notifyOnWalletTransactions,
      });
    }
  }, [userSettings]);
  
  // Handle toggle change
  const handleToggleChange = (key: keyof typeof notificationForm) => (value: boolean) => {
    setNotificationForm(prev => ({ ...prev, [key]: value }));
  };
  
  // Save notification settings
  const handleSave = () => {
    updateNotificationSettings.mutate(notificationForm);
  };
  
  if (isLoading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">Choose how and when you want to be notified</p>
      </div>
      
      <SettingsCard 
        title="Email Notifications" 
        description="Manage email notifications for important updates"
      >
        <SettingsGroup>
          <SettingsToggle
            id="email-notifications"
            label="Receive Email Notifications"
            description="Allow the system to send you email notifications"
            checked={notificationForm.receiveEmailNotifications}
            onCheckedChange={handleToggleChange('receiveEmailNotifications')}
          />
        </SettingsGroup>
      </SettingsCard>
      
      <SettingsCard 
        title="Forum Notifications" 
        description="Notifications related to forum activity"
      >
        <SettingsGroup>
          <SettingsToggle
            id="mentions"
            label="Mentions"
            description="Notify when someone mentions you in a post"
            checked={notificationForm.notifyOnMentions}
            onCheckedChange={handleToggleChange('notifyOnMentions')}
          />
          
          <SettingsToggle
            id="replies"
            label="Replies"
            description="Notify when someone replies to your posts"
            checked={notificationForm.notifyOnNewReplies}
            onCheckedChange={handleToggleChange('notifyOnNewReplies')}
          />
        </SettingsGroup>
      </SettingsCard>
      
      <SettingsCard 
        title="Achievement Notifications" 
        description="Notifications for achievements and rewards"
      >
        <SettingsGroup>
          <SettingsToggle
            id="level-up"
            label="Level Ups"
            description="Notify when you level up"
            checked={notificationForm.notifyOnLevelUp}
            onCheckedChange={handleToggleChange('notifyOnLevelUp')}
          />
          
          <SettingsToggle
            id="missions"
            label="Mission Updates"
            description="Notify about missions and challenges"
            checked={notificationForm.notifyOnMissionUpdates}
            onCheckedChange={handleToggleChange('notifyOnMissionUpdates')}
          />
        </SettingsGroup>
      </SettingsCard>
      
      <SettingsCard 
        title="Financial Notifications" 
        description="Wallet and transaction notifications"
      >
        <SettingsGroup>
          <SettingsToggle
            id="wallet-transactions"
            label="Wallet Transactions"
            description="Notify about wallet activities and transactions"
            checked={notificationForm.notifyOnWalletTransactions}
            onCheckedChange={handleToggleChange('notifyOnWalletTransactions')}
          />
        </SettingsGroup>
      </SettingsCard>
      
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={updateNotificationSettings.isPending}
        >
          {updateNotificationSettings.isPending ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
}
