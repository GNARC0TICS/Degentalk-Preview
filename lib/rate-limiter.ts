// Stub rate limiter for edge functions
export async function checkRateLimit() {
  return { success: true };
}
export function createRateLimitHeaders() {
  return {} as Record<string, string>;
}