# Gamification System Frontend

Complete React frontend implementation for the Degentalk gamification system.

## 🎮 Overview

The gamification frontend provides an engaging user experience for:

- **Leveling & Progression** - Visual level displays, XP tracking, and progress bars
- **Achievements** - Interactive achievement cards with progress tracking
- **Missions & Quests** - Daily/weekly missions with reward claiming
- **Leaderboards** - Competitive rankings and social comparison
- **Profile Integration** - Gamification widgets for user profiles

## 📁 Architecture

```
client/src/
├── features/gamification/
│   ├── services/
│   │   └── gamification-api.service.ts    # API client
│   └── README.md
├── hooks/
│   └── use-gamification.ts                # Main React hook
├── components/gamification/
│   ├── level-display.tsx                  # Level badges and indicators
│   ├── progression-card.tsx               # Comprehensive progression display
│   ├── achievement-card.tsx               # Individual achievement display
│   ├── achievement-grid.tsx               # Achievement collection view
│   ├── mission-card.tsx                   # Mission progress and claiming
│   ├── mission-dashboard.tsx              # Mission management interface
│   ├── leaderboard.tsx                    # Ranking tables and competition
│   ├── profile-gamification-widget.tsx    # Profile integration
│   ├── level-up-modal.tsx                 # Level-up celebrations
│   ├── achievement-unlock-modal.tsx       # Achievement notifications
│   └── index.ts                           # Component exports
└── pages/
    └── gamification.tsx                   # Main gamification hub
```

## 🚀 Quick Start

### 1. Import Components

```tsx
import {
	ProgressionCard,
	AchievementGrid,
	MissionDashboard,
	Leaderboard
} from '@/components/gamification';
```

### 2. Use the Main Hook

```tsx
import { useGamification } from '@/hooks/use-gamification';

function MyComponent() {
	const { progression, achievements, missions, claimMissionReward, isLoading } = useGamification();

	if (isLoading) return <div>Loading...</div>;

	return (
		<div>
			<ProgressionCard progression={progression} />
			<AchievementGrid achievements={achievements.all} categories={achievements.grouped} />
		</div>
	);
}
```

### 3. Add to Profile

```tsx
import { ProfileGamificationWidget } from '@/components/gamification';

function UserProfile({ user }) {
	return (
		<div>
			{/* Other profile content */}
			<ProfileGamificationWidget progression={user.progression} isOwnProfile={true} />
		</div>
	);
}
```

## 🎯 Core Components

### Level Display

Visual level indicators with rarity-based styling and animations.

```tsx
<LevelDisplay
	level={25}
	rarity="epic"
	size="lg"
	showTitle={true}
	levelTitle="Forum Veteran"
	animated={true}
/>
```

**Props:**

- `level` - User's current level
- `rarity` - Level rarity for styling (common, rare, epic, legendary, mythic)
- `size` - Display size (sm, md, lg, xl)
- `showTitle` - Whether to show level title
- `animated` - Enable hover animations

### Progression Card

Comprehensive progression overview with level progress, stats, and recent activity.

```tsx
<ProgressionCard
	progression={userProgression}
	variant="full"
	onViewDetails={() => router.push('/achievements')}
/>
```

**Features:**

- Animated progress bars
- Level milestone rewards preview
- Recent achievements display
- Weekly XP tracking
- Navigation shortcuts

### Achievement Grid

Filterable grid of achievements with progress tracking and category organization.

```tsx
<AchievementGrid
	achievements={allAchievements}
	categories={groupedByCategory}
	stats={completionStats}
	onAchievementClick={handleAchievementClick}
/>
```

**Features:**

- Category-based filtering
- Completion status filtering
- Progress sorting options
- Rarity-based visual styling
- Click handlers for detailed views

### Mission Dashboard

Complete mission management interface with claiming functionality.

```tsx
<MissionDashboard
	missions={missionData}
	onClaimReward={handleClaimReward}
	isClaimingReward={isLoading}
	streak={dailyStreak}
/>
```

**Features:**

- Daily/weekly mission separation
- Progress tracking
- Reward claiming with animations
- Streak display
- Mission statistics

### Leaderboard

Competitive ranking display with multiple sorting options.

```tsx
<Leaderboard
	entries={leaderboardData}
	currentUserId={user.id}
	type="xp"
	onTypeChange={setLeaderboardType}
/>
```

**Features:**

- Multiple ranking types (XP, level, weekly, monthly)
- Top 3 showcase with special styling
- Current user highlighting
- Trend indicators
- Profile navigation

## 🎨 Visual Design

### Rarity System

Components use a consistent rarity-based color system:

- **Common** - Emerald/Green
- **Rare** - Blue/Cyan
- **Epic** - Purple/Pink
- **Legendary** - Amber/Gold
- **Mythic** - Red/Orange

### Animation Framework

Built with **Framer Motion** for smooth, engaging animations:

- Progress bar fills
- Level-up celebrations
- Achievement unlocks
- Hover effects
- Loading states

### Responsive Design

All components are fully responsive with:

- Mobile-first design
- Grid-based layouts
- Collapsible sections
- Touch-friendly interactions

## 🔧 API Integration

### Service Layer

The `GamificationApiService` provides typed methods for all API interactions:

```tsx
import { gamificationApi } from '@/features/gamification/services/gamification-api.service';

// Get user progression
const progression = await gamificationApi.getUserProgression();

// Claim mission reward
const result = await gamificationApi.claimMissionReward(missionId);

// Check for achievements
const awarded = await gamificationApi.checkAndAwardAchievements(userId, 'posts_created', {
	postId: 123
});
```

### React Query Integration

The `useGamification` hook handles:

- Automatic data fetching
- Cache management
- Optimistic updates
- Error handling
- Loading states

```tsx
const {
	progression, // User progression data
	achievements, // Achievement progress
	missions, // Mission status
	claimMissionReward, // Mutation function
	isLoading // Loading state
} = useGamification();
```

## 🎉 Interactive Features

### Celebration Modals

**Level Up Modal**

- Confetti animations
- Reward showcase
- Progression visualization
- Share functionality

**Achievement Unlock Modal**

- Rarity-based styling
- Animated reveals
- Reward details
- Social sharing

### Real-time Updates

- Progress bar animations
- Achievement notifications
- Mission completion alerts
- XP gain feedback

### Gamification Actions

Automatic tracking of user actions:

```tsx
// Trigger after user posts
await checkAchievements({
	actionType: 'posts_created',
	metadata: { postId, forumId }
});

// Update mission progress
await updateMissionProgress({
	actionType: 'LOGIN',
	metadata: { timestamp: new Date() }
});
```

## 🔄 State Management

### Cache Strategy

- **Progression**: 5-minute cache with periodic refetch
- **Achievements**: 5-minute cache, invalidated on unlock
- **Missions**: 2-minute cache for frequent updates
- **Leaderboard**: 10-minute cache for performance

### Optimistic Updates

- Mission reward claiming
- Achievement progress
- XP gain visualization
- Progress bar updates

## 📱 Mobile Experience

- Touch-friendly interactions
- Swipe gestures for navigation
- Optimized modal presentations
- Responsive grid layouts
- Performance-optimized animations

## 🎯 Usage Examples

### Profile Integration

```tsx
function UserProfile({ userId }) {
	const { progression } = useGamification();

	return (
		<div className="profile-layout">
			<ProfileGamificationWidget
				progression={progression}
				isOwnProfile={userId === currentUser.id}
			/>
		</div>
	);
}
```

### Sidebar Widget

```tsx
function Sidebar() {
	const { missions, getClaimableMissions } = useGamification();
	const claimable = getClaimableMissions();

	return (
		<aside>
			{claimable.length > 0 && (
				<MissionCard mission={claimable[0]} size="sm" onClaim={handleClaim} />
			)}
		</aside>
	);
}
```

### Action Triggers

```tsx
function CreatePostForm() {
	const { checkAchievements } = useGamification();

	const handleSubmit = async (postData) => {
		const post = await createPost(postData);

		// Check for achievements
		await checkAchievements({
			actionType: 'posts_created',
			metadata: { postId: post.id }
		});
	};
}
```

## 🚀 Performance

- **Component lazy loading** for large grids
- **Virtual scrolling** for leaderboards
- **Image optimization** for achievement icons
- **Animation throttling** on lower-end devices
- **Bundle splitting** for gamification features

The gamification frontend provides a complete, engaging experience that encourages user participation while maintaining excellent performance and user experience standards.
