import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OriginForumPillProps {
	forum: { name: string; slug: string };
	className?: string;
}

/**
 * Displays the originating forum for a thread when shown in roll-up views (zone / parent-forum pages).
 */
const OriginForumPill: React.FC<OriginForumPillProps> = ({ forum, className = '' }) => {
	if (!forum) return null;
	return (
		<Badge
			className={`bg-zinc-800/70 border border-zinc-700 text-zinc-300 px-2 py-0.5 text-[10px] uppercase tracking-wider ${className}`}
		>
			{forum.name}
		</Badge>
	);
};

export default OriginForumPill;
