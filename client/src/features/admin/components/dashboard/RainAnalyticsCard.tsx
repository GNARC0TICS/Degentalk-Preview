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
import type { UserId } from '@db/types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface RainAnalyticsCardProps {
	className?: string;
}

// Define types for API response
interface RainAnalytics {
	totalRainEvents: number;
	totalRainVolume: number;
	uniqueRainers: number;
	averageRainAmount: number;
	lastUpdated: string;
	dailyVolume: Array<{
		date: string;
		amount: number;
		eventCount: number;
	}>;
	currencyDistribution: Array<{
		currency: string;
		amount: number;
		percentage: number;
	}>;
	topRainers: Array<{
		userId: UserId;
		username: string;
		avatarUrl?: string;
		totalAmount: number;
		eventCount: number;
	}>;
}

const RainAnalyticsCard: React.FC<RainAnalyticsCardProps> = ({ className }) => {
	const [timeRange, setTimeRange] = useState<string>('30');

	// Fetch rain analytics data
	const { data, isLoading, error } = useQuery({
		queryKey: ['admin', 'analytics', 'rain', timeRange],
		queryFn: async () => {
			return apiRequest<RainAnalytics>({
				url: '/admin/analytics/engagement/rain',
				params: {
					days: timeRange,
					topLimit: '10'
				}
			});
		},
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
						<CardTitle>Rain Analytics</CardTitle>
						<CardDescription>Activity metrics for the rain feature</CardDescription>
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
						<p>Error loading rain analytics data. Please try again later.</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Total Events</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.totalRainEvents)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Total Volume</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.totalRainVolume)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Unique Rainers</p>
								<h3 className="text-2xl font-bold">{formatNumber(data.uniqueRainers)}</h3>
							</div>
							<div className="rounded-lg border p-3">
								<p className="text-sm text-muted-foreground">Avg Amount</p>
								<h3 className="text-2xl font-bold">
									{formatNumber(Math.round(data.averageRainAmount))}
								</h3>
							</div>
						</div>

						<Tabs defaultValue="volume">
							<TabsList className="mb-4">
								<TabsTrigger value="volume">Daily Volume</TabsTrigger>
								<TabsTrigger value="distribution">Currency Distribution</TabsTrigger>
								<TabsTrigger value="topRainers">Top Rainers</TabsTrigger>
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
										<Bar dataKey="amount" name="Rain Amount" fill="#0088FE" />
										<Bar dataKey="eventCount" name="Event Count" fill="#00C49F" />
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

							<TabsContent value="topRainers">
								<div className="h-[300px] overflow-auto">
									<table className="w-full">
										<thead className="sticky top-0 bg-background">
											<tr>
												<th className="text-left p-2">User</th>
												<th className="text-right p-2">Total Amount</th>
												<th className="text-right p-2">Events</th>
											</tr>
										</thead>
										<tbody>
											{data.topRainers.map((user) => (
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
													<td className="text-right p-2">{user.eventCount}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</TabsContent>
						</Tabs>
					</>
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

export default RainAnalyticsCard;
