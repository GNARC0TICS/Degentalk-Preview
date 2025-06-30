import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '@/lib/roles';

interface RouteGuardProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
}

// Authentication required (any authenticated user)
export function RequireAuth({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute requireAuth={true} fallback={fallback} redirectTo={redirectTo}>
			{children}
		</ProtectedRoute>
	);
}

// Admin panel access (admin or super_admin)
export function RequireAdmin({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="admin"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Super admin only
export function RequireSuperAdmin({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			exactRole="super_admin"
			fallback={fallback}
			redirectTo={redirectTo || '/admin'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Moderator or higher (moderator, admin, super_admin)
export function RequireModerator({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="moderator"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Development role (for dev tools)
export function RequireDev({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="dev"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Shoutbox moderation
export function RequireShoutboxMod({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="shoutbox_mod"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Content moderation
export function RequireContentMod({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="content_mod"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Market moderation
export function RequireMarketMod({ children, fallback, redirectTo }: RouteGuardProps) {
	return (
		<ProtectedRoute
			minRole="market_mod"
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}

// Generic role guard with custom role
interface RequireRoleProps extends RouteGuardProps {
	role: Role;
	exact?: boolean;
}

export function RequireRole({
	children,
	role,
	exact = false,
	fallback,
	redirectTo
}: RequireRoleProps) {
	return (
		<ProtectedRoute
			{...(exact ? { exactRole: role } : { minRole: role })}
			fallback={fallback}
			redirectTo={redirectTo || '/'}
			showError={true}
		>
			{children}
		</ProtectedRoute>
	);
}
