/**
 * Settings Service
 *
 * Manages runtime configuration updates with JSONB database storage
 * and websocket events for real-time UI updates
 */

import { logger } from '@core/logger';
import { db } from '@db';
import { adminSettings } from '@schema';
import { eq } from 'drizzle-orm';
import { EventEmitter } from 'events';

export interface WalletSettings {
	autoConvertDeposits: boolean;
	manualConversionAllowed: boolean;
	conversionRateBuffer: number;
	depositsEnabled: boolean;
	withdrawalsEnabled: boolean;
	internalTransfersEnabled: boolean;
}

class SettingsService extends EventEmitter {
	private walletSettingsCache: WalletSettings | null = null;
	private readonly WALLET_DOMAIN = 'wallet';

	private readonly defaultWalletSettings: WalletSettings = {
		autoConvertDeposits: true,
		manualConversionAllowed: false,
		conversionRateBuffer: 0.02,
		depositsEnabled: true,
		withdrawalsEnabled: true,
		internalTransfersEnabled: true
	};

	constructor() {
		super();
	}

	/**
	 * Update wallet settings and persist to database
	 */
	async updateWalletSettings(updates: Partial<WalletSettings>): Promise<WalletSettings> {
		logger.info('SettingsService', 'Updating wallet settings', { updates });

		// Validate updates
		this.validateWalletSettings(updates);

		// Get current settings
		const currentSettings = await this.getWalletSettings();

		// Apply updates immutably
		const newSettings = {
			...currentSettings,
			...updates
		};

		// Persist to database
		await this.saveWalletSettingsToDb(newSettings);

		// Update cache
		this.walletSettingsCache = newSettings;

		// Emit websocket event for real-time UI updates
		this.emit('walletSettingsUpdated', newSettings);

		logger.info('SettingsService', 'Wallet settings updated successfully', {
			newSettings
		});

		return newSettings;
	}

	/**
	 * Get current wallet settings (cached or from database)
	 */
	async getWalletSettings(): Promise<WalletSettings> {
		if (this.walletSettingsCache) {
			return { ...this.walletSettingsCache };
		}

		try {
			const result = await db
				.select()
				.from(adminSettings)
				.where(eq(adminSettings.domain, this.WALLET_DOMAIN))
				.limit(1);

			if (result.length === 0) {
				// No settings found, use defaults and create record
				await this.saveWalletSettingsToDb(this.defaultWalletSettings);
				this.walletSettingsCache = this.defaultWalletSettings;
				return { ...this.defaultWalletSettings };
			}

			const settings = result[0].settings as WalletSettings;

			// Merge with defaults in case new settings were added
			const mergedSettings = {
				...this.defaultWalletSettings,
				...settings
			};

			this.walletSettingsCache = mergedSettings;
			return { ...mergedSettings };
		} catch (error) {
			logger.error('SettingsService', 'Failed to load wallet settings from database', { error });
			// Fallback to defaults
			return { ...this.defaultWalletSettings };
		}
	}

	/**
	 * Get current wallet settings synchronously (use cached version)
	 */
	getWalletSettingsSync(): WalletSettings {
		return this.walletSettingsCache
			? { ...this.walletSettingsCache }
			: { ...this.defaultWalletSettings };
	}

	/**
	 * Clear settings cache (forces reload from database)
	 */
	clearCache(): void {
		this.walletSettingsCache = null;
	}

	/**
	 * Validate wallet settings updates
	 */
	private validateWalletSettings(updates: Partial<WalletSettings>): void {
		if (updates.conversionRateBuffer !== undefined) {
			if (updates.conversionRateBuffer < 0 || updates.conversionRateBuffer > 0.1) {
				throw new Error('Conversion rate buffer must be between 0 and 0.1');
			}
		}

		// Add more validation as needed
		if (
			updates.autoConvertDeposits !== undefined &&
			typeof updates.autoConvertDeposits !== 'boolean'
		) {
			throw new Error('autoConvertDeposits must be a boolean');
		}

		if (updates.depositsEnabled !== undefined && typeof updates.depositsEnabled !== 'boolean') {
			throw new Error('depositsEnabled must be a boolean');
		}

		if (
			updates.withdrawalsEnabled !== undefined &&
			typeof updates.withdrawalsEnabled !== 'boolean'
		) {
			throw new Error('withdrawalsEnabled must be a boolean');
		}
	}

	/**
	 * Save wallet settings to database
	 */
	private async saveWalletSettingsToDb(settings: WalletSettings): Promise<void> {
		try {
			// Check if record exists
			const existing = await db
				.select()
				.from(adminSettings)
				.where(eq(adminSettings.domain, this.WALLET_DOMAIN))
				.limit(1);

			if (existing.length === 0) {
				// Create new record
				await db.insert(adminSettings).values({
					domain: this.WALLET_DOMAIN,
					settings: settings as any
				});
			} else {
				// Update existing record
				await db
					.update(adminSettings)
					.set({
						settings: settings as any,
						updatedAt: new Date()
					})
					.where(eq(adminSettings.domain, this.WALLET_DOMAIN));
			}

			logger.info('SettingsService', 'Wallet settings saved to database', { settings });
		} catch (error) {
			logger.error('SettingsService', 'Failed to save wallet settings to database', {
				error,
				settings
			});
			throw error;
		}
	}
}

// Export singleton instance
export const settingsService = new SettingsService();

// Initialize settings cache on startup
settingsService.getWalletSettings().catch((error) => {
	logger.error('SettingsService', 'Failed to initialize settings cache', { error });
});
