import React from 'react';
import { ForumStructureProvider } from './ForumStructureContext';
import { ForumThemeProvider } from './ForumThemeProvider';
import { ForumOrderingProvider } from './ForumOrderingContext';

interface ForumProviderProps {
	children: React.ReactNode;
}

/**
 * Unified Forum Provider
 * 
 * Combines commonly used forum contexts into a single convenient wrapper.
 * Provides forum structure, theming, and ordering contexts.
 * 
 * Note: ThreadActionsProvider should be used at the component level where
 * you have access to a specific Thread object.
 */
export function ForumProvider({ children }: ForumProviderProps) {
	return (
		<ForumStructureProvider>
			<ForumThemeProvider>
				<ForumOrderingProvider>
					{children}
				</ForumOrderingProvider>
			</ForumThemeProvider>
		</ForumStructureProvider>
	);
}

/**
 * Lightweight Forum Provider (Structure + Theme only)
 * 
 * For pages that only need structure and theme, without ordering or actions.
 */
export function LightForumProvider({ children }: { children: React.ReactNode }) {
	return (
		<ForumStructureProvider>
			<ForumThemeProvider>
				{children}
			</ForumThemeProvider>
		</ForumStructureProvider>
	);
}