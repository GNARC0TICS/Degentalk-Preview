import { Link } from 'wouter';
import { MessageSquare, CornerDownRight, Lock, Shield, Star, Crown, Flame } from 'lucide-react';
import type { MergedForum } from '@/contexts/ForumStructureContext';
import { useState, useEffect } from 'react';
import { StatChip } from '@/components/ui/StatChip';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/hooks/usePermission';
import { CARD_STYLES } from '@/utils/card-constants';
import { useAuth } from '@/hooks/use-auth';

interface ForumListItemProps {
	forum: MergedForum;
	href: string;
	parentZoneColor?: string;
	depthLevel?: number;
}

export function ForumListItem({
	forum,
	href,
	parentZoneColor,
	depthLevel = 0
}: ForumListItemProps) {
	const [prevThreadCount, setPrevThreadCount] = useState(forum.threadCount || 0);
	const [prevPostCount, setPrevPostCount] = useState(forum.postCount || 0);
	const [isAnimating, setIsAnimating] = useState(false);

	const { user } = useAuth();
	const { canPost } = usePermission(forum);

	// Check if counts have changed to trigger animations
	useEffect(() => {
		if (forum.threadCount !== prevThreadCount || forum.postCount !== prevPostCount) {
			setIsAnimating(true);
			const timer = setTimeout(() => {
				setIsAnimating(false);
				setPrevThreadCount(forum.threadCount || 0);
				setPrevPostCount(forum.postCount || 0);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [forum.threadCount, forum.postCount, prevThreadCount, prevPostCount]);

	const renderIcon = () => {
		if (!canPost) {
			return <Lock className="h-5 w-5 text-zinc-600" title="Posting disabled" />;
		}
		if (forum.icon) {
			return (
				<span className="text-xl" style={{ color: forum.color || parentZoneColor || undefined }}>
					{forum.icon}
				</span>
			);
		}
		return <MessageSquare className="h-5 w-5 text-zinc-600" />;
	};

	// Accent color for borders, hover effects, etc.
	const accentColor = forum.color || parentZoneColor || '#10b981'; // Emerald default if no color
	const accentColorWithOpacity = `${accentColor}40`; // 25% opacity

	// Different styling based on depth level
	const isParentForum = depthLevel === 0;

	// Get access level info
	const getAccessLevelInfo = () => {
		const accessLevel = forum.rules?.allowPosting ? 'public' : null; // Simplified for now
		// You could implement more detailed access level detection here
		if (!canPost && user) {
			return {
				icon: Shield,
				label: 'Restricted Access',
				color: 'text-amber-400',
				description: 'Higher level required'
			};
		}
		if (!user && forum.rules?.allowPosting === false) {
			return {
				icon: Lock,
				label: 'Sign in Required',
				color: 'text-zinc-500',
				description: 'Sign in to access'
			};
		}
		return null;
	};

	const accessInfo = getAccessLevelInfo();

	// Main content for the forum item (parent or subforum)
	const forumItemContent = (
		<div
			className={`block ${CARD_STYLES.hover.subtle} ${
				isParentForum
					? `p-4 ${CARD_STYLES.background.primary} backdrop-blur-md`
					: `p-3 ${CARD_STYLES.background.secondary}`
			} ${canPost ? 'hover:bg-zinc-900/80' : 'opacity-75 cursor-not-allowed'}`}
			style={{
				borderLeft: isParentForum ? `3px solid ${accentColor}` : 'none',
				boxShadow: isParentForum ? `0 4px 6px -1px ${accentColorWithOpacity}` : 'none'
			}}
		>
			<div className={`flex items-start justify-between ${depthLevel > 0 ? 'pl-6' : ''}`}>
				<div className="flex-grow">
					<div className="flex items-center gap-1.5">
						{depthLevel > 0 && (
							<div className="relative">
								<CornerDownRight className="h-4 w-4 text-zinc-500 flex-shrink-0" />
								<div
									className="absolute left-0 -top-[16px] w-[2px] h-[16px]"
									style={{ backgroundColor: 'rgba(113, 113, 122, 0.3)' }}
								/>
							</div>
						)}
						<h3
							className="text-white font-medium mb-0.5"
							style={depthLevel === 0 ? { color: accentColor } : undefined}
						>
							{forum.name}
						</h3>
					</div>
					{forum.description && (
						<p className={`text-sm text-zinc-400 mt-0.5 mb-2 ${depthLevel > 0 ? 'ml-6' : ''}`}>
							{forum.description}
						</p>
					)}
					<div className={`flex items-center gap-3 ${depthLevel > 0 ? 'ml-6' : ''}`}>
						<StatChip
							icon={MessageSquare}
							value={forum.threadCount || 0}
							label="threads"
							accent={accentColor}
							isAnimating={isAnimating}
						/>

						<StatChip
							value={forum.postCount || 0}
							label="posts"
							accent={accentColor}
							isAnimating={isAnimating}
						/>

						{forum.isPopular && (
							<Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
								<Flame className="w-3 h-3" /> HOT
							</Badge>
						)}

						{/* Access Level Badge */}
						{accessInfo && (
							<Badge
								variant="outline"
								className={`text-[10px] px-2 py-0.5 ${accessInfo.color} border-current`}
								title={accessInfo.description}
							>
								<accessInfo.icon className="h-3 w-3 mr-1" />
								{accessInfo.label}
							</Badge>
						)}
					</div>
				</div>
				<div className="ml-4 flex-shrink-0">{renderIcon()}</div>
			</div>
		</div>
	);

	// Navigation should be allowed even if posting is disabled
	const canHaveThreads = forum.canHaveThreads !== false;

	return (
		<div className={`${isParentForum ? 'mb-2' : ''}`}>
			{canHaveThreads ? (
				<Link href={href}>
					<a className="block">{forumItemContent}</a>
				</Link>
			) : (
				<div
					aria-label="This forum does not allow new threads directly."
					title="This forum primarily organizes subforums or has posting disabled."
				>
					{forumItemContent}
				</div>
			)}

			{/* Render Subforums if they exist */}
			{forum.forums && forum.forums.length > 0 && (
				<div
					className={`subforums-list ${depthLevel === 0 ? 'border-l-2 ml-6' : 'ml-5 border-l'}`}
					style={{
						borderColor: 'rgba(113, 113, 122, 0.3)'
					}}
				>
					{forum.forums.map((subForum) => (
						<ForumListItem
							key={subForum.slug}
							forum={subForum}
							href={`/forums/${subForum.slug}`}
							parentZoneColor={forum.color || parentZoneColor}
							depthLevel={depthLevel + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}
