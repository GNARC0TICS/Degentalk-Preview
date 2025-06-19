export const forumConfig = {
	xp: {
		createThread: 50,
		reply: 25,
		likeReceived: 10,
		dailyCap: 500
	},
	tipping: {
		min: 1,
		max: 1000,
		currency: 'DGT'
	},
	uploads: {
		maxAvatarSizeMB: 2,
		allowedTypes: ['image/jpeg', 'image/png']
	},
	themes: {
		defaultZoneColor: '#0ff',
		fallbackBannerUrl: '/static/default-banner.png'
	}
} as const;

export type ForumConfig = typeof forumConfig;
