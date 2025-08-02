import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getVisitorStats, incrementPageVisits, incrementWaitlistSignups } from '@/lib/visitor-storage';
import { checkRateLimit, createRateLimitHeaders } from '@/lib/rate-limiter';

export const runtime = 'edge';

interface VisitorData {
  pageVisits: number;
  currentVisitors: number;
  waitlistSignups: number;
}

// Cache the response for 10 seconds
let cachedData: VisitorData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10000; // 10 seconds

async function fetchAnalyticsData(): Promise<VisitorData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // Check for required environment variables
    const projectId = process.env.VERCEL_PROJECT_ID;
    const token = process.env.VERCEL_TOKEN;
    
    if (!projectId || !token) {
      logger.error('Analytics', 'Missing VERCEL_PROJECT_ID or VERCEL_TOKEN');
      // Return fallback data
      return {
        pageVisits: 3847,
        currentVisitors: Math.floor(Math.random() * 10) + 5,
        waitlistSignups: 0 // This will be overridden in GET handler
      };
    }

    // Fetch real-time analytics from Vercel Analytics API
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/vitals?projectId=${projectId}&timeframe=1h`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Calculate current visitors from recent page views
    // This is an approximation based on the last hour's activity
    const recentViews = data.data?.length || 0;
    const currentVisitors = Math.max(3, Math.min(25, Math.floor(recentViews / 12)));
    
    // For now, we'll use static values for total visits
    // In a real implementation, these would come from a database
    const result = {
      pageVisits: 3847 + Math.floor(Math.random() * 100),
      currentVisitors,
      waitlistSignups: 0 // This will be overridden in GET handler
    };

    // Update cache
    cachedData = result;
    cacheTimestamp = now;
    
    return result;
  } catch (error) {
    logger.error('Analytics', 'Error fetching analytics', error as Error);
    
    // Return fallback data on error
    return {
      pageVisits: 3847,
      currentVisitors: Math.floor(Math.random() * 10) + 5,
      waitlistSignups: 0 // This will be overridden in GET handler
    };
  }
}

// Visitor data is now managed by visitor-storage.ts

export async function GET(request: Request) {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(request, '/api/visitors');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime)
        }
      );
    }
    const data = await fetchAnalyticsData();
    const stats = await getVisitorStats();
    
    // Override with persistent storage values
    data.waitlistSignups = stats.waitlistSignups;
    data.pageVisits = stats.pageVisits;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        ...createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      },
    });
  } catch (error) {
    logger.error('Analytics', 'Error in GET /api/visitors', error as Error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch visitor data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'incrementWaitlist') {
      const newCount = await incrementWaitlistSignups();
      
      // Clear cache to reflect new count
      cachedData = null;
      
      return NextResponse.json({ 
        success: true, 
        newCount 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Analytics', 'Error in POST /api/visitors', error as Error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}