import React, { useState, useEffect } from 'react';
// removed heavy server schema import
import type { User } from '@shared/types/user.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PreferencesCard } from './PreferencesCard';
import { PreferencesGroup } from './PreferencesGroup';
import { PreferencesInput } from './PreferencesInput';
import { PreferencesSelect } from './PreferencesSelect';
import { useUserSettings } from '@/hooks/preferences/useUserSettings';
import {
	useUpdateUserSettings,
	useUpdatePassword
} from '@/hooks/preferences/useUpdateUserSettings';

interface AccountPreferencesProps {
	user: User;
}

// Language options
const LANGUAGE_OPTIONS = [
	{ value: 'en', label: 'English' },
	{ value: 'es', label: 'Spanish' },
	{ value: 'fr', label: 'French' },
	{ value: 'de', label: 'German' },
	{ value: 'ja', label: 'Japanese' },
	{ value: 'zh', label: 'Chinese' }
];

// Timezone options (abbreviated list)
const TIMEZONE_OPTIONS = [
	{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
	{ value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
	{ value: 'America/Chicago', label: 'Central Time (US & Canada)' },
	{ value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
	{ value: 'Europe/London', label: 'London, Edinburgh' },
	{ value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid' },
	{ value: 'Asia/Tokyo', label: 'Tokyo, Osaka' },
	{ value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
	{ value: 'Australia/Sydney', label: 'Sydney, Melbourne' }
];

export function AccountPreferences({ user }: AccountPreferencesProps) {
	const { data: userSettings, isLoading } = useUserSettings();
	const updateAccountSettings = useUpdateUserSettings('account');
	const updatePassword = useUpdatePassword();

	// Account preferences form
	const [accountForm, setAccountForm] = useState({
		language: 'en',
		timezone: ''
	});

	// Password change form
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	// Form validation errors
	const [passwordErrors, setPasswordErrors] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	// Initialize form with user data when loaded
	useEffect(() => {
		if (userSettings?.preferences) {
			setAccountForm({
				language: userSettings.preferences.language || 'en',
				timezone: userSettings.preferences.timezone || ''
			});
		}
	}, [userSettings]);

	// Handle account form changes
	const handleAccountChange = (field: keyof typeof accountForm) => (value: string) => {
		setAccountForm((prev) => ({ ...prev, [field]: value }));
	};

	// Handle password form changes
	const handlePasswordChange =
		(field: keyof typeof passwordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));

			// Clear validation error when user types
			if (passwordErrors[field]) {
				setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
			}
		};

	// Save account preferences
	const handleSaveAccount = () => {
		updateAccountSettings.mutate(accountForm);
	};

	// Validate and submit password change
	const handleSavePassword = () => {
		// Clear previous errors
		setPasswordErrors({
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		});

		// Validate fields
		let isValid = true;

		if (!passwordForm.currentPassword) {
			setPasswordErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' }));
			isValid = false;
		}

		if (!passwordForm.newPassword) {
			setPasswordErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
			isValid = false;
		} else if (passwordForm.newPassword.length < 8) {
			setPasswordErrors((prev) => ({
				...prev,
				newPassword: 'Password must be at least 8 characters'
			}));
			isValid = false;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
			isValid = false;
		}

		if (isValid) {
			updatePassword.mutate({
				oldPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword
			});

			// Clear form on successful submission
			if (!updatePassword.isError) {
				setPasswordForm({
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				});
			}
		}
	};

	if (isLoading) {
		return <div>Loading account preferences...</div>;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">Account Preferences</h2>
				<p className="text-muted-foreground">Manage your account preferences and security</p>
			</div>

			<PreferencesCard title="Account Information" description="Your basic account info">
				<PreferencesGroup>
					<PreferencesInput
						id="email"
						label="Email Address"
						type="email"
						value={userSettings?.profile.email || ''}
						onChange={() => {}}
						disabled={true}
						description="Contact support to change your email address"
					/>

					<PreferencesInput
						id="username"
						label="Username"
						value={userSettings?.profile.username || ''}
						onChange={() => {}}
						disabled={true}
						description="Your unique username cannot be changed"
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<PreferencesCard title="Preferences" description="Regional and language preferences">
				<PreferencesGroup>
					<PreferencesSelect
						id="language"
						label="Language"
						description="Select your preferred language"
						value={accountForm.language}
						onChange={handleAccountChange('language')}
						options={LANGUAGE_OPTIONS}
					/>

					<PreferencesSelect
						id="timezone"
						label="Timezone"
						description="Set your local timezone"
						value={accountForm.timezone}
						onChange={handleAccountChange('timezone')}
						options={TIMEZONE_OPTIONS}
						placeholder="Select a timezone"
					/>
				</PreferencesGroup>

				<div className="flex justify-end mt-4">
					<Button onClick={handleSaveAccount} disabled={updateAccountSettings.isPending}>
						{updateAccountSettings.isPending ? 'Saving...' : 'Save Preferences'}
					</Button>
				</div>
			</PreferencesCard>

			<PreferencesCard
				title="Change Password"
				description="Update your password regularly for better security"
			>
				<PreferencesGroup>
					<PreferencesInput
						id="currentPassword"
						label="Current Password"
						type="password"
						value={passwordForm.currentPassword}
						onChange={(v) =>
							handlePasswordChange('currentPassword')({ target: { value: v } } as any)
						}
						required
						error={passwordErrors.currentPassword}
					/>

					<PreferencesInput
						id="newPassword"
						label="New Password"
						type="password"
						value={passwordForm.newPassword}
						onChange={(v) => handlePasswordChange('newPassword')({ target: { value: v } } as any)}
						required
						error={passwordErrors.newPassword}
						description="Use at least 8 characters with a mix of letters, numbers & symbols"
					/>

					<PreferencesInput
						id="confirmPassword"
						label="Confirm New Password"
						type="password"
						value={passwordForm.confirmPassword}
						onChange={(v) =>
							handlePasswordChange('confirmPassword')({ target: { value: v } } as any)
						}
						required
						error={passwordErrors.confirmPassword}
					/>
				</PreferencesGroup>

				<div className="flex justify-end mt-4">
					<Button onClick={handleSavePassword} disabled={updatePassword.isPending}>
						{updatePassword.isPending ? 'Saving...' : 'Change Password'}
					</Button>
				</div>
			</PreferencesCard>
		</div>
	);
}
