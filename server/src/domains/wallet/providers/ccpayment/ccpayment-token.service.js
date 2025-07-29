"use strict";
/**
 * CCPayment Token Service
 *
 * Handles token information, pricing, and metadata from CCPayment API
 * Provides coin details, logos, pricing, and network information
 */
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
exports.ccpaymentTokenService = exports.CCPaymentTokenService = void 0;
var logger_1 = require("@core/logger");
var errors_1 = require("@core/errors");
var ccpayment_api_service_1 = require("./ccpayment-api.service");
var CCPaymentTokenService = /** @class */ (function () {
    function CCPaymentTokenService() {
        this.tokenCache = new Map();
        this.priceCache = new Map();
        this.feeCache = new Map();
        this.supportedTokensCache = null;
        // Cache TTL in milliseconds
        this.CACHE_TTL = {
            TOKEN_INFO: 60 * 60 * 1000, // 1 hour
            PRICE: 5 * 60 * 1000, // 5 minutes
            FEE: 30 * 60 * 1000, // 30 minutes
            SUPPORTED_TOKENS: 6 * 60 * 60 * 1000 // 6 hours
        };
    }
    /**
     * Get detailed token information including logo and networks
     */
    CCPaymentTokenService.prototype.getTokenInfo = function (coinId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, response, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cached = this.tokenCache.get(coinId);
                        if (cached) {
                            logger_1.logger.debug('CCPaymentTokenService', 'Token info cache hit', { coinId: coinId });
                            return [2 /*return*/, cached];
                        }
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching token info from CCPayment', { coinId: coinId });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getCoin', { coinId: coinId })];
                    case 1:
                        response = _a.sent();
                        if (!response.coin) {
                            throw new errors_1.WalletError("Token information not found for coinId: ".concat(coinId), errors_1.ErrorCodes.NOT_FOUND, 404, { coinId: coinId });
                        }
                        // Cache the result
                        this.tokenCache.set(coinId, response.coin);
                        // Auto-cleanup cache after TTL
                        setTimeout(function () {
                            _this.tokenCache.delete(coinId);
                        }, this.CACHE_TTL.TOKEN_INFO);
                        logger_1.logger.info('CCPaymentTokenService', 'Token info retrieved successfully', {
                            coinId: coinId,
                            symbol: response.coin.symbol,
                            status: response.coin.status
                        });
                        return [2 /*return*/, response.coin];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching token info', {
                            coinId: coinId,
                            error: error_1
                        });
                        if (error_1 instanceof errors_1.WalletError) {
                            throw error_1;
                        }
                        throw new errors_1.WalletError('Failed to fetch token information', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { coinId: coinId, originalError: error_1 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get list of all supported tokens
     */
    CCPaymentTokenService.prototype.getSupportedTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (this.supportedTokensCache) {
                            logger_1.logger.debug('CCPaymentTokenService', 'Supported tokens cache hit');
                            return [2 /*return*/, this.supportedTokensCache];
                        }
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching supported tokens from CCPayment');
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getSupportCoinList')];
                    case 1:
                        response = _a.sent();
                        if (!response.list) {
                            throw new errors_1.WalletError('Failed to parse supported tokens from CCPayment response', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { response: response });
                        }
                        this.supportedTokensCache = response.list;
                        setTimeout(function () {
                            _this.supportedTokensCache = null;
                        }, this.CACHE_TTL.SUPPORTED_TOKENS);
                        logger_1.logger.info('CCPaymentTokenService', 'Supported tokens retrieved successfully', {
                            count: response.list.length
                        });
                        return [2 /*return*/, response.list];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching supported tokens', { error: error_2 });
                        if (error_2 instanceof errors_1.WalletError) {
                            throw error_2;
                        }
                        throw new errors_1.WalletError('Failed to fetch supported tokens', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { originalError: error_2 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current USDT price for tokens
     */
    CCPaymentTokenService.prototype.getTokenPrices = function (coinIds) {
        return __awaiter(this, void 0, void 0, function () {
            var uncachedCoinIds, result, _i, coinIds_1, coinId, cached, response, _loop_1, this_1, _a, _b, _c, coinIdStr, price, error_3;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        uncachedCoinIds = [];
                        result = {};
                        for (_i = 0, coinIds_1 = coinIds; _i < coinIds_1.length; _i++) {
                            coinId = coinIds_1[_i];
                            cached = this.priceCache.get(coinId);
                            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL.PRICE) {
                                result[coinId] = cached.usdtPrice;
                            }
                            else {
                                uncachedCoinIds.push(coinId);
                            }
                        }
                        if (!(uncachedCoinIds.length > 0)) return [3 /*break*/, 2];
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching token prices from CCPayment', {
                            coinIds: uncachedCoinIds
                        });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getCoinUSDTPrice', { coinIds: uncachedCoinIds })];
                    case 1:
                        response = _d.sent();
                        _loop_1 = function (coinIdStr, price) {
                            var coinId = parseInt(coinIdStr);
                            result[coinId] = price;
                            // Cache the price
                            this_1.priceCache.set(coinId, {
                                coinId: coinId,
                                usdtPrice: price,
                                timestamp: Date.now()
                            });
                            // Auto-cleanup cache after TTL
                            setTimeout(function () {
                                _this.priceCache.delete(coinId);
                            }, this_1.CACHE_TTL.PRICE);
                        };
                        this_1 = this;
                        // Process and cache the prices
                        for (_a = 0, _b = Object.entries(response.prices); _a < _b.length; _a++) {
                            _c = _b[_a], coinIdStr = _c[0], price = _c[1];
                            _loop_1(coinIdStr, price);
                        }
                        logger_1.logger.info('CCPaymentTokenService', 'Token prices retrieved successfully', {
                            fetchedCount: uncachedCoinIds.length,
                            totalCount: coinIds.length
                        });
                        _d.label = 2;
                    case 2: return [2 /*return*/, result];
                    case 3:
                        error_3 = _d.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching token prices', {
                            coinIds: coinIds,
                            error: error_3
                        });
                        if (error_3 instanceof errors_1.WalletError) {
                            throw error_3;
                        }
                        throw new errors_1.WalletError('Failed to fetch token prices', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { coinIds: coinIds, originalError: error_3 });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get withdrawal fee for specific token and chain
     */
    CCPaymentTokenService.prototype.getWithdrawFee = function (coinId, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey_1, cached, response, fee, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey_1 = "".concat(coinId, "-").concat(chain);
                        cached = this.feeCache.get(cacheKey_1);
                        if (cached) {
                            logger_1.logger.debug('CCPaymentTokenService', 'Withdraw fee cache hit', { coinId: coinId, chain: chain });
                            return [2 /*return*/, cached];
                        }
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching withdraw fee from CCPayment', {
                            coinId: coinId,
                            chain: chain
                        });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getWithdrawFee', { coinId: coinId, chain: chain })];
                    case 1:
                        response = _a.sent();
                        if (!response.fee) {
                            throw new errors_1.WalletError("Withdrawal fee not found for coinId: ".concat(coinId, ", chain: ").concat(chain), errors_1.ErrorCodes.NOT_FOUND, 404, { coinId: coinId, chain: chain });
                        }
                        fee = {
                            coinId: response.fee.coinId,
                            coinSymbol: response.fee.coinSymbol,
                            amount: response.fee.amount,
                            chain: chain
                        };
                        // Cache the result
                        this.feeCache.set(cacheKey_1, fee);
                        // Auto-cleanup cache after TTL
                        setTimeout(function () {
                            _this.feeCache.delete(cacheKey_1);
                        }, this.CACHE_TTL.FEE);
                        logger_1.logger.info('CCPaymentTokenService', 'Withdraw fee retrieved successfully', {
                            coinId: coinId,
                            chain: chain,
                            amount: fee.amount,
                            symbol: fee.coinSymbol
                        });
                        return [2 /*return*/, fee];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching withdraw fee', {
                            coinId: coinId,
                            chain: chain,
                            error: error_4
                        });
                        if (error_4 instanceof errors_1.WalletError) {
                            throw error_4;
                        }
                        throw new errors_1.WalletError('Failed to fetch withdrawal fee', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { coinId: coinId, chain: chain, originalError: error_4 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get app coin balance list (merchant balance)
     */
    CCPaymentTokenService.prototype.getAppBalanceList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching app balance list from CCPayment');
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getAppCoinAssetList')];
                    case 1:
                        response = _b.sent();
                        logger_1.logger.info('CCPaymentTokenService', 'App balance list retrieved successfully', {
                            assetCount: ((_a = response.assets) === null || _a === void 0 ? void 0 : _a.length) || 0
                        });
                        return [2 /*return*/, response.assets || []];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching app balance list', { error: error_5 });
                        if (error_5 instanceof errors_1.WalletError) {
                            throw error_5;
                        }
                        throw new errors_1.WalletError('Failed to fetch app balance list', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { originalError: error_5 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get specific app coin balance
     */
    CCPaymentTokenService.prototype.getAppCoinBalance = function (coinId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentTokenService', 'Fetching app coin balance from CCPayment', { coinId: coinId });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getAppCoinAsset', { coinId: coinId })];
                    case 1:
                        response = _a.sent();
                        if (!response.asset) {
                            throw new errors_1.WalletError("App balance not found for coinId: ".concat(coinId), errors_1.ErrorCodes.NOT_FOUND, 404, { coinId: coinId });
                        }
                        logger_1.logger.info('CCPaymentTokenService', 'App coin balance retrieved successfully', {
                            coinId: coinId,
                            symbol: response.asset.coinSymbol,
                            available: response.asset.available
                        });
                        return [2 /*return*/, response.asset];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error fetching app coin balance', {
                            coinId: coinId,
                            error: error_6
                        });
                        if (error_6 instanceof errors_1.WalletError) {
                            throw error_6;
                        }
                        throw new errors_1.WalletError('Failed to fetch app coin balance', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { coinId: coinId, originalError: error_6 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check withdrawal address validity
     */
    CCPaymentTokenService.prototype.checkWithdrawalAddressValidity = function (chain, address) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentTokenService', 'Checking withdrawal address validity', {
                            chain: chain,
                            address: address.substring(0, 10) + '...' // Log partial address for security
                        });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/checkWithdrawalAddressValidity', { chain: chain, address: address })];
                    case 1:
                        response = _a.sent();
                        logger_1.logger.info('CCPaymentTokenService', 'Address validity check completed', {
                            chain: chain,
                            isValid: response.addrIsValid
                        });
                        return [2 /*return*/, response.addrIsValid];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error checking address validity', {
                            chain: chain,
                            error: error_7
                        });
                        if (error_7 instanceof errors_1.WalletError) {
                            throw error_7;
                        }
                        throw new errors_1.WalletError('Failed to check withdrawal address validity', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { chain: chain, originalError: error_7 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rescan lost transaction
     */
    CCPaymentTokenService.prototype.rescanLostTransaction = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('CCPaymentTokenService', 'Rescanning lost transaction', {
                            chain: params.chain,
                            txId: params.txId
                        });
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/rescanLostTransaction', params)];
                    case 1:
                        response = _a.sent();
                        logger_1.logger.info('CCPaymentTokenService', 'Transaction rescan initiated', {
                            chain: params.chain,
                            txId: params.txId,
                            description: response.description
                        });
                        return [2 /*return*/, response.description];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('CCPaymentTokenService', 'Error rescanning transaction', {
                            params: params,
                            error: error_8
                        });
                        if (error_8 instanceof errors_1.WalletError) {
                            throw error_8;
                        }
                        throw new errors_1.WalletError('Failed to rescan transaction', errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { params: params, originalError: error_8 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    CCPaymentTokenService.prototype.clearCaches = function () {
        this.tokenCache.clear();
        this.priceCache.clear();
        this.feeCache.clear();
        this.supportedTokensCache = null;
        logger_1.logger.info('CCPaymentTokenService', 'All caches cleared');
    };
    /**
     * Get cache statistics
     */
    CCPaymentTokenService.prototype.getCacheStats = function () {
        return {
            tokenInfo: this.tokenCache.size,
            prices: this.priceCache.size,
            fees: this.feeCache.size,
            supportedTokens: this.supportedTokensCache ? this.supportedTokensCache.length : 0
        };
    };
    return CCPaymentTokenService;
}());
exports.CCPaymentTokenService = CCPaymentTokenService;
// Export singleton instance
exports.ccpaymentTokenService = new CCPaymentTokenService();
