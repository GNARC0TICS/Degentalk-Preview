/**
 * Analytics tracking using Vercel Analytics
 * Replace Google Analytics with Vercel's built-in analytics
 */

import { track } from '@vercel/analytics';
import { logger } from './logger';

/**
 * Track custom events using Vercel Analytics
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  try {
    // Vercel Analytics track function
    track(eventName, parameters);
    
    // Also log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Analytics', 'Event tracked', { eventName, parameters });
    }
  } catch (error) {
    logger.error('Analytics', 'Failed to track event', { eventName, error });
  }
};

// Track newsletter signup
export const trackNewsletterSignup = (email: string, source: string = 'landing_page') => {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
    event_label: source,
    user_email_domain: email.split('@')[1] || 'unknown',
    conversion: true
  });
};

// Track section views
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', {
    event_category: 'navigation',
    event_label: sectionName,
    page_title: 'Degentalk Landing Page'
  });
};

// Track CTA clicks
export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaName,
    cta_location: location
  });
};

// Track FAQ interactions
export const trackFAQInteraction = (question: string, action: 'open' | 'close') => {
  trackEvent('faq_interaction', {
    event_category: 'content',
    event_label: question,
    action: action
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll_depth', {
    event_category: 'engagement',
    event_label: `${percentage}%`,
    value: percentage
  });
};

// Enhanced ecommerce tracking for waitlist conversion
export const trackWaitlistConversion = (position?: number) => {
  trackEvent('waitlist_conversion', {
    event_category: 'conversion',
    event_label: 'waitlist_signup',
    waitlist_position: position || 'unknown',
    conversion_value: 1
  });
};

// Track live analytics interactions
export const trackAnalyticsInteraction = (action: string, visitorData: {
  totalVisitors: number;
  currentVisitors: number;
  isUpdating?: boolean;
}) => {
  trackEvent('live_analytics_interaction', {
    event_category: 'engagement',
    event_label: action,
    total_visitors: visitorData.totalVisitors,
    current_visitors: visitorData.currentVisitors,
    is_updating: visitorData.isUpdating || false,
    analytics_feature: 'live_visitor_counter'
  });
};

// Track analytics milestone events
export const trackAnalyticsMilestone = (milestone: number, visitorData: {
  totalVisitors: number;
  timeToReach?: number;
}) => {
  trackEvent('analytics_milestone', {
    event_category: 'milestone',
    event_label: `${milestone}_visitors`,
    milestone_value: milestone,
    current_total: visitorData.totalVisitors,
    time_to_reach: visitorData.timeToReach || null,
    milestone_type: 'visitor_count'
  });
};

// Track social proof effectiveness
export const trackSocialProofView = (section: string, visitorCount: number) => {
  trackEvent('social_proof_view', {
    event_category: 'engagement',
    event_label: section,
    visitor_count_shown: visitorCount,
    social_proof_type: 'live_counter',
    credibility_factor: visitorCount > 1000 ? 'high' : visitorCount > 100 ? 'medium' : 'low'
  });
};

// No need for initGA - Vercel Analytics initializes automatically via the Analytics component