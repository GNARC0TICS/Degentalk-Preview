import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Crown, Shield, Palette } from 'lucide-react';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { apiRequest } from '@/lib/queryClient';
import { RolesSection } from '@/components/admin/roles/RolesSection';
import { TitlesSection } from '@/components/admin/titles/TitlesSection';
import { PermissionsOverview } from '@/components/admin/permissions/PermissionsOverview';
import type { TitleId, PermissionId } from '@shared/types/ids';

// Types
export interface Role {
	id: string;
	name: string;
	slug: string;
	rank: number;
	description?: string;
	badgeImage?: string;
	textColor?: string;
	backgroundColor?: string;
	isStaff: boolean;
	isModerator: boolean;
	isAdmin: boolean;
	permissions: string[];
	xpMultiplier: number;
	isSystemRole?: boolean;
	createdAt: string;
	updatedAt: string;
	pluginData?: Record<string, any>;
}

export interface Title {
	id: TitleId;
	name: string;
	description?: string;
	iconUrl?: string;
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
	emoji?: string;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: string;
	textColor?: string;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
	borderStyle?: string;
	borderRadius?: number;
	glowColor?: string;
	glowIntensity?: number;
	shadowColor?: string;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;
	gradientStart?: string;
	gradientEnd?: string;
	gradientDirection?: string;
	animation?: string;
	animationDuration?: number;
	roleId?: string;
	roleName?: string;
	isShopItem: boolean;
	isUnlockable: boolean;
	unlockConditions?: Record<string, any>;
	shopPrice?: number;
	shopCurrency?: 'DGT' | 'XP' | 'USD';
	createdAt: string;
}

export interface Permission {
	id: PermissionId;
	name: string;
	description?: string;
	category?: string;
	createdAt: string;
}

export default function RolesTitlesPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('roles');

	// Fetch roles
	const {
		data: roles = [],
		isLoading: rolesLoading,
		isError: rolesError
	} = useQuery({
		queryKey: ['admin-roles'],
		queryFn: async (): Promise<Role[]> => {
			return apiRequest({ url: '/api/admin/roles', method: 'GET' });
		}
	});

	// Fetch titles
	const {
		data: titles = [],
		isLoading: titlesLoading,
		isError: titlesError
	} = useQuery({
		queryKey: ['admin-titles'],
		queryFn: async (): Promise<Title[]> => {
			return apiRequest({ url: '/api/admin/titles', method: 'GET' });
		}
	});

	// Fetch permissions
	const {
		data: permissions = {},
		isLoading: permissionsLoading,
		isError: permissionsError
	} = useQuery({
		queryKey: ['admin-permissions-grouped'],
		queryFn: async (): Promise<Record<string, Permission[]>> => {
			return apiRequest({ url: '/api/admin/permissions/by-category', method: 'GET' });
		}
	});

	const isLoading = rolesLoading || titlesLoading || permissionsLoading;
	const hasError = rolesError || titlesError || permissionsError;

	// Get stats for overview
	const totalRoles = roles.length;
	const totalTitles = titles.length;
	const totalPermissions = Object.values(permissions).flat().length;
	const systemRoles = roles.filter((r) => r.isSystemRole).length;
	const customTitles = titles.filter((t) => !t.roleId).length;
	const roleBoundTitles = titles.filter((t) => t.roleId).length;

	const pageActions = (
		<div className="flex gap-2">
			<Button
				variant="outline"
				onClick={() => setActiveTab('roles')}
				className={activeTab === 'roles' ? 'bg-accent' : ''}
			>
				<Shield className="h-4 w-4 mr-2" />
				Roles
			</Button>
			<Button
				variant="outline"
				onClick={() => setActiveTab('titles')}
				className={activeTab === 'titles' ? 'bg-accent' : ''}
			>
				<Crown className="h-4 w-4 mr-2" />
				Titles
			</Button>
			<Button
				variant="outline"
				onClick={() => setActiveTab('permissions')}
				className={activeTab === 'permissions' ? 'bg-accent' : ''}
			>
				<Settings className="h-4 w-4 mr-2" />
				Permissions
			</Button>
		</div>
	);

	if (hasError) {
		return (
			<AdminPageShell title="Roles, Titles & Permissions" pageActions={pageActions}>
				<Card>
					<CardContent className="p-6">
						<p className="text-red-500">Failed to load data. Please refresh the page.</p>
					</CardContent>
				</Card>
			</AdminPageShell>
		);
	}

	return (
		<AdminPageShell title="Roles, Titles & Permissions" pageActions={pageActions}>
			<div className="space-y-6">
				{/* Overview Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Roles</p>
									<p className="text-2xl font-bold">{totalRoles}</p>
								</div>
								<Shield className="h-8 w-8 text-blue-500" />
							</div>
							{systemRoles > 0 && (
								<Badge variant="outline" className="mt-2">
									{systemRoles} system roles
								</Badge>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Titles</p>
									<p className="text-2xl font-bold">{totalTitles}</p>
								</div>
								<Crown className="h-8 w-8 text-yellow-500" />
							</div>
							<div className="flex gap-1 mt-2">
								{customTitles > 0 && (
									<Badge variant="outline" className="text-xs">
										{customTitles} custom
									</Badge>
								)}
								{roleBoundTitles > 0 && (
									<Badge variant="outline" className="text-xs">
										{roleBoundTitles} role-bound
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Permissions</p>
									<p className="text-2xl font-bold">{totalPermissions}</p>
								</div>
								<Settings className="h-8 w-8 text-green-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								{Object.keys(permissions).length} categories
							</Badge>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">System Health</p>
									<p className="text-2xl font-bold text-green-600">✓</p>
								</div>
								<Palette className="h-8 w-8 text-purple-500" />
							</div>
							<Badge variant="outline" className="mt-2">
								All systems operational
							</Badge>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="roles" className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Roles
						</TabsTrigger>
						<TabsTrigger value="titles" className="flex items-center gap-2">
							<Crown className="h-4 w-4" />
							Titles
						</TabsTrigger>
						<TabsTrigger value="permissions" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							Permissions
						</TabsTrigger>
					</TabsList>

					<TabsContent value="roles" className="space-y-6">
						<RolesSection
							roles={roles}
							permissions={permissions}
							titles={titles}
							isLoading={isLoading}
						/>
					</TabsContent>

					<TabsContent value="titles" className="space-y-6">
						<TitlesSection titles={titles} roles={roles} isLoading={isLoading} />
					</TabsContent>

					<TabsContent value="permissions" className="space-y-6">
						<PermissionsOverview permissions={permissions} roles={roles} isLoading={isLoading} />
					</TabsContent>
				</Tabs>
			</div>
		</AdminPageShell>
	);
}
