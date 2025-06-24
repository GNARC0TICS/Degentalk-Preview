/**
 * System Analytics Dashboard
 *
 * Comprehensive system performance analytics with caching stats and heatmaps
 */

import React, { useState } from 'react';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	RefreshCw,
	Activity,
	Database,
	Zap,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
	XCircle
} from 'lucide-react';
import {
	useSystemOverview,
	useSystemHealth,
	useRealtimeAnalytics,
	useCacheStats,
	usePerformanceHeatmap,
	useSystemMetrics,
	useRefreshSystemAnalytics,
	useSystemAnalyticsLoadingState,
	useSystemAnalyticsErrorState
} from '@/features/admin/hooks/useSystemAnalytics';
import { SystemOverviewCard } from '@/features/admin/components/analytics/SystemOverviewCard';
import { SystemHealthCard } from '@/features/admin/components/analytics/SystemHealthCard';
import { RealtimeMetricsCard } from '@/features/admin/components/analytics/RealtimeMetricsCard';
import { CacheAnalyticsCard } from '@/features/admin/components/analytics/CacheAnalyticsCard';
import { PerformanceHeatmapCard } from '@/features/admin/components/analytics/PerformanceHeatmapCard';
import { DatabaseStatsCard } from '@/features/admin/components/analytics/DatabaseStatsCard';
import { APIMetricsCard } from '@/features/admin/components/analytics/APIMetricsCard';
import { SystemAlertsCard } from '@/features/admin/components/analytics/SystemAlertsCard';

export default function SystemAnalyticsDashboard() {
	const [activeTab, setActiveTab] = useState('overview');
	const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

	// Data hooks
	const { data: overview, isLoading: overviewLoading } = useSystemOverview();
	const { data: health, isLoading: healthLoading } = useSystemHealth();
	const { data: realtime, isLoading: realtimeLoading } = useRealtimeAnalytics();
	const { data: cache, isLoading: cacheLoading } = useCacheStats();
	const { data: heatmap, isLoading: heatmapLoading } = usePerformanceHeatmap({
		timeRange,
		granularity: timeRange === '1h' ? 'hour' : 'day'
	});
	const { data: metrics, isLoading: metricsLoading } = useSystemMetrics({ timeRange });

	// Utility hooks
	const refreshAll = useRefreshSystemAnalytics();
	const { isLoading: globalLoading } = useSystemAnalyticsLoadingState();
	const { hasErrors, errorMessages } = useSystemAnalyticsErrorState();

	const getHealthStatusIcon = (status: 'healthy' | 'degraded' | 'critical') => {
		switch (status) {
			case 'healthy':
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case 'degraded':
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case 'critical':
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Activity className="h-5 w-5 text-gray-500" />;
		}
	};

	const getHealthStatusColor = (status: 'healthy' | 'degraded' | 'critical') => {
		switch (status) {
			case 'healthy':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'degraded':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'critical':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<AdminPageShell
			title="System Analytics"
			description="Comprehensive system performance monitoring with caching stats and heatmaps"
		>
			{/* Header Controls */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-4">
					{/* System Health Status */}
					{health?.health && (
						<div className="flex items-center space-x-2">
							{getHealthStatusIcon(health.health.status)}
							<Badge className={getHealthStatusColor(health.health.status)}>
								{health.health.status?.toUpperCase()} ({health.health.score}/100)
							</Badge>
						</div>
					)}

					{/* Time Range Selector */}
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-gray-700">Time Range:</span>
						<div className="flex space-x-1">
							{(['1h', '24h', '7d', '30d'] as const).map((range) => (
								<Button
									key={range}
									variant={timeRange === range ? 'default' : 'outline'}
									size="sm"
									onClick={() => setTimeRange(range)}
								>
									{range}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Refresh Button */}
				<Button onClick={refreshAll} disabled={globalLoading} variant="outline" size="sm">
					<RefreshCw className={`h-4 w-4 mr-2 ${globalLoading ? 'animate-spin' : ''}`} />
					Refresh All
				</Button>
			</div>

			{/* Error State */}
			{hasErrors && (
				<Alert variant="destructive" className="mb-6">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						Issues detected: {errorMessages.join(', ')}. Some analytics data may be unavailable.
					</AlertDescription>
				</Alert>
			)}

			{/* Main Dashboard Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-6">
					<TabsTrigger value="overview" className="flex items-center space-x-2">
						<TrendingUp className="h-4 w-4" />
						<span>Overview</span>
					</TabsTrigger>
					<TabsTrigger value="performance" className="flex items-center space-x-2">
						<Activity className="h-4 w-4" />
						<span>Performance</span>
					</TabsTrigger>
					<TabsTrigger value="cache" className="flex items-center space-x-2">
						<Zap className="h-4 w-4" />
						<span>Cache</span>
					</TabsTrigger>
					<TabsTrigger value="database" className="flex items-center space-x-2">
						<Database className="h-4 w-4" />
						<span>Database</span>
					</TabsTrigger>
					<TabsTrigger value="api" className="flex items-center space-x-2">
						<Activity className="h-4 w-4" />
						<span>API</span>
					</TabsTrigger>
					<TabsTrigger value="alerts" className="flex items-center space-x-2">
						<AlertTriangle className="h-4 w-4" />
						<span>Alerts</span>
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{/* System Overview */}
						<div className="xl:col-span-2">
							{overviewLoading ? (
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-32" />
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<Skeleton className="h-20 w-full" />
											<Skeleton className="h-20 w-full" />
										</div>
									</CardContent>
								</Card>
							) : overview?.overview ? (
								<SystemOverviewCard overview={overview.overview} />
							) : (
								<Card>
									<CardHeader>
										<CardTitle>System Overview</CardTitle>
										<CardDescription>Loading system metrics...</CardDescription>
									</CardHeader>
								</Card>
							)}
						</div>

						{/* System Health */}
						<div>
							{healthLoading ? (
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-32 w-full" />
									</CardContent>
								</Card>
							) : health?.health ? (
								<SystemHealthCard health={health.health} />
							) : (
								<Card>
									<CardHeader>
										<CardTitle>System Health</CardTitle>
										<CardDescription>Loading health status...</CardDescription>
									</CardHeader>
								</Card>
							)}
						</div>
					</div>

					{/* Real-time Metrics */}
					<div>
						{realtimeLoading ? (
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-40" />
									<Skeleton className="h-4 w-28" />
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
										{Array.from({ length: 6 }).map((_, i) => (
											<Skeleton key={i} className="h-16 w-full" />
										))}
									</div>
								</CardContent>
							</Card>
						) : realtime?.realtime ? (
							<RealtimeMetricsCard realtime={realtime.realtime} />
						) : null}
					</div>
				</TabsContent>

				{/* Performance Tab */}
				<TabsContent value="performance" className="space-y-6">
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
						{/* Performance Heatmap */}
						<div className="xl:col-span-2">
							{heatmapLoading ? (
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-32" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-96 w-full" />
									</CardContent>
								</Card>
							) : heatmap?.heatmap ? (
								<PerformanceHeatmapCard heatmap={heatmap.heatmap} timeRange={timeRange} />
							) : (
								<Card>
									<CardHeader>
										<CardTitle>Performance Heatmap</CardTitle>
										<CardDescription>Loading performance data...</CardDescription>
									</CardHeader>
								</Card>
							)}
						</div>

						{/* API Metrics */}
						<div>
							{metricsLoading ? (
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-64 w-full" />
									</CardContent>
								</Card>
							) : metrics?.metrics?.api ? (
								<APIMetricsCard api={metrics.metrics.api} />
							) : null}
						</div>
					</div>
				</TabsContent>

				{/* Cache Tab */}
				<TabsContent value="cache" className="space-y-6">
					{cacheLoading ? (
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-96 w-full" />
							</CardContent>
						</Card>
					) : cache ? (
						<CacheAnalyticsCard cache={cache} />
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Cache Analytics</CardTitle>
								<CardDescription>Loading cache metrics...</CardDescription>
							</CardHeader>
						</Card>
					)}
				</TabsContent>

				{/* Database Tab */}
				<TabsContent value="database" className="space-y-6">
					{metricsLoading ? (
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-96 w-full" />
							</CardContent>
						</Card>
					) : metrics?.metrics?.database ? (
						<DatabaseStatsCard database={metrics.metrics.database} />
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Database Statistics</CardTitle>
								<CardDescription>Loading database metrics...</CardDescription>
							</CardHeader>
						</Card>
					)}
				</TabsContent>

				{/* API Tab */}
				<TabsContent value="api" className="space-y-6">
					{metricsLoading ? (
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-96 w-full" />
							</CardContent>
						</Card>
					) : metrics?.metrics?.api ? (
						<APIMetricsCard api={metrics.metrics.api} />
					) : (
						<Card>
							<CardHeader>
								<CardTitle>API Metrics</CardTitle>
								<CardDescription>Loading API statistics...</CardDescription>
							</CardHeader>
						</Card>
					)}
				</TabsContent>

				{/* Alerts Tab */}
				<TabsContent value="alerts" className="space-y-6">
					{overview?.overview ? (
						<SystemAlertsCard alerts={overview.overview.alerts} />
					) : (
						<Card>
							<CardHeader>
								<CardTitle>System Alerts</CardTitle>
								<CardDescription>Loading alert information...</CardDescription>
							</CardHeader>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</AdminPageShell>
	);
}
