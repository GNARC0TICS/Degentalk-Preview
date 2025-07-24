import type { ReactNode } from 'react';
import { useAuth } from '@app/hooks/use-auth';
import { hasRoleAtLeast } from '@app/utils/roles';
import type { Role } from '@app/utils/roles';

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
