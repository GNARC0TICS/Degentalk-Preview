// Core route protection components
export { ProtectedRoute as default } from './RouteGuards';
export { ProtectedRoute } from './RouteGuards';
export { RequireRole } from './RequireRole';

// Convenience route guard components
export {
	RequireAuth,
	RequireAdmin,
	RequireSuperAdmin,
	RequireModerator,
	RequireDev,
	RequireShoutboxMod,
	RequireContentMod,
	RequireMarketMod,
	RequireRole as RequireSpecificRole,
	RequireTeamAccess,
	PublicOnlyRoute
} from './RouteGuards';

// Higher-order components
export {
	withRouteProtection,
	withAuth,
	withAdmin,
	withModerator,
	withSuperAdmin
} from './withRouteProtection';

// Global route monitoring
export { GlobalRouteGuard, useRouteAnalytics } from './GlobalRouteGuard';

// Hooks
export {
	useRouteProtection,
	useRequireAuth,
	useRequireAdmin,
	useRequireSuperAdmin,
	useRequireModerator,
	useRequireRole
} from '@/hooks/useRouteProtection';
