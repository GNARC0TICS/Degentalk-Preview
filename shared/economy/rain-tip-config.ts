export const rainTipConfig = {
	tip: {
		minAmount: 1,
		xpPerDgt: 10,
		dailyXpCap: 200,
		feePercent: 5
	},
	rain: {
		minAmount: 5,
		maxRecipients: 15,
		cooldownSeconds: 3600
	}
} as const;
