import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@app/components/ui/badge';
import type { Tag } from '@app/types/forum';

interface TagBadgeProps {
	tag: Tag;
	className?: string;
	// Optional: Add other variants or props as needed, e.g., for different sizes or click handlers
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, className }) => {
	if (!tag) return null;

	return (
		<Link to={`/tags/${tag.slug}`} className={className}>
			<Badge
				variant="secondary"
				className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600 transition-colors cursor-pointer"
			>
				#{tag.name}
			</Badge>
		</Link>
	);
};
