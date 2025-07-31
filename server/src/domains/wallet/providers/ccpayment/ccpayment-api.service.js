/**
 * CCPayment API Service
 *
 * Handles low-level CCPayment API v2 interactions.
 * This version is updated to use HMAC-SHA256 signatures and v2 endpoints
 * as per the latest documentation.
 */
import axios from 'axios';
import crypto from 'crypto';
import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
export class CCPaymentApiService {
    client;
    config;
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || process.env.CCPAYMENT_API_URL || 'https://ccpayment.com',
            appId: config.appId || process.env.CCPAYMENT_APP_ID || '',
            appSecret: config.appSecret || process.env.CCPAYMENT_APP_SECRET || '',
        };
        this.client = axios.create({
            baseURL: this.config.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            logger.debug('CCPaymentApiService', 'Outgoing request', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers,
            });
            return config;
        }, (error) => {
            logger.error('CCPaymentApiService', 'Request interceptor error', { error });
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            logger.debug('CCPaymentApiService', 'Incoming response', {
                status: response.status,
                data: response.data,
            });
            return response;
        }, (error) => {
            logger.error('CCPaymentApiService', 'Response interceptor error', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(error);
        });
    }
    /**
     * Generate HMAC-SHA256 signature for CCPayment API v2 requests.
     * @param timestamp The 10-digit UNIX timestamp.
     * @param payload The JSON string of the request body. Can be an empty string.
     */
    generateSignature(timestamp, payload) {
        const signText = this.config.appId + timestamp + payload;
        return crypto
            .createHmac('sha256', this.config.appSecret)
            .update(signText)
            .digest('hex');
    }
    /**
     * Make an authenticated request to the CCPayment API v2.
     * @param endpoint The API endpoint path (e.g., '/ccpayment/v2/getCoinList').
     * @param body The request body object. Can be an empty object.
     */
    async makeRequest(endpoint, body = {}) {
        try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '';
            const signature = this.generateSignature(timestamp, bodyString);
            const headers = {
                Appid: this.config.appId,
                Sign: signature,
                Timestamp: timestamp,
            };
            const response = await this.client.post(endpoint, bodyString, { headers });
            if (response.data.code !== 10000) {
                throw new WalletError(`CCPayment API error: ${response.data.msg}`, ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, { ccpaymentCode: response.data.code, ccpaymentMsg: response.data.msg });
            }
            return response.data.data;
        }
        catch (error) {
            if (error instanceof WalletError) {
                throw error;
            }
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 500;
                const message = error.response?.data?.msg || error.message;
                throw new WalletError(`CCPayment API request failed: ${message}`, ErrorCodes.PAYMENT_PROVIDER_ERROR, status, { originalError: error.message });
            }
            throw new WalletError('Unexpected error in CCPayment API request', ErrorCodes.UNKNOWN_ERROR, 500, { originalError: error });
        }
    }
    /**
     * Validate an incoming webhook signature.
     * @param payload The raw webhook payload (string).
     * @param appId The Appid from the webhook header.
     * @param signature The Sign from the webhook header.
     * @param timestamp The Timestamp from the webhook header.
     */
    validateWebhookSignature(payload, appId, signature, timestamp) {
        if (appId !== this.config.appId) {
            logger.warn('CCPaymentApiService', 'Webhook AppId mismatch', { received: appId });
            return false;
        }
        const expectedSignature = this.generateSignature(timestamp, payload);
        const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!isValid) {
            logger.warn('CCPaymentApiService', 'Invalid webhook signature', {
                received: signature,
                expected: expectedSignature,
            });
        }
        return isValid;
    }
    /**
     * Health check for CCPayment API.
     * We'll use the getFiatList endpoint as it requires no parameters.
     */
    async healthCheck() {
        try {
            await this.makeRequest('/ccpayment/v2/getFiatList');
            return true;
        }
        catch (error) {
            logger.warn('CCPaymentApiService', 'Health check failed', { error: error.message });
            return false;
        }
    }
}
// Export a singleton instance
export const ccpaymentApiService = new CCPaymentApiService();
