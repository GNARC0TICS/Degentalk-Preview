import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UiverseComponentsConfig } from '../../../config/uiverse-components.config';
import { defaultUiverseConfig, getCurrentSeason, getUserLevelConfig } from '../../../config/uiverse-components.config';
import { useAuth } from '@/hooks/use-auth';

interface UiverseConfigContextValue {
  config: UiverseComponentsConfig;
  updateConfig: (updates: Partial<UiverseComponentsConfig>) => void;
  currentSeason: string | null;
  userLevel: string;
  isLoading: boolean;
}

const UiverseConfigContext = createContext<UiverseConfigContextValue | null>(null);

export function UiverseConfigProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [config, setConfig] = useState<UiverseComponentsConfig>(defaultUiverseConfig);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSeason = getCurrentSeason();
  const userLevel = getUserLevelConfig(user?.xp || 0);
  
  // TODO: Load config from API/admin settings
  useEffect(() => {
    // Future: fetch admin-configured settings
    // const loadConfig = async () => {
    //   setIsLoading(true);
    //   const adminConfig = await fetchAdminUiverseConfig();
    //   setConfig(mergeConfigs(defaultUiverseConfig, adminConfig));
    //   setIsLoading(false);
    // };
    // loadConfig();
  }, []);
  
  const updateConfig = (updates: Partial<UiverseComponentsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    // TODO: Save to backend
  };
  
  return (
    <UiverseConfigContext.Provider value={{ config, updateConfig, currentSeason, userLevel, isLoading }}>
      {children}
    </UiverseConfigContext.Provider>
  );
}

export function useUiverseConfig() {
  const context = useContext(UiverseConfigContext);
  if (!context) {
    throw new Error('useUiverseConfig must be used within UiverseConfigProvider');
  }
  return context;
}