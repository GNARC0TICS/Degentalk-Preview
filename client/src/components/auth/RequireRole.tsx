import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasRoleAtLeast } from '@/lib/roles';
import type { Role } from '@/lib/roles';

interface RequireRoleProps {
	minRole: Role;
	children: ReactNode;
	fallback?: ReactNode;
}

export function RequireRole({ minRole, children, fallback = null }: RequireRoleProps) {
	const { user } = useAuth();

	if (!user) {
		return <>{fallback}</>;
	}

	const hasPermission = hasRoleAtLeast(user.role as Role, minRole);

	return hasPermission ? <>{children}</> : <>{fallback}</>;
}
