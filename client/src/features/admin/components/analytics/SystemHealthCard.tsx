/**
 * System Health Card
 *
 * Displays system health status with detailed checks and recommendations
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Heart, Clock, Lightbulb } from 'lucide-react';
import type { SystemHealth } from '@/features/admin/api/system-analytics.api';

interface SystemHealthCardProps {
	health: Partial<SystemHealth>;
}

export function SystemHealthCard({ health }: SystemHealthCardProps) {
	const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
		switch (status) {
			case 'pass':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'warn':
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case 'fail':
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <AlertTriangle className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: 'pass' | 'warn' | 'fail') => {
		switch (status) {
			case 'pass':
				return 'text-green-700';
			case 'warn':
				return 'text-yellow-700';
			case 'fail':
				return 'text-red-700';
			default:
				return 'text-gray-700';
		}
	};

	const getHealthBadgeVariant = (status: 'healthy' | 'degraded' | 'critical') => {
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

	const getScoreColor = (score: number) => {
		if (score >= 90) return 'text-green-600';
		if (score >= 70) return 'text-yellow-600';
		return 'text-red-600';
	};

	const formatLastChecked = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds} seconds ago`;
		}
		if (diffInSeconds < 3600) {
			return `${Math.floor(diffInSeconds / 60)} minutes ago`;
		}
		if (diffInSeconds < 86400) {
			return `${Math.floor(diffInSeconds / 3600)} hours ago`;
		}
		return date.toLocaleDateString();
	};

	if (!health.status || !health.score) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Heart className="h-5 w-5" />
						<span>System Health</span>
					</CardTitle>
					<CardDescription>Loading health assessment...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Heart className="h-5 w-5" />
					<span>System Health</span>
				</CardTitle>
				<CardDescription>Real-time system health monitoring and assessment</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Overall Health Status */}
				<div className="text-center">
					<Badge className={getHealthBadgeVariant(health.status)}>
						{health.status.toUpperCase()}
					</Badge>
					<div className={`text-3xl font-bold mt-2 mb-2 ${getScoreColor(health.score)}`}>
						{health.score}/100
					</div>
					<p className="text-sm text-gray-600 mb-3">Overall Health Score</p>
					<Progress value={health.score} className="h-3" />
				</div>

				{/* Last Checked */}
				{health.lastChecked && (
					<div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
						<Clock className="h-4 w-4" />
						<span>Last checked: {formatLastChecked(health.lastChecked)}</span>
					</div>
				)}

				{/* Health Checks */}
				{health.checks && health.checks.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							Health Checks ({health.checks.length})
						</h4>
						<div className="space-y-3">
							{health.checks.map((check, index) => (
								<div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
									{getStatusIcon(check.status)}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<h5 className="text-sm font-medium text-gray-900">{check.name}</h5>
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium">{check.value}</span>
												<span className="text-xs text-gray-500">/ {check.threshold}</span>
											</div>
										</div>
										<p className={`text-xs mt-1 ${getStatusColor(check.status)}`}>
											{check.message}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Recommendations */}
				{health.recommendations && health.recommendations.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
							<Lightbulb className="h-4 w-4 mr-2" />
							Recommendations ({health.recommendations.length})
						</h4>
						<div className="space-y-2">
							{health.recommendations.slice(0, 3).map((recommendation, index) => (
								<Alert key={index} className="py-2">
									<Lightbulb className="h-4 w-4" />
									<AlertDescription className="text-sm">{recommendation}</AlertDescription>
								</Alert>
							))}
							{health.recommendations.length > 3 && (
								<p className="text-xs text-gray-500 text-center mt-2">
									+{health.recommendations.length - 3} more recommendations
								</p>
							)}
						</div>
					</div>
				)}

				{/* Quick Stats */}
				{health.checks && (
					<div className="grid grid-cols-3 gap-4 pt-4 border-t">
						<div className="text-center">
							<div className="text-lg font-semibold text-green-600">
								{health.checks.filter((c) => c.status === 'pass').length}
							</div>
							<p className="text-xs text-gray-600">Passing</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-yellow-600">
								{health.checks.filter((c) => c.status === 'warn').length}
							</div>
							<p className="text-xs text-gray-600">Warnings</p>
						</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-red-600">
								{health.checks.filter((c) => c.status === 'fail').length}
							</div>
							<p className="text-xs text-gray-600">Failures</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
