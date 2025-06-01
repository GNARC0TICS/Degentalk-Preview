import React, { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UploadCloud } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { SettingsGroup } from './SettingsGroup';
import { SettingsInput } from './SettingsInput';
import { SettingsTextarea } from './SettingsTextarea';
import { useUserSettings } from '@/hooks/settings/useUserSettings';
import { useUpdateUserSettings } from '@/hooks/settings/useUpdateUserSettings';

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { data: userSettings, isLoading } = useUserSettings();
  const updateProfileSettings = useUpdateUserSettings('profile');

  const [formData, setFormData] = useState({
    bio: '',
    signature: '',
    discordHandle: '',
    twitterHandle: '',
    website: '',
    telegramHandle: '',
  });

  // Initialize form with user data when loaded
  useEffect(() => {
    if (userSettings) {
      setFormData({
        bio: userSettings.profile.bio || '',
        signature: userSettings.profile.signature || '',
        discordHandle: userSettings.profile.discordHandle || '',
        twitterHandle: userSettings.profile.twitterHandle || '',
        website: userSettings.profile.website || '',
        telegramHandle: userSettings.profile.telegramHandle || '',
      });
    }
  }, [userSettings]);

  const handleInputChange = (key: keyof typeof formData) => (value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    updateProfileSettings.mutate(formData);
  };

  // Placeholder for image upload function
  const handleImageUpload = (type: 'avatar' | 'banner') => {
    console.log(`Upload ${type} image - to be implemented`);
  };

  if (isLoading) {
    return <div>Loading profile settings...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage how others see you on the platform</p>
      </div>

      <SettingsCard title="Profile Images" description="Your avatar and profile banner">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userSettings?.profile.avatarUrl || undefined} alt={user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={() => handleImageUpload('avatar')}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Change Avatar
            </Button>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
              {userSettings?.profile.profileBannerUrl ? (
                <img
                  src={userSettings.profile.profileBannerUrl}
                  alt="Profile Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No banner image
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="self-start" onClick={() => handleImageUpload('banner')}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Change Banner
            </Button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Profile Information" description="How you present yourself to the community">
        <SettingsGroup>
          <SettingsTextarea
            id="bio"
            label="Bio"
            description="Tell others a bit about yourself"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            placeholder="Write a short bio..."
          />

          <SettingsTextarea
            id="signature"
            label="Forum Signature"
            description="Appears at the bottom of your forum posts"
            value={formData.signature}
            onChange={handleInputChange('signature')}
            placeholder="Your signature text..."
          />
        </SettingsGroup>
      </SettingsCard>

      <SettingsCard title="Social Profiles" description="Link your social media accounts">
        <SettingsGroup>
          <SettingsInput
            id="discordHandle"
            label="Discord"
            value={formData.discordHandle}
            onChange={handleInputChange('discordHandle')}
            placeholder="Your Discord username"
          />

          <SettingsInput
            id="twitterHandle"
            label="Twitter"
            value={formData.twitterHandle}
            onChange={handleInputChange('twitterHandle')}
            placeholder="Your Twitter handle"
          />

          <SettingsInput
            id="telegramHandle"
            label="Telegram"
            value={formData.telegramHandle}
            onChange={handleInputChange('telegramHandle')}
            placeholder="Your Telegram username"
          />

          <SettingsInput
            id="website"
            label="Website"
            value={formData.website}
            onChange={handleInputChange('website')}
            placeholder="https://your-website.com"
          />
        </SettingsGroup>
      </SettingsCard>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmit}
          disabled={updateProfileSettings.isPending}
        >
          {updateProfileSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
