/**
 * Wallet Settings Transformer
 * 
 * Transforms wallet configuration data for different roles
 * Following the security-first whitelisting pattern
 */

import type { WalletSettings, PublicWalletSettings, AdminWalletSettings } from '@shared/types/wallet/wallet.types';

export class WalletSettingsTransformer {
	/**
	 * Transform wallet settings for public/authenticated users
	 * Only shows settings that affect user experience
	 */
	static toPublicSettings(settings: WalletSettings): PublicWalletSettings {
		return {
			depositsEnabled: settings.depositsEnabled,
			withdrawalsEnabled: settings.withdrawalsEnabled,
			internalTransfersEnabled: settings.internalTransfersEnabled,
			// Hide sensitive configuration values
			maintenanceMode: settings.maintenanceMode || false
		};
	}

	/**
	 * Transform wallet settings for admin users
	 * Shows all configuration options
	 */
	static toAdminSettings(settings: WalletSettings): AdminWalletSettings {
		return {
			// Public settings
			depositsEnabled: settings.depositsEnabled,
			withdrawalsEnabled: settings.withdrawalsEnabled,
			internalTransfersEnabled: settings.internalTransfersEnabled,
			maintenanceMode: settings.maintenanceMode || false,
			
			// Admin-only configuration
			autoConvertDeposits: settings.autoConvertDeposits,
			manualConversionAllowed: settings.manualConversionAllowed,
			conversionRateBuffer: settings.conversionRateBuffer,
			
			// Metadata
			lastUpdatedAt: settings.lastUpdatedAt?.toISOString() || new Date().toISOString(),
			lastUpdatedBy: settings.lastUpdatedBy || undefined
		};
	}
}

// Export convenience functions
export const toPublicWalletSettings = (settings: WalletSettings) => 
	WalletSettingsTransformer.toPublicSettings(settings);

export const toAdminWalletSettings = (settings: WalletSettings) => 
	WalletSettingsTransformer.toAdminSettings(settings);