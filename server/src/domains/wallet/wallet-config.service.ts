/**
 * Wallet Configuration Service
 *
 * Manages wallet configuration with database-driven settings and caching.
 * Provides runtime config updates via admin panel.
 */

import { db } from '@db';
import { siteSettings } from '@schema';
import { eq } from 'drizzle-orm';
import type { WalletConfig } from './wallet.config';
import { defaultWalletConfig, getEnvironmentConfig, WALLET_CONFIG_KEYS } from './wallet.config';

/**
 * In-memory cache for wallet configuration
 */
class WalletConfigCache {
	private config: WalletConfig | null = null;
	private lastFetch: number = 0;
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	get(forceRefresh = false): WalletConfig | null {
		const now = Date.now();
		if (forceRefresh || !this.config || now - this.lastFetch > this.CACHE_TTL) {
			return null; // Cache miss or expired
		}
		return this.config;
	}

	set(config: WalletConfig): void {
		this.config = config;
		this.lastFetch = Date.now();
	}

	invalidate(): void {
		this.config = null;
		this.lastFetch = 0;
	}
}

const configCache = new WalletConfigCache();

/**
 * Wallet Configuration Service
 */
export class WalletConfigService {
	/**
	 * Get current wallet configuration
	 * Loads from cache, falls back to database, then defaults
	 */
	async getConfig(forceRefresh = false): Promise<WalletConfig> {
		try {
			// Check cache first
			const cached = configCache.get(forceRefresh);
			if (cached && !forceRefresh) {
				return cached;
			}

			// Load from database
			const config = await this.loadConfigFromDatabase();

			// Cache and return
			configCache.set(config);
			return config;
		} catch (error) {
			console.error('Error loading wallet config, using defaults:', error);
			return this.getDefaultConfig();
		}
	}

	/**
	 * Update a single wallet configuration setting (admin helper)
	 */
	async updateSetting(key: keyof typeof WALLET_CONFIG_KEYS, value: any): Promise<void> {
		try {
			const settingKey = WALLET_CONFIG_KEYS[key];

			// Update in database
			await db
				.insert(siteSettings)
				.values({
					key: key,
					value: JSON.stringify(value),
					type: typeof value,
					description: `Wallet setting: ${settingKey}`,
					category: 'wallet',
					isPublic: false
				})
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: {
						value: JSON.stringify(value),
						updatedAt: new Date()
					}
				});

			// Invalidate cache
			configCache.invalidate();

			console.log(`Wallet config updated: ${key} = ${value}`);
		} catch (error) {
			console.error('Error updating wallet config:', error);
			throw new Error(`Failed to update wallet configuration: ${error.message}`);
		}
	}

	/**
	 * Update multiple configuration settings at once
	 */
	async updateMultipleConfigs(updates: Record<string, any>): Promise<void> {
		try {
			// Prepare batch updates
			const settings = Object.entries(updates).map(([key, value]) => ({
				key: key,
				value: JSON.stringify(value),
				type: typeof value,
				description: `Wallet setting: ${WALLET_CONFIG_KEYS[key] || key}`,
				category: 'wallet',
				isPublic: false
			}));

			// Batch insert/update
			for (const setting of settings) {
				await db
					.insert(siteSettings)
					.values(setting)
					.onConflictDoUpdate({
						target: siteSettings.key,
						set: {
							value: setting.value,
							updatedAt: new Date()
						}
					});
			}

			// Invalidate cache
			configCache.invalidate();

			console.log(`Wallet config batch updated: ${Object.keys(updates).length} settings`);
		} catch (error) {
			console.error('Error updating multiple wallet configs:', error);
			throw new Error(`Failed to update wallet configurations: ${error.message}`);
		}
	}

	/**
	 * Reset only defined wallet keys back to default (used by migration scripts)
	 */
	async resetToDefaultsPartial(): Promise<void> {
		try {
			// Delete all wallet settings
			const walletKeys = Object.keys(WALLET_CONFIG_KEYS);
			for (const key of walletKeys) {
				await db.delete(siteSettings).where(eq(siteSettings.key, key));
			}

			// Invalidate cache
			configCache.invalidate();

			console.log('Wallet config reset to defaults');
		} catch (error) {
			console.error('Error resetting wallet config:', error);
			throw new Error(`Failed to reset wallet configuration: ${error.message}`);
		}
	}

	/**
	 * Get configuration with admin override capabilities
	 */
	async getConfigForAdmin(): Promise<{
		current: WalletConfig;
		defaults: WalletConfig;
		overrides: Record<string, any>;
	}> {
		const current = await this.getConfig();
		const defaults = this.getDefaultConfig();
		const overrides = await this.getConfigOverrides();

		return {
			current,
			defaults,
			overrides
		};
	}

	/**
	 * Check if a specific feature is enabled
	 */
	async isFeatureEnabled(feature: keyof WalletConfig['features']): Promise<boolean> {
		const config = await this.getConfig();
		return config.features[feature];
	}

	/**
	 * Get DGT conversion rate
	 */
	async getDGTConversionRate(): Promise<number> {
		const config = await this.getConfig();
		return config.dgt.usdToDGTRate;
	}

	/**
	 * Get rate limits for a specific action
	 */
	async getRateLimit(action: keyof WalletConfig['limits']): Promise<number> {
		const config = await this.getConfig();
		return config.limits[action];
	}

	/**
	 * Load configuration from database
	 */
	private async loadConfigFromDatabase(): Promise<WalletConfig> {
		const config = this.getDefaultConfig();

		try {
			// Get all wallet settings from database
			const walletKeys = Object.keys(WALLET_CONFIG_KEYS);
			const settings = await db
				.select()
				.from(siteSettings)
				.where(eq(siteSettings.category, 'wallet'));

			// Apply database overrides
			for (const setting of settings) {
				if (walletKeys.includes(setting.key)) {
					const configPath = WALLET_CONFIG_KEYS[setting.key];
					const value = JSON.parse(setting.value);

					// Set nested property using path
					this.setNestedProperty(config, configPath, value);
				}
			}
		} catch (error) {
			console.error('Error loading wallet settings from database:', error);
			// Return defaults if database load fails
		}

		return config;
	}

	/**
	 * Get default configuration with environment overrides
	 */
	private getDefaultConfig(): WalletConfig {
		const envOverrides = getEnvironmentConfig();
		return {
			...defaultWalletConfig,
			...envOverrides,
			// Deep merge for nested objects
			ccpayment: { ...defaultWalletConfig.ccpayment, ...envOverrides.ccpayment },
			features: { ...defaultWalletConfig.features, ...envOverrides.features },
			dgt: { ...defaultWalletConfig.dgt, ...envOverrides.dgt },
			limits: { ...defaultWalletConfig.limits, ...envOverrides.limits },
			security: { ...defaultWalletConfig.security, ...envOverrides.security }
		};
	}

	/**
	 * Get current config overrides from database
	 */
	private async getConfigOverrides(): Promise<Record<string, any>> {
		const overrides: Record<string, any> = {};

		try {
			const settings = await db
				.select()
				.from(siteSettings)
				.where(eq(siteSettings.category, 'wallet'));

			for (const setting of settings) {
				overrides[setting.key] = JSON.parse(setting.value);
			}
		} catch (error) {
			console.error('Error loading config overrides:', error);
		}

		return overrides;
	}

	/**
	 * Set nested property using dot notation path
	 */
	private setNestedProperty(obj: any, path: string, value: any): void {
		const keys = path.split('.');
		let current = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			if (!(keys[i] in current)) {
				current[keys[i]] = {};
			}
			current = current[keys[i]];
		}

		current[keys[keys.length - 1]] = value;
	}

	/**
	 * Update full wallet configuration
	 */
	async updateConfig(newConfig: Partial<WalletConfig>): Promise<void> {
		try {
			// Validate that the config contains valid settings
			const mergedConfig = { ...defaultWalletConfig, ...newConfig };

			// Update each section
			if (newConfig.ccpayment) {
				await this.updateMultipleConfigs({
					'ccpayment.autoSwapEnabled': newConfig.ccpayment.autoSwapEnabled,
					'ccpayment.autoWithdrawEnabled': newConfig.ccpayment.autoWithdrawEnabled,
					'ccpayment.testNetworkEnabled': newConfig.ccpayment.testNetworkEnabled,
					'ccpayment.rateLockEnabled': newConfig.ccpayment.rateLockEnabled
				});
			}

			if (newConfig.features) {
				await this.updateMultipleConfigs({
					'features.allowCryptoWithdrawals': newConfig.features.allowCryptoWithdrawals,
					'features.allowCryptoSwaps': newConfig.features.allowCryptoSwaps,
					'features.allowDGTSpending': newConfig.features.allowDGTSpending,
					'features.allowInternalTransfers': newConfig.features.allowInternalTransfers,
					'features.allowManualCredits': newConfig.features.allowManualCredits
				});
			}

			if (newConfig.dgt) {
				await this.updateMultipleConfigs({
					'dgt.usdPrice': newConfig.dgt.usdPrice,
					'dgt.usdToDGTRate': newConfig.dgt.usdToDGTRate,
					'dgt.minDepositUSD': newConfig.dgt.minDepositUSD,
					'dgt.maxDGTBalance': newConfig.dgt.maxDGTBalance
				});
			}

			if (newConfig.limits) {
				await this.updateMultipleConfigs({
					'limits.depositsPerHour': newConfig.limits.depositsPerHour,
					'limits.tipsPerMinute': newConfig.limits.tipsPerMinute,
					'limits.maxDGTTransfer': newConfig.limits.maxDGTTransfer,
					'limits.maxDailyCreditAmount': newConfig.limits.maxDailyCreditAmount
				});
			}

			console.log('Wallet configuration updated successfully');
		} catch (error) {
			console.error('Error updating wallet config:', error);
			throw new Error(`Failed to update wallet configuration: ${error.message}`);
		}
	}
}

// Export singleton instance
export const walletConfigService = new WalletConfigService();
