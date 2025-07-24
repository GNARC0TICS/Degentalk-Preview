import { adminModulesV2, ADMIN_PERMISSIONS, AdminModuleV2 } from '../config/admin.config.js';
import { enrichAdminModules } from './admin-module-transformer';
import { logger } from '@app/lib/logger";

// Simple User interface for admin module registry
interface User {
	id: string;
	role: string;
	username: string;
}

export interface ModuleRegistryOptions {
	strictPermissions?: boolean;
	devMode?: boolean;
}

export class AdminModuleV2Registry {
	private modules: Map<string, AdminModuleV2> = new Map();
	private options: ModuleRegistryOptions;
	private initialized = false;

	constructor(options: ModuleRegistryOptions = {}) {
		this.options = {
			strictPermissions: true,
			devMode: process.env.NODE_ENV === 'development',
			...options
		};
	}

	/**
	 * Initialize registry with default modules from adminModulesV2
	 */
	initialize(): void {
		if (this.initialized) return;

		// Register all modules from adminModulesV2 with enrichment
		const enrichedModules = enrichAdminModules(adminModulesV2);
		this.registerModules(enrichedModules);
		this.initialized = true;

		if (this.options.devMode) {
			logger.info('AdminModuleRegistry', 'AdminModuleV2Registry', { data: [`Initialized with ${this.modules.size} modules from adminModulesV2`] });
		}
	}

	/**
	 * Register a single module (AdminModuleV2)
	 */
	register(module: AdminModuleV2): void {
		if (this.modules.has(module.slug)) {
			if (this.options.devMode) {
				logger.warn('AdminModuleRegistry', `[AdminModuleV2Registry] Module ${module.slug} already registered, overwriting`);
			}
		}

		this.validateModule(module);
		this.modules.set(module.slug, { ...module });

		// Register sub-modules recursively
		if (module.children) {
			this.registerModules(module.children);
		}

		if (this.options.devMode) {
			logger.info('AdminModuleRegistry', 'AdminModuleV2Registry', { data: [`Registered module: ${module.slug}`] });
		}
	}

	/**
	 * Register multiple modules (AdminModuleV2[])
	 */
	registerModules(modules: AdminModuleV2[]): void {
		modules.forEach((module) => this.register(module));
	}

	/**
	 * Unregister a module
	 */
	unregister(moduleSlug: string): boolean {
		const existed = this.modules.delete(moduleSlug);

		if (existed && this.options.devMode) {
			logger.info('AdminModuleRegistry', 'AdminModuleV2Registry', { data: [`Unregistered module: ${moduleSlug}`] });
		}

		return existed;
	}

	/**
	 * Get all enabled modules
	 */
	getEnabled(): AdminModuleV2[] {
		this.ensureInitialized();

		return Array.from(this.modules.values())
			.filter((module) => !module.disabled) // Assuming 'disabled' property for enabled status
			.sort((a, b) => a.label.localeCompare(b.label)); // Sort by label for now, order not in V2
	}

	/**
	 * Get modules for a specific user based on permissions
	 */
	getModulesForUser(user: User | null): AdminModuleV2[] {
		if (!user) return [];

		this.ensureInitialized();

		const enabledModules = this.getEnabled();

		// In dev mode, bypass permission checks for easier testing
		if (this.options.devMode && !this.options.strictPermissions) {
			return enabledModules;
		}

		return enabledModules.filter((module) => this.hasPermission(module.slug, user));
	}

	/**
	 * Check if user has permission for a module
	 */
	hasPermission(moduleSlug: string, user: User | null): boolean {
		if (!user) return false;

		const module = this.modules.get(moduleSlug);
		if (!module) return false;

		// Dev mode bypass for testing
		if (this.options.devMode && !this.options.strictPermissions) {
			return true;
		}

		// Super admin has access to everything
		if (user.role === 'super_admin') {
			return true;
		}

		// Check if user has the required permission
		return this.userHasPermission(user, module.permission);
	}

	/**
	 * Get a specific module by slug
	 */
	getModule(moduleSlug: string): AdminModuleV2 | undefined {
		this.ensureInitialized();
		return this.modules.get(moduleSlug);
	}

	/**
	 * Get all modules (enabled and disabled)
	 */
	getAllModules(): AdminModuleV2[] {
		this.ensureInitialized();
		return Array.from(this.modules.values()).sort((a, b) => a.label.localeCompare(b.label));
	}

	/**
	 * Check if a module exists
	 */
	hasModule(moduleSlug: string): boolean {
		this.ensureInitialized();
		return this.modules.has(moduleSlug);
	}

	/**
	 * Get navigation structure for building menus
	 */
	getNavigationStructure(user: User | null): AdminModuleV2[] {
		const userModules = this.getModulesForUser(user);

		// Filter out modules that have children but no accessible children
		const filteredModules = userModules.filter(module => {
			if (module.children) {
				const accessibleChildren = module.children.filter(child => this.hasPermission(child.slug, user));
				// If a parent module has children, but none are accessible, don't show the parent
				return accessibleChildren.length > 0;
			}
			return true; // Always show modules without children
		});

		// Recursively filter children based on permissions
		const buildTree = (modules: AdminModuleV2[]): AdminModuleV2[] => {
			return modules.map(module => {
				if (module.children) {
					const accessibleChildren = module.children.filter(child => this.hasPermission(child.slug, user));
					return { ...module, children: buildTree(accessibleChildren) };
				}
				return module;
			});
		};

		return buildTree(filteredModules);
	}

	/**
	 * Reset registry to default configuration
	 */
	reset(): void {
		this.modules.clear();
		this.initialized = false;
		this.initialize();
	}

	// Private helper methods

	private ensureInitialized(): void {
		if (!this.initialized) {
			this.initialize();
		}
	}

	private validateModule(module: AdminModuleV2): void {
		if (!module.slug || !module.label || !module.path || !module.component || !module.permission) {
			throw new Error(`Invalid module configuration: ${JSON.stringify(module)}`);
		}
	}

	private userHasPermission(user: User, permission: string): boolean {
		// Assuming user.role directly maps to a permission set in ADMIN_PERMISSIONS
		// This needs to be aligned with how your roles and permissions are structured.
		// For now, we'll assume a simple check against the user's role.
		// A more robust system would check a user's specific permissions array.

		// Example: Check if the user's role has the permission
		const rolePermissions = ADMIN_PERMISSIONS[user.role as keyof typeof ADMIN_PERMISSIONS];
		if (rolePermissions && rolePermissions.includes(permission)) {
			return true;
		}

		// Fallback for super_admin if not explicitly defined in ADMIN_PERMISSIONS map
		if (user.role === 'super_admin') {
			return true;
		}

		return false;
	}
}

// Global registry instance
export const adminModuleRegistry = new AdminModuleV2Registry();

// Initialize on module load
adminModuleRegistry.initialize();