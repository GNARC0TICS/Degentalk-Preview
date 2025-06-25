import type { RuntimeBrandConfig, BrandConfigUpdate } from '@db_types/brand.types';

// Temporary static config until dynamic loading implemented.
const STATIC_BRAND_CONFIG = {
	colors: {
		primary: '#10b981',
		accent: '#059669'
	},
	typography: {
		fontPrimary: 'Inter'
	}
} as const; // minimal subset

/**
 * Service for managing brand configuration.
 * For Phase 1 we return static brandConfig as placeholder.
 */
class BrandService {
	async getActiveConfig(): Promise<RuntimeBrandConfig> {
		return {
			...STATIC_BRAND_CONFIG,
			id: 'static',
			name: 'Static Brand Config',
			version: '1.0.0',
			isActive: true,
			environment: 'dev'
		};
	}

	async updateConfig(_id: string, _payload: BrandConfigUpdate): Promise<RuntimeBrandConfig> {
		// TODO: Implement update in Phase 2
		return this.getActiveConfig();
	}
}

export const brandService = new BrandService();
