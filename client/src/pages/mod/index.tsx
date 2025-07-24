import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Badge } from '@app/components/ui/badge';
import { Avatar, AvatarFallback } from '@app/components/ui/avatar';
import {
	BarChart,
	Flag,
	MessageSquare,
	Users,
	AlertTriangle,
	CheckCircle,
	Eye,
	Clock,
	Ban
} from 'lucide-react';

// Mock data for development
const recentReports = [
	{
		id: crypto.randomUUID(),
		type: 'thread',
		title: 'Inappropriate content in trading advice',
		reporter: 'michael95',
		reportedUser: 'cryptoking',
		status: 'pending',
		time: '30 minutes ago'
	},
	{
		id: crypto.randomUUID(),
		type: 'post',
		title: 'Spam links in NFT discussion',
		reporter: 'artlover',
		reportedUser: 'nftdealer',
		status: 'pending',
		time: '2 hours ago'
	},
	{
		id: crypto.randomUUID(),
		type: 'user',
		title: 'Multiple accounts for same user',
		reporter: 'securityfirst',
		reportedUser: 'multiperson',
		status: 'resolved',
		time: '1 day ago'
	},
	{
		id: crypto.randomUUID(),
		type: 'post',
		title: 'Offensive language',
		reporter: 'community_lead',
		reportedUser: 'angryuser',
		status: 'resolved',
		time: '2 days ago'
	}
];

const recentActivity = [
	{
		id: crypto.randomUUID(),
		action: 'User Warned',
		user: 'traderguy',
		moderator: 'admin',
		time: '15 minutes ago',
		details: 'Multiple promotional posts'
	},
	{
		id: crypto.randomUUID(),
		action: 'Post Deleted',
		user: 'cryptowhale',
		moderator: 'admin',
		time: '45 minutes ago',
		details: 'Rule violation in DeFi thread'
	},
	{
		id: crypto.randomUUID(),
		action: 'Thread Locked',
		user: 'tokenmaster',
		moderator: 'moderator2',
		time: '3 hours ago',
		details: 'Heated argument in price prediction thread'
	},
	{
		id: crypto.randomUUID(),
		action: 'User Banned',
		user: 'scammer123',
		moderator: 'moderator1',
		time: '1 day ago',
		details: 'Attempting to phish users'
	}
];

export default function ModDashboardPage() {
	return (
		<>
			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Reports Pending</CardTitle>
						<Flag className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">8</div>
						<p className="text-xs text-zinc-500">+2 since yesterday</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Posts Reviewed</CardTitle>
						<MessageSquare className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">345</div>
						<p className="text-xs text-zinc-500">+24 since yesterday</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Users</CardTitle>
						<Users className="h-4 w-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">1,294</div>
						<p className="text-xs text-zinc-500">+15% from last week</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
						<Clock className="h-4 w-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">2.4h</div>
						<p className="text-xs text-zinc-500">-30min from last week</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="reports" className="w-full">
				<TabsList className="grid grid-cols-3 mb-6">
					<TabsTrigger value="reports">Reports Queue</TabsTrigger>
					<TabsTrigger value="activity">Mod Activity</TabsTrigger>
					<TabsTrigger value="overview">Stats Overview</TabsTrigger>
				</TabsList>

				{/* Reports Queue Tab */}
				<TabsContent value="reports">
					<Card>
						<CardHeader>
							<CardTitle>Recent Reports</CardTitle>
							<CardDescription>Review and take action on user-submitted reports</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentReports.map((report) => (
									<div
										key={report.id}
										className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg"
									>
										<div className="flex items-start space-x-4">
											<div
												className={`p-2 rounded-full ${report.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}
											>
												{report.status === 'pending' ? (
													<AlertTriangle className="h-5 w-5" />
												) : (
													<CheckCircle className="h-5 w-5" />
												)}
											</div>
											<div>
												<div className="font-medium">{report.title}</div>
												<div className="text-sm text-zinc-400">
													<span className="capitalize">{report.type}</span> reported by{' '}
													<span className="text-primary">{report.reporter}</span> against{' '}
													<span className="text-red-400">{report.reportedUser}</span>
												</div>
												<div className="text-xs text-zinc-500 mt-1">{report.time}</div>
											</div>
										</div>

										<div className="flex items-center space-x-2">
											<Badge
												className={
													report.status === 'pending'
														? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
														: 'bg-emerald-500/20 text-emerald-500'
												}
											>
												{report.status === 'pending' ? 'Pending' : 'Resolved'}
											</Badge>

											{report.status === 'pending' && (
												<div className="flex space-x-1">
													<Button
														size="sm"
														variant="outline"
														className="h-8 border-zinc-800 hover:bg-zinc-800"
													>
														<Eye className="h-3.5 w-3.5 mr-1" />
														View
													</Button>
													<Button size="sm" variant="destructive" className="h-8">
														<Ban className="h-3.5 w-3.5 mr-1" />
														Action
													</Button>
												</div>
											)}
										</div>
									</div>
								))}

								<div className="text-center mt-4">
									<Button variant="outline" className="border-zinc-800">
										View All Reports
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Mod Activity Tab */}
				<TabsContent value="activity">
					<Card>
						<CardHeader>
							<CardTitle>Recent Moderation Activity</CardTitle>
							<CardDescription>Actions taken by the moderation team</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentActivity.map((activity) => (
									<div
										key={activity.id}
										className="flex items-start justify-between p-4 border border-zinc-800 rounded-lg"
									>
										<div className="flex items-start space-x-4">
											<Avatar className="h-10 w-10">
												<AvatarFallback className="bg-primary/20 text-primary">
													{activity.moderator.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">{activity.action}</div>
												<div className="text-sm text-zinc-400">
													User <span className="text-red-400">{activity.user}</span> - actioned by{' '}
													<span className="text-primary">{activity.moderator}</span>
												</div>
												<div className="text-sm text-zinc-400 mt-1">{activity.details}</div>
												<div className="text-xs text-zinc-500 mt-1">{activity.time}</div>
											</div>
										</div>
									</div>
								))}

								<div className="text-center mt-4">
									<Button variant="outline" className="border-zinc-800">
										View Full Activity Log
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Stats Overview Tab */}
				<TabsContent value="overview">
					<Card>
						<CardHeader>
							<CardTitle>Community Overview</CardTitle>
							<CardDescription>Platform activity and moderation statistics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-72 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg mb-6">
								<div className="flex flex-col items-center text-zinc-500">
									<BarChart className="h-10 w-10 mb-2" />
									<div>Analytics charts will appear here</div>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="border border-zinc-800 rounded-lg p-4">
									<div className="text-sm font-medium mb-2">Report Resolution</div>
									<div className="text-2xl font-bold">94%</div>
									<div className="text-xs text-zinc-500">Reports resolved within 24h</div>
								</div>

								<div className="border border-zinc-800 rounded-lg p-4">
									<div className="text-sm font-medium mb-2">New Threads</div>
									<div className="text-2xl font-bold">87</div>
									<div className="text-xs text-zinc-500">Created in the last 24h</div>
								</div>

								<div className="border border-zinc-800 rounded-lg p-4">
									<div className="text-sm font-medium mb-2">User Warnings</div>
									<div className="text-2xl font-bold">12</div>
									<div className="text-xs text-zinc-500">Issued in the last 24h</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Quick Actions */}
			<div className="mt-6">
				<h2 className="text-lg font-medium mb-4">Quick Actions</h2>
				<div className="grid gap-4 md:grid-cols-4">
					<Button variant="outline" className="justify-start border-zinc-800 h-auto py-4">
						<div className="flex flex-col items-start">
							<div className="flex items-center">
								<Flag className="h-4 w-4 mr-2 text-red-500" />
								<span>View Reports</span>
							</div>
							<span className="text-xs text-zinc-500 mt-1">Manage reported content</span>
						</div>
					</Button>

					<Button variant="outline" className="justify-start border-zinc-800 h-auto py-4">
						<div className="flex flex-col items-start">
							<div className="flex items-center">
								<MessageSquare className="h-4 w-4 mr-2 text-primary" />
								<span>Shoutbox Mod</span>
							</div>
							<span className="text-xs text-zinc-500 mt-1">Moderate chat messages</span>
						</div>
					</Button>

					<Button variant="outline" className="justify-start border-zinc-800 h-auto py-4">
						<div className="flex flex-col items-start">
							<div className="flex items-center">
								<Users className="h-4 w-4 mr-2 text-emerald-500" />
								<span>User Management</span>
							</div>
							<span className="text-xs text-zinc-500 mt-1">Review user profiles</span>
						</div>
					</Button>

					<Button variant="outline" className="justify-start border-zinc-800 h-auto py-4">
						<div className="flex flex-col items-start">
							<div className="flex items-center">
								<Ban className="h-4 w-4 mr-2 text-amber-500" />
								<span>Ban Management</span>
							</div>
							<span className="text-xs text-zinc-500 mt-1">Review and manage bans</span>
						</div>
					</Button>
				</div>
			</div>
		</>
	);
}
