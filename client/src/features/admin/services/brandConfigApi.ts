import { RuntimeBrandConfig, BrandConfigUpdate } from '@/types/compat/brand';

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
