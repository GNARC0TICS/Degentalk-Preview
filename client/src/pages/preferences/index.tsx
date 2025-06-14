import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfilePreferences } from '@/components/preferences/profile-preferences';
import { AccountPreferences } from '@/components/preferences/account-preferences';
import { NotificationPreferences } from '@/components/preferences/notification-preferences';
import { DisplayPreferences } from '@/components/preferences/display-preferences';
import { SessionPreferences } from '@/components/preferences/session-preferences';
import { ReferralPreferences } from '@/components/preferences/referral-preferences';
import { User, Shield, Bell, Monitor, Lock, Users, Share2 } from 'lucide-react';
import { useProfile } from '@/contexts/profile-context';
import { ProtectedRoute } from '@/lib/protected-route';

/**
 * Preferences page with tabbed interface for different preferences categories.
 * This page is protected and only accessible to logged-in users.
 */
function PreferencesPage() {
	console.log('PreferencesPage component started rendering.');
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState('profile');

	// Parse URL query parameters to get the active tab
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tabParam = params.get('tab');
		if (tabParam && ['profile', 'account', 'notifications', 'display', 'sessions', 'referrals'].includes(tabParam)) {
			setActiveTab(tabParam);
		}
	}, []);

	// Update URL when tab changes
	const handleTabChange = (value: string) => {
		setActiveTab(value);
		const url = new URL(window.location.href);
		url.searchParams.set('tab', value);
		window.history.pushState({}, '', url.toString());
	};

	console.log('User in PreferencesPage:', user);

	if (!user) {
		console.log('User is null, rendering authentication required message.');
		return (
			<div className="min-h-screen bg-black text-white flex flex-col">
				<SiteHeader />
				<div className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
					<Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
						<CardHeader>
							<CardTitle>Authentication Required</CardTitle>
							<CardDescription>You need to be logged in to access preferences.</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-zinc-400">Please log in to view and manage your preferences.</p>
						</CardContent>
					</Card>
				</div>
				<SiteFooter />
			</div>
		);
	}

	console.log('User is present, rendering main preferences content.');
	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<SiteHeader />

			<main className="container mx-auto px-4 py-6 md:py-12 flex-1">
				<div className="max-w-5xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">Preferences</h1>
						<p className="text-zinc-400">Manage your account preferences and preferences</p>
					</div>

					<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
						<TabsList className="w-full max-w-md grid grid-cols-6 mb-8">
							<TabsTrigger
								value="profile"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<User className="h-5 w-5" />
								<span className="text-xs">Profile</span>
							</TabsTrigger>
							<TabsTrigger
								value="account"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<Shield className="h-5 w-5" />
								<span className="text-xs">Account</span>
							</TabsTrigger>
							<TabsTrigger
								value="notifications"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<Bell className="h-5 w-5" />
								<span className="text-xs">Notifications</span>
							</TabsTrigger>
							<TabsTrigger
								value="display"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<Monitor className="h-5 w-5" />
								<span className="text-xs">Display</span>
							</TabsTrigger>
							<TabsTrigger
								value="sessions"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<Lock className="h-5 w-5" />
								<span className="text-xs">Sessions</span>
							</TabsTrigger>
							<TabsTrigger
								value="referrals"
								className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-zinc-800"
							>
								<Share2 className="h-5 w-5" />
								<span className="text-xs">Referrals</span>
							</TabsTrigger>
						</TabsList>

						<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
							<TabsContent value="profile">
								<ProfilePreferences user={user} />
							</TabsContent>

							<TabsContent value="account">
								<AccountPreferences user={user} />
							</TabsContent>

							<TabsContent value="notifications">
								<NotificationPreferences user={user} />
							</TabsContent>

							<TabsContent value="display">
								<DisplayPreferences user={user} />
							</TabsContent>

							<TabsContent value="sessions">
								<SessionPreferences user={user} />
							</TabsContent>
							
							<TabsContent value="referrals">
								<ReferralPreferences user={user} />
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
			<PreferencesPage />
		</ProtectedRoute>
	);
}
