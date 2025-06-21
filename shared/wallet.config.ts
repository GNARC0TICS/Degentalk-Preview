// Wallet System Configuration
export const walletConfig = {
	// Feature flags
	WALLET_ENABLED: process.env.NODE_ENV === 'development' || process.env.WALLET_ENABLED === 'true',
	DEPOSITS_ENABLED: true,
	WITHDRAWALS_ENABLED: true,
	INTERNAL_TRANSFERS_ENABLED: true,

	// Supported tokens
	SUPPORTED_TOKENS: ['DGT', 'USDT'] as const,

	// DGT configuration
	DGT: {
		PRICE_USD: 0.1, // Pegged price
		DECIMALS: 8,
		SYMBOL: 'DGT',
		NAME: 'DegenTalk Token'
	},

	// Limits
	LIMITS: {
		MIN_DEPOSIT_USD: 10,
		MAX_DEPOSIT_USD: 10000,
		MIN_WITHDRAWAL_USD: 50,
		MAX_WITHDRAWAL_USD: 5000,
		DAILY_TIP_LIMIT: 1000, // DGT
		DAILY_WITHDRAWAL_LIMIT: 10000, // USD
		MAX_TIP_AMOUNT: 500 // DGT per tip
	},

	// Cooldowns (in seconds)
	COOLDOWNS: {
		WITHDRAWAL_COOLDOWN: 86400, // 24 hours
		TIP_COOLDOWN: 60 // 1 minute between tips
	},

	// Fees
	FEES: {
		DEPOSIT_FEE_PERCENT: 0, // No deposit fee
		WITHDRAWAL_FEE_PERCENT: 2, // 2% withdrawal fee
		WITHDRAWAL_FLAT_FEE_USD: 5 // $5 flat fee
	},

	// Requirements
	REQUIREMENTS: {
		MIN_LEVEL_TO_TIP: 0, // No level requirement for now
		MIN_LEVEL_TO_WITHDRAW: 5, // Level 5 required to withdraw
		EMAIL_VERIFIED_FOR_WITHDRAWAL: true
	},

	// CCPayment Configuration
	CCPAYMENT: {
		APP_ID: process.env.CCPAYMENT_APP_ID || '',
		APP_SECRET: process.env.CCPAYMENT_APP_SECRET || '',
		API_URL: 'https://api.ccpayment.com/v1',
		WEBHOOK_PATH: '/api/webhook/ccpayment',
		SUPPORTED_NETWORKS: {
			USDT: ['TRC20', 'ERC20', 'BEP20'],
			ETH: ['Ethereum', 'Arbitrum', 'Optimism']
		}
	},

	// Development mode
	DEV_MODE: {
		MOCK_CCPAYMENT:
			process.env.NODE_ENV === 'development' && process.env.MOCK_CCPAYMENT !== 'false',
		ALLOW_DEV_TOPUP: process.env.NODE_ENV === 'development',
		BYPASS_LIMITS:
			process.env.NODE_ENV === 'development' && process.env.BYPASS_WALLET_LIMITS === 'true'
	}
} as const;

export type SupportedToken = (typeof walletConfig.SUPPORTED_TOKENS)[number];
