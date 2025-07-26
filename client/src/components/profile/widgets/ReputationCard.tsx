import React from 'react';
import { Shield, TrendingUp, Calendar, Zap } from 'lucide-react';
import { cn } from '@app/utils/utils';

interface ReputationCardProps {
	reputation?: number;
	dailyXpGained?: number;
	lastXpGainDate?: string | null;
	level?: number;
	className?: string;
}

export function ReputationCard({
	reputation = 0,
	dailyXpGained = 0,
	lastXpGainDate = null,
	level = 0,
	className
}: ReputationCardProps) {
	const xpStreak = calculateXpStreak(lastXpGainDate);
	const trustLevel = getTrustLevel(reputation, level);

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-sm',
				'border border-zinc-700/40 rounded-lg p-4 space-y-4',
				className
			)}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
					<Shield className="h-4 w-4 text-emerald-400" />
					Reputation
				</h3>
				<div
					className={cn(
						'px-2 py-1 rounded-full text-xs font-medium',
						getTrustBadgeColor(trustLevel)
					)}
				>
					{trustLevel}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<div className="text-2xl font-bold text-zinc-100">
						{(reputation ?? 0).toLocaleString()}
					</div>
					<div className="text-xs text-zinc-400">Trust Score</div>
				</div>
				<div className="space-y-1">
					<div className="text-2xl font-bold text-amber-400">{(reputation ?? 0).toLocaleString()}</div>
					<div className="text-xs text-zinc-400">Reputation</div>
				</div>
			</div>

			{xpStreak > 0 && (
				<div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-md border border-emerald-500/20">
					<Zap className="h-4 w-4 text-emerald-400" />
					<span className="text-sm text-emerald-300">{xpStreak} day XP streak</span>
				</div>
			)}

			{dailyXpGained > 0 && (
				<div className="flex items-center justify-between text-sm">
					<span className="text-zinc-400">Today's XP</span>
					<span className="text-emerald-400 font-medium">
						+{(dailyXpGained ?? 0).toLocaleString()}
					</span>
				</div>
			)}
		</div>
	);
}

function calculateXpStreak(lastXpGainDate: string | null): number {
	if (!lastXpGainDate) return 0;

	const lastGain = new Date(lastXpGainDate);
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - lastGain.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	// Simple streak calculation - in real app would track proper streak
	return diffDays <= 1 ? Math.min(diffDays + 7, 30) : 0;
}

function getTrustLevel(reputation: number, level: number): string {
	if (reputation >= 10000 || level >= 50) return 'Elite';
	if (reputation >= 5000 || level >= 25) return 'Veteran';
	if (reputation >= 1000 || level >= 10) return 'Trusted';
	if (reputation >= 100 || level >= 5) return 'Member';
	return 'Newcomer';
}

function getTrustBadgeColor(trustLevel: string): string {
	switch (trustLevel) {
		case 'Elite':
			return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30';
		case 'Veteran':
			return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30';
		case 'Trusted':
			return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30';
		case 'Member':
			return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30';
		default:
			return 'bg-zinc-600/20 text-zinc-400 border border-zinc-600/30';
	}
}
