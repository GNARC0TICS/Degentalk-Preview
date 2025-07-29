"use strict";
/**
 * CCPayment API Service
 *
 * Handles low-level CCPayment API v2 interactions.
 * This version is updated to use HMAC-SHA256 signatures and v2 endpoints
 * as per the latest documentation.
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
exports.ccpaymentApiService = exports.CCPaymentApiService = void 0;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var logger_1 = require("@core/logger");
var errors_1 = require("@core/errors");
var CCPaymentApiService = /** @class */ (function () {
    function CCPaymentApiService(config) {
        if (config === void 0) { config = {}; }
        this.config = {
            apiUrl: config.apiUrl || process.env.CCPAYMENT_API_URL || 'https://ccpayment.com',
            appId: config.appId || process.env.CCPAYMENT_APP_ID || '',
            appSecret: config.appSecret || process.env.CCPAYMENT_APP_SECRET || '',
        };
        this.client = axios_1.default.create({
            baseURL: this.config.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    CCPaymentApiService.prototype.setupInterceptors = function () {
        this.client.interceptors.request.use(function (config) {
            logger_1.logger.debug('CCPaymentApiService', 'Outgoing request', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers,
            });
            return config;
        }, function (error) {
            logger_1.logger.error('CCPaymentApiService', 'Request interceptor error', { error: error });
            return Promise.reject(error);
        });
        this.client.interceptors.response.use(function (response) {
            logger_1.logger.debug('CCPaymentApiService', 'Incoming response', {
                status: response.status,
                data: response.data,
            });
            return response;
        }, function (error) {
            var _a, _b;
            logger_1.logger.error('CCPaymentApiService', 'Response interceptor error', {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                data: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
                message: error.message,
            });
            return Promise.reject(error);
        });
    };
    /**
     * Generate HMAC-SHA256 signature for CCPayment API v2 requests.
     * @param timestamp The 10-digit UNIX timestamp.
     * @param payload The JSON string of the request body. Can be an empty string.
     */
    CCPaymentApiService.prototype.generateSignature = function (timestamp, payload) {
        var signText = this.config.appId + timestamp + payload;
        return crypto_1.default
            .createHmac('sha256', this.config.appSecret)
            .update(signText)
            .digest('hex');
    };
    /**
     * Make an authenticated request to the CCPayment API v2.
     * @param endpoint The API endpoint path (e.g., '/ccpayment/v2/getCoinList').
     * @param body The request body object. Can be an empty object.
     */
    CCPaymentApiService.prototype.makeRequest = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, body) {
            var timestamp, bodyString, signature, headers, response, error_1, status_1, message;
            var _a, _b, _c;
            if (body === void 0) { body = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        timestamp = Math.floor(Date.now() / 1000).toString();
                        bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '';
                        signature = this.generateSignature(timestamp, bodyString);
                        headers = {
                            Appid: this.config.appId,
                            Sign: signature,
                            Timestamp: timestamp,
                        };
                        return [4 /*yield*/, this.client.post(endpoint, bodyString, { headers: headers })];
                    case 1:
                        response = _d.sent();
                        if (response.data.code !== 10000) {
                            throw new errors_1.WalletError("CCPayment API error: ".concat(response.data.msg), errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { ccpaymentCode: response.data.code, ccpaymentMsg: response.data.msg });
                        }
                        return [2 /*return*/, response.data.data];
                    case 2:
                        error_1 = _d.sent();
                        if (error_1 instanceof errors_1.WalletError) {
                            throw error_1;
                        }
                        if (axios_1.default.isAxiosError(error_1)) {
                            status_1 = ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
                            message = ((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.msg) || error_1.message;
                            throw new errors_1.WalletError("CCPayment API request failed: ".concat(message), errors_1.ErrorCodes.PAYMENT_PROVIDER_ERROR, status_1, { originalError: error_1.message });
                        }
                        throw new errors_1.WalletError('Unexpected error in CCPayment API request', errors_1.ErrorCodes.UNKNOWN_ERROR, 500, { originalError: error_1 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate an incoming webhook signature.
     * @param payload The raw webhook payload (string).
     * @param appId The Appid from the webhook header.
     * @param signature The Sign from the webhook header.
     * @param timestamp The Timestamp from the webhook header.
     */
    CCPaymentApiService.prototype.validateWebhookSignature = function (payload, appId, signature, timestamp) {
        if (appId !== this.config.appId) {
            logger_1.logger.warn('CCPaymentApiService', 'Webhook AppId mismatch', { received: appId });
            return false;
        }
        var expectedSignature = this.generateSignature(timestamp, payload);
        var isValid = crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!isValid) {
            logger_1.logger.warn('CCPaymentApiService', 'Invalid webhook signature', {
                received: signature,
                expected: expectedSignature,
            });
        }
        return isValid;
    };
    /**
     * Health check for CCPayment API.
     * We'll use the getFiatList endpoint as it requires no parameters.
     */
    CCPaymentApiService.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.makeRequest('/ccpayment/v2/getFiatList')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.warn('CCPaymentApiService', 'Health check failed', { error: error_2.message });
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CCPaymentApiService;
}());
exports.CCPaymentApiService = CCPaymentApiService;
// Export a singleton instance
exports.ccpaymentApiService = new CCPaymentApiService();
