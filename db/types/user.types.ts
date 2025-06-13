export interface UserPluginData {
  paths?: Record<string, number>;
  pathMultipliers?: Record<string, number>;
  unlockedEmojis?: number[];
  [key: string]: any;
} 