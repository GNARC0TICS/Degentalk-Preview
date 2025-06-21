// Main header component
export { SiteHeader } from './SiteHeader';

// Context
export { HeaderProvider, useHeader } from './HeaderContext';
export type { HeaderContextValue, HeaderTheme, HeaderUser } from './HeaderContext';

// Atomic components
export { Logo } from './Logo';
export { PrimaryNav } from './PrimaryNav';
export { SearchBox } from './SearchBox';
export { UserMenu } from './UserMenu';
export { NotificationButton } from './NotificationButton';
export { WalletButton } from './WalletButton';
export { AuthButtons } from './AuthButtons';
export { AdminButton } from './AdminButton';
export { MobileNav } from './MobileNav';
export { NavLink } from './NavLink';

// Theme and plugins
export { HeaderThemeWrapper } from './HeaderThemeWrapper';
export { HeaderPluginSlot, registerHeaderPlugin, unregisterHeaderPlugin } from './HeaderPluginSlot';

// Navigation configuration (re-export for convenience)
export {
	primaryNavigation,
	createUserMenuItems,
	filterNavItems,
	trackNavigation
} from '@/config/navigation';
export type { NavItemConfig, UserMenuItemConfig } from '@/config/navigation';
