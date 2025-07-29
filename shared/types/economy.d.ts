/**
 * Economy Value Types
 *
 * Branded types for economic values to prevent mixing currencies,
 * amounts, and ensure type safety in financial calculations.
 */
export type Amount<Tag extends string> = number & {
    readonly __tag: Tag;
};
export type DgtAmount = Amount<'DgtAmount'>;
export type UsdAmount = Amount<'UsdAmount'>;
export type XpAmount = Amount<'XpAmount'>;
export type ReputationAmount = Amount<'ReputationAmount'>;
export type TipAmount = Amount<'TipAmount'>;
export type RainAmount = Amount<'RainAmount'>;
export type WithdrawalAmount = Amount<'WithdrawalAmount'>;
export type DepositAmount = Amount<'DepositAmount'>;
export type FeeAmount = Amount<'FeeAmount'>;
export type ExchangeRate = Amount<'ExchangeRate'>;
export type PriceInDgt = Amount<'PriceInDgt'>;
export type PriceInUsd = Amount<'PriceInUsd'>;
export type TransactionType = 'TIP' | 'DEPOSIT' | 'WITHDRAWAL' | 'ADMIN_ADJUST' | 'RAIN' | 'AIRDROP' | 'SHOP_PURCHASE' | 'REWARD' | 'REFERRAL_BONUS' | 'FEE' | 'VAULT_LOCK' | 'VAULT_UNLOCK';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'reversed' | 'disputed';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export type VaultStatus = 'locked' | 'unlocked' | 'pending_unlock';
export declare const isValidAmount: (amount: unknown) => amount is number;
export declare const isDgtAmount: (amount: unknown) => amount is DgtAmount;
export declare const isUsdAmount: (amount: unknown) => amount is UsdAmount;
export declare const isXpAmount: (amount: unknown) => amount is XpAmount;
export declare const asDgtAmount: (amount: number) => DgtAmount;
export declare const asUsdAmount: (amount: number) => UsdAmount;
export declare const asXpAmount: (amount: number) => XpAmount;
export declare const asTipAmount: (amount: number) => TipAmount;
export declare const asRainAmount: (amount: number) => RainAmount;
export declare const toDgtAmount: (amount: number) => DgtAmount;
export declare const toUsdAmount: (amount: number) => UsdAmount;
export declare const toXpAmount: (amount: number) => XpAmount;
export declare const ECONOMY_CONSTANTS: {
    readonly XP_PER_LEVEL: 100;
    readonly MIN_XP_FOR_TIPPING: 50;
    readonly DGT_DECIMAL_PLACES: 6;
    readonly MIN_TIP_AMOUNT: 0.000001;
    readonly MIN_WITHDRAWAL_AMOUNT: 1;
    readonly DGT_TO_USD_DEFAULT_RATE: 0.01;
    readonly MAX_TIP_AMOUNT: 1000000;
    readonly MAX_RAIN_AMOUNT: 10000000;
    readonly MAX_DAILY_WITHDRAWAL: 100000;
    readonly WITHDRAWAL_FEE_PERCENTAGE: 0.02;
    readonly MIN_WITHDRAWAL_FEE: 0.1;
};
