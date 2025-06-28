/**
 * Development Security Middleware
 *
 * Provides basic security guardrails for development mode.
 * Helps prevent accidental exposure when sharing access links.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@server/src/core/logger';
import { isDevMode } from '@server/src/utils/environment';

interface DevSecurityConfig {
	allowedIPs?: string[];
	allowedOrigins?: string[];
	requireAuth?: boolean;
	blockProductionDomains?: boolean;
}

class DevSecurityMiddleware {
	private config: DevSecurityConfig;

	constructor(config: DevSecurityConfig = {}) {
		this.config = {
			allowedIPs: ['127.0.0.1', '::1', 'localhost'],
			allowedOrigins: ['http://localhost:5173', 'http://localhost:5001'],
			requireAuth: false,
			blockProductionDomains: true,
			...config
		};
	}

	/**
	 * Basic IP allowlist for sensitive endpoints
	 */
	ipAllowlist = (req: Request, res: Response, next: NextFunction) => {
		if (!isDevMode()) {
			return next();
		}

		const clientIP = this.getClientIP(req);
		const isAllowed = this.config.allowedIPs?.some(
			(ip) => clientIP === ip || clientIP.includes(ip)
		);

		if (!isAllowed) {
			logger.warn('DevSecurity', 'Blocked request from non-local IP', {
				ip: clientIP,
				path: req.path,
				userAgent: req.get('User-Agent')
			});

			return res.status(403).json({
				error: 'Development mode: Local access only',
				hint: 'This endpoint is restricted to local development'
			});
		}

		next();
	};

	/**
	 * Origin validation for CORS-sensitive endpoints
	 */
	originValidation = (req: Request, res: Response, next: NextFunction) => {
		if (!isDevMode()) {
			return next();
		}

		const origin = req.get('Origin') || req.get('Referer');

		if (origin && this.config.blockProductionDomains) {
			const isProdDomain = this.isProductionDomain(origin);

			if (isProdDomain) {
				logger.warn('DevSecurity', 'Blocked production domain access', {
					origin,
					path: req.path
				});

				return res.status(403).json({
					error: 'Development mode: Production domain blocked',
					hint: 'Use localhost for development'
				});
			}
		}

		next();
	};

	/**
	 * Auth requirement for admin endpoints
	 */
	requireAuthInDev = (req: Request, res: Response, next: NextFunction) => {
		if (!isDevMode() || !this.config.requireAuth) {
			return next();
		}

		if (!req.user) {
			return res.status(401).json({
				error: 'Development mode: Authentication required',
				hint: 'Log in to access this endpoint'
			});
		}

		next();
	};

	/**
	 * Rate limiting for development
	 */
	simpleRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
		const requests = new Map<string, { count: number; resetTime: number }>();

		return (req: Request, res: Response, next: NextFunction) => {
			if (!isDevMode()) {
				return next();
			}

			const clientIP = this.getClientIP(req);
			const now = Date.now();

			const userRequests = requests.get(clientIP);

			if (!userRequests || now > userRequests.resetTime) {
				requests.set(clientIP, { count: 1, resetTime: now + windowMs });
				return next();
			}

			if (userRequests.count >= maxRequests) {
				logger.warn('DevSecurity', 'Rate limit exceeded', { ip: clientIP });
				return res.status(429).json({
					error: 'Rate limit exceeded',
					hint: 'Too many requests from this IP'
				});
			}

			userRequests.count++;
			next();
		};
	};

	private getClientIP(req: Request): string {
		return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
	}

	private isProductionDomain(origin: string): boolean {
		const prodPatterns = [
			/\.com$/,
			/\.net$/,
			/\.org$/,
			/\.io$/,
			/degentalk/i,
			/\.vercel\.app$/,
			/\.netlify\.app$/,
			/\.herokuapp\.com$/
		];

		return prodPatterns.some((pattern) => pattern.test(origin));
	}
}

// Export configured instance
export const devSecurity = new DevSecurityMiddleware({
	requireAuth: process.env.DEV_REQUIRE_AUTH === 'true',
	blockProductionDomains: process.env.DEV_BLOCK_PROD_DOMAINS !== 'false'
});

// Individual middleware exports
export const { ipAllowlist, originValidation, requireAuthInDev, simpleRateLimit } = devSecurity;
