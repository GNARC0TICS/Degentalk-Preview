/**
 * Authentication configuration shared between client and server
 * Sensitive values (secrets, keys) are loaded server-side only
 */
export const authConfig = {
	jwt: {
		enabled: true,
		accessExpiry: '15m',
		refreshExpiry: '7d',
		issuer: 'degentalk',
		algorithm: 'HS256' as const,
		tokenVersion: 1,
		refreshRotation: true,
		refreshReuseWindow: 2000, // 2s grace period
	},

	session: {
		enabled: false, // API-first approach
		name: 'degen_sid',
		expiry: 86400000, // 24h
		store: 'memory' as 'memory' | 'redis' | 'postgres',
		storePrefix: 'sess:',
		cookie: {
			secure: true, // Override in dev
			httpOnly: true,
			sameSite: 'lax' as const,
			maxAge: 86400000,
		},
	},

	apiKey: {
		enabled: false, // Enable when needed
		headerName: 'X-API-Key',
		prefix: 'dgt_',
		scopes: {
			read: ['read:profile', 'read:posts', 'read:wallet'],
			write: ['write:posts', 'write:tips', 'write:profile'],
			admin: ['admin:users', 'admin:forums', 'admin:system'],
		},
	},

	rateLimit: {
		enabled: true,
		provider: 'memory' as 'memory' | 'redis' | 'dynamodb',
		windowMs: 60000, // 1 minute
		maxRequests: 100,
		
		// Forum-specific limits
		forumOverrides: {
			'high-stakes': { 
				maxRequests: 20,
				windowMs: 60000,
				message: 'Slow down degen, high stakes requires patience',
			},
			'whale-lounge': { 
				maxRequests: 1000,
				windowMs: 60000,
				message: 'Even whales have limits',
			},
			'dev-testing': { 
				maxRequests: 10000,
				windowMs: 60000,
			},
		},
		
		// Endpoint-specific limits
		endpointOverrides: {
			'/api/auth/login': { 
				maxRequests: 5, 
				windowMs: 900000, // 15 min
				message: 'Too many login attempts',
			},
			'/api/auth/register': { 
				maxRequests: 3, 
				windowMs: 3600000, // 1 hour
				message: 'Registration limit reached',
			},
			'/api/tips/rain': { 
				maxRequests: 10, 
				windowMs: 3600000, // 1 hour
				message: 'Rain cooldown active',
			},
			'/api/wallet/withdraw': { 
				maxRequests: 5, 
				windowMs: 86400000, // 24 hours
				message: 'Daily withdrawal limit reached',
			},
		},
	},

	permissions: {
		cacheEnabled: true,
		cacheExpiry: 300000, // 5 min
		cacheProvider: 'memory' as 'memory' | 'redis',
		
		// Feature gates
		checkForumAccess: true,
		checkXPRequirements: true,
		checkDGTBalance: false, // Enable for premium features
		checkAchievements: true,
		
		// Role hierarchy (index = power level)
		roleHierarchy: ['user', 'vip', 'moderator', 'admin', 'owner'] as const,
		
		// Base permissions per role
		defaultPermissions: {
			user: [
				'read:public',
				'write:own_posts',
				'write:tips',
				'use:reactions',
			],
			vip: [
				'read:vip_forums',
				'write:longer_posts',
				'write:more_tips',
				'use:special_reactions',
				'skip:captcha',
			],
			moderator: [
				'read:all',
				'write:moderation',
				'delete:posts',
				'ban:temporary',
				'view:reports',
			],
			admin: [
				'read:all',
				'write:all',
				'delete:all',
				'ban:permanent',
				'manage:users',
				'manage:forums',
				'view:analytics',
			],
			owner: ['*'], // Wildcard - all permissions
		},
	},

	security: {
		// Password requirements
		bcryptRounds: 12,
		passwordMinLength: 8,
		passwordRequirements: {
			minLength: 8,
			requireUppercase: true,
			requireLowercase: true,
			requireNumbers: true,
			requireSpecialChars: false, // Degens hate special chars
		},
		
		// Login security
		maxLoginAttempts: 5,
		lockoutDuration: 900000, // 15 min
		
		// Account security
		requireEmailVerification: false, // Start loose, tighten later
		require2FA: false,
		allow2FAMethods: ['totp', 'sms', 'email'] as const,
		
		// Session security
		sessionInactivityTimeout: 1800000, // 30 min
		maxConcurrentSessions: 5,
		
		// IP tracking
		trackIPs: true,
		maxIPsPerUser: 10,
		suspiciousIPThreshold: 5, // New IPs in 24h triggers alert
		
		// Anti-bot
		captchaEnabled: false, // Enable when bots arrive
		captchaProvider: 'recaptcha' as 'recaptcha' | 'hcaptcha' | 'turnstile',
		captchaThreshold: 0.5,
		captchaExemptRoles: ['vip', 'moderator', 'admin', 'owner'],
	},

	// Forum-specific auth rules
	forumAuth: {
		// Forums that require special authentication
		restrictedForums: {
			'whale-lounge': {
				minLevel: 50,
				minDGTBalance: 100000,
				requiresInvite: false,
			},
			'high-stakes': {
				minLevel: 20,
				minDGTBalance: 10000,
				requiresInvite: false,
			},
			'mod-lounge': {
				minLevel: 1,
				minDGTBalance: 0,
				requiresInvite: true,
				requiredRoles: ['moderator', 'admin', 'owner'],
			},
		},
		
		// XP requirements for actions
		xpRequirements: {
			createThread: 100,
			createPost: 10,
			uploadImage: 500,
			sendTip: 50,
			createRain: 1000,
		},
	},

	// OAuth providers (prepared for future)
	oauth: {
		enabled: false,
		providers: {
			discord: {
				enabled: false,
				scopes: ['identify', 'email'],
				linkOnly: true, // Don't allow login, only linking
			},
			twitter: {
				enabled: false,
				scopes: ['users.read', 'tweet.read'],
				linkOnly: false,
			},
			ethereum: {
				enabled: false,
				chainId: 1,
				linkOnly: false,
			},
		},
	},

	// Feature flags for gradual rollout
	features: {
		refreshTokens: true,
		apiKeys: false,
		webauthn: false,
		magicLinks: false,
		socialLogin: false,
		walletLogin: false, // Web3 wallet auth
		smsAuth: false,
		biometricAuth: false,
	},

	// Client-visible config
	client: {
		// What the frontend needs to know
		tokenExpiry: '15m',
		refreshEnabled: true,
		refreshBuffer: 60000, // Refresh 1 min before expiry
		rateLimitHeaders: true, // Show rate limit info in responses
		passwordStrength: true, // Show password strength meter
		availableAuthMethods: ['email', 'username'] as const,
		availableRoles: ['user', 'vip'] as const, // Roles users can see
	},
} as const;

// Type exports
export type AuthConfig = typeof authConfig;
export type UserRole = typeof authConfig.permissions.roleHierarchy[number];
export type AuthProvider = keyof typeof authConfig.oauth.providers;
export type AuthScope = 
	| typeof authConfig.apiKey.scopes.read[number]
	| typeof authConfig.apiKey.scopes.write[number]
	| typeof authConfig.apiKey.scopes.admin[number];

// Helper functions for client
export const getRateLimitForEndpoint = (endpoint: string) => {
	return authConfig.rateLimit.endpointOverrides[endpoint] || {
		maxRequests: authConfig.rateLimit.maxRequests,
		windowMs: authConfig.rateLimit.windowMs,
	};
};

export const getRateLimitForForum = (forumSlug: string) => {
	return authConfig.rateLimit.forumOverrides[forumSlug] || {
		maxRequests: authConfig.rateLimit.maxRequests,
		windowMs: authConfig.rateLimit.windowMs,
	};
};

export const canUserAccessForum = (
	userLevel: number,
	userDGTBalance: number,
	userRoles: UserRole[],
	forumSlug: string
): { allowed: boolean; reason?: string } => {
	const restrictions = authConfig.forumAuth.restrictedForums[forumSlug];
	if (!restrictions) return { allowed: true };

	if (userLevel < restrictions.minLevel) {
		return { allowed: false, reason: `Level ${restrictions.minLevel} required` };
	}

	if (userDGTBalance < restrictions.minDGTBalance) {
		return { allowed: false, reason: `${restrictions.minDGTBalance} DGT required` };
	}

	if (restrictions.requiredRoles && !restrictions.requiredRoles.some(role => userRoles.includes(role))) {
		return { allowed: false, reason: 'Insufficient permissions' };
	}

	if (restrictions.requiresInvite) {
		return { allowed: false, reason: 'Invite required' };
	}

	return { allowed: true };
};

export const getXPRequirement = (action: keyof typeof authConfig.forumAuth.xpRequirements): number => {
	return authConfig.forumAuth.xpRequirements[action] || 0;
};