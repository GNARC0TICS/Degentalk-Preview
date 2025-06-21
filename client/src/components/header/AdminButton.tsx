import React from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';
import { Button } from '@/components/ui/button';
import { NavLink } from './NavLink';
import { useHeader } from './HeaderContext';

interface AdminButtonProps {
	className?: string;
}

export function AdminButton({ className }: AdminButtonProps) {
	const { user } = useHeader();

	if (!user?.isAdmin && !user?.isModerator) {
		return null;
	}

	const href = user.isAdmin ? '/admin' : '/mod';
	const label = user.isAdmin ? 'Admin Panel' : 'Moderator Panel';

	return (
		<NavLink href={href} analyticsLabel={user.isAdmin ? 'nav_admin' : 'nav_mod'}>
			<div className={`text-zinc-400 hover:text-white ${className}`}>
				<Button variant="ghost" size="icon" aria-label={label}>
					<IconRenderer icon="admin" className="h-5 w-5" />
				</Button>
			</div>
		</NavLink>
	);
}
