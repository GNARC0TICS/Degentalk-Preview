/**
 * Cache Analytics Card
 *
 * Displays comprehensive cache performance metrics and controls
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
	Zap,
	Database,
	Trash2,
	RefreshCw,
	TrendingUp,
	TrendingDown,
	Activity,
	AlertTriangle,
	CheckCircle,
	BarChart3
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useCacheOperation } from '@/features/admin/hooks/useSystemAnalytics';
import type { CacheStats } from '@/features/admin/api/system-analytics.api';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface CacheAnalyticsCardProps {
	cache: CacheStats;
}

export function CacheAnalyticsCard({ cache }: CacheAnalyticsCardProps) {
	const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
	const cacheOperation = useCacheOperation();

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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

	const getHitRateColor = (hitRate: number) => {
		if (hitRate >= 95) return 'text-green-600';
		if (hitRate >= 90) return 'text-blue-600';
		if (hitRate >= 80) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getHitRateGradeColor = (grade: string) => {
		switch (grade.toLowerCase()) {
			case 'excellent':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'good':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'fair':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'poor':
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case 'critical':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const handleCacheOperation = async (operation: 'clear' | 'warm' | 'stats', category?: string) => {
		setSelectedOperation(operation);
		try {
			await cacheOperation.mutateAsync({
				operation,
				...(category && { category })
			});
		} catch (error) {
			logger.error('CacheAnalyticsCard', 'Cache operation failed:', error);
		} finally {
			setSelectedOperation(null);
		}
	};

	// Prepare chart data
	const hitMissData = [
		{ name: 'Hits', value: cache.analytics.hits, color: '#10b981' },
		{ name: 'Misses', value: cache.analytics.misses, color: '#ef4444' }
	];

	const categoryData = Object.entries(cache.analytics.keysByCategory).map(([category, count]) => ({
		category,
		count
	}));

	const totalRequests = cache.analytics.hits + cache.analytics.misses;
	const hitRate = totalRequests > 0 ? (cache.analytics.hits / totalRequests) * 100 : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Zap className="h-5 w-5" />
					<span>Cache Analytics</span>
					<Badge className={getHitRateGradeColor(cache.analytics.hitRateGrade)}>
						{cache.analytics.hitRateGrade}
					</Badge>
				</CardTitle>
				<CardDescription>Real-time cache performance metrics and management tools</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Key Metrics Row */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className={`text-2xl font-bold ${getHitRateColor(hitRate)}`}>
							{hitRate.toFixed(1)}%
						</div>
						<p className="text-sm text-gray-600">Hit Rate</p>
						<div className="mt-2">
							<Progress value={hitRate} className="h-2" />
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{formatNumber(cache.metrics.keys)}
						</div>
						<p className="text-sm text-gray-600">Total Keys</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<Database className="h-3 w-3 text-blue-500" />
							<span className="text-xs text-blue-500">Active</span>
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">
							{formatBytes(cache.metrics.ksize + cache.metrics.vsize)}
						</div>
						<p className="text-sm text-gray-600">Memory Usage</p>
						<div className="mt-2">
							<Progress
								value={Math.min(
									((cache.metrics.ksize + cache.metrics.vsize) / (100 * 1024 * 1024)) * 100,
									100
								)}
								className="h-2"
							/>
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">{formatNumber(totalRequests)}</div>
						<p className="text-sm text-gray-600">Total Requests</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="text-xs text-green-500">Active</span>
						</div>
					</div>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Hit/Miss Distribution */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<Activity className="h-4 w-4 mr-2" />
							Hit/Miss Distribution
						</h4>
						<div className="h-48 flex items-center justify-center">
							<ChartContainer
								config={{
									hits: { label: 'Hits', color: '#10b981' },
									misses: { label: 'Misses', color: '#ef4444' }
								}}
								className="h-full w-full"
							>
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={hitMissData}
											cx="50%"
											cy="50%"
											innerRadius={40}
											outerRadius={80}
											dataKey="value"
											label={({ name, value, percent }) =>
												`${name}: ${formatNumber(value)} (${(percent * 100).toFixed(1)}%)`
											}
										>
											{hitMissData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</div>

					{/* Keys by Category */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<BarChart3 className="h-4 w-4 mr-2" />
							Keys by Category
						</h4>
						<div className="h-48">
							<ChartContainer
								config={{
									count: { label: 'Keys', color: '#6366f1' }
								}}
								className="h-full w-full"
							>
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={categoryData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
										<XAxis
											dataKey="category"
											tick={{ fontSize: 10 }}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis tick={{ fontSize: 10 }} />
										<Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
										<ChartTooltip
											content={<ChartTooltipContent />}
											formatter={(value, name) => [formatNumber(value as number), name]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</div>
				</div>

				{/* Detailed Statistics */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Statistics</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="text-lg font-semibold text-green-600">
								{formatNumber(cache.analytics.hits)}
							</div>
							<p className="text-xs text-gray-600">Cache Hits</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="text-lg font-semibold text-red-600">
								{formatNumber(cache.analytics.misses)}
							</div>
							<p className="text-xs text-gray-600">Cache Misses</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="text-lg font-semibold text-blue-600">
								{formatBytes(cache.metrics.ksize)}
							</div>
							<p className="text-xs text-gray-600">Keys Size</p>
						</div>
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="text-lg font-semibold text-purple-600">
								{formatBytes(cache.metrics.vsize)}
							</div>
							<p className="text-xs text-gray-600">Values Size</p>
						</div>
					</div>
				</div>

				{/* Recommendations */}
				{cache.analytics.recommendations.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<AlertTriangle className="h-4 w-4 mr-2" />
							Recommendations ({cache.analytics.recommendations.length})
						</h4>
						<div className="space-y-2">
							{cache.analytics.recommendations.slice(0, 3).map((recommendation, index) => (
								<Alert key={index} className="py-2">
									<CheckCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{recommendation}</AlertDescription>
								</Alert>
							))}
							{cache.analytics.recommendations.length > 3 && (
								<p className="text-xs text-gray-500 text-center">
									+{cache.analytics.recommendations.length - 3} more recommendations
								</p>
							)}
						</div>
					</div>
				)}

				<Separator />

				{/* Cache Operations */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3">Cache Operations</h4>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleCacheOperation('stats')}
							disabled={cacheOperation.isPending}
							className="flex items-center space-x-2"
						>
							<RefreshCw
								className={`h-4 w-4 ${selectedOperation === 'stats' ? 'animate-spin' : ''}`}
							/>
							<span>Refresh Stats</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleCacheOperation('clear')}
							disabled={cacheOperation.isPending}
							className="flex items-center space-x-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
						>
							<Trash2 className="h-4 w-4" />
							<span>Clear All Cache</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleCacheOperation('warm')}
							disabled={cacheOperation.isPending}
							className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
						>
							<Zap className={`h-4 w-4 ${selectedOperation === 'warm' ? 'animate-spin' : ''}`} />
							<span>Warm Cache</span>
						</Button>
					</div>
					{cacheOperation.isPending && (
						<p className="text-xs text-gray-500 mt-2">Executing cache operation...</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
