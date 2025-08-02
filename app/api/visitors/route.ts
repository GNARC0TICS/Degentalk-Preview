import { NextResponse } from 'next/server';

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
      console.error('Missing VERCEL_PROJECT_ID or VERCEL_TOKEN');
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
    console.error('Error fetching analytics:', error);
    
    // Return fallback data on error
    return {
      pageVisits: 3847,
      currentVisitors: Math.floor(Math.random() * 10) + 5,
      waitlistSignups: 0 // This will be overridden in GET handler
    };
  }
}

// In-memory counter for waitlist signups (replace with database in production)
let waitlistCounter = 742;

export async function GET() {
  try {
    const data = await fetchAnalyticsData();
    
    // Override waitlist count with our counter
    data.waitlistSignups = waitlistCounter;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error in /api/visitors:', error);
    
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
      waitlistCounter++;
      
      // Clear cache to reflect new count
      cachedData = null;
      
      return NextResponse.json({ 
        success: true, 
        newCount: waitlistCounter 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/visitors:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}