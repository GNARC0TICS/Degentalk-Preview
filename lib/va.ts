import { track } from '@vercel/analytics';
import { logger } from './logger';

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
      logger.error('Analytics', 'Analytics tracking error', error as Error);
    }
  }
}

// Re-export the track function for direct usage if needed
export { track };