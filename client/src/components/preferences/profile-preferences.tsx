import React, { useState, useEffect } from 'react';
import type { User } from '@shared/types/user';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Switch } from '@app/components/ui/switch';
import { Label } from '@app/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Card, CardContent } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { UploadCloud } from 'lucide-react';
import { PreferencesCard } from './PreferencesCard';
import { PreferencesGroup } from './PreferencesGroup';
import { PreferencesInput } from './PreferencesInput';
import { PreferencesTextarea } from './PreferencesTextarea';
import { useUserSettings } from '@app/hooks/preferences/useUserSettings';
import { useUpdateUserSettings } from '@app/hooks/preferences/useUpdateUserSettings';

interface ProfilePreferencesProps {
	user: User;
}

export function ProfilePreferences({ user }: ProfilePreferencesProps) {
	const { data: userSettings, isLoading } = useUserSettings();
	const updateProfileSettings = useUpdateUserSettings('profile');

	const [formData, setFormData] = useState({
		bio: '',
		signature: '',
		discordHandle: '',
		twitterHandle: '',
		website: '',
		telegramHandle: ''
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
				telegramHandle: userSettings.profile.telegramHandle || ''
			});
		}
	}, [userSettings]);

	const handleInputChange = (key: keyof typeof formData) => (value: string) => {
		setFormData({ ...formData, [key]: value });
	};

	const handleSubmit = () => {
		const cleaned = {
			...formData,
			discordHandle: formData.discordHandle?.replace(/^@/, ''),
			twitterHandle: formData.twitterHandle?.replace(/^@/, ''),
			telegramHandle: formData.telegramHandle?.replace(/^@/, '')
		};
		updateProfileSettings.mutate(cleaned);
	};

	// Placeholder for image upload function
	const handleImageUpload = (type: 'avatar' | 'banner') => {
		// TODO: Implement ${type} image upload
	};

	if (isLoading) {
		return <div>Loading profile preferences...</div>;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">Profile Preferences</h2>
				<p className="text-muted-foreground">Manage how others see you on the platform</p>
			</div>

			<PreferencesCard title="Profile Images" description="Your avatar and profile banner">
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
						<Button
							variant="outline"
							size="sm"
							className="self-start"
							onClick={() => handleImageUpload('banner')}
						>
							<UploadCloud className="mr-2 h-4 w-4" />
							Change Banner
						</Button>
					</div>
				</div>
			</PreferencesCard>

			<PreferencesCard
				title="Profile Information"
				description="How you present yourself to the community"
			>
				<PreferencesGroup>
					<PreferencesTextarea
						id="bio"
						label="Bio"
						description="Tell others a bit about yourself"
						value={formData.bio}
						onChange={handleInputChange('bio')}
						placeholder="Write a short bio..."
					/>

					<PreferencesTextarea
						id="signature"
						label="Forum Signature"
						description="Appears at the bottom of your forum posts"
						value={formData.signature}
						onChange={handleInputChange('signature')}
						placeholder="Your signature text..."
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<PreferencesCard title="Social Profiles" description="Link your social media accounts">
				<PreferencesGroup>
					<PreferencesInput
						id="discordHandle"
						label="Discord"
						value={formData.discordHandle}
						onChange={handleInputChange('discordHandle')}
						placeholder="Your Discord username"
					/>

					<PreferencesInput
						id="twitterHandle"
						label="Twitter"
						value={formData.twitterHandle}
						onChange={handleInputChange('twitterHandle')}
						placeholder="Your Twitter handle"
					/>

					<PreferencesInput
						id="telegramHandle"
						label="Telegram"
						value={formData.telegramHandle}
						onChange={handleInputChange('telegramHandle')}
						placeholder="Your Telegram username"
					/>

					<PreferencesInput
						id="website"
						label="Website"
						value={formData.website}
						onChange={handleInputChange('website')}
						placeholder="https://your-website.com"
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<div className="flex justify-end mt-6">
				<Button onClick={handleSubmit} disabled={updateProfileSettings.isPending}>
					{updateProfileSettings.isPending ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</div>
	);
}
