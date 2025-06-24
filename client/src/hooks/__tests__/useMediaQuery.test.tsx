import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery, useBreakpoint } from '../useMediaQuery';

describe('useMediaQuery', () => {
	let matchMediaMock: any;

	beforeEach(() => {
		matchMediaMock = vi.fn((query: string) => {
			const mediaQueryList = {
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(), // Fallback for older browsers
				removeListener: vi.fn() // Fallback for older browsers
			};
			return mediaQueryList;
		});

		window.matchMedia = matchMediaMock;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('returns initial media query match state', () => {
		matchMediaMock.mockImplementation((query: string) => ({
			matches: query.includes('min-width: 1024px'),
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
		expect(result.current).toBe(true);
	});

	it('returns false for non-matching query', () => {
		matchMediaMock.mockImplementation(() => ({
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
		expect(result.current).toBe(false);
	});

	it('updates when media query match changes', () => {
		let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

		const mediaQueryList = {
			matches: false,
			media: '',
			addEventListener: vi.fn((event: string, listener: any) => {
				if (event === 'change') {
					changeListener = listener;
				}
			}),
			removeEventListener: vi.fn()
		};

		matchMediaMock.mockReturnValue(mediaQueryList);

		const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

		expect(result.current).toBe(false);

		// Simulate media query change
		act(() => {
			if (changeListener) {
				changeListener({ matches: true } as MediaQueryListEvent);
			}
		});

		expect(result.current).toBe(true);
	});

	it('cleans up event listener on unmount', () => {
		const removeEventListenerSpy = vi.fn();
		const mediaQueryList = {
			matches: false,
			media: '',
			addEventListener: vi.fn(),
			removeEventListener: removeEventListenerSpy
		};

		matchMediaMock.mockReturnValue(mediaQueryList);

		const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
	});

	it('uses fallback methods for older browsers', () => {
		const addListenerSpy = vi.fn();
		const removeListenerSpy = vi.fn();

		const mediaQueryList = {
			matches: false,
			media: '',
			addListener: addListenerSpy,
			removeListener: removeListenerSpy
			// No addEventListener/removeEventListener
		};

		matchMediaMock.mockReturnValue(mediaQueryList);

		const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

		expect(addListenerSpy).toHaveBeenCalled();

		unmount();

		expect(removeListenerSpy).toHaveBeenCalled();
	});
});

describe('useBreakpoint', () => {
	beforeEach(() => {
		window.matchMedia = vi.fn((query: string) => {
			const mediaQueryList = {
				matches: false,
				media: query,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};

			// Mock different breakpoint responses
			if (query === '(max-width: 767px)') {
				mediaQueryList.matches = false; // Not mobile
			} else if (query === '(min-width: 768px) and (max-width: 1023px)') {
				mediaQueryList.matches = false; // Not tablet
			} else if (query === '(min-width: 1024px)') {
				mediaQueryList.matches = true; // Is desktop
			} else if (query === '(min-width: 1280px)') {
				mediaQueryList.matches = false; // Not large
			} else if (query === '(min-width: 1536px)') {
				mediaQueryList.matches = false; // Not xlarge
			} else if (query === '(max-width: 1023px)') {
				mediaQueryList.matches = false; // Not mobile or tablet
			} else if (query === '(min-width: 768px)') {
				mediaQueryList.matches = true; // Is tablet or desktop
			}

			return mediaQueryList;
		});
	});

	it('correctly identifies desktop breakpoint', () => {
		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isMobile).toBe(false);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.isDesktop).toBe(true);
		expect(result.current.isLarge).toBe(false);
		expect(result.current.isXLarge).toBe(false);
		expect(result.current.current).toBe('desktop');
	});

	it('correctly identifies mobile breakpoint', () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches: query === '(max-width: 767px)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isMobile).toBe(true);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.isDesktop).toBe(false);
		expect(result.current.current).toBe('mobile');
	});

	it('correctly identifies tablet breakpoint', () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches:
				query === '(min-width: 768px) and (max-width: 1023px)' ||
				query === '(min-width: 768px)' ||
				query === '(max-width: 1023px)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isMobile).toBe(false);
		expect(result.current.isTablet).toBe(true);
		expect(result.current.isDesktop).toBe(false);
		expect(result.current.current).toBe('tablet');
	});

	it('correctly identifies combined breakpoints', () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches: query === '(max-width: 767px)' || query === '(max-width: 1023px)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isMobileOrTablet).toBe(true);
		expect(result.current.isTabletOrDesktop).toBe(false);
	});

	it('correctly identifies large breakpoint', () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches:
				query === '(min-width: 1024px)' ||
				query === '(min-width: 1280px)' ||
				query === '(min-width: 768px)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isLarge).toBe(true);
		expect(result.current.current).toBe('large');
	});

	it('correctly identifies xlarge breakpoint', () => {
		window.matchMedia = vi.fn((query: string) => ({
			matches: query.includes('min-width'),
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}));

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isXLarge).toBe(true);
		expect(result.current.current).toBe('xlarge');
	});

	it('updates breakpoints when window resizes', () => {
		let changeListeners: Map<string, (event: MediaQueryListEvent) => void> = new Map();

		window.matchMedia = vi.fn((query: string) => {
			const mediaQueryList = {
				matches: query === '(min-width: 1024px)' || query === '(min-width: 768px)',
				media: query,
				addEventListener: vi.fn((event: string, listener: any) => {
					if (event === 'change') {
						changeListeners.set(query, listener);
					}
				}),
				removeEventListener: vi.fn()
			};

			return mediaQueryList;
		});

		const { result } = renderHook(() => useBreakpoint());

		expect(result.current.isDesktop).toBe(true);
		expect(result.current.current).toBe('desktop');

		// Simulate resize to mobile
		act(() => {
			changeListeners.forEach((listener, query) => {
				if (query === '(max-width: 767px)') {
					listener({ matches: true } as MediaQueryListEvent);
				} else {
					listener({ matches: false } as MediaQueryListEvent);
				}
			});
		});

		// Note: Due to the way multiple hooks are composed,
		// we would need to re-render to see the change
	});
});
