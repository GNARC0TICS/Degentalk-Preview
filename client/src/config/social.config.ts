/**
 * Social features configuration
 */

export interface SocialConfig {
	mentions: {
		enabled: boolean;
		maxPerDay?: number;
		cooldownMs?: number;
	};
	whaleWatch: {
		enabled: boolean;
		threshold?: number;
	};
	friends: {
		enabled: boolean;
		maxFriends?: number;
	};
	overall: {
		maintenanceMode: boolean;
		emergencyDisable: boolean;
	};
}

export const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
	mentions: {
		enabled: true,
		maxPerDay: 50,
		cooldownMs: 5000
	},
	whaleWatch: {
		enabled: true,
		threshold: 1000
	},
	friends: {
		enabled: true,
		maxFriends: 500
	},
	overall: {
		maintenanceMode: false,
		emergencyDisable: false
	}
};
