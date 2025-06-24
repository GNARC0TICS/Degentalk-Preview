/**
 * System Overview Card
 *
 * Displays high-level system status and key performance metrics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Activity,
	Users,
	MessageSquare,
	FileText,
	Coins,
	Zap,
	Database,
	Globe,
	TrendingUp,
	Clock
} from 'lucide-react';
import type { SystemOverview } from '@/features/admin/api/system-analytics.api';

interface SystemOverviewCardProps {
	overview: SystemOverview;
}

export function SystemOverviewCard({ overview }: SystemOverviewCardProps) {
	const getHealthColor = (status: 'healthy' | 'degraded' | 'critical') => {
		switch (status) {
			case 'healthy':
				return 'text-green-600';
			case 'degraded':
				return 'text-yellow-600';
			case 'critical':
				return 'text-red-600';
			default:
				return 'text-gray-600';
		}
	};

	const getHealthBadgeVariant = (status: 'healthy' | 'degraded' | 'critical') => {
		switch (status) {
			case 'healthy':
				return 'bg-green-100 text-green-800 border-green-200' as const;
			case 'degraded':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200' as const;
			case 'critical':
				return 'bg-red-100 text-red-800 border-red-200' as const;
			default:
				return 'secondary' as const;
		}
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
	const formatTime = (num: number) => `${num.toFixed(0)}ms`;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Activity className="h-5 w-5" />
					<span>System Overview</span>
				</CardTitle>
				<CardDescription>Real-time system status and key performance indicators</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* System Status Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold mb-1">
							<Badge className={getHealthBadgeVariant(overview.systemStatus.health)}>
								{overview.systemStatus.health.toUpperCase()}
							</Badge>
						</div>
						<p className="text-sm text-gray-600">System Health</p>
						<div className="mt-2">
							<Progress value={overview.systemStatus.score} className="h-2" />
							<p className="text-xs text-gray-500 mt-1">{overview.systemStatus.score}/100 Score</p>
						</div>
					</div>

					<div className="text-center">
						<div className="text-2xl font-bold mb-1 text-blue-600">
							{formatPercentage(overview.systemStatus.uptime)}
						</div>
						<p className="text-sm text-gray-600">Uptime</p>
						<div className="mt-2">
							<Progress value={overview.systemStatus.uptime} className="h-2" />
							<p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
						</div>
					</div>

					<div className="text-center">
						<div className="text-2xl font-bold mb-1 text-purple-600">
							{formatNumber(overview.performance.requestsPerMinute)}
						</div>
						<p className="text-sm text-gray-600">Requests/min</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="text-xs text-green-500">Active</span>
						</div>
					</div>
				</div>

				{/* Performance Metrics */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<Globe className="h-4 w-4 mr-2" />
						Performance Metrics
					</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-lg font-semibold text-blue-600">
								{formatTime(overview.performance.averageResponseTime)}
							</div>
							<p className="text-xs text-gray-600">Avg Response Time</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-green-600">
								{formatPercentage(overview.performance.cacheHitRate)}
							</div>
							<p className="text-xs text-gray-600">Cache Hit Rate</p>
						</div>
						<div className="text-lg font-semibold text-yellow-600 text-center">
							<div>{formatPercentage(overview.performance.errorRate)}</div>
							<p className="text-xs text-gray-600">Error Rate</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-purple-600">
								{formatNumber(overview.activity.activeUsers)}
							</div>
							<p className="text-xs text-gray-600">Active Users</p>
						</div>
					</div>
				</div>

				{/* Activity Summary */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<Clock className="h-4 w-4 mr-2" />
						Recent Activity (Last Hour)
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
							<FileText className="h-8 w-8 text-blue-600" />
							<div>
								<div className="font-semibold text-blue-800">
									{formatNumber(overview.activity.newThreadsLastHour)}
								</div>
								<p className="text-xs text-blue-600">New Threads</p>
							</div>
						</div>
						<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
							<MessageSquare className="h-8 w-8 text-green-600" />
							<div>
								<div className="font-semibold text-green-800">
									{formatNumber(overview.activity.newPostsLastHour)}
								</div>
								<p className="text-xs text-green-600">New Posts</p>
							</div>
						</div>
						<div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
							<Coins className="h-8 w-8 text-purple-600" />
							<div>
								<div className="font-semibold text-purple-800">
									{formatNumber(overview.activity.dgtTransactionsLastHour)}
								</div>
								<p className="text-xs text-purple-600">DGT Transactions</p>
							</div>
						</div>
					</div>
				</div>

				{/* Resource Usage */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<Database className="h-4 w-4 mr-2" />
						Resource Usage
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-gray-600">Cache Memory</span>
								<span className="text-sm font-medium">
									{overview.resources.cacheMemoryUsage.toFixed(1)} MB
								</span>
							</div>
							<Progress
								value={Math.min((overview.resources.cacheMemoryUsage / 100) * 100, 100)}
								className="h-2"
							/>
						</div>
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-gray-600">DB Connections</span>
								<span className="text-sm font-medium">
									{overview.resources.databaseConnections}
								</span>
							</div>
							<Progress
								value={Math.min((overview.resources.databaseConnections / 100) * 100, 100)}
								className="h-2"
							/>
						</div>
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-gray-600">Cache Keys</span>
								<span className="text-sm font-medium">
									{formatNumber(overview.resources.totalCacheKeys)}
								</span>
							</div>
							<Progress
								value={Math.min((overview.resources.totalCacheKeys / 10000) * 100, 100)}
								className="h-2"
							/>
						</div>
					</div>
				</div>

				{/* Alerts Summary */}
				{overview.alerts.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<Zap className="h-4 w-4 mr-2" />
							Active Alerts ({overview.alerts.length})
						</h4>
						<div className="space-y-2 max-h-32 overflow-y-auto">
							{overview.alerts.slice(0, 3).map((alert, index) => (
								<div
									key={index}
									className={`p-2 rounded-lg text-xs border ${
										alert.severity === 'critical'
											? 'bg-red-50 border-red-200 text-red-800'
											: 'bg-yellow-50 border-yellow-200 text-yellow-800'
									}`}
								>
									<div className="font-medium">{alert.metric}</div>
									<div>{alert.message}</div>
								</div>
							))}
							{overview.alerts.length > 3 && (
								<p className="text-xs text-gray-500 text-center">
									+{overview.alerts.length - 3} more alerts
								</p>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
