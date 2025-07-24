/**
 * System Alerts Card
 *
 * Displays active system alerts and warnings
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { AlertTriangle, XCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import type { SystemOverview } from '@app/features/admin/api/system-analytics.api';

interface SystemAlertsCardProps {
	alerts: SystemOverview['alerts'];
}

export function SystemAlertsCard({ alerts }: SystemAlertsCardProps) {
	const getSeverityIcon = (severity: 'critical' | 'warning') => {
		switch (severity) {
			case 'critical':
				return <XCircle className="h-5 w-5 text-red-500" />;
			case 'warning':
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			default:
				return <AlertTriangle className="h-5 w-5 text-gray-500" />;
		}
	};

	const getSeverityColor = (severity: 'critical' | 'warning') => {
		switch (severity) {
			case 'critical':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'warning':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getAlertVariant = (severity: 'critical' | 'warning') => {
		switch (severity) {
			case 'critical':
				return 'destructive' as const;
			case 'warning':
				return 'default' as const;
			default:
				return 'default' as const;
		}
	};

	const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical');
	const warningAlerts = alerts.filter((alert) => alert.severity === 'warning');

	if (alerts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<CheckCircle className="h-5 w-5 text-green-500" />
						<span>System Alerts</span>
						<Badge className="bg-green-100 text-green-800 border-green-200 ml-auto">
							All Clear
						</Badge>
					</CardTitle>
					<CardDescription>No active system alerts or warnings</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-green-800 mb-2">All Systems Operational</h3>
						<p className="text-sm text-green-600">
							No alerts detected. All system metrics are within normal parameters.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<AlertTriangle className="h-5 w-5 text-yellow-500" />
					<span>System Alerts</span>
					<Badge variant="outline" className="ml-auto">
						{alerts.length} Active
					</Badge>
				</CardTitle>
				<CardDescription>Active system alerts and warnings requiring attention</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Alert Summary */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
						<p className="text-sm text-gray-600">Critical Alerts</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<XCircle className="h-3 w-3 text-red-500" />
							<span className="text-xs text-red-500">Immediate Action Required</span>
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
						<p className="text-sm text-gray-600">Warning Alerts</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<AlertTriangle className="h-3 w-3 text-yellow-500" />
							<span className="text-xs text-yellow-500">Monitor Closely</span>
						</div>
					</div>
					<div className="text-center md:col-span-1 col-span-2">
						<div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
						<p className="text-sm text-gray-600">Total Alerts</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<Activity className="h-3 w-3 text-blue-500" />
							<span className="text-xs text-blue-500">Active Monitoring</span>
						</div>
					</div>
				</div>

				{/* Critical Alerts */}
				{criticalAlerts.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
							<XCircle className="h-4 w-4 mr-2" />
							Critical Alerts ({criticalAlerts.length})
						</h4>
						<div className="space-y-3">
							{criticalAlerts.map((alert, index) => (
								<Alert key={index} variant={getAlertVariant(alert.severity)}>
									{getSeverityIcon(alert.severity)}
									<div className="ml-2">
										<div className="flex items-center justify-between mb-1">
											<h5 className="text-sm font-medium">{alert.metric}</h5>
											<Badge className={getSeverityColor(alert.severity)}>
												{alert.severity.toUpperCase()}
											</Badge>
										</div>
										<AlertDescription className="text-sm">{alert.message}</AlertDescription>
										<div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
											<div className="flex items-center space-x-1">
												<Activity className="h-3 w-3" />
												<span>Current: {alert.value}</span>
											</div>
											<div className="flex items-center space-x-1">
												<Clock className="h-3 w-3" />
												<span>Active now</span>
											</div>
										</div>
									</div>
								</Alert>
							))}
						</div>
					</div>
				)}

				{/* Warning Alerts */}
				{warningAlerts.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center">
							<AlertTriangle className="h-4 w-4 mr-2" />
							Warning Alerts ({warningAlerts.length})
						</h4>
						<div className="space-y-3">
							{warningAlerts.map((alert, index) => (
								<Alert key={index} variant={getAlertVariant(alert.severity)}>
									{getSeverityIcon(alert.severity)}
									<div className="ml-2">
										<div className="flex items-center justify-between mb-1">
											<h5 className="text-sm font-medium">{alert.metric}</h5>
											<Badge className={getSeverityColor(alert.severity)}>
												{alert.severity.toUpperCase()}
											</Badge>
										</div>
										<AlertDescription className="text-sm">{alert.message}</AlertDescription>
										<div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
											<div className="flex items-center space-x-1">
												<Activity className="h-3 w-3" />
												<span>Current: {alert.value}</span>
											</div>
											<div className="flex items-center space-x-1">
												<Clock className="h-3 w-3" />
												<span>Active now</span>
											</div>
										</div>
									</div>
								</Alert>
							))}
						</div>
					</div>
				)}

				{/* Alert Management Actions */}
				<div className="bg-blue-50 p-4 rounded-lg">
					<h5 className="text-sm font-medium text-blue-900 mb-2">Alert Management</h5>
					<div className="text-xs text-blue-800 space-y-1">
						<p>• Critical alerts require immediate attention to prevent system degradation</p>
						<p>• Warning alerts should be monitored and addressed during maintenance windows</p>
						<p>• Alerts are automatically resolved when metrics return to normal thresholds</p>
						<p>• Use the refresh button to update alert status in real-time</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="flex flex-wrap gap-2 pt-4 border-t">
					<Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
						View System Health
					</Badge>
					<Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
						Check Performance Metrics
					</Badge>
					<Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
						Review Cache Status
					</Badge>
					<Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
						Database Diagnostics
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
