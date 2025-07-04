/**
 * Client-side formatting utilities for DGT and XP amounts
 * Provides consistent formatting across the application
 */

export const parseDgt = (raw: string | number | bigint): number =>
  Number(raw) / 1e8;

export const formatDgt = (ui: number): string =>
  ui.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' DGT';

export const parseXp = (raw: string | number): number =>
  Number(raw);

export const formatXp = (xp: number): string =>
  xp.toLocaleString() + ' XP';

// Additional utility formatters
export const formatDgtShort = (ui: number): string => {
  if (ui >= 1000000) {
    return (ui / 1000000).toFixed(1) + 'M DGT';
  } else if (ui >= 1000) {
    return (ui / 1000).toFixed(1) + 'K DGT';
  }
  return ui.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' DGT';
};

export const formatXpShort = (xp: number): string => {
  if (xp >= 1000000) {
    return (xp / 1000000).toFixed(1) + 'M XP';
  } else if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K XP';
  }
  return xp.toLocaleString() + ' XP';
};

// Percentage formatter for rates and multipliers
export const formatPercent = (value: number): string => {
  return (value * 100).toFixed(1) + '%';
};

// USD formatter for crypto/fiat values
export const formatUsd = (amount: number): string => {
  return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};