import type { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: ['./client/index.html', './client/src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		screens: {
			xs: '480px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			// Merged from client/tailwind.config.js
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				headline: ['"Space Grotesk"', 'Inter', 'sans-serif'],
				orbitron: ['Orbitron', 'monospace'],
				audiowide: ['Audiowide', 'cursive'],
				'black-ops': ['"Black Ops One"', 'cursive'],
				jetbrains: ['"JetBrains Mono"', 'monospace'],
				'space-mono': ['"Space Mono"', 'monospace'],
				'press-start': ['"Press Start 2P"', 'cursive']
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
				glow: {
					'0%, 100%': { boxShadow: '0 0 6px rgba(255,255,255,0.6)' },
					'50%': { boxShadow: '0 0 14px rgba(255,255,255,1)' }
				},
				chroma: {
					'0%': { filter: 'hue-rotate(0deg)' },
					'100%': { filter: 'hue-rotate(360deg)' }
				},
				ripple: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'70%': { transform: 'scale(1.5)', opacity: '0' },
					'100%': { transform: 'scale(1.5)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'slide-left': 'slide-left 15s linear infinite',
				float: 'float 3s ease-in-out infinite',
				glow: 'glow 2s ease-in-out infinite both',
				chroma: 'chroma 4s linear infinite',
				ripple: 'ripple 1.5s ease-out infinite'
			},
			backgroundImage: {
				'grid-pattern':
					'linear-gradient(rgba(42,42,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,42,0.05) 1px, transparent 1px)',
				'radial-glow':
					'radial-gradient(ellipse at center, rgba(0,255,170,0.05) 0%, rgba(0,0,0,0.4) 70%)',
				'hero-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)'
			},
			backgroundSize: {
				grid: '40px 40px'
			},
			maxWidth: {
				container: 'var(--container-max-width, 100%)'
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
