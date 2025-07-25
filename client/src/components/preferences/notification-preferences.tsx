import React, { useState, useEffect } from 'react';
import type { User } from '@shared/types/user';
import { Button } from '@app/components/ui/button';
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
import { PreferencesCard } from './PreferencesCard';
import { PreferencesGroup } from './PreferencesGroup';
import { PreferencesToggle } from './PreferencesToggle';
import { useUserSettings } from '@app/hooks/preferences/useUserSettings';
import { useUpdateUserSettings } from '@app/hooks/preferences/useUpdateUserSettings';

interface NotificationPreferencesProps {
	user: User;
}

export function NotificationPreferences({ user }: NotificationPreferencesProps) {
	const { data: userSettings, isLoading } = useUserSettings();
	const updateNotificationSettings = useUpdateUserSettings('notifications');

	const [notificationForm, setNotificationForm] = useState({
		receiveEmailNotifications: false,
		notifyOnMentions: true,
		notifyOnNewReplies: true,
		notifyOnLevelUp: true,
		notifyOnMissionUpdates: true,
		notifyOnWalletTransactions: true
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
				notifyOnWalletTransactions: userSettings.notifications.notifyOnWalletTransactions
			});
		}
	}, [userSettings]);

	// Handle toggle change
	const handleToggleChange = (key: keyof typeof notificationForm) => (value: boolean) => {
		setNotificationForm((prev) => ({ ...prev, [key]: value }));
	};

	// Save notification preferences
	const handleSave = () => {
		updateNotificationSettings.mutate(notificationForm);
	};

	if (isLoading) {
		return <div>Loading notification preferences...</div>;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
				<p className="text-muted-foreground">Choose how and when you want to be notified</p>
			</div>

			<PreferencesCard
				title="Email Notifications"
				description="Manage email notifications for important updates"
			>
				<PreferencesGroup>
					<PreferencesToggle
						id="email-notifications"
						label="Receive Email Notifications"
						description="Allow the system to send you email notifications"
						checked={notificationForm.receiveEmailNotifications}
						onCheckedChange={handleToggleChange('receiveEmailNotifications')}
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<PreferencesCard
				title="Forum Notifications"
				description="Notifications related to forum activity"
			>
				<PreferencesGroup>
					<PreferencesToggle
						id="mentions"
						label="Mentions"
						description="Notify when someone mentions you in a post"
						checked={notificationForm.notifyOnMentions}
						onCheckedChange={handleToggleChange('notifyOnMentions')}
					/>

					<PreferencesToggle
						id="replies"
						label="Replies"
						description="Notify when someone replies to your posts"
						checked={notificationForm.notifyOnNewReplies}
						onCheckedChange={handleToggleChange('notifyOnNewReplies')}
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<PreferencesCard
				title="Achievement Notifications"
				description="Notifications for achievements and rewards"
			>
				<PreferencesGroup>
					<PreferencesToggle
						id="level-up"
						label="Level Ups"
						description="Notify when you level up"
						checked={notificationForm.notifyOnLevelUp}
						onCheckedChange={handleToggleChange('notifyOnLevelUp')}
					/>

					<PreferencesToggle
						id="missions"
						label="Mission Updates"
						description="Notify about missions and challenges"
						checked={notificationForm.notifyOnMissionUpdates}
						onCheckedChange={handleToggleChange('notifyOnMissionUpdates')}
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<PreferencesCard
				title="Financial Notifications"
				description="Wallet and transaction notifications"
			>
				<PreferencesGroup>
					<PreferencesToggle
						id="wallet-transactions"
						label="Wallet Transactions"
						description="Notify about wallet activities and transactions"
						checked={notificationForm.notifyOnWalletTransactions}
						onCheckedChange={handleToggleChange('notifyOnWalletTransactions')}
					/>
				</PreferencesGroup>
			</PreferencesCard>

			<div className="flex justify-end mt-6">
				<Button onClick={handleSave} disabled={updateNotificationSettings.isPending}>
					{updateNotificationSettings.isPending ? 'Saving...' : 'Save Notification Preferences'}
				</Button>
			</div>
		</div>
	);
}
