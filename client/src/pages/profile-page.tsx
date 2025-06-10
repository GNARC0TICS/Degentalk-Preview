import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserBadge } from '@/components/ui/user-badge';
import { PostWithUser, ThreadWithUser } from '@shared/types';
import { ThreadList } from '@/components/forum/thread-list';
import { PostCard } from '@/components/forum/post-card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import {
	Cake,
	Calendar,
	Edit,
	Globe,
	Mail,
	MapPin,
	MessageSquare,
	Shield,
	Trophy,
	User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserPathsDisplay } from '@/components/paths/user-paths-display';

export default function ProfilePage() {
	const { user, isLoading } = useAuth();
	const [activeTab, setActiveTab] = useState('overview');

	// Mock queries for user threads and posts
	// In a real app, these would be actual API queries
	const { data: userThreads, isLoading: threadsLoading } = useQuery<ThreadWithUser[]>({
		queryKey: [`/api/users/${user?.id}/threads`],
		enabled: !!user,
		queryFn: async () => {
			// This is a placeholder - in a real app you'd fetch from an actual endpoint
			return [];
		}
	});

	const { data: userPosts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
		queryKey: [`/api/users/${user?.id}/posts`],
		enabled: !!user,
		queryFn: async () => {
			// This is a placeholder - in a real app you'd fetch from an actual endpoint
			return [];
		}
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!user) {
		// This should never happen due to ProtectedRoute
		return null;
	}

	const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });

	// Calculate progress to next level (placeholder logic)
	const nextLevelXp = user.level * 100; // Example calculation
	const progress = (user.xp / nextLevelXp) * 100;

	return (
		<div className="flex flex-col min-h-screen">
			<SiteHeader />

			<main className="flex-1 py-8 relative">
				<div
					className="absolute inset-0 -z-10"
					style={{
						backgroundImage: "url('/images/profile-background.png')",
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				>
					<div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-black/90"></div>
				</div>

				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						{/* Left sidebar - User info */}
						<div className="lg:col-span-1">
							<Card className="bg-zinc-800/70 backdrop-blur-sm shadow-xl border border-zinc-700/50 text-white">
								<CardHeader className="text-center">
									<div className="flex flex-col items-center">
										<UserAvatar user={user} size="lg" className="h-24 w-24 mb-2" />
										<CardTitle className="text-xl mt-4">{user.username}</CardTitle>
										<div className="mt-1 space-x-2">
											<UserBadge user={user} size="md" />
											{user.isVerified && (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
													<Shield className="h-3 w-3 mr-1" />
													Verified
												</span>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<div className="text-sm text-gray-500 mb-1">
												Progress to Level {user.level + 1}
											</div>
											<div className="flex items-center gap-2">
												<Progress value={progress} className="h-2" />
												<span className="text-xs text-gray-500">{Math.round(progress)}%</span>
											</div>
											<div className="flex justify-between text-xs text-gray-500 mt-1">
												<span>{user.xp} XP</span>
												<span>{nextLevelXp} XP</span>
											</div>
										</div>

										<Separator />

										<div className="space-y-3">
											<div className="flex items-center text-sm">
												<Trophy className="h-4 w-4 text-gray-400 mr-2" />
												<span className="text-gray-600">Clout: </span>
												<span className="ml-auto font-medium">{user.clout}</span>
											</div>
											<div className="flex items-center text-sm">
												<MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
												<span className="text-gray-600">Posts: </span>
												<span className="ml-auto font-medium">0</span>
											</div>
											<div className="flex items-center text-sm">
												<Calendar className="h-4 w-4 text-gray-400 mr-2" />
												<span className="text-gray-600">Joined: </span>
												<span className="ml-auto font-medium">{memberSince}</span>
											</div>
											<div className="flex items-center text-sm">
												<Cake className="h-4 w-4 text-gray-400 mr-2" />
												<span className="text-gray-600">Birthday: </span>
												<span className="ml-auto font-medium">Not set</span>
											</div>
											<div className="flex items-center text-sm">
												<MapPin className="h-4 w-4 text-gray-400 mr-2" />
												<span className="text-gray-600">Location: </span>
												<span className="ml-auto font-medium">Not set</span>
											</div>
										</div>

										<Separator />

										<div className="space-y-2">
											<h3 className="text-sm font-medium">Social Links</h3>
											{user.website && (
												<a
													href={user.website}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-sm text-primary hover:underline"
												>
													<Globe className="h-4 w-4 mr-2" />
													Website
												</a>
											)}
											{user.github && (
												<a
													href={`https://github.com/${user.github}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-sm text-primary hover:underline"
												>
													<svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
														<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
													</svg>
													GitHub
												</a>
											)}
											{user.twitter && (
												<a
													href={`https://twitter.com/${user.twitter}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-sm text-primary hover:underline"
												>
													<svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
														<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
													</svg>
													Twitter
												</a>
											)}
											{user.discord && (
												<a
													href="#"
													className="flex items-center text-sm text-primary hover:underline"
												>
													<svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
														<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3846-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
													</svg>
													Discord
												</a>
											)}
										</div>

										<Button variant="outline" className="w-full">
											<Edit className="h-4 w-4 mr-2" />
											Edit Profile
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Main content */}
						<div className="lg:col-span-3">
							<Card className="bg-zinc-800/70 backdrop-blur-sm shadow-xl border border-zinc-700/50 text-white p-6">
								<CardHeader className="p-0 mb-6">
									<Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
										<TabsList className="grid grid-cols-4 w-full bg-black/40 backdrop-blur-sm">
											<TabsTrigger value="overview">Overview</TabsTrigger>
											<TabsTrigger value="threads">Threads</TabsTrigger>
											<TabsTrigger value="posts">Posts</TabsTrigger>
											<TabsTrigger value="about">About</TabsTrigger>
										</TabsList>
									</Tabs>
								</CardHeader>

								<CardContent className="p-0">
									<TabsContent value="overview" className="space-y-6">
										{user.bio ? (
											<div className="p-4 bg-black/20 rounded-lg">
												<h3 className="font-medium text-lg mb-2 text-gray-100">Bio</h3>
												<p className="text-gray-300">{user.bio}</p>
											</div>
										) : (
											<div className="text-center p-6 rounded-lg">
												<User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
												<h3 className="text-lg font-medium text-gray-100 mb-1">No bio yet</h3>
												<p className="text-gray-400 mb-4">
													Share a little about yourself with the community
												</p>
												<Button variant="outline" size="sm">
													<Edit className="h-4 w-4 mr-2" />
													Add Bio
												</Button>
											</div>
										)}

										<div>
											<h3 className="font-medium text-lg mb-3 text-gray-100">Recent Activity</h3>
											<div className="text-center p-6 rounded-lg">
												<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
												<h3 className="text-lg font-medium text-gray-100 mb-1">
													No recent activity
												</h3>
												<p className="text-gray-400">
													When you create threads or post replies, they'll appear here
												</p>
											</div>
										</div>

										<div>
											<h3 className="font-medium text-lg mb-3 text-gray-100">
												Badges & Achievements
											</h3>
											<div className="text-center p-6 rounded-lg">
												<Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
												<h3 className="text-lg font-medium text-gray-100 mb-1">No badges yet</h3>
												<p className="text-gray-400">
													Participate in the community to earn badges and achievements
												</p>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="threads">
										{threadsLoading ? (
											<div className="flex justify-center p-8">
												<Loader2 className="h-8 w-8 animate-spin text-primary" />
											</div>
										) : userThreads && userThreads.length > 0 ? (
											<ThreadList
												threads={userThreads}
												totalThreads={userThreads.length}
												currentPage={1}
												pageSize={userThreads.length || 10}
												onPageChange={() => {}}
											/>
										) : (
											<div className="text-center p-6 rounded-lg">
												<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
												<h3 className="text-lg font-medium text-gray-100 mb-1">No threads yet</h3>
												<p className="text-gray-400 mb-4">You haven't created any threads yet</p>
												<Button>Create Your First Thread</Button>
											</div>
										)}
									</TabsContent>

									<TabsContent value="posts">
										{postsLoading ? (
											<div className="flex justify-center p-8">
												<Loader2 className="h-8 w-8 animate-spin text-primary" />
											</div>
										) : userPosts && userPosts.length > 0 ? (
											<div className="space-y-6">
												{userPosts.map((post) => (
													<PostCard key={post.id} post={post} />
												))}
											</div>
										) : (
											<div className="text-center p-6 rounded-lg">
												<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
												<h3 className="text-lg font-medium text-gray-100 mb-1">No posts yet</h3>
												<p className="text-gray-400">
													When you reply to threads, your posts will appear here
												</p>
											</div>
										)}
									</TabsContent>

									<TabsContent value="about">
										<div className="space-y-6">
											<div>
												<h3 className="font-medium text-lg mb-3">DegenTalk Identity Paths</h3>
												<div className="rounded-lg border p-4">
													<p className="text-sm text-gray-500 mb-4">
														Your unique identity on DegenTalk is shaped by your participation across
														different categories. Each path represents your expertise and
														involvement in a specific area of the community.
													</p>
													<UserPathsDisplay pluginData={user.pluginData as Record<string, any>} />
												</div>
											</div>

											<div>
												<h3 className="font-medium text-lg mb-3">Contact Information</h3>
												<div className="rounded-lg border p-4">
													<div className="space-y-3">
														<div className="flex items-center">
															<Mail className="h-5 w-5 text-gray-400 mr-3" />
															<span className="text-gray-500">Email:</span>
															<span className="ml-2 font-medium">{user.email}</span>
														</div>
														<div className="flex items-center">
															<svg
																className="h-5 w-5 text-gray-400 mr-3"
																viewBox="0 0 24 24"
																fill="currentColor"
															>
																<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3846-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
															</svg>
															<span className="text-gray-500">Discord:</span>
															<span className="ml-2 font-medium">{user.discord || 'Not set'}</span>
														</div>
													</div>
												</div>
											</div>

											<div>
												<h3 className="font-medium text-lg mb-3">Account Information</h3>
												<div className="rounded-lg border p-4">
													<div className="space-y-3">
														<div className="flex items-center">
															<User className="h-5 w-5 text-gray-400 mr-3" />
															<span className="text-gray-500">Username:</span>
															<span className="ml-2 font-medium">{user.username}</span>
														</div>
														<div className="flex items-center">
															<Calendar className="h-5 w-5 text-gray-400 mr-3" />
															<span className="text-gray-500">Member since:</span>
															<span className="ml-2 font-medium">{memberSince}</span>
														</div>
														<div className="flex items-center">
															<Shield className="h-5 w-5 text-gray-400 mr-3" />
															<span className="text-gray-500">Account status:</span>
															<span
																className={`ml-2 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}
															>
																{user.isActive ? 'Active' : 'Inactive'}
															</span>
														</div>
													</div>
												</div>
											</div>

											<div>
												<h3 className="font-medium text-lg mb-3">Privacy Settings</h3>
												<div className="rounded-lg border p-4">
													<p className="text-sm text-gray-500 mb-4">
														Manage your privacy settings and control who can see your profile
														information.
													</p>
													<Button variant="outline">Manage Privacy Settings</Button>
												</div>
											</div>
										</div>
									</TabsContent>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>

			<SiteFooter />
		</div>
	);
}
