import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { z } from 'zod';

// Schema definitions
const ResponsiveSpacingSchema = z.object({
	base: z.string(),
	sm: z.string().optional(),
	md: z.string().optional(),
	lg: z.string().optional(),
	xl: z.string().optional()
});

const SpacingConfigSchema = z.object({
	container: ResponsiveSpacingSchema,
	section: ResponsiveSpacingSchema,
	sectionLarge: ResponsiveSpacingSchema,
	card: ResponsiveSpacingSchema,
	cardCompact: ResponsiveSpacingSchema,
	element: ResponsiveSpacingSchema,
	elementSmall: ResponsiveSpacingSchema
});

const FontConfigSchema = z.object({
	primary: z.string(),
	display: z.string(),
	mono: z.string(),
	scale: z.object({
		xs: z.string(),
		sm: z.string(),
		base: z.string(),
		lg: z.string(),
		xl: z.string(),
		'2xl': z.string(),
		'3xl': z.string(),
		'4xl': z.string()
	})
});

const ComponentConfigSchema = z.object({
	cards: z.object({
		variant: z.enum(['default', 'compact', 'detailed']),
		showBanner: z.boolean(),
		borderRadius: z.string(),
		shadow: z.string(),
		borderStyle: z.string()
	}),
	buttons: z.object({
		variant: z.enum(['default', 'ghost', 'outline']),
		size: z.enum(['sm', 'md', 'lg']),
		radius: z.string()
	}),
	loaders: z.object({
		style: z.enum(['spinner', 'dots', 'pulse', 'skeleton']),
		size: z.enum(['sm', 'md', 'lg']),
		showMessage: z.boolean()
	})
});

const UIConfigSchema = z.object({
	spacing: SpacingConfigSchema,
	typography: FontConfigSchema,
	components: ComponentConfigSchema
});

// Types
export type ResponsiveSpacing = z.infer<typeof ResponsiveSpacingSchema>;
export type SpacingConfig = z.infer<typeof SpacingConfigSchema>;
export type FontConfig = z.infer<typeof FontConfigSchema>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
export type UIConfig = z.infer<typeof UIConfigSchema>;

type ConfigType = keyof UIConfig;

interface UIConfigContextType extends UIConfig {
	loading: boolean;
	error: Error | null;
	updateConfig: (type: ConfigType, data: any) => Promise<void>;
	resetConfig: (type?: ConfigType) => Promise<void>;
}

// Default configuration (matches current hardcoded values)
const defaultConfig: UIConfig = {
	spacing: {
		container: {
			base: 'px-2 py-6',
			sm: 'sm:px-4 sm:py-8',
			md: 'md:py-12'
		},
		section: {
			base: 'mb-8'
		},
		sectionLarge: {
			base: 'mb-16'
		},
		card: {
			base: 'p-4',
			sm: 'sm:p-6'
		},
		cardCompact: {
			base: 'p-3',
			sm: 'sm:p-4'
		},
		element: {
			base: 'mb-4'
		},
		elementSmall: {
			base: 'mb-2'
		}
	},
	typography: {
		primary: 'inter',
		display: 'spaceGrotesk',
		mono: 'jetBrainsMono',
		scale: {
			xs: 'text-xs',
			sm: 'text-sm',
			base: 'text-base',
			lg: 'text-lg',
			xl: 'text-xl',
			'2xl': 'text-2xl',
			'3xl': 'text-3xl',
			'4xl': 'text-4xl'
		}
	},
	components: {
		cards: {
			variant: 'default',
			showBanner: true,
			borderRadius: 'rounded-lg',
			shadow: 'shadow-md',
			borderStyle: 'border border-zinc-800'
		},
		buttons: {
			variant: 'default',
			size: 'md',
			radius: 'rounded-md'
		},
		loaders: {
			style: 'spinner',
			size: 'md',
			showMessage: true
		}
	}
};

// Context
const UIConfigContext = createContext<UIConfigContextType | null>(null);

// Reducer
type UIConfigState = UIConfig & {
	loading: boolean;
	error: Error | null;
};

type UIConfigAction =
	| { type: 'LOAD_CONFIG'; payload: Partial<UIConfig> }
	| { type: 'UPDATE_CONFIG'; payload: { type: ConfigType; data: any } }
	| { type: 'RESET_CONFIG'; payload?: ConfigType }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: Error | null };

const uiConfigReducer = (state: UIConfigState, action: UIConfigAction): UIConfigState => {
	switch (action.type) {
		case 'LOAD_CONFIG':
			return { ...state, ...action.payload, loading: false, error: null };

		case 'UPDATE_CONFIG': {
			const { type, data } = action.payload;
			return {
				...state,
				[type]: { ...state[type], ...data },
				error: null
			};
		}

		case 'RESET_CONFIG': {
			if (action.payload) {
				return {
					...state,
					[action.payload]: defaultConfig[action.payload],
					error: null
				};
			}
			return { ...defaultConfig, loading: false, error: null };
		}

		case 'SET_LOADING':
			return { ...state, loading: action.payload };

		case 'SET_ERROR':
			return { ...state, error: action.payload, loading: false };

		default:
			return state;
	}
};

// Provider component
export const UIConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [state, dispatch] = useReducer(uiConfigReducer, {
		...defaultConfig,
		loading: false,
		error: null
	});

	// Load config from localStorage on mount (for now, will be API later)
	useEffect(() => {
		const loadConfig = () => {
			try {
				const saved = localStorage.getItem('degentalk-ui-config');
				if (saved) {
					const parsed = JSON.parse(saved);
					const validated = UIConfigSchema.parse(parsed);
					dispatch({ type: 'LOAD_CONFIG', payload: validated });
				}
			} catch (error) {
				console.error('Failed to load UI config:', error);
				dispatch({ type: 'SET_ERROR', payload: error as Error });
			}
		};

		loadConfig();
	}, []);

	const updateConfig = async (type: ConfigType, data: any) => {
		try {
			dispatch({ type: 'UPDATE_CONFIG', payload: { type, data } });

			// Save to localStorage (will be API call later)
			const newConfig = {
				spacing: state.spacing,
				typography: state.typography,
				components: state.components,
				[type]: { ...state[type], ...data }
			};

			localStorage.setItem('degentalk-ui-config', JSON.stringify(newConfig));
		} catch (error) {
			dispatch({ type: 'SET_ERROR', payload: error as Error });
			throw error;
		}
	};

	const resetConfig = async (type?: ConfigType) => {
		try {
			dispatch({ type: 'RESET_CONFIG', payload: type });

			if (type) {
				const newConfig = {
					spacing: state.spacing,
					typography: state.typography,
					components: state.components,
					[type]: defaultConfig[type]
				};
				localStorage.setItem('degentalk-ui-config', JSON.stringify(newConfig));
			} else {
				localStorage.removeItem('degentalk-ui-config');
			}
		} catch (error) {
			dispatch({ type: 'SET_ERROR', payload: error as Error });
			throw error;
		}
	};

	const contextValue: UIConfigContextType = {
		...state,
		updateConfig,
		resetConfig
	};

	return <UIConfigContext.Provider value={contextValue}>{children}</UIConfigContext.Provider>;
};

// Hook for consuming config
export const useUIConfig = () => {
	const context = useContext(UIConfigContext);
	if (!context) {
		throw new Error('useUIConfig must be used within UIConfigProvider');
	}
	return context;
};

// Utility function to build responsive class string
export const buildResponsiveClasses = (config: ResponsiveSpacing): string => {
	const classes = [config.base];

	if (config.sm) classes.push(config.sm);
	if (config.md) classes.push(config.md);
	if (config.lg) classes.push(config.lg);
	if (config.xl) classes.push(config.xl);

	return classes.join(' ');
};
