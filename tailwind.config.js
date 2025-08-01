/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		screens: {
			xs: '480px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px',
			'3xl': '1920px'
		},
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem'
			},
			// Comprehensive font system
			fontFamily: {
				sans: ['var(--font-sans)'],
				display: ['var(--font-display)'],
				bebas: ['var(--font-bebas)', 'var(--font-sans)'],
				'bungee': ['Bungee Inline', 'cursive'],
				'monoton': ['Monoton', 'cursive'],
				'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
				'manrope': ['Manrope', 'sans-serif']
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],
				'3xs': ['0.5rem', { lineHeight: '0.75rem' }]
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'120': '30rem',
				'128': '32rem',
				'144': '36rem'
			},
			colors: {
				// Client-specific color palette
				'cod-gray': {
					'950': '#0B0B0B',
					'900': '#121212',
					'800': '#1E1E1E',
					'700': '#2A2A2A',
					'600': '#363636'
				},
				// Shadcn/UI color system
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					// Override with client palette
					primary: '#10B981',
					secondary: '#06B6D4',
					success: '#22C55E',
					warning: '#F59E0B',
					error: '#EF4444',
					xp: '#8B5CF6'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Degentalk specific colors
				zinc: {
					750: '#333338', // Custom zinc shade between 700 and 800
					850: '#222226' // Custom zinc shade between 800 and 900
				},
				// Admin theme tokens
				admin: {
					surface: 'hsl(var(--admin-bg-surface))',
					page: 'hsl(var(--admin-bg-page))',
					'surface-hover': 'hsl(var(--admin-bg-surface-hover))',
					element: 'hsl(var(--admin-bg-element))',
					'element-hover': 'hsl(var(--admin-bg-element-hover))',
					border: 'hsl(var(--admin-border-subtle))',
					'border-strong': 'hsl(var(--admin-border-strong))',
					'border-interactive': 'hsl(var(--admin-border-interactive))',
					text: {
						primary: 'hsl(var(--admin-text-primary))',
						secondary: 'hsl(var(--admin-text-secondary))',
						accent: 'hsl(var(--admin-text-accent))',
						destructive: 'hsl(var(--admin-text-destructive))'
					},
					status: {
						ok: 'hsl(var(--success))',
						warning: 'hsl(var(--warning))',
						error: 'hsl(var(--destructive))'
					}
				},
				// Update admin status tokens for proper referencing
				'admin-status': {
					ok: 'hsl(var(--success))',
					warning: 'hsl(var(--warning))',
					error: 'hsl(var(--destructive))'
				},
				'admin-text': {
					primary: 'hsl(var(--admin-text-primary))',
					secondary: 'hsl(var(--admin-text-secondary))',
					accent: 'hsl(var(--admin-text-accent))',
					destructive: 'hsl(var(--admin-text-destructive))'
				},
				'admin-bg': {
					surface: 'hsl(var(--admin-bg-surface))',
					page: 'hsl(var(--admin-bg-page))',
					element: 'hsl(var(--admin-bg-element))'
				},
				'admin-border': {
					DEFAULT: 'hsl(var(--admin-border-subtle))',
					strong: 'hsl(var(--admin-border-strong))',
					interactive: 'hsl(var(--admin-border-interactive))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slide-left': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'slide-right': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				glow: {
					'0%, 100%': { boxShadow: '0 0 6px rgba(255,255,255,0.6)' },
					'50%': { boxShadow: '0 0 14px rgba(255,255,255,1)' }
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 8px rgba(16, 185, 129, 0.2)'
					},
					'50%': {
						boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)'
					}
				},
				chroma: {
					'0%': { filter: 'hue-rotate(0deg)' },
					'100%': { filter: 'hue-rotate(360deg)' }
				},
				ripple: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'70%': { transform: 'scale(1.5)', opacity: '0' },
					'100%': { transform: 'scale(1.5)', opacity: '0' }
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-8px)'
					}
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				glitch: {
					'0%, 100%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' }
				},
				'number-change': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				shimmer: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				fadeIn: {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeOut: {
					from: {
						opacity: '1',
						transform: 'translateY(0)'
					},
					to: {
						opacity: '0',
						transform: 'translateY(-10px)'
					}
				},
				bounce: {
					'0%, 100%': {
						transform: 'translateY(-25%)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				pulse: {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '.5'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'slide-left': 'slide-left 15s linear infinite',
				'slide-right': 'slide-right 15s linear infinite',
				float: 'float 3s ease-in-out infinite',
				glow: 'glow 2s ease-in-out infinite both',
				chroma: 'chroma 4s linear infinite',
				ripple: 'ripple 1.5s ease-out infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				glitch: 'glitch 0.3s ease-in-out',
				'number-change': 'number-change 0.5s ease-out',
				shimmer: 'shimmer 3s infinite linear',
				fadeIn: 'fadeIn 0.3s ease-out forwards',
				fadeOut: 'fadeOut 0.3s ease-out forwards',
				bounce: 'bounce 1s infinite',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			backgroundImage: {
				'grid-pattern':
					'linear-gradient(rgba(42,42,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,42,0.05) 1px, transparent 1px)',
				'grid-pattern-dense':
					'linear-gradient(rgba(42,42,42,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,42,0.1) 1px, transparent 1px)',
				'radial-glow':
					'radial-gradient(ellipse at center, rgba(0,255,170,0.05) 0%, rgba(0,0,0,0.4) 70%)',
				'radial-glow-sm':
					'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(29, 78, 216, 0.15), transparent 80%)',
				'hero-gradient': 
					'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
				'gradient-radial': 
					'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'zone-gradient':
					'linear-gradient(135deg, var(--zone-accent-gradient-start) 0%, var(--zone-accent-gradient-end) 100%)',
				'shimmer-gradient':
					'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
				'noise': 
					"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
			},
			backgroundSize: {
				grid: '40px 40px',
				'grid-dense': '20px 20px'
			},
			boxShadow: {
				'glow': '0 0 20px rgba(16, 185, 129, 0.5)',
				'glow-sm': '0 0 10px rgba(16, 185, 129, 0.3)',
				'glow-lg': '0 0 30px rgba(16, 185, 129, 0.6)',
				'inner-glow': 'inset 0 0 20px rgba(16, 185, 129, 0.1)',
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'neon': '0 0 5px theme(colors.accent.primary), 0 0 20px theme(colors.accent.primary)'
			},
			dropShadow: {
				'glow': '0 0 10px rgba(16, 185, 129, 0.5)',
				'glow-sm': '0 0 5px rgba(16, 185, 129, 0.3)',
				'glow-lg': '0 0 15px rgba(16, 185, 129, 0.6)',
				'text': '0 2px 4px rgba(0,0,0,0.8)'
			},
			blur: {
				xs: '2px'
			},
			maxWidth: {
				container: 'var(--container-max-width, 100%)',
				'8xl': '88rem',
				'9xl': '96rem'
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
				'800': '800ms',
				'900': '900ms'
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
			},
			scale: {
				'102': '1.02',
				'103': '1.03',
				'98': '0.98',
				'97': '0.97'
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100'
			}
		},
		container: {
			center: true,
			padding: '1rem',
			screens: {
				xs: '480px',
				md: '768px',
				lg: '1024px',
				xl: '1440px',
				'2xl': '1660px',
				'3xl': '1920px'
			}
		}
	},
	plugins: [
		require('tailwindcss-animate'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/container-queries')
	]
};
