/**
 * Database Statistics Card
 *
 * Displays database performance metrics and query analysis
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Activity, HardDrive, Hash, Clock } from 'lucide-react';
import type { SystemMetrics } from '@/features/admin/api/system-analytics.api';

interface DatabaseStatsCardProps {
	database: SystemMetrics['database'];
}

export function DatabaseStatsCard({ database }: DatabaseStatsCardProps) {
	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	const getConnectionColor = (connections: number) => {
		if (connections < 30) return 'text-green-600';
		if (connections < 60) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getQueryTimeColor = (time: number) => {
		if (time < 50) return 'text-green-600';
		if (time < 100) return 'text-yellow-600';
		return 'text-red-600';
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Database className="h-5 w-5" />
					<span>Database Statistics</span>
				</CardTitle>
				<CardDescription>Database performance metrics and query analysis</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Key Metrics */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<div className="text-center">
						<div className={`text-2xl font-bold ${getConnectionColor(database.connectionCount)}`}>
							{database.connectionCount}
						</div>
						<p className="text-sm text-gray-600">Active Connections</p>
						<div className="mt-2">
							<Progress value={(database.connectionCount / 100) * 100} className="h-2" />
							<p className="text-xs text-gray-500 mt-1">/ 100 max</p>
						</div>
					</div>
					<div className="text-center">
						<div
							className={`text-2xl font-bold ${getQueryTimeColor(database.queryPerformance.averageTime)}`}
						>
							{database.queryPerformance.averageTime.toFixed(1)}ms
						</div>
						<p className="text-sm text-gray-600">Avg Query Time</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<Clock className="h-3 w-3" />
							<span className="text-xs text-gray-500">Last 24h</span>
						</div>
					</div>
					<div className="text-center md:col-span-1 col-span-2">
						<div className="text-2xl font-bold text-blue-600">{database.tableStats.length}</div>
						<p className="text-sm text-gray-600">Tables Monitored</p>
						<div className="mt-2 flex items-center justify-center space-x-1">
							<HardDrive className="h-3 w-3 text-blue-500" />
							<span className="text-xs text-blue-500">Active</span>
						</div>
					</div>
				</div>

				{/* Query Performance */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<Activity className="h-4 w-4 mr-2" />
						Slowest Queries
					</h4>
					<div className="space-y-3">
						{database.queryPerformance.slowestQueries.map((query, index) => (
							<div key={index} className="p-3 bg-gray-50 rounded-lg">
								<div className="flex justify-between items-start mb-2">
									<code className="text-xs bg-white px-2 py-1 rounded text-gray-800 flex-1 mr-4">
										{query.query.length > 60 ? `${query.query.substring(0, 60)}...` : query.query}
									</code>
									<Badge variant="outline" className="text-xs">
										{formatNumber(query.count)} calls
									</Badge>
								</div>
								<div className="flex justify-between items-center">
									<span className={`text-sm font-medium ${getQueryTimeColor(query.avgTime)}`}>
										{query.avgTime.toFixed(1)}ms avg
									</span>
									<div className="flex-1 mx-3">
										<Progress value={Math.min((query.avgTime / 200) * 100, 100)} className="h-2" />
									</div>
									<span className="text-xs text-gray-500">
										{((query.avgTime * query.count) / 1000).toFixed(1)}s total
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Table Statistics */}
				<div>
					<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
						<HardDrive className="h-4 w-4 mr-2" />
						Table Statistics
					</h4>
					<div className="space-y-2">
						{database.tableStats.map((table, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div className="flex items-center space-x-3">
									<div className="flex items-center space-x-2">
										<Database className="h-4 w-4 text-blue-500" />
										<span className="font-medium text-sm">{table.tableName}</span>
									</div>
									<Badge variant="outline" className="text-xs">
										{formatNumber(table.rowCount)} rows
									</Badge>
								</div>
								<div className="flex items-center space-x-4 text-sm text-gray-600">
									<div className="flex items-center space-x-1">
										<HardDrive className="h-3 w-3" />
										<span>{table.size}</span>
									</div>
									<div className="flex items-center space-x-1">
										<Hash className="h-3 w-3" />
										<span>{table.indexes} idx</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Performance Summary */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
					<div className="text-center">
						<div className="text-lg font-semibold text-green-600">
							{database.tableStats.reduce((sum, table) => sum + table.rowCount, 0).toLocaleString()}
						</div>
						<p className="text-xs text-gray-600">Total Rows</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-blue-600">
							{database.tableStats.reduce((sum, table) => sum + table.indexes, 0)}
						</div>
						<p className="text-xs text-gray-600">Total Indexes</p>
					</div>
					<div className="text-center">
						<div className="text-lg font-semibold text-purple-600">
							{database.tableStats.length > 0
								? (
										database.tableStats.reduce((sum, table) => sum + table.indexes, 0) /
										database.tableStats.length
									).toFixed(1)
								: '0'}
						</div>
						<p className="text-xs text-gray-600">Avg Indexes/Table</p>
					</div>
				</div>

				{/* Replication Status */}
				{database.replicationLag !== undefined && (
					<div className="bg-blue-50 p-3 rounded-lg">
						<h5 className="text-sm font-medium text-blue-900 mb-1">Replication Status</h5>
						<p className="text-xs text-blue-800">Replication lag: {database.replicationLag}ms</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
