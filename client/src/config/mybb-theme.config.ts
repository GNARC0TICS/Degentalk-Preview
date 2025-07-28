// MyBB Classic Theme Configuration
// This file allows customization of the MyBB classic theme colors

export interface MyBBThemeConfig {
  // Primary accent color (used for links, usernames, etc.)
  primaryColor: string;
  primaryColorHover: string;
  
  // Category header gradients
  categoryGradients: {
    blue: string;
    yellow: string;
    green: string;
    red: string;
    purple: string;
    dark: string; // New dark theme option
  };
  
  // Forum status icon colors
  forumIcons: {
    newPosts: string;
    noNewPosts: string;
    locked: string;
  };
  
  // Background colors
  backgrounds: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Border colors
  borders: {
    primary: string;
    secondary: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

// Default MyBB Classic Theme (Blue)
export const defaultMyBBTheme: MyBBThemeConfig = {
  primaryColor: '#60a5fa', // blue-400
  primaryColorHover: '#93bbfc', // blue-300
  
  categoryGradients: {
    blue: 'linear-gradient(to bottom, #5c7cfa 0%, #4263eb 100%)',
    yellow: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)',
    green: 'linear-gradient(to bottom, #34d399 0%, #10b981 100%)',
    red: 'linear-gradient(to bottom, #f87171 0%, #ef4444 100%)',
    purple: 'linear-gradient(to bottom, #a78bfa 0%, #8b5cf6 100%)',
    dark: 'linear-gradient(to bottom, #3f3f46 0%, #27272a 100%)'
  },
  
  forumIcons: {
    newPosts: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    noNewPosts: 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)',
    locked: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)'
  },
  
  backgrounds: {
    primary: '#18181b', // zinc-900
    secondary: '#09090b', // zinc-950
    tertiary: '#141416'
  },
  
  borders: {
    primary: '#3f3f46', // zinc-700
    secondary: '#27272a' // zinc-800
  },
  
  text: {
    primary: '#e4e4e7', // zinc-200
    secondary: '#a1a1aa', // zinc-400
    muted: '#71717a' // zinc-500
  }
};

// Dark Theme Variant (Emerald accent for Degentalk branding)
export const darkMyBBTheme: MyBBThemeConfig = {
  primaryColor: '#10b981', // emerald-500
  primaryColorHover: '#34d399', // emerald-400
  
  categoryGradients: {
    blue: 'linear-gradient(to bottom, #3f3f46 0%, #27272a 100%)', // zinc gradient
    yellow: 'linear-gradient(to bottom, #3f3f46 0%, #27272a 100%)',
    green: 'linear-gradient(to bottom, #10b981 0%, #059669 100%)', // emerald gradient
    red: 'linear-gradient(to bottom, #dc2626 0%, #991b1b 100%)',
    purple: 'linear-gradient(to bottom, #7c3aed 0%, #5b21b6 100%)',
    dark: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)'
  },
  
  forumIcons: {
    newPosts: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // emerald
    noNewPosts: 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)',
    locked: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
  },
  
  backgrounds: {
    primary: '#18181b',
    secondary: '#09090b',
    tertiary: '#0a0a0a'
  },
  
  borders: {
    primary: '#27272a',
    secondary: '#18181b'
  },
  
  text: {
    primary: '#e4e4e7',
    secondary: '#a1a1aa',
    muted: '#71717a'
  }
};

// Get the active theme
export const getMyBBTheme = (): MyBBThemeConfig => {
  // You can switch between themes here or load from user preferences
  // For now, we'll use the dark theme by default
  return darkMyBBTheme;
};