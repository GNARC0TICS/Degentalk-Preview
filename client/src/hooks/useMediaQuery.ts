import { useState, useEffect } from 'react';

/**
 * Hook for responsive design that listens to media query changes
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);

		// Set initial value
		setMatches(media.matches);

		// Create event listener
		const listener = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		// Add listener
		if (media.addEventListener) {
			media.addEventListener('change', listener);
		} else {
			// Fallback for older browsers
			media.addListener(listener);
		}

		// Cleanup
		return () => {
			if (media.removeEventListener) {
				media.removeEventListener('change', listener);
			} else {
				// Fallback for older browsers
				media.removeListener(listener);
			}
		};
	}, [query]);

	return matches;
}

/**
 * Mobile detector alias for backward compatibility
 */
export const useMobileDetector = useMediaQuery;

/**
 * Predefined breakpoint hooks for common use cases
 */
export const useBreakpoint = () => {
	const isMobile = useMediaQuery('(max-width: 767px)');
	const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
	const isDesktop = useMediaQuery('(min-width: 1024px)');
	const isLarge = useMediaQuery('(min-width: 1280px)');
	const isXLarge = useMediaQuery('(min-width: 1536px)');

	const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
	const isTabletOrDesktop = useMediaQuery('(min-width: 768px)');

	return {
		isMobile,
		isTablet,
		isDesktop,
		isLarge,
		isXLarge,
		isMobileOrTablet,
		isTabletOrDesktop,
		// Convenience getter prioritising larger breakpoints first
		current: isXLarge
			? 'xlarge'
			: isLarge
				? 'large'
				: isDesktop
					? 'desktop'
					: isTablet
						? 'tablet'
						: 'mobile'
	};
};
