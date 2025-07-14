import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useContentFeedState } from '@/contexts/content-feed-context';
import {
	Sparkles,
	TrendingUp,
	Clock,
	Heart,
	MessageSquare,
	Eye,
	ArrowRight,
	Users
} from 'lucide-react';
import { cn } from '@/utils/utils';

interface RelatedItem {
	id: string;
	title: string;
	type: 'thread' | 'user' | 'topic';
	relevanceScore: number;
	metadata?: {
		viewCount?: number;
		postCount?: number;
		username?: string;
		avatar?: string;
		isOnline?: boolean;
		lastActivity?: string;
	};
}

interface RelatedContentWidgetProps {
	compact?: boolean;
}

export default function RelatedContentWidget({ compact = false }: RelatedContentWidgetProps) {
	const { activeTab, badges, feedMeta } = useContentFeedState();

	// Generate contextual content based on active tab
	const relatedContent = useMemo(() => {
		const baseItems: RelatedItem[] = [];

		if (activeTab === 'trending') {
			return [
				{
					id: 'hot-topic-1',
					title: 'Crypto Market Analysis Discussion',
					type: 'thread' as const,
					relevanceScore: 95,
					metadata: { viewCount: 1234, postCount: 89 }
				},
				{
					id: 'hot-topic-2',
					title: 'DGT Token Economics Deep Dive',
					type: 'thread' as const,
					relevanceScore: 88,
					metadata: { viewCount: 892, postCount: 156 }
				},
				{
					id: 'trending-user-1',
					title: 'cryptowhale_2024',
					type: 'user' as const,
					relevanceScore: 82,
					metadata: { username: 'cryptowhale_2024', isOnline: true }
				}
			];
		}

		if (activeTab === 'recent') {
			return [
				{
					id: 'recent-topic-1',
					title: 'New Trading Strategy Discussion',
					type: 'thread' as const,
					relevanceScore: 90,
					metadata: { viewCount: 45, postCount: 12, lastActivity: '2 min ago' }
				},
				{
					id: 'recent-topic-2',
					title: 'Forum Feature Request Thread',
					type: 'thread' as const,
					relevanceScore: 75,
					metadata: { viewCount: 78, postCount: 23, lastActivity: '5 min ago' }
				},
				{
					id: 'active-user-1',
					title: 'defi_master',
					type: 'user' as const,
					relevanceScore: 85,
					metadata: { username: 'defi_master', isOnline: true, lastActivity: '1 min ago' }
				}
			];
		}

		if (activeTab === 'following') {
			return [
				{
					id: 'following-topic-1',
					title: 'Your Followed Users are Active',
					type: 'topic' as const,
					relevanceScore: 100,
					metadata: { viewCount: badges.followingActiveCount }
				},
				{
					id: 'friend-1',
					title: 'satoshi_nakamoto',
					type: 'user' as const,
					relevanceScore: 95,
					metadata: { username: 'satoshi_nakamoto', isOnline: true }
				},
				{
					id: 'friend-2',
					title: 'vitalik_eth',
					type: 'user' as const,
					relevanceScore: 90,
					metadata: { username: 'vitalik_eth', isOnline: false, lastActivity: '1h ago' }
				}
			];
		}

		return baseItems;
	}, [activeTab, badges.followingActiveCount]);

	const getTabIcon = () => {
		switch (activeTab) {
			case 'trending':
				return TrendingUp;
			case 'recent':
				return Clock;
			case 'following':
				return Heart;
			default:
				return Sparkles;
		}
	};

	const getTabDisplayName = () => {
		switch (activeTab) {
			case 'trending':
				return 'Trending';
			case 'recent':
				return 'Recent';
			case 'following':
				return 'Following';
			default:
				return 'Related';
		}
	};

	const renderRelatedItem = (item: RelatedItem) => {
		const isThread = item.type === 'thread';
		const isUser = item.type === 'user';
		const isTopic = item.type === 'topic';

		return (
			<div
				key={item.id}
				className={cn(
					'p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer group',
					compact && 'p-2'
				)}
			>
				<div className="flex items-start gap-3">
					{isUser && (
						<div className="relative">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
									{item.metadata?.username?.slice(0, 2).toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
							{item.metadata?.isOnline && (
								<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
							)}
						</div>
					)}

					{(isThread || isTopic) && (
						<div
							className={cn(
								'flex-shrink-0 rounded-lg flex items-center justify-center',
								compact ? 'w-7 h-7' : 'w-8 h-8',
								isThread ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
							)}
						>
							{isThread ? <MessageSquare className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
						</div>
					)}

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<h4
								className={cn(
									'font-medium text-zinc-200 line-clamp-2 group-hover:text-white transition-colors',
									compact ? 'text-sm' : 'text-sm'
								)}
							>
								{item.title}
							</h4>

							{item.relevanceScore > 85 && (
								<Badge
									variant="secondary"
									className="h-5 px-1.5 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 flex-shrink-0"
								>
									Hot
								</Badge>
							)}
						</div>

						{/* Metadata */}
						<div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
							{isThread && item.metadata && (
								<>
									{item.metadata.viewCount && (
										<div className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											{item.metadata.viewCount.toLocaleString()}
										</div>
									)}
									{item.metadata.postCount && (
										<div className="flex items-center gap-1">
											<MessageSquare className="h-3 w-3" />
											{item.metadata.postCount}
										</div>
									)}
									{item.metadata.lastActivity && <span>{item.metadata.lastActivity}</span>}
								</>
							)}

							{isUser && item.metadata && (
								<>
									<span>@{item.metadata.username}</span>
									{item.metadata.lastActivity && !item.metadata.isOnline && (
										<span>• {item.metadata.lastActivity}</span>
									)}
									{item.metadata.isOnline && <span className="text-green-400">• Online</span>}
								</>
							)}

							{isTopic && item.metadata?.viewCount && (
								<div className="flex items-center gap-1">
									<Users className="h-3 w-3" />
									{item.metadata.viewCount} active
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const TabIcon = getTabIcon();

	return (
		<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
			<CardHeader className={cn('pb-3', compact ? 'px-3 pt-3' : 'px-4 pt-4')}>
				<CardTitle
					className={cn(
						'flex items-center justify-between text-zinc-100',
						compact ? 'text-base' : 'text-lg'
					)}
				>
					<div className="flex items-center">
						<TabIcon className={cn('text-emerald-500 mr-2', compact ? 'h-4 w-4' : 'h-5 w-5')} />
						Related to {getTabDisplayName()}
					</div>

					{feedMeta.totalItems > 0 && (
						<Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
							{feedMeta.totalItems} items
						</Badge>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className={cn('space-y-3', compact ? 'px-3 pb-3' : 'px-4 pb-4')}>
				{relatedContent.length > 0 ? (
					<>
						{relatedContent.map(renderRelatedItem)}

						{/* View More Button */}
						<Button
							variant="outline"
							size="sm"
							className="w-full justify-between border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white mt-4"
							onClick={() => {
								// Navigate to related content based on tab
								const route =
									activeTab === 'following' ? '/following' : `/explore?tab=${activeTab}`;
								window.location.href = route;
							}}
						>
							<span>Explore More {getTabDisplayName()}</span>
							<ArrowRight className="h-4 w-4" />
						</Button>
					</>
				) : (
					<div className="text-center py-6 text-zinc-500">
						<Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No related content available</p>
						<p className="text-xs mt-1">Try switching tabs or refresh the page</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
