import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { ThreadDisplay } from '@app/types/thread.types';

interface ThreadRowProps {
	thread: ThreadDisplay;
	index?: number; // for zebra striping
}

/**
 * Classic forum style row – mimics early-2000s phpBB / vBulletin list
 */
const ThreadRow: React.FC<ThreadRowProps> = ({ thread, index }) => {
	const timeAgo = formatDistanceToNow(new Date(thread.updatedAt || thread.createdAt), {
		addSuffix: true
	});

	const rowClass = index % 2 === 0 ? 'bg-zinc-900/50' : 'bg-zinc-900/30';

	return (
		<tr className={`${rowClass} border-b border-zinc-700/40 hover:bg-zinc-800/60`}>
			{/* Status / Icon */}
			<td className="px-3 py-2 text-center text-zinc-400 text-xs w-8">
				{thread.isSticky ? '📌' : thread.isLocked ? '🔒' : ''}
			</td>

			{/* Thread title & author */}
			<td className="px-3 py-2">
				<Link to={`/threads/${thread.slug}`} className="text-blue-400 hover:underline">
					{thread.title}
				</Link>
				<div className="text-zinc-500 text-xs">by {thread.user.username}</div>
			</td>

			{/* Replies */}
			<td className="px-3 py-2 text-center text-zinc-200 text-sm w-20">
				{Math.max(0, (thread.postCount || 1) - 1)}
			</td>

			{/* Views */}
			<td className="px-3 py-2 text-center text-zinc-200 text-sm w-20">{thread.viewCount}</td>

			{/* Last post */}
			<td className="px-3 py-2 text-xs text-zinc-400 w-56">
				<div>{timeAgo}</div>
				<div className="truncate">by {thread.lastPosterUsername || thread.user.username}</div>
			</td>
		</tr>
	);
};

export default ThreadRow;
