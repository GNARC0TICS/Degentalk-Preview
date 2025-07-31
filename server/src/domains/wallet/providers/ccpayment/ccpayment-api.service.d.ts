/**
 * CCPayment API Service
 *
 * Handles low-level CCPayment API v2 interactions.
 * This version is updated to use HMAC-SHA256 signatures and v2 endpoints
 * as per the latest documentation.
 */
export interface CCPaymentConfig {
    apiUrl?: string;
    appId?: string;
    appSecret?: string;
}
export interface CCPaymentApiResponse<T = any> {
    code: number;
    msg: string;
    data?: T;
}
export declare class CCPaymentApiService {
    private client;
    private config;
    constructor(config?: CCPaymentConfig);
    private setupInterceptors;
    /**
     * Generate HMAC-SHA256 signature for CCPayment API v2 requests.
     * @param timestamp The 10-digit UNIX timestamp.
     * @param payload The JSON string of the request body. Can be an empty string.
     */
    private generateSignature;
    /**
     * Make an authenticated request to the CCPayment API v2.
     * @param endpoint The API endpoint path (e.g., '/ccpayment/v2/getCoinList').
     * @param body The request body object. Can be an empty object.
     */
    makeRequest<T>(endpoint: string, body?: Record<string, any>): Promise<T>;
    /**
     * Validate an incoming webhook signature.
     * @param payload The raw webhook payload (string).
     * @param appId The Appid from the webhook header.
     * @param signature The Sign from the webhook header.
     * @param timestamp The Timestamp from the webhook header.
     */
    validateWebhookSignature(payload: string, appId: string, signature: string, timestamp: string): boolean;
    /**
     * Health check for CCPayment API.
     * We'll use the getFiatList endpoint as it requires no parameters.
     */
    healthCheck(): Promise<boolean>;
}
export declare const ccpaymentApiService: CCPaymentApiService;
