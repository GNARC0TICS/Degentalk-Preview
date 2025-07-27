import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, FileText, TrendingUp, Award, Flame, BarChart } from 'lucide-react';

interface PlatformStatsWidgetProps {
	showHeader?: boolean;
	className?: string;
}

export function PlatformStatsWidget({
	showHeader = true,
	className = ''
}: PlatformStatsWidgetProps) {
	const {
		data: stats,
		isLoading,
		error
	} = useQuery({
		queryKey: ['/api/platform-stats'],
		queryFn: async () => {
			const response = await fetch('/api/platform-stats');
			if (!response.ok) {
				throw new Error('Failed to fetch platform statistics');
			}
			return response.json();
		}
	});

	const formatNumber = (num: number | string) => {
		const parsed = typeof num === 'string' ? parseInt(num, 10) : num;
		if (isNaN(parsed)) return '0';

		if (parsed >= 1000000) {
			return `${(parsed / 1000000).toFixed(1)}M`;
		} else if (parsed >= 1000) {
			return `${(parsed / 1000).toFixed(1)}K`;
		}
		return parsed.toString();
	};

	if (isLoading) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Platform Statistics</CardTitle>
						<CardDescription>Key metrics from across the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="flex flex-col items-center p-4 bg-background rounded-lg border"
							>
								<Skeleton className="h-8 w-8 rounded-full mb-3" />
								<Skeleton className="h-7 w-16 mb-1" />
								<Skeleton className="h-4 w-24" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Platform Statistics</CardTitle>
						<CardDescription>Key metrics from across the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">
						Failed to load platform statistics. Please try again later.
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!stats) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Platform Statistics</CardTitle>
						<CardDescription>Key metrics from across the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">No statistics available yet.</div>
				</CardContent>
			</Card>
		);
	}

	const statItems = [
		{
			title: 'Total Users',
			value: formatNumber(stats.total_users || 0),
			icon: <Users className="h-6 w-6 text-blue-500" />,
			description: 'Community members'
		},
		{
			title: 'Total Threads',
			value: formatNumber(stats.total_threads || 0),
			icon: <FileText className="h-6 w-6 text-violet-500" />,
			description: 'Discussion threads'
		},
		{
			title: 'Total Posts',
			value: formatNumber(stats.total_posts || 0),
			icon: <MessageSquare className="h-6 w-6 text-green-500" />,
			description: 'Posts & replies'
		},
		{
			title: 'Active Today',
			value: formatNumber(stats.active_users_today || 0),
			icon: <Flame className="h-6 w-6 text-orange-500" />,
			description: 'Users online today'
		},
		{
			title: 'Weekly XP',
			value: formatNumber(stats.weekly_xp_total || 0),
			icon: <Award className="h-6 w-6 text-yellow-500" />,
			description: 'XP earned this week'
		},
		{
			title: 'Popular Path',
			value: stats.most_popular_path || 'None',
			icon: <TrendingUp className="h-6 w-6 text-pink-500" />,
			description: 'Top path this week'
		}
	];

	return (
		<Card className={className}>
			{showHeader && (
				<CardHeader>
					<div className="flex items-center">
						<BarChart className="h-5 w-5 mr-2 text-primary" />
						<div>
							<CardTitle>Platform Statistics</CardTitle>
							<CardDescription>Key metrics from across the community</CardDescription>
						</div>
					</div>
				</CardHeader>
			)}
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{statItems.map((item, index) => (
						<div
							key={index}
							className="flex flex-col items-center p-4 bg-accent/30 rounded-lg border shadow-sm"
						>
							<div className="p-2 rounded-full bg-background mb-3 border">{item.icon}</div>
							<div className="font-bold text-xl mb-1">{item.value}</div>
							<div className="text-center">
								<div className="text-sm font-medium">{item.title}</div>
								<div className="text-xs text-muted-foreground">{item.description}</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
