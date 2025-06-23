/**
 * CCPayment API Service
 *
 * QUALITY IMPROVEMENT: Extracted from ccpayment.service.ts god object
 * Handles low-level CCPayment API interactions with proper separation of concerns
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { logger } from '@server/src/core/logger';
import { WalletError, ErrorCodes } from '@server/src/core/errors';

export interface CCPaymentConfig {
	apiUrl?: string;
	appId?: string;
	appSecret?: string;
	notificationUrl?: string;
}

export interface CCPaymentApiResponse<T = any> {
	code: string;
	msg: string;
	data?: T;
}

export class CCPaymentApiService {
	private client: AxiosInstance;
	private config: CCPaymentConfig;

	constructor(config: CCPaymentConfig = {}) {
		this.config = {
			apiUrl: config.apiUrl || process.env.CCPAYMENT_API_URL || 'https://admin.ccpayment.com',
			appId: config.appId || process.env.CCPAYMENT_APP_ID || '',
			appSecret: config.appSecret || process.env.CCPAYMENT_APP_SECRET || '',
			notificationUrl: config.notificationUrl || process.env.CCPAYMENT_NOTIFICATION_URL || ''
		};

		this.client = axios.create({
			baseURL: this.config.apiUrl,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		this.setupInterceptors();
	}

	/**
	 * Setup request/response interceptors for logging and error handling
	 */
	private setupInterceptors(): void {
		this.client.interceptors.request.use(
			(config) => {
				logger.debug('CCPaymentApiService', 'Outgoing request', {
					url: config.url,
					method: config.method,
					headers: config.headers
				});
				return config;
			},
			(error) => {
				logger.error('CCPaymentApiService', 'Request interceptor error', { error });
				return Promise.reject(error);
			}
		);

		this.client.interceptors.response.use(
			(response) => {
				logger.debug('CCPaymentApiService', 'Incoming response', {
					status: response.status,
					data: response.data
				});
				return response;
			},
			(error) => {
				logger.error('CCPaymentApiService', 'Response interceptor error', {
					status: error.response?.status,
					data: error.response?.data,
					message: error.message
				});
				return Promise.reject(error);
			}
		);
	}

	/**
	 * Generate signature for CCPayment API requests
	 */
	private generateSignature(params: Record<string, any>): string {
		const sortedKeys = Object.keys(params).sort();
		const signString =
			sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + `&key=${this.config.appSecret}`;

		return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
	}

	/**
	 * Make authenticated request to CCPayment API
	 */
	async makeRequest<T>(
		endpoint: string,
		params: Record<string, any> = {},
		options: AxiosRequestConfig = {}
	): Promise<T> {
		try {
			const requestParams = {
				app_id: this.config.appId,
				timestamp: Math.floor(Date.now() / 1000),
				...params
			};

			// Generate signature
			requestParams.sign = this.generateSignature(requestParams);

			const response = await this.client.request<CCPaymentApiResponse<T>>({
				url: endpoint,
				method: 'POST',
				data: requestParams,
				...options
			});

			// Handle CCPayment API response format
			if (response.data.code !== '10000') {
				throw new WalletError(
					`CCPayment API error: ${response.data.msg}`,
					ErrorCodes.PAYMENT_PROVIDER_ERROR,
					500,
					{ ccpaymentCode: response.data.code, ccpaymentMsg: response.data.msg }
				);
			}

			return response.data.data as T;
		} catch (error) {
			if (error instanceof WalletError) {
				throw error;
			}

			if (axios.isAxiosError(error)) {
				const status = error.response?.status || 500;
				const message = error.response?.data?.message || error.message;

				throw new WalletError(
					`CCPayment API request failed: ${message}`,
					ErrorCodes.PAYMENT_PROVIDER_ERROR,
					status,
					{ originalError: error.message }
				);
			}

			throw new WalletError(
				'Unexpected error in CCPayment API request',
				ErrorCodes.UNKNOWN_ERROR,
				500,
				{ originalError: error }
			);
		}
	}

	/**
	 * Validate webhook signature
	 */
	validateWebhookSignature(payload: string, signature: string): boolean {
		const expectedSignature = crypto
			.createHash('md5')
			.update(payload + this.config.appSecret)
			.digest('hex')
			.toUpperCase();

		return expectedSignature === signature;
	}

	/**
	 * Get API configuration (without secrets)
	 */
	getConfig(): Omit<CCPaymentConfig, 'appSecret'> {
		return {
			apiUrl: this.config.apiUrl,
			appId: this.config.appId,
			notificationUrl: this.config.notificationUrl
		};
	}

	/**
	 * Health check for CCPayment API
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Try a simple API call to check connectivity
			await this.makeRequest('/v1/health', {});
			return true;
		} catch (error) {
			logger.warn('CCPaymentApiService', 'Health check failed', { error });
			return false;
		}
	}
}

// Export singleton instance
export const ccpaymentApiService = new CCPaymentApiService();
