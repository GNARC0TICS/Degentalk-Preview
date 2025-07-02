# Client-Components Manual Review Checklist

Generated: 2025-07-02T06:04:58.840Z

## Items Requiring Manual Review (confidence < 0.9)

### client/src/components/users/UserFilters.tsx

- **Line 98**: `onChange={(e) => updateFilter('minXP', parseInt(e.target.value) || 0)}`
  - Suggested: `					onChange={(e) => updateFilter('minXP', e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/ui/smart-thread-filters.tsx

- **Line 67**: `availableTags?: Array<{ id: number; name: string; slug: string; color?: string }>;`
  - Suggested: `	availableTags?: Array<{ id: EntityId; name: string; slug: string; color?: string }>;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 68**: `availablePrefixes?: Array<{ id: number; name: string; color?: string }>;`
  - Suggested: `	availablePrefixes?: Array<{ id: EntityId; name: string; color?: string }>;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/ui/enhanced-button.tsx

- **Line 86**: `const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);`
  - Suggested: `		const [ripples, setRipples] = React.useState<Array<{ id: EntityId; x: number; y: number }>>([]);`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/social/WhaleWatchDashboard.tsx

- **Line 43**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/social/FriendsManager.tsx

- **Line 55**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 66**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/shoutbox/shoutbox-widget.tsx

- **Line 58**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 67**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 79**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/shoutbox/shoutbox-message-styles.tsx

- **Line 107**: `recipientCount: parseInt(rainMatch[4])`
  - Suggested: `			recipientCount: rainMatch[4] as UserId`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/profile/XpLogView.tsx

- **Line 58**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/profile/UserTitles.tsx

- **Line 9**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 64**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/profile/UserBadges.tsx

- **Line 9**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 64**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/profile/CosmeticControlPanel.tsx

- **Line 23**: `activeFrame?: { id: number; name: string; imageUrl: string; rarity: string } | null; // IDs for frame, title, badge are numbers`
  - Suggested: `	activeFrame?: { id: EntityId; name: string; imageUrl: string; rarity: string } | null; // IDs for frame, title, badge are numbers`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 24**: `activeTitle?: { id: number; name: string; description: string | null; rarity: string } | null; // IDs for frame, title, badge are numbers`
  - Suggested: `	activeTitle?: { id: EntityId; name: string; description: string | null; rarity: string } | null; // IDs for frame, title, badge are numbers`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 26**: `id: number; // IDs for frame, title, badge are numbers`
  - Suggested: `		id: EntityId; // IDs for frame, title, badge are numbers`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/notifications/MentionsNotifications.tsx

- **Line 27**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/missions/DailyMissions.tsx

- **Line 37**: `onClaim: (id: number) => void;`
  - Suggested: `	onClaim: (id: AchievementId) => void;`
  - Confidence: 0.85
  - Import needed: AchievementId

- **Line 37**: `onClaim: (id: number) => void;`
  - Suggested: `	onClaim: (id: EntityId) => void;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/layout/announcement-ticker.tsx

- **Line 20**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/forum/zone-group.tsx

- **Line 51**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 59**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 73**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/forum/forum-card.tsx

- **Line 9**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 18**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/forum/category-card.tsx

- **Line 18**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/forum/ThreadPagination.tsx

- **Line 156**: `const value = parseInt((e.target as HTMLInputElement).value);`
  - Suggested: `								const value = (e.target as HTMLInputElement as UserId.value);`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/forum/RecentActivity.tsx

- **Line 9**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 13**: `id: number;`
  - Suggested: `		id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/forum/HotTopics.tsx

- **Line 9**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/fixtures/fixture-builder.tsx

- **Line 232**: `count: parseInt(e.target.value) || 1`
  - Suggested: `												count: e.target.value as UserId || 1`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/errors/ThreadNotFound.tsx

- **Line 16**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/admin/cooldown-settings.tsx

- **Line 65**: `[field]: typeof value === 'boolean' ? value : Number(value)`
  - Suggested: `			[field]: typeof value === 'boolean' ? value : value as UserId`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/XpActionRow.tsx

- **Line 39**: `onChange={(e) => setXp(Number(e.target.value))}`
  - Suggested: `					onChange={(e) => setXp(e.target.value as UserId)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/ModularAdminSidebar.tsx

- **Line 169**: `grouped[Number(key)].sort((a, b) => a.order - b.order);`
  - Suggested: `			grouped[key as UserId].sort((a, b) => a.order - b.order);`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 378**: `{Number(sectionKey) === 0`
  - Suggested: `								{sectionKey as UserId === 0`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 380**: `: Number(sectionKey) === 1`
  - Suggested: `									: sectionKey as UserId === 1`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 382**: `: Number(sectionKey) === 2`
  - Suggested: `										: sectionKey as UserId === 2`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/platform-energy/stats/platform-stats-widget.tsx

- **Line 31**: `const parsed = typeof num === 'string' ? parseInt(num, 10) : num;`
  - Suggested: `		const parsed = typeof num === 'string' ? num, 10 as UserId : num;`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/platform-energy/leaderboards/weekly-leaderboard.tsx

- **Line 13**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/economy/wallet/tip-button.tsx

- **Line 146**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/economy/wallet/rain-button.tsx

- **Line 174**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 210**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/economy/wallet/DgtPackageCard.tsx

- **Line 31**: `{(Number(originalPrice) - pkg.usdPrice).toFixed(2)})`
  - Suggested: `					{(originalPrice as UserId - pkg.usdPrice).toFixed(2)})`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/economy/badges/UserBadgesDisplay.tsx

- **Line 9**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/economy/shoutbox/enhanced-shoutbox-widget.tsx

- **Line 40**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 50**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 62**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 561**: `onChange={(e) => setSelectedRoom(parseInt(e.target.value))}`
  - Suggested: `							onChange={(e) => setSelectedRoom(e.target.value as UserId)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/wallet/mock-webhook-trigger.tsx

- **Line 58**: `userId: userId ? parseInt(userId) : undefined,`
  - Suggested: `						userId: userId ? userId as UserId : undefined,`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 97**: `if (userId && (isNaN(parseInt(userId)) || parseInt(userId) <= 0)) {`
  - Suggested: `		if (userId && (isNaN(userId as UserId) || userId as UserId <= 0)) {`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 97**: `if (userId && (isNaN(parseInt(userId)) || parseInt(userId) <= 0)) {`
  - Suggested: `		if (userId && (isNaN(userId as UserId) || userId as UserId <= 0)) {`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/roles/RoleForm.tsx

- **Line 91**: `onChange={(e) => handleInputChange('rank', parseInt(e.target.value) || 0)}`
  - Suggested: `						onChange={(e) => handleInputChange('rank', e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/inputs/UnlockMultiSelect.tsx

- **Line 11**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 44**: `const toggle = (id: number) => {`
  - Suggested: `	const toggle = (id: AchievementId) => {`
  - Confidence: 0.85
  - Import needed: AchievementId

- **Line 44**: `const toggle = (id: number) => {`
  - Suggested: `	const toggle = (id: EntityId) => {`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/admin/inputs/AdminAccessSelector.tsx

- **Line 11**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 44**: `const toggleRole = (id: number) => {`
  - Suggested: `	const toggleRole = (id: AchievementId) => {`
  - Confidence: 0.85
  - Import needed: AchievementId

- **Line 44**: `const toggleRole = (id: number) => {`
  - Suggested: `	const toggleRole = (id: EntityId) => {`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/admin/clout/CloutGrantsSection.tsx

- **Line 211**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `														onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/clout/AchievementsSection.tsx

- **Line 164**: `mutationFn: async (data: AchievementForm & { id: number }) => {`
  - Suggested: `		mutationFn: async (data: AchievementForm & { id: EntityId }) => {`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 192**: `mutationFn: async (id: number) => {`
  - Suggested: `		mutationFn: async (id: AchievementId) => {`
  - Confidence: 0.85
  - Import needed: AchievementId

- **Line 192**: `mutationFn: async (id: number) => {`
  - Suggested: `		mutationFn: async (id: EntityId) => {`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 218**: `mutationFn: async (id: number) => {`
  - Suggested: `		mutationFn: async (id: AchievementId) => {`
  - Confidence: 0.85
  - Import needed: AchievementId

- **Line 218**: `mutationFn: async (id: number) => {`
  - Suggested: `		mutationFn: async (id: EntityId) => {`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 521**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 563**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 1)}`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 691**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 733**: `onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}`
  - Suggested: `													onChange={(e) => field.onChange(e.target.value as UserId || 1)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/forms/xp/LevelFormDialogs.tsx

- **Line 49**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

- **Line 109**: `setFormData({ ...formData, level: parseInt(e.target.value, 10) || 1 })`
  - Suggested: `										setFormData({ ...formData, level: e.target.value, 10 as UserId || 1 })`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 122**: `setFormData({ ...formData, xpRequired: parseInt(e.target.value, 10) || 0 })`
  - Suggested: `										setFormData({ ...formData, xpRequired: e.target.value, 10 as UserId || 0 })`
  - Confidence: 0.7
  - Import needed: UserId

- **Line 148**: `setFormData({ ...formData, rewardDgt: parseInt(e.target.value, 10) || 0 })`
  - Suggested: `										setFormData({ ...formData, rewardDgt: e.target.value, 10 as UserId || 0 })`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/forms/xp/BadgeFormDialogs.tsx

- **Line 37**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

### client/src/components/admin/forms/roles/RoleFormDialog.tsx

- **Line 119**: `onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}`
  - Suggested: `											onChange={(e) => field.onChange(e.target.value, 10 as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/admin/forms/reports/ViewReportDialog.tsx

- **Line 34**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId
