/**
 * Performance Heatmap Card
 *
 * Displays performance metrics as interactive heatmaps for system analysis
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Clock, Activity, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import type { PerformanceHeatmap } from '@/features/admin/api/system-analytics.api';

interface PerformanceHeatmapCardProps {
	heatmap: PerformanceHeatmap;
	timeRange: '24h' | '7d' | '30d';
}

export function PerformanceHeatmapCard({ heatmap, timeRange }: PerformanceHeatmapCardProps) {
	const [selectedMetric, setSelectedMetric] = useState(0);

	const getColorForValue = (value: number, metric: PerformanceHeatmap['metrics'][0]) => {
		const { threshold } = metric;

		if (metric.type === 'error_rate') {
			// For error rate, lower is better
			if (value <= threshold.excellent) return 'bg-green-500';
			if (value <= threshold.good) return 'bg-yellow-500';
			if (value <= threshold.fair) return 'bg-orange-500';
			return 'bg-red-500';
		} else if (metric.type === 'cache_hit_rate') {
			// For cache hit rate, higher is better
			if (value >= threshold.excellent) return 'bg-green-500';
			if (value >= threshold.good) return 'bg-yellow-500';
			if (value >= threshold.fair) return 'bg-orange-500';
			return 'bg-red-500';
		} else if (metric.type === 'response_time') {
			// For response time, lower is better
			if (value <= threshold.excellent) return 'bg-green-500';
			if (value <= threshold.good) return 'bg-yellow-500';
			if (value <= threshold.fair) return 'bg-orange-500';
			return 'bg-red-500';
		} else {
			// For request count, higher is better
			if (value >= threshold.excellent) return 'bg-green-500';
			if (value >= threshold.good) return 'bg-yellow-500';
			if (value >= threshold.fair) return 'bg-orange-500';
			return 'bg-red-500';
		}
	};

	const getIntensity = (value: number, metric: PerformanceHeatmap['metrics'][0]) => {
		const { threshold } = metric;
		const max = Math.max(threshold.excellent, threshold.good, threshold.fair, threshold.poor);
		const min = Math.min(threshold.excellent, threshold.good, threshold.fair, threshold.poor);

		const normalized = (value - min) / (max - min);
		return Math.max(0.3, Math.min(1, normalized)); // Ensure visibility
	};

	const formatValue = (value: number, type: string) => {
		switch (type) {
			case 'response_time':
				return `${value.toFixed(0)}ms`;
			case 'request_count':
				return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(0);
			case 'error_rate':
				return `${value.toFixed(2)}%`;
			case 'cache_hit_rate':
				return `${value.toFixed(1)}%`;
			default:
				return value.toFixed(1);
		}
	};

	const getMetricIcon = (type: string) => {
		switch (type) {
			case 'response_time':
				return <Clock className="h-4 w-4" />;
			case 'request_count':
				return <BarChart3 className="h-4 w-4" />;
			case 'error_rate':
				return <AlertTriangle className="h-4 w-4" />;
			case 'cache_hit_rate':
				return <Zap className="h-4 w-4" />;
			default:
				return <Activity className="h-4 w-4" />;
		}
	};

	const formatTimeSlot = (timeSlot: string) => {
		const date = new Date(timeSlot);
		if (timeRange === '24h') {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	};

	const currentMetric = heatmap.metrics[selectedMetric];

	if (!currentMetric) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<BarChart3 className="h-5 w-5" />
						<span>Performance Heatmap</span>
					</CardTitle>
					<CardDescription>No performance data available</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<BarChart3 className="h-5 w-5" />
					<span>Performance Heatmap</span>
					<Badge variant="outline" className="ml-auto">
						{timeRange}
					</Badge>
				</CardTitle>
				<CardDescription>
					Visual representation of system performance metrics over time
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Metric Selector */}
				<div>
					<div className="flex items-center space-x-2 mb-3">
						<span className="text-sm font-medium text-gray-700">Metric:</span>
						<div className="flex flex-wrap gap-2">
							{heatmap.metrics.map((metric, index) => (
								<Button
									key={index}
									variant={selectedMetric === index ? 'default' : 'outline'}
									size="sm"
									onClick={() => setSelectedMetric(index)}
									className="flex items-center space-x-2"
								>
									{getMetricIcon(metric.type)}
									<span>{metric.name}</span>
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Heatmap Visualization */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
							{getMetricIcon(currentMetric.type)}
							<span>{currentMetric.name}</span>
						</h4>
						<div className="flex items-center space-x-4 text-xs text-gray-500">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-green-500 rounded"></div>
								<span>Excellent</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-yellow-500 rounded"></div>
								<span>Good</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-orange-500 rounded"></div>
								<span>Fair</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-red-500 rounded"></div>
								<span>Poor</span>
							</div>
						</div>
					</div>

					{/* Heatmap Grid */}
					<div className="overflow-x-auto">
						<div className="min-w-full">
							{/* Time Labels */}
							<div className="flex mb-2">
								<div className="w-16 text-xs text-gray-500 flex items-center justify-center">
									Time
								</div>
								{heatmap.timeSlots.slice(0, 24).map((timeSlot, index) => (
									<div
										key={index}
										className="flex-1 text-xs text-gray-500 text-center px-1"
										style={{ minWidth: '40px' }}
									>
										{formatTimeSlot(timeSlot)}
									</div>
								))}
							</div>

							{/* Heatmap Rows */}
							<div className="space-y-1">
								{currentMetric.data.slice(0, 12).map((hourData, hourIndex) => (
									<div key={hourIndex} className="flex">
										<div className="w-16 text-xs text-gray-500 flex items-center justify-center">
											{timeRange === '24h' ? `${hourIndex}:00` : `Day ${hourIndex + 1}`}
										</div>
										{hourData.slice(0, 24).map((value, minuteIndex) => (
											<div
												key={minuteIndex}
												className={`flex-1 h-6 m-0.5 rounded-sm cursor-pointer transition-all hover:scale-110 ${getColorForValue(Number(value), currentMetric)}`}
												style={{
													minWidth: '32px',
													opacity: getIntensity(Number(value), currentMetric)
												}}
												title={`${formatTimeSlot(heatmap.timeSlots[hourIndex])}: ${formatValue(Number(value), currentMetric.type)}`}
											/>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Metric Summary */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
					<div className="text-center">
						<div className="text-lg font-semibold text-green-600">
							{formatValue(currentMetric.threshold.excellent, currentMetric.type)}
						</div>
						<p className="text-xs text-gray-600">Excellent Threshold</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-yellow-600">
							{formatValue(currentMetric.threshold.good, currentMetric.type)}
						</div>
						<p className="text-xs text-gray-600">Good Threshold</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-orange-600">
							{formatValue(currentMetric.threshold.fair, currentMetric.type)}
						</div>
						<p className="text-xs text-gray-600">Fair Threshold</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-red-600">
							{formatValue(currentMetric.threshold.poor, currentMetric.type)}
						</div>
						<p className="text-xs text-gray-600">Poor Threshold</p>
					</div>
				</div>

				{/* Analysis Notes */}
				<div className="bg-blue-50 p-3 rounded-lg">
					<h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
						<TrendingUp className="h-4 w-4 mr-2" />
						Analysis
					</h5>
					<p className="text-xs text-blue-800">
						{currentMetric.type === 'response_time' &&
							'Lower response times indicate better performance. Look for patterns of high latency during peak hours.'}
						{currentMetric.type === 'request_count' &&
							'Higher request counts show system activity. Monitor for unusual spikes or drops that might indicate issues.'}
						{currentMetric.type === 'error_rate' &&
							'Lower error rates are better. Investigate any red zones that show high error activity.'}
						{currentMetric.type === 'cache_hit_rate' &&
							'Higher cache hit rates improve performance. Red zones indicate cache misses that may need optimization.'}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
