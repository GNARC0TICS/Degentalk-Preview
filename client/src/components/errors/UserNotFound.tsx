import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, Home, Users, Search, ArrowLeft, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UserNotFoundProps {
	username?: string;
	userId?: string;
	onBack?: () => void;
}

interface ActiveUser {
	id: string;
	username: string;
	avatarUrl?: string;
	role?: string;
	xpLevel?: number;
	totalXp?: number;
}

export function UserNotFound({ username, userId, onBack }: UserNotFoundProps) {
	// Fetch some active users to suggest
	const { data: activeUsers = [] } = useQuery({
		queryKey: ['/api/users/active'],
		queryFn: async () => {
			const response = await apiRequest<{ users: ActiveUser[] }>({
				url: '/api/users/active?limit=6',
				method: 'GET'
			});

			return response?.users || [];
		}
	});

	const identifier = username || userId;
	const isPrivateProfile = !username && userId; // If we only have userId, might be private

	return (
		<div className="min-h-[60vh] flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl bg-zinc-900/80 border-zinc-800">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
						<UserX className="h-8 w-8 text-purple-500" />
					</div>
					<CardTitle className="text-2xl text-white">
						{isPrivateProfile ? 'Profile Private' : 'User Not Found'}
					</CardTitle>
					<p className="text-zinc-400 mt-2">
						{isPrivateProfile
							? "This user profile is set to private or you don't have permission to view it."
							: "The user you're looking for doesn't exist, may have changed their username, or their account has been deactivated."}
					</p>
					{identifier && (
						<p className="text-xs text-zinc-500 mt-1">
							{username ? `Username: ${username}` : `User ID: ${userId}`}
						</p>
					)}
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Quick Actions */}
					<div className="flex flex-wrap gap-3 justify-center">
						{onBack && (
							<Button variant="outline" onClick={onBack} className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Go Back
							</Button>
						)}

						<Link href="/users">
							<Button variant="outline" className="gap-2">
								<Users className="h-4 w-4" />
								Browse Members
							</Button>
						</Link>

						<Link href="/search?type=users">
							<Button variant="outline" className="gap-2">
								<Search className="h-4 w-4" />
								Search Users
							</Button>
						</Link>

						<Link href="/">
							<Button className="gap-2">
								<Home className="h-4 w-4" />
								Go Home
							</Button>
						</Link>
					</div>

					{/* Active Users */}
					{activeUsers.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold text-white mb-4 text-center">
								Active community members
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{activeUsers.map((user) => (
									<Link key={user.id} href={`/profile/${user.username}`} className="block">
										<div className="p-4 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
													{user.avatarUrl ? (
														<img
															src={user.avatarUrl}
															alt={user.username}
															className="w-full h-full object-cover"
														/>
													) : (
														<span className="text-sm font-medium text-zinc-300">
															{user.username.slice(0, 2).toUpperCase()}
														</span>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-white text-sm mb-1">{user.username}</h4>
													<div className="flex items-center gap-2 text-xs text-zinc-400">
														{user.role && <span className="capitalize">{user.role}</span>}
														{user.xpLevel && (
															<>
																<span>•</span>
																<span>Level {user.xpLevel}</span>
															</>
														)}
													</div>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Search Suggestion */}
					{username && (
						<div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
							<h4 className="text-sm font-medium text-white mb-2">Can't find "{username}"?</h4>
							<div className="space-y-2 text-xs text-zinc-400">
								<p>• They may have changed their username</p>
								<p>• Their account might be temporarily deactivated</p>
								<p>• Try searching for similar usernames</p>
								<p>• Check if you spelled the username correctly</p>
							</div>
						</div>
					)}

					{/* Help Text */}
					<div className="text-center text-sm text-zinc-500 pt-4 border-t border-zinc-800">
						<p>
							Looking to connect with someone? Try browsing our member directory or joining
							discussions.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
