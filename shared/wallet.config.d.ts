import type { UserId } from './types/ids.js';
export interface WalletFeatureGate {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    minLevel?: number;
    devOnly?: boolean;
    rolloutPercentage?: number;
}
export interface WalletConfig {
    ccpayment: {
        autoSwapEnabled: boolean;
        autoWithdrawEnabled: boolean;
        testNetworkEnabled: boolean;
        rateLockEnabled: boolean;
    };
    features: {
        allowCryptoWithdrawals: boolean;
        allowCryptoSwaps: boolean;
        allowDGTSpending: boolean;
        allowInternalTransfers: boolean;
        allowManualCredits: boolean;
    };
    dgt: {
        usdPrice: number;
        minDepositUSD: number;
        maxDGTBalance: number;
    };
    limits: {
        maxDGTTransfer: number;
        maxCryptoWithdrawal: number;
        dailyWithdrawalLimit: number;
    };
}
export declare const walletConfig: {
    readonly WALLET_ENABLED: boolean;
    readonly DEPOSITS_ENABLED: true;
    readonly WITHDRAWALS_ENABLED: true;
    readonly INTERNAL_TRANSFERS_ENABLED: true;
    readonly AUTO_CONVERT_DEPOSITS: true;
    readonly MANUAL_CONVERSION_ALLOWED: false;
    readonly CONVERSION_RATE_BUFFER: 0.02;
    readonly SUPPORTED_TOKENS: readonly ["DGT", "USDT"];
    readonly DGT: {
        readonly PRICE_USD: 0.1;
        readonly DECIMALS: 8;
        readonly SYMBOL: "DGT";
        readonly NAME: "Degentalk Token";
    };
    readonly LIMITS: {
        readonly MIN_DEPOSIT_USD: 10;
        readonly MAX_DEPOSIT_USD: 10000;
        readonly MIN_WITHDRAWAL_USD: 50;
        readonly MAX_WITHDRAWAL_USD: 5000;
        readonly DAILY_TIP_LIMIT: 1000;
        readonly DAILY_WITHDRAWAL_LIMIT: 10000;
        readonly MAX_TIP_AMOUNT: 500;
    };
    readonly COOLDOWNS: {
        readonly WITHDRAWAL_COOLDOWN: 86400;
        readonly TIP_COOLDOWN: 60;
    };
    readonly FEES: {
        readonly DEPOSIT_FEE_PERCENT: 0;
        readonly WITHDRAWAL_FEE_PERCENT: 2;
        readonly WITHDRAWAL_FLAT_FEE_USD: 5;
    };
    readonly REQUIREMENTS: {
        readonly MIN_LEVEL_TO_TIP: 0;
        readonly MIN_LEVEL_TO_WITHDRAW: 5;
        readonly EMAIL_VERIFIED_FOR_WITHDRAWAL: true;
    };
    readonly CCPAYMENT: {
        readonly APP_ID: string;
        readonly APP_SECRET: string;
        readonly API_URL: "https://api.ccpayment.com/v1";
        readonly WEBHOOK_PATH: "/api/webhook/ccpayment";
        readonly SUPPORTED_NETWORKS: {
            readonly USDT: readonly ["TRC20", "ERC20", "BEP20"];
            readonly ETH: readonly ["Ethereum", "Arbitrum", "Optimism"];
        };
    };
    readonly DEV_MODE: {
        readonly MOCK_CCPAYMENT: boolean;
        readonly ALLOW_DEV_TOPUP: boolean;
        readonly BYPASS_LIMITS: boolean;
    };
};
export type SupportedToken = (typeof walletConfig.SUPPORTED_TOKENS)[number];
export declare const WALLET_FEATURE_GATES: WalletFeatureGate[];
export declare class WalletFeatureChecker {
    /**
     * Check if user has access to a wallet feature
     */
    static hasAccess(featureId: string, userLevel: number, isDev?: boolean, userId?: UserId): {
        hasAccess: boolean;
        reason?: string;
    };
    /**
     * Get all wallet features for a user
     */
    static getUserFeatures(userLevel: number, isDev?: boolean, userId?: UserId): Array<WalletFeatureGate & {
        hasAccess: boolean;
        reason?: string;
    }>;
    /**
     * Check multiple features at once
     */
    static checkFeatures(featureIds: string[], userLevel: number, isDev?: boolean, userId?: UserId): Record<string, boolean>;
}
export declare const WALLET_FEATURE_SETS: {
    readonly BASIC: readonly ["wallet_basic", "wallet_shop"];
    readonly STANDARD: readonly ["wallet_basic", "wallet_deposits", "wallet_tipping", "wallet_shop"];
    readonly ADVANCED: readonly ["wallet_basic", "wallet_deposits", "wallet_withdrawals", "wallet_tipping", "wallet_shop", "wallet_rain"];
    readonly PREMIUM: readonly ["wallet_basic", "wallet_deposits", "wallet_withdrawals", "wallet_tipping", "wallet_shop", "wallet_rain", "wallet_advanced"];
    readonly DEV: readonly ["wallet_basic", "wallet_deposits", "wallet_withdrawals", "wallet_tipping", "wallet_shop", "wallet_rain", "wallet_advanced", "wallet_dev"];
};
