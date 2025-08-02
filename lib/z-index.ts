/**
 * Z-index management system for consistent layering
 * Higher numbers appear above lower numbers
 */
export const zIndex = {
  // Base content
  base: 0,
  dropdown: 10,
  sticky: 20,
  
  // Overlays
  overlay: 30,
  modal: 40,
  
  // Mobile navigation
  mobileMenuOverlay: 40,
  mobileMenu: 50,
  
  // Tooltips and popovers
  tooltip: 60,
  popover: 70,
  
  // Notifications
  notification: 80,
  
  // Critical UI (always on top)
  alert: 90,
  loader: 100,
} as const;

export type ZIndexKey = keyof typeof zIndex;