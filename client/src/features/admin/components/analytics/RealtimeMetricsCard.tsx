/**
 * Real-time Metrics Card
 *
 * Displays live system activity metrics with automatic updates
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	Users,
	Activity,
	FileText,
	MessageSquare,
	Coins,
	Zap,
	TrendingUp,
	Clock
} from 'lucide-react';
import type { RealtimeAnalytics } from '@/features/admin/api/system-analytics.api';

interface RealtimeMetricsCardProps {
	realtime: Partial<RealtimeAnalytics>;
}

export function RealtimeMetricsCard({ realtime }: RealtimeMetricsCardProps) {
	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	const getActivityLevel = (value: number, thresholds: { low: number; medium: number }) => {
		if (value >= thresholds.medium)
			return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-100' };
		if (value >= thresholds.low)
			return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
		return { level: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' };
	};

	const metrics = [
		{
			label: 'Active Users',
			value: realtime.activeUsers ?? 0,
			icon: Users,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
			description: 'Users online now',
			activity: getActivityLevel(realtime.activeUsers ?? 0, { low: 10, medium: 50 })
		},
		{
			label: 'Requests/Second',
			value: realtime.requestsPerSecond ?? 0,
			icon: Activity,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
			description: 'API requests per second',
			activity: getActivityLevel(realtime.requestsPerSecond ?? 0, { low: 5, medium: 20 })
		},
		{
			label: 'New Threads',
			value: realtime.newThreadsLastHour ?? 0,
			icon: FileText,
			color: 'text-green-600',
			bgColor: 'bg-green-100',
			description: 'Created in last hour',
			activity: getActivityLevel(realtime.newThreadsLastHour ?? 0, { low: 2, medium: 10 })
		},
		{
			label: 'New Posts',
			value: realtime.newPostsLastHour ?? 0,
			icon: MessageSquare,
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-100',
			description: 'Created in last hour',
			activity: getActivityLevel(realtime.newPostsLastHour ?? 0, { low: 5, medium: 25 })
		},
		{
			label: 'DGT Transactions',
			value: realtime.dgtTransactionsLastHour ?? 0,
			icon: Coins,
			color: 'text-amber-600',
			bgColor: 'bg-amber-100',
			description: 'Last hour volume',
			activity: getActivityLevel(realtime.dgtTransactionsLastHour ?? 0, { low: 3, medium: 15 })
		},
		{
			label: 'Cache Ops/Sec',
			value: realtime.cacheOperationsPerSecond ?? 0,
			icon: Zap,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
			description: 'Cache operations per second',
			activity: getActivityLevel(realtime.cacheOperationsPerSecond ?? 0, { low: 10, medium: 50 })
		}
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<TrendingUp className="h-5 w-5" />
					<span>Real-time System Activity</span>
					<Badge variant="outline" className="ml-auto">
						<Clock className="h-3 w-3 mr-1" />
						Live
					</Badge>
				</CardTitle>
				<CardDescription>Live system metrics updated every 30 seconds</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
					{metrics.map((metric, index) => {
						const Icon = metric.icon;
						return (
							<div
								key={index}
								className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
							>
								{/* Icon and Activity Level */}
								<div className="flex items-center justify-between w-full mb-2">
									<div className={`p-2 rounded-lg ${metric.bgColor}`}>
										<Icon className={`h-5 w-5 ${metric.color}`} />
									</div>
									<Badge
										variant="outline"
										className={`text-xs ${metric.activity.color} border-current`}
									>
										{metric.activity.level}
									</Badge>
								</div>

								{/* Value */}
								<div className={`text-2xl font-bold ${metric.color} mb-1`}>
									{formatNumber(metric.value)}
								</div>

								{/* Label */}
								<h4 className="text-sm font-medium text-gray-900 text-center mb-1">
									{metric.label}
								</h4>

								{/* Description */}
								<p className="text-xs text-gray-500 text-center">{metric.description}</p>

								{/* Trend Indicator */}
								<div className="flex items-center mt-2 space-x-1">
									<TrendingUp className="h-3 w-3 text-green-500" />
									<span className="text-xs text-green-500">Active</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* Summary Stats */}
				<div className="mt-6 pt-4 border-t">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center">
							<div className="text-lg font-semibold text-gray-900">
								{formatNumber(
									(realtime.newThreadsLastHour ?? 0) + (realtime.newPostsLastHour ?? 0)
								)}
							</div>
							<p className="text-sm text-gray-600">Total New Content</p>
							<p className="text-xs text-gray-500">Last Hour</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-gray-900">
								{formatNumber((realtime.requestsPerSecond ?? 0) * 3600)}
							</div>
							<p className="text-sm text-gray-600">Est. Requests/Hour</p>
							<p className="text-xs text-gray-500">Current Rate</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-gray-900">
								{formatNumber((realtime.cacheOperationsPerSecond ?? 0) * 60)}
							</div>
							<p className="text-sm text-gray-600">Cache Ops/Minute</p>
							<p className="text-xs text-gray-500">Current Rate</p>
						</div>
					</div>
				</div>

				{/* Last Updated */}
				<div className="mt-4 text-center">
					<p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
						<Clock className="h-3 w-3" />
						<span>Updates every 30 seconds</span>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
