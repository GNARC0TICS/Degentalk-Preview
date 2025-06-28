import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminModuleRegistry } from '@shared/lib/admin-module-registry';
import { useAuth } from '@/hooks/use-auth';
import type { AdminModule } from '@shared/config/admin.config';

export interface UseAdminModulesReturn {
	modules: AdminModule[];
	enabledModules: AdminModule[];
	navigationStructure: AdminModule[];
	hasModule: (moduleId: string) => boolean;
	hasPermission: (moduleId: string) => boolean;
	getModule: (moduleId: string) => AdminModule | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function useAdminModules(): UseAdminModulesReturn {
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
				console.warn('Using local admin config, server config unavailable:', err);
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
			serverConfig.modules.forEach((serverModule: any) => {
				const localModule = adminModuleRegistry.getModule(serverModule.id);
				if (localModule) {
					adminModuleRegistry.setModuleEnabled(serverModule.id, serverModule.enabled);
					if (serverModule.settings) {
						adminModuleRegistry.updateModuleSettings(serverModule.id, serverModule.settings);
					}
				}
			});
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
	const { hasPermission, isLoading } = useAdminModules();

	return {
		hasPermission: hasPermission(moduleId),
		isLoading
	};
}

// Hook for getting a specific module
export function useAdminModule(moduleId: string): {
	module: AdminModule | undefined;
	hasPermission: boolean;
	isEnabled: boolean;
	isLoading: boolean;
} {
	const { getModule, hasPermission, isLoading } = useAdminModules();

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
	navigationItems: AdminModule[];
	isLoading: boolean;
} {
	const { navigationStructure, isLoading } = useAdminModules();

	return {
		navigationItems: navigationStructure,
		isLoading
	};
}
