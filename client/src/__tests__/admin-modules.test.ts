import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminModuleRegistry } from '@shared/lib/admin-module-registry';
import { adminConfig, type AdminModule } from '@shared/config/admin.config';

// Mock user types for testing
const mockUsers = {
	admin: { id: '1', role: 'admin', email: 'admin@test.com' },
	moderator: { id: '2', role: 'moderator', email: 'mod@test.com' },
	user: { id: '3', role: 'user', email: 'user@test.com' },
	superAdmin: { id: '4', role: 'super_admin', email: 'super@test.com' }
} as const;

describe('AdminModuleRegistry', () => {
	let registry: AdminModuleRegistry;

	beforeEach(() => {
		registry = new AdminModuleRegistry({ devMode: false, strictPermissions: true });
	});

	describe('initialization', () => {
		it('should initialize with default modules', () => {
			registry.initialize();

			const modules = registry.getAllModules();
			expect(modules.length).toBeGreaterThan(0);
			expect(registry.hasModule('dashboard')).toBe(true);
			expect(registry.hasModule('users')).toBe(true);
			expect(registry.hasModule('xp-system')).toBe(true);
		});

		it('should not re-initialize if already initialized', () => {
			const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

			registry.initialize();
			const firstCount = registry.getAllModules().length;

			registry.initialize();
			const secondCount = registry.getAllModules().length;

			expect(firstCount).toBe(secondCount);
			spy.mockRestore();
		});
	});

	describe('module registration', () => {
		beforeEach(() => {
			registry.initialize();
		});

		it('should register a new module', () => {
			const testModule: AdminModule = {
				id: 'test-module',
				name: 'Test Module',
				icon: 'TestIcon',
				route: '/admin/test',
				component: vi.fn() as any,
				permissions: ['admin.test.view'],
				enabled: true,
				order: 999
			};

			registry.register(testModule);

			expect(registry.hasModule('test-module')).toBe(true);
			expect(registry.getModule('test-module')).toEqual(testModule);
		});

		it('should register sub-modules recursively', () => {
			const moduleWithSubs: AdminModule = {
				id: 'parent-module',
				name: 'Parent Module',
				icon: 'Parent',
				route: '/admin/parent',
				component: vi.fn() as any,
				permissions: ['admin.parent.view'],
				enabled: true,
				order: 998,
				subModules: [
					{
						id: 'child-module',
						name: 'Child Module',
						icon: 'Child',
						route: '/admin/parent/child',
						component: vi.fn() as any,
						permissions: ['admin.child.view'],
						enabled: true,
						order: 0
					}
				]
			};

			registry.register(moduleWithSubs);

			expect(registry.hasModule('parent-module')).toBe(true);
			expect(registry.hasModule('child-module')).toBe(true);
		});

		it('should validate module configuration', () => {
			const invalidModule = {
				id: '',
				name: 'Invalid'
				// Missing required fields
			} as any;

			expect(() => registry.register(invalidModule)).toThrow();
		});

		it('should unregister modules', () => {
			registry.register({
				id: 'temp-module',
				name: 'Temp',
				icon: 'Temp',
				route: '/admin/temp',
				component: vi.fn() as any,
				permissions: ['admin.temp.view'],
				enabled: true,
				order: 999
			});

			expect(registry.hasModule('temp-module')).toBe(true);

			const unregistered = registry.unregister('temp-module');
			expect(unregistered).toBe(true);
			expect(registry.hasModule('temp-module')).toBe(false);
		});
	});

	describe('permission checking', () => {
		beforeEach(() => {
			registry.initialize();
		});

		it('should allow super admin access to all modules', () => {
			const modules = registry.getModulesForUser(mockUsers.superAdmin as any);
			const allModules = registry.getEnabled();

			expect(modules.length).toBe(allModules.length);
		});

		it('should filter modules based on user permissions', () => {
			const adminModules = registry.getModulesForUser(mockUsers.admin as any);
			const modModules = registry.getModulesForUser(mockUsers.moderator as any);
			const userModules = registry.getModulesForUser(mockUsers.user as any);

			expect(adminModules.length).toBeGreaterThan(modModules.length);
			expect(modModules.length).toBeGreaterThan(userModules.length);
			expect(userModules.length).toBe(0); // Regular users have no admin access
		});

		it('should check individual module permissions', () => {
			expect(registry.hasPermission('dashboard', mockUsers.admin as any)).toBe(true);
			expect(registry.hasPermission('users', mockUsers.admin as any)).toBe(true);
			expect(registry.hasPermission('xp-system', mockUsers.moderator as any)).toBe(false);
			expect(registry.hasPermission('dashboard', mockUsers.user as any)).toBe(false);
		});

		it('should return false for non-existent modules', () => {
			expect(registry.hasPermission('non-existent', mockUsers.admin as any)).toBe(false);
		});

		it('should return false for null user', () => {
			expect(registry.hasPermission('dashboard', null)).toBe(false);
		});
	});

	describe('module management', () => {
		beforeEach(() => {
			registry.initialize();
		});

		it('should get only enabled modules', () => {
			const enabled = registry.getEnabled();

			enabled.forEach((module) => {
				expect(module.enabled).toBe(true);
			});
		});

		it('should sort modules by order', () => {
			const modules = registry.getEnabled();

			for (let i = 1; i < modules.length; i++) {
				expect(modules[i].order).toBeGreaterThanOrEqual(modules[i - 1].order);
			}
		});

		it('should enable/disable modules', () => {
			const moduleId = 'users';

			expect(registry.getModule(moduleId)?.enabled).toBe(true);

			registry.setModuleEnabled(moduleId, false);
			expect(registry.getModule(moduleId)?.enabled).toBe(false);

			registry.setModuleEnabled(moduleId, true);
			expect(registry.getModule(moduleId)?.enabled).toBe(true);
		});

		it('should update module settings', () => {
			const moduleId = 'xp-system';
			const newSettings = { maxLevel: 200, xpMultiplier: 2.0 };

			const updated = registry.updateModuleSettings(moduleId, newSettings);
			expect(updated).toBe(true);

			const module = registry.getModule(moduleId);
			expect(module?.settings).toEqual(expect.objectContaining(newSettings));
		});

		it('should return false when updating non-existent module', () => {
			const updated = registry.updateModuleSettings('non-existent', {});
			expect(updated).toBe(false);
		});
	});

	describe('navigation structure', () => {
		beforeEach(() => {
			registry.initialize();
		});

		it('should build navigation structure for admin', () => {
			const navigation = registry.getNavigationStructure(mockUsers.admin as any);

			expect(navigation.length).toBeGreaterThan(0);
			expect(navigation[0]).toHaveProperty('id');
			expect(navigation[0]).toHaveProperty('name');
			expect(navigation[0]).toHaveProperty('route');
		});

		it('should include sub-modules in navigation', () => {
			const navigation = registry.getNavigationStructure(mockUsers.admin as any);

			const usersModule = navigation.find((m) => m.id === 'users');
			expect(usersModule?.subModules).toBeDefined();
			expect(usersModule?.subModules?.length).toBeGreaterThan(0);
		});

		it('should filter navigation based on permissions', () => {
			const adminNav = registry.getNavigationStructure(mockUsers.admin as any);
			const modNav = registry.getNavigationStructure(mockUsers.moderator as any);

			expect(adminNav.length).toBeGreaterThanOrEqual(modNav.length);
		});
	});

	describe('dev mode behavior', () => {
		let devRegistry: AdminModuleRegistry;

		beforeEach(() => {
			devRegistry = new AdminModuleRegistry({
				devMode: true,
				strictPermissions: false
			});
			devRegistry.initialize();
		});

		it('should bypass permissions in dev mode', () => {
			const modules = devRegistry.getModulesForUser(mockUsers.user as any);
			const allModules = devRegistry.getEnabled();

			expect(modules.length).toBe(allModules.length);
		});

		it('should still respect permissions when strictPermissions is true', () => {
			const strictDevRegistry = new AdminModuleRegistry({
				devMode: true,
				strictPermissions: true
			});
			strictDevRegistry.initialize();

			const modules = strictDevRegistry.getModulesForUser(mockUsers.user as any);
			expect(modules.length).toBe(0);
		});
	});

	describe('reset functionality', () => {
		beforeEach(() => {
			registry.initialize();
		});

		it('should reset to default configuration', () => {
			// Add a custom module
			registry.register({
				id: 'custom-module',
				name: 'Custom',
				icon: 'Custom',
				route: '/admin/custom',
				component: vi.fn() as any,
				permissions: ['admin.custom.view'],
				enabled: true,
				order: 999
			});

			expect(registry.hasModule('custom-module')).toBe(true);

			registry.reset();

			expect(registry.hasModule('custom-module')).toBe(false);
			expect(registry.hasModule('dashboard')).toBe(true); // Default module should exist
		});
	});
});

describe('Admin Config', () => {
	it('should have valid default configuration', () => {
		expect(adminConfig.modules).toBeDefined();
		expect(adminConfig.modules.length).toBeGreaterThan(0);
		expect(adminConfig.defaultPermissions).toBeDefined();
		expect(adminConfig.features).toBeDefined();
	});

	it('should have consistent module structure', () => {
		adminConfig.modules.forEach((module) => {
			expect(module).toHaveProperty('id');
			expect(module).toHaveProperty('name');
			expect(module).toHaveProperty('icon');
			expect(module).toHaveProperty('route');
			expect(module).toHaveProperty('component');
			expect(module).toHaveProperty('permissions');
			expect(module).toHaveProperty('enabled');
			expect(module).toHaveProperty('order');

			expect(typeof module.id).toBe('string');
			expect(typeof module.name).toBe('string');
			expect(typeof module.route).toBe('string');
			expect(Array.isArray(module.permissions)).toBe(true);
			expect(typeof module.enabled).toBe('boolean');
			expect(typeof module.order).toBe('number');
		});
	});

	it('should have unique module IDs', () => {
		const ids = adminConfig.modules.map((m) => m.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should have unique routes', () => {
		const routes = adminConfig.modules.map((m) => m.route);
		const uniqueRoutes = new Set(routes);

		expect(uniqueRoutes.size).toBe(routes.length);
	});

	it('should have role-based permission defaults', () => {
		expect(adminConfig.defaultPermissions.superAdmin).toBeDefined();
		expect(adminConfig.defaultPermissions.admin).toBeDefined();
		expect(adminConfig.defaultPermissions.moderator).toBeDefined();

		expect(Array.isArray(adminConfig.defaultPermissions.superAdmin)).toBe(true);
		expect(Array.isArray(adminConfig.defaultPermissions.admin)).toBe(true);
		expect(Array.isArray(adminConfig.defaultPermissions.moderator)).toBe(true);
	});
});
