import type { 
	UserId, 
	ForumId, 
	GroupId, 
	AdminId,
	ModeratorId,
} from './ids.js';
import type { UserRole, AuthScope } from '../config/auth.config.js';

/**
 * Core authenticated user type
 * This is the single source of truth for user data across the platform
 */
export interface AuthenticatedUser {
	// Identity
	id: UserId;
	username: string;
	email: string;
	role: UserRole;

	// Gamification
	xp: number;
	level: number;
	clout: number;
	reputation: number;

	// Wallet
	dgtBalance: number;
	totalTipped: number;
	totalReceived: number;

	// Status
	emailVerified: boolean;
	phoneVerified: boolean;
	isActive: boolean;
	isBanned: boolean;
	isShadowBanned: boolean;
	isVerified: boolean; // Blue check equivalent

	// Metadata
	createdAt: Date;
	lastSeen: Date;
	lastActive: Date;
	joinedFrom: 'organic' | 'invite' | 'airdrop' | 'migration';

	// Groups & Badges
	groupId?: GroupId;
	badges: string[];
	titles: string[];
	activeTitle?: string;

	// Settings
	preferences: UserPreferences;
	
	// Computed permissions (cached)
	permissions?: UserPermissions;
	
	// Session info
	sessionId?: string;
	deviceId?: string;
	ipAddress?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
	// Privacy
	hideWalletBalance: boolean;
	hideOnlineStatus: boolean;
	hideFromLeaderboards: boolean;
	
	// Notifications
	emailNotifications: boolean;
	pushNotifications: boolean;
	tipNotifications: boolean;
	mentionNotifications: boolean;
	
	// Display
	theme: 'light' | 'dark' | 'degen';
	language: string;
	timezone: string;
	
	// Forum
	defaultForumView: 'latest' | 'trending' | 'following';
	collapsedCategories: string[];
	blockedUsers: UserId[];
}

/**
 * JWT Token payload
 */
export interface JWTPayload {
	// Standard JWT claims
	sub: UserId; // Subject (user ID)
	iat: number; // Issued at
	exp: number; // Expiration
	iss: string; // Issuer
	aud?: string; // Audience
	jti?: string; // JWT ID (for blacklisting)

	// Custom claims
	role: UserRole;
	sessionId: string;
	deviceId?: string;
	
	// Token metadata
	type: 'access' | 'refresh';
	version: number; // For token versioning/invalidation
	scope?: AuthScope[]; // For API tokens
}

/**
 * Refresh token data
 */
export interface RefreshToken {
	id: string;
	userId: UserId;
	token: string;
	deviceId?: string;
	deviceName?: string;
	
	// Security
	family: string; // Token family for rotation
	issuedAt: Date;
	expiresAt: Date;
	lastUsedAt?: Date;
	replacedBy?: string; // For token rotation tracking
	
	// Metadata
	ipAddress?: string;
	userAgent?: string;
}

/**
 * API Key for programmatic access
 */
export interface APIKey {
	id: string;
	userId: UserId;
	name: string;
	key: string; // Hashed
	prefix: string; // First 8 chars for identification
	
	// Permissions
	scopes: AuthScope[];
	
	// Restrictions
	allowedIPs?: string[];
	allowedOrigins?: string[];
	rateLimit?: number;
	
	// Metadata
	createdAt: Date;
	lastUsedAt?: Date;
	expiresAt?: Date;
	isActive: boolean;
}

/**
 * User permissions (computed and cached)
 */
export interface UserPermissions {
	// Forum-specific permissions
	forums: Record<ForumId, ForumPermission>;
	
	// Global permissions
	global: GlobalPermission[];
	
	// Computed permissions based on level/achievements
	computed: ComputedPermission[];
	
	// Feature access
	features: FeatureAccess;
	
	// Rate limit overrides
	rateLimits: RateLimitOverrides;
}

/**
 * Forum-specific permissions
 */
export interface ForumPermission {
	canRead: boolean;
	canPost: boolean;
	canCreateThread: boolean;
	canModerate: boolean;
	canPin: boolean;
	canLock: boolean;
	canDelete: boolean;
	
	// Special permissions
	canBypassCooldown: boolean;
	canBypassRateLimit: boolean;
	canUseSpecialTags: boolean;
	
	// Restrictions
	postCooldown?: number; // Seconds
	maxPostLength?: number;
	maxDailyPosts?: number;
}

/**
 * Global permissions (not forum-specific)
 */
export type GlobalPermission = 
	| 'admin.panel'
	| 'users.manage'
	| 'users.ban'
	| 'wallet.manage'
	| 'tips.unlimited'
	| 'rain.create'
	| 'shop.manage'
	| 'analytics.view'
	| 'system.config'
	| 'webhooks.manage';

/**
 * Computed permissions based on user state
 */
export interface ComputedPermission {
	permission: string;
	source: 'role' | 'level' | 'achievement' | 'manual';
	grantedAt: Date;
	expiresAt?: Date;
	metadata?: Record<string, any>;
}

/**
 * Feature access flags
 */
export interface FeatureAccess {
	// Core features
	canTip: boolean;
	canRain: boolean;
	canTrade: boolean;
	canWithdraw: boolean;
	
	// Social features
	canMessage: boolean;
	canVoiceChat: boolean;
	canStreamVideo: boolean;
	
	// Premium features
	canUseEmojis: boolean;
	canUseStickers: boolean;
	canUseGifs: boolean;
	canUploadImages: boolean;
	
	// Advanced features
	canCreatePolls: boolean;
	canCreateEvents: boolean;
	canCreateBounties: boolean;
}

/**
 * Rate limit overrides for special users
 */
export interface RateLimitOverrides {
	global?: number; // Requests per minute
	endpoints: Record<string, number>;
	forums: Record<ForumId, number>;
}

/**
 * Authentication context attached to requests
 */
export interface AuthContext {
	user: AuthenticatedUser;
	token?: JWTPayload;
	apiKey?: APIKey;
	
	// Auth method used
	method: 'jwt' | 'session' | 'apiKey' | 'webhook';
	
	// Request metadata
	sessionId: string;
	requestId: string;
	deviceId?: string;
	
	// Rate limit info
	rateLimit: RateLimitInfo;
	
	// Security flags
	isSecure: boolean;
	isSuspicious: boolean;
	requiresCaptcha: boolean;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
	limit: number;
	remaining: number;
	reset: Date;
	retryAfter?: number; // Seconds
}

/**
 * Login request
 */
export interface LoginRequest {
	// Credentials (one required)
	username?: string;
	email?: string;
	
	// Password
	password: string;
	
	// 2FA
	totpCode?: string;
	backupCode?: string;
	
	// Device info
	deviceId?: string;
	deviceName?: string;
	
	// Security
	captchaToken?: string;
	trustDevice?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
	user: AuthenticatedUser;
	tokens: {
		accessToken: string;
		refreshToken?: string;
		expiresIn: number;
	};
	
	// Additional info
	isNewDevice: boolean;
	requires2FA: boolean;
	requiresCaptcha: boolean;
}

/**
 * Registration request
 */
export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	
	// Optional
	referralCode?: string;
	inviteCode?: string;
	
	// Legal
	acceptedTerms: boolean;
	acceptedPrivacy: boolean;
	
	// Security
	captchaToken?: string;
}

/**
 * Session data
 */
export interface SessionData {
	id: string;
	userId: UserId;
	
	// Device info
	deviceId?: string;
	deviceName?: string;
	ipAddress: string;
	userAgent: string;
	
	// Timestamps
	createdAt: Date;
	lastActivityAt: Date;
	expiresAt: Date;
	
	// Security
	isActive: boolean;
	isTrusted: boolean;
}

/**
 * Auth event for logging/analytics
 */
export interface AuthEvent {
	id: string;
	userId?: UserId;
	type: AuthEventType;
	
	// Context
	method: AuthContext['method'];
	ipAddress: string;
	userAgent: string;
	deviceId?: string;
	
	// Result
	success: boolean;
	error?: string;
	
	// Metadata
	metadata?: Record<string, any>;
	timestamp: Date;
}

export type AuthEventType = 
	| 'login.attempt'
	| 'login.success'
	| 'login.failed'
	| 'logout'
	| 'register.attempt'
	| 'register.success'
	| 'register.failed'
	| 'token.refresh'
	| 'token.revoke'
	| 'password.reset'
	| 'password.change'
	| '2fa.enable'
	| '2fa.disable'
	| '2fa.verify'
	| 'session.create'
	| 'session.destroy'
	| 'permission.grant'
	| 'permission.revoke';

/**
 * Type guards
 */
export const isAuthenticatedUser = (user: any): user is AuthenticatedUser => {
	return user && typeof user.id === 'string' && typeof user.role === 'string';
};

export const isAdmin = (user: AuthenticatedUser): boolean => {
	return user.role === 'admin' || user.role === 'owner';
};

export const isModerator = (user: AuthenticatedUser): boolean => {
	return ['moderator', 'admin', 'owner'].includes(user.role);
};

export const isVIP = (user: AuthenticatedUser): boolean => {
	return ['vip', 'moderator', 'admin', 'owner'].includes(user.role);
};

/**
 * Express request extension
 */
declare global {
	namespace Express {
		interface Request {
			auth?: AuthContext;
		}
	}
}