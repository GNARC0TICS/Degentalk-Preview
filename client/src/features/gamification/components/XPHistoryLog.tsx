import React from 'react';
import { cn } from '@/lib/utils';
import type { XpAdjustmentEntry } from '@/hooks/useXP';
import { formatDistanceToNow } from 'date-fns';
import { Award, Calendar, MessageSquare, Plus, Settings, User, ZapIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type XPHistoryLogProps = {
	xpHistory: XpAdjustmentEntry[];
	isLoading?: boolean;
	className?: string;
	maxHeight?: string;
	showEmptyState?: boolean;
};

/**
 * Component that displays a user's XP history in a chronological log
 */
export function XPHistoryLog({
	xpHistory,
	isLoading = false,
	className,
	maxHeight = '350px',
	showEmptyState = true
}: XPHistoryLogProps) {
	// Ensure xpHistory is always an array
	const safeXpHistory = Array.isArray(xpHistory) ? xpHistory : [];
	// Get the icon for the adjustment type
	const getSourceIcon = (adjustmentType: XpAdjustmentEntry['adjustmentType']) => {
		switch (adjustmentType) {
			case 'post':
			case 'reply':
			case 'thread':
				return <MessageSquare className="h-4 w-4" />;
			case 'login':
				return <Calendar className="h-4 w-4" />;
			case 'profile':
				return <User className="h-4 w-4" />;
			case 'admin':
				return <Settings className="h-4 w-4" />;
			default:
				return <Award className="h-4 w-4" />;
		}
	};

	// Get appropriate color class based on adjustment type
	const getSourceColorClass = (adjustmentType: XpAdjustmentEntry['adjustmentType']) => {
		switch (adjustmentType) {
			case 'post':
			case 'thread':
				return 'bg-emerald-500/20 text-emerald-400';
			case 'reply':
				return 'bg-blue-500/20 text-blue-400';
			case 'login':
				return 'bg-amber-500/20 text-amber-400';
			case 'profile':
				return 'bg-purple-500/20 text-purple-400';
			case 'admin':
				return 'bg-red-500/20 text-red-400';
			default:
				return 'bg-slate-500/20 text-slate-400';
		}
	};

	if (isLoading) {
		return (
			<Card className={cn('relative overflow-hidden', className)}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">XP Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 py-2">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex items-start gap-3 animate-pulse">
								<div className="rounded-full bg-zinc-800 h-8 w-8"></div>
								<div className="space-y-2 flex-1">
									<div className="h-4 bg-zinc-800 rounded w-2/3"></div>
									<div className="h-3 bg-zinc-800 rounded w-1/3"></div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (safeXpHistory.length === 0 && showEmptyState) {
		return (
			<Card className={cn('relative overflow-hidden', className)}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">XP Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
						<ZapIcon className="mb-2 h-10 w-10 opacity-20" />
						<p className="mb-1 text-sm">No XP activity yet</p>
						<p className="text-xs">Start participating in the community to earn XP</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn('relative overflow-hidden', className)}>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">XP Activity</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className={cn('pr-4', maxHeight && `max-h-[${maxHeight}]`)}>
					<div className="space-y-4 p-6">
						{safeXpHistory.map((entry) => (
							<div key={entry.id} className="flex items-start gap-3 group">
								<div
									className={cn(
										'rounded-full p-2 flex-shrink-0',
										getSourceColorClass(entry.adjustmentType)
									)}
								>
									{getSourceIcon(entry.adjustmentType)}
								</div>
								<div className="space-y-1 flex-1">
									<div className="flex justify-between items-start">
										<p className="text-sm font-medium text-zinc-100">{entry.reason}</p>
										<Badge
											variant="outline"
											className="flex items-center gap-0.5 bg-zinc-800 hover:bg-zinc-800"
										>
											<Plus className="h-3 w-3" />
											<span>{entry.amount} XP</span>
										</Badge>
									</div>
									<p className="text-xs text-zinc-500">
										{formatDistanceToNow(new Date(entry.createdAt), {
											addSuffix: true
										})}
									</p>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
