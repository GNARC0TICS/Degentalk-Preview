import { useState, useEffect, useRef } from 'react';
import { getSiteStats, trackVisitor, simulateVisitorActivity, type SiteStats } from '@/lib/siteAnalytics';
import { trackEvent, trackAnalyticsInteraction, trackAnalyticsMilestone, trackSocialProofView } from '@/lib/analytics';

// Hook for real-time site analytics
export function useSiteAnalytics() {
  const [stats, setStats] = useState<SiteStats>(() => getSiteStats());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize analytics on first load
    const initialStats = trackVisitor();
    setStats(initialStats);
    setIsLoading(false);
    
    // Track analytics view
    trackEvent('analytics_view', {
      event_category: 'engagement',
      total_visitors: initialStats.totalVisitors,
      current_visitors: initialStats.currentVisitors
    });

    // Update stats every 30 seconds
    const interval = setInterval(() => {
      const updatedStats = simulateVisitorActivity();
      setStats(updatedStats);
    }, 30000);

    // Update stats when component becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedStats = simulateVisitorActivity();
        setStats(updatedStats);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    ...stats,
    isLoading
  };
}

// Hook for live visitor count with animated updates
export function useLiveVisitorCount() {
  const { totalVisitors, currentVisitors, isLoading } = useSiteAnalytics();
  const [displayCount, setDisplayCount] = useState(totalVisitors);
  const [isUpdating, setIsUpdating] = useState(false);
  const previousCountRef = useRef(totalVisitors);
  const milestoneTrackedRef = useRef(new Set<number>());

  useEffect(() => {
    if (totalVisitors !== displayCount && !isLoading) {
      setIsUpdating(true);
      
      // Track visitor count change
      if (previousCountRef.current !== totalVisitors) {
        trackAnalyticsInteraction('visitor_count_update', {
          totalVisitors,
          currentVisitors,
          isUpdating: true
        });
        
        // Check for milestones (every 100 visitors)
        const currentMilestone = Math.floor(totalVisitors / 100) * 100;
        const previousMilestone = Math.floor(previousCountRef.current / 100) * 100;
        
        if (currentMilestone > previousMilestone && !milestoneTrackedRef.current.has(currentMilestone)) {
          trackAnalyticsMilestone(currentMilestone, {
            totalVisitors,
            timeToReach: Date.now() - (localStorage.getItem('degentalk_start_time') ? parseInt(localStorage.getItem('degentalk_start_time')!) : Date.now())
          });
          milestoneTrackedRef.current.add(currentMilestone);
        }
        
        previousCountRef.current = totalVisitors;
      }
      
      // Animate to new count
      const startCount = displayCount;
      const difference = totalVisitors - startCount;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(startCount + (difference * easeProgress));
        
        setDisplayCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setIsUpdating(false);
        }
      };

      requestAnimationFrame(animateCount);
    }
  }, [totalVisitors, displayCount, isLoading, currentVisitors]);

  return {
    count: displayCount,
    currentVisitors,
    isUpdating,
    isLoading
  };
}