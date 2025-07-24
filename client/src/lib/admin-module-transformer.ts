/**
 * Transform AdminModuleV2 to include backward compatibility properties
 */

import type { AdminModuleV2 } from '@app/config/admin.config';

/**
 * Enrich AdminModuleV2 with additional properties for backward compatibility
 */
export function enrichAdminModule(module: AdminModuleV2, index: number): AdminModuleV2 {
	return {
		...module,
		id: module.id || module.slug,
		name: module.name || module.label,
		enabled: module.enabled !== undefined ? module.enabled : !module.disabled,
		order: module.order !== undefined ? module.order : index * 10,
		route: module.route || module.path,
		description: module.description || `Manage ${module.label.toLowerCase()}`,
		children: module.children?.map((child, childIndex) => enrichAdminModule(child, childIndex))
	};
}

/**
 * Transform all admin modules
 */
export function enrichAdminModules(modules: AdminModuleV2[]): AdminModuleV2[] {
	return modules.map((module, index) => enrichAdminModule(module, index));
}