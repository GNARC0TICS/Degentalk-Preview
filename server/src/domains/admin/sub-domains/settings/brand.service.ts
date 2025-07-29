import type { RuntimeBrandConfig, BrandConfigUpdate } from '@shared/types';
import { brandConfigurations } from '@schema/admin/brandConfig';
import { db } from '@degentalk/db';
import { eq, desc } from 'drizzle-orm';

// Simple in-memory cache (invalidate on update)
let cachedConfig: RuntimeBrandConfig | null = null;
let lastFetched = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

// Fallback static config if DB is empty
const FALLBACK_CONFIG: RuntimeBrandConfig = {
	colors: {
		primary: '#10b981',
		accent: '#059669'
	},
	typography: {
		fontPrimary: 'Inter'
	}
};

/**
 * Service for managing brand configuration.
 * For Phase 1 we return static brandConfig as placeholder.
 */
class BrandService {
	async getActiveConfig(): Promise<RuntimeBrandConfig> {
		const now = Date.now();
		if (cachedConfig && now - lastFetched < CACHE_TTL_MS) return cachedConfig;

		const [row] = await db
			.select()
			.from(brandConfigurations)
			.where(eq(brandConfigurations.isActive, true))
			.orderBy(desc(brandConfigurations.updatedAt))
			.limit(1);

		if (row) {
			cachedConfig = {
				...(row.configData as any),
				id: row.id,
				name: row.name,
				version: row.version,
				environment: (row.environment as any) ?? 'dev',
				isActive: row.isActive
			} as RuntimeBrandConfig;
			lastFetched = now;
			return cachedConfig;
		}

		// No DB record yet – return fallback
		cachedConfig = FALLBACK_CONFIG;
		lastFetched = now;
		return cachedConfig;
	}

	async updateConfig(id: string | null, payload: BrandConfigUpdate): Promise<RuntimeBrandConfig> {
		// Merge payload with existing config or fallback
		const current = await this.getActiveConfig();
		const merged = { ...current, ...payload } as RuntimeBrandConfig;

		if (id) {
			await db
				.update(brandConfigurations)
				.set({ configData: merged, updatedAt: new Date() })
				.where(eq(brandConfigurations.id, id));
		} else {
			// Insert new row and mark active, deactivate others
			await db
				.update(brandConfigurations)
				.set({ isActive: false })
				.where(eq(brandConfigurations.isActive, true));
			await db.insert(brandConfigurations).values({
				name: 'Runtime Update',
				category: 'colors',
				themeKey: 'runtime',
				configData: merged,
				isActive: true,
				isDefault: false
			});
		}

		// Invalidate cache
		cachedConfig = null;
		return this.getActiveConfig();
	}
}

export const brandService = new BrandService();
