"use strict";
/**
 * CCPayment Service - Orchestration Layer
 *
 * This service orchestrates calls to the CCPayment API v2.
 * It handles user wallet creation, deposits, withdrawals, and swaps,
 * mapping Degentalk concepts to CCPayment API calls.
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
exports.ccpaymentService = exports.CCPaymentService = void 0;
var logger_1 = require("@core/logger");
var ccpayment_api_service_1 = require("./ccpayment-api.service");
var _db_1 = require("@db");
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
var CCPaymentService = /** @class */ (function () {
    function CCPaymentService() {
    }
    /**
     * Get or create a CCPayment mapping for a Degentalk user.
     * In v2, there is no explicit user creation endpoint. A user is implicitly
     * created when we first request a deposit address for their userId.
     * We will store our own mapping to track this.
     * @param userId The Degentalk user's ID.
     * @returns The Degentalk user's ID, which now serves as the CCPayment user ID.
     */
    CCPaymentService.prototype.getOrCreateCCPaymentUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingMapping, ccpaymentUserId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
                            .select()
                            .from(_schema_1.ccpaymentUsers)
                            .where((0, drizzle_orm_1.eq)(_schema_1.ccpaymentUsers.userId, userId))
                            .limit(1)];
                    case 1:
                        existingMapping = _a.sent();
                        if (existingMapping.length > 0 && existingMapping[0].ccpaymentUserId) {
                            return [2 /*return*/, existingMapping[0].ccpaymentUserId];
                        }
                        ccpaymentUserId = userId;
                        return [4 /*yield*/, _db_1.db.insert(_schema_1.ccpaymentUsers).values({
                                userId: userId,
                                ccpaymentUserId: ccpaymentUserId,
                            })];
                    case 2:
                        _a.sent();
                        logger_1.logger.info('CCPaymentService', 'Created CCPayment user mapping', { userId: userId, ccpaymentUserId: ccpaymentUserId });
                        return [2 /*return*/, ccpaymentUserId];
                }
            });
        });
    };
    /**
     * Create or get a deposit address for a user.
     * @param userId The user's unique ID.
     * @param chain The blockchain symbol (e.g., 'POLYGON').
     */
    CCPaymentService.prototype.createDepositAddress = function (userId, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                body = { userId: userId, chain: chain };
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getOrCreateUserDepositAddress', body)];
            });
        });
    };
    /**
     * Get a user's crypto balances.
     * @param userId The user's unique ID.
     */
    CCPaymentService.prototype.getUserCryptoBalances = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var body, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = { userId: userId };
                        return [4 /*yield*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getUserCoinAssetList', body)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.assets];
                }
            });
        });
    };
    /**
     * Request a withdrawal for a user.
     * @param userId The user's unique ID.
     * @param coinId The ID of the coin to withdraw.
     * @param chain The blockchain symbol.
     * @param address The destination address.
     * @param amount The amount to withdraw.
     * @param orderId Your unique order ID for this transaction.
     * @param memo Optional memo for chains that require it.
     */
    CCPaymentService.prototype.requestWithdrawal = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/applyUserWithdrawToNetwork', params)];
            });
        });
    };
    /**
     * Perform a swap for a user.
     * @param userId The user's unique ID.
     * @param fromCoinId The ID of the coin to swap from.
     * @param toCoinId The ID of the coin to swap to.
     * @param fromAmount The amount of the input coin.
     * @param orderId Your unique order ID for this swap.
     */
    CCPaymentService.prototype.swap = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/userSwap', params)];
            });
        });
    };
    /**
     * Get information about a specific token.
     * @param coinId The ID of the coin.
     */
    CCPaymentService.prototype.getTokenInfo = function (coinId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getCoin', { coinId: coinId })];
            });
        });
    };
    /**
     * Get a list of all supported tokens.
     */
    CCPaymentService.prototype.getTokenList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.makeRequest('/ccpayment/v2/getCoinList')];
            });
        });
    };
    /**
     * Health check for CCPayment services.
     */
    CCPaymentService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ccpayment_api_service_1.ccpaymentApiService.healthCheck()];
            });
        });
    };
    return CCPaymentService;
}());
exports.CCPaymentService = CCPaymentService;
// Export a singleton instance
exports.ccpaymentService = new CCPaymentService();
