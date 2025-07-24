import React, { memo } from 'react';
import { IconRenderer } from '@app/components/icons/iconRenderer';

interface ThreadStatsProps {
	viewCount: number | null | undefined;
	postCount: number | null | undefined;
}

const ThreadStatsComponent: React.FC<ThreadStatsProps> = ({ viewCount, postCount }) => {
	return (
		<div className="flex flex-col items-end gap-1">
			<div className="flex items-center">
				<IconRenderer icon="views" size={12} className="h-3 w-3 mr-1" />
				<span>{viewCount ?? 0}</span>
			</div>
			<div className="flex items-center">
				<IconRenderer icon="replies" size={12} className="h-3 w-3 mr-1" />
				<span>{(postCount ?? 1) - 1}</span>
				{/* Assuming postCount includes the OP, so subtract 1 for reply count */}
			</div>
		</div>
	);
};

export const ThreadStats = memo(ThreadStatsComponent);
export default ThreadStats;
