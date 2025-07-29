"use strict";
/**
 * Cache Wallet Adapter
 *
 * Provides caching layer for wallet operations
 * Can be used to cache balances, reduce API calls, and improve performance
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
exports.CacheAdapter = void 0;
var logger_1 = require("@core/logger");
var CacheAdapter = /** @class */ (function () {
    function CacheAdapter(underlyingAdapter) {
        this.underlyingAdapter = underlyingAdapter;
        this.cache = new Map();
        this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Get user balance with caching
     */
    CacheAdapter.prototype.getUserBalance = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "balance:".concat(userId);
                        cached = this.getFromCache(cacheKey);
                        if (cached) {
                            logger_1.logger.debug('CacheAdapter', 'Balance cache hit', { userId: userId });
                            return [2 /*return*/, cached];
                        }
                        logger_1.logger.debug('CacheAdapter', 'Balance cache miss, fetching from underlying adapter', {
                            userId: userId
                        });
                        return [4 /*yield*/, this.underlyingAdapter.getUserBalance(userId)];
                    case 1:
                        balance = _a.sent();
                        // Cache balance for 2 minutes (balances change frequently)
                        this.setCache(cacheKey, balance, 2 * 60 * 1000);
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    /**
     * Create deposit address (no caching - should be fresh each time)
     */
    CacheAdapter.prototype.createDepositAddress = function (userId, coinSymbol, chain) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.debug('CacheAdapter', 'Creating deposit address (no cache)', {
                    userId: userId,
                    coinSymbol: coinSymbol,
                    chain: chain
                });
                return [2 /*return*/, this.underlyingAdapter.createDepositAddress(userId, coinSymbol, chain)];
            });
        });
    };
    /**
     * Request withdrawal (no caching - always fresh)
     */
    CacheAdapter.prototype.requestWithdrawal = function (userId, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.debug('CacheAdapter', 'Processing withdrawal request (no cache)', { userId: userId });
                // Invalidate balance cache since withdrawal will change it
                this.invalidateUserCache(userId);
                return [2 /*return*/, this.underlyingAdapter.requestWithdrawal(userId, request)];
            });
        });
    };
    /**
     * Get transaction history with caching
     */
    CacheAdapter.prototype.getTransactionHistory = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "transactions:".concat(userId, ":").concat(options.page, ":").concat(options.limit, ":").concat(options.sortBy, ":").concat(options.sortOrder);
                        cached = this.getFromCache(cacheKey);
                        if (cached) {
                            logger_1.logger.debug('CacheAdapter', 'Transaction history cache hit', { userId: userId, options: options });
                            return [2 /*return*/, cached];
                        }
                        logger_1.logger.debug('CacheAdapter', 'Transaction history cache miss', { userId: userId, options: options });
                        return [4 /*yield*/, this.underlyingAdapter.getTransactionHistory(userId, options)];
                    case 1:
                        transactions = _a.sent();
                        // Cache transaction history for 5 minutes
                        this.setCache(cacheKey, transactions, 5 * 60 * 1000);
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    /**
     * Process webhook (no caching)
     */
    CacheAdapter.prototype.processWebhook = function (payload, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.debug('CacheAdapter', 'Processing webhook (no cache)');
                        return [4 /*yield*/, this.underlyingAdapter.processWebhook(payload, signature)];
                    case 1:
                        result = _a.sent();
                        // If webhook was successful, invalidate relevant caches
                        if (result.success) {
                            this.invalidateAllBalanceCaches();
                            this.invalidateAllTransactionCaches();
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get data from cache if not expired
     */
    CacheAdapter.prototype.getFromCache = function (key) {
        var entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        var now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    };
    /**
     * Set data in cache with TTL
     */
    CacheAdapter.prototype.setCache = function (key, data, ttl) {
        var _this = this;
        if (ttl === void 0) { ttl = this.DEFAULT_TTL; }
        this.cache.set(key, {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        });
        // Auto-cleanup expired entry
        setTimeout(function () {
            var entry = _this.cache.get(key);
            if (entry && Date.now() - entry.timestamp > entry.ttl) {
                _this.cache.delete(key);
            }
        }, ttl);
    };
    /**
     * Invalidate all cache entries for a specific user
     */
    CacheAdapter.prototype.invalidateUserCache = function (userId) {
        var _this = this;
        var keysToDelete = [];
        for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.includes(userId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(function (key) { return _this.cache.delete(key); });
        if (keysToDelete.length > 0) {
            logger_1.logger.debug('CacheAdapter', 'Invalidated user cache entries', {
                userId: userId,
                deletedKeys: keysToDelete.length
            });
        }
    };
    /**
     * Invalidate all balance caches
     */
    CacheAdapter.prototype.invalidateAllBalanceCaches = function () {
        var _this = this;
        var keysToDelete = [];
        for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.startsWith('balance:')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(function (key) { return _this.cache.delete(key); });
        if (keysToDelete.length > 0) {
            logger_1.logger.debug('CacheAdapter', 'Invalidated all balance caches', {
                deletedKeys: keysToDelete.length
            });
        }
    };
    /**
     * Invalidate all transaction caches
     */
    CacheAdapter.prototype.invalidateAllTransactionCaches = function () {
        var _this = this;
        var keysToDelete = [];
        for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.startsWith('transactions:')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(function (key) { return _this.cache.delete(key); });
        if (keysToDelete.length > 0) {
            logger_1.logger.debug('CacheAdapter', 'Invalidated all transaction caches', {
                deletedKeys: keysToDelete.length
            });
        }
    };
    /**
     * Clear all cache entries
     */
    CacheAdapter.prototype.clearAll = function () {
        var size = this.cache.size;
        this.cache.clear();
        logger_1.logger.info('CacheAdapter', 'Cleared all cache entries', { previousSize: size });
    };
    /**
     * Get cache statistics
     */
    CacheAdapter.prototype.getCacheStats = function () {
        var balanceEntries = 0;
        var transactionEntries = 0;
        for (var _i = 0, _a = this.cache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.startsWith('balance:')) {
                balanceEntries++;
            }
            else if (key.startsWith('transactions:')) {
                transactionEntries++;
            }
        }
        // Rough memory estimation (not precise)
        var memoryUsage = "~".concat(Math.round((this.cache.size * 1024) / 1024), "MB");
        return {
            totalEntries: this.cache.size,
            balanceEntries: balanceEntries,
            transactionEntries: transactionEntries,
            memoryUsage: memoryUsage
        };
    };
    return CacheAdapter;
}());
exports.CacheAdapter = CacheAdapter;
