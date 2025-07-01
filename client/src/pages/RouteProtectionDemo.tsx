import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
	RequireAuth,
	RequireAdmin,
	RequireSuperAdmin,
	RequireModerator,
	RequireDev,
	useRouteProtection,
	useRequireAdmin
} from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hasRoleAtLeast } from '@/lib/roles';
import type { Role } from '@/lib/roles';

export default function RouteProtectionDemo() {
	const { user } = useAuth();
	const adminProtection = useRequireAdmin();

	if (!user) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Route Protection Demo</CardTitle>
						<CardDescription>Please log in to see the protection system in action</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => (window.location.href = '/auth')}>Go to Login</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const userRole = user.role as Role;

	return (
		<div className="container mx-auto py-8 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Route Protection System Demo</CardTitle>
					<CardDescription>
						Current user: <strong>{user.username}</strong> with role:{' '}
						<Badge variant="outline">{user.role}</Badge>
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Basic Authentication Demo */}
			<Card>
				<CardHeader>
					<CardTitle>Basic Authentication</CardTitle>
					<CardDescription>Requires any authenticated user</CardDescription>
				</CardHeader>
				<CardContent>
					<RequireAuth fallback={<p className="text-red-500">❌ Not authenticated</p>}>
						<p className="text-green-600">✅ You are authenticated!</p>
					</RequireAuth>
				</CardContent>
			</Card>

			{/* Role-based Access Demo */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Moderator Access */}
				<Card>
					<CardHeader>
						<CardTitle>Moderator Panel</CardTitle>
						<CardDescription>Requires moderator role or higher</CardDescription>
					</CardHeader>
					<CardContent>
						<RequireModerator
							fallback={
								<div className="text-orange-500">
									<p>❌ Access denied</p>
									<p className="text-sm">Requires: moderator+</p>
									<p className="text-sm">You have: {userRole}</p>
								</div>
							}
						>
							<div className="text-green-600">
								<p>✅ Moderator access granted</p>
								<Button variant="outline" size="sm" className="mt-2">
									View Reports
								</Button>
							</div>
						</RequireModerator>
					</CardContent>
				</Card>

				{/* Admin Access */}
				<Card>
					<CardHeader>
						<CardTitle>Admin Panel</CardTitle>
						<CardDescription>Requires admin role or higher</CardDescription>
					</CardHeader>
					<CardContent>
						<RequireAdmin
							fallback={
								<div className="text-orange-500">
									<p>❌ Access denied</p>
									<p className="text-sm">Requires: admin+</p>
									<p className="text-sm">You have: {userRole}</p>
								</div>
							}
						>
							<div className="text-green-600">
								<p>✅ Admin access granted</p>
								<Button variant="outline" size="sm" className="mt-2">
									Manage Users
								</Button>
							</div>
						</RequireAdmin>
					</CardContent>
				</Card>

				{/* Super Admin Access */}
				<Card>
					<CardHeader>
						<CardTitle>Super Admin Panel</CardTitle>
						<CardDescription>Requires exactly super_admin role</CardDescription>
					</CardHeader>
					<CardContent>
						<RequireSuperAdmin
							fallback={
								<div className="text-red-500">
									<p>❌ Access denied</p>
									<p className="text-sm">Requires: super_admin only</p>
									<p className="text-sm">You have: {userRole}</p>
								</div>
							}
						>
							<div className="text-green-600">
								<p>✅ Super admin access granted</p>
								<Button variant="outline" size="sm" className="mt-2">
									System Settings
								</Button>
							</div>
						</RequireSuperAdmin>
					</CardContent>
				</Card>

				{/* Dev Tools */}
				<Card>
					<CardHeader>
						<CardTitle>Developer Tools</CardTitle>
						<CardDescription>Requires dev role or higher</CardDescription>
					</CardHeader>
					<CardContent>
						<RequireDev
							fallback={
								<div className="text-orange-500">
									<p>❌ Access denied</p>
									<p className="text-sm">Requires: dev+</p>
									<p className="text-sm">You have: {userRole}</p>
								</div>
							}
						>
							<div className="text-green-600">
								<p>✅ Developer access granted</p>
								<Button variant="outline" size="sm" className="mt-2">
									API Console
								</Button>
							</div>
						</RequireDev>
					</CardContent>
				</Card>
			</div>

			{/* Programmatic Access Demo */}
			<Card>
				<CardHeader>
					<CardTitle>Programmatic Protection Hook</CardTitle>
					<CardDescription>Using useRouteProtection hook</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<p>
							<strong>Admin Protection Status:</strong>
						</p>
						<p>Can access: {adminProtection.canAccess ? '✅ Yes' : '❌ No'}</p>
						<p>Loading: {adminProtection.isLoading ? 'Yes' : 'No'}</p>
						{adminProtection.reason && (
							<p className="text-sm text-gray-600">Reason: {adminProtection.reason}</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Role Hierarchy Demo */}
			<Card>
				<CardHeader>
					<CardTitle>Role Hierarchy Test</CardTitle>
					<CardDescription>Testing role hierarchy with hasRoleAtLeast</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h4 className="font-semibold mb-2">Access Levels:</h4>
							<ul className="space-y-1 text-sm">
								<li>User access: {hasRoleAtLeast(userRole, 'user') ? '✅' : '❌'}</li>
								<li>Shoutbox mod: {hasRoleAtLeast(userRole, 'shoutbox_mod') ? '✅' : '❌'}</li>
								<li>Content mod: {hasRoleAtLeast(userRole, 'content_mod') ? '✅' : '❌'}</li>
								<li>Moderator: {hasRoleAtLeast(userRole, 'moderator') ? '✅' : '❌'}</li>
								<li>Admin: {hasRoleAtLeast(userRole, 'admin') ? '✅' : '❌'}</li>
								<li>Super Admin: {hasRoleAtLeast(userRole, 'super_admin') ? '✅' : '❌'}</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Role Hierarchy:</h4>
							<ul className="space-y-1 text-sm text-gray-600">
								<li>super_admin (100)</li>
								<li>admin (80)</li>
								<li>moderator (60)</li>
								<li>dev (50)</li>
								<li>content_mod (40)</li>
								<li>market_mod (40)</li>
								<li>shoutbox_mod (30)</li>
								<li>user (0)</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
