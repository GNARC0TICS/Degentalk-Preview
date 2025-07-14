"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLET_FEATURE_SETS = exports.WalletFeatureChecker = exports.WALLET_FEATURE_GATES = exports.walletConfig = void 0;
exports.walletConfig = {
    // Basic feature flags
    WALLET_ENABLED: process.env.NODE_ENV === 'development' || process.env.WALLET_ENABLED === 'true',
    DEPOSITS_ENABLED: true,
    WITHDRAWALS_ENABLED: true,
    INTERNAL_TRANSFERS_ENABLED: true,
    // Auto-conversion settings (admin hot-swappable)
    AUTO_CONVERT_DEPOSITS: true, // Auto-convert crypto deposits to DGT
    MANUAL_CONVERSION_ALLOWED: false, // Allow users to manually convert instead
    CONVERSION_RATE_BUFFER: 0.02, // 2% buffer on conversions to account for rate fluctuations
    // Supported tokens
    SUPPORTED_TOKENS: ['DGT', 'USDT'],
    // DGT configuration
    DGT: {
        PRICE_USD: 0.1, // Pegged price
        DECIMALS: 8,
        SYMBOL: 'DGT',
        NAME: 'Degentalk Token'
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
        MOCK_CCPAYMENT: process.env.NODE_ENV === 'development' && process.env.MOCK_CCPAYMENT !== 'false',
        ALLOW_DEV_TOPUP: process.env.NODE_ENV === 'development',
        BYPASS_LIMITS: process.env.NODE_ENV === 'development' && process.env.BYPASS_WALLET_LIMITS === 'true'
    }
};
exports.WALLET_FEATURE_GATES = [
    {
        id: 'wallet_basic',
        name: 'Basic Wallet',
        description: 'Access to DGT balance and basic wallet features',
        enabled: true,
        minLevel: 0
    },
    {
        id: 'wallet_deposits',
        name: 'Crypto Deposits',
        description: 'Deposit crypto to buy DGT tokens',
        enabled: true,
        minLevel: 1
    },
    {
        id: 'wallet_withdrawals',
        name: 'Crypto Withdrawals',
        description: 'Convert DGT to crypto and withdraw',
        enabled: true,
        minLevel: 5
    },
    {
        id: 'wallet_tipping',
        name: 'User Tipping',
        description: 'Send DGT tips to other users',
        enabled: true,
        minLevel: 2
    },
    {
        id: 'wallet_shop',
        name: 'Shop Purchases',
        description: 'Buy items from the shop with DGT',
        enabled: true,
        minLevel: 0
    },
    {
        id: 'wallet_rain',
        name: 'Rain Events',
        description: 'Participate in DGT rain events',
        enabled: true,
        minLevel: 3
    },
    {
        id: 'wallet_advanced',
        name: 'Advanced Wallet',
        description: 'Advanced wallet features and analytics',
        enabled: true,
        minLevel: 10
    },
    {
        id: 'wallet_beta',
        name: 'Beta Wallet Features',
        description: 'Access to experimental wallet features',
        enabled: false,
        minLevel: 15,
        rolloutPercentage: 10 // Only 10% of eligible users
    },
    {
        id: 'wallet_dev',
        name: 'Development Tools',
        description: 'Wallet development and testing tools',
        enabled: true,
        devOnly: true
    }
];
// Feature checking utilities
var WalletFeatureChecker = /** @class */ (function () {
    function WalletFeatureChecker() {
    }
    /**
     * Check if user has access to a wallet feature
     */
    WalletFeatureChecker.hasAccess = function (featureId, userLevel, isDev, userId) {
        if (isDev === void 0) { isDev = false; }
        var feature = exports.WALLET_FEATURE_GATES.find(function (f) { return f.id === featureId; });
        if (!feature) {
            return { hasAccess: false, reason: 'Feature not found' };
        }
        if (!feature.enabled) {
            return { hasAccess: false, reason: 'Feature is disabled' };
        }
        if (feature.devOnly && !isDev) {
            return { hasAccess: false, reason: 'Development only feature' };
        }
        if (feature.minLevel && userLevel < feature.minLevel) {
            return {
                hasAccess: false,
                reason: "Requires level ".concat(feature.minLevel, " (current: ").concat(userLevel, ")")
            };
        }
        // Check rollout percentage
        if (feature.rolloutPercentage && userId) {
            // Simple hash function to get a number from the userId string
            var getNumericHash = function (str) {
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                    var char = str.charCodeAt(i);
                    hash = (hash << 5) - hash + char;
                    hash |= 0; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };
            var userHash = getNumericHash(userId) % 100;
            if (userHash >= feature.rolloutPercentage) {
                return { hasAccess: false, reason: 'Not in rollout group' };
            }
        }
        return { hasAccess: true };
    };
    /**
     * Get all wallet features for a user
     */
    WalletFeatureChecker.getUserFeatures = function (userLevel, isDev, userId) {
        var _this = this;
        if (isDev === void 0) { isDev = false; }
        return exports.WALLET_FEATURE_GATES.map(function (feature) { return (__assign(__assign({}, feature), _this.hasAccess(feature.id, userLevel, isDev, userId))); });
    };
    /**
     * Check multiple features at once
     */
    WalletFeatureChecker.checkFeatures = function (featureIds, userLevel, isDev, userId) {
        var _this = this;
        if (isDev === void 0) { isDev = false; }
        var result = {};
        featureIds.forEach(function (featureId) {
            result[featureId] = _this.hasAccess(featureId, userLevel, isDev, userId).hasAccess;
        });
        return result;
    };
    return WalletFeatureChecker;
}());
exports.WalletFeatureChecker = WalletFeatureChecker;
// Common feature combinations
exports.WALLET_FEATURE_SETS = {
    BASIC: ['wallet_basic', 'wallet_shop'],
    STANDARD: ['wallet_basic', 'wallet_deposits', 'wallet_tipping', 'wallet_shop'],
    ADVANCED: [
        'wallet_basic',
        'wallet_deposits',
        'wallet_withdrawals',
        'wallet_tipping',
        'wallet_shop',
        'wallet_rain'
    ],
    PREMIUM: [
        'wallet_basic',
        'wallet_deposits',
        'wallet_withdrawals',
        'wallet_tipping',
        'wallet_shop',
        'wallet_rain',
        'wallet_advanced'
    ],
    DEV: [
        'wallet_basic',
        'wallet_deposits',
        'wallet_withdrawals',
        'wallet_tipping',
        'wallet_shop',
        'wallet_rain',
        'wallet_advanced',
        'wallet_dev'
    ]
};
