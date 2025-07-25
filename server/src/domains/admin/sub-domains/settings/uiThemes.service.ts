import { eq } from 'drizzle-orm';
import { db } from '@core/db';
import { uiThemes, type UiTheme, type NewUiTheme } from '@schema/admin/uiThemes';
import { ZONE_THEMES as zoneThemesConfig } from '@shared/config/forumThemes.config';

interface UiThemesCache {
	data: Record<string, UiTheme>;
	timestamp: number;
}

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let cache: UiThemesCache | null = null;

export class UiThemesService {
	/**
	 * Get all active themes merged with fallback config.
	 */
	async getAll(): Promise<Record<string, UiTheme>> {
		// Return from cache if fresh
		if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
			return cache.data;
		}

		// Fetch from DB
		const themes = await db.select().from(uiThemes).where(eq(uiThemes.isActive, true));

		// Map to key object
		const themeMap: Record<string, UiTheme> = {};
		for (const theme of themes) {
			themeMap[theme.themeKey] = theme;
		}

		// Merge with config as fallback
		for (const [key, configTheme] of Object.entries(zoneThemesConfig)) {
			if (!themeMap[key]) {
				// Cast config to UiTheme-ish object (some fields may be undefined)
				themeMap[key] = {
					themeKey: key,
					id: 0, // placeholder (config, not DB)
					icon: configTheme.icon?.name ?? null,
					color: configTheme.accent ?? null,
					bgColor: configTheme.gradient ?? null,
					borderColor: configTheme.border ?? null,
					label: key ?? null,
					version: 1,
					isActive: true,
					metadata: {},
					createdAt: new Date(),
					updatedAt: new Date()
				} as unknown as UiTheme; // Accept partial for fallback
			}
		}

		cache = { data: themeMap, timestamp: Date.now() };
		return themeMap;
	}

	/**
	 * Upsert theme by key
	 */
	async upsert(themeKey: string, data: Partial<NewUiTheme>): Promise<UiTheme> {
		// Attempt update
		const [existing] = await db.select().from(uiThemes).where(eq(uiThemes.themeKey, themeKey));

		let record: UiTheme;

		if (existing) {
			[record] = await db
				.update(uiThemes)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(uiThemes.themeKey, themeKey))
				.returning();
		} else {
			const [inserted] = await db
				.insert(uiThemes)
				.values({ themeKey, ...data, createdAt: new Date(), updatedAt: new Date() })
				.returning();
			record = inserted;
		}

		// Invalidate cache
		cache = null;
		return record;
	}

	/**
	 * Manual cache invalidation
	 */
	invalidateCache() {
		cache = null;
	}
}

export const uiThemesService = new UiThemesService();
