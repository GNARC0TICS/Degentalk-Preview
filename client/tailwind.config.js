module.exports = {
	theme: {
		extend: {
			colors: {
				'cod-gray': {
					950: '#0B0B0B',
					900: '#121212',
					800: '#1E1E1E',
					700: '#2A2A2A',
					600: '#363636'
				},
				accent: {
					primary: '#10B981',
					secondary: '#06B6D4',
					success: '#22C55E',
					warning: '#F59E0B',
					error: '#EF4444',
					xp: '#8B5CF6'
				}
			},
			fontFamily: {
				sans: [
					'Inter',
					'sans-serif'
				],
				headline: [
					'"Space Grotesk"',
					'Inter',
					'sans-serif'
				]
			},
			animation: {
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'number-change': 'number-change 0.5s ease-out',
				glitch: 'glitch 0.3s ease-in-out',
				float: 'float 6s ease-in-out infinite'
			},
			keyframes: {
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
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			}
		}
	}
};
