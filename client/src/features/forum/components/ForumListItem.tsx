import { Link } from 'wouter';
import { MessageSquare, CornerDownRight } from 'lucide-react'; // Added CornerDownRight
import type { MergedForum } from '@/contexts/ForumStructureContext'; // Changed alias

interface ForumListItemProps {
	forum: MergedForum; // Changed type alias
	href: string;
	parentZoneColor?: string; // Optional parent zone color for fallback
	depthLevel?: number; // New prop for indentation
}

export function ForumListItem({ forum, href, parentZoneColor, depthLevel = 0 }: ForumListItemProps) {
	const renderIcon = () => {
		if (forum.icon) {
			return (
				<span 
					className="text-xl" 
					style={{ color: forum.color || parentZoneColor || undefined }}
				>
					{forum.icon}
				</span>
			);
		}
		return <MessageSquare className="h-5 w-5 text-zinc-600" />;
	};

	const itemPadding = `pl-${4 + depthLevel * 6}`; // Adjusted padding logic: pl-4, pl-10, pl-16 etc.

	// Main content for the forum item (parent or subforum)
	const forumItemContent = (
		<div className={`block p-4 transition-colors ${forum.canHaveThreads ? 'hover:bg-black/20' : 'opacity-60 cursor-not-allowed'}`}>
			<div className={`flex items-start justify-between ${itemPadding}`}> {/* Changed to items-start for better alignment with description */}
				<div className="flex-grow">
					<div className="flex items-center">
						{depthLevel > 0 && <CornerDownRight className="h-4 w-4 mr-2 text-zinc-500 flex-shrink-0" />}
						<h3 className="text-white font-medium mb-0.5">{forum.name}</h3>
					</div>
					{forum.description && <p className={`text-sm text-zinc-400 mt-0.5 mb-2 ${depthLevel > 0 ? 'ml-6' : ''}`}>{forum.description}</p>}
					<div className={`flex items-center gap-3 text-xs text-zinc-400 ${depthLevel > 0 ? 'ml-6' : ''}`}>
						<div className="flex items-center">
							<MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
							{forum.threadCount || 0} threads
						</div>
						<div>{forum.postCount || 0} posts</div>
					</div>
				</div>
				<div className="ml-4 flex-shrink-0"> {/* Added ml-4 for spacing and flex-shrink-0 */}
					{renderIcon()}
				</div>
			</div>
		</div>
	);

	return (
		<div>
			{forum.canHaveThreads ? (
				<Link href={href}>
					<a className="block">{forumItemContent}</a>
				</Link>
			) : (
				<div
					aria-label="This forum does not allow new threads directly." // Clarified label
					title="This forum primarily organizes subforums or has posting disabled." // Clarified title
				>
					{forumItemContent}
				</div>
			)}

			{/* Render Subforums if they exist */}
			{forum.forums && forum.forums.length > 0 && (
				<div className={`subforums-list ${depthLevel === 0 ? 'border-l border-zinc-800 ml-4 md:ml-6' : 'ml-0'}`}> {/* Conditional border and margin */}
					{forum.forums.map(subForum => (
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
