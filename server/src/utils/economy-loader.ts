import { economyConfig } from '@shared/economy/economy.config';
import { economyConfigOverrides } from '@schema';
import { db } from '@db';

/**
 * Returns the merged economy configuration used throughout the backend.
 * Defaults to the canonical config in `shared/economy/economy.config.ts` but merges
 * any overrides stored in the `economy_config_overrides` table (if present).
 */
export async function loadEconomyConfig() {
	// Drizzle returns an array; we only expect zero or one row.
	const [overrideRow] = await db
		.select({ config: economyConfigOverrides.config })
		.from(economyConfigOverrides)
		.limit(1);

	return overrideRow ? { ...economyConfig, ...overrideRow.config } : economyConfig;
}

/**
 * Replaces the current overrides with the provided partial config.
 * Passing `null` will delete all overrides and restore defaults.
 */
export async function saveEconomyOverrides(newConfig: Record<string, unknown> | null) {
	// Use a trx to ensure atomicity
	return db.transaction(async (trx) => {
		await trx.delete(economyConfigOverrides);
		if (newConfig) {
			await trx.insert(economyConfigOverrides).values({ config: newConfig });
		}
	});
} 