import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Role {
	name: string;
	color?: string | null;
}

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({ role, className }) => {
	return (
		<Badge
			variant="secondary"
			className={cn('text-xs px-1.5 py-0', className)}
			style={role.color ? { borderColor: role.color, color: role.color } : undefined}
		>
			{role.name}
		</Badge>
	);
};
