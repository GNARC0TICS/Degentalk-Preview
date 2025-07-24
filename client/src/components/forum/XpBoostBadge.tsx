import React from 'react';
import { Badge } from '@app/components/ui/badge';

interface XpBoostBadgeProps {
	boostMultiplier: number;
	className?: string;
}

export function XpBoostBadge({ boostMultiplier, className = '' }: XpBoostBadgeProps) {
	// Only show badge if there's a meaningful boost
	if (!boostMultiplier || boostMultiplier <= 1) {
		return null;
	}

	return (
		<div className={`absolute top-2 right-2 z-10 ${className}`}>
			<Badge className="bg-purple-600 text-white font-bold">XP Boost x{boostMultiplier} 🚀</Badge>
		</div>
	);
}

export default XpBoostBadge;
