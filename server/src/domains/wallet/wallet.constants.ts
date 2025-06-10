export const DGT_CURRENCY = 'DGT';
export const TRANSACTION_FEE_PERCENT = 1; // 1% transaction fee for certain transfers
export const MIN_WITHDRAWAL_AMOUNT = 1; // Example value, please verify
export const MAX_WITHDRAWAL_AMOUNT = 100000; // Example value, please verify
export const SUPPORTED_CRYPTO_CURRENCIES = ['USDT_TRC20']; // From server/services/ccpayment-client.ts
export const DEFAULT_CRYPTO_PRECISION = 8; // Example value, please verify

// Added based on dgt.service.ts imports
export const MIN_TRANSACTION_AMOUNT = 1; // Example value, please verify
export const MAX_USER_BALANCE = 1_000_000_000; // Max DGT a user can hold
export const DGT_TREASURY_USER_ID = 1; // Assuming user ID 1 is the treasury/system account

// Default reward amounts (can be overridden by environment variables or database settings)
export const DEFAULT_DGT_REWARD_CREATE_THREAD = 5;

// Other constants...
