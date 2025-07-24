import React from 'react';
import { IconRenderer } from '@app/components/icons/iconRenderer';
import { Button } from '@app/components/ui/button';
import { NavLink } from './NavLink';
import { useAuth } from '@app/hooks/use-auth';
import { hasRoleAtLeast } from '@app/utils/roles';
import type { Role } from '@app/utils/roles';

interface AdminButtonProps {
	className?: string;
}

export function AdminButton({ className }: AdminButtonProps) {
	const { user } = useAuth();

	if (!user || !hasRoleAtLeast(user.role as Role, 'moderator')) {
		return null;
	}

	const isAdminLevel = hasRoleAtLeast(user.role as Role, 'admin');
	const href = isAdminLevel ? '/admin' : '/mod';
	const label = isAdminLevel ? 'Admin Panel' : 'Moderator Panel';

	return (
		<NavLink href={href} analyticsLabel={isAdminLevel ? 'nav_admin' : 'nav_mod'}>
			<div className={`text-zinc-400 hover:text-white ${className}`}>
				<Button variant="ghost" size="icon" aria-label={label}>
					<IconRenderer icon="admin" className="h-5 w-5" />
				</Button>
			</div>
		</NavLink>
	);
}
