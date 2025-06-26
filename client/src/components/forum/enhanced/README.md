# Enhanced Forum Components

A collection of modern, crypto-native forum UI components built for Degentalk with progressive disclosure, mobile-first design, and beautiful animations.

## Components Overview

### 🧵 EnhancedThreadCard

Progressive disclosure thread card with crypto-native engagement features.

**Features:**

- Progressive disclosure (hover to reveal details)
- Crypto engagement metrics (tips, reputation, momentum)
- Quick actions (tip, bookmark, share)
- Mobile-optimized responsive design
- Zone-based theming
- Animated state transitions

**Usage:**

```typescript
import { EnhancedThreadCard } from '@/components/forum/enhanced';

<EnhancedThreadCard
  thread={threadData}
  variant="default" // 'default' | 'compact' | 'featured'
  showPreview={true}
  onTip={(threadId, amount) => handleTip(threadId, amount)}
  onBookmark={(threadId) => handleBookmark(threadId)}
/>
```

### 🎯 EnhancedZoneCard

Mobile-optimized zone discovery card with activity metrics and smooth animations.

**Features:**

- Zone-specific theming with gradients
- Activity momentum indicators
- XP boost and event badges
- Forum previews on hover
- Mobile-first responsive layout
- Animated background effects

**Usage:**

```typescript
import { EnhancedZoneCard } from '@/components/forum/enhanced';

<EnhancedZoneCard
  zone={zoneData}
  layout="default" // 'default' | 'compact' | 'hero' | 'mobile'
  variant="default" // 'default' | 'premium' | 'event'
  showStats={true}
  showPreview={true}
  onEnter={(zoneId) => handleZoneEnter(zoneId)}
/>
```

### ⚡ CryptoEngagementBar

Comprehensive engagement metrics with tipping integration and crypto-native indicators.

**Features:**

- Tip statistics with leaderboard
- Momentum indicators (bullish/bearish/neutral)
- Quality and reputation scores
- Quick tip modal with preset amounts
- Detailed engagement metrics
- Real-time updates

**Usage:**

```typescript
import { CryptoEngagementBar } from '@/components/forum/enhanced';

<CryptoEngagementBar
  engagement={{
    totalTips: 150,
    uniqueTippers: 12,
    momentum: 'bullish',
    reputationScore: 850,
    qualityScore: 92,
    bookmarks: 45
  }}
  onTip={(amount) => handleTip(amount)}
  onBookmark={() => handleBookmark()}
  showDetailed={true}
/>
```

### 🚀 QuickReactions

Crypto-native reaction system with diamond hands, HODL, and other community reactions.

**Features:**

- 10 crypto-specific reaction types
- Visual feedback for user reactions
- Tip integration for appreciation
- Compact and expanded modes
- Real-time reaction counts
- Animated interactions

**Available Reactions:**

- 💎 Diamond Hands
- 🧻 Paper Hands
- 🚀 HODL
- 🌙 To the Moon
- 🔥 Fire
- 📈 Bullish
- 📉 Bearish
- ❤️ Love
- 🎯 Based
- 💀 NGMI

**Usage:**

```typescript
import { QuickReactions } from '@/components/forum/enhanced';

<QuickReactions
  reactions={reactionsData}
  onReact={(reactionType) => handleReaction(reactionType)}
  onTip={(amount) => handleTip(amount)}
  compact={false}
  showTipIntegration={true}
/>
```

### 📱 MobileForumNavigation

Touch-optimized mobile navigation with swipe gestures and zone discovery.

**Features:**

- Swipe-to-close gesture
- Zone and forum search
- Section-based navigation (Zones/Forums/Bookmarks)
- Touch-friendly interface
- Backdrop blur effects
- Smooth animations

**Usage:**

```typescript
import { MobileForumNavigation } from '@/components/forum/enhanced';

// Automatically renders as fixed overlay on mobile
<MobileForumNavigation />
```

## Design System Integration

### Zone Theming

All components respect the zone-based theming system:

```typescript
const zoneThemes = {
	pit: { gradient: 'from-red-900/40 to-red-700/10', accent: 'text-red-400' },
	mission: { gradient: 'from-blue-900/40 to-blue-700/10', accent: 'text-blue-400' },
	casino: { gradient: 'from-purple-900/40 to-purple-700/10', accent: 'text-purple-400' }
	// ... more themes
};
```

### Animation Patterns

- **Progressive Disclosure**: `height: 0` → `height: auto` with opacity
- **Hover States**: Scale transforms (1.02x) with shadow elevation
- **Loading States**: Staggered fade-in with 0.1s delays
- **Gestures**: Spring physics for natural mobile interactions

### Responsive Breakpoints

- **Mobile First**: All components designed for mobile first
- **Touch Targets**: Minimum 44px for interactive elements
- **Viewport Units**: `100dvh` for mobile viewport handling
- **Adaptive Layouts**: Grid/flex layouts that adapt to screen size

## Performance Optimizations

### React.memo Usage

All components are wrapped with `memo()` for optimal re-rendering:

```typescript
const EnhancedThreadCard = memo(({ thread, onTip, ... }) => {
  // Component logic
});
```

### Framer Motion Optimization

- **layout** prop for automatic layout animations
- **AnimatePresence** for mount/unmount transitions
- **whileHover** for performant hover states
- **Gesture recognition** with proper event handling

### Bundle Size Considerations

- **Tree-shakeable exports** from index.ts
- **Conditional icon imports** to reduce bundle size
- **Lazy loading** for heavy interactive components

## Integration Examples

### Full Thread List Enhancement

```typescript
import { EnhancedThreadCard, CryptoEngagementBar, QuickReactions } from '@/components/forum/enhanced';

function EnhancedThreadList({ threads }) {
  return (
    <div className="space-y-4">
      {threads.map(thread => (
        <div key={thread.id} className="space-y-3">
          <EnhancedThreadCard
            thread={thread}
            onTip={(id, amount) => handleTip(id, amount)}
            onBookmark={(id) => handleBookmark(id)}
          />

          <CryptoEngagementBar
            engagement={thread.engagement}
            onTip={(amount) => handleTip(thread.id, amount)}
            showDetailed={false}
          />

          <QuickReactions
            reactions={thread.reactions}
            onReact={(type) => handleReaction(thread.id, type)}
            compact={true}
          />
        </div>
      ))}
    </div>
  );
}
```

### Zone Discovery Page

```typescript
import { EnhancedZoneCard } from '@/components/forum/enhanced';

function ZoneDiscovery({ zones }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {zones.map(zone => (
        <EnhancedZoneCard
          key={zone.id}
          zone={zone}
          layout="default"
          showStats={true}
          showPreview={true}
          onEnter={(zoneId) => navigate(`/zones/${zone.slug}`)}
        />
      ))}
    </div>
  );
}
```

## TypeScript Support

All components include comprehensive TypeScript definitions:

```typescript
interface EnhancedThreadCardProps {
	thread: {
		id: string;
		title: string;
		slug: string;
		excerpt?: string;
		user: UserProfile;
		zone: ZoneInfo;
		engagement?: EngagementMetrics;
		// ... complete type definitions
	};
	variant?: 'default' | 'compact' | 'featured';
	onTip?: (threadId: string, amount: number) => void;
	onBookmark?: (threadId: string) => void;
}
```

## Browser Support

- **Modern browsers** with ES2020+ support
- **Mobile Safari** with proper viewport handling
- **Chrome/Firefox/Safari** desktop
- **Progressive enhancement** for older browsers

## Contributing

When adding new enhanced components:

1. **Follow naming convention**: `Enhanced[ComponentName].tsx`
2. **Include comprehensive TypeScript types**
3. **Add to index.ts exports**
4. **Document usage patterns in README**
5. **Test mobile responsiveness**
6. **Verify zone theming integration**

---

_Built for Degentalk's crypto-native forum experience with performance, accessibility, and user delight in mind._
