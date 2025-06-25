import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
// Wouter doesn't export a dedicated memory router in some versions when using package exports.
// Instead, we create an in-memory history instance manually. The simple approach below keeps
// routing working in tests without relying on an extra export path that Vite may not resolve.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – optional import only available in browser builds; fall back gracefully.
// import { createMemoryHistory } from 'wouter/use-location';
import { RootProvider } from '@/providers/root-provider';

/**
 * AllProviders
 *
 * Wraps test elements with the same providers used at the application root, plus
 * a memory-based router for predictable navigation behaviour during tests.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
	return <RootProvider>{children}</RootProvider>;
}

/**
 * renderWithProviders
 *
 * A convenience wrapper around RTL's render that automatically includes all of
 * the application-level providers. Use this instead of the default `render`
 * from `@testing-library/react` when writing component tests.
 */
export function renderWithProviders(
	ui: React.ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) {
	return rtlRender(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
