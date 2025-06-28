export const animationConfig = {
	durations: {
		enter: 0.3,
		fast: 0.2,
		slow: 0.5
	},
	stagger: 0.1,
	hoverScale: 1.05,
	easings: {
		standard: [0.25, 0.8, 0.25, 1] as const
	}
} as const;

export type AnimationConfig = typeof animationConfig;
