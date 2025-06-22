import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	MessageSquare,
	Users,
	UserPlus,
	Crown,
	Eye,
	EyeOff,
	Shield,
	Bell,
	Settings,
	Lock,
	Globe,
	UserCheck,
	UserX,
	AlertCircle,
	CheckCircle,
	Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PreferencesCard } from './PreferencesCard';
import { PreferencesGroup } from './PreferencesGroup';
import { PreferencesToggle } from './PreferencesToggle';

interface User {
	id: string;
	username: string;
	level?: number;
	role?: string;
}

interface SocialPrivacyPreferences {
	// Mentions preferences
	allowMentions: boolean;
	mentionPermissions: 'everyone' | 'friends' | 'followers' | 'none';
	mentionNotifications: boolean;
	mentionEmailNotifications: boolean;

	// Following preferences
	allowFollowers: boolean;
	followerApprovalRequired: boolean;
	hideFollowerCount: boolean;
	hideFollowingCount: boolean;
	allowWhaleDesignation: boolean;

	// Friends preferences
	allowFriendRequests: boolean;
	friendRequestPermissions: 'everyone' | 'mutuals' | 'followers' | 'none';
	autoAcceptMutualFollows: boolean;
	hideOnlineStatus: boolean;
	hideFriendsList: boolean;

	// General privacy
	showSocialActivity: boolean;
	allowDirectMessages: 'friends' | 'followers' | 'everyone' | 'none';
	showProfileToPublic: boolean;
	allowSocialDiscovery: boolean;
}

interface SocialPreferencesProps {
	user: User;
}

export function SocialPreferences({ user }: SocialPreferencesProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isSaving, setIsSaving] = useState(false);

	// Fetch user's social preferences
	const { data: preferences, isLoading } = useQuery<SocialPrivacyPreferences>({
		queryKey: ['/api/users/social-preferences'],
		queryFn: async () => {
			return await apiRequest<SocialPrivacyPreferences>({
				url: '/api/users/social-preferences',
				method: 'GET'
			});
		},
		// Default values if no preferences exist
		placeholderData: {
			allowMentions: true,
			mentionPermissions: 'everyone',
			mentionNotifications: true,
			mentionEmailNotifications: false,
			allowFollowers: true,
			followerApprovalRequired: false,
			hideFollowerCount: false,
			hideFollowingCount: false,
			allowWhaleDesignation: true,
			allowFriendRequests: true,
			friendRequestPermissions: 'everyone',
			autoAcceptMutualFollows: false,
			hideOnlineStatus: false,
			hideFriendsList: false,
			showSocialActivity: true,
			allowDirectMessages: 'friends',
			showProfileToPublic: true,
			allowSocialDiscovery: true
		}
	});

	// Update preferences mutation
	const updatePreferencesMutation = useMutation({
		mutationFn: async (updates: Partial<SocialPrivacyPreferences>) => {
			return await apiRequest<SocialPrivacyPreferences>({
				url: '/api/users/social-preferences',
				method: 'PUT',
				data: updates
			});
		},
		onSuccess: () => {
			toast({
				title: 'Preferences Updated',
				description: 'Your social privacy preferences have been saved.',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/users/social-preferences'] });
			setIsSaving(false);
		},
		onError: (error: any) => {
			toast({
				title: 'Update Failed',
				description: error.message || 'Failed to update social preferences',
				variant: 'destructive'
			});
			setIsSaving(false);
		}
	});

	const updatePreference = (key: keyof SocialPrivacyPreferences, value: any) => {
		setIsSaving(true);
		updatePreferencesMutation.mutate({ [key]: value });
	};

	if (isLoading || !preferences) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-sm text-zinc-400">Loading social preferences...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold mb-2">Social Privacy</h2>
				<p className="text-zinc-400">
					Control how others can interact with you and what information is visible in social
					features.
				</p>
			</div>

			{/* Mentions Settings */}
			<PreferencesCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-blue-400" />
						Mentions
					</CardTitle>
					<CardDescription>
						Control who can mention you using @{user.username} and how you're notified
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<PreferencesToggle
						id="allow-mentions"
						label="Allow Mentions"
						description="Let others mention you in posts and threads"
						checked={preferences.allowMentions}
						onCheckedChange={(checked) => updatePreference('allowMentions', checked)}
						disabled={isSaving}
					/>

					{preferences.allowMentions && (
						<>
							<div className="space-y-2">
								<Label htmlFor="mention-permissions">Who can mention you</Label>
								<Select
									value={preferences.mentionPermissions}
									onValueChange={(value) => updatePreference('mentionPermissions', value)}
									disabled={isSaving}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="everyone">
											<div className="flex items-center gap-2">
												<Globe className="h-4 w-4" />
												Everyone
											</div>
										</SelectItem>
										<SelectItem value="followers">
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4" />
												Followers only
											</div>
										</SelectItem>
										<SelectItem value="friends">
											<div className="flex items-center gap-2">
												<UserCheck className="h-4 w-4" />
												Friends only
											</div>
										</SelectItem>
										<SelectItem value="none">
											<div className="flex items-center gap-2">
												<UserX className="h-4 w-4" />
												No one
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator />

							<PreferencesToggle
								id="mention-notifications"
								label="Mention Notifications"
								description="Get notified when someone mentions you"
								checked={preferences.mentionNotifications}
								onCheckedChange={(checked) => updatePreference('mentionNotifications', checked)}
								disabled={isSaving}
							/>

							<PreferencesToggle
								id="mention-email-notifications"
								label="Email Notifications"
								description="Receive email notifications for mentions"
								checked={preferences.mentionEmailNotifications}
								onCheckedChange={(checked) =>
									updatePreference('mentionEmailNotifications', checked)
								}
								disabled={isSaving}
							/>
						</>
					)}
				</CardContent>
			</PreferencesCard>

			{/* Following/Whale Watch Settings */}
			<PreferencesCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Crown className="h-5 w-5 text-yellow-400" />
						Following & Whale Watch
					</CardTitle>
					<CardDescription>
						Control who can follow you and how your follower information is displayed
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<PreferencesToggle
						id="allow-followers"
						label="Allow Followers"
						description="Let others follow your activity"
						checked={preferences.allowFollowers}
						onCheckedChange={(checked) => updatePreference('allowFollowers', checked)}
						disabled={isSaving}
					/>

					{preferences.allowFollowers && (
						<>
							<PreferencesToggle
								id="follower-approval"
								label="Require Approval"
								description="Approve follow requests before they can follow you"
								checked={preferences.followerApprovalRequired}
								onCheckedChange={(checked) => updatePreference('followerApprovalRequired', checked)}
								disabled={isSaving}
							/>

							<Separator />

							<div className="space-y-3">
								<h4 className="font-medium text-sm">Visibility Settings</h4>

								<PreferencesToggle
									id="hide-follower-count"
									label="Hide Follower Count"
									description="Don't show how many people follow you"
									checked={preferences.hideFollowerCount}
									onCheckedChange={(checked) => updatePreference('hideFollowerCount', checked)}
									disabled={isSaving}
								/>

								<PreferencesToggle
									id="hide-following-count"
									label="Hide Following Count"
									description="Don't show how many people you follow"
									checked={preferences.hideFollowingCount}
									onCheckedChange={(checked) => updatePreference('hideFollowingCount', checked)}
									disabled={isSaving}
								/>

								<PreferencesToggle
									id="allow-whale-designation"
									label="Allow Whale Designation"
									description="Let the system identify you as a whale based on your activity"
									checked={preferences.allowWhaleDesignation}
									onCheckedChange={(checked) => updatePreference('allowWhaleDesignation', checked)}
									disabled={isSaving}
								/>
							</div>
						</>
					)}
				</CardContent>
			</PreferencesCard>

			{/* Friends Settings */}
			<PreferencesCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-green-400" />
						Friends
					</CardTitle>
					<CardDescription>Manage friend requests and friendship privacy settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<PreferencesToggle
						id="allow-friend-requests"
						label="Allow Friend Requests"
						description="Let others send you friend requests"
						checked={preferences.allowFriendRequests}
						onCheckedChange={(checked) => updatePreference('allowFriendRequests', checked)}
						disabled={isSaving}
					/>

					{preferences.allowFriendRequests && (
						<>
							<div className="space-y-2">
								<Label htmlFor="friend-request-permissions">Who can send friend requests</Label>
								<Select
									value={preferences.friendRequestPermissions}
									onValueChange={(value) => updatePreference('friendRequestPermissions', value)}
									disabled={isSaving}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="everyone">
											<div className="flex items-center gap-2">
												<Globe className="h-4 w-4" />
												Everyone
											</div>
										</SelectItem>
										<SelectItem value="followers">
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4" />
												Followers only
											</div>
										</SelectItem>
										<SelectItem value="mutuals">
											<div className="flex items-center gap-2">
												<UserCheck className="h-4 w-4" />
												Mutual followers only
											</div>
										</SelectItem>
										<SelectItem value="none">
											<div className="flex items-center gap-2">
												<UserX className="h-4 w-4" />
												No one
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<PreferencesToggle
								id="auto-accept-mutuals"
								label="Auto-accept Mutual Followers"
								description="Automatically accept friend requests from users you both follow"
								checked={preferences.autoAcceptMutualFollows}
								onCheckedChange={(checked) => updatePreference('autoAcceptMutualFollows', checked)}
								disabled={isSaving}
							/>

							<Separator />

							<div className="space-y-3">
								<h4 className="font-medium text-sm">Friends Privacy</h4>

								<PreferencesToggle
									id="hide-online-status"
									label="Hide Online Status"
									description="Don't show when you're online to friends"
									checked={preferences.hideOnlineStatus}
									onCheckedChange={(checked) => updatePreference('hideOnlineStatus', checked)}
									disabled={isSaving}
								/>

								<PreferencesToggle
									id="hide-friends-list"
									label="Hide Friends List"
									description="Don't show your friends list to others"
									checked={preferences.hideFriendsList}
									onCheckedChange={(checked) => updatePreference('hideFriendsList', checked)}
									disabled={isSaving}
								/>
							</div>
						</>
					)}
				</CardContent>
			</PreferencesCard>

			{/* General Social Privacy */}
			<PreferencesCard>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-purple-400" />
						General Privacy
					</CardTitle>
					<CardDescription>Overall social visibility and interaction settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<PreferencesToggle
						id="show-social-activity"
						label="Show Social Activity"
						description="Let others see your social interactions and activity"
						checked={preferences.showSocialActivity}
						onCheckedChange={(checked) => updatePreference('showSocialActivity', checked)}
						disabled={isSaving}
					/>

					<div className="space-y-2">
						<Label htmlFor="direct-messages">Who can send you direct messages</Label>
						<Select
							value={preferences.allowDirectMessages}
							onValueChange={(value) => updatePreference('allowDirectMessages', value)}
							disabled={isSaving}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="everyone">
									<div className="flex items-center gap-2">
										<Globe className="h-4 w-4" />
										Everyone
									</div>
								</SelectItem>
								<SelectItem value="followers">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										Followers only
									</div>
								</SelectItem>
								<SelectItem value="friends">
									<div className="flex items-center gap-2">
										<UserCheck className="h-4 w-4" />
										Friends only
									</div>
								</SelectItem>
								<SelectItem value="none">
									<div className="flex items-center gap-2">
										<UserX className="h-4 w-4" />
										No one
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<PreferencesToggle
						id="show-profile-public"
						label="Public Profile Visibility"
						description="Make your profile visible to non-registered users"
						checked={preferences.showProfileToPublic}
						onCheckedChange={(checked) => updatePreference('showProfileToPublic', checked)}
						disabled={isSaving}
					/>

					<PreferencesToggle
						id="allow-social-discovery"
						label="Social Discovery"
						description="Allow others to find you through social features and suggestions"
						checked={preferences.allowSocialDiscovery}
						onCheckedChange={(checked) => updatePreference('allowSocialDiscovery', checked)}
						disabled={isSaving}
					/>
				</CardContent>
			</PreferencesCard>

			{/* Status Section */}
			<Card className="border-zinc-700">
				<CardContent className="pt-6">
					<div className="flex items-center gap-2 text-sm text-zinc-400">
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Saving preferences...
							</>
						) : (
							<>
								<CheckCircle className="h-4 w-4 text-green-400" />
								All preferences saved
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
