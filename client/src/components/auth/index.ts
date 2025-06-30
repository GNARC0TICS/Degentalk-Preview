// Core route protection components
export { ProtectedRoute } from './ProtectedRoute';
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
	RequireRole as RequireSpecificRole
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
