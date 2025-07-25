export const gamificationSettingsFixture = {
	domain: 'gamification',
	settings: {
		xp: {
			maxDailyXp: 1000,
			levelMultiplier: 1.2,
			bonusXpEvents: true
		},
		reputation: {
			decayRate: 0.01,
			tierThresholds: [100, 500, 1500, 5000, 15000, 50000],
			bonusMultipliers: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]
		},
		missions: {
			dailyMissionCount: 3,
			weeklyMissionCount: 2,
			rewardMultiplier: 1.0
		},
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			xpAdjust: ['admin']
		}
	}
};
