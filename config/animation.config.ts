export const animationConfig = {
	// Duration presets in seconds
	durations: {
		instant: 0.1,
		fast: 0.2,
		enter: 0.3,
		normal: 0.3,
		smooth: 0.4,
		slow: 0.5,
		verySlow: 0.8
	},
	
	// Stagger delays
	stagger: {
		fast: 0.05,
		normal: 0.1,
		slow: 0.15,
		cascade: 0.2
	},
	
	// Scale values
	scale: {
		hover: 1.05,
		press: 0.95,
		focus: 1.02
	},
	
	// Easing curves
	easings: {
		standard: [0.25, 0.8, 0.25, 1] as const,
		smooth: [0.4, 0, 0.2, 1] as const,
		elastic: [0.68, -0.55, 0.325, 1.45] as const,
		bounce: [0.68, -0.55, 0.265, 1.55] as const,
		ios: [0.25, 0.46, 0.45, 0.94] as const
	},
	
	// Component-specific configs
	card: {
		duration: 0.3,
		ease: [0.25, 0.8, 0.25, 1] as const,
		hoverScale: 1.05
	},
	
	// Mobile menu
	mobileMenu: {
		duration: 0.3,
		ease: [0.4, 0, 0.2, 1] as const
	},
	
	// Reduced motion fallbacks
	reducedMotion: {
		duration: 0,
		stagger: 0,
		scale: 1
	}
} as const;

export type AnimationConfig = typeof animationConfig;

// Helper to get animation values with reduced motion support
export function getAnimationValue<T extends keyof typeof animationConfig>(
	category: T,
	key: keyof typeof animationConfig[T],
	prefersReducedMotion: boolean = false
): any {
	if (prefersReducedMotion && category !== 'easings') {
		return animationConfig.reducedMotion[key as keyof typeof animationConfig.reducedMotion] ?? 0;
	}
	return animationConfig[category][key];
}
