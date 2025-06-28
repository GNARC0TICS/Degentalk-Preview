/**
 * Brand Configuration
 *
 * Centralized design system tokens extracted from our best components
 * (degen-index, ProfileCard, etc.) for consistent theming across the platform
 */

export const brandConfig = {
	// Color System (from degen-index.tsx - our gold standard)
	colors: {
		primary: {
			emerald: {
				400: '#10b981',
				500: '#059669',
				600: '#047857',
				700: '#065f46'
			},
			cyan: {
				400: '#22d3ee',
				500: '#06b6d4',
				600: '#0891b2'
			}
		},
		backgrounds: {
			primary: 'zinc-900',
			secondary: 'zinc-800',
			tertiary: 'zinc-700',
			card: 'zinc-900/70',
			cardHover: 'zinc-900/90',
			overlay: 'zinc-900/80'
		},
		borders: {
			primary: 'zinc-800',
			secondary: 'zinc-700/50',
			accent: 'zinc-700/80'
		},
		text: {
			primary: 'white',
			secondary: 'zinc-400',
			muted: 'zinc-500',
			accent: 'emerald-400'
		}
	},

	// Animation System (from degen-index motion patterns)
	animation: {
		stagger: {
			initial: { opacity: 0, y: -20 },
			animate: { opacity: 1, y: 0 },
			delay: 0.1
		},
		slideUp: {
			initial: { opacity: 0, y: 20 },
			animate: { opacity: 1, y: 0 },
			transition: { delay: 0.2 }
		},
		hover: {
			whileHover: { y: -5 },
			whileTap: { scale: 0.98 }
		}
	},

	// Loading States (standardized from degen-index)
	loading: {
		spinner: {
			size: 'xl',
			color: 'emerald'
		},
		message: {
			className: 'text-zinc-400',
			prefix: 'Loading'
		}
	},

	// Error Handling (from degen-index ErrorDisplay)
	error: {
		title: 'Content Unavailable',
		variant: 'card',
		retryButton: true
	},

	// Stats Display (from degen-index stats bar)
	stats: {
		online: {
			icon: 'animate-pulse w-2 h-2 bg-emerald-400 rounded-full',
			color: 'text-emerald-400'
		},
		secondary: {
			color: 'text-cyan-400'
		},
		muted: {
			color: 'text-zinc-400'
		}
	},

	// Card System (unified from ProfileCard components)
	cards: {
		default: {
			background: 'bg-zinc-900/70 backdrop-blur-sm',
			border: 'border border-zinc-700/50',
			hover: 'hover:bg-zinc-900/90 hover:border-zinc-700/80',
			transition: 'transition-all'
		},
		compact: {
			background: 'bg-zinc-900/60',
			border: 'border border-zinc-800',
			padding: 'p-3'
		},
		feature: {
			background: 'bg-gradient-to-b from-zinc-800/80 to-zinc-900/85 backdrop-blur-sm',
			border: 'border border-zinc-700/50',
			shadow: 'shadow-xl'
		}
	},

	// Typography Scale (extracted from best components)
	typography: {
		h1: 'text-3xl font-bold text-white',
		h2: 'text-2xl font-bold text-white',
		h3: 'text-xl font-semibold text-zinc-200',
		body: 'text-zinc-300',
		caption: 'text-sm text-zinc-400',
		micro: 'text-xs text-zinc-500'
	},

	// Spacing System
	spacing: {
		stack: {
			xs: 'space-y-2',
			sm: 'space-y-4',
			md: 'space-y-6',
			lg: 'space-y-8'
		},
		gap: {
			xs: 'gap-2',
			sm: 'gap-4',
			md: 'gap-6',
			lg: 'gap-8'
		}
	}
} as const;

// Type exports for TypeScript safety
export type BrandConfig = typeof brandConfig;
export type ColorSystem = typeof brandConfig.colors;
export type AnimationSystem = typeof brandConfig.animation;
