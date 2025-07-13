/**
 * Economy Value Types
 *
 * Branded types for economic values to prevent mixing currencies,
 * amounts, and ensure type safety in financial calculations.
 */

// Generic value helper for typed amounts
export type Amount<Tag extends string> = number & { readonly __tag: Tag };

// Core economic value types
export type DgtAmount = Amount<'DgtAmount'>;
export type UsdAmount = Amount<'UsdAmount'>;
export type XpAmount = Amount<'XpAmount'>;
export type ReputationAmount = Amount<'ReputationAmount'>;

// Transaction-specific amounts
export type TipAmount = Amount<'TipAmount'>;
export type RainAmount = Amount<'RainAmount'>;
export type WithdrawalAmount = Amount<'WithdrawalAmount'>;
export type DepositAmount = Amount<'DepositAmount'>;
export type FeeAmount = Amount<'FeeAmount'>;

// Conversion rates and pricing
export type ExchangeRate = Amount<'ExchangeRate'>;
export type PriceInDgt = Amount<'PriceInDgt'>;
export type PriceInUsd = Amount<'PriceInUsd'>;

// Economy enums (mirrored from database)
export type TransactionType =
	| 'TIP'
	| 'DEPOSIT'
	| 'WITHDRAWAL'
	| 'ADMIN_ADJUST'
	| 'RAIN'
	| 'AIRDROP'
	| 'SHOP_PURCHASE'
	| 'REWARD'
	| 'REFERRAL_BONUS'
	| 'FEE'
	| 'VAULT_LOCK'
	| 'VAULT_UNLOCK';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'reversed' | 'disputed';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export type VaultStatus = 'locked' | 'unlocked' | 'pending_unlock';

// Amount validation helpers
export const isValidAmount = (amount: unknown): amount is number => {
	return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
};

export const isDgtAmount = (amount: unknown): amount is DgtAmount => {
	return isValidAmount(amount);
};

export const isUsdAmount = (amount: unknown): amount is UsdAmount => {
	return isValidAmount(amount);
};

export const isXpAmount = (amount: unknown): amount is XpAmount => {
	return isValidAmount(amount);
};

// Amount casting helpers (use with caution, prefer validation)
export const asDgtAmount = (amount: number): DgtAmount => amount as DgtAmount;
export const asUsdAmount = (amount: number): UsdAmount => amount as UsdAmount;
export const asXpAmount = (amount: number): XpAmount => amount as XpAmount;
export const asTipAmount = (amount: number): TipAmount => amount as TipAmount;
export const asRainAmount = (amount: number): RainAmount => amount as RainAmount;

// Safe conversion helpers
export const toDgtAmount = (amount: number): DgtAmount => {
	if (!isValidAmount(amount)) {
		throw new Error(`Invalid DGT amount: ${amount}`);
	}
	return amount as DgtAmount;
};

export const toUsdAmount = (amount: number): UsdAmount => {
	if (!isValidAmount(amount)) {
		throw new Error(`Invalid USD amount: ${amount}`);
	}
	return amount as UsdAmount;
};

export const toXpAmount = (amount: number): XpAmount => {
	if (!isValidAmount(amount)) {
		throw new Error(`Invalid XP amount: ${amount}`);
	}
	return amount as XpAmount;
};

// Constants for economy calculations
export const ECONOMY_CONSTANTS = {
	// XP system
	XP_PER_LEVEL: 100,
	MIN_XP_FOR_TIPPING: 50,

	// DGT system
	DGT_DECIMAL_PLACES: 6,
	MIN_TIP_AMOUNT: 0.000001,
	MIN_WITHDRAWAL_AMOUNT: 1.0,

	// Conversion
	DGT_TO_USD_DEFAULT_RATE: 0.01, // Fallback rate

	// Limits
	MAX_TIP_AMOUNT: 1000000,
	MAX_RAIN_AMOUNT: 10000000,
	MAX_DAILY_WITHDRAWAL: 100000,

	// Fees
	WITHDRAWAL_FEE_PERCENTAGE: 0.02, // 2%
	MIN_WITHDRAWAL_FEE: 0.1
} as const;
