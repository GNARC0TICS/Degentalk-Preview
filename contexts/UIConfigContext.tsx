import React, { createContext, useContext } from 'react';

// A very lightweight placeholder context so that Next.js build succeeds.
// Feel free to replace with real implementation later.

interface UIConfigCtx {}

const UIConfigContext = createContext<UIConfigCtx | undefined>(undefined);

export const UIConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Empty provider – just returns children unchanged.
  return (
    <UIConfigContext.Provider value={undefined}>{children}</UIConfigContext.Provider>
  );
};

export const useUIConfig = () => {
  const ctx = useContext(UIConfigContext);
  return ctx;
};
