# Widgets - Reusable Component Library

This directory contains reusable widget components that provide self-contained functionality across the DegenTalk platform.

## ProfileCard Component

### Overview

The `ProfileCard` is a comprehensive user profile widget that displays live user data in various layouts. It serves as the primary user identification component in the sidebar and other locations throughout the platform.

### Features

#### **Live Data Integration**

- **Real-time wallet balance** from `useWallet()` hook
- **User authentication state** from `useAuth()` hook
- **Dynamic role-based styling** with admin/mod/user variants
- **Level progression** with XP progress bars
- **Online status indicators** and verification badges

#### **Multiple Variants**

```typescript
<ProfileCard variant="sidebar" />   // Full sidebar display (default)
<ProfileCard variant="compact" />   // Condensed horizontal layout
<ProfileCard variant="mini" />      // Minimal avatar + balance
```

#### **Responsive Design**

- **Desktop**: Full feature display with animations
- **Tablet**: Compact layout with essential info
- **Mobile**: Mini variant for space efficiency

### Usage Examples

#### Basic Sidebar Integration

```tsx
import { ProfileCard } from '@/components/widgets/ProfileCard';
import { useAuth } from '@/hooks/use-auth';

function Sidebar() {
	const { isAuthenticated } = useAuth();

	return (
		<div className="sidebar">
			{isAuthenticated && <ProfileCard variant="sidebar" />}
			{/* Other sidebar content */}
		</div>
	);
}
```

#### Compact Header Display

```tsx
<ProfileCard variant="compact" showActions={false} className="bg-zinc-800/90" />
```

#### Mini Mobile Widget

```tsx
<ProfileCard variant="mini" className="fixed top-4 right-4 z-50" />
```

### Props API

```typescript
interface ProfileCardProps {
	variant?: 'sidebar' | 'compact' | 'mini';
	className?: string;
	showActions?: boolean; // Show quick action buttons
}
```

### Data Sources

#### User Data (`useAuth()`)

- **Username** and **role** (admin/mod/user)
- **Avatar URL** and **banner image**
- **XP**, **level**, **reputation**, **clout**
- **Bio**, **signature**, and **social links**
- **Verification status** and **VIP subscription**

#### Wallet Data (`useWallet()`)

- **DGT balance** with real-time updates
- **Crypto balances** (ETH, BTC, USDT)
- **Transaction history** and **pending states**

### Visual Elements

#### Role-Based Styling

```typescript
const roleConfig = {
	admin: {
		color: 'text-red-400',
		bg: 'bg-red-900/20',
		border: 'border-red-800',
		icon: Crown
	},
	mod: {
		color: 'text-blue-400',
		bg: 'bg-blue-900/20',
		border: 'border-blue-800',
		icon: Shield
	},
	user: {
		color: 'text-zinc-400',
		bg: 'bg-zinc-900/20',
		border: 'border-zinc-800',
		icon: Award
	}
};
```

#### Status Indicators

- **🟢 Online indicator** - Green dot on avatar
- **👑 Admin crown** - Overlay for admin users
- **✨ Verified badge** - For verified accounts
- **💎 VIP badge** - For subscription holders
- **🔧 DEV badge** - Development mode indicator

#### Progress Displays

- **XP Progress Bar** - Visual level progression
- **DGT Balance** - Formatted with thousands separators
- **Reputation Score** - Social credibility metric

### Development Mode

In development, the ProfileCard automatically displays the enhanced admin user:

```typescript
// Enhanced dev user data
const adminUser = {
	username: 'cryptoadmin',
	role: 'admin',
	level: 99,
	xp: 99999,
	reputation: 10000,
	bio: '🔥 DegenTalk Platform Administrator...',
	dgtBalance: 500000
	// ... full profile data
};
```

### Quick Actions

The sidebar variant includes action buttons:

- **View Profile** → `/profile/${username}`
- **Wallet** → `/wallet`
- **Settings** → `/settings`

### Animations

Uses `framer-motion` for smooth interactions:

- **Initial load** - Fade in from top
- **Hover effects** - Subtle scale and glow
- **Loading states** - Skeleton placeholders
- **Balance updates** - Number counting animations

### Integration Points

#### Sidebar (`AppSidebar.tsx`)

```tsx
{
	isAuthenticated && <ProfileCard variant="sidebar" />;
}
```

#### Header Navigation

```tsx
<ProfileCard variant="compact" showActions={false} />
```

#### Mobile Menu

```tsx
<ProfileCard variant="mini" />
```

### Future Enhancements

- **Avatar frame support** for cosmetic items
- **Animated DGT balance** on transactions
- **Social presence** indicators (Discord, Twitter)
- **Achievement badges** display
- **Customizable themes** per user preference

The ProfileCard serves as the cornerstone of user identity throughout the DegenTalk platform, providing a consistent and feature-rich representation of user status and capabilities.
