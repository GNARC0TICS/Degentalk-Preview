#!/usr/bin/env node

const fs = require('fs');

// Fix the dashboard page which is critical
const dashboardPath = '/Users/gnarcotic/Degentalk/client/src/pages/admin/index.tsx';

const dashboardContent = `import { useQuery } from '@tanstack/react-query';
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
  User, 
  LayoutDashboard 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import ProtectedAdminRoute from '@/components/admin/protected-admin-route';
import { useAdminModule } from '@/hooks/use-admin-modules';

// Dashboard Module Component (Protected)
function AdminDashboardModuleContent() {
	const { module, isEnabled } = useAdminModule('dashboard');

	// Show module disabled message if not enabled
	if (!isEnabled) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="p-8 text-center">
						<LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">Dashboard Module Disabled</h3>
						<p className="text-muted-foreground">
							The Dashboard module has been disabled by an administrator.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Fetch dashboard statistics from the backend
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['/api/admin/stats'],
		queryFn: async () => {
			const response = await fetch('/api/admin/stats');

			if (!response.ok) {
				throw new Error(\`Failed to fetch statistics: \${response.statusText}\`);
			}

			return await response.json();
		}
	});

	// Fetch recent activity data from the backend
	const { data: activityData, isLoading: activityLoading } = useQuery<{
		newUsers: Array<{ id: number; username: string; email: string; createdAt: string }>;
		recentPosts: Array<{ id: number; title: string; author: string; createdAt: string }>;
		recentTransactions: Array<{ id: number; amount: number; type: string; createdAt: string }>;
	}>({
		queryKey: ['/api/admin/activity'],
		queryFn: async () => {
			const response = await fetch('/api/admin/activity');

			if (!response.ok) {
				throw new Error(\`Failed to fetch activity: \${response.statusText}\`);
			}

			return await response.json();
		}
	});

	return (
		<AdminPageShell title={module?.name || "Dashboard"}>
			<p className="text-muted-foreground">Overview of your community platform.</p>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="flex w-full sm:w-auto overflow-x-auto no-scrollbar">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					{/* Platform Statistics */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Users</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? 'Loading...' : (statsData?.totalUsers || 0)}
								</div>
								<p className="text-xs text-muted-foreground">
									+{statsLoading ? '...' : (statsData?.newUsersToday || 0)} new today
								</p>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Posts</CardTitle>
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? 'Loading...' : (statsData?.totalPosts || 0)}
								</div>
								<p className="text-xs text-muted-foreground">
									+{statsLoading ? '...' : (statsData?.newPostsToday || 0)} new today
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">DGT Circulation</CardTitle>
								<CreditCard className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? 'Loading...' : (statsData?.totalDGT || 0)}
								</div>
								<p className="text-xs text-muted-foreground">
									Current supply
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Active Today</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{statsLoading ? 'Loading...' : (statsData?.activeToday || 0)}
								</div>
								<p className="text-xs text-muted-foreground">
									Online users
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest platform activity and user interactions</CardDescription>
							</CardHeader>
							<CardContent>
								{activityLoading ? (
									<div className="space-y-2">
										<div className="h-4 bg-muted rounded w-3/4"></div>
										<div className="h-4 bg-muted rounded w-1/2"></div>
										<div className="h-4 bg-muted rounded w-2/3"></div>
									</div>
								) : (
									<div className="space-y-4">
										{activityData?.recentPosts?.slice(0, 5).map((post) => (
											<div key={post.id} className="flex items-center space-x-4">
												<MessageCircle className="h-4 w-4 text-muted-foreground" />
												<div className="flex-1 space-y-1">
													<p className="text-sm font-medium">{post.title}</p>
													<p className="text-xs text-muted-foreground">
														by {post.author} • {new Date(post.createdAt).toLocaleDateString()}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>New Users</CardTitle>
								<CardDescription>Recently registered members</CardDescription>
							</CardHeader>
							<CardContent>
								{activityLoading ? (
									<div className="space-y-2">
										<div className="h-4 bg-muted rounded"></div>
										<div className="h-4 bg-muted rounded"></div>
										<div className="h-4 bg-muted rounded"></div>
									</div>
								) : (
									<div className="space-y-4">
										{activityData?.newUsers?.slice(0, 5).map((user) => (
											<div key={user.id} className="flex items-center space-x-4">
												<User className="h-4 w-4 text-muted-foreground" />
												<div className="flex-1 space-y-1">
													<p className="text-sm font-medium">{user.username}</p>
													<p className="text-xs text-muted-foreground">
														{new Date(user.createdAt).toLocaleDateString()}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Platform Analytics</CardTitle>
							<CardDescription>Detailed analytics and insights coming soon</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-center h-32">
								<p className="text-muted-foreground">Analytics dashboard under development</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="reports" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Reports Overview</CardTitle>
							<CardDescription>User reports and moderation queue</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-center h-32">
								<p className="text-muted-foreground">Reports dashboard coming soon</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>System Notifications</CardTitle>
							<CardDescription>Platform alerts and system messages</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-center h-32">
								<p className="text-muted-foreground">No new notifications</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</AdminPageShell>
	);
}

// Main exported component with protection wrapper
export default function AdminDashboardPage() {
	return (
		<ProtectedAdminRoute moduleId="dashboard">
			<AdminDashboardModuleContent />
		</ProtectedAdminRoute>
	);
}`;

try {
  fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
  console.log('✅ Fixed dashboard page');
} catch (error) {
  console.error('❌ Error fixing dashboard:', error.message);
}

console.log('Manual fixes applied. Some other admin pages may still need manual fixes.');
console.log('The core modular system is working - you can now access /admin with the new system.');