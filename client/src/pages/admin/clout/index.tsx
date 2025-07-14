import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Zap, TrendingUp, Users, Award, Plus, Settings } from 'lucide-react';
import { AdminPageShell } from '@/features/admin/components/layout/AdminPageShell';
import { apiRequest } from '@/utils/queryClient';
import { CloutTiersSection } from '@/features/admin/components/clout/CloutTiersSection';
import { AchievementsSection } from '@/features/admin/components/clout/AchievementsSection';
import { CloutGrantsSection } from '@/features/admin/components/clout/CloutGrantsSection';
import { CloutLogsSection } from '@/features/admin/components/clout/CloutLogsSection';
import { type AchievementId } from '@shared/types/ids';

// Types
export interface CloutAchievement {
	id: string;
	achievementKey: string;
	name: string;
	description?: string;
	cloutReward: number;
	criteriaType?: string;
	criteriaValue?: number;
	enabled: boolean;
	iconUrl?: string;
	createdAt: string;
}

export interface CloutLog {
	id: string;
	userId: string;
	achievementId?: AchievementId;
	cloutEarned: number;
	reason?: string;
	createdAt: string;
}

export interface CloutTier {
	id: string;
	name: string;
	minClout: number;
	maxClout?: number;
	color: string;
	icon: string;
	description: string;
	benefits: string[];
	badge?: string;
	titleEffect?: string;
}

// Define clout tier system
export const CLOUT_TIERS: CloutTier[] = [
	{
		id: 'newcomer',
		name: 'Newcomer',
		minClout: 0,
		maxClout: 99,
		color: '#64748b',
		icon: '👋',
		description: 'Just getting started in the community',
		benefits: ['Basic forum access', 'Standard posting privileges'],
		badge: 'bg-slate-500'
	},
	{
		id: 'known',
		name: 'Known',
		minClout: 100,
		maxClout: 499,
		color: '#16a34a',
		icon: '👤',
		description: 'Recognized member of the community',
		benefits: ['Enhanced profile visibility', 'Access to member-only discussions'],
		badge: 'bg-green-500'
	},
	{
		id: 'respected',
		name: 'Respected',
		minClout: 500,
		maxClout: 1499,
		color: '#2563eb',
		icon: '⭐',
		description: 'Valued contributor with community respect',
		benefits: ['Priority support', 'Special thread permissions', 'Custom signature styling'],
		badge: 'bg-blue-500',
		titleEffect: 'glow-blue'
	},
	{
		id: 'influential',
		name: 'Influential',
		minClout: 1500,
		maxClout: 4999,
		color: '#9333ea',
		icon: '💎',
		description: 'Highly influential community leader',
		benefits: [
			'Moderation recommendations',
			'Special events access',
			'Enhanced profile customization'
		],
		badge: 'bg-purple-500',
		titleEffect: 'glow-purple'
	},
	{
		id: 'feared',
		name: 'Feared',
		minClout: 5000,
		maxClout: 14999,
		color: '#dc2626',
		icon: '🔥',
		description: 'Legendary status with immense influence',
		benefits: [
			'VIP treatment',
			'Exclusive access areas',
			'Custom title creation',
			'Direct admin contact'
		],
		badge: 'bg-red-500',
		titleEffect: 'glow-red animated-pulse'
	},
	{
		id: 'mythic',
		name: 'Mythic',
		minClout: 15000,
		color: '#f59e0b',
		icon: '👑',
		description: 'Ultimate community legend',
		benefits: [
			'All privileges',
			'Exclusive Mythic badge',
			'Platform influence',
			'Special recognition',
			'Unique title animations'
		],
		badge: 'bg-amber-500',
		titleEffect: 'rainbow-glow animated-rainbow'
	}
];

export default function CloutSystemPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('tiers');

	// Fetch achievements
	const {
		data: achievementsData,
		isLoading: achievementsLoading,
		isError: achievementsError
	} = useQuery({
		queryKey: ['admin-clout-achievements'],
		queryFn: async () => {
			return apiRequest({ url: '/api/admin/clout/achievements', method: 'GET' });
		}
	});

	// Fetch clout logs
	const {
		data: logsData,
		isLoading: logsLoading,
		isError: logsError
	} = useQuery({
		queryKey: ['admin-clout-logs'],
		queryFn: async () => {
			return apiRequest({ url: '/api/admin/clout/logs?limit=100', method: 'GET' });
		}
	});

	const achievements = achievementsData?.achievements || [];
	const logs = logsData?.logs || [];

	const isLoading = achievementsLoading || logsLoading;
	const hasError = achievementsError || logsError;

	// Calculate stats
	const totalAchievements = achievements.length;
	const enabledAchievements = achievements.filter((a: CloutAchievement) => a.enabled).length;
	const totalCloutAwarded = logs.reduce((sum: number, log: CloutLog) => sum + log.cloutEarned, 0);
	const uniqueUsers = new Set(logs.map((log: CloutLog) => log.userId)).size;

	const getTierByClout = (clout: number): CloutTier => {
		return (
			CLOUT_TIERS.find(
				(tier) => clout >= tier.minClout && (!tier.maxClout || clout <= tier.maxClout)
			) || CLOUT_TIERS[0]
		);
	};

	const pageActions = (
		<div className="flex gap-2">
			<Button
				variant="outline"
				onClick={() => setActiveTab('tiers')}
				className={activeTab === 'tiers' ? 'bg-accent' : ''}
			>
				<Crown className="h-4 w-4 mr-2" />
				Tiers
			</Button>
			<Button
				variant="outline"
				onClick={() => setActiveTab('achievements')}
				className={activeTab === 'achievements' ? 'bg-accent' : ''}
			>
				<Trophy className="h-4 w-4 mr-2" />
				Achievements
			</Button>
			<Button
				variant="outline"
				onClick={() => setActiveTab('grants')}
				className={activeTab === 'grants' ? 'bg-accent' : ''}
			>
				<Zap className="h-4 w-4 mr-2" />
				Grants
			</Button>
			<Button
				variant="outline"
				onClick={() => setActiveTab('logs')}
				className={activeTab === 'logs' ? 'bg-accent' : ''}
			>
				<TrendingUp className="h-4 w-4 mr-2" />
				Logs
			</Button>
		</div>
	);

	if (hasError) {
		return (
			<AdminPageShell title="Clout System" pageActions={pageActions}>
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">
							Failed to load clout system data. Please refresh the page.
						</p>
					</CardContent>
				</Card>
			</AdminPageShell>
		);
	}

	return (
		<AdminPageShell title="Clout System" pageActions={pageActions}>
			<div className="space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Achievements</p>
									<p className="text-2xl font-bold">{totalAchievements}</p>
								</div>
								<Trophy className="h-8 w-8 text-yellow-500" />
							</div>
							{enabledAchievements !== totalAchievements && (
								<Badge variant="outline" className="mt-2">
									{enabledAchievements} enabled
								</Badge>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Clout Awarded</p>
									<p className="text-2xl font-bold">{totalCloutAwarded.toLocaleString()}</p>
								</div>
								<Zap className="h-8 w-8 text-blue-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								All time total
							</Badge>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Active Users</p>
									<p className="text-2xl font-bold">{uniqueUsers}</p>
								</div>
								<Users className="h-8 w-8 text-green-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								With clout earned
							</Badge>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Tier System</p>
									<p className="text-2xl font-bold">{CLOUT_TIERS.length}</p>
								</div>
								<Crown className="h-8 w-8 text-purple-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								Reputation tiers
							</Badge>
						</CardContent>
					</Card>
				</div>

				{/* Clout Tier Preview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Crown className="h-5 w-5" />
							Clout Tier System
						</CardTitle>
						<CardDescription>
							Users progress through reputation tiers based on their accumulated clout
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{CLOUT_TIERS.map((tier) => (
								<div
									key={tier.id}
									className="p-4 border rounded-lg relative overflow-hidden"
									style={{ borderColor: tier.color }}
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<span className="text-2xl">{tier.icon}</span>
											<div>
												<h3 className="font-semibold" style={{ color: tier.color }}>
													{tier.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													{tier.minClout}+ clout
													{tier.maxClout && ` - ${tier.maxClout}`}
												</p>
											</div>
										</div>
									</div>
									<p className="text-sm mb-3">{tier.description}</p>
									<div className="space-y-1">
										{tier.benefits.slice(0, 2).map((benefit, idx) => (
											<p key={idx} className="text-xs text-muted-foreground">
												• {benefit}
											</p>
										))}
										{tier.benefits.length > 2 && (
											<p className="text-xs text-muted-foreground">
												• +{tier.benefits.length - 2} more benefits
											</p>
										)}
									</div>
									{tier.titleEffect && (
										<Badge
											variant="outline"
											className="mt-2 text-xs"
											style={{ borderColor: tier.color }}
										>
											{tier.titleEffect}
										</Badge>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="tiers" className="flex items-center gap-2">
							<Crown className="h-4 w-4" />
							Tiers
						</TabsTrigger>
						<TabsTrigger value="achievements" className="flex items-center gap-2">
							<Trophy className="h-4 w-4" />
							Achievements
						</TabsTrigger>
						<TabsTrigger value="grants" className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							Grants
						</TabsTrigger>
						<TabsTrigger value="logs" className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							Logs
						</TabsTrigger>
					</TabsList>

					<TabsContent value="tiers" className="space-y-6">
						<CloutTiersSection tiers={CLOUT_TIERS} isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="achievements" className="space-y-6">
						<AchievementsSection achievements={achievements} isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="grants" className="space-y-6">
						<CloutGrantsSection isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="logs" className="space-y-6">
						<CloutLogsSection logs={logs} achievements={achievements} isLoading={isLoading} />
					</TabsContent>
				</Tabs>
			</div>
		</AdminPageShell>
	);
}
