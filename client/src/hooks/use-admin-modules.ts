import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminModuleRegistry } from '@app/lib/admin-module-registry';
import { useAuth } from '@app/hooks/use-auth';
import type { AdminModuleV2 } from '@app/config/admin.config';
import { logger } from '@app/lib/logger';

export interface UseAdminModuleV2sReturn {
	modules: AdminModuleV2[];
	enabledModules: AdminModuleV2[];
	navigationStructure: AdminModuleV2[];
	hasModule: (moduleId: string) => boolean;
	hasPermission: (moduleId: string) => boolean;
	getModule: (moduleId: string) => AdminModuleV2 | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function useAdminModuleV2s(): UseAdminModuleV2sReturn {
	const { user } = useAuth();

	// Query for dynamic module configuration from server
	const {
		data: serverConfig,
		isLoading,
		error,
		refetch
	} = useQuery({
		queryKey: ['admin-modules-config'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/admin/modules/config');
				if (!response.ok) {
					throw new Error('Failed to fetch admin modules config');
				}
				return await response.json();
			} catch (err) {
				// Fallback to local config if server request fails
				logger.warn('useAdminModules', 'Using local admin config, server config unavailable:', err);
				return null;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1 // Only retry once before falling back to local config
	});

	// Apply server configuration overrides if available
	const modules = useMemo(() => {
		if (serverConfig?.modules) {
			// Update registry with server configuration
			adminModuleRegistry.reset();

			// Apply server-side feature flags and settings
			serverConfig.modules.forEach(
				(serverModule: { id: string; enabled: boolean; settings?: Record<string, unknown> }) => {
					const localModule = adminModuleRegistry.getModule(serverModule.id);
					if (localModule) {
						adminModuleRegistry.setModuleEnabled(serverModule.id, serverModule.enabled);
						if (serverModule.settings) {
							adminModuleRegistry.updateModuleSettings(serverModule.id, serverModule.settings);
						}
					}
				}
			);
		}

		return adminModuleRegistry.getModulesForUser(user);
	}, [user, serverConfig]);

	const enabledModules = useMemo(() => {
		return modules.filter((module) => module.enabled);
	}, [modules]);

	const navigationStructure = useMemo(() => {
		return adminModuleRegistry.getNavigationStructure(user);
	}, [user, modules]);

	const hasModule = useMemo(() => {
		return (moduleId: string) => adminModuleRegistry.hasModule(moduleId);
	}, []);

	const hasPermission = useMemo(() => {
		return (moduleId: string) => adminModuleRegistry.hasPermission(moduleId, user);
	}, [user]);

	const getModule = useMemo(() => {
		return (moduleId: string) => adminModuleRegistry.getModule(moduleId);
	}, []);

	return {
		modules,
		enabledModules,
		navigationStructure,
		hasModule,
		hasPermission,
		getModule,
		isLoading,
		error: error as Error | null,
		refetch
	};
}

// Hook for checking specific admin permissions
export function useAdminPermission(moduleId: string): {
	hasPermission: boolean;
	isLoading: boolean;
} {
	const { hasPermission, isLoading } = useAdminModuleV2s();

	return {
		hasPermission: hasPermission(moduleId),
		isLoading
	};
}

// Hook for getting a specific module
export function useAdminModuleV2(moduleId: string): {
	module: AdminModuleV2 | undefined;
	hasPermission: boolean;
	isEnabled: boolean;
	isLoading: boolean;
} {
	const { getModule, hasPermission, isLoading } = useAdminModuleV2s();

	const module = getModule(moduleId);

	return {
		module,
		hasPermission: hasPermission(moduleId),
		isEnabled: module?.enabled ?? false,
		isLoading
	};
}

// Hook for admin navigation
export function useAdminNavigation(): {
	navigationItems: AdminModuleV2[];
	isLoading: boolean;
} {
	const { navigationStructure, isLoading } = useAdminModuleV2s();

	return {
		navigationItems: navigationStructure,
		isLoading
	};
}
