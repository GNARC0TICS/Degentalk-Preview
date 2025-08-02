// Stub rate limiter for edge functions
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  success?: boolean;
}

export async function checkRateLimit(_request?: Request, _key?: string): Promise<RateLimitResult> {
  // Simple stub: always allow
  return {
    allowed: true,
    remaining: 1000,
    resetTime: Date.now() + 60_000,
    success: true,
  };
}

export function createRateLimitHeaders(remaining = 1000, resetTime = Date.now() + 60_000) {
  return {
    'X-RateLimit-Limit': '1000',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
  } as Record<string, string>;
}