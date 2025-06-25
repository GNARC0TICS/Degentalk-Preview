import '@testing-library/react';
import '@testing-library/jest-dom/vitest';

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
// @ts-ignore
window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;
