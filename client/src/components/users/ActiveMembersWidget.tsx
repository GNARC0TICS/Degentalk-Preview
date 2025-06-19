import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createWidgetQueryKey } from '@/hooks/widgetData';
import { WidgetSkeleton } from '@/components/ui/widget-skeleton';

export interface ActiveUser {
	id: number | string;
	name: string;
	avatar: string | null;
	lastActive: string;
}

export interface ActiveMembersWidgetProps {
	title?: string;
	description?: string;
	className?: string;
	limit?: number;
	viewAllLink?: string;
}

/**
 * ActiveMembersWidget - Displays a list of currently active users
 *
 * A reusable component that shows users who are active on the platform
 * with their avatars, names and last active status
 */
function ActiveMembersWidget({
	title = 'Active Members',
	description = 'Members active in the last 30 minutes',
	className = '',
	limit = 5,
	viewAllLink = '/degen-index'
}: ActiveMembersWidgetProps) {
	const { data: users = [], isLoading } = useQuery<ActiveUser[]>({
		queryKey: createWidgetQueryKey('active-members'),
		queryFn: () => fetch('/api/forum/active-members').then((r) => r.json()),
		staleTime: 30_000
	});

	// Limit the number of users displayed
	const displayedUsers = users.slice(0, limit);

	return (
		<Card className={`bg-zinc-900/70 border border-zinc-800 ${className}`}>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg flex items-center">
					<Users className="h-5 w-5 mr-2 text-zinc-400" />
					{title}
				</CardTitle>
				{description && <CardDescription className="text-zinc-500">{description}</CardDescription>}
			</CardHeader>
			<CardContent className="p-0">
				{isLoading ? (
					<WidgetSkeleton />
				) : displayedUsers.length > 0 ? (
					<div className="divide-y divide-zinc-800/70">
						{displayedUsers.map((user, index) => (
							<motion.div
								key={user.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="group"
							>
								<Link href={`/profile/${user.id}`}>
									<div className="flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors cursor-pointer">
										<div className="flex items-center">
											<Avatar className="h-8 w-8 mr-3 ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
												<AvatarImage src={user.avatar || ''} alt={user.name} />
												<AvatarFallback className="bg-zinc-800 text-zinc-300 group-hover:bg-emerald-900/50">
													{user.name.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
													{user.name}
												</p>
												<p className="text-xs text-zinc-500">{user.lastActive}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
											<Activity className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				) : (
					<div className="p-4 text-center text-zinc-500">No active members at the moment</div>
				)}
			</CardContent>
			<CardFooter className="bg-zinc-900/90 p-3 border-t border-zinc-800">
				<Link
					href={viewAllLink}
					className="group text-sm text-zinc-400 hover:text-emerald-400 flex items-center w-full justify-center transition-colors"
				>
					View All Members
					<ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
				</Link>
			</CardFooter>
		</Card>
	);
}

export default ActiveMembersWidget;
