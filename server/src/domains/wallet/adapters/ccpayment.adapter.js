"use strict";
/**
 * CCPayment Wallet Adapter
 *
 * Implements the wallet adapter interface for CCPayment provider
 * Leverages existing CCPayment services for actual implementation
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccpaymentAdapter = exports.CCPaymentAdapter = void 0;
var wallet_transformer_1 = require("@shared/types/wallet.transformer");
var logger_1 = require("@core/logger");
var errors_1 = require("@core/errors");
// Import Drizzle and schemas
var _db_1 = require("@db");
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
// Import existing CCPayment services
var ccpayment_service_1 = require("../providers/ccpayment/ccpayment.service");
var ccpayment_token_service_1 = require("../providers/ccpayment/ccpayment-token.service");
var CCPaymentAdapter = /** @class */ (function () {
    function CCPaymentAdapter() {
    }
    /**
     * Get comprehensive user balance including DGT and crypto
     */
    CCPaymentAdapter.prototype.getUserBalance = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var ccPaymentUserId, ccBalances, cryptoBalances, dgtBalance, walletBalance, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        logger_1.logger.info('CCPaymentAdapter', 'Fetching user balance', { userId: userId });
                        return [4 /*yield*/, this.getCCPaymentUserId(userId)];
                    case 1:
                        ccPaymentUserId = _a.sent();
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.getUserCoinAssetList(ccPaymentUserId)];
                    case 2:
                        ccBalances = _a.sent();
                        cryptoBalances = ccBalances.map(wallet_transformer_1.fromCCPaymentBalance);
                        return [4 /*yield*/, this.getDgtBalance(userId)];
                    case 3:
                        dgtBalance = _a.sent();
                        walletBalance = {
                            userId: userId,
                            dgtBalance: dgtBalance,
                            cryptoBalances: cryptoBalances,
                            lastUpdated: new Date().toISOString()
                        };
                        logger_1.logger.info('CCPaymentAdapter', 'User balance retrieved successfully', {
                            userId: userId,
                            cryptoBalanceCount: cryptoBalances.length,
                            dgtBalance: dgtBalance
                        });
                        return [2 /*return*/, walletBalance];
                    case 4:
                        error_1 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error fetching user balance', {
                            userId: userId,
                            error: error_1
                        });
                        if (error_1 instanceof errors_1.WalletError) {
                            throw error_1;
                        }
                        throw new errors_1.WalletError('Failed to fetch user balance', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { userId: userId, originalError: error_1 });
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create deposit address for specified coin and chain
     */
    CCPaymentAdapter.prototype.createDepositAddress = function (userId, coinSymbol, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var ccPaymentUserId, ccAddress, depositAddress, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        logger_1.logger.info('CCPaymentAdapter', 'Creating deposit address', {
                            userId: userId,
                            coinSymbol: coinSymbol,
                            chain: chain
                        });
                        return [4 /*yield*/, this.getCCPaymentUserId(userId)];
                    case 1:
                        ccPaymentUserId = _a.sent();
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.getOrCreateUserDepositAddress(ccPaymentUserId, coinSymbol)];
                    case 2:
                        ccAddress = _a.sent();
                        depositAddress = (0, wallet_transformer_1.fromCCPaymentDepositAddress)({
                            coinSymbol: coinSymbol,
                            chain: chain,
                            address: ccAddress.address,
                            memo: ccAddress.memo,
                            qrCode: ccAddress.qrCode
                        });
                        logger_1.logger.info('CCPaymentAdapter', 'Deposit address created successfully', {
                            userId: userId,
                            coinSymbol: coinSymbol,
                            chain: chain,
                            address: depositAddress.address.substring(0, 10) + '...'
                        });
                        return [2 /*return*/, depositAddress];
                    case 3:
                        error_2 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error creating deposit address', {
                            userId: userId,
                            coinSymbol: coinSymbol,
                            chain: chain,
                            error: error_2
                        });
                        if (error_2 instanceof errors_1.WalletError) {
                            throw error_2;
                        }
                        throw new errors_1.WalletError('Failed to create deposit address', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { userId: userId, coinSymbol: coinSymbol, chain: chain, originalError: error_2 });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Request cryptocurrency withdrawal
     */
    CCPaymentAdapter.prototype.requestWithdrawal = function (userId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var isValidAddress, orderId, ccWithdrawal, transactionId, withdrawalResponse, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        logger_1.logger.info('CCPaymentAdapter', 'Processing withdrawal request', {
                            userId: userId,
                            amount: request.amount,
                            currency: request.currency
                        });
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.checkWithdrawalAddressValidity(request.currency, request.address)];
                    case 1:
                        isValidAddress = _a.sent();
                        if (!isValidAddress) {
                            throw new errors_1.WalletError('Invalid withdrawal address', errors_1.ErrorCodes.VALIDATION_ERROR, 400, {
                                address: request.address,
                                currency: request.currency
                            });
                        }
                        orderId = "withdrawal_".concat(userId, "_").concat(Date.now());
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.requestWithdrawal({
                                amount: request.amount,
                                currency: request.currency,
                                orderId: orderId,
                                address: request.address,
                                notifyUrl: process.env.CCPAYMENT_WEBHOOK_URL || ''
                            })];
                    case 2:
                        ccWithdrawal = _a.sent();
                        transactionId = "tx_".concat(orderId);
                        withdrawalResponse = {
                            transactionId: transactionId,
                            status: ccWithdrawal.status,
                            estimatedCompletionTime: ccWithdrawal.estimatedTime,
                            transactionHash: ccWithdrawal.txHash,
                            fee: ccWithdrawal.fee
                        };
                        logger_1.logger.info('CCPaymentAdapter', 'Withdrawal processed successfully', {
                            userId: userId,
                            transactionId: transactionId,
                            status: withdrawalResponse.status
                        });
                        return [2 /*return*/, withdrawalResponse];
                    case 3:
                        error_3 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error processing withdrawal', {
                            userId: userId,
                            request: request,
                            error: error_3
                        });
                        if (error_3 instanceof errors_1.WalletError) {
                            throw error_3;
                        }
                        throw new errors_1.WalletError('Failed to process withdrawal', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { userId: userId, request: request, originalError: error_3 });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get list of supported coins
     */
    CCPaymentAdapter.prototype.getSupportedCoins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawTokens, supportedCoins, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentAdapter', 'Fetching supported coins');
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.getSupportedTokens()];
                    case 1:
                        rawTokens = _a.sent();
                        supportedCoins = rawTokens.map(wallet_transformer_1.fromCCPaymentTokenInfo);
                        logger_1.logger.info('CCPaymentAdapter', 'Supported coins retrieved successfully', {
                            count: supportedCoins.length
                        });
                        return [2 /*return*/, supportedCoins];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error fetching supported coins', { error: error_4 });
                        if (error_4 instanceof errors_1.WalletError) {
                            throw error_4;
                        }
                        throw new errors_1.WalletError('Failed to fetch supported coins', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { originalError: error_4 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get info for a single token
     */
    CCPaymentAdapter.prototype.getTokenInfo = function (coinId) {
        return __awaiter(this, void 0, void 0, function () {
            var coinIdNum, tokenInfo, price, prices, error_5, supportedCoin, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        logger_1.logger.info('CCPaymentAdapter', 'Fetching token info', { coinId: coinId });
                        coinIdNum = parseInt(coinId);
                        if (isNaN(coinIdNum)) {
                            throw new errors_1.WalletError('Invalid coinId format', errors_1.ErrorCodes.VALIDATION_ERROR);
                        }
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.getTokenInfo(coinIdNum)];
                    case 1:
                        tokenInfo = _a.sent();
                        price = '0';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.getTokenPrices([coinIdNum])];
                    case 3:
                        prices = _a.sent();
                        price = prices[coinIdNum] || '0';
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.warn('CCPaymentAdapter', 'Could not fetch price for token', { coinId: coinId, error: error_5 });
                        return [3 /*break*/, 5];
                    case 5:
                        supportedCoin = (0, wallet_transformer_1.fromCCPaymentTokenInfo)(tokenInfo, price);
                        logger_1.logger.info('CCPaymentAdapter', 'Token info retrieved successfully', {
                            coinId: coinId,
                            symbol: supportedCoin.symbol
                        });
                        return [2 /*return*/, supportedCoin];
                    case 6:
                        error_6 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error fetching token info', { coinId: coinId, error: error_6 });
                        if (error_6 instanceof errors_1.WalletError) {
                            throw error_6;
                        }
                        throw new errors_1.WalletError('Failed to fetch token info', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, {
                            coinId: coinId,
                            originalError: error_6
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate a crypto address for a given chain
     */
    CCPaymentAdapter.prototype.validateAddress = function (address, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var isValid, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentAdapter', 'Validating address', { address: address, chain: chain });
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.checkWithdrawalAddressValidity(chain, address)];
                    case 1:
                        isValid = _a.sent();
                        logger_1.logger.info('CCPaymentAdapter', 'Address validation completed', {
                            address: address,
                            chain: chain,
                            isValid: isValid
                        });
                        return [2 /*return*/, { isValid: isValid }];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error validating address', { address: address, chain: chain, error: error_7 });
                        if (error_7 instanceof errors_1.WalletError) {
                            throw error_7;
                        }
                        throw new errors_1.WalletError('Failed to validate address', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, {
                            address: address,
                            chain: chain,
                            originalError: error_7
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get withdrawal fee for a specific coin and chain
     */
    CCPaymentAdapter.prototype.getWithdrawFee = function (coinId, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var feeInfo, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentAdapter', 'Fetching withdrawal fee', { coinId: coinId, chain: chain });
                        return [4 /*yield*/, ccpayment_token_service_1.ccpaymentTokenService.getWithdrawFee(coinId, chain)];
                    case 1:
                        feeInfo = _a.sent();
                        logger_1.logger.info('CCPaymentAdapter', 'Withdrawal fee retrieved successfully', {
                            coinId: coinId,
                            chain: chain,
                            fee: feeInfo.amount
                        });
                        return [2 /*return*/, feeInfo];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error fetching withdrawal fee', { coinId: coinId, chain: chain, error: error_8 });
                        if (error_8 instanceof errors_1.WalletError) {
                            throw error_8;
                        }
                        throw new errors_1.WalletError('Failed to fetch withdrawal fee', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { coinId: coinId, chain: chain, originalError: error_8 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get paginated transaction history
     */
    CCPaymentAdapter.prototype.getTransactionHistory = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ccPaymentUserId, ccTransactions, rawCcTxs, error_9, localDbTransactions, localDgtTransactions, allTransactions, paginatedTransactions, error_10;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        logger_1.logger.info('CCPaymentAdapter', 'Fetching transaction history', {
                            userId: userId,
                            page: options.page,
                            limit: options.limit
                        });
                        return [4 /*yield*/, this.getCCPaymentUserId(userId).catch(function () { return null; })];
                    case 1:
                        ccPaymentUserId = _a.sent();
                        ccTransactions = [];
                        if (!ccPaymentUserId) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, ccpaymentBalanceService.getTransactionHistory({
                                userId: ccPaymentUserId,
                                page: options.page,
                                limit: options.limit,
                                type: 'all'
                            })];
                    case 3:
                        rawCcTxs = _a.sent();
                        ccTransactions = rawCcTxs.transactions.map(function (tx) { return ({
                            id: "tx_cc_".concat(tx.orderId),
                            userId: userId,
                            type: _this.mapTransactionType(tx.type),
                            amount: parseFloat(tx.amount),
                            status: _this.mapTransactionStatus(tx.status),
                            metadata: {
                                ccPaymentOrderId: tx.orderId,
                                currency: tx.currency,
                                txHash: tx.txHash,
                                ccPaymentType: tx.type
                            },
                            createdAt: tx.createdAt,
                            updatedAt: tx.updatedAt || tx.createdAt
                        }); });
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Failed to fetch CCPayment transactions, continuing with local.', { userId: userId, error: error_9 });
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, _db_1.db.query.transactions.findMany({
                            where: (0, drizzle_orm_1.eq)(_schema_1.transactions.userId, userId), // simpler query: all transactions where user is the primary actor
                            orderBy: [(0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " desc"], ["", " desc"])), _schema_1.transactions.createdAt)],
                            limit: options.limit
                        })];
                    case 6:
                        localDbTransactions = _a.sent();
                        localDgtTransactions = localDbTransactions.map(function (tx) { return ({
                            id: tx.id,
                            userId: tx.userId,
                            type: tx.type,
                            amount: tx.amount,
                            status: tx.status,
                            metadata: tx.metadata,
                            createdAt: tx.createdAt.toISOString(),
                            updatedAt: tx.updatedAt.toISOString()
                        }); });
                        allTransactions = __spreadArray(__spreadArray([], ccTransactions, true), localDgtTransactions, true);
                        allTransactions.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
                        paginatedTransactions = allTransactions.slice(0, options.limit);
                        logger_1.logger.info('CCPaymentAdapter', 'Transaction history retrieved successfully', {
                            userId: userId,
                            transactionCount: paginatedTransactions.length
                        });
                        return [2 /*return*/, paginatedTransactions];
                    case 7:
                        error_10 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error fetching transaction history', {
                            userId: userId,
                            options: options,
                            error: error_10
                        });
                        if (error_10 instanceof errors_1.WalletError) {
                            throw error_10;
                        }
                        throw new errors_1.WalletError('Failed to fetch transaction history', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { userId: userId, options: options, originalError: error_10 });
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process webhook from CCPayment
     */
    CCPaymentAdapter.prototype.processWebhook = function (payload, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var event_1, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentAdapter', 'Processing webhook');
                        event_1 = JSON.parse(payload);
                        // Process through existing CCPayment service
                        return [4 /*yield*/, ccpayment_service_1.ccpaymentService.processWebhookEvent(__assign(__assign({}, event_1), { signature: signature }), this.handleDepositWebhook.bind(this), this.handleWithdrawalWebhook.bind(this))];
                    case 1:
                        // Process through existing CCPayment service
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                transactionId: "tx_".concat(event_1.orderId),
                                message: 'Webhook processed successfully',
                                processed: true
                            }];
                    case 2:
                        error_11 = _a.sent();
                        logger_1.logger.error('CCPaymentAdapter', 'Error processing webhook', { error: error_11 });
                        return [2 /*return*/, {
                                success: false,
                                message: error_11 instanceof Error ? error_11.message : 'Unknown webhook error',
                                processed: false
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle deposit webhook event
     */
    CCPaymentAdapter.prototype.handleDepositWebhook = function (orderId, amount, currency, txHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info('CCPaymentAdapter', 'Processing deposit webhook', {
                    orderId: orderId,
                    amount: amount,
                    currency: currency,
                    txHash: txHash
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle withdrawal webhook event
     */
    CCPaymentAdapter.prototype.handleWithdrawalWebhook = function (orderId, status, txHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info('CCPaymentAdapter', 'Processing withdrawal webhook', {
                    orderId: orderId,
                    status: status,
                    txHash: txHash
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get CCPayment user ID from database mapping
     */
    CCPaymentAdapter.prototype.getCCPaymentUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db.query.users.findFirst({
                            where: (0, drizzle_orm_1.eq)(_schema_1.users.id, userId),
                            columns: {
                                ccpaymentAccountId: true
                            }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user || !user.ccpaymentAccountId) {
                            // In a full implementation, the service layer would handle the creation flow.
                            // The adapter's role is to adapt, not to orchestrate business logic.
                            throw new errors_1.WalletError("CCPayment account ID not found for user: ".concat(userId), errors_1.ErrorCodes.NOT_FOUND, 404);
                        }
                        return [2 /*return*/, user.ccpaymentAccountId];
                }
            });
        });
    };
    /**
     * Get DGT balance from local database
     */
    CCPaymentAdapter.prototype.getDgtBalance = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userWallet, user, newWallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db.query.wallets.findFirst({
                            where: (0, drizzle_orm_1.eq)(_schema_1.wallets.userId, userId)
                        })];
                    case 1:
                        userWallet = _a.sent();
                        if (userWallet) {
                            return [2 /*return*/, userWallet.balance];
                        }
                        return [4 /*yield*/, _db_1.db.query.users.findFirst({
                                where: (0, drizzle_orm_1.eq)(_schema_1.users.id, userId),
                                columns: {
                                    dgtWalletBalance: true
                                }
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            throw new errors_1.WalletError("User not found: ".concat(userId), errors_1.ErrorCodes.NOT_FOUND, 404);
                        }
                        return [4 /*yield*/, _db_1.db
                                .insert(_schema_1.wallets)
                                .values({
                                userId: userId,
                                balance: user.dgtWalletBalance || 0
                            })
                                .returning()];
                    case 3:
                        newWallet = (_a.sent())[0];
                        return [2 /*return*/, newWallet.balance];
                }
            });
        });
    };
    /**
     * Map CCPayment transaction type to our enum
     */
    CCPaymentAdapter.prototype.mapTransactionType = function (ccType) {
        switch (ccType.toLowerCase()) {
            case 'deposit':
                return 'deposit';
            case 'withdrawal':
                return 'withdrawal';
            case 'transfer':
                return 'transfer';
            default:
                return 'deposit';
        }
    };
    /**
     * Map CCPayment status to our enum
     */
    CCPaymentAdapter.prototype.mapTransactionStatus = function (ccStatus) {
        switch (ccStatus.toLowerCase()) {
            case 'success':
            case 'completed':
                return 'completed';
            case 'pending':
            case 'processing':
                return 'pending';
            case 'failed':
            case 'error':
                return 'failed';
            case 'cancelled':
                return 'cancelled';
            default:
                return 'pending';
        }
    };
    return CCPaymentAdapter;
}());
exports.CCPaymentAdapter = CCPaymentAdapter;
// Export singleton instance
exports.ccpaymentAdapter = new CCPaymentAdapter();
var templateObject_1;
