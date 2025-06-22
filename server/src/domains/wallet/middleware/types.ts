import { Request, Response, NextFunction } from 'express';

/**
 * Middleware Types
 *
 * Type definitions for wallet security and validation middleware.
 */

export interface SecurityMiddleware {
	depositRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	transferRateLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	withdrawalSecurityCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	dgtTransferValidation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	adminDGTOperationValidation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface WebhookMiddleware {
	validateCCPaymentWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	rateLimitWebhooks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface RateLimitRecord {
	count: number;
	resetTime: number;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: number;
}

export interface SecurityError {
	type: string;
	message?: string;
	resetTime?: string;
	maxAttempts?: number;
	accountAge?: number;
	requiredAge?: number;
	maxAmount?: number;
	maxDailyAmount?: number;
}

export interface WebhookError {
	type: string;
	message?: string;
	maxAge?: number;
	actualAge?: number;
	resetTime?: string;
	maxRequests?: number;
	validTypes?: string[];
}
