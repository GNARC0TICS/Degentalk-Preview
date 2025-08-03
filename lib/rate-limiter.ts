import kv from '@/lib/kv';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  success?: boolean;
}

const RATE_LIMIT_WINDOW = 60_000; // 1 minute window
const RATE_LIMIT_MAX = 60; // 60 requests per minute

export async function checkRateLimit(request: Request, key: string): Promise<RateLimitResult> {
  try {
    // Check if KV is available
    const isKvAvailable = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    
    if (!isKvAvailable) {
      // Fallback to always allow if KV is not configured
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX,
        resetTime: Date.now() + RATE_LIMIT_WINDOW,
        success: true,
      };
    }

    // Get client IP from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    
    // Create rate limit key
    const rateLimitKey = `rate_limit:${key}:${ip}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Remove old entries
    await kv.zremrangebyscore(rateLimitKey, 0, windowStart);
    
    // Count requests in current window
    const count = await kv.zcard(rateLimitKey) || 0;
    
    if (count >= RATE_LIMIT_MAX) {
      // Get oldest entry to determine reset time
      const oldestEntries = await kv.zrange(rateLimitKey, 0, 0, { withScores: true });
      const resetTime = oldestEntries && oldestEntries.length >= 2 
        ? (oldestEntries[1] as number) + RATE_LIMIT_WINDOW 
        : now + RATE_LIMIT_WINDOW;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        success: true,
      };
    }
    
    // Add current request
    await kv.zadd(rateLimitKey, { score: now, member: `${now}-${Math.random()}` });
    
    // Set expiry on the key
    await kv.expire(rateLimitKey, Math.ceil(RATE_LIMIT_WINDOW / 1000));
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - count - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      success: true,
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
      success: false,
    };
  }
}

export function createRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
  } as Record<string, string>;
}