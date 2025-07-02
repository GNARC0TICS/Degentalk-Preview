/**
 * Leaderboard Component
 *
 * Displays user rankings with various sorting options and timeframes
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { LevelDisplay, LevelBadge } from './level-display';
import { formatNumber } from '@/lib/utils';
import {
	Trophy,
	TrendingUp,
	TrendingDown,
	Minus,
	Crown,
	Medal,
	Award,
	Sparkles,
	ChevronUp,
	ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import type { LeaderboardEntry } from '@/features/gamification/services/gamification-api.service';

interface LeaderboardProps {
	entries: LeaderboardEntry[];
	currentUserId?: number;
	type?: 'level' | 'xp' | 'weekly' | 'monthly';
	onTypeChange?: (type: 'level' | 'xp' | 'weekly' | 'monthly') => void;
	className?: string;
}

export function Leaderboard({
	entries,
	currentUserId,
	type = 'xp',
	onTypeChange,
	className
}: LeaderboardProps) {
	const router = useRouter();
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

	// Get rank icon based on position
	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Crown className="w-5 h-5 text-amber-500" />;
			case 2:
				return <Medal className="w-5 h-5 text-gray-400" />;
			case 3:
				return <Award className="w-5 h-5 text-amber-700" />;
			default:
				return null;
		}
	};

	// Get rank style based on position
	const getRankStyle = (rank: number) => {
		switch (rank) {
			case 1:
				return 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-500/50';
			case 2:
				return 'bg-gradient-to-r from-gray-900/20 to-zinc-900/20 border-gray-500/50';
			case 3:
				return 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/50';
			default:
				return '';
		}
	};

	// Get trend icon
	const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
		switch (trend) {
			case 'up':
				return <TrendingUp className="w-4 h-4 text-green-500" />;
			case 'down':
				return <TrendingDown className="w-4 h-4 text-red-500" />;
			case 'stable':
				return <Minus className="w-4 h-4 text-zinc-500" />;
			default:
				return null;
		}
	};

	// Toggle row expansion
	const toggleRowExpansion = (userId: UserId) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(userId)) {
			newExpanded.delete(userId);
		} else {
			newExpanded.add(userId);
		}
		setExpandedRows(newExpanded);
	};

	// Get user's position in leaderboard
	const currentUserEntry = entries.find((e) => e.userId === currentUserId);
	const currentUserRank = currentUserEntry?.rank;

	return (
		<div className={cn('space-y-6', className)}>
			{/* Header */}
			<Card className="bg-zinc-900 border-zinc-800">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="w-5 h-5 text-amber-500" />
								Leaderboard
							</CardTitle>
							<CardDescription>
								Top players ranked by{' '}
								{type === 'xp' ? 'total XP' : type === 'level' ? 'level' : `${type} XP`}
							</CardDescription>
						</div>
						{currentUserRank && (
							<Badge variant="outline" className="text-lg px-3 py-1">
								Your Rank: #{currentUserRank}
							</Badge>
						)}
					</div>
				</CardHeader>
			</Card>

			{/* Type Selector Tabs */}
			<Tabs value={type} onValueChange={(v) => onTypeChange?.(v as any)}>
				<TabsList className="grid grid-cols-4 w-full">
					<TabsTrigger value="xp">Total XP</TabsTrigger>
					<TabsTrigger value="level">Level</TabsTrigger>
					<TabsTrigger value="weekly">This Week</TabsTrigger>
					<TabsTrigger value="monthly">This Month</TabsTrigger>
				</TabsList>

				<TabsContent value={type} className="mt-6">
					{/* Top 3 Showcase */}
					{entries.length >= 3 && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							{entries.slice(0, 3).map((entry, index) => (
								<motion.div
									key={entry.userId}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card
										className={cn(
											'relative overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg',
											getRankStyle(index + 1),
											currentUserId === entry.userId && 'ring-2 ring-purple-500'
										)}
										onClick={() => router.push(`/user/${entry.username}`)}
									>
										{/* Rank badge */}
										<div className="absolute top-2 right-2">{getRankIcon(index + 1)}</div>

										<CardContent className="p-6 text-center">
											<Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-background">
												<AvatarImage src={`/api/avatar/${entry.userId}`} />
												<AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
											</Avatar>

											<h3 className="font-bold text-lg mb-1">{entry.username}</h3>

											<div className="flex justify-center mb-3">
												<LevelBadge level={entry.level} />
											</div>

											<div className="space-y-1 text-sm">
												<p className="text-muted-foreground">
													{type === 'level' ? 'Level' : 'Total XP'}
												</p>
												<p className="text-2xl font-bold">
													{type === 'level' ? entry.level : formatNumber(entry.totalXp)}
												</p>
												{type === 'weekly' && entry.weeklyXp !== undefined && (
													<p className="text-sm text-green-400">
														+{formatNumber(entry.weeklyXp)} this week
													</p>
												)}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					)}

					{/* Full Leaderboard Table */}
					<Card className="bg-zinc-900 border-zinc-800">
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow className="border-zinc-800">
										<TableHead className="w-20">Rank</TableHead>
										<TableHead>Player</TableHead>
										<TableHead className="text-center">Level</TableHead>
										<TableHead className="text-right">
											{type === 'level'
												? 'Total XP'
												: type === 'xp'
													? 'Total XP'
													: `${type.charAt(0).toUpperCase() + type.slice(1)} XP`}
										</TableHead>
										{type !== 'level' && <TableHead className="text-center w-20">Trend</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{entries.map((entry) => {
										const isExpanded = expandedRows.has(entry.userId);
										const isCurrentUser = entry.userId === currentUserId;

										return (
											<motion.tr
												key={entry.userId}
												className={cn(
													'border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800/50',
													getRankStyle(entry.rank),
													isCurrentUser && 'bg-purple-900/10'
												)}
												onClick={() => toggleRowExpansion(entry.userId)}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: entry.rank * 0.02 }}
											>
												<TableCell className="font-medium">
													<div className="flex items-center gap-2">
														{getRankIcon(entry.rank)}
														<span className={cn('text-lg', entry.rank <= 3 && 'font-bold')}>
															#{entry.rank}
														</span>
													</div>
												</TableCell>

												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="w-10 h-10">
															<AvatarImage src={`/api/avatar/${entry.userId}`} />
															<AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium flex items-center gap-2">
																{entry.username}
																{isCurrentUser && (
																	<Badge variant="secondary" className="text-xs">
																		You
																	</Badge>
																)}
															</p>
															{isExpanded && (
																<p className="text-xs text-muted-foreground">
																	Joined the leaderboard race!
																</p>
															)}
														</div>
													</div>
												</TableCell>

												<TableCell className="text-center">
													<LevelDisplay level={entry.level} size="sm" animated={false} />
												</TableCell>

												<TableCell className="text-right">
													<div>
														<p className="font-bold text-lg">
															{type === 'level'
																? formatNumber(entry.totalXp)
																: type === 'weekly' && entry.weeklyXp !== undefined
																	? formatNumber(entry.weeklyXp)
																	: formatNumber(entry.totalXp)}
														</p>
														{type === 'weekly' && (
															<p className="text-xs text-muted-foreground">
																Total: {formatNumber(entry.totalXp)}
															</p>
														)}
													</div>
												</TableCell>

												{type !== 'level' && (
													<TableCell className="text-center">{getTrendIcon(entry.trend)}</TableCell>
												)}
											</motion.tr>
										);
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Your Position (if not in top list) */}
			{currentUserEntry && currentUserRank && currentUserRank > entries.length && (
				<Card className="bg-purple-900/20 border-purple-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Avatar className="w-10 h-10">
									<AvatarImage src={`/api/avatar/${currentUserId}`} />
									<AvatarFallback>You</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">Your Position</p>
									<p className="text-sm text-muted-foreground">Keep grinding to climb the ranks!</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold">#{currentUserRank}</p>
								<p className="text-sm text-muted-foreground">
									{formatNumber(currentUserEntry.totalXp)} XP
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
