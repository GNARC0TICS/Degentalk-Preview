import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserId } from '@shared/types/ids';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { apiRequest } from '@/utils/queryClient';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface TippingAnalyticsCardProps {
	className?: string;
}

// Define the TippingAnalytics type for API response
interface TippingAnalytics {
	totalTips: number;
	totalTipVolume: number;
	uniqueTippers: number;
	averageTipAmount: number;
	dailyVolume: Array<{
		date: string;
		amount: number;
		tipCount: number;
	}>;
	currencyDistribution: Array<{
		currency: string;
		amount: number;
		percentage: number;
	}>;
	contextDistribution: Array<{
		context: string;
		tipCount: number;
		percentage: number;
	}>;
	topTippers: Array<{
		userId: UserId;
		username: string;
		avatarUrl?: string;
		totalAmount: number;
		tipCount: number;
	}>;
	topRecipients: Array<{
		userId: UserId;
		username: string;
		avatarUrl?: string;
		totalReceived: number;
		tipCount: number;
	}>;
	lastUpdated: string;
}

const TippingAnalyticsCard: React.FC<TippingAnalyticsCardProps> = ({ className }) => {
	const [timeRange, setTimeRange] = useState<string>('30');

	// Fetch tipping analytics data
	const { data, isLoading, error } = useQuery({
		queryKey: ['admin', 'analytics', 'tipping', timeRange],
		queryFn: () =>
			apiRequest<TippingAnalytics>({
				url: '/api/admin/analytics/engagement/tips',
				method: 'GET',
				params: { days: timeRange, topLimit: '10' }
			}),
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Handle time range change
	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value);
	};

	// Format large numbers
	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		} else if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	// Format currency with symbol
	const formatCurrency = (value: number, currency: string) => {
		if (currency === 'DGT') {
			return `${formatNumber(value)} DGT`;
		} else if (currency === 'USDT') {
			return `$${formatNumber(value)}`;
		}
		return `${formatNumber(value)} ${currency}`;
	};

	return (
		<Card className={className}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tipping Analytics</CardTitle>
						<CardDescription>Activity metrics for user-to-user tipping</CardDescription>
					</div>
					<Select value={timeRange} onValueChange={handleTimeRangeChange}>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Time Range" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">7 days</SelectItem>
							<SelectItem value="30">30 days</SelectItem>
							<SelectItem value="90">90 days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-[200px] w-full" />
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</div>
					</div>
				) : error ? (
					<div className="flex h-[300px] items-center justify-center text-center text-red-500">
						<p>Error loading tipping analytics data. Please try again later.</p>
					</div>
				) : data ? (
					<>
						<div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Total Tips</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.totalTips)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Total Volume</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.totalTipVolume)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Unique Tippers</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.uniqueTippers)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Avg Tip Amount</p>
								<h3 className="text-2xl font-bold">
									{formatNumber(Math.round(data.averageTipAmount))}
								</h3>
							</div>
						</div>

						<Tabs defaultValue="volume">
							<TabsList className="mb-4">
								<TabsTrigger value="volume">Daily Volume</TabsTrigger>
								<TabsTrigger value="distribution">Currency Distribution</TabsTrigger>
								<TabsTrigger value="context">Tip Context</TabsTrigger>
								<TabsTrigger value="topUsers">Top Users</TabsTrigger>
							</TabsList>

							<TabsContent value="volume" className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={data.dailyVolume}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickFormatter={(value) => format(new Date(value), 'MMM d')}
										/>
										<YAxis />
										<Tooltip
											formatter={(value: number) => [formatNumber(value), 'Amount']}
											labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
										/>
										<Legend />
										<Bar dataKey="amount" name="Tip Amount" fill="#0088FE" />
										<Bar dataKey="tipCount" name="Tip Count" fill="#00C49F" />
									</BarChart>
								</ResponsiveContainer>
							</TabsContent>

							<TabsContent value="distribution" className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={data.currencyDistribution}
											cx="50%"
											cy="50%"
											labelLine={true}
											label={({ currency, percentage }) => `${currency}: ${percentage.toFixed(1)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="amount"
											nameKey="currency"
										>
											{data.currencyDistribution.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip
											formatter={(value: number, name, props) => [
												formatCurrency(value, props.payload.currency),
												props.payload.currency
											]}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</TabsContent>

							<TabsContent value="context" className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={data.contextDistribution}
											cx="50%"
											cy="50%"
											labelLine={true}
											label={({ context, percentage }) => `${context}: ${percentage.toFixed(1)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="tipCount"
											nameKey="context"
										>
											{data.contextDistribution.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip formatter={(value: number) => [`${value} tips`, 'Count']} />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</TabsContent>

							<TabsContent value="topUsers">
								<Tabs defaultValue="tippers" className="mt-4">
									<TabsList>
										<TabsTrigger value="tippers">Top Tippers</TabsTrigger>
										<TabsTrigger value="recipients">Top Recipients</TabsTrigger>
									</TabsList>

									<TabsContent value="tippers">
										<div className="h-[250px] overflow-auto">
											<table className="w-full">
												<thead className="sticky top-0 bg-background">
													<tr>
														<th className="text-left p-2">User</th>
														<th className="text-right p-2">Total Amount</th>
														<th className="text-right p-2">Tips Sent</th>
													</tr>
												</thead>
												<tbody>
													{data.topTippers.map((user) => (
														<tr key={user.userId} className="hover:bg-muted/50">
															<td className="p-2">
																<div className="flex items-center">
																	{user.avatarUrl && (
																		<img
																			src={user.avatarUrl}
																			alt={user.username}
																			className="w-8 h-8 rounded-full mr-2"
																		/>
																	)}
																	<span>{user.username}</span>
																</div>
															</td>
															<td className="text-right p-2">{formatNumber(user.totalAmount)}</td>
															<td className="text-right p-2">{user.tipCount}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</TabsContent>

									<TabsContent value="recipients">
										<div className="h-[250px] overflow-auto">
											<table className="w-full">
												<thead className="sticky top-0 bg-background">
													<tr>
														<th className="text-left p-2">User</th>
														<th className="text-right p-2">Total Received</th>
														<th className="text-right p-2">Tips Received</th>
													</tr>
												</thead>
												<tbody>
													{data.topRecipients.map((user) => (
														<tr key={user.userId} className="hover:bg-muted/50">
															<td className="p-2">
																<div className="flex items-center">
																	{user.avatarUrl && (
																		<img
																			src={user.avatarUrl}
																			alt={user.username}
																			className="w-8 h-8 rounded-full mr-2"
																		/>
																	)}
																	<span>{user.username}</span>
																</div>
															</td>
															<td className="text-right p-2">{formatNumber(user.totalReceived)}</td>
															<td className="text-right p-2">{user.tipCount}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</TabsContent>
								</Tabs>
							</TabsContent>
						</Tabs>
					</>
				) : (
					<div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
						<p>No tipping analytics data available.</p>
					</div>
				)}
			</CardContent>
			<CardFooter className="text-xs text-muted-foreground">
				{data ? (
					<p>Last updated: {format(new Date(data.lastUpdated), 'MMM d, yyyy h:mm a')}</p>
				) : (
					<p>Loading update information...</p>
				)}
			</CardFooter>
		</Card>
	);
};

export default TippingAnalyticsCard;
