"use strict";
/**
 * Core Wallet Service
 *
 * Orchestrates wallet operations across different providers
 * Provides unified interface for wallet functionality
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = exports.WalletService = void 0;
var wallet_transformer_1 = require("@shared/types/wallet.transformer");
var logger_1 = require("@core/logger");
var errors_1 = require("@core/errors");
var report_error_1 = require("@lib/report-error");
// Import adapters
var ccpayment_adapter_1 = require("../adapters/ccpayment.adapter");
var cache_adapter_1 = require("../adapters/cache.adapter");
var _db_1 = require("@db");
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
var ccpayment_service_1 = require("../providers/ccpayment/ccpayment.service");
var WalletService = /** @class */ (function () {
    function WalletService(config) {
        if (config === void 0) { config = {}; }
        this.config = __assign({ primaryProvider: 'ccpayment', enableCaching: true, cacheProvider: 'memory', defaultCurrency: 'USDT', supportedCurrencies: ['USDT', 'BTC', 'ETH', 'SOL'] }, config);
        // Initialize primary adapter
        var baseAdapter = this.createPrimaryAdapter();
        // Wrap with caching if enabled
        this.primaryAdapter = this.config.enableCaching ? new cache_adapter_1.CacheAdapter(baseAdapter) : baseAdapter;
        logger_1.logger.info('WalletService', 'Initialized with configuration', {
            primaryProvider: this.config.primaryProvider,
            enableCaching: this.config.enableCaching,
            supportedCurrencies: this.config.supportedCurrencies
        });
    }
    /**
     * Get comprehensive user wallet balance
     */
    WalletService.prototype.getUserBalance = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Fetching user balance', { userId: userId });
                        return [4 /*yield*/, this.primaryAdapter.getUserBalance(userId)];
                    case 1:
                        balance = _a.sent();
                        logger_1.logger.info('WalletService', 'User balance retrieved successfully', {
                            userId: userId,
                            dgtBalance: balance.dgtBalance,
                            cryptoAssets: balance.cryptoBalances.length
                        });
                        return [2 /*return*/, balance];
                    case 2:
                        error_1 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_1, {
                                service: 'WalletService',
                                operation: 'getUserBalance',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_1, 'Failed to fetch user balance');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create deposit address for cryptocurrency
     */
    WalletService.prototype.createDepositAddress = function (userId, coinSymbol, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var depositAddress, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        this.validateCurrency(coinSymbol);
                        logger_1.logger.info('WalletService', 'Creating deposit address', {
                            userId: userId,
                            coinSymbol: coinSymbol,
                            chain: chain
                        });
                        return [4 /*yield*/, this.primaryAdapter.createDepositAddress(userId, coinSymbol, chain || this.getDefaultChain(coinSymbol))];
                    case 1:
                        depositAddress = _a.sent();
                        logger_1.logger.info('WalletService', 'Deposit address created successfully', {
                            userId: userId,
                            coinSymbol: coinSymbol,
                            chain: depositAddress.chain
                        });
                        return [2 /*return*/, depositAddress];
                    case 2:
                        error_2 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_2, {
                                service: 'WalletService',
                                operation: 'createDepositAddress',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, coinSymbol: coinSymbol, chain: chain }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_2, 'Failed to create deposit address');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all deposit addresses for a user
     */
    WalletService.prototype.getDepositAddresses = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var dbWallets, depositAddresses, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Fetching deposit addresses', { userId: userId });
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.cryptoWallets)
                                .where((0, drizzle_orm_1.eq)(_schema_1.cryptoWallets.userId, userId))];
                    case 1:
                        dbWallets = _a.sent();
                        depositAddresses = dbWallets.map(wallet_transformer_1.fromDbCryptoWallet);
                        logger_1.logger.info('WalletService', 'Deposit addresses retrieved successfully', {
                            userId: userId,
                            count: depositAddresses.length
                        });
                        return [2 /*return*/, depositAddresses];
                    case 2:
                        error_3 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_3, {
                                service: 'WalletService',
                                operation: 'getDepositAddresses',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_3, 'Failed to fetch deposit addresses');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize a new user's wallet with default crypto addresses and welcome bonus.
     * Implements circuit breaker pattern to never fail registration flow.
     */
    WalletService.prototype.initializeWallet = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var walletsCreated_1, dgtWalletCreated_1, welcomeBonusAdded_1, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Initializing wallet for user', { userId: userId });
                        walletsCreated_1 = 0;
                        dgtWalletCreated_1 = false;
                        welcomeBonusAdded_1 = false;
                        return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var wallet, newBalance, dgtError_1, ccpaymentUserId, ccpaymentError_1, supportedCoins, primaryCoins, _i, primaryCoins_1, coin, _a, _b, network, address, addressError_1, coinError_1;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _c.trys.push([0, 6, , 7]);
                                            return [4 /*yield*/, this.getOrCreateDgtWallet(tx, userId)];
                                        case 1:
                                            _c.sent();
                                            dgtWalletCreated_1 = true;
                                            logger_1.logger.info('WalletService', 'DGT wallet created/verified for user', { userId: userId });
                                            return [4 /*yield*/, tx.query.wallets.findFirst({
                                                    where: (0, drizzle_orm_1.eq)(_schema_1.wallets.userId, userId)
                                                })];
                                        case 2:
                                            wallet = _c.sent();
                                            if (!wallet) return [3 /*break*/, 5];
                                            newBalance = wallet.balance + 10;
                                            return [4 /*yield*/, tx
                                                    .update(_schema_1.wallets)
                                                    .set({ balance: newBalance, lastTransaction: new Date() })
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.id, wallet.id))];
                                        case 3:
                                            _c.sent();
                                            return [4 /*yield*/, tx.insert(_schema_1.transactions).values({
                                                    userId: userId,
                                                    walletId: wallet.id,
                                                    amount: 10,
                                                    type: 'admin_credit',
                                                    status: 'completed',
                                                    description: 'Welcome bonus for new user',
                                                    metadata: {
                                                        source: 'admin_credit',
                                                        reason: 'Welcome bonus for new user',
                                                        adminId: 'system'
                                                    }
                                                })];
                                        case 4:
                                            _c.sent();
                                            welcomeBonusAdded_1 = true;
                                            logger_1.logger.info('WalletService', 'Welcome bonus credited to new user', {
                                                userId: userId,
                                                amount: 10
                                            });
                                            _c.label = 5;
                                        case 5: return [3 /*break*/, 7];
                                        case 6:
                                            dgtError_1 = _c.sent();
                                            logger_1.logger.error('WalletService', 'Failed to create DGT wallet during initialization', {
                                                userId: userId,
                                                error: dgtError_1
                                            });
                                            return [3 /*break*/, 7];
                                        case 7:
                                            _c.trys.push([7, 9, , 10]);
                                            return [4 /*yield*/, ccpayment_service_1.ccpaymentService.getOrCreateCCPaymentUser(userId)];
                                        case 8:
                                            ccpaymentUserId = _c.sent();
                                            logger_1.logger.info('WalletService', 'CCPayment user created/verified', {
                                                userId: userId,
                                                ccpaymentUserId: ccpaymentUserId
                                            });
                                            return [3 /*break*/, 10];
                                        case 9:
                                            ccpaymentError_1 = _c.sent();
                                            logger_1.logger.warn('WalletService', 'Failed to create CCPayment user during initialization', {
                                                userId: userId,
                                                error: ccpaymentError_1
                                            });
                                            return [3 /*break*/, 10];
                                        case 10:
                                            _c.trys.push([10, 21, , 22]);
                                            return [4 /*yield*/, this.getSupportedCoins()];
                                        case 11:
                                            supportedCoins = _c.sent();
                                            primaryCoins = supportedCoins.filter(function (coin) {
                                                return ['BTC', 'ETH', 'USDT'].includes(coin.symbol.toUpperCase());
                                            });
                                            _i = 0, primaryCoins_1 = primaryCoins;
                                            _c.label = 12;
                                        case 12:
                                            if (!(_i < primaryCoins_1.length)) return [3 /*break*/, 20];
                                            coin = primaryCoins_1[_i];
                                            _a = 0, _b = coin.networks;
                                            _c.label = 13;
                                        case 13:
                                            if (!(_a < _b.length)) return [3 /*break*/, 19];
                                            network = _b[_a];
                                            _c.label = 14;
                                        case 14:
                                            _c.trys.push([14, 17, , 18]);
                                            return [4 /*yield*/, this.createDepositAddress(userId, coin.symbol, network.network)];
                                        case 15:
                                            address = _c.sent();
                                            return [4 /*yield*/, _db_1.db.insert(_schema_1.cryptoWallets).values({
                                                    userId: userId,
                                                    ccpaymentUserId: '', // Will be populated later if CCPayment succeeds
                                                    coinId: 0,
                                                    coinSymbol: coin.symbol,
                                                    chain: network.network,
                                                    address: address.address,
                                                    memo: address.memo,
                                                    qrCodeUrl: address.qrCode
                                                })];
                                        case 16:
                                            _c.sent();
                                            walletsCreated_1++;
                                            return [3 /*break*/, 18];
                                        case 17:
                                            addressError_1 = _c.sent();
                                            logger_1.logger.warn('WalletService', 'Failed to create deposit address during initialization', {
                                                userId: userId,
                                                coin: coin.symbol,
                                                network: network.network,
                                                error: addressError_1
                                            });
                                            return [3 /*break*/, 18];
                                        case 18:
                                            _a++;
                                            return [3 /*break*/, 13];
                                        case 19:
                                            _i++;
                                            return [3 /*break*/, 12];
                                        case 20: return [3 /*break*/, 22];
                                        case 21:
                                            coinError_1 = _c.sent();
                                            logger_1.logger.warn('WalletService', 'Failed to initialize crypto addresses', {
                                                userId: userId,
                                                error: coinError_1
                                            });
                                            return [3 /*break*/, 22];
                                        case 22:
                                            logger_1.logger.info('WalletService', 'Wallet initialization completed', {
                                                userId: userId,
                                                walletsCreated: walletsCreated_1,
                                                dgtWalletCreated: dgtWalletCreated_1,
                                                welcomeBonusAdded: welcomeBonusAdded_1
                                            });
                                            return [2 /*return*/, {
                                                    success: true,
                                                    walletsCreated: walletsCreated_1,
                                                    dgtWalletCreated: dgtWalletCreated_1,
                                                    welcomeBonusAdded: welcomeBonusAdded_1
                                                }];
                                    }
                                });
                            }); })];
                    case 1: 
                    // Everything runs in a single transaction for atomicity
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_4, {
                                service: 'WalletService',
                                operation: 'initializeWallet',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId }
                            })];
                    case 3:
                        _a.sent();
                        // Even on complete failure, return success to not break registration
                        return [2 /*return*/, {
                                success: false,
                                walletsCreated: 0,
                                dgtWalletCreated: false,
                                welcomeBonusAdded: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ensure CCPayment wallet exists for user (used during login).
     * Non-critical operation that won't fail authentication.
     */
    WalletService.prototype.ensureCcPaymentWallet = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var ccpaymentUserId, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Ensuring CCPayment wallet for user', { userId: userId });
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.getOrCreateCCPaymentUser(userId)];
                    case 1:
                        ccpaymentUserId = _a.sent();
                        logger_1.logger.info('WalletService', 'CCPayment wallet ensured for user', {
                            userId: userId,
                            ccpaymentUserId: ccpaymentUserId
                        });
                        return [2 /*return*/, ccpaymentUserId];
                    case 2:
                        error_5 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_5, {
                                service: 'WalletService',
                                operation: 'ensureCcPaymentWallet',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId }
                            })];
                    case 3:
                        _a.sent();
                        // Return null on failure rather than throwing - circuit breaker
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Swap cryptocurrencies for a user.
     */
    WalletService.prototype.swapCrypto = function (userId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var ccpaymentUserId, recordId, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        logger_1.logger.info('WalletService', 'Processing crypto swap', __assign({ userId: userId }, params));
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.getOrCreateCCPaymentUser(userId)];
                    case 1:
                        ccpaymentUserId = _a.sent();
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.swap({
                                uid: ccpaymentUserId,
                                fromCoinId: params.fromCoinId,
                                toCoinId: params.toCoinId,
                                fromAmount: params.fromAmount
                            })];
                    case 2:
                        recordId = _a.sent();
                        // We don't have enough info to fill this completely,
                        // the webhook would populate the rest.
                        return [4 /*yield*/, _db_1.db.insert(_schema_1.swapRecords).values({
                                userId: userId,
                                recordId: recordId,
                                fromCoinId: params.fromCoinId,
                                toCoinId: params.toCoinId,
                                fromAmount: params.fromAmount,
                                status: 'Processing',
                                fromCoinSymbol: '', // from webhook
                                toCoinSymbol: '', // from webhook
                                toAmount: '0' // from webhook
                            })];
                    case 3:
                        // We don't have enough info to fill this completely,
                        // the webhook would populate the rest.
                        _a.sent();
                        logger_1.logger.info('WalletService', 'Crypto swap processed successfully', {
                            userId: userId,
                            recordId: recordId
                        });
                        return [2 /*return*/, { recordId: recordId }];
                    case 4:
                        error_6 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_6, {
                                service: 'WalletService',
                                operation: 'swapCrypto',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, params: params }
                            })];
                    case 5:
                        _a.sent();
                        throw this.handleError(error_6, 'Failed to process crypto swap');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Request cryptocurrency withdrawal
     */
    WalletService.prototype.requestWithdrawal = function (userId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        this.validateWithdrawalRequest(request);
                        logger_1.logger.info('WalletService', 'Processing withdrawal request', {
                            userId: userId,
                            amount: request.amount,
                            currency: request.currency
                        });
                        return [4 /*yield*/, this.primaryAdapter.requestWithdrawal(userId, request)];
                    case 1:
                        response = _a.sent();
                        logger_1.logger.info('WalletService', 'Withdrawal processed successfully', {
                            userId: userId,
                            transactionId: response.transactionId,
                            status: response.status
                        });
                        return [2 /*return*/, response];
                    case 2:
                        error_7 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_7, {
                                service: 'WalletService',
                                operation: 'requestWithdrawal',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, request: request }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_7, 'Failed to process withdrawal');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get paginated transaction history
     */
    WalletService.prototype.getTransactionHistory = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var paginationOptions, transactions_1, error_8;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        paginationOptions = {
                            page: options.page || 1,
                            limit: Math.min(options.limit || 20, 100), // Cap at 100
                            sortBy: options.sortBy || 'createdAt',
                            sortOrder: options.sortOrder || 'desc'
                        };
                        logger_1.logger.info('WalletService', 'Fetching transaction history', {
                            userId: userId,
                            options: paginationOptions
                        });
                        return [4 /*yield*/, this.primaryAdapter.getTransactionHistory(userId, paginationOptions)];
                    case 1:
                        transactions_1 = _a.sent();
                        logger_1.logger.info('WalletService', 'Transaction history retrieved successfully', {
                            userId: userId,
                            transactionCount: transactions_1.length,
                            page: paginationOptions.page
                        });
                        return [2 /*return*/, transactions_1];
                    case 2:
                        error_8 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_8, {
                                service: 'WalletService',
                                operation: 'getTransactionHistory',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, options: options }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_8, 'Failed to fetch transaction history');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get list of supported coins for deposits and withdrawals
     */
    WalletService.prototype.getSupportedCoins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var localTokens, adapterTokens, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        logger_1.logger.info('WalletService', 'Fetching supported coins');
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.supportedTokens)
                                .where((0, drizzle_orm_1.eq)(_schema_1.supportedTokens.isActive, true))];
                    case 1:
                        localTokens = _a.sent();
                        if (localTokens.length > 0) {
                            logger_1.logger.info('WalletService', 'Supported coins retrieved from local database', {
                                count: localTokens.length
                            });
                            // NOTE: Could create a transformer for local tokens to SupportedCoin[] format
                            // Currently we just log and proceed to the adapter.
                        }
                        // 2. Fallback to the primary adapter (e.g., CCPayment)
                        logger_1.logger.info('WalletService', 'Falling back to primary adapter for supported coins');
                        return [4 /*yield*/, this.primaryAdapter.getSupportedCoins()];
                    case 2:
                        adapterTokens = _a.sent();
                        // NOTE: Could cache the adapter response into our local DB for performance
                        logger_1.logger.info('WalletService', 'Supported coins retrieved successfully from adapter', {
                            count: adapterTokens.length
                        });
                        return [2 /*return*/, adapterTokens];
                    case 3:
                        error_9 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_9, {
                                service: 'WalletService',
                                operation: 'getSupportedCoins',
                                action: logger_1.LogAction.FAILURE,
                                data: {}
                            })];
                    case 4:
                        _a.sent();
                        throw this.handleError(error_9, 'Failed to fetch supported coins');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get detailed information for a single supported coin.
     */
    WalletService.prototype.getTokenInfo = function (coinId) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInfo, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Fetching token info', { coinId: coinId });
                        return [4 /*yield*/, this.primaryAdapter.getTokenInfo(coinId)];
                    case 1:
                        tokenInfo = _a.sent();
                        logger_1.logger.info('WalletService', 'Token info retrieved successfully', {
                            coinId: coinId,
                            symbol: tokenInfo.symbol
                        });
                        return [2 /*return*/, tokenInfo];
                    case 2:
                        error_10 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_10, {
                                service: 'WalletService',
                                operation: 'getTokenInfo',
                                action: logger_1.LogAction.FAILURE,
                                data: { coinId: coinId }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_10, 'Failed to fetch token info');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate a crypto address for a given chain.
     */
    WalletService.prototype.validateAddress = function (address, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Validating address', { address: address, chain: chain });
                        return [4 /*yield*/, this.primaryAdapter.validateAddress(address, chain)];
                    case 1:
                        result = _a.sent();
                        logger_1.logger.info('WalletService', 'Address validation completed', {
                            address: address,
                            chain: chain,
                            isValid: result.isValid
                        });
                        return [2 /*return*/, result];
                    case 2:
                        error_11 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_11, {
                                service: 'WalletService',
                                operation: 'validateAddress',
                                action: logger_1.LogAction.FAILURE,
                                data: { address: address, chain: chain }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_11, 'Failed to validate address');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get withdrawal fee for a specific coin and chain.
     */
    WalletService.prototype.getWithdrawFee = function (coinId, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var feeInfo, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Fetching withdrawal fee', { coinId: coinId, chain: chain });
                        return [4 /*yield*/, this.primaryAdapter.getWithdrawFee(coinId, chain)];
                    case 1:
                        feeInfo = _a.sent();
                        logger_1.logger.info('WalletService', 'Withdrawal fee retrieved successfully', {
                            coinId: coinId,
                            chain: chain,
                            fee: feeInfo.amount
                        });
                        return [2 /*return*/, feeInfo];
                    case 2:
                        error_12 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_12, {
                                service: 'WalletService',
                                operation: 'getWithdrawFee',
                                action: logger_1.LogAction.FAILURE,
                                data: { coinId: coinId, chain: chain }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_12, 'Failed to fetch withdrawal fee');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Credit DGT to a user's wallet.
     */
    WalletService.prototype.creditDgt = function (userId, amount, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (amount <= 0) {
                            throw new errors_1.WalletError('Credit amount must be positive', errors_1.ErrorCodes.VALIDATION_ERROR);
                        }
                        return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var wallet, newBalance, MAX_WALLET_BALANCE, transaction;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getOrCreateDgtWallet(tx, userId)];
                                        case 1:
                                            wallet = _a.sent();
                                            newBalance = wallet.balance + amount;
                                            MAX_WALLET_BALANCE = 1000000000;
                                            if (newBalance > MAX_WALLET_BALANCE) {
                                                throw new Error("Wallet balance would exceed maximum allowed balance of ".concat(MAX_WALLET_BALANCE, " DGT"));
                                            }
                                            return [4 /*yield*/, tx
                                                    .update(_schema_1.wallets)
                                                    .set({ balance: newBalance, lastTransaction: new Date() })
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.id, wallet.id))];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, tx
                                                    .insert(_schema_1.transactions)
                                                    .values({
                                                    userId: userId,
                                                    walletId: wallet.id,
                                                    amount: amount,
                                                    type: metadata.source,
                                                    status: 'completed',
                                                    description: this.getTransactionDescription(metadata),
                                                    metadata: metadata
                                                })
                                                    .returning()];
                                        case 3:
                                            transaction = (_a.sent())[0];
                                            logger_1.logger.info('WalletService:creditDgt', 'DGT credited', {
                                                userId: userId,
                                                amount: amount,
                                                source: metadata.source
                                            });
                                            return [2 /*return*/, this.transformDbTransaction(transaction, newBalance)];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Debit DGT from a user's wallet.
     */
    WalletService.prototype.debitDgt = function (userId, amount, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (amount <= 0) {
                            throw new errors_1.WalletError('Debit amount must be positive', errors_1.ErrorCodes.VALIDATION_ERROR);
                        }
                        return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var wallet, newBalance, transaction;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getOrCreateDgtWallet(tx, userId)];
                                        case 1:
                                            wallet = _a.sent();
                                            if (wallet.balance < amount) {
                                                throw new errors_1.WalletError('Insufficient balance', errors_1.ErrorCodes.INSUFFICIENT_FUNDS);
                                            }
                                            newBalance = wallet.balance - amount;
                                            return [4 /*yield*/, tx
                                                    .update(_schema_1.wallets)
                                                    .set({ balance: newBalance, lastTransaction: new Date() })
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.id, wallet.id))];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, tx
                                                    .insert(_schema_1.transactions)
                                                    .values({
                                                    userId: userId,
                                                    walletId: wallet.id,
                                                    amount: -amount,
                                                    type: metadata.source,
                                                    status: 'completed',
                                                    description: this.getTransactionDescription(metadata),
                                                    metadata: metadata
                                                })
                                                    .returning()];
                                        case 3:
                                            transaction = (_a.sent())[0];
                                            logger_1.logger.info('WalletService:debitDgt', 'DGT debited', {
                                                userId: userId,
                                                amount: amount,
                                                source: metadata.source
                                            });
                                            // NOTE: Vanity sink analyzer can be integrated here for tracking specific sources like 'xp_boost'
                                            return [2 /*return*/, this.transformDbTransaction(transaction, newBalance)];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Process internal DGT transfer between users
     */
    WalletService.prototype.transferDgt = function (transfer) {
        return __awaiter(this, void 0, void 0, function () {
            var transferAmount;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.validateDgtTransfer(transfer);
                        transferAmount = Math.abs(transfer.amount);
                        return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var senderWallet, receiverWallet, senderTransaction;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            logger_1.logger.info('WalletService:transferDgt', 'Processing DGT transfer', {
                                                from: transfer.from,
                                                to: transfer.to,
                                                amount: transferAmount
                                            });
                                            return [4 /*yield*/, tx
                                                    .select()
                                                    .from(_schema_1.wallets)
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.userId, transfer.from))
                                                    .for('update')
                                                    .limit(1)
                                                    .then(function (rows) { return rows[0]; })];
                                        case 1:
                                            senderWallet = _a.sent();
                                            if (!senderWallet) {
                                                throw new errors_1.WalletError('Sender wallet not found', errors_1.ErrorCodes.NOT_FOUND, 404);
                                            }
                                            if (senderWallet.status !== 'active') {
                                                throw new errors_1.WalletError('Sender wallet is frozen or suspended', errors_1.ErrorCodes.FORBIDDEN, 403);
                                            }
                                            if (senderWallet.balance < transferAmount) {
                                                throw new errors_1.WalletError('Insufficient balance', errors_1.ErrorCodes.INSUFFICIENT_FUNDS, 400);
                                            }
                                            return [4 /*yield*/, tx
                                                    .select()
                                                    .from(_schema_1.wallets)
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.userId, transfer.to))
                                                    .for('update')
                                                    .limit(1)
                                                    .then(function (rows) { return rows[0]; })];
                                        case 2:
                                            receiverWallet = _a.sent();
                                            if (!receiverWallet) {
                                                throw new errors_1.WalletError('Receiver wallet not found', errors_1.ErrorCodes.NOT_FOUND, 404);
                                            }
                                            if (receiverWallet.status !== 'active') {
                                                throw new errors_1.WalletError('Receiver wallet is frozen or suspended', errors_1.ErrorCodes.FORBIDDEN, 403);
                                            }
                                            // Perform the transfer
                                            return [4 /*yield*/, tx
                                                    .update(_schema_1.wallets)
                                                    .set({
                                                    balance: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " - ", ""], ["", " - ", ""])), _schema_1.wallets.balance, transferAmount),
                                                    lastTransaction: new Date()
                                                })
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.id, senderWallet.id))];
                                        case 3:
                                            // Perform the transfer
                                            _a.sent();
                                            return [4 /*yield*/, tx
                                                    .update(_schema_1.wallets)
                                                    .set({
                                                    balance: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " + ", ""], ["", " + ", ""])), _schema_1.wallets.balance, transferAmount),
                                                    lastTransaction: new Date()
                                                })
                                                    .where((0, drizzle_orm_1.eq)(_schema_1.wallets.id, receiverWallet.id))];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, tx
                                                    .insert(_schema_1.transactions)
                                                    .values({
                                                    userId: transfer.from,
                                                    walletId: senderWallet.id,
                                                    fromUserId: transfer.from,
                                                    toUserId: transfer.to,
                                                    amount: -transferAmount,
                                                    type: 'transfer_out',
                                                    status: 'completed',
                                                    description: transfer.reason,
                                                    metadata: transfer.metadata
                                                })
                                                    .returning()];
                                        case 5:
                                            senderTransaction = (_a.sent())[0];
                                            return [4 /*yield*/, tx
                                                    .insert(_schema_1.transactions)
                                                    .values({
                                                    userId: transfer.to,
                                                    walletId: receiverWallet.id,
                                                    fromUserId: transfer.from,
                                                    toUserId: transfer.to,
                                                    amount: transferAmount,
                                                    type: 'transfer_in',
                                                    status: 'completed',
                                                    description: transfer.reason,
                                                    metadata: transfer.metadata
                                                })
                                                    .returning()];
                                        case 6:
                                            _a.sent();
                                            logger_1.logger.info('WalletService:transferDgt', 'DGT transfer completed successfully', {
                                                transactionId: senderTransaction.id,
                                                from: transfer.from,
                                                to: transfer.to,
                                                amount: transferAmount
                                            });
                                            return [2 /*return*/, {
                                                    id: senderTransaction.id,
                                                    userId: senderTransaction.userId,
                                                    type: 'transfer',
                                                    amount: -transferAmount,
                                                    status: 'completed',
                                                    metadata: senderTransaction.metadata,
                                                    createdAt: senderTransaction.createdAt.toISOString(),
                                                    updatedAt: senderTransaction.updatedAt.toISOString()
                                                }];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Process webhook from payment provider
     */
    WalletService.prototype.processWebhook = function (provider, payload, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        logger_1.logger.info('WalletService', 'Processing webhook', { provider: provider });
                        if (provider !== this.config.primaryProvider) {
                            throw new errors_1.WalletError("Unsupported webhook provider: ".concat(provider), errors_1.ErrorCodes.VALIDATION_ERROR, 400, { provider: provider });
                        }
                        return [4 /*yield*/, this.primaryAdapter.processWebhook(payload, signature)];
                    case 1:
                        result = _a.sent();
                        logger_1.logger.info('WalletService', 'Webhook processed successfully', {
                            provider: provider,
                            success: result.success,
                            transactionId: result.transactionId
                        });
                        return [2 /*return*/, result];
                    case 2:
                        error_13 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_13, {
                                service: 'WalletService',
                                operation: 'processWebhook',
                                action: logger_1.LogAction.FAILURE,
                                data: { provider: provider }
                            })];
                    case 3:
                        _a.sent();
                        throw this.handleError(error_13, 'Failed to process webhook');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get public wallet configuration
     */
    WalletService.prototype.getWalletConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        supportedCurrencies: this.config.supportedCurrencies,
                        minimumWithdrawal: {
                            BTC: 0.001,
                            ETH: 0.01,
                            USDT: 10,
                            SOL: 0.1
                        },
                        maximumWithdrawal: {
                            BTC: 10,
                            ETH: 100,
                            USDT: 100000,
                            SOL: 1000
                        },
                        withdrawalFees: {
                            BTC: 0.0005,
                            ETH: 0.005,
                            USDT: 1,
                            SOL: 0.01
                        },
                        dgtExchangeRate: 0.01, // 1 DGT = $0.01 USD
                        maintenanceMode: false
                    }];
            });
        });
    };
    /**
     * Create primary adapter based on configuration
     */
    WalletService.prototype.createPrimaryAdapter = function () {
        switch (this.config.primaryProvider) {
            case 'ccpayment':
                return ccpayment_adapter_1.ccpaymentAdapter;
            default:
                throw new Error("Unsupported primary provider: ".concat(this.config.primaryProvider));
        }
    };
    /**
     * Validate currency is supported
     */
    WalletService.prototype.validateCurrency = function (currency) {
        if (!this.config.supportedCurrencies.includes(currency)) {
            throw new errors_1.WalletError("Unsupported currency: ".concat(currency), errors_1.ErrorCodes.VALIDATION_ERROR, 400, {
                currency: currency,
                supportedCurrencies: this.config.supportedCurrencies
            });
        }
    };
    /**
     * Validate withdrawal request
     */
    WalletService.prototype.validateWithdrawalRequest = function (request) {
        this.validateCurrency(request.currency);
        if (request.amount <= 0) {
            throw new errors_1.WalletError('Withdrawal amount must be positive', errors_1.ErrorCodes.VALIDATION_ERROR, 400, { amount: request.amount });
        }
        if (!request.address || request.address.trim().length === 0) {
            throw new errors_1.WalletError('Withdrawal address is required', errors_1.ErrorCodes.VALIDATION_ERROR, 400);
        }
    };
    /**
     * Validate DGT transfer request
     */
    WalletService.prototype.validateDgtTransfer = function (transfer) {
        if (transfer.amount <= 0) {
            throw new errors_1.WalletError('Transfer amount must be positive', errors_1.ErrorCodes.VALIDATION_ERROR, 400, {
                amount: transfer.amount
            });
        }
        if (transfer.from === transfer.to) {
            throw new errors_1.WalletError('Cannot transfer to same user', errors_1.ErrorCodes.VALIDATION_ERROR, 400, {
                from: transfer.from,
                to: transfer.to
            });
        }
    };
    /**
     * Get default chain for a currency
     */
    WalletService.prototype.getDefaultChain = function (currency) {
        var defaultChains = {
            BTC: 'Bitcoin',
            ETH: 'Ethereum',
            USDT: 'Ethereum',
            SOL: 'Solana'
        };
        return defaultChains[currency] || 'Ethereum';
    };
    /**
     * Generate unique transaction ID
     */
    WalletService.prototype.generateTransactionId = function () {
        return "tx_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * Get or create a DGT wallet for a user within a transaction.
     */
    WalletService.prototype.getOrCreateDgtWallet = function (tx, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, newWallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tx
                            .select()
                            .from(_schema_1.wallets)
                            .where((0, drizzle_orm_1.eq)(_schema_1.wallets.userId, userId))
                            .for('update')
                            .limit(1)
                            .then(function (rows) { return rows[0]; })];
                    case 1:
                        wallet = _a.sent();
                        if (wallet) {
                            return [2 /*return*/, wallet];
                        }
                        return [4 /*yield*/, tx.insert(_schema_1.wallets).values({ userId: userId, balance: 0 }).returning()];
                    case 2:
                        newWallet = (_a.sent())[0];
                        logger_1.logger.info('WalletService:getOrCreateDgtWallet', 'Created new DGT wallet for user', {
                            userId: userId
                        });
                        return [2 /*return*/, newWallet];
                }
            });
        });
    };
    /**
     * Get transaction description from metadata
     */
    WalletService.prototype.getTransactionDescription = function (metadata) {
        // Logic from old dgt.service.ts
        switch (metadata.source) {
            case 'crypto_deposit':
                return "DGT credit from ".concat(metadata.originalToken, " deposit (").concat(metadata.usdtAmount, " USDT)");
            case 'shop_purchase':
                return "Shop purchase: ".concat(metadata.shopItemId);
            case 'tip_send':
                return "Tip sent: ".concat(metadata.reason || 'No message');
            case 'tip_receive':
                return "Tip received: ".concat(metadata.reason || 'No message');
            case 'rain_send':
                return "Rain event participation";
            case 'rain_receive':
                return "Rain reward received";
            case 'admin_credit':
                return "Admin credit: ".concat(metadata.reason || 'Manual adjustment');
            case 'admin_debit':
                return "Admin debit: ".concat(metadata.reason || 'Manual adjustment');
            case 'internal_transfer_send':
                return "Transfer sent: ".concat(metadata.reason || 'No note');
            case 'internal_transfer_receive':
                return "Transfer received: ".concat(metadata.reason || 'No note');
            case 'xp_boost':
                return "XP boost purchase";
            case 'manual_credit':
                return "Manual credit: ".concat(metadata.reason || 'Administrator action');
            default:
                return 'DGT transaction';
        }
    };
    WalletService.prototype.transformDbTransaction = function (dbTx, balanceAfter) {
        return {
            id: dbTx.id,
            userId: dbTx.userId,
            type: dbTx.type,
            amount: dbTx.amount,
            status: dbTx.status,
            metadata: dbTx.metadata,
            createdAt: dbTx.createdAt.toISOString(),
            updatedAt: dbTx.updatedAt.toISOString(),
            balanceAfter: balanceAfter
        };
    };
    /**
     * Handle and standardize errors
     */
    WalletService.prototype.handleError = function (error, message) {
        if (error instanceof errors_1.WalletError) {
            return error;
        }
        return new errors_1.WalletError(message, errors_1.ErrorCodes.UNKNOWN_ERROR, 500, { originalError: error });
    };
    return WalletService;
}());
exports.WalletService = WalletService;
// Export singleton instance
exports.walletService = new WalletService();
var templateObject_1, templateObject_2;
