import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	ArrowRight,
	Clock,
	Crown,
	Lock,
	MessageSquare,
	MessagesSquare,
	ScrollText,
	TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CategoryId } from '@/types/ids';
import { type CategoryId } from "@shared/types";

interface CategoryCardProps {
	id: CategoryId;
	slug: string;
	name: string;
	description: string | null;
	threadCount: number;
	postCount: number;
	lastActivity?: Date | string;
	isLocked: boolean;
	isVip: boolean;
	minXp: number | null;
}

export function CategoryCard({
	id,
	slug,
	name,
	description,
	threadCount,
	postCount,
	lastActivity,
	isLocked,
	isVip,
	minXp
}: CategoryCardProps) {
	const [, setLocation] = useLocation();

	const handleViewCategory = () => {
		setLocation(`/forums/${slug}`);
	};

	const formattedLastActivity = lastActivity
		? formatDistanceToNow(new Date(lastActivity), { addSuffix: true })
		: 'No recent activity';

	return (
		<Card className="bg-zinc-900/60 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all shadow-md rounded-lg">
			<div className="flex flex-col lg:flex-row">
				<div className="flex-1">
					<CardHeader className="p-4 pb-2">
						<div className="flex justify-between items-start">
							<div className="flex items-start gap-2">
								<div>
									<CardTitle className="text-lg text-zinc-100 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
										{name}

										{/* Status badges */}
										<div className="flex gap-1">
											{isVip && (
												<Badge
													variant="secondary"
													className="bg-amber-950/40 text-amber-300 hover:bg-amber-950/60 border border-amber-800/60 text-xs"
												>
													<Crown className="h-3 w-3 mr-1" />
													VIP
												</Badge>
											)}
											{isLocked && (
												<Badge
													variant="secondary"
													className="bg-red-950/40 text-red-300 hover:bg-red-950/60 border border-red-800/60 text-xs"
												>
													<Lock className="h-3 w-3 mr-1" />
													Locked
												</Badge>
											)}
											{minXp && minXp > 0 && (
												<Badge
													variant="secondary"
													className="bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 border border-emerald-800/60 text-xs"
												>
													<TrendingUp className="h-3 w-3 mr-1" />
													{minXp}+ XP
												</Badge>
											)}
										</div>
									</CardTitle>
									{description && (
										<CardDescription className="text-zinc-400 mt-1">{description}</CardDescription>
									)}
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<div className="flex flex-wrap gap-4 text-sm text-zinc-400">
							<div className="flex items-center gap-1">
								<ScrollText className="h-4 w-4 text-zinc-500" />
								<span>
									{threadCount} {threadCount === 1 ? 'thread' : 'threads'}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<MessageSquare className="h-4 w-4 text-zinc-500" />
								<span>
									{postCount} {postCount === 1 ? 'post' : 'posts'}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4 text-zinc-500" />
								<span>{formattedLastActivity}</span>
							</div>
						</div>
					</CardContent>
				</div>
				<div className="flex items-stretch border-t lg:border-t-0 lg:border-l border-zinc-800">
					<Button
						variant="ghost"
						className="rounded-none flex-1 h-auto px-6 py-4 justify-center hover:bg-zinc-800/60 text-amber-400 hover:text-amber-300"
						onClick={handleViewCategory}
						disabled={isLocked}
					>
						<div className="flex flex-col items-center gap-2">
							{isLocked ? (
								<>
									<Lock className="h-5 w-5" />
									<span className="text-xs">Locked</span>
								</>
							) : (
								<>
									<ArrowRight className="h-5 w-5" />
									<span className="text-xs">View</span>
								</>
							)}
						</div>
					</Button>
				</div>
			</div>
		</Card>
	);
}
