import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface EngagementEvent {
	type: 'view' | 'tab_switch' | 'action' | 'scroll' | 'time_spent';
	target: string;
	metadata?: Record<string, any>;
	timestamp: number;
}

interface EngagementMetrics {
	timeSpent: number;
	tabSwitches: number;
	actionsPerformed: number;
	scrollDepth: number;
	engagementScore: number;
	lastActiveTime: number;
}

interface ProfileEngagementData {
	metrics: EngagementMetrics;
	events: EngagementEvent[];
	trackEvent: (event: Omit<EngagementEvent, 'timestamp'>) => void;
	trackTabSwitch: (fromTab: string, toTab: string) => void;
	trackAction: (action: string, target: string, metadata?: Record<string, any>) => void;
	trackScrollDepth: (depth: number) => void;
	getEngagementInsights: () => EngagementInsight[];
}

interface EngagementInsight {
	type: 'positive' | 'neutral' | 'opportunity';
	title: string;
	description: string;
	score: number;
}

export function useProfileEngagement(profileUsername: string): ProfileEngagementData {
	const { user } = useAuth();
	const [metrics, setMetrics] = useState<EngagementMetrics>({
		timeSpent: 0,
		tabSwitches: 0,
		actionsPerformed: 0,
		scrollDepth: 0,
		engagementScore: 0,
		lastActiveTime: Date.now()
	});
	const [events, setEvents] = useState<EngagementEvent[]>([]);
	const [startTime] = useState(Date.now());

	// Track time spent on profile
	useEffect(() => {
		const interval = setInterval(() => {
			setMetrics((prev) => ({
				...prev,
				timeSpent: Date.now() - startTime,
				lastActiveTime: Date.now()
			}));
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	// Calculate engagement score
	useEffect(() => {
		const score = calculateEngagementScore(metrics, events);
		setMetrics((prev) => ({ ...prev, engagementScore: score }));
	}, [metrics.timeSpent, metrics.tabSwitches, metrics.actionsPerformed, events.length]);

	// Send analytics on unmount (simplified - in real app would use proper analytics)
	useEffect(() => {
		return () => {
			if (metrics.timeSpent > 5000) {
				// Only track if spent more than 5 seconds
				sendEngagementAnalytics(profileUsername, metrics, events);
			}
		};
	}, [profileUsername, metrics, events]);

	const trackEvent = useCallback((event: Omit<EngagementEvent, 'timestamp'>) => {
		const fullEvent: EngagementEvent = {
			...event,
			timestamp: Date.now()
		};

		setEvents((prev) => [...prev, fullEvent]);

		// Update metrics based on event type
		if (event.type === 'action') {
			setMetrics((prev) => ({
				...prev,
				actionsPerformed: prev.actionsPerformed + 1,
				lastActiveTime: Date.now()
			}));
		}
	}, []);

	const trackTabSwitch = useCallback(
		(fromTab: string, toTab: string) => {
			trackEvent({
				type: 'tab_switch',
				target: toTab,
				metadata: { fromTab, toTab }
			});

			setMetrics((prev) => ({
				...prev,
				tabSwitches: prev.tabSwitches + 1,
				lastActiveTime: Date.now()
			}));
		},
		[trackEvent]
	);

	const trackAction = useCallback(
		(action: string, target: string, metadata?: Record<string, any>) => {
			trackEvent({
				type: 'action',
				target: `${action}:${target}`,
				metadata: { action, target, ...metadata }
			});
		},
		[trackEvent]
	);

	const trackScrollDepth = useCallback(
		(depth: number) => {
			if (depth > metrics.scrollDepth) {
				setMetrics((prev) => ({
					...prev,
					scrollDepth: depth,
					lastActiveTime: Date.now()
				}));

				// Track significant scroll milestones
				if (depth >= 0.5 && metrics.scrollDepth < 0.5) {
					trackEvent({
						type: 'scroll',
						target: 'midpoint',
						metadata: { depth }
					});
				}

				if (depth >= 0.8 && metrics.scrollDepth < 0.8) {
					trackEvent({
						type: 'scroll',
						target: 'deep_scroll',
						metadata: { depth }
					});
				}
			}
		},
		[metrics.scrollDepth, trackEvent]
	);

	const getEngagementInsights = useCallback((): EngagementInsight[] => {
		const insights: EngagementInsight[] = [];
		const timeMinutes = metrics.timeSpent / 60000;

		// Time spent insights
		if (timeMinutes > 5) {
			insights.push({
				type: 'positive',
				title: 'Deep Engagement',
				description: `Spent ${Math.round(timeMinutes)} minutes exploring this profile`,
				score: Math.min(100, timeMinutes * 10)
			});
		} else if (timeMinutes < 1) {
			insights.push({
				type: 'opportunity',
				title: 'Quick Visit',
				description: 'Consider exploring more tabs to discover user details',
				score: Math.max(0, timeMinutes * 20)
			});
		}

		// Tab switching insights
		if (metrics.tabSwitches > 3) {
			insights.push({
				type: 'positive',
				title: 'Thorough Exploration',
				description: `Explored ${metrics.tabSwitches} different sections`,
				score: Math.min(100, metrics.tabSwitches * 15)
			});
		}

		// Action insights
		if (metrics.actionsPerformed > 0) {
			insights.push({
				type: 'positive',
				title: 'Active Engagement',
				description: `Performed ${metrics.actionsPerformed} actions on this profile`,
				score: Math.min(100, metrics.actionsPerformed * 25)
			});
		} else if (timeMinutes > 2) {
			insights.push({
				type: 'opportunity',
				title: 'Engagement Opportunity',
				description: 'Consider following, messaging, or tipping this user',
				score: 30
			});
		}

		// Overall engagement score insight
		if (metrics.engagementScore > 70) {
			insights.push({
				type: 'positive',
				title: 'High Engagement',
				description: `Engagement score: ${Math.round(metrics.engagementScore)}%`,
				score: metrics.engagementScore
			});
		}

		return insights.sort((a, b) => b.score - a.score);
	}, [metrics]);

	return {
		metrics,
		events,
		trackEvent,
		trackTabSwitch,
		trackAction,
		trackScrollDepth,
		getEngagementInsights
	};
}

function calculateEngagementScore(metrics: EngagementMetrics, events: EngagementEvent[]): number {
	const timeMinutes = metrics.timeSpent / 60000;
	const timeScore = Math.min(30, timeMinutes * 6); // Max 30 points for 5+ minutes

	const tabScore = Math.min(20, metrics.tabSwitches * 5); // Max 20 points for 4+ tab switches

	const actionScore = Math.min(30, metrics.actionsPerformed * 10); // Max 30 points for 3+ actions

	const scrollScore = Math.min(10, metrics.scrollDepth * 10); // Max 10 points for full scroll

	const varietyScore = Math.min(10, new Set(events.map((e) => e.type)).size * 2); // Max 10 points for event variety

	return Math.round(timeScore + tabScore + actionScore + scrollScore + varietyScore);
}

async function sendEngagementAnalytics(
	profileUsername: string,
	metrics: EngagementMetrics,
	events: EngagementEvent[]
) {
	try {
		// In a real app, this would send to your analytics service
		const analyticsData = {
			profileUsername,
			metrics,
			eventCount: events.length,
			sessionDuration: metrics.timeSpent,
			engagementScore: metrics.engagementScore,
			timestamp: Date.now()
		};

		console.log('Profile Engagement Analytics:', analyticsData);

		// Example: Send to your backend
		// await fetch('/api/analytics/profile-engagement', {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json' },
		//   body: JSON.stringify(analyticsData)
		// });
	} catch (error) {
		console.error('Failed to send engagement analytics:', error);
	}
}
