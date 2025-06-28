import { useLocation } from 'wouter';
import { useMemo } from 'react';

/**
 * useSearchParams
 *
 * Safely returns a URLSearchParams instance representing the current
 * window.location.search string.
 *
 * • Guards against SSR by returning null when `window` is undefined.
 * • Re-computes whenever the wouter location changes to stay in sync.
 */
export default function useSearchParams(): URLSearchParams | null {
	const [location] = useLocation();

	// Memoise so referential identity only changes when the search string does
	return useMemo(() => {
		if (typeof window === 'undefined') return null;
		return new URLSearchParams(window.location.search);
	}, [location]);
}
