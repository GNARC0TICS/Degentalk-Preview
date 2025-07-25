import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Crown, Trophy, Zap, TrendingUp, Users, Award, Plus, Settings } from 'lucide-react';
import { AdminPageShell } from '@app/features/admin/layout/layout/AdminPageShell';
import { apiRequest } from '@app/utils/queryClient';
import { ReputationTiersSection } from '@app/features/admin/reputation/ReputationTiersSection';
import { AchievementsSection } from '@app/features/admin/reputation/AchievementsSection';
import { ReputationGrantsSection } from '@app/features/admin/reputation/ReputationGrantsSection';
import { ReputationLogsSection } from '@app/features/admin/reputation/ReputationLogsSection';
import { type AchievementId } from '@shared/types/ids';
import type { ReputationAchievement } from '@shared/types/entities/reputation.types';

// Re-export for backward compatibility
export type { ReputationAchievement };

export interface ReputationLog {
	id: string;
	userId: string;
	achievementId?: AchievementId;
	reputationEarned: number;
	reason?: string;
	createdAt: string;
}

export interface ReputationTier {
	id: string;
	name: string;
	minReputation: number;
	maxReputation?: number;
	color: string;
	icon: string;
	description: string;
	benefits: string[];
	badge?: string;
	titleEffect?: string;
}

// Define reputation tier system
export const REPUTATION_TIERS: ReputationTier[] = [
	{
		id: 'newcomer',
		name: 'Newcomer',
		minReputation: 0,
		maxReputation: 99,
		color: '#64748b',
		icon: '👋',
		description: 'Just getting started in the community',
		benefits: ['Basic forum access', 'Standard posting privileges'],
		badge: 'bg-slate-500'
	},
	{
		id: 'known',
		name: 'Known',
		minReputation: 100,
		maxReputation: 499,
		color: '#16a34a',
		icon: '👤',
		description: 'Recognized member of the community',
		benefits: ['Enhanced profile visibility', 'Access to member-only discussions'],
		badge: 'bg-green-500'
	},
	{
		id: 'respected',
		name: 'Respected',
		minReputation: 500,
		maxReputation: 1499,
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
		minReputation: 1500,
		maxReputation: 4999,
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
		minReputation: 5000,
		maxReputation: 14999,
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
		minReputation: 15000,
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

export default function ReputationSystemPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('tiers');

	// Fetch achievements
	const {
		data: achievementsData,
		isLoading: achievementsLoading,
		isError: achievementsError
	} = useQuery({
		queryKey: ['admin-reputation-achievements'],
		queryFn: async () => {
			return apiRequest({ url: '/api/admin/reputation/achievements', method: 'GET' });
		}
	});

	// Fetch reputation logs
	const {
		data: logsData,
		isLoading: logsLoading,
		isError: logsError
	} = useQuery({
		queryKey: ['admin-reputation-logs'],
		queryFn: async () => {
			return apiRequest({ url: '/api/admin/reputation/logs?limit=100', method: 'GET' });
		}
	});

	const achievements = achievementsData?.achievements || [];
	const logs = logsData?.logs || [];

	const isLoading = achievementsLoading || logsLoading;
	const hasError = achievementsError || logsError;

	// Calculate stats
	const totalAchievements = achievements.length;
	const enabledAchievements = achievements.filter((a: ReputationAchievement) => a.enabled).length;
	const totalReputationAwarded = logs.reduce((sum: number, log: ReputationLog) => sum + log.reputationEarned, 0);
	const uniqueUsers = new Set(logs.map((log: ReputationLog) => log.userId)).size;

	const getTierByReputation = (reputation: number): ReputationTier => {
		return (
			REPUTATION_TIERS.find(
				(tier) => reputation >= tier.minReputation && (!tier.maxReputation || reputation <= tier.maxReputation)
			) || REPUTATION_TIERS[0]
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
			<AdminPageShell title="Reputation System" pageActions={pageActions}>
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">
							Failed to load reputation system data. Please refresh the page.
						</p>
					</CardContent>
				</Card>
			</AdminPageShell>
		);
	}

	return (
		<AdminPageShell title="Reputation System" pageActions={pageActions}>
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
									<p className="text-sm text-muted-foreground">Reputation Awarded</p>
									<p className="text-2xl font-bold">{totalReputationAwarded.toLocaleString()}</p>
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
								With reputation earned
							</Badge>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Tier System</p>
									<p className="text-2xl font-bold">{REPUTATION_TIERS.length}</p>
								</div>
								<Crown className="h-8 w-8 text-purple-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								Reputation tiers
							</Badge>
						</CardContent>
					</Card>
				</div>

				{/* Reputation Tier Preview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Crown className="h-5 w-5" />
							Reputation Tier System
						</CardTitle>
						<CardDescription>
							Users progress through reputation tiers based on their accumulated reputation
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{REPUTATION_TIERS.map((tier) => (
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
													{tier.minReputation}+ reputation
													{tier.maxReputation && ` - ${tier.maxReputation}`}
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
						<ReputationTiersSection tiers={REPUTATION_TIERS} isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="achievements" className="space-y-6">
						<AchievementsSection achievements={achievements} isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="grants" className="space-y-6">
						<ReputationGrantsSection isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="logs" className="space-y-6">
						<ReputationLogsSection logs={logs} achievements={achievements} isLoading={isLoading} />
					</TabsContent>
				</Tabs>
			</div>
		</AdminPageShell>
	);
}
