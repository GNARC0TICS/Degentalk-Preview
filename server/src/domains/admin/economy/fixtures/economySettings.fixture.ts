export const economySettingsFixture = {
	domain: 'economy',
	settings: {
		treasury: {
			minBalance: 1000000, // DGT
			alertThreshold: 100000,
			autoRebalanceEnabled: true
		},
		dgtPackages: {
			minPackageSize: 1000,
			maxPackageSize: 1000000,
			commissionRate: 0.05
		},
		walletConfig: {
			enableAutoConversion: true,
			conversionRateBuffer: 0.02,
			minimumTransferAmount: 100
		},
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			treasury: ['admin']
		}
	}
};