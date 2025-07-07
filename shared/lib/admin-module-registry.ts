import { adminConfig, type AdminModule, type AdminPermission } from '../config/admin.config';
import { logger } from "../../server/src/core/logger";

// Simple User interface for admin module registry
interface User {
	id: string;
	role: string;
	username: string;
}

export interface ModuleRegistryOptions {
	enableAuditLog?: boolean;
	strictPermissions?: boolean;
	devMode?: boolean;
}

export class AdminModuleRegistry {
	private modules: Map<string, AdminModule> = new Map();
	private options: ModuleRegistryOptions;
	private initialized = false;

	constructor(options: ModuleRegistryOptions = {}) {
		this.options = {
			enableAuditLog: true,
			strictPermissions: true,
			devMode: process.env.NODE_ENV === 'development',
			...options
		};
	}

	/**
	 * Initialize registry with default modules from config
	 */
	initialize(): void {
		if (this.initialized) return;

		// Register all modules from config
		this.registerModules(adminConfig.modules);
		this.initialized = true;

		if (this.options.devMode) {
			logger.info(`[AdminModuleRegistry] Initialized with ${this.modules.size} modules`);
		}
	}

	/**
	 * Register a single module
	 */
	register(module: AdminModule): void {
		if (this.modules.has(module.id)) {
			if (this.options.devMode) {
				console.warn(`[AdminModuleRegistry] Module ${module.id} already registered, overwriting`);
			}
		}

		this.validateModule(module);
		this.modules.set(module.id, { ...module });

		// Register sub-modules recursively
		if (module.subModules) {
			this.registerModules(module.subModules);
		}

		if (this.options.devMode) {
			logger.info(`[AdminModuleRegistry] Registered module: ${module.id}`);
		}
	}

	/**
	 * Register multiple modules
	 */
	registerModules(modules: AdminModule[]): void {
		modules.forEach((module) => this.register(module));
	}

	/**
	 * Unregister a module
	 */
	unregister(moduleId: string): boolean {
		const existed = this.modules.delete(moduleId);

		if (existed && this.options.devMode) {
			logger.info(`[AdminModuleRegistry] Unregistered module: ${moduleId}`);
		}

		return existed;
	}

	/**
	 * Get all enabled modules
	 */
	getEnabled(): AdminModule[] {
		this.ensureInitialized();

		return Array.from(this.modules.values())
			.filter((module) => module.enabled)
			.sort((a, b) => a.order - b.order);
	}

	/**
	 * Get modules for a specific user based on permissions
	 */
	getModulesForUser(user: User | null): AdminModule[] {
		if (!user) return [];

		this.ensureInitialized();

		const enabledModules = this.getEnabled();

		// In dev mode, bypass permission checks for easier testing
		if (this.options.devMode && !this.options.strictPermissions) {
			return enabledModules;
		}

		return enabledModules.filter((module) => this.hasPermission(module.id, user));
	}

	/**
	 * Check if user has permission for a module
	 */
	hasPermission(moduleId: string, user: User | null): boolean {
		if (!user) return false;

		const module = this.modules.get(moduleId);
		if (!module) return false;

		// Dev mode bypass for testing
		if (this.options.devMode && !this.options.strictPermissions) {
			return true;
		}

		// Super admin has access to everything
		if (user.role === 'super_admin') {
			return true;
		}

		// Check if user has any of the required permissions
		return module.permissions.some((permission) =>
			this.userHasPermission(user, permission as AdminPermission)
		);
	}

	/**
	 * Get a specific module by ID
	 */
	getModule(moduleId: string): AdminModule | undefined {
		this.ensureInitialized();
		return this.modules.get(moduleId);
	}

	/**
	 * Get all modules (enabled and disabled)
	 */
	getAllModules(): AdminModule[] {
		this.ensureInitialized();
		return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
	}

	/**
	 * Check if a module exists
	 */
	hasModule(moduleId: string): boolean {
		this.ensureInitialized();
		return this.modules.has(moduleId);
	}

	/**
	 * Enable/disable a module
	 */
	setModuleEnabled(moduleId: string, enabled: boolean): boolean {
		this.ensureInitialized();

		const module = this.modules.get(moduleId);
		if (!module) return false;

		module.enabled = enabled;

		if (this.options.devMode) {
			logger.info(`[AdminModuleRegistry] Module ${moduleId} ${enabled ? 'enabled' : 'disabled'}`);
		}

		return true;
	}

	/**
	 * Update module settings
	 */
	updateModuleSettings(moduleId: string, settings: Record<string, any>): boolean {
		this.ensureInitialized();

		const module = this.modules.get(moduleId);
		if (!module) return false;

		module.settings = { ...module.settings, ...settings };

		if (this.options.devMode) {
			logger.info(`[AdminModuleRegistry] Updated settings for module: ${moduleId}`);
		}

		return true;
	}

	/**
	 * Get navigation structure for building menus
	 */
	getNavigationStructure(user: User | null): AdminModule[] {
		const userModules = this.getModulesForUser(user);
		logger.info('DEBUG: userModules count:', userModules.length);
		logger.info('DEBUG: userModules sample:', userModules.slice(0, 2).map((m) => ({
        				id: m.id,
        				hasSubModules: !!m.subModules,
        				subModulesCount: m.subModules?.length || 0
        			})));

		// Build a complete tree first, ensuring every module has subModules array
		const moduleMap = new Map<string, AdminModule>();
		const rootModules: AdminModule[] = [];

		// First pass: create all modules with empty subModules arrays
		for (const module of userModules) {
			const moduleWithSubModules: AdminModule = {
				...module,
				subModules: module.subModules || []
			};
			moduleMap.set(module.id, moduleWithSubModules);
		}

		// Second pass: organize into tree structure
		for (const module of userModules) {
			const moduleWithSubs = moduleMap.get(module.id)!;

			if (module.subModules) {
				// Filter submodules based on user permissions
				const accessibleSubModules = module.subModules.filter((subModule) =>
					this.hasPermission(subModule.id, user)
				);
				moduleWithSubs.subModules = accessibleSubModules;
				logger.info(`DEBUG: Module ${module.id} has ${module.subModules.length} total subModules, ${accessibleSubModules.length} accessible`);
			}

			rootModules.push(moduleWithSubs);
		}

		logger.info('DEBUG: rootModules count:', rootModules.length);
		logger.info('DEBUG: rootModules with subModules:', rootModules
        				.filter((m) => m.subModules && m.subModules.length > 0)
        				.map((m) => ({ id: m.id, subModulesCount: m.subModules?.length })));

		return rootModules;
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

	private validateModule(module: AdminModule): void {
		if (!module.id || !module.name || !module.route || !module.component) {
			throw new Error(`Invalid module configuration: ${JSON.stringify(module)}`);
		}

		if (!Array.isArray(module.permissions)) {
			throw new Error(`Module permissions must be an array: ${module.id}`);
		}

		if (typeof module.enabled !== 'boolean') {
			throw new Error(`Module enabled must be a boolean: ${module.id}`);
		}

		if (typeof module.order !== 'number') {
			throw new Error(`Module order must be a number: ${module.id}`);
		}
	}

	private userHasPermission(user: User, permission: AdminPermission): boolean {
		// Check user role permissions from config
		const rolePermissions =
			adminConfig.defaultPermissions[user.role as keyof typeof adminConfig.defaultPermissions] ||
			[];

		if (rolePermissions.includes(permission)) {
			return true;
		}

		// TODO: Implement user-specific permissions from database
		// This would check user.permissions array if it existed

		return false;
	}
}

// Global registry instance
export const adminModuleRegistry = new AdminModuleRegistry();

// Initialize on module load
adminModuleRegistry.initialize();
