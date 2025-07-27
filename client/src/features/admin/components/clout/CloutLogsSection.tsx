import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	TrendingUp,
	Search,
	Filter,
	Download,
	Zap,
	Trophy,
	User,
	Calendar,
	ArrowUp,
	ArrowDown
} from 'lucide-react';
import type { ReputationLog, ReputationAchievement } from '@/pages/admin/reputation';
import type { UserId } from '@shared/types/ids';

interface ReputationLogsSectionProps {
	logs: ReputationLog[];
	achievements: ReputationAchievement[];
	isLoading: boolean;
}

export function ReputationLogsSection({ logs, achievements, isLoading }: ReputationLogsSectionProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterType, setFilterType] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Create achievement lookup map
	const achievementMap = achievements.reduce(
		(map: Record<number, ReputationAchievement>, achievement) => {
			if (typeof achievement.id === 'number') {
				map[achievement.id] = achievement;
			}
			return map;
		},
		{} as Record<number, ReputationAchievement>
	);

	// Filter and sort logs
	const filteredLogs = logs
		.filter((log) => {
			if (filterType === 'achievements' && !log.achievementId) return false;
			if (filterType === 'grants' && log.achievementId) return false;
			if (filterType === 'positive' && log.reputationEarned <= 0) return false;
			if (filterType === 'negative' && log.reputationEarned >= 0) return false;

			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				return (
					log.userId.toLowerCase().includes(searchLower) ||
					log.reason?.toLowerCase().includes(searchLower) ||
					(log.achievementId &&
						typeof log.achievementId === 'number' &&
						achievementMap[log.achievementId]?.name.toLowerCase().includes(searchLower))
				);
			}

			return true;
		})
		.sort((a, b) => {
			let comparison = 0;

			if (sortBy === 'date') {
				comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			} else if (sortBy === 'amount') {
				comparison = a.reputationEarned - b.reputationEarned;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

	// Calculate statistics
	const totalReputationAwarded = logs.reduce((sum, log) => sum + Math.max(0, log.reputationEarned), 0);
	const totalReputationDeducted = logs.reduce(
		(sum, log) => sum + Math.abs(Math.min(0, log.reputationEarned)),
		0
	);
	const achievementGrants = logs.filter((log) => log.achievementId).length;
	const manualGrants = logs.filter((log) => !log.achievementId).length;
	const uniqueUsers = new Set(logs.map((log) => log.userId)).size;

	const getLogType = (log: ReputationLog) => {
		if (log.achievementId && typeof log.achievementId === 'number') {
			const achievement = achievementMap[log.achievementId];
			return achievement ? 'Achievement' : 'Unknown Achievement';
		}
		return log.reputationEarned > 0 ? 'Manual Grant' : 'Manual Deduction';
	};

	const getLogIcon = (log: ReputationLog) => {
		if (log.achievementId && typeof log.achievementId === 'number') {
			return <Trophy className="h-4 w-4 text-yellow-500" />;
		}
		return log.reputationEarned > 0 ? (
			<ArrowUp className="h-4 w-4 text-green-500" />
		) : (
			<ArrowDown className="h-4 w-4 text-red-500" />
		);
	};

	const formatUserId = (userId: string) => {
		return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<p>Loading reputation logs...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Awarded</p>
								<p className="text-lg font-bold text-green-600">
									+{totalReputationAwarded.toLocaleString()}
								</p>
							</div>
							<ArrowUp className="h-6 w-6 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Deducted</p>
								<p className="text-lg font-bold text-red-600">
									-{totalReputationDeducted.toLocaleString()}
								</p>
							</div>
							<ArrowDown className="h-6 w-6 text-red-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Achievements</p>
								<p className="text-lg font-bold">{achievementGrants}</p>
							</div>
							<Trophy className="h-6 w-6 text-yellow-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Manual Grants</p>
								<p className="text-lg font-bold">{manualGrants}</p>
							</div>
							<Zap className="h-6 w-6 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Unique Users</p>
								<p className="text-lg font-bold">{uniqueUsers}</p>
							</div>
							<User className="h-6 w-6 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Logs Table */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5" />
								Reputation Activity Logs
							</CardTitle>
							<CardDescription>
								Complete history of all reputation grants, deductions, and achievements
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" disabled>
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search by user ID, reason, or achievement..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Filter type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="achievements">Achievements Only</SelectItem>
								<SelectItem value="grants">Manual Grants Only</SelectItem>
								<SelectItem value="positive">Positive Only</SelectItem>
								<SelectItem value="negative">Negative Only</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={`${sortBy}-${sortOrder}`}
							onValueChange={(value) => {
								const [newSortBy, newSortOrder] = value.split('-') as [
									typeof sortBy,
									typeof sortOrder
								];
								setSortBy(newSortBy);
								setSortOrder(newSortOrder);
							}}
						>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date-desc">Newest First</SelectItem>
								<SelectItem value="date-asc">Oldest First</SelectItem>
								<SelectItem value="amount-desc">Highest Amount</SelectItem>
								<SelectItem value="amount-asc">Lowest Amount</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Source/Reason</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLogs.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8">
											<div className="flex flex-col items-center gap-2">
												<TrendingUp className="h-8 w-8 text-muted-foreground" />
												<p className="text-muted-foreground">
													{searchQuery || filterType !== 'all'
														? 'No logs match your filters'
														: 'No reputation logs yet'}
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									filteredLogs.map((log) => (
										<TableRow key={log.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													{getLogIcon(log)}
													<Badge variant="outline">{getLogType(log)}</Badge>
												</div>
											</TableCell>
											<TableCell>
												<code className="text-xs bg-muted px-1 py-0.5 rounded">
													{formatUserId(log.userId)}
												</code>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={`${
														log.reputationEarned > 0
															? 'text-green-600 border-green-300'
															: 'text-red-600 border-red-300'
													}`}
												>
													{log.reputationEarned > 0 ? '+' : ''}
													{log.reputationEarned} reputation
												</Badge>
											</TableCell>
											<TableCell className="max-w-xs">
												{log.achievementId && typeof log.achievementId === 'number' ? (
													<div>
														<p className="font-medium">
															{achievementMap[log.achievementId]?.name || 'Unknown Achievement'}
														</p>
														<p className="text-xs text-muted-foreground">
															{achievementMap[log.achievementId]?.achievementKey ||
																`Achievement ID: ${log.achievementId}`}
														</p>
													</div>
												) : (
													<div>
														<p className="text-sm">{log.reason || 'No reason provided'}</p>
														<Badge variant="outline" className="mt-1 text-xs">
															Manual Grant
														</Badge>
													</div>
												)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1 text-sm text-muted-foreground">
													<Calendar className="h-3 w-3" />
													{new Date(log.createdAt).toLocaleDateString()}
													<span className="text-xs">
														{new Date(log.createdAt).toLocaleTimeString()}
													</span>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination Info */}
					{filteredLogs.length > 0 && (
						<div className="mt-4 text-sm text-muted-foreground text-center">
							Showing {filteredLogs.length} of {logs.length} total log entries
							{(searchQuery || filterType !== 'all') && <span> (filtered)</span>}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
