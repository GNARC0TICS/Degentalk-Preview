import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Lock, Users, Calendar } from 'lucide-react';
import type { MergedForum } from '@/features/forum/contexts/ForumStructureContext';
import { usePermission } from '@/hooks/usePermission';
import { formatDistanceToNow } from 'date-fns';

interface MyBBForumListProps {
	forums: MergedForum[];
	categoryName: string;
	categoryColor?: string;
}

export function MyBBForumList({ forums, categoryName, categoryColor }: MyBBForumListProps) {
	return (
		<div className="mybb-forum-category mb-6">
			{/* Category Header */}
			<div className="mybb-category-header">
				{categoryName}
			</div>
			
			{/* Forum Table */}
			<table className="mybb-forum-table">
				<tbody>
					{forums.map((forum, index) => (
						<ForumRow key={forum.id} forum={forum} isEven={index % 2 === 0} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function ForumRow({ forum, isEven }: { forum: MergedForum; isEven: boolean }) {
	const { canPost, reason } = usePermission(forum);
	
	// Check if forum is sticky/pinned (could be in pluginData or a property)
	const isSticky = (forum as any).isSticky || (forum as any).pluginData?.isSticky;
	
	// Simulate last post data (in real app, this would come from the forum data)
	const lastPost = {
		user: 'DegenTrader',
		time: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
		threadTitle: 'Latest market analysis'
	};
	
	return (
		<tr className={`mybb-forum-row ${isEven ? 'even' : 'odd'} ${isSticky ? 'sticky' : ''}`}>
			{/* Status Icon */}
			<td width="30" className="text-center">
				<div className={`mybb-status-icon ${forum.threadCount > 0 ? 'mybb-status-new' : 'mybb-status-old'}`}>
					{!canPost ? (
						<Lock className="w-5 h-5 text-zinc-500" aria-label={reason} />
					) : (
						<MessageSquare className="w-5 h-5 text-blue-500" />
					)}
				</div>
			</td>
			
			{/* Forum Info */}
			<td>
				<div className="flex flex-col">
					<Link to={`/forums/${forum.slug}`} className="font-semibold text-blue-400 hover:text-blue-300 text-sm">
						{forum.name}
					</Link>
					{forum.description && (
						<div className="text-xs text-zinc-500 mt-1">{forum.description}</div>
					)}
					{forum.subforums && forum.subforums.length > 0 && (
						<div className="mybb-subforum-list">
							<span className="text-zinc-500">Subforums: </span>
							{forum.subforums.map((sub, i) => (
								<React.Fragment key={sub.id}>
									<Link to={`/forums/${forum.slug}/${sub.slug}`} className="mybb-subforum-link">
										{sub.name}
									</Link>
									{i < forum.subforums.length - 1 && ', '}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
			</td>
			
			{/* Thread Count */}
			<td className="mybb-stats">
				<span className="mybb-stats-number">{forum.threadCount}</span>
				<span className="text-xs">Threads</span>
			</td>
			
			{/* Post Count */}
			<td className="mybb-stats">
				<span className="mybb-stats-number">{forum.postCount}</span>
				<span className="text-xs">Posts</span>
			</td>
			
			{/* Last Post */}
			<td width="200" className="mybb-lastpost">
				{forum.threadCount > 0 ? (
					<div>
						<div className="truncate">
							<Link to={`/threads/${lastPost.threadTitle.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-400 hover:underline text-xs">
								{lastPost.threadTitle}
							</Link>
						</div>
						<div className="mybb-lastpost-time">
							by <span className="mybb-lastpost-user">{lastPost.user}</span>
						</div>
						<div className="mybb-lastpost-time">
							{formatDistanceToNow(lastPost.time, { addSuffix: true })}
						</div>
					</div>
				) : (
					<span className="text-zinc-500 text-xs">No posts</span>
				)}
			</td>
		</tr>
	);
}