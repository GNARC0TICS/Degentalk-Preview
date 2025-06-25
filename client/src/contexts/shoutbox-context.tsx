import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useMobileDetector } from '@/hooks/use-media-query';

// Define ShoutboxPosition type here to avoid import issues
export type ShoutboxPosition =
	| 'sidebar-top'
	| 'sidebar-bottom'
	| 'main-top'
	| 'main-bottom'
	| 'floating'
	| 'sticky';
export type ShoutboxEffectivePosition = ShoutboxPosition | 'mobile-top' | 'mobile-bottom';
export type ShoutboxExpansionLevel = 'collapsed' | 'preview' | 'expanded';

// Define the Shoutbox context interface
interface ShoutboxContextType {
	position: ShoutboxPosition;
	effectivePosition: ShoutboxEffectivePosition;
	expansionLevel: ShoutboxExpansionLevel;
	isLoading: boolean;
	isMobile: boolean;
	updatePosition: (newPosition: ShoutboxPosition) => Promise<void>;
	updateExpansionLevel: (newLevel: ShoutboxExpansionLevel) => void;
	cycleExpansionLevel: () => void;
	// Debug helpers
	lastPositionChangeTime?: Date;
	positionChangeCount: number;
}

// Create the context with default values to avoid undefined checks
const ShoutboxContext = createContext<ShoutboxContextType>({
	position: 'sidebar-top',
	effectivePosition: 'sidebar-top',
	expansionLevel: 'expanded',
	isLoading: false,
	isMobile: false,
	updatePosition: async () => {},
	updateExpansionLevel: () => {},
	cycleExpansionLevel: () => {},
	lastPositionChangeTime: undefined,
	positionChangeCount: 0
});

interface ShoutboxProviderProps {
	children: ReactNode;
}

export function ShoutboxProvider({ children }: ShoutboxProviderProps) {
	// Default position until we load from API
	const [position, setPosition] = useState<ShoutboxPosition>('sidebar-top');
	const [expansionLevel, setExpansionLevel] = useState<ShoutboxExpansionLevel>('expanded');
	const [lastPositionChangeTime, setLastPositionChangeTime] = useState<Date | undefined>(undefined);
	const [positionChangeCount, setPositionChangeCount] = useState(0);

	// Check if we're on mobile
	const isMobile = useMobileDetector('(max-width: 768px)');

	// Cache key for the settings
	const SETTINGS_QUERY_KEY = '/api/preferences';
	const queryClient = useQueryClient();

	// Get user settings from API
	const { data, isLoading } = useQuery({
		queryKey: [SETTINGS_QUERY_KEY],
		queryFn: async () => {
			console.log('ShoutboxContext: Attempting to fetch settings from /api/preferences');
			try {
				const response = await fetch('/api/preferences', {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				console.log(`ShoutboxContext: Received response status: ${response.status}`);

				// If we get a 401, just use local storage + default
				if (response.status === 401) {
					console.warn(
						'ShoutboxContext: Authentication required (401), falling back to local storage.'
					);
					const savedPosition = localStorage.getItem('shoutboxPosition');
					return {
						shoutboxPosition:
							savedPosition && isValidPosition(savedPosition) ? savedPosition : 'sidebar-top',
						isAuthenticated: false
					};
				}

				if (!response.ok) {
					const errorText = await response.text();
					console.error(
						'ShoutboxContext: Response not OK. Status:',
						response.status,
						'Body:',
						errorText
					);
					throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
				}

				const responseData = await response.json();
				console.log('ShoutboxContext: Successfully fetched settings:', responseData);
				return { ...responseData, isAuthenticated: true };
			} catch (error) {
				console.error('ShoutboxContext: Error during settings fetch:', error);
				// Fall back to default position if fetch fails
				const savedPosition = localStorage.getItem('shoutboxPosition');
				return {
					shoutboxPosition:
						savedPosition && isValidPosition(savedPosition) ? savedPosition : 'sidebar-top',
					isAuthenticated: false
				};
			}
		},
		enabled: true, // Enable query by default
		retry: 1
	});

	// Set position when data is loaded
	useEffect(() => {
		if (data && data.shoutboxPosition) {
			setPosition(data.shoutboxPosition as ShoutboxPosition);
		}
	}, [data]);

	// Helper function to get readable position name
	const getPositionLabel = (pos: ShoutboxPosition): string => {
		const labels = {
			'sidebar-top': 'Sidebar Top',
			'sidebar-bottom': 'Sidebar Bottom',
			'main-top': 'Main Top',
			'main-bottom': 'Main Bottom',
			floating: 'Floating Mode',
			sticky: 'Sticky'
		};
		return labels[pos] || 'Custom';
	};

	// Update position mutation
	const updatePositionMutation = useMutation({
		mutationFn: async (newPosition: ShoutboxPosition) => {
			return apiRequest('PUT', '/api/settings/shoutbox-position', { position: newPosition });
		},
		onSuccess: () => {
			// Invalidate the settings query to get fresh data
			queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
		}
	});

	// Update position function
	const updatePosition = async (newPosition: ShoutboxPosition) => {
		const prevPosition = position;

		// Update local state immediately for responsive UI (optimistic update)
		setPosition(newPosition);

		// Update debug helpers
		setLastPositionChangeTime(new Date());
		setPositionChangeCount((prev) => prev + 1);

		// Log position change for debugging
		console.log(`Shoutbox position changed: ${prevPosition} -> ${newPosition}`);

		// Check if user is authenticated from the data we got
		const isAuthenticated = data?.isAuthenticated === true;

		if (!isAuthenticated) {
			// If not authenticated, just save to localStorage (already done in useEffect)
			// No need to attempt API call that would fail
			console.log('User not authenticated - position saved locally only');
			return;
		}

		try {
			// Send update to server only if authenticated
			await updatePositionMutation.mutateAsync(newPosition);
		} catch (error) {
			console.error('Error updating shoutbox position:', error);

			// Revert to original position if update fails
			setPosition(prevPosition);

			// Log error
			console.error('Failed to save position preference');
		}
	};

	// Save position to localStorage for persistence across page reloads
	useEffect(() => {
		if (!isLoading && position) {
			localStorage.setItem('shoutboxPosition', position);
		}
	}, [position, isLoading]);

	// Load position from localStorage on initial render
	useEffect(() => {
		const savedPosition = localStorage.getItem('shoutboxPosition');
		if (savedPosition && isValidPosition(savedPosition)) {
			setPosition(savedPosition as ShoutboxPosition);
		}
	}, []);

	// Set up WebSocket connection for real-time position updates
	useEffect(() => {
		// Always disable WebSocket functionality for now
		console.log('WebSocket functionality disabled for all environments to prevent white screens.');

		// This is a permanent change to ensure stable operation
		// WebSocket will remain disabled regardless of environment

		// If WebSocket functionality needs to be added in the future,
		// it should be implemented with proper environment detection and error handling
	}, []);

	// Helper to validate position
	function isValidPosition(pos: string): pos is ShoutboxPosition {
		return [
			'sidebar-top',
			'sidebar-bottom',
			'main-top',
			'main-bottom',
			'floating',
			'sticky'
		].includes(pos);
	}

	// Load expansion level from localStorage on initial render
	useEffect(() => {
		const savedExpansionLevel = localStorage.getItem('shoutboxExpansionLevel');
		if (savedExpansionLevel && ['collapsed', 'preview', 'expanded'].includes(savedExpansionLevel)) {
			setExpansionLevel(savedExpansionLevel as ShoutboxExpansionLevel);
		}
	}, []);

	// Save expansion level to localStorage
	useEffect(() => {
		localStorage.setItem('shoutboxExpansionLevel', expansionLevel);
	}, [expansionLevel]);

	// Function to update expansion level
	const updateExpansionLevel = (newLevel: ShoutboxExpansionLevel) => {
		setExpansionLevel(newLevel);

		// Log size change
		const levelLabels = {
			collapsed: 'Collapsed',
			preview: 'Preview',
			expanded: 'Expanded'
		};

		console.log(`Shoutbox size changed to ${levelLabels[newLevel]} Mode`);
	};

	// Function to cycle through expansion levels
	const cycleExpansionLevel = () => {
		const levels: ShoutboxExpansionLevel[] = ['collapsed', 'preview', 'expanded'];
		const currentIndex = levels.indexOf(expansionLevel);
		const nextIndex = (currentIndex + 1) % levels.length;
		updateExpansionLevel(levels[nextIndex]);
	};

	// Calculate effective position based on mobile vs desktop
	const getEffectivePosition = (): ShoutboxEffectivePosition => {
		// If not mobile or position is 'floating' or 'sticky', return the actual position
		if (!isMobile || position === 'floating' || position === 'sticky') {
			return position;
		}

		// On mobile, map positions:
		switch (position) {
			case 'sidebar-top':
			case 'main-top':
				return 'mobile-top';
			case 'sidebar-bottom':
			case 'main-bottom':
				return 'mobile-bottom';
			case 'sticky':
				return 'mobile-bottom';
			default:
				return position;
		}
	};

	// Get readable position label based on mobile/desktop state
	const getMobileAwarePositionLabel = (pos: ShoutboxPosition): string => {
		if (isMobile) {
			// Mobile-friendly labels
			const mobileLabels = {
				'sidebar-top': 'Header Area',
				'sidebar-bottom': 'Footer Area',
				'main-top': 'Content Top',
				'main-bottom': 'Content Bottom',
				floating: 'Floating Bubble',
				sticky: 'Sticky'
			};
			return mobileLabels[pos] || 'Custom';
		} else {
			// Original desktop labels
			return getPositionLabel(pos);
		}
	};

	// Calculate effective position
	const effectivePosition = getEffectivePosition();

	// Log when viewport changes between mobile and desktop
	useEffect(() => {
		// Skip on first render (when positionChangeCount is 0)
		if (positionChangeCount > 0) {
			console.log(
				`Viewport changed to ${isMobile ? 'mobile' : 'desktop'} view - Shoutbox adjusted`
			);
		}
	}, [isMobile, positionChangeCount]);

	const value = {
		position,
		effectivePosition,
		expansionLevel,
		isLoading,
		isMobile,
		updatePosition,
		updateExpansionLevel,
		cycleExpansionLevel,
		lastPositionChangeTime,
		positionChangeCount
	};

	return <ShoutboxContext.Provider value={value}>{children}</ShoutboxContext.Provider>;
}

export function useShoutbox() {
	const context = useContext(ShoutboxContext);
	if (context === undefined) {
		throw new Error('useShoutbox must be used within a ShoutboxProvider');
	}
	return context;
}
