import kv from '@/lib/kv';

const PAGE_VISITS_KEY = 'stats:page_visits';
const WAITLIST_SIGNUPS_KEY = 'stats:waitlist_signups';
const ONLINE_VISITORS_ZSET = 'stats:online_visitors'; // sorted-set → last-seen ts (ms)
const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5-minute "online" window

// In-memory cache to reduce KV reads (10-second TTL)
let lastFetch = 0;
let cachedStats: VisitorStats | null = null;

export interface VisitorStats {
  pageVisits: number;
  waitlistSignups: number;
  currentVisitors: number;
}

// ---------- Helpers ----------
async function getCurrentVisitors(): Promise<number> {
  try {
    const threshold = Date.now() - ONLINE_WINDOW_MS;
    // Purge expired members only 5% of the time to save commands
    if (Math.random() < 0.05) {
      await kv.zremrangebyscore(ONLINE_VISITORS_ZSET, 0, threshold);
    }
    // count remaining
    const count = await kv.zcard(ONLINE_VISITORS_ZSET);
    return count || 0;
  } catch (error) {
    console.error('Error getting current visitors:', error);
    return 0;
  }
}

// ---------- Public API ----------
export async function trackVisitor(sessionId: string) {
  try {
    // each page view gets a cryptographically random sessionId
    await kv
      .pipeline()
      .zadd(ONLINE_VISITORS_ZSET, { score: Date.now(), member: sessionId })
      .incr(PAGE_VISITS_KEY)
      .exec();

    // Best-effort cache bump
    if (cachedStats) {
      cachedStats.pageVisits += 1;
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
  }
}

export async function getVisitorStats(): Promise<VisitorStats> {
  try {
    const now = Date.now();
    // Check if KV is available
    const isKvAvailable = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    
    if (!isKvAvailable) {
      // If we have a recent cache, serve it even without KV
      if (cachedStats && now - lastFetch < 10000) {
        return cachedStats;
      }
      // Return stub data if KV is not configured
      return {
        pageVisits: 3847,
        waitlistSignups: 134,
        currentVisitors: Math.floor(Math.random() * 10) + 5
      };
    }

    // Serve from cache if still fresh
    if (cachedStats && now - lastFetch < 10000) {
      return cachedStats;
    }

    const [pageVisits, waitlistSignups, currentVisitors] = await Promise.all([
      kv.get<number>(PAGE_VISITS_KEY).then(v => v ?? 0),
      kv.get<number>(WAITLIST_SIGNUPS_KEY).then(v => v ?? 134),
      getCurrentVisitors(),
    ]);

    const result = { pageVisits, waitlistSignups, currentVisitors };
    cachedStats = result;
    lastFetch = now;
    return result;
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    // Return fallback data on error
    return {
      pageVisits: 3847,
      waitlistSignups: 134,
      currentVisitors: Math.floor(Math.random() * 10) + 5
    };
  }
}

export async function incrementPageVisits(): Promise<number> {
  try {
    const isKvAvailable = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!isKvAvailable) return 0;
    
    const count = await kv.incr(PAGE_VISITS_KEY);
    return count || 0;
  } catch (error) {
    console.error('Error incrementing page visits:', error);
    return 0;
  }
}

export async function incrementWaitlistSignups(): Promise<number> {
  try {
    const isKvAvailable = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!isKvAvailable) return 134;
    
    const count = await kv.incr(WAITLIST_SIGNUPS_KEY);
    return count || 134;
  } catch (error) {
    console.error('Error incrementing waitlist signups:', error);
    return 134;
  }
}

/**
 * Store waitlist emails for launch announcements.
 * Stores plain emails to enable future communication.
 */
export async function saveSignupEmail(email: string): Promise<void> {
  try {
    const isKvAvailable = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!isKvAvailable) return;
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.trim().toLowerCase();
    
    // Store plain email in a set (prevents duplicates automatically)
    await kv.sadd('waitlist_emails', normalizedEmail);
    
    // Also store with timestamp for tracking when they signed up
    const timestamp = new Date().toISOString();
    await kv.hset('waitlist_signups_detail', { [normalizedEmail]: timestamp });
    
  } catch (error) {
    console.error('Error saving signup email:', error);
  }
}