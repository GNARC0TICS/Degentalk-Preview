import React, { createContext, useContext, useState, useEffect } from 'react';

type ForumViewTheme = 'modern' | 'classic';

interface ForumViewThemeContextType {
  viewTheme: ForumViewTheme;
  setViewTheme: (theme: ForumViewTheme) => void;
}

const ForumViewThemeContext = createContext<ForumViewThemeContextType | undefined>(undefined);

export const ForumViewThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewTheme, setViewTheme] = useState<ForumViewTheme>(() => {
    const saved = localStorage.getItem('forum-view-theme');
    return (saved as ForumViewTheme) || 'modern';
  });

  useEffect(() => {
    localStorage.setItem('forum-view-theme', viewTheme);
    
    // Apply or remove the classic theme class
    if (viewTheme === 'classic') {
      document.body.classList.add('mybb-classic-theme');
    } else {
      document.body.classList.remove('mybb-classic-theme');
    }
    
    return () => {
      document.body.classList.remove('mybb-classic-theme');
    };
  }, [viewTheme]);

  return (
    <ForumViewThemeContext.Provider value={{ viewTheme, setViewTheme }}>
      {children}
    </ForumViewThemeContext.Provider>
  );
};

export const useForumViewTheme = () => {
  const context = useContext(ForumViewThemeContext);
  if (!context) {
    throw new Error('useForumViewTheme must be used within a ForumViewThemeProvider');
  }
  return context;
};