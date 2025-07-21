// Auth hooks
export { useAuth } from './use-auth';

// UI hooks
export { useToast } from './use-toast';

// Data/API hooks
export { useMessages } from './use-messages';
export { useInfiniteScroll } from './use-infinite-scroll';
export { useWebSocketStatus } from './use-websocket-status';
export { useUserByUsername } from './use-user-by-username';

// Feature-specific hooks
export { useRainNotifications } from './use-rain-notifications';
export { useDgtPurchase } from './useDgtPurchase'; // Fixed casing

// Media hooks
export { useImageUpload } from './use-image-upload';
export { useAvatarUpload } from './use-avatar-upload';

// Responsive hooks - all from the canonical useMediaQuery file
export { useMediaQuery, useBreakpoint, useMobileDetector } from './useMediaQuery';
