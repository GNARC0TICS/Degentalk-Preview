/**
 * Admin Panel Utilities
 *
 * Shared utilities for admin components
 */

import type { AdminModuleV2 } from '@/config/admin.config';

// Status types
export type AdminStatusType = 'active' | 'disabled' | 'maintenance' | 'beta' | 'error';

// Status palette configuration
export interface StatusPalette {
	bg: string;
	text: string;
	border: string;
	icon: string;
	label: string;
}

/**
 * Get consistent status colors and styling
 */
export function getStatusPalette(status: AdminStatusType): StatusPalette {
	switch (status) {
		case 'active':
			return {
				bg: 'bg-admin-status-ok/10',
				text: 'text-admin-status-ok',
				border: 'border-admin-status-ok/20',
				icon: 'text-admin-status-ok',
				label: 'Active'
			};
		case 'disabled':
			return {
				bg: 'bg-admin-status-error/10',
				text: 'text-admin-status-error',
				border: 'border-admin-status-error/20',
				icon: 'text-admin-status-error',
				label: 'Disabled'
			};
		case 'maintenance':
			return {
				bg: 'bg-admin-status-warning/10',
				text: 'text-admin-status-warning',
				border: 'border-admin-status-warning/20',
				icon: 'text-admin-status-warning',
				label: 'Maintenance'
			};
		case 'beta':
			return {
				bg: 'bg-admin-text-accent/10',
				text: 'text-admin-text-accent',
				border: 'border-admin-text-accent/20',
				icon: 'text-admin-text-accent',
				label: 'Beta'
			};
		case 'error':
			return {
				bg: 'bg-admin-status-error/10',
				text: 'text-admin-status-error',
				border: 'border-admin-status-error/20',
				icon: 'text-admin-status-error',
				label: 'Error'
			};
		default:
			return getStatusPalette('active');
	}
}

/**
 * Determine module status from AdminModuleV2
 */
export function getModuleStatus(module: AdminModuleV2): AdminStatusType {
	if (!module.enabled) return 'disabled';
	if (module.settings?.maintenance) return 'maintenance';
	if (module.settings?.beta) return 'beta';
	return 'active';
}

/**
 * Get module status info with palette
 */
export function getModuleStatusInfo(module: AdminModuleV2) {
	const status = getModuleStatus(module);
	const palette = getStatusPalette(status);

	return {
		status,
		...palette
	};
}
