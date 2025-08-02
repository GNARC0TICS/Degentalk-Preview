import { track } from '@vercel/analytics';

/**
 * Thin wrapper around Vercel Analytics track function
 * Provides type safety and consistent error handling
 */
export function vaTrack(eventName: string, properties?: Record<string, any>) {
  try {
    track(eventName, properties);
  } catch (error) {
    // Fail silently in production to avoid breaking user experience
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics tracking error:', error);
    }
  }
}

// Re-export the track function for direct usage if needed
export { track };