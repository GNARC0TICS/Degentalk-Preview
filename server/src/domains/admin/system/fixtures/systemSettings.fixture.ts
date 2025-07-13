export const systemSettingsFixture = {
	domain: 'system',
	settings: {
		cache: {
			defaultTtl: 3600, // seconds
			enableDistributedCache: false,
			maxMemoryUsage: 512 // MB
		},
		database: {
			enableQueryLogging: false,
			connectionPoolSize: 10,
			queryTimeout: 30000 // ms
		},
		backups: {
			enabled: true,
			frequency: 'daily',
			retentionDays: 30,
			compressionEnabled: true
		},
		permissions: {
			read: ['admin'],
			write: ['admin'],
			database: ['admin']
		}
	}
};
