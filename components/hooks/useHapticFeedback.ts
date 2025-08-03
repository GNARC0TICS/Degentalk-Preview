import { useCallback } from 'react';

/**
 * Hook that provides haptic feedback on supported devices.
 * Uses the Vibration API for mobile devices.
 */
export function useHapticFeedback() {
  const isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (!isSupported) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail if vibration is not allowed
      console.debug('Haptic feedback not available:', error);
    }
  }, [isSupported]);

  // Predefined haptic patterns
  const haptics = {
    // Light tap - for button presses
    light: () => vibrate(5),
    
    // Medium tap - for toggle switches
    medium: () => vibrate(10),
    
    // Heavy tap - for important actions
    heavy: () => vibrate(15),
    
    // Success pattern - for completed actions
    success: () => vibrate([10, 50, 10]),
    
    // Warning pattern - for destructive actions
    warning: () => vibrate([20, 100, 20]),
    
    // Error pattern - for failures
    error: () => vibrate([50, 100, 50]),
    
    // Selection - for selecting items
    selection: () => vibrate(3),
  };

  return {
    isSupported,
    vibrate,
    ...haptics
  };
}

/**
 * Higher-order component that adds haptic feedback to click events
 */
export function withHaptic<T extends HTMLElement>(
  onClick?: (e: React.MouseEvent<T>) => void,
  hapticType: keyof ReturnType<typeof useHapticFeedback> = 'light'
) {
  const haptics = useHapticFeedback();
  
  return (e: React.MouseEvent<T>) => {
    // Only trigger haptics on touch devices
    if ('ontouchstart' in window) {
      const hapticFn = haptics[hapticType];
      if (typeof hapticFn === 'function') {
        hapticFn();
      }
    }
    
    // Call original onClick if provided
    onClick?.(e);
  };
}