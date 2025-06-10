import React from 'react';
import { Link } from 'wouter';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Calendar, Activity, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { DegenUser } from '@/pages/degen-index';

interface UserDirectoryTableProps {
	users: DegenUser[];
	className?: string;
}

export function UserDirectoryTable({ users, className = '' }: UserDirectoryTableProps) {
	const formatJoinDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`;
		}
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}k`;
		}
		return num.toString();
	};

	return (
		<Card className={`bg-zinc-900/70 border border-zinc-800 ${className}`}>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-zinc-800 hover:bg-transparent">
								<TableHead className="text-zinc-400 font-medium">Member</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">Level</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">XP</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">Clout</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">Posts</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">Joined</TableHead>
								<TableHead className="text-zinc-400 font-medium text-center">Title</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user, index) => (
								<motion.tr
									key={user.id}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.02 }}
									className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group"
								>
									{/* Member Info */}
									<TableCell className="py-3">
										<Link href={`/profile/${user.id}`} className="block">
											<div className="flex items-center space-x-3 group-hover:scale-[1.02] transition-transform">
												<div className="relative">
													<Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
														<AvatarImage src={user.avatarUrl || ''} alt={user.username} />
														<AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
															{user.username.substring(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													{user.isOnline && (
														<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-900 animate-pulse" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<p className="font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
															{user.username}
														</p>
														{user.isOnline && (
															<Badge
																variant="outline"
																className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10 px-1.5 py-0"
															>
																Online
															</Badge>
														)}
													</div>
													<p className="text-xs text-zinc-500 flex items-center mt-0.5">
														<Activity className="w-3 h-3 mr-1" />
														{user.lastActive}
													</p>
												</div>
											</div>
										</Link>
									</TableCell>

									{/* Level */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
												<span className="text-white font-bold text-xs">{user.level}</span>
											</div>
											<span className="text-xs text-zinc-500 mt-1">LVL</span>
										</div>
									</TableCell>

									{/* XP */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<span className="text-emerald-400 font-bold text-sm">
												{formatNumber(user.xp)}
											</span>
											<Zap className="w-3 h-3 text-emerald-400/60 mt-0.5" />
										</div>
									</TableCell>

									{/* Clout */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<span className="text-cyan-400 font-bold text-sm">
												{formatNumber(user.clout)}
											</span>
											<Trophy className="w-3 h-3 text-cyan-400/60 mt-0.5" />
										</div>
									</TableCell>

									{/* Posts */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<span className="text-purple-400 font-bold text-sm">
												{formatNumber(user.postCount)}
											</span>
											<MessageSquare className="w-3 h-3 text-purple-400/60 mt-0.5" />
										</div>
									</TableCell>

									{/* Joined */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<span className="text-zinc-300 text-sm">{formatJoinDate(user.joinDate)}</span>
											<Calendar className="w-3 h-3 text-zinc-500 mt-0.5" />
										</div>
									</TableCell>

									{/* Title */}
									<TableCell className="text-center">
										<div className="flex flex-col items-center">
											<Badge
												variant="secondary"
												className="text-xs bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30 text-purple-300 hover:bg-purple-800/30 transition-colors px-2 py-1"
											>
												{user.title}
											</Badge>
										</div>
									</TableCell>
								</motion.tr>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

export default UserDirectoryTable;
