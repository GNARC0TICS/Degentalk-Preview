import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Switch } from '@app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import {
	MessageSquare,
	Users,
	UserPlus,
	Settings,
	Shield,
	AlertTriangle,
	Activity,
	BarChart3,
	RefreshCw,
	Power,
	Crown,
	Eye,
	Clock,
	CheckCircle,
	XCircle
} from 'lucide-react';
import { useToast } from '@app/hooks/use-toast';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select';
import { Checkbox } from '@app/components/ui/checkbox';
import type { SocialConfig } from '@shared/config/social.config';

interface SocialStats {
	mentions: { total: number; unread: number };
	follows: { total: number };
	friendships: { accepted: number; pending: number; blocked: number };
	activeUsers: { last24h: number };
	lastUpdated: string;
}

interface FeatureStatus {
	mentions: {
		enabled: boolean;
		activeUsers: number;
		totalMentions: number;
		unreadMentions: number;
		healthStatus: string;
	};
	whaleWatch: { enabled: boolean; totalFollows: number; healthStatus: string };
	friends: {
		enabled: boolean;
		totalFriendships: number;
		pendingRequests: number;
		healthStatus: string;
	};
	overall: { status: string; lastChecked: string };
}

export default function SocialConfigPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('overview');
	const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

	// Fetch social configuration
	const { data: config, isLoading: configLoading } = useQuery<SocialConfig>({
		queryKey: ['/api/admin/social/config'],
		queryFn: async () => {
			return await apiRequest<SocialConfig>({
				url: '/api/admin/social/config',
				method: 'GET'
			});
		}
	});

	// Fetch social statistics
	const { data: stats, isLoading: statsLoading } = useQuery<SocialStats>({
		queryKey: ['/api/admin/social/stats'],
		queryFn: async () => {
			return await apiRequest<SocialStats>({
				url: '/api/admin/social/stats',
				method: 'GET'
			});
		}
	});

	// Fetch feature status
	const { data: status, isLoading: statusLoading } = useQuery<FeatureStatus>({
		queryKey: ['/api/admin/social/feature-status'],
		queryFn: async () => {
			return await apiRequest<FeatureStatus>({
				url: '/api/admin/social/feature-status',
				method: 'GET'
			});
		}
	});

	// Update configuration mutation
	const updateConfigMutation = useMutation({
		mutationFn: async (updates: Partial<SocialConfig>) => {
			return await apiRequest<SocialConfig>({
				url: '/api/admin/social/config',
				method: 'PUT',
				data: updates
			});
		},
		onSuccess: () => {
			toast({
				title: 'Configuration Updated',
				description: 'Social configuration has been successfully updated.',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/social/config'] });
			queryClient.invalidateQueries({ queryKey: ['/api/admin/social/feature-status'] });
		},
		onError: (error: any) => {
			toast({
				title: 'Update Failed',
				description: error.message || 'Failed to update social configuration',
				variant: 'destructive'
			});
		}
	});

	// Reset configuration mutation
	const resetConfigMutation = useMutation({
		mutationFn: async () => {
			return await apiRequest({ url: '/api/admin/social/reset', method: 'POST' });
		},
		onSuccess: () => {
			toast({
				title: 'Configuration Reset',
				description: 'Social configuration has been reset to defaults.',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/social/config'] });
		}
	});

	// Emergency disable mutation
	const emergencyDisableMutation = useMutation({
		mutationFn: async () => {
			return await apiRequest({ url: '/api/admin/social/emergency-disable', method: 'POST' });
		},
		onSuccess: () => {
			toast({
				title: 'Emergency Disable Activated',
				description: 'All social features have been disabled.',
				variant: 'default'
			});
			queryClient.invalidateQueries({ queryKey: ['/api/admin/social/config'] });
			setShowEmergencyConfirm(false);
		}
	});

	const updateFeatureToggle = (feature: keyof SocialConfig, enabled: boolean) => {
		if (!config) return;
		updateConfigMutation.mutate({
			[feature]: {
				...config[feature],
				enabled
			}
		});
	};

	const updateFeatureSetting = (feature: keyof SocialConfig, settingPath: string, value: any) => {
		if (!config) return;
		const featureConfig = { ...config[feature] } as any;
		const pathParts = settingPath.split('.');

		let current = featureConfig;
		for (let i = 0; i < pathParts.length - 1; i++) {
			const key = pathParts[i];
			if (!current[key]) {
				current[key] = {};
			}
			current = current[key];
		}
		const finalKey = pathParts[pathParts.length - 1];
		if (finalKey) {
			current[finalKey] = value;
		}

		updateConfigMutation.mutate({
			[feature]: featureConfig
		});
	};

	const getHealthBadge = (status: string) => {
		switch (status) {
			case 'healthy':
				return (
					<Badge className="bg-green-900/60 text-green-300 border-green-700/30">
						<CheckCircle className="h-3 w-3 mr-1" />
						Healthy
					</Badge>
				);
			case 'inactive':
				return (
					<Badge className="bg-yellow-900/60 text-yellow-300 border-yellow-700/30">
						<Clock className="h-3 w-3 mr-1" />
						Inactive
					</Badge>
				);
			case 'disabled':
				return (
					<Badge className="bg-red-900/60 text-red-300 border-red-700/30">
						<XCircle className="h-3 w-3 mr-1" />
						Disabled
					</Badge>
				);
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	if (configLoading || statsLoading || statusLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-zinc-800 rounded w-48"></div>
					<div className="h-64 bg-zinc-800 rounded"></div>
				</div>
			</div>
		);
	}

	if (!config || !stats || !status) {
		return (
			<div className="p-6">
				<div className="text-center text-zinc-400">Failed to load social configuration data</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-200">Social Configuration</h1>
					<p className="text-zinc-400 mt-1">Manage community engagement features and settings</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={() => resetConfigMutation.mutate()}
						disabled={resetConfigMutation.isPending}
						className="text-zinc-300"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Reset to Defaults
					</Button>
					<Button
						variant="destructive"
						onClick={() => setShowEmergencyConfirm(true)}
						disabled={emergencyDisableMutation.isPending}
					>
						<Power className="h-4 w-4 mr-2" />
						Emergency Disable
					</Button>
				</div>
			</div>

			{/* Emergency Disable Confirmation */}
			{showEmergencyConfirm && (
				<Card className="border-red-700/50 bg-red-950/20">
					<CardHeader>
						<CardTitle className="text-red-400 flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Emergency Disable Confirmation
						</CardTitle>
						<CardDescription>
							This will immediately disable ALL social features across the platform. Users will lose
							access to mentions, following, and friends functionality.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-3">
							<Button
								variant="destructive"
								onClick={() => emergencyDisableMutation.mutate()}
								disabled={emergencyDisableMutation.isPending}
							>
								Confirm Emergency Disable
							</Button>
							<Button variant="outline" onClick={() => setShowEmergencyConfirm(false)}>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="mentions">Mentions</TabsTrigger>
					<TabsTrigger value="whale-watch">Whale Watch</TabsTrigger>
					<TabsTrigger value="friends">Friends</TabsTrigger>
					<TabsTrigger value="admin">Admin Controls</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{/* Feature Status Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2 text-lg">
										<MessageSquare className="h-5 w-5 text-blue-400" />
										Mentions
									</CardTitle>
									{getHealthBadge(status.mentions.healthStatus)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Status</span>
										<Switch
											checked={config.mentions.enabled}
											onCheckedChange={(enabled) => updateFeatureToggle('mentions', enabled)}
										/>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Total Mentions</span>
										<span className="text-sm font-medium">
											{status.mentions.totalMentions.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Unread</span>
										<span className="text-sm font-medium">
											{status.mentions.unreadMentions.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Active Users (24h)</span>
										<span className="text-sm font-medium">
											{status.mentions.activeUsers.toLocaleString()}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Crown className="h-5 w-5 text-yellow-400" />
										Whale Watch
									</CardTitle>
									{getHealthBadge(status.whaleWatch.healthStatus)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Status</span>
										<Switch
											checked={config.whaleWatch.enabled}
											onCheckedChange={(enabled) => updateFeatureToggle('whaleWatch', enabled)}
										/>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Total Follows</span>
										<span className="text-sm font-medium">
											{status.whaleWatch.totalFollows.toLocaleString()}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2 text-lg">
										<UserPlus className="h-5 w-5 text-green-400" />
										Friends
									</CardTitle>
									{getHealthBadge(status.friends.healthStatus)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Status</span>
										<Switch
											checked={config.friends.enabled}
											onCheckedChange={(enabled) => updateFeatureToggle('friends', enabled)}
										/>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Total Friendships</span>
										<span className="text-sm font-medium">
											{status.friends.totalFriendships.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-400">Pending Requests</span>
										<span className="text-sm font-medium">
											{status.friends.pendingRequests.toLocaleString()}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Statistics Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Platform Statistics
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-400">
										{stats.mentions.total.toLocaleString()}
									</div>
									<div className="text-sm text-zinc-400">Total Mentions</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-yellow-400">
										{stats.follows.total.toLocaleString()}
									</div>
									<div className="text-sm text-zinc-400">Follow Relationships</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-400">
										{stats.friendships.accepted.toLocaleString()}
									</div>
									<div className="text-sm text-zinc-400">Active Friendships</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-400">
										{stats.activeUsers.last24h.toLocaleString()}
									</div>
									<div className="text-sm text-zinc-400">Active Users (24h)</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Mentions Configuration */}
				<TabsContent value="mentions" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageSquare className="h-5 w-5" />
								Mentions Configuration
							</CardTitle>
							<CardDescription>
								Configure how users can mention each other across the platform
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Settings */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="mentions-enabled">Enable Mentions</Label>
										<p className="text-sm text-zinc-400">
											Allow users to mention others using @username
										</p>
									</div>
									<Switch
										id="mentions-enabled"
										checked={config.mentions.enabled}
										onCheckedChange={(enabled) => updateFeatureToggle('mentions', enabled)}
									/>
								</div>

								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="mentions-min-level">Minimum Level Required</Label>
										<Input
											id="mentions-min-level"
											type="number"
											min="1"
											max="100"
											value={config.mentions.minLevel}
											onChange={(e) =>
												updateFeatureSetting('mentions', 'minLevel', parseInt(e.target.value))
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="mentions-max-per-post">Max Mentions Per Post</Label>
										<Input
											id="mentions-max-per-post"
											type="number"
											min="1"
											max="50"
											value={config.mentions.settings.maxMentionsPerPost}
											onChange={(e) =>
												updateFeatureSetting(
													'mentions',
													'settings.maxMentionsPerPost',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="mentions-max-per-hour">Max Mentions Per Hour</Label>
										<Input
											id="mentions-max-per-hour"
											type="number"
											min="1"
											max="1000"
											value={(config.mentions.settings as any).maxMentionsPerHour || 100}
											onChange={(e) =>
												updateFeatureSetting(
													'mentions',
													'settings.maxMentionsPerHour',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="mentions-cooldown">Mention Cooldown (seconds)</Label>
										<Input
											id="mentions-cooldown"
											type="number"
											min="0"
											max="3600"
											value={(config.mentions.settings as any).mentionCooldownSeconds || 5}
											onChange={(e) =>
												updateFeatureSetting(
													'mentions',
													'settings.mentionCooldownSeconds',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Permission Settings */}
							<div className="space-y-4">
								<h4 className="font-medium">Permission Settings</h4>

								<div className="space-y-3">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="mentions-require-level"
											checked={(config.mentions.settings as any).requireMinLevel || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('mentions', 'settings.requireMinLevel', checked)
											}
										/>
										<Label htmlFor="mentions-require-level">
											Require minimum level to mention others
										</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="mentions-friends-only"
											checked={(config.mentions.settings as any).allowFromFriendsOnly || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('mentions', 'settings.allowFromFriendsOnly', checked)
											}
										/>
										<Label htmlFor="mentions-friends-only">Only allow mentions from friends</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="mentions-followers-only"
											checked={(config.mentions.settings as any).allowFromFollowersOnly || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('mentions', 'settings.allowFromFollowersOnly', checked)
											}
										/>
										<Label htmlFor="mentions-followers-only">
											Only allow mentions from followers
										</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="mentions-priority-mods"
											checked={(config.mentions.settings as any).priorityMentionForMods || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('mentions', 'settings.priorityMentionForMods', checked)
											}
										/>
										<Label htmlFor="mentions-priority-mods">Priority mentions for moderators</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="mentions-cross-forum"
											checked={(config.mentions.settings as any).crossForumMentions || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('mentions', 'settings.crossForumMentions', checked)
											}
										/>
										<Label htmlFor="mentions-cross-forum">Allow cross-forum mentions</Label>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Whale Watch Configuration */}
				<TabsContent value="whale-watch" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Crown className="h-5 w-5" />
								Whale Watch Configuration
							</CardTitle>
							<CardDescription>
								Configure the follow system and whale detection criteria
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Settings */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="whale-enabled">Enable Whale Watch</Label>
										<p className="text-sm text-zinc-400">
											Allow users to follow other users and detect whales
										</p>
									</div>
									<Switch
										id="whale-enabled"
										checked={config.whaleWatch.enabled}
										onCheckedChange={(enabled) => updateFeatureToggle('whaleWatch', enabled)}
									/>
								</div>

								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="whale-min-level">Minimum Level Required</Label>
										<Input
											id="whale-min-level"
											type="number"
											min="1"
											max="100"
											value={config.whaleWatch.minLevel}
											onChange={(e) =>
												updateFeatureSetting('whaleWatch', 'minLevel', parseInt(e.target.value))
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="whale-max-follows">Max Follows Per User</Label>
										<Input
											id="whale-max-follows"
											type="number"
											min="1"
											max="10000"
											value={config.whaleWatch.settings.maxFollowing}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.maxFollowing',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="whale-max-per-hour">Max Follows Per Hour</Label>
										<Input
											id="whale-max-per-hour"
											type="number"
											min="1"
											max="500"
											value={(config.whaleWatch.settings as any).maxFollowsPerHour || 50}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.maxFollowsPerHour',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Whale Detection Criteria */}
							<div className="space-y-4">
								<h4 className="font-medium">Whale Detection Criteria</h4>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="whale-detect-level">Minimum Level</Label>
										<Input
											id="whale-detect-level"
											type="number"
											min="1"
											max="100"
											value={config.whaleWatch.settings.whaleThresholds.level}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.whaleThresholds.level',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="whale-detect-clout">Minimum Clout</Label>
										<Input
											id="whale-detect-clout"
											type="number"
											min="0"
											value={config.whaleWatch.settings.whaleThresholds.dgtBalance}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.whaleThresholds.dgtBalance',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="whale-detect-followers">Minimum Followers</Label>
										<Input
											id="whale-detect-followers"
											type="number"
											min="0"
											value={config.whaleWatch.settings.whaleThresholds.followerCount}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.whaleThresholds.followerCount',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="whale-detect-threads">Minimum Threads Created</Label>
										<Input
											id="whale-detect-threads"
											type="number"
											min="0"
											value={config.whaleWatch.settings.whaleThresholds.postCount}
											onChange={(e) =>
												updateFeatureSetting(
													'whaleWatch',
													'settings.whaleThresholds.postCount',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Friends Configuration */}
				<TabsContent value="friends" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UserPlus className="h-5 w-5" />
								Friends Configuration
							</CardTitle>
							<CardDescription>
								Configure the friendship system and mutual connection features
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Settings */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor="friends-enabled">Enable Friends System</Label>
										<p className="text-sm text-zinc-400">
											Allow users to send friend requests and form mutual connections
										</p>
									</div>
									<Switch
										id="friends-enabled"
										checked={config.friends.enabled}
										onCheckedChange={(enabled) => updateFeatureToggle('friends', enabled)}
									/>
								</div>

								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="friends-min-level">Minimum Level Required</Label>
										<Input
											id="friends-min-level"
											type="number"
											min="1"
											max="100"
											value={config.friends.minLevel}
											onChange={(e) =>
												updateFeatureSetting('friends', 'minLevel', parseInt(e.target.value))
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="friends-max-friends">Max Friends Per User</Label>
										<Input
											id="friends-max-friends"
											type="number"
											min="1"
											max="5000"
											value={config.friends.settings.maxFriends}
											onChange={(e) =>
												updateFeatureSetting(
													'friends',
													'settings.maxFriends',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="friends-max-requests">Max Requests Per Day</Label>
										<Input
											id="friends-max-requests"
											type="number"
											min="1"
											max="100"
											value={(config.friends.settings as any).maxRequestsPerDay || 20}
											onChange={(e) =>
												updateFeatureSetting(
													'friends',
													'settings.maxRequestsPerDay',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="friends-expire-days">Request Expiry (days)</Label>
										<Input
											id="friends-expire-days"
											type="number"
											min="1"
											max="365"
											value={config.friends.settings.requestExpireDays}
											onChange={(e) =>
												updateFeatureSetting(
													'friends',
													'settings.requestExpireDays',
													parseInt(e.target.value)
												)
											}
											className="mt-1"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Feature Settings */}
							<div className="space-y-4">
								<h4 className="font-medium">Feature Settings</h4>

								<div className="space-y-3">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="friends-groups"
											checked={config.friends.settings.enableFriendGroups}
											onCheckedChange={(checked) =>
												updateFeatureSetting('friends', 'settings.enableFriendGroups', checked)
											}
										/>
										<Label htmlFor="friends-groups">Enable friend groups</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="friends-suggestions"
											checked={(config.friends.settings as any).enableMutualFriendSuggestions || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting(
													'friends',
													'settings.enableMutualFriendSuggestions',
													checked
												)
											}
										/>
										<Label htmlFor="friends-suggestions">Enable mutual friend suggestions</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="friends-activity-feed"
											checked={(config.friends.settings as any).enableFriendActivityFeed || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting(
													'friends',
													'settings.enableFriendActivityFeed',
													checked
												)
											}
										/>
										<Label htmlFor="friends-activity-feed">Enable friend activity feed</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="friends-online-status"
											checked={(config.friends.settings as any).enableOnlineStatus || false}
											onCheckedChange={(checked) =>
												updateFeatureSetting('friends', 'settings.enableOnlineStatus', checked)
											}
										/>
										<Label htmlFor="friends-online-status">Enable online status indicators</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="friends-auto-accept"
											checked={(config.friends.settings as any).autoAcceptMutualFollows || config.friends.settings.autoAcceptFromFollowers}
											onCheckedChange={(checked) =>
												updateFeatureSetting('friends', 'settings.autoAcceptFromFollowers', checked)
											}
										/>
										<Label htmlFor="friends-auto-accept">
											Auto-accept requests from mutual follows
										</Label>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Admin Controls */}
				<TabsContent value="admin" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Admin Controls & Overrides
							</CardTitle>
							<CardDescription>
								Administrative controls and emergency overrides for social features
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-bypass-rate-limits"
										checked={(config.global as any).bypassAllRateLimits || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'bypassAllRateLimits', checked)
										}
									/>
									<Label htmlFor="admin-bypass-rate-limits">
										Bypass all rate limits for admins
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-bypass-level-req"
										checked={(config.global as any).bypassLevelRequirements || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'bypassLevelRequirements', checked)
										}
									/>
									<Label htmlFor="admin-bypass-level-req">
										Bypass level requirements for admins
									</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-debug-mode"
										checked={(config.global as any).enableDebugMode || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'enableDebugMode', checked)
										}
									/>
									<Label htmlFor="admin-debug-mode">Enable debug mode</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-force-enable"
										checked={(config.global as any).forceEnableAllFeatures || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'forceEnableAllFeatures', checked)
										}
									/>
									<Label htmlFor="admin-force-enable">Force enable all features</Label>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-log-actions"
										checked={(config.global as any).logAllSocialActions || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'logAllSocialActions', checked)
										}
									/>
									<Label htmlFor="admin-log-actions">Log all social actions</Label>
								</div>
							</div>

							<Separator />

							<div className="bg-red-950/20 border border-red-700/50 rounded-lg p-4">
								<h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
									<AlertTriangle className="h-4 w-4" />
									Emergency Controls
								</h4>
								<p className="text-sm text-zinc-400 mb-3">
									These controls provide immediate platform-wide social feature management.
								</p>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="admin-emergency-disable"
										checked={(config.global as any).enableEmergencyDisable || false}
										onCheckedChange={(checked) =>
											updateFeatureSetting('global', 'enableEmergencyDisable', checked)
										}
									/>
									<Label htmlFor="admin-emergency-disable">
										Enable emergency disable functionality
									</Label>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
