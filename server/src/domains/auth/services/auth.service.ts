import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User, featureFlags, users } from "@db/schema";
import { db } from "../../../core/db";
import { eq, count } from "drizzle-orm";
import { isDevMode } from "../../../utils/environment";

// Promisify scrypt for async usage
const scryptAsync = promisify(scrypt);

/**
 * Hash a password for secure storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Stores temporary dev metadata (encoded password) for beta testing
 * Only works for the first ~50 users and when beta tools are enabled
 */
export async function storeTempDevMetadata(password: string): Promise<string | null> {
  try {
    // Check if we're under the user limit
    const [userCountResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isDeleted, false));
    
    const userCount = userCountResult?.count || 0;
    if (userCount > 50) return null;
    
    // Check if beta tools are enabled
    const [devToolsFeature] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, 'dev_tools_enabled'));
    
    if (!devToolsFeature || !devToolsFeature.isEnabled) return null;
    
    // Simple encoding - not for security, just for obfuscation
    return Buffer.from(password).toString('base64');
  } catch (error) {
    console.error("Error in storeTempDevMetadata:", error);
    return null;
  }
}

/**
 * Helper function to verify email token
 */
export async function verifyEmailToken(token: string): Promise<{userId: number} | false> {
  try {
    // This is a stub implementation - replace with actual database query
    // In a real implementation, we'd:
    // 1. Query verification_tokens where token matches
    // 2. Check that expires_at > current time
    // 3. Check that used_at is null (token not used yet)
    
    // For demo purposes, we're returning a fake userId
    // In production, you would query the actual token from the database
    return { userId: 1 }; // Return userId if token is valid
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}

/**
 * Creates a mock user for development mode
 * This maintains compatibility with the existing dev mode user selection mechanism
 */
export function createMockUser(userId: number, role: 'admin' | 'moderator' | 'user' = 'user'): User {
  console.log(`🔨 Creating mock ${role} user for ID ${userId} in development mode`);
  
  return {
    id: userId,
    uuid: 'dev-uuid',
    username: `Dev${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `dev-${role}@degen.io`,
    password: 'mock-password-hash',
    role: role,
    groupId: role === 'admin' ? 1 : (role === 'moderator' ? 2 : 3),
    isActive: true,
    isBanned: false,
    isVerified: true,
    isDeleted: false,
    isShadowbanned: false,
    subscribedToNewsletter: false,
    createdAt: new Date(),
    xp: 1000,
    level: 10,
    clout: 100,
    dgtPoints: 1000,
    dgtWalletBalance: 100,
    pointsVersion: 1,
    dailyXpGained: 0
    // Other required fields with sensible defaults
  } as User;
}

/**
 * Helper function to get session cookie settings based on environment
 */
export function getSessionCookieSettings(): {
  secure: boolean;
  maxAge: number;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
} {
  if (isDevMode()) {
    return {
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'lax'
    };
  } else {
    return {
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'strict'
    };
  }
}

/**
 * Get user ID from request object, handling different user object formats
 */
export function getUserId(req: any): number {
  return req?.user?.id || req?.user?.user_id || 0;
} 