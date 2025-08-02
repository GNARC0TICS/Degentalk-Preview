import React, { createContext, useContext } from 'react';

// Minimal stub so imports compile. Swap for real logic later.
interface HeaderCtx {}

const HeaderContext = createContext<HeaderCtx | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <HeaderContext.Provider value={undefined}>{children}</HeaderContext.Provider>;
};

export const useHeader = () => useContext(HeaderContext);
