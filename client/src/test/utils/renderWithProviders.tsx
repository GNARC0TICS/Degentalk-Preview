import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
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
