import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import XpToast from '@/components/xp/XpToast';
import { setupXpGainListener } from '@/lib/queryClient';

// Types
interface XpToastData {
  id: string;
  action: string;
  amount: number;
  description: string;
  isLevelUp?: boolean;
  newLevel?: number;
}

interface XpToastContextType {
  showXpToast: (data: Omit<XpToastData, 'id'>) => void;
}

// Create context with default values
const XpToastContext = createContext<XpToastContextType>({
  showXpToast: () => {},
});

// Custom hook to use the XP toast context
export const useXpToast = () => useContext(XpToastContext);

// Maximum number of toasts to show at once
const MAX_TOASTS = 3;

// Provider component
export const XpToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<XpToastData[]>([]);

  // Add a new toast to the queue
  const showXpToast = useCallback((data: Omit<XpToastData, 'id'>) => {
    const id = Date.now().toString();
    
    setToasts(currentToasts => {
      // If we already have max toasts, remove the oldest one
      const updatedToasts = [...currentToasts];
      if (updatedToasts.length >= MAX_TOASTS) {
        updatedToasts.shift(); // Remove the oldest toast
      }
      
      // Add the new toast
      return [...updatedToasts, { ...data, id }];
    });
  }, []);

  // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  // Set up XP gain listener
  useEffect(() => {
    // Setup the XP gain event listener
    const cleanup = setupXpGainListener(showXpToast);
    return cleanup;
  }, [showXpToast]);

  return (
    <XpToastContext.Provider value={{ showXpToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 left-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <XpToast
              key={toast.id}
              action={toast.action}
              amount={toast.amount}
              description={toast.description}
              isLevelUp={toast.isLevelUp}
              newLevel={toast.newLevel}
              onClose={() => removeToast(toast.id)}
              autoCloseDelay={toast.isLevelUp ? 6000 : 4000} // Longer display for level ups
            />
          ))}
        </AnimatePresence>
      </div>
    </XpToastContext.Provider>
  );
};

export default XpToastProvider; 