import React from 'react';
import { Users, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OnlineUsersDisplay } from './OnlineUsersDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ForumStats {
	totalThreads: number;
	totalPosts: number;
	totalMembers: number;
	onlineUsers: number;
	newestMember?: string;
}

interface MyBBStatsProps {
	stats: ForumStats;
	onlineUsersList?: string[];
}

export function MyBBStats({ stats, onlineUsersList }: MyBBStatsProps) {
	return (
		<div className="mybb-board-statistics">
			{/* Board Statistics Header */}
			<div className="mybb-category-header mybb-category-green">
				<div className="mybb-category-title">Board Statistics</div>
			</div>
			
			{/* Statistics Content */}
			<div className="mybb-stats-content">
				{/* Who's Online Section */}
				<div className="mybb-whos-online-section">
					<div className="mybb-stats-label">Who's Online</div>
					<div className="mybb-stats-text">
						<span className="mybb-online-count">{stats.onlineUsers} user{stats.onlineUsers !== 1 ? 's' : ''} active</span> in the past 15 minutes ({onlineUsersList?.length || 1} member{(onlineUsersList?.length || 1) !== 1 ? 's' : ''}, 0 of whom are invisible, and {Math.max(0, stats.onlineUsers - (onlineUsersList?.length || 1))} guest{Math.max(0, stats.onlineUsers - (onlineUsersList?.length || 1)) !== 1 ? 's' : ''}).
					</div>
					
					{onlineUsersList && onlineUsersList.length > 0 && (
						<>
							{/* Avatar row - Classic style */}
							<div className="mybb-online-avatars">
								<TooltipProvider>
									<div className="flex -space-x-2 mb-2">
										{onlineUsersList.slice(0, 8).map((username, idx) => (
											<Tooltip key={idx}>
												<TooltipTrigger asChild>
													<Link
														to={`/users/${username}`}
														className="relative"
													>
														<Avatar className="w-6 h-6 border-2 border-zinc-800">
															<AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
															<AvatarFallback className="bg-zinc-700 text-[10px]">
																{username[0]}
															</AvatarFallback>
														</Avatar>
													</Link>
												</TooltipTrigger>
												<TooltipContent>
													<p className="text-xs">{username}</p>
												</TooltipContent>
											</Tooltip>
									))}
										{onlineUsersList.length > 8 && (
											<div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-800 flex items-center justify-center">
												<span className="text-[10px] text-zinc-400">+{onlineUsersList.length - 8}</span>
											</div>
										)}
									</div>
								</TooltipProvider>
							</div>
							
							{/* Text list with commas */}
							<div className="mybb-online-list">
								{onlineUsersList.map((username, idx) => (
									<span key={idx}>
										<Link
											to={`/users/${username}`}
											className="mybb-username"
										>
											{username}
										</Link>
										{idx < onlineUsersList.length - 1 && <span className="text-zinc-500">, </span>}
									</span>
								))}
							</div>
						</>
					)}
				</div>
				
				{/* Board Statistics Section */}
				<div className="mybb-board-stats-section">
					<div className="mybb-stats-label">Board Statistics</div>
					<div className="mybb-stats-text">
						Our members have made a total of <strong>{stats.totalPosts.toLocaleString()} posts</strong> in <strong>{stats.totalThreads.toLocaleString()} threads</strong>.
					</div>
					<div className="mybb-stats-text">
						We currently have <strong>{stats.totalMembers.toLocaleString()} members</strong> registered.
					</div>
					{stats.newestMember && (
						<div className="mybb-stats-text">
							Please welcome our newest member, <a href="#" className="mybb-username">{stats.newestMember}</a>
						</div>
					)}
					<div className="mybb-stats-text">
						The most users online at one time was <strong>1</strong> on Yesterday at 06:24 PM
					</div>
				</div>
			</div>
		</div>
	);
}

export function MyBBLegend() {
	return (
		<div className="mybb-forum-legend">
			<div className="mybb-legend-row">
				<div className="mybb-legend-item">
					<div className="mybb-forum-icon mybb-icon-new mybb-icon-small">
						<MessageSquare className="w-3 h-3 text-white" />
					</div>
					<span>Forum Contains New Posts</span>
				</div>
				<div className="mybb-legend-item">
					<div className="mybb-forum-icon mybb-icon-old mybb-icon-small">
						<MessageSquare className="w-3 h-3 text-zinc-500" />
					</div>
					<span>Forum Contains No New Posts</span>
				</div>
				<div className="mybb-legend-item">
					<div className="mybb-forum-icon mybb-icon-locked mybb-icon-small">
						<Clock className="w-3 h-3 text-red-400" />
					</div>
					<span>Forum is Locked</span>
				</div>
			</div>
		</div>
	);
}