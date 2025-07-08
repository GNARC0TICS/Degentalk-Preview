import type { ComponentType } from 'react';
import {
	RequireAuth,
	RequireAdmin,
	RequireModerator,
	RequireSuperAdmin,
	RequireRole
} from './RouteGuards';
import type { Role } from '@/lib/roles';

export function withRouteProtection<P extends object>(
	Component: ComponentType<P>,
	requireAuth: boolean = true,
	redirectTo: string = '/auth'
): ComponentType<P> {
	return (props: P) => (
		<RequireAuth redirectTo={redirectTo}>
			<Component {...props} />
		</RequireAuth>
	);
}

export function withAuth<P extends object>(
	Component: ComponentType<P>,
	redirectTo: string = '/auth'
): ComponentType<P> {
	return withRouteProtection(Component, true, redirectTo);
}

export function withAdmin<P extends object>(
	Component: ComponentType<P>,
	redirectTo: string = '/'
): ComponentType<P> {
	return (props: P) => (
		<RequireAdmin redirectTo={redirectTo}>
			<Component {...props} />
		</RequireAdmin>
	);
}

export function withModerator<P extends object>(
	Component: ComponentType<P>,
	redirectTo: string = '/'
): ComponentType<P> {
	return (props: P) => (
		<RequireModerator redirectTo={redirectTo}>
			<Component {...props} />
		</RequireModerator>
	);
}

export function withSuperAdmin<P extends object>(
	Component: ComponentType<P>,
	redirectTo: string = '/'
): ComponentType<P> {
	return (props: P) => (
		<RequireSuperAdmin redirectTo={redirectTo}>
			<Component {...props} />
		</RequireSuperAdmin>
	);
}

export function withRole<P extends object>(
	Component: ComponentType<P>,
	minRole?: Role,
	exactRole?: Role,
	redirectTo: string = '/'
): ComponentType<P> {
	return (props: P) => {
		const roleProps: any = { redirectTo };
		if (minRole !== undefined) roleProps.minRole = minRole;
		if (exactRole !== undefined) roleProps.exactRole = exactRole;
		
		return (
			<RequireRole {...roleProps}>
				<Component {...props} />
			</RequireRole>
		);
	};
}
