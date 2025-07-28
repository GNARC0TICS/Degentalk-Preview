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

export function MyBBForumList({ forums, categoryName, categoryColor = 'blue' }: MyBBForumListProps) {
	return (
		<div className="mybb-forum-category mb-6">
			{/* Category Header with gradient */}
			<div className={`mybb-category-header mybb-category-${categoryColor}`}>
				<div className="mybb-category-title">{categoryName}</div>
			</div>
			
			{/* Forum Table */}
			<table className="mybb-forum-table">
				<colgroup>
					<col style={{ width: '5%' }} />
					<col style={{ width: '50%' }} />
					<col style={{ width: '10%' }} />
					<col style={{ width: '10%' }} />
					<col style={{ width: '25%' }} />
				</colgroup>
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
			<td className="mybb-icon-cell">
				<div className={`mybb-forum-icon ${forum.threadCount > 0 ? 'mybb-icon-new' : 'mybb-icon-old'} ${!canPost ? 'mybb-icon-locked' : ''}`}>
					<div className="mybb-icon-inner">
						{!canPost ? (
							<Lock className="w-4 h-4 text-zinc-600" />
						) : (
							<MessageSquare className="w-4 h-4 text-zinc-300" />
						)}
					</div>
				</div>
			</td>
			
			{/* Forum Info */}
			<td className="mybb-forum-info">
				<div className="mybb-forum-details">
					<Link to={`/forums/${forum.slug}`} className="mybb-forum-title">
						{forum.name}
					</Link>
					{forum.description && (
						<div className="mybb-forum-description">{forum.description}</div>
					)}
					{forum.forums && forum.forums.length > 0 && (
						<div className="mybb-subforum-list">
							<span className="mybb-subforum-label">Sub-forums: </span>
							{forum.forums.map((sub, i) => (
								<React.Fragment key={sub.id}>
									<Link to={`/forums/${sub.slug}`} className="mybb-subforum-link">
										{sub.name}
									</Link>
									{i < forum.forums.length - 1 && ', '}
								</React.Fragment>
							))}
						</div>
					)}
				</div>
			</td>
			
			{/* Thread Count */}
			<td className="mybb-stats-cell">
				<div className="mybb-stats">
					<span className="mybb-stats-number">{forum.threadCount || 0}</span>
				</div>
			</td>
			
			{/* Post Count */}
			<td className="mybb-stats-cell">
				<div className="mybb-stats">
					<span className="mybb-stats-number">{forum.postCount || 0}</span>
				</div>
			</td>
			
			{/* Last Post */}
			<td className="mybb-lastpost-cell">
				<div className="mybb-lastpost">
					{forum.threadCount > 0 ? (
						<>
							<div className="mybb-lastpost-title">
								<Link to={forum.slug ? `/forums/${forum.slug}/${lastPost.threadTitle.toLowerCase().replace(/\s+/g, '-')}` : `/threads/${lastPost.threadTitle.toLowerCase().replace(/\s+/g, '-')}`} className="mybb-lastpost-link">
									{lastPost.threadTitle}
								</Link>
							</div>
							<div className="mybb-lastpost-info">
								{formatDistanceToNow(lastPost.time, { addSuffix: true })}
							</div>
							<div className="mybb-lastpost-by">
								by <Link to={`/profile/${lastPost.user}`} className="mybb-lastpost-user">{lastPost.user}</Link>
							</div>
						</>
					) : (
						<span className="mybb-no-posts">No posts</span>
					)}
				</div>
			</td>
		</tr>
	);
}