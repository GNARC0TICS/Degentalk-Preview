/**
 * Authentication configuration shared between client and server
 * Sensitive values (secrets, keys) are loaded server-side only
 */
export declare const authConfig: {
    readonly jwt: {
        readonly enabled: true;
        readonly accessExpiry: "15m";
        readonly refreshExpiry: "7d";
        readonly issuer: "degentalk";
        readonly algorithm: "HS256";
        readonly tokenVersion: 1;
        readonly refreshRotation: true;
        readonly refreshReuseWindow: 2000;
    };
    readonly session: {
        readonly enabled: false;
        readonly name: "degen_sid";
        readonly expiry: 86400000;
        readonly store: "memory" | "redis" | "postgres";
        readonly storePrefix: "sess:";
        readonly cookie: {
            readonly secure: true;
            readonly httpOnly: true;
            readonly sameSite: "lax";
            readonly maxAge: 86400000;
        };
    };
    readonly apiKey: {
        readonly enabled: false;
        readonly headerName: "X-API-Key";
        readonly prefix: "dgt_";
        readonly scopes: {
            readonly read: readonly ["read:profile", "read:posts", "read:wallet"];
            readonly write: readonly ["write:posts", "write:tips", "write:profile"];
            readonly admin: readonly ["admin:users", "admin:forums", "admin:system"];
        };
    };
    readonly rateLimit: {
        readonly enabled: true;
        readonly provider: "memory" | "redis" | "dynamodb";
        readonly windowMs: 60000;
        readonly maxRequests: 100;
        readonly forumOverrides: {
            readonly 'high-stakes': {
                readonly maxRequests: 20;
                readonly windowMs: 60000;
                readonly message: "Slow down degen, high stakes requires patience";
            };
            readonly 'whale-lounge': {
                readonly maxRequests: 1000;
                readonly windowMs: 60000;
                readonly message: "Even whales have limits";
            };
            readonly 'dev-testing': {
                readonly maxRequests: 10000;
                readonly windowMs: 60000;
            };
        };
        readonly endpointOverrides: {
            readonly '/api/auth/login': {
                readonly maxRequests: 5;
                readonly windowMs: 900000;
                readonly message: "Too many login attempts";
            };
            readonly '/api/auth/register': {
                readonly maxRequests: 3;
                readonly windowMs: 3600000;
                readonly message: "Registration limit reached";
            };
            readonly '/api/tips/rain': {
                readonly maxRequests: 10;
                readonly windowMs: 3600000;
                readonly message: "Rain cooldown active";
            };
            readonly '/api/wallet/withdraw': {
                readonly maxRequests: 5;
                readonly windowMs: 86400000;
                readonly message: "Daily withdrawal limit reached";
            };
        };
    };
    readonly permissions: {
        readonly cacheEnabled: true;
        readonly cacheExpiry: 300000;
        readonly cacheProvider: "memory" | "redis";
        readonly checkForumAccess: true;
        readonly checkXPRequirements: true;
        readonly checkDGTBalance: false;
        readonly checkAchievements: true;
        readonly roleHierarchy: readonly ["user", "vip", "moderator", "admin", "owner"];
        readonly defaultPermissions: {
            readonly user: readonly ["read:public", "write:own_posts", "write:tips", "use:reactions"];
            readonly vip: readonly ["read:vip_forums", "write:longer_posts", "write:more_tips", "use:special_reactions", "skip:captcha"];
            readonly moderator: readonly ["read:all", "write:moderation", "delete:posts", "ban:temporary", "view:reports"];
            readonly admin: readonly ["read:all", "write:all", "delete:all", "ban:permanent", "manage:users", "manage:forums", "view:analytics"];
            readonly owner: readonly ["*"];
        };
    };
    readonly security: {
        readonly bcryptRounds: 12;
        readonly passwordMinLength: 8;
        readonly passwordRequirements: {
            readonly minLength: 8;
            readonly requireUppercase: true;
            readonly requireLowercase: true;
            readonly requireNumbers: true;
            readonly requireSpecialChars: false;
        };
        readonly maxLoginAttempts: 5;
        readonly lockoutDuration: 900000;
        readonly requireEmailVerification: false;
        readonly require2FA: false;
        readonly allow2FAMethods: readonly ["totp", "sms", "email"];
        readonly sessionInactivityTimeout: 1800000;
        readonly maxConcurrentSessions: 5;
        readonly trackIPs: true;
        readonly maxIPsPerUser: 10;
        readonly suspiciousIPThreshold: 5;
        readonly captchaEnabled: false;
        readonly captchaProvider: "recaptcha" | "hcaptcha" | "turnstile";
        readonly captchaThreshold: 0.5;
        readonly captchaExemptRoles: readonly ["vip", "moderator", "admin", "owner"];
    };
    readonly forumAuth: {
        readonly restrictedForums: {
            readonly 'whale-lounge': {
                readonly minLevel: 50;
                readonly minDGTBalance: 100000;
                readonly requiresInvite: false;
            };
            readonly 'high-stakes': {
                readonly minLevel: 20;
                readonly minDGTBalance: 10000;
                readonly requiresInvite: false;
            };
            readonly 'mod-lounge': {
                readonly minLevel: 1;
                readonly minDGTBalance: 0;
                readonly requiresInvite: true;
                readonly requiredRoles: readonly ["moderator", "admin", "owner"];
            };
        };
        readonly xpRequirements: {
            readonly createThread: 100;
            readonly createPost: 10;
            readonly uploadImage: 500;
            readonly sendTip: 50;
            readonly createRain: 1000;
        };
    };
    readonly oauth: {
        readonly enabled: false;
        readonly providers: {
            readonly discord: {
                readonly enabled: false;
                readonly scopes: readonly ["identify", "email"];
                readonly linkOnly: true;
            };
            readonly twitter: {
                readonly enabled: false;
                readonly scopes: readonly ["users.read", "tweet.read"];
                readonly linkOnly: false;
            };
            readonly ethereum: {
                readonly enabled: false;
                readonly chainId: 1;
                readonly linkOnly: false;
            };
        };
    };
    readonly features: {
        readonly refreshTokens: true;
        readonly apiKeys: false;
        readonly webauthn: false;
        readonly magicLinks: false;
        readonly socialLogin: false;
        readonly walletLogin: false;
        readonly smsAuth: false;
        readonly biometricAuth: false;
    };
    readonly client: {
        readonly tokenExpiry: "15m";
        readonly refreshEnabled: true;
        readonly refreshBuffer: 60000;
        readonly rateLimitHeaders: true;
        readonly passwordStrength: true;
        readonly availableAuthMethods: readonly ["email", "username"];
        readonly availableRoles: readonly ["user", "vip"];
    };
};
export type AuthConfig = typeof authConfig;
export type UserRole = typeof authConfig.permissions.roleHierarchy[number];
export type AuthProvider = keyof typeof authConfig.oauth.providers;
export type AuthScope = typeof authConfig.apiKey.scopes.read[number] | typeof authConfig.apiKey.scopes.write[number] | typeof authConfig.apiKey.scopes.admin[number];
export declare const getRateLimitForEndpoint: (endpoint: string) => any;
export declare const getRateLimitForForum: (forumSlug: string) => any;
export declare const canUserAccessForum: (userLevel: number, userDGTBalance: number, userRoles: UserRole[], forumSlug: string) => {
    allowed: boolean;
    reason?: string;
};
export declare const getXPRequirement: (action: keyof typeof authConfig.forumAuth.xpRequirements) => number;
//# sourceMappingURL=auth.config.d.ts.map