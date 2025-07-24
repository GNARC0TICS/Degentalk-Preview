import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Skeleton } from '@app/components/ui/skeleton';
import { Badge } from '@app/components/ui/badge';
import { getInitials } from '@app/utils/utils';
import { Award, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import type { UserId } from '@shared/types/ids';

export type LeaderboardUser = {
	id: UserId;
	username: string;
	avatarUrl?: string;
	weeklyXpGain?: number;
	weeklyPostCount?: number;
};

interface WeeklyLeaderboardProps {
	showHeader?: boolean;
	className?: string;
}

export function WeeklyLeaderboard({ showHeader = true, className = '' }: WeeklyLeaderboardProps) {
	const [activeTab, setActiveTab] = useState<string>('xp');
	const [viewCurrent, setViewCurrent] = useState<boolean>(true);

	const {
		data: leaderboard,
		isLoading,
		error
	} = useQuery<LeaderboardUser[]>({
		queryKey: ['/api/leaderboards', activeTab, viewCurrent],
		queryFn: async () => {
			const response = await fetch(`/api/leaderboards/${activeTab}?current=${viewCurrent}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${activeTab} leaderboard`);
			}
			return response.json();
		},
		placeholderData: [],
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Helper to determine rank medal color
	const getRankBadge = (index: number) => {
		switch (index) {
			case 0:
				return <Badge className="bg-amber-500 hover:bg-amber-500/90 text-white">1st</Badge>;
			case 1:
				return <Badge className="bg-gray-400 hover:bg-gray-400/90 text-white">2nd</Badge>;
			case 2:
				return <Badge className="bg-amber-700 hover:bg-amber-700/90 text-white">3rd</Badge>;
			default:
				return <Badge variant="outline">{index + 1}th</Badge>;
		}
	};

	// Get the correct metric value based on active tab
	const getMetricValue = (user: LeaderboardUser) => {
		switch (activeTab) {
			case 'xp':
				return user.weeklyXpGain || 0;
			case 'posts':
				return user.weeklyPostCount || 0;
			default:
				return 0;
		}
	};

	// Get the correct metric icon based on active tab
	const getMetricIcon = () => {
		switch (activeTab) {
			case 'xp':
				return <Award className="h-4 w-4" />;
			case 'posts':
				return <MessageSquare className="h-4 w-4" />;
			default:
				return <TrendingUp className="h-4 w-4" />;
		}
	};

	// Get the correct metric label based on active tab
	const getMetricLabel = () => {
		switch (activeTab) {
			case 'xp':
				return 'XP';
			case 'posts':
				return 'Posts';
			default:
				return 'Score';
		}
	};

	if (isLoading) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Weekly Leaderboards</CardTitle>
						<CardDescription>Top performers this week</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<Tabs defaultValue="xp" className="w-full">
						<TabsList className="w-full mb-4">
							<TabsTrigger value="xp" className="flex-1">
								XP Gains
							</TabsTrigger>
							<TabsTrigger value="posts" className="flex-1">
								Top Posters
							</TabsTrigger>
						</TabsList>

						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, index) => (
								<div key={index} className="flex items-center p-2 rounded-md border">
									<Skeleton className="w-8 h-6 mr-2" />
									<Skeleton className="h-10 w-10 rounded-full mr-3" />
									<div className="flex-1">
										<Skeleton className="h-5 w-24 mb-1" />
										<Skeleton className="h-4 w-16" />
									</div>
									<Skeleton className="h-6 w-12" />
								</div>
							))}
						</div>
					</Tabs>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Weekly Leaderboards</CardTitle>
						<CardDescription>Top performers this week</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">
						Failed to load leaderboard data. Please try again later.
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!leaderboard || leaderboard.length === 0) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Weekly Leaderboards</CardTitle>
						<CardDescription>Top performers this week</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="w-full mb-4">
							<TabsTrigger value="xp" className="flex-1">
								XP Gains
							</TabsTrigger>
							<TabsTrigger value="posts" className="flex-1">
								Top Posters
							</TabsTrigger>
						</TabsList>

						<div className="p-4 text-center text-muted-foreground">
							No leaderboard data available yet. Start participating to appear here!
						</div>
					</Tabs>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			{showHeader && (
				<CardHeader>
					<div className="flex items-center">
						<Award className="h-5 w-5 text-primary mr-2" />
						<div>
							<CardTitle>Weekly Leaderboards</CardTitle>
							<CardDescription>Top performers this week</CardDescription>
						</div>
					</div>
				</CardHeader>
			)}
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<div className="flex justify-between items-center mb-4">
						<TabsList>
							<TabsTrigger value="xp">XP Gains</TabsTrigger>
							<TabsTrigger value="posts">Top Posters</TabsTrigger>
						</TabsList>

						<div
							className="text-xs flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-foreground"
							onClick={() => setViewCurrent(!viewCurrent)}
						>
							<Clock className="h-3.5 w-3.5" />
							{viewCurrent ? 'Current Week' : 'Previous Week'}
						</div>
					</div>

					<div className="space-y-2">
						{leaderboard.slice(0, 10).map((user, index) => (
							<Link
								key={user.id}
								to={`/user/${user.id}`}
								className="flex items-center p-2 rounded-md hover:bg-accent transition-colors border"
							>
								<div className="w-8 mr-2 text-center">{getRankBadge(index)}</div>
								<Avatar className="h-10 w-10 mr-3">
									<AvatarImage src={user.avatarUrl || ''} alt={user.username} />
									<AvatarFallback>{getInitials(user.username)}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="font-medium">{user.username}</div>
									<div className="text-xs text-muted-foreground">
										{viewCurrent ? 'This Week' : 'Last Week'}
									</div>
								</div>
								<div className="flex items-center gap-1 font-semibold">
									<span>{getMetricValue(user)}</span>
									<span>{getMetricIcon()}</span>
								</div>
							</Link>
						))}
					</div>
				</Tabs>
			</CardContent>
		</Card>
	);
}
