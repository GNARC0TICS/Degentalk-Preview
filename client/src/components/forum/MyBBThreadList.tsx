import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Pin, Lock, CheckCircle, Eye, Calendar } from 'lucide-react';
import type { Thread } from '@shared/types/thread.types';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MyBBThreadListProps {
	threads: Thread[];
	forumName: string;
	forumSlug: string;
}

export function MyBBThreadList({ threads, forumName, forumSlug }: MyBBThreadListProps) {
	// Get prefix style class based on prefix name
	const getPrefixClass = (prefix: string): string => {
		const normalized = prefix.toLowerCase().replace(/[\[\]]/g, '');
		
		// Map specific prefixes to style classes
		if (['live', 'trade', 'up', 'salt', 'rekt'].includes(normalized)) return 'live';
		if (['announcement', 'update', 'critical'].includes(normalized)) return 'announcement';
		if (['solved', 'f', 'closed'].includes(normalized)) return 'solved';
		
		return ''; // Default style
	};

	return (
		<div className="mybb-forum-category mb-6">
			{/* Category Header */}
			<div className="mybb-category-header">
				{forumName} - Threads
			</div>
			
			{/* Thread Table */}
			<table className="mybb-forum-table">
				<tbody>
					{threads.map((thread, index) => (
						<ThreadRow 
							key={thread.id} 
							thread={thread} 
							isEven={index % 2 === 0}
							forumSlug={forumSlug}
							getPrefixClass={getPrefixClass}
						/>
					))}
					{threads.length === 0 && (
						<tr>
							<td colSpan={5} className="text-center text-zinc-500 py-8">
								No threads in this forum yet
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

interface ThreadRowProps {
	thread: Thread;
	isEven: boolean;
	forumSlug: string;
	getPrefixClass: (prefix: string) => string;
}

function ThreadRow({ thread, isEven, forumSlug, getPrefixClass }: ThreadRowProps) {
	const isSticky = thread.isSticky;
	const isLocked = thread.isLocked;
	const isSolved = thread.isSolved;
	
	// Get thread prefix from the thread data
	const prefix = (thread as any).prefix;
	
	return (
		<tr className={`mybb-thread-row ${isEven ? 'even' : 'odd'} ${isSticky ? 'sticky' : ''}`}>
			{/* Status Icon */}
			<td width="30" className="text-center">
				<div className="mybb-status-icon">
					{isSticky && <Pin className="w-4 h-4 text-amber-500" />}
					{isLocked && <Lock className="w-4 h-4 text-zinc-500" />}
					{isSolved && <CheckCircle className="w-4 h-4 text-green-500" />}
					{!isSticky && !isLocked && !isSolved && (
						<MessageSquare className="w-4 h-4 text-blue-500" />
					)}
				</div>
			</td>
			
			{/* Thread Info */}
			<td>
				<div className="flex flex-col">
					<div className="flex items-center">
						{prefix && (
							<span className={`mybb-thread-prefix ${getPrefixClass(prefix.name)}`}>
								{prefix.name}
							</span>
						)}
						<Link to={`/threads/${thread.slug}`} className="mybb-thread-title">
							{thread.title}
						</Link>
					</div>
					<div className="text-xs text-zinc-500 mt-1">
						Started by {thread.user.username}
						{thread.user.isOnline && <span className="mybb-online-indicator" title="Online" />}
						, {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
					</div>
				</div>
			</td>
			
			{/* Reply Count */}
			<td className="mybb-stats">
				<span className="mybb-stats-number">{thread.postCount - 1}</span>
				<span className="text-xs">Replies</span>
			</td>
			
			{/* View Count */}
			<td className="mybb-stats">
				<span className="mybb-stats-number">{thread.viewCount}</span>
				<span className="text-xs">Views</span>
			</td>
			
			{/* Last Post */}
			<td width="200" className="mybb-lastpost">
				{thread.lastPostAt ? (
					<div>
						<div className="truncate">
							<Link to={`/threads/${thread.slug}#latest`} className="text-blue-400 hover:underline text-xs">
								Last reply
							</Link>
						</div>
						<div className="mybb-lastpost-time">
							by <span className="mybb-lastpost-user">{thread.user.username}</span>
						</div>
						<div className="mybb-lastpost-time">
							{formatDistanceToNow(new Date(thread.lastPostAt), { addSuffix: true })}
						</div>
					</div>
				) : (
					<span className="text-zinc-500 text-xs">No replies yet</span>
				)}
			</td>
		</tr>
	);
}