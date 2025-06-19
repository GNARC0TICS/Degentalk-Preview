import React from 'react';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserNameProps {
	user: any; // Loose for now – accepts ProfileData or ThreadAuthor
	className?: string;
	showTitle?: boolean;
}

export const UserName: React.FC<UserNameProps> = ({ user, className, showTitle = true }) => {
	const identity = useIdentityDisplay(user);

	if (!identity) return null;

	return (
		<span className={cn('inline-flex items-center gap-1', className)}>
			{/* Username */}
			<span
				style={identity.usernameColor ? { color: identity.usernameColor } : undefined}
				className="font-medium"
			>
				{identity.displayName}
			</span>

			{/* Role badge overrides title if present */}
			{identity.primaryRole && (
				<Badge
					variant="secondary"
					className="text-xs px-1.5 py-0"
					style={
						identity.primaryRole.color
							? { borderColor: identity.primaryRole.color, color: identity.primaryRole.color }
							: undefined
					}
				>
					{identity.primaryRole.name}
				</Badge>
			)}

			{/* Title badge (only when no primary role) */}
			{showTitle && !identity.primaryRole && identity.title && (
				<Badge variant="secondary" className="text-xs px-1.5 py-0">
					{identity.title}
				</Badge>
			)}
		</span>
	);
};
