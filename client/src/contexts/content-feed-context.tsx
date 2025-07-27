import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ContentTab } from '@/hooks/use-content';

interface ContentFeedContextValue {
	activeTab: ContentTab;
	setActiveTab: (tab: ContentTab) => void;
	// Badge counts for sidebar navigation
	badges: {
		hotCount: number;
		newCount: number;
		followingActiveCount: number;
	};
	setBadges: (badges: Partial<ContentFeedContextValue['badges']>) => void;
	// Current feed metadata
	feedMeta: {
		totalItems: number;
		hasNewContent: boolean;
		lastRefresh: Date | null;
	};
	setFeedMeta: (meta: Partial<ContentFeedContextValue['feedMeta']>) => void;
}

const ContentFeedContext = createContext<ContentFeedContextValue | null>(null);

interface ContentFeedProviderProps {
	children: React.ReactNode;
	initialTab?: ContentTab;
}

export function ContentFeedProvider({
	children,
	initialTab = 'trending'
}: ContentFeedProviderProps) {
	const [activeTab, setActiveTabState] = useState<ContentTab>(initialTab);
	const [badges, setBadgesState] = useState({
		hotCount: 0,
		newCount: 0,
		followingActiveCount: 0
	});
	const [feedMeta, setFeedMetaState] = useState({
		totalItems: 0,
		hasNewContent: false,
		lastRefresh: null as Date | null
	});

	const setActiveTab = useCallback((tab: ContentTab) => {
		setActiveTabState(tab);
		// Reset new content indicator when tab changes
		setFeedMetaState((prev) => ({ ...prev, hasNewContent: false }));
	}, []);

	const setBadges = useCallback((newBadges: Partial<ContentFeedContextValue['badges']>) => {
		setBadgesState((prev) => ({ ...prev, ...newBadges }));
	}, []);

	const setFeedMeta = useCallback((newMeta: Partial<ContentFeedContextValue['feedMeta']>) => {
		setFeedMetaState((prev) => ({ ...prev, ...newMeta }));
	}, []);

	const value: ContentFeedContextValue = {
		activeTab,
		setActiveTab,
		badges,
		setBadges,
		feedMeta,
		setFeedMeta
	};

	return <ContentFeedContext.Provider value={value}>{children}</ContentFeedContext.Provider>;
}

export function useContentFeed() {
	const context = useContext(ContentFeedContext);
	if (!context) {
		throw new Error('useContentFeed must be used within a ContentFeedProvider');
	}
	return context;
}

// Hook for sidebar widgets to subscribe to feed state
export function useContentFeedState() {
	const context = useContext(ContentFeedContext);
	// Graceful fallback when used outside provider
	return (
		context || {
			activeTab: 'trending' as ContentTab,
			badges: { hotCount: 0, newCount: 0, followingActiveCount: 0 },
			feedMeta: { totalItems: 0, hasNewContent: false, lastRefresh: null }
		}
	);
}
