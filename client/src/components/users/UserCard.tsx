import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Badge } from '@app/components/ui/badge';
import { Users, MessageSquare, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DegenUser } from '@app/pages/degen-index';

interface UserCardProps {
	user: DegenUser;
	className?: string;
}

export function UserCard({ user, className = '' }: UserCardProps) {
	const formatJoinDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric'
		});
	};

	const formatNumber = (num: number) => {
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}k`;
		}
		return num.toString();
	};

	return (
		<motion.div
			whileHover={{ y: -2 }}
			transition={{ type: 'spring', stiffness: 300 }}
			className={className}
		>
			<Card className="bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden">
				<CardContent className="p-4">
					{/* Header with Avatar and Online Status */}
					<div className="flex items-start justify-between mb-4">
						<Link
							to={`/profile/${user.id}`}
							className="flex items-center space-x-3 group-hover:scale-105 transition-transform"
						>
							<div className="relative">
								<Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
									<AvatarImage src={user.avatarUrl || ''} alt={user.username} />
									<AvatarFallback className="bg-zinc-800 text-zinc-300 group-hover:bg-emerald-900/50">
										{user.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{user.isOnline && (
									<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-zinc-900 animate-pulse" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
									{user.username}
								</h3>
								<p className="text-xs text-zinc-500 flex items-center">
									<Activity className="w-3 h-3 mr-1" />
									{user.lastActive}
								</p>
							</div>
						</Link>
						{user.isOnline && (
							<Badge
								variant="outline"
								className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
							>
								Online
							</Badge>
						)}
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-3 mb-4">
						<div className="bg-zinc-800/50 rounded-lg p-2 text-center">
							<div className="text-lg font-bold text-emerald-400">{formatNumber(user.xp)}</div>
							<div className="text-xs text-zinc-500">XP</div>
						</div>
						<div className="bg-zinc-800/50 rounded-lg p-2 text-center">
							<div className="text-lg font-bold text-cyan-400">{formatNumber(user.reputation)}</div>
							<div className="text-xs text-zinc-500">Reputation</div>
						</div>
					</div>

					{/* Additional Info */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center justify-between text-zinc-400">
							<div className="flex items-center">
								<MessageSquare className="w-3.5 h-3.5 mr-1.5" />
								<span>Posts</span>
							</div>
							<span className="font-medium">{formatNumber(user.postCount)}</span>
						</div>
						<div className="flex items-center justify-between text-zinc-400">
							<div className="flex items-center">
								<Calendar className="w-3.5 h-3.5 mr-1.5" />
								<span>Joined</span>
							</div>
							<span className="font-medium">{formatJoinDate(user.joinDate)}</span>
						</div>
					</div>

					{/* Badges */}
					{user.badges.length > 0 && (
						<div className="mt-4 pt-3 border-t border-zinc-800">
							<div className="flex flex-wrap gap-1">
								{user.badges.slice(0, 3).map((badge, index) => (
									<Badge
										key={badge}
										variant="secondary"
										className="text-xs bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 transition-colors"
									>
										{badge}
									</Badge>
								))}
								{user.badges.length > 3 && (
									<Badge variant="secondary" className="text-xs bg-zinc-800/70 text-zinc-400">
										+{user.badges.length - 3}
									</Badge>
								)}
							</div>
						</div>
					)}

					{/* Hover Action */}
					<div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
						<Link to={`/profile/${user.id}`}>
							<motion.button
								className="w-full py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-md text-emerald-400 text-sm transition-colors"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								View Profile
							</motion.button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default UserCard;
