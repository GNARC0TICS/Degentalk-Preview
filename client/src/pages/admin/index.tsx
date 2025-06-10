<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import {
	Activity,
	UserPlus,
	MessageSquare,
	MessageCircle,
	ShoppingCart,
	TrendingUp,
	CreditCard,
	Users,
	ShoppingBag,
	Calendar,
	ArrowUpRight,
	ArrowDownRight,
	Flag,
	Share2,
	Clock,
	User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboardPage() {
	// Fetch dashboard statistics from the backend
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['/api/admin/stats'],
		queryFn: async () => {
			const response = await fetch('/api/admin/stats');

			if (!response.ok) {
				throw new Error(`Failed to fetch statistics: ${response.statusText}`);
			}
=======
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  UserPlus,
  MessageSquare,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Users,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Flag,
  Share2,
  Clock,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "./admin-layout.tsx";

export default function AdminDashboardPage() {
  // Fetch dashboard statistics from the backend
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      return await response.json();
    }
  });

  // Fetch recent activity data from the backend
  const { data: activityData, isLoading: activityLoading } = useQuery<{
    newUsers: Array<{ id: number; username: string; email: string; createdAt: string }>;
    newThreads: Array<{ id: number; title: string; userId: number; createdAt: string; username: string }>;
    newPosts: Array<{ id: number; content: string; userId: number; threadId: number; createdAt: string; username: string; threadTitle: string }>;
  }>({
    queryKey: ['/api/admin/activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/activity');

      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      return await response.json();
    }
  });
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a

			return await response.json();
		}
	});

<<<<<<< HEAD
	// Fetch recent activity data from the backend
	const { data: activityData, isLoading: activityLoading } = useQuery<{
		newUsers: Array<{ id: number; username: string; email: string; createdAt: string }>;
		newThreads: Array<{
			id: number;
			title: string;
			userId: number;
			createdAt: string;
			username: string;
		}>;
		newPosts: Array<{
			id: number;
			content: string;
			userId: number;
			threadId: number;
			createdAt: string;
			username: string;
			threadTitle: string;
		}>;
	}>({
		queryKey: ['/api/admin/activity'],
		queryFn: async () => {
			const response = await fetch('/api/admin/activity');

			if (!response.ok) {
				throw new Error(`Failed to fetch activity: ${response.statusText}`);
			}

			return await response.json();
		}
	});

	// Map activity type to icon
	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'user':
				return <User className="h-4 w-4 text-blue-500" />;
			case 'post':
				return <MessageSquare className="h-4 w-4 text-green-500" />;
			case 'order':
				return <ShoppingCart className="h-4 w-4 text-amber-500" />;
			default:
				return <Activity className="h-4 w-4 text-gray-500" />;
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">Overview of your community platform.</p>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="flex w-full sm:w-auto overflow-x-auto no-scrollbar">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					{/* Key Stats */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Users</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? '...' : statsData?.userStats?.total || 0}
								</div>
								<p className="text-xs text-muted-foreground flex items-center space-x-1">
									<span className="text-green-500 flex items-center">
										<ArrowUpRight className="h-3 w-3 mr-1" />
										{statsLoading ? '...' : statsData?.userStats?.growth || 0}%
									</span>
									<span>from last month</span>
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Posts Today</CardTitle>
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? '...' : statsData?.postStats?.today || 0}
								</div>
								<p className="text-xs text-muted-foreground">
									{statsLoading ? '...' : statsData?.postStats?.total || 0} total posts
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Orders</CardTitle>
								<ShoppingCart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? '...' : statsData?.orderStats?.today || 0}
								</div>
								<p className="text-xs text-muted-foreground flex items-center space-x-1">
									<span
										className={
											statsData?.orderStats?.trend > 0
												? 'text-green-500 flex items-center'
												: 'text-red-500 flex items-center'
										}
									>
										{statsData?.orderStats?.trend > 0 ? (
											<ArrowUpRight className="h-3 w-3 mr-1" />
										) : (
											<ArrowDownRight className="h-3 w-3 mr-1" />
										)}
										{statsLoading ? '...' : Math.abs(statsData?.orderStats?.trend || 0)}%
									</span>
									<span>from yesterday</span>
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Revenue</CardTitle>
								<CreditCard className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? '...' : statsData?.revenueStats?.formatted || '$0.00'}
								</div>
								<p className="text-xs text-muted-foreground flex items-center space-x-1">
									<span className="text-green-500 flex items-center">
										<ArrowUpRight className="h-3 w-3 mr-1" />
										{statsLoading ? '...' : statsData?.revenueStats?.growth || 0}%
									</span>
									<span>from last month</span>
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>Latest actions across your platform</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-8">
								{activityLoading ? (
									<div className="text-center py-4">Loading activity...</div>
								) : !activityData ? (
									<div className="text-center py-4">No recent activity</div>
								) : (
									<>
										{/* New Users */}
										{activityData.newUsers?.map((user, index) => (
											<div key={`user-${user.id}`} className="flex items-start">
												<div className="mr-4 mt-0.5">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
														<User className="h-4 w-4 text-blue-500" />
													</div>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium leading-none">
														<span className="font-semibold">{user.username}</span> joined the
														community
													</p>
													<p className="text-sm text-muted-foreground flex items-center">
														<Clock className="h-3 w-3 mr-1" />{' '}
														{new Date(user.createdAt).toLocaleString()}
													</p>
												</div>
											</div>
										))}

										{/* New Threads */}
										{activityData.newThreads?.map((thread) => (
											<div key={`thread-${thread.id}`} className="flex items-start">
												<div className="mr-4 mt-0.5">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
														<MessageCircle className="h-4 w-4 text-green-500" />
													</div>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium leading-none">
														<span className="font-semibold">{thread.username}</span> created a new
														thread{' '}
														<span className="text-blue-600 hover:underline">{thread.title}</span>
													</p>
													<p className="text-sm text-muted-foreground flex items-center">
														<Clock className="h-3 w-3 mr-1" />{' '}
														{new Date(thread.createdAt).toLocaleString()}
													</p>
												</div>
											</div>
										))}

										{/* New Posts */}
										{activityData.newPosts?.map((post) => (
											<div key={`post-${post.id}`} className="flex items-start">
												<div className="mr-4 mt-0.5">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
														<MessageSquare className="h-4 w-4 text-amber-500" />
													</div>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium leading-none">
														<span className="font-semibold">{post.username}</span> replied in{' '}
														<span className="text-blue-600 hover:underline">
															{post.threadTitle}
														</span>
													</p>
													<p className="text-sm text-muted-foreground flex items-center">
														<Clock className="h-3 w-3 mr-1" />{' '}
														{new Date(post.createdAt).toLocaleString()}
													</p>
												</div>
											</div>
										))}
									</>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Forum Overview */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Top Threads</CardTitle>
								<CardDescription>Most active threads this week</CardDescription>
							</CardHeader>
							<CardContent>
								{statsLoading ? (
									<div className="text-center py-4">Loading top threads...</div>
								) : (
									<div className="space-y-4">
										{statsData?.topThreads?.map((thread: any, index: number) => (
											<div key={index} className="flex items-center">
												<div className="mr-4 text-muted-foreground">{index + 1}</div>
												<div className="space-y-1 flex-1">
													<p className="text-sm font-medium leading-none">{thread.title}</p>
													<div className="flex items-center text-xs text-muted-foreground">
														<MessageSquare className="h-3 w-3 mr-1" />
														<span className="mr-2">{thread.posts} posts</span>
														<Share2 className="h-3 w-3 mr-1" />
														<span>{thread.views} views</span>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Platform Health</CardTitle>
								<CardDescription>System performance and health metrics</CardDescription>
							</CardHeader>
							<CardContent>
								{statsLoading ? (
									<div className="text-center py-4">Loading health data...</div>
								) : (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div className="text-sm">Server Uptime</div>
											<div className="text-sm font-medium">{statsData?.health?.uptime}</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="text-sm">Response Time</div>
											<div className="text-sm font-medium">{statsData?.health?.responseTime}ms</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="text-sm">Active Sessions</div>
											<div className="text-sm font-medium">{statsData?.health?.activeSessions}</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="text-sm">Error Rate (24h)</div>
											<div className="text-sm font-medium">{statsData?.health?.errorRate}%</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="text-sm">Storage Used</div>
											<div className="text-sm font-medium">{statsData?.health?.storageUsed}</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Analytics Dashboard</CardTitle>
							<CardDescription>Detailed analytics coming soon.</CardDescription>
						</CardHeader>
						<CardContent className="h-[400px] flex items-center justify-center">
							<div className="text-center">
								<TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium">Analytics Dashboard</h3>
								<p className="text-sm text-muted-foreground max-w-md">
									Detailed analytics with charts and graphs will be available in a future update.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="reports" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Reports Dashboard</CardTitle>
							<CardDescription>Review and manage user reports.</CardDescription>
						</CardHeader>
						<CardContent className="h-[400px] flex items-center justify-center">
							<div className="text-center">
								<Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium">Reports Dashboard</h3>
								<p className="text-sm text-muted-foreground max-w-md">
									A comprehensive view of user reports, content flags, and moderation actions is
									coming soon.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Notifications Center</CardTitle>
							<CardDescription>Manage system and user notifications.</CardDescription>
						</CardHeader>
						<CardContent className="h-[400px] flex items-center justify-center">
							<div className="text-center">
								<Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium">Notifications Center</h3>
								<p className="text-sm text-muted-foreground max-w-md">
									View and manage system notifications, alerts, and user reports.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
=======
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your community platform.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex w-full sm:w-auto overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : statsData?.userStats?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {statsLoading ? "..." : (statsData?.userStats?.growth || 0)}%
                    </span>
                    <span>from last month</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Posts Today
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : statsData?.postStats?.today || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? "..." : statsData?.postStats?.total || 0} total posts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : statsData?.orderStats?.today || 0}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span className={statsData?.orderStats?.trend > 0 ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
                      {statsData?.orderStats?.trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {statsLoading ? "..." : Math.abs(statsData?.orderStats?.trend || 0)}%
                    </span>
                    <span>from yesterday</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Revenue
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : statsData?.revenueStats?.formatted || "$0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {statsLoading ? "..." : statsData?.revenueStats?.growth || 0}%
                    </span>
                    <span>from last month</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {activityLoading ? (
                    <div className="text-center py-4">Loading activity...</div>
                  ) : !activityData ? (
                    <div className="text-center py-4">No recent activity</div>
                  ) : (
                    <>
                      {/* New Users */}
                      {activityData.newUsers?.map((user, index) => (
                        <div key={`user-${user.id}`} className="flex items-start">
                          <div className="mr-4 mt-0.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <User className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              <span className="font-semibold">{user.username}</span>
                              {' '}joined the community
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {new Date(user.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* New Threads */}
                      {activityData.newThreads?.map((thread) => (
                        <div key={`thread-${thread.id}`} className="flex items-start">
                          <div className="mr-4 mt-0.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <MessageCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              <span className="font-semibold">{thread.username}</span>
                              {' '}created a new thread{' '}
                              <span className="text-blue-600 hover:underline">{thread.title}</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {new Date(thread.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* New Posts */}
                      {activityData.newPosts?.map((post) => (
                        <div key={`post-${post.id}`} className="flex items-start">
                          <div className="mr-4 mt-0.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <MessageSquare className="h-4 w-4 text-amber-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              <span className="font-semibold">{post.username}</span>
                              {' '}replied in{' '}
                              <span className="text-blue-600 hover:underline">{post.threadTitle}</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {new Date(post.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Forum Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Threads</CardTitle>
                  <CardDescription>
                    Most active threads this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center py-4">Loading top threads...</div>
                  ) : (
                    <div className="space-y-4">
                      {statsData?.topThreads?.map((thread: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="mr-4 text-muted-foreground">{index + 1}</div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">{thread.title}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              <span className="mr-2">{thread.posts} posts</span>
                              <Share2 className="h-3 w-3 mr-1" />
                              <span>{thread.views} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>
                    System performance and health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center py-4">Loading health data...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Server Uptime</div>
                        <div className="text-sm font-medium">{statsData?.health?.uptime}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Response Time</div>
                        <div className="text-sm font-medium">{statsData?.health?.responseTime}ms</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Active Sessions</div>
                        <div className="text-sm font-medium">{statsData?.health?.activeSessions}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Error Rate (24h)</div>
                        <div className="text-sm font-medium">{statsData?.health?.errorRate}%</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Storage Used</div>
                        <div className="text-sm font-medium">{statsData?.health?.storageUsed}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Detailed analytics coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Detailed analytics with charts and graphs will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports Dashboard</CardTitle>
                <CardDescription>
                  Review and manage user reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Reports Dashboard</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    A comprehensive view of user reports, content flags, and moderation actions is coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications Center</CardTitle>
                <CardDescription>
                  Manage system and user notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Notifications Center</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    View and manage system notifications, alerts, and user reports.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
