import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  setIsCollapsed: (collapsed: boolean) => void; // Allow direct setting for responsive behavior
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export const AdminSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsedState] = useState(false); // Default for desktop
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsCollapsedState((prev) => !prev);
  }, []);

  const openMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);
  
  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
  }, []);

  return (
    <AdminSidebarContext.Provider value={{ 
        isCollapsed, 
        toggleSidebar, 
        isMobileDrawerOpen, 
        openMobileDrawer, 
        closeMobileDrawer,
        setIsCollapsed 
      }}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

export const useAdminSidebar = (): AdminSidebarContextType => {
  const context = useContext(AdminSidebarContext);
  if (context === undefined) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider');
  }
  return context;
};
