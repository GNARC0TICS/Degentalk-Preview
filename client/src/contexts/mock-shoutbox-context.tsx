import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMobileDetector } from '@/hooks/use-media-query';

// Define ShoutboxPosition type here to avoid import issues
export type ShoutboxPosition =
	| 'sidebar-top'
	| 'sidebar-bottom'
	| 'main-top'
	| 'main-bottom'
	| 'floating';
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
const MockShoutboxContext = createContext<ShoutboxContextType>({
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

interface MockShoutboxProviderProps {
	children: ReactNode;
}

export function MockShoutboxProvider({ children }: MockShoutboxProviderProps) {
	// Default position until we load from API
	const [position, setPosition] = useState<ShoutboxPosition>('sidebar-top');
	const [expansionLevel, setExpansionLevel] = useState<ShoutboxExpansionLevel>('expanded');
	const [lastPositionChangeTime, setLastPositionChangeTime] = useState<Date | undefined>(undefined);
	const [positionChangeCount, setPositionChangeCount] = useState(0);
	const { toast } = useToast();

	// Check if we're on mobile
	const isMobile = useMobileDetector();

	// Helper function to get readable position name
	const getPositionLabel = (pos: ShoutboxPosition): string => {
		const labels = {
			'sidebar-top': 'Sidebar Top',
			'sidebar-bottom': 'Sidebar Bottom',
			'main-top': 'Main Top',
			'main-bottom': 'Main Bottom',
			floating: 'Floating Mode'
		};
		return labels[pos] || 'Custom';
	};

	// Update position function
	const updatePosition = async (newPosition: ShoutboxPosition) => {
		const prevPosition = position;

		// Update local state immediately for responsive UI (optimistic update)
		setPosition(newPosition);

		// Update debug helpers
		setLastPositionChangeTime(new Date());
		setPositionChangeCount((prev) => prev + 1);

		// Show feedback toast for better UX
		toast({
			title: 'Shoutbox Position Updated',
			description: `Moved to ${getMobileAwarePositionLabel(newPosition)}`,
			duration: 1500
		});
	};

	// Save position to localStorage for persistence across page reloads
	useEffect(() => {
		localStorage.setItem('shoutboxPosition', position);
	}, [position]);

	// Load position from localStorage on initial render
	useEffect(() => {
		const savedPosition = localStorage.getItem('shoutboxPosition');
		if (savedPosition && isValidPosition(savedPosition)) {
			setPosition(savedPosition as ShoutboxPosition);
		}
	}, []);

	// Helper to validate position
	function isValidPosition(pos: string): pos is ShoutboxPosition {
		return ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating'].includes(pos);
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

		// Show feedback toast for better UX
		const levelLabels = {
			collapsed: 'Collapsed',
			preview: 'Preview',
			expanded: 'Expanded'
		};

		toast({
			title: 'Shoutbox Size Changed',
			description: `Switched to ${levelLabels[newLevel]} Mode`,
			duration: 1500
		});
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
		// If not mobile or position is 'floating', return the actual position
		if (!isMobile || position === 'floating') {
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
				floating: 'Floating Bubble'
			};
			return mobileLabels[pos] || 'Custom';
		} else {
			// Original desktop labels
			return getPositionLabel(pos);
		}
	};

	// Calculate effective position
	const effectivePosition = getEffectivePosition();

	const value = {
		position,
		effectivePosition,
		expansionLevel,
		isLoading: false,
		isMobile,
		updatePosition,
		updateExpansionLevel,
		cycleExpansionLevel,
		lastPositionChangeTime,
		positionChangeCount
	};

	return <MockShoutboxContext.Provider value={value}>{children}</MockShoutboxContext.Provider>;
}

export function useMockShoutbox() {
	const context = useContext(MockShoutboxContext);
	if (context === undefined) {
		throw new Error('useMockShoutbox must be used within a MockShoutboxProvider');
	}
	return context;
}
