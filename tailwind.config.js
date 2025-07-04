/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact Degentalk brand colors from main site
        'cod-gray': {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0a0a0a',
        },
        // Zinc colors for exact match with main site
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // CSS custom properties for exact compatibility
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'card': 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        'popover': 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        'primary': 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'secondary': 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        'muted': 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        'accent': 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        'destructive': 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%',
            'background-size': '400% 400%'
          },
          '50%': { 
            'background-position': '100% 50%',
            'background-size': '400% 400%'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { 'box-shadow': '0 0 5px rgb(16 185 129 / 0.5)' },
          '100%': { 'box-shadow': '0 0 20px rgb(16 185 129 / 0.8), 0 0 30px rgb(16 185 129 / 0.4)' },
        },
        'neon-flicker': {
          '0%, 100%': { 
            'opacity': '1',
            'filter': 'brightness(125%) contrast(110%) drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 45px rgba(16, 185, 129, 0.2))'
          },
          '2%': { 
            'opacity': '0.9',
            'filter': 'brightness(140%) contrast(120%) drop-shadow(0 0 10px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))'
          },
          '4%': { 
            'opacity': '1',
            'filter': 'brightness(125%) contrast(110%) drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 45px rgba(16, 185, 129, 0.2))'
          },
          '8%': { 
            'opacity': '0.7',
            'filter': 'brightness(90%) contrast(95%) drop-shadow(0 0 5px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 15px rgba(16, 185, 129, 0.2))'
          },
          '12%': { 
            'opacity': '1',
            'filter': 'brightness(125%) contrast(110%) drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 45px rgba(16, 185, 129, 0.2))'
          },
          '16%': { 
            'opacity': '0.85',
            'filter': 'brightness(110%) contrast(105%) drop-shadow(0 0 8px rgba(16, 185, 129, 0.5)) drop-shadow(0 0 18px rgba(16, 185, 129, 0.3))'
          },
          '18%': { 
            'opacity': '1',
            'filter': 'brightness(125%) contrast(110%) drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 30px rgba(16, 185, 129, 0.4)) drop-shadow(0 0 45px rgba(16, 185, 129, 0.2))'
          }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};