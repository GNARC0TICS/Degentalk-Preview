# Degentalk™™ v2 Component Tree

## Core Layout Components

```
Layout/
├── RootLayout (App wrapper with theme provider)
├── MainLayout (Standard page layout with header, sidebar, content area)
├── Header/
│   ├── Logo
│   ├── MainNav
│   ├── UserMenu
│   ├── NotificationsMenu
│   ├── WalletDisplay
│   └── MobileMenuTrigger
├── Sidebar/
│   ├── CategoryNav
│   ├── UserCard
│   ├── WalletSummary
│   ├── PathProgress
│   └── LeaderboardWidget
└── Footer
```

## Forum Components

```
Forum/
├── CategoryList/
│   ├── CategoryCard
│   └── CategoryStats
├── ThreadList/
│   ├── ThreadCard
│   ├── ThreadActions
│   └── ThreadFilters
├── PostList/
│   ├── PostCard
│   ├── PostActions
│   └── ReactionBar
├── Editors/
│   ├── ThreadComposer
│   ├── PostEditor
│   └── EmojiPicker
└── Navigation/
    ├── BreadcrumbNav
    ├── Pagination
    └── ForumSectionHeader
```

## User Components

```
User/
├── Profile/
│   ├── ProfileHeader
│   ├── ProfileTabs
│   ├── ProfileStats
│   ├── ActivityFeed
│   └── AchievementDisplay
├── Identity/
│   ├── UserPaths
│   ├── LevelProgress
│   ├── BadgeCollection
│   └── UserTitles
├── Authentication/
│   ├── LoginForm
│   ├── RegisterForm
│   ├── PasswordReset
│   └── EmailVerification
└── Settings/
    ├── ProfileSettings
    ├── AccountSettings
    ├── NotificationSettings
    └── PrivacySettings
```

## Economy Components

```
Economy/
├── Wallet/
│   ├── WalletDisplay
│   ├── TransactionHistory
│   ├── DepositForm
│   └── WithdrawForm
├── Shop/
│   ├── ShopGrid
│   ├── ProductCard
│   ├── ProductDetail
│   ├── CategoryFilter
│   └── PurchaseModal
├── Tipping/
│   ├── TipButton
│   ├── RainButton
│   ├── TipModal
│   └── RainConfirmation
└── Rewards/
    ├── RewardNotification
    ├── XpGainDisplay
    ├── AchievementUnlock
    └── RewardHistory
```

## UI Element Components

```
UI/
├── Feedback/
│   ├── Toast
│   ├── Alert
│   ├── LoadingIndicator
│   └── EmptyState
├── DataDisplay/
│   ├── Badge
│   ├── Card
│   ├── Stat
│   └── Timeline
├── Inputs/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Textarea
│   └── Toggle
├── Navigation/
│   ├── Tabs
│   ├── Breadcrumb
│   ├── Pagination
│   └── Menu
└── Overlays/
    ├── Modal
    ├── Drawer
    ├── Popover
    └── Tooltip
```

## Crypto & Web3 Components

```
Web3/
├── ConnectWallet
├── TransactionStatus
├── BlockchainExplorer
└── CryptoAddressDisplay
```

## Animation & Micro-interaction Components

```
Animations/
├── LevelUpEffect
├── XpGainIndicator
├── CoinRainEffect
├── PulseGlow
├── TextScramble
└── GradientShift
```

## Patterns for Component Enhancement

1. **Standard to Enhanced**
   - Base components from shadcn/ui will be extended with Degentalk™™-specific styling and functionality
   - Example: Button → GradientButton, Card → GlowingCard

2. **Composition Over Inheritance**
   - Build complex components by composing simpler ones
   - Example: WalletDisplay = Card + StatGroup + PulseGlow animation

3. **Separation of Concerns**
   - UI components handle presentation only
   - Container components handle data fetching and state
   - Example: ThreadList (container) uses ThreadCard (presentation)

4. **Responsive Variations**
   - Each component should have mobile, tablet, and desktop variations
   - Use responsive props or context to adapt to screen size

5. **Theme Integration**
   - All components should respect the dark mode theme
   - Use CSS variables for consistent colors and transitions

## Implementation Priority

1. **Core Layout & UI Theme** (Highest)
   - MainLayout, Header, Sidebar, Footer
   - Dark theme styling and crypto aesthetic
   
2. **Forum Core Components**
   - CategoryList, ThreadList, PostList
   - Basic thread and post creation
   
3. **User Identity & XP System**
   - Path progression and level display
   - XP visualization
   
4. **Wallet & Economy**
   - Wallet display
   - Transaction history
   - Tipping functionality
   
5. **Shop & Customization**
   - Shop interface
   - Product browsing
   - Purchase flow
   
6. **Micro-interactions & Polish** (Ongoing)
   - Animations
   - Transition effects
   - Loading states