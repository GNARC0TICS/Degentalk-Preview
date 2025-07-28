import type { BrandConfig } from '@/config/brand.config';

// Runtime brand configuration with metadata
export type RuntimeBrandConfig = BrandConfig & {
	id?: string;
	name?: string;
	version?: string;
	environment?: 'dev' | 'staging' | 'prod';
	isActive?: boolean;
	metadata?: {
		lastModified?: Date;
		modifiedBy?: string;
		changeLog?: string[];
	};
};

// Partial update interface for brand config
export interface BrandConfigUpdate {
	colors?: Partial<BrandConfig['colors']>;
	animation?: Partial<BrandConfig['animation']>;
	typography?: Partial<BrandConfig['typography']>;
	cards?: Partial<BrandConfig['cards']>;
	spacing?: Partial<BrandConfig['spacing']>;
}

export const brandConfigApi = {
	async getConfig(): Promise<RuntimeBrandConfig> {
		const res = await fetch('/api/admin/brand-config', { credentials: 'include' });
		if (!res.ok) throw new Error('Failed to fetch brand config');
		return res.json();
	},

	async updateConfig(payload: BrandConfigUpdate & { id?: string }): Promise<RuntimeBrandConfig> {
		const res = await fetch('/api/admin/brand-config', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(payload)
		});
		if (!res.ok) throw new Error('Failed to update config');
		return res.json();
	}
};
