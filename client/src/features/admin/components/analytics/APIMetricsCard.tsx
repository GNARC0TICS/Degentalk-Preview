/**
 * API Metrics Card
 *
 * Displays API performance metrics and endpoint analysis
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Progress } from '@app/components/ui/progress';
import { Badge } from '@app/components/ui/badge';
import { Globe, TrendingUp, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@app/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { SystemMetrics } from '@app/features/admin/api/system-analytics.api';

interface APIMetricsCardProps {
	api: SystemMetrics['api'];
}

export function APIMetricsCard({ api }: APIMetricsCardProps) {
	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	const getErrorRateColor = (rate: number) => {
		if (rate < 1) return 'text-green-600';
		if (rate < 3) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getResponseTimeColor = (time: number) => {
		if (time < 100) return 'text-green-600';
		if (time < 300) return 'text-yellow-600';
		return 'text-red-600';
	};

	// Prepare chart data
	const statusCodeData = Object.entries(api.statusCodes).map(([code, count]) => ({
		code,
		count,
		color: code.startsWith('2')
			? '#10b981'
			: code.startsWith('3')
				? '#3b82f6'
				: code.startsWith('4')
					? '#f59e0b'
					: '#ef4444'
	}));

	const errorTypeData = Object.entries(api.errorsByType).map(([type, count]) => ({
		type: type.replace('Error', ''),
		count,
		color: '#ef4444'
	}));

	const totalRequests = Object.values(api.statusCodes).reduce((sum, count) => sum + count, 0);
	const successRate = totalRequests > 0 ? ((api.statusCodes['200'] || 0) / totalRequests) * 100 : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Globe className="h-5 w-5" />
					<span>API Metrics</span>
				</CardTitle>
				<CardDescription>API performance and endpoint analysis</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Key Metrics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{formatNumber(api.requestsPerMinute)}
						</div>
						<p className="text-sm text-gray-600">Requests/min</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<TrendingUp className="h-3 w-3 text-blue-500" />
							<span className="text-xs text-blue-500">Active</span>
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
						<p className="text-sm text-gray-600">Success Rate</p>
						<div className="mt-2">
							<Progress value={successRate} className="h-2" />
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-orange-600">
							{Object.values(api.errorsByType).reduce((sum, count) => sum + count, 0)}
						</div>
						<p className="text-sm text-gray-600">Total Errors</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<AlertTriangle className="h-3 w-3 text-orange-500" />
							<span className="text-xs text-orange-500">Last 24h</span>
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">{formatNumber(totalRequests)}</div>
						<p className="text-sm text-gray-600">Total Requests</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<Activity className="h-3 w-3 text-purple-500" />
							<span className="text-xs text-purple-500">24h Volume</span>
						</div>
					</div>
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Status Code Distribution */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<CheckCircle className="h-4 w-4 mr-2" />
							Status Code Distribution
						</h4>
						<div className="h-48 flex items-center justify-center">
							<ChartContainer
								config={{
									'2xx': { label: '2xx Success', color: '#10b981' },
									'3xx': { label: '3xx Navigate', color: '#3b82f6' },
									'4xx': { label: '4xx Client Error', color: '#f59e0b' },
									'5xx': { label: '5xx Server Error', color: '#ef4444' }
								}}
								className="h-full w-full"
							>
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={statusCodeData}
											cx="50%"
											cy="50%"
											innerRadius={40}
											outerRadius={80}
											dataKey="count"
											label={({ code, count, percent }) =>
												`${code}: ${formatNumber(count)} (${(percent * 100).toFixed(1)}%)`
											}
										>
											{statusCodeData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<ChartTooltip content={<ChartTooltipContent />} />
									</PieChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</div>

					{/* Error Types */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<AlertTriangle className="h-4 w-4 mr-2" />
							Error Types
						</h4>
						<div className="h-48">
							<ChartContainer
								config={{
									count: { label: 'Errors', color: '#ef4444' }
								}}
								className="h-full w-full"
							>
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={errorTypeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
										<XAxis
											dataKey="type"
											tick={{ fontSize: 10 }}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis tick={{ fontSize: 10 }} />
										<Bar dataKey="count" fill="#ef4444" radius={[2, 2, 0, 0]} />
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

				{/* Top Endpoints */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<Globe className="h-4 w-4 mr-2" />
						Top API Endpoints
					</h4>
					<div className="space-y-3">
						{api.topEndpoints.map((endpoint, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center space-x-3 flex-1">
									<Badge variant="outline" className="text-xs">
										#{index + 1}
									</Badge>
									<code className="text-sm bg-white px-2 py-1 rounded text-gray-800 flex-1">
										{endpoint.endpoint}
									</code>
								</div>
								<div className="flex items-center space-x-4 text-sm">
									<div className="text-center">
										<div className="font-medium text-blue-600">
											{formatNumber(endpoint.requests)}
										</div>
										<p className="text-xs text-gray-500">requests</p>
									</div>
									<div className="text-center">
										<div className={`font-medium ${getResponseTimeColor(endpoint.responseTime)}`}>
											{endpoint.responseTime.toFixed(0)}ms
										</div>
										<p className="text-xs text-gray-500">avg time</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Performance Summary */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
					<div className="text-center">
						<div className="text-lg font-semibold text-green-600">
							{api.statusCodes['200'] || 0}
						</div>
						<p className="text-xs text-gray-600">Success (200)</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-yellow-600">
							{(api.statusCodes['400'] || 0) + (api.statusCodes['404'] || 0)}
						</div>
						<p className="text-xs text-gray-600">Client Errors (4xx)</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-red-600">{api.statusCodes['500'] || 0}</div>
						<p className="text-xs text-gray-600">Server Errors (5xx)</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-blue-600">
							{api.topEndpoints.length > 0
								? (
										api.topEndpoints.reduce((sum, ep) => sum + ep.responseTime, 0) /
										api.topEndpoints.length
									).toFixed(0)
								: '0'}
							ms
						</div>
						<p className="text-xs text-gray-600">Avg Response Time</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
