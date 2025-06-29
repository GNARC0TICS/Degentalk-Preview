/**
 * Security Middleware
 *
 * Implements CORS, CSRF protection, and other security headers
 * for production-grade API security
 */

import cors from 'cors';
import helmet from 'helmet';
import { randomBytes, createHmac } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { env, getCorsConfig, isProduction, isDevelopment } from '../config/environment';
import { userService } from '../services/user.service';
import { logger } from '../logger';

/**
 * Configure CORS with environment-specific settings
 */
export const corsMiddleware = cors({
	...getCorsConfig(),
	optionsSuccessStatus: 200, // Support legacy browsers
	preflightContinue: false,
	credentials: true
});

/**
 * Modern CSRF Protection Implementation
 * Replaces deprecated csurf with secure custom implementation
 */

const CSRF_SECRET = env.SESSION_SECRET + ':csrf';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate CSRF token
 */
function generateCsrfToken(sessionId: string): string {
	const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
	const signature = createHmac('sha256', CSRF_SECRET).update(`${sessionId}:${token}`).digest('hex');

	return `${token}.${signature}`;
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken(sessionId: string, token: string): boolean {
	if (!token || !sessionId) return false;

	const [tokenPart, signature] = token.split('.');
	if (!tokenPart || !signature) return false;

	const expectedSignature = createHmac('sha256', CSRF_SECRET)
		.update(`${sessionId}:${tokenPart}`)
		.digest('hex');

	// Timing-safe comparison
	return signature === expectedSignature;
}

/**
 * CSRF Protection Middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
	// Skip for safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
		return next();
	}

	const sessionId = (req.session as any)?.id || req.sessionID;
	if (!sessionId) {
		logger.warn('CSRF', 'No session ID for CSRF validation', {
			path: req.path,
			method: req.method,
			ip: req.ip
		});
		return res.status(403).json({
			error: 'CSRF validation failed',
			message: 'Session required'
		});
	}

	// Get CSRF token from various sources
	const token =
		req.body._csrf || req.query._csrf || req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

	if (!verifyCsrfToken(sessionId, token)) {
		logger.warn('CSRF', 'Invalid CSRF token', {
			path: req.path,
			method: req.method,
			ip: req.ip,
			hasToken: !!token,
			sessionId: sessionId.substring(0, 8) + '...'
		});

		return res.status(403).json({
			error: 'CSRF validation failed',
			message: 'Invalid or missing CSRF token'
		});
	}

	next();
}

/**
 * Generate CSRF token for session
 */
export function generateSessionCsrfToken(req: Request): string | null {
	const sessionId = (req.session as any)?.id || req.sessionID;
	return sessionId ? generateCsrfToken(sessionId) : null;
}

/**
 * Security Headers Middleware
 * Implements security best practices with Helmet
 */
export const securityHeaders = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
			fontSrc: ["'self'", 'https://fonts.gstatic.com'],
			imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
			scriptSrc: isDevelopment()
				? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] // Allow dev tools
				: ["'self'"],
			connectSrc: ["'self'", 'wss:', 'ws:'],
			frameSrc: ["'none'"],
			objectSrc: ["'none'"],
			baseUri: ["'self'"],
			formAction: ["'self'"]
		}
	},
	hsts: {
		maxAge: 31536000, // 1 year
		includeSubDomains: true,
		preload: true
	},
	noSniff: true,
	frameguard: { action: 'deny' },
	xssFilter: true,
	referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Rate limiting configuration for different endpoint types
 */
export const rateLimitConfigs = {
	// General API endpoints
	general: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // 100 requests per window
		message: {
			error: 'Too many requests',
			retryAfter: '15 minutes'
		},
		standardHeaders: true,
		legacyHeaders: false
	},

	// Authentication endpoints (stricter)
	auth: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 5, // 5 attempts per window
		message: {
			error: 'Too many authentication attempts',
			retryAfter: '15 minutes'
		},
		standardHeaders: true,
		legacyHeaders: false
	},

	// Admin endpoints (very strict)
	admin: {
		windowMs: 60 * 60 * 1000, // 1 hour
		max: 50, // 50 requests per hour
		message: {
			error: 'Too many admin requests',
			retryAfter: '1 hour'
		},
		standardHeaders: true,
		legacyHeaders: false
	},

	// Financial operations (extremely strict)
	financial: {
		windowMs: 60 * 60 * 1000, // 1 hour
		max: 10, // 10 requests per hour
		message: {
			error: 'Too many financial operations',
			retryAfter: '1 hour'
		},
		standardHeaders: true,
		legacyHeaders: false
	}
};

/**
 * CSRF Token Provider Middleware
 * Provides CSRF tokens to authenticated clients
 */
export function csrfTokenProvider(req: Request, res: Response, next: NextFunction) {
	if (req.method === 'GET' && req.path === '/api/csrf-token') {
		const token = generateSessionCsrfToken(req);

		if (!token) {
			return res.status(400).json({
				error: 'No session available',
				message: 'Session required to generate CSRF token'
			});
		}

		return res.json({
			csrfToken: token,
			expires: new Date(Date.now() + 3600000).toISOString() // 1 hour
		});
	}
	next();
}

/**
 * Security Audit Middleware
 * Logs security-relevant events for monitoring
 */
export function securityAuditLogger(req: Request, res: Response, next: NextFunction) {
	// Log potentially suspicious patterns
	const suspiciousPatterns = [
		/\.\./, // Path traversal
		/<script>/i, // XSS attempts
		/union.*select/i, // SQL injection
		/javascript:/i, // JavaScript protocol
		/data:.*base64/i // Data URI abuse
	];

	const userAgent = req.get('User-Agent') || '';
	const referer = req.get('Referer') || '';
	const fullUrl = `${req.path}${req.url}`;

	// Check for suspicious patterns
	const suspicious = suspiciousPatterns.some(
		(pattern) => pattern.test(fullUrl) || pattern.test(userAgent) || pattern.test(referer)
	);

	if (suspicious) {
		logger.warn('SecurityAudit', 'Suspicious request detected', {
			ip: req.ip,
			method: req.method,
			path: req.path,
			userAgent,
			referer,
			body: req.method === 'POST' ? Object.keys(req.body || {}) : undefined
		});
	}

	// Log admin operations
	if (req.path.startsWith('/api/admin') && req.method !== 'GET') {
		const authUser = userService.getUserFromRequest(req);
		logger.info('SecurityAudit', 'Admin operation', {
			userId: authUser?.id,
			method: req.method,
			path: req.path,
			ip: req.ip,
			isDevelopmentBypass: (req as any).isDevelopmentBypass
		});
	}

	// Log financial operations
	if (req.path.startsWith('/api/wallet') && req.method !== 'GET') {
		const authUser = userService.getUserFromRequest(req);
		logger.info('SecurityAudit', 'Financial operation', {
			userId: authUser?.id,
			method: req.method,
			path: req.path,
			ip: req.ip,
			amount: req.body?.amount,
			isDevelopmentBypass: (req as any).isDevelopmentBypass
		});
	}

	next();
}

/**
 * Origin Validation Middleware
 * Additional origin validation beyond CORS
 */
export function originValidation(req: Request, res: Response, next: NextFunction) {
	const origin = req.get('Origin');
	const host = req.get('Host');

	// Skip for same-origin requests
	if (!origin || origin.includes(host || '')) {
		return next();
	}

	// Validate against allowed origins in production
	if (isProduction() && env.ALLOWED_ORIGINS) {
		const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

		if (!allowedOrigins.includes(origin)) {
			logger.warn('SecurityAudit', 'Blocked request from unauthorized origin', {
				origin,
				host,
				ip: req.ip,
				path: req.path
			});

			return res.status(403).json({
				error: 'Forbidden',
				message: 'Origin not allowed'
			});
		}
	}

	next();
}

/**
 * Development Security Warning Middleware
 * Warns about insecure development configurations
 */
export function developmentSecurityWarning(req: Request, res: Response, next: NextFunction) {
	if (isDevelopment() && req.headers['x-dev-role']) {
		res.setHeader('X-Development-Warning', 'Authentication bypass enabled');
	}

	if (isDevelopment() && env.DEV_BYPASS_PASSWORD) {
		res.setHeader('X-Development-Auth-Bypass', 'true');
	}

	next();
}

/**
 * API Response Security Headers
 */
export function apiResponseSecurity(req: Request, res: Response, next: NextFunction) {
	// Prevent information leakage
	res.removeHeader('X-Powered-By');

	// Add API-specific security headers
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');

	// Cache control for API responses
	if (req.path.startsWith('/api/')) {
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
	}

	next();
}

/**
 * Request Size Limits for different endpoint types
 */
export const requestSizeLimits = {
	default: '10mb',
	json: '1mb',
	urlencoded: '1mb',
	file: '50mb',
	admin: '100kb',
	financial: '10kb'
};

// Export individual middleware functions for modular use
export { cors, helmet };

// Log security configuration on startup
logger.info('Security middleware configured', {
	environment: env.NODE_ENV,
	corsEnabled: true,
	csrfEnabled: true,
	securityHeaders: true,
	rateLimitEnabled: env.RATE_LIMIT_ENABLED,
	hasAllowedOrigins: !!env.ALLOWED_ORIGINS
});
