# Client-Components Manual Review Checklist

Generated: 2025-07-02T08:22:55.710Z

## Items Requiring Manual Review (confidence < 0.9)

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

### client/src/components/forum/ThreadPagination.tsx

- **Line 156**: `const value = parseInt((e.target as HTMLInputElement).value);`
  - Suggested: `								const value = (e.target as HTMLInputElement as UserId.value);`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/fixtures/fixture-builder.tsx

- **Line 232**: `count: parseInt(e.target.value) || 1`
  - Suggested: `												count: e.target.value as UserId || 1`
  - Confidence: 0.7
  - Import needed: UserId

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

### client/src/components/users/UserFilters.tsx

- **Line 98**: `onChange={(e) => updateFilter('minXP', parseInt(e.target.value) || 0)}`
  - Suggested: `					onChange={(e) => updateFilter('minXP', e.target.value as UserId || 0)}`
  - Confidence: 0.7
  - Import needed: UserId

### client/src/components/platform-energy/stats/platform-stats-widget.tsx

- **Line 31**: `const parsed = typeof num === 'string' ? parseInt(num, 10) : num;`
  - Suggested: `		const parsed = typeof num === 'string' ? num, 10 as UserId : num;`
  - Confidence: 0.7
  - Import needed: UserId

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

### client/src/components/economy/shoutbox/enhanced-shoutbox-widget.tsx

- **Line 50**: `id: number;`
  - Suggested: `	id: EntityId;`
  - Confidence: 0.6
  - Import needed: EntityId

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
