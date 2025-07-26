import '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// JSDOM lacks matchMedia; provide a minimal stub so components using useMediaQuery don't crash
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})
});

// Stub ResizeObserver for components that rely on it (e.g., charts, grids)
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Ensure crypto.randomUUID is stubbed for the JSDOM test environment
if (typeof globalThis.crypto === 'undefined') {
	globalThis.crypto = {} as Crypto;
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
	globalThis.crypto.randomUUID = () => '00000000-0000-0000-0000-000000000000';
}

// Mock react-router-dom for tests
vi.mock('react-router-dom', async (importOriginal) => {
	const actual = await importOriginal() as any;
	return {
		...actual,
		BrowserRouter:
			actual.BrowserRouter ||
			(({ children }: { children: React.ReactNode }) =>
				React.createElement(React.Fragment, null, children)),
		useNavigate: vi.fn(() => vi.fn()),
		useParams: vi.fn(() => ({})),
		useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null }))
	};
});

// Ensure `useMobileDetector` export exists even when test files partially mock the module.
vi.mock('@/hooks/useMediaQuery', async (importOriginal) => {
	const actual = await importOriginal() as any;
	return {
		...actual,
		useMobileDetector:
			actual.useMobileDetector ||
			((query: string = '(max-width: 768px)') => (actual as any).useMediaQuery?.(query) ?? false),
		useBreakpoint: vi.fn(
			actual.useBreakpoint ??
				(() => ({
					isMobile: false,
					isTablet: false,
					isDesktop: true,
					isLarge: false,
					isXLarge: false,
					isMobileOrTablet: false,
					isTabletOrDesktop: true,
					current: 'desktop'
				}))
		)
	};
});

// Ensure useBreakpoint is spy-able even if tests override the module with plain function
(async () => {
	const mod: any = await import('@/hooks/useMediaQuery');
	if (typeof mod.useBreakpoint === 'function' && !(mod.useBreakpoint as any).mockReturnValue) {
		mod.useBreakpoint = vi.fn(mod.useBreakpoint);
	}
	if (!mod.useMobileDetector) {
		mod.useMobileDetector = (query: string = '(max-width: 768px)') =>
			mod.useMediaQuery?.(query) ?? false;
	}
})();
