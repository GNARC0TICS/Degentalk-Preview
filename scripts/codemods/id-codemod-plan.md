# ID Codemod Plan

Generated 2025-07-01T00:23:14.563Z

## client/src/components/admin/GrantFrameModal.tsx
- [ ] L34: `const grantMutation = useMutation<void, Error, { frameId: number; userIds: string[] }>({` → replace `number` with branded type

## client/src/components/admin/forms/reports/ViewReportDialog.tsx
- [ ] L35: `contentId: number;` → replace `number` with branded type
- [ ] L37: `reportedUserId: number;` → replace `number` with branded type
- [ ] L39: `reporterId: number;` → replace `number` with branded type

## client/src/components/economy/badges/UserBadgesDisplay.tsx
- [ ] L20: `onSelectBadge?: (badgeId: number) => void;` → replace `number` with branded type

## client/src/components/economy/shoutbox/enhanced-shoutbox-widget.tsx
- [ ] L50: `roomId: number;` → replace `number` with branded type
- [ ] L234: `mutationFn: async ({ messageId, isPinned }: { messageId: number; isPinned: boolean }) => {` → replace `number` with branded type
- [ ] L250: `mutationFn: async (messageId: number) => {` → replace `number` with branded type
- [ ] L265: `mutationFn: async ({ userId, ignore }: { userId: number; ignore: boolean }) => {` → replace `number` with branded type

## client/src/components/economy/wallet/PackagesGrid.tsx
- [ ] L12: `const handleBuy = async (pkgId: number) => {` → replace `number` with branded type

## client/src/components/economy/wallet/tip-button.tsx
- [ ] L42: `recipientId: number;` → replace `number` with branded type

## client/src/components/forum/ModeratorActions.tsx
- [ ] L45: `itemId: number;` → replace `number` with branded type

## client/src/components/forum/ReactionBar.tsx
- [ ] L29: `postId: number;` → replace `number` with branded type
- [ ] L41: `onLike?: (postId: number, hasLiked: boolean) => void;` → replace `number` with branded type
- [ ] L42: `onReply?: (postId: number) => void;` → replace `number` with branded type
- [ ] L43: `onQuote?: (postId: number) => void;` → replace `number` with branded type
- [ ] L44: `onEdit?: (postId: number) => void;` → replace `number` with branded type
- [ ] L45: `onDelete?: (postId: number) => void;` → replace `number` with branded type
- [ ] L46: `onMarkSolution?: (postId: number) => void;` → replace `number` with branded type
- [ ] L47: `onTip?: (postId: number) => void;` → replace `number` with branded type
- [ ] L48: `onReport?: (postId: number) => void;` → replace `number` with branded type
- [ ] L49: `onBookmark?: (postId: number) => void;` → replace `number` with branded type
- [ ] L50: `onShare?: (postId: number) => void;` → replace `number` with branded type
- [ ] L51: `onCopyLink?: (postId: number) => void;` → replace `number` with branded type

## client/src/components/forum/ShareButton.tsx
- [ ] L6: `threadId: number | string;` → replace `number` with branded type

## client/src/components/forum/ThreadFilters.tsx
- [ ] L129: `const toggleTag = (tagId: number) => {` → replace `number` with branded type

## client/src/components/forum/bbcode/PostActions.tsx
- [ ] L30: `postId: number;` → replace `number` with branded type
- [ ] L41: `onLike?: (postId: number, hasLiked: boolean) => void;` → replace `number` with branded type
- [ ] L42: `onReply?: (postId: number) => void;` → replace `number` with branded type
- [ ] L43: `onQuote?: (postId: number) => void;` → replace `number` with branded type
- [ ] L44: `onEdit?: (postId: number) => void;` → replace `number` with branded type
- [ ] L45: `onDelete?: (postId: number) => void;` → replace `number` with branded type
- [ ] L46: `onMarkSolution?: (postId: number) => void;` → replace `number` with branded type
- [ ] L47: `onTip?: (postId: number) => void;` → replace `number` with branded type
- [ ] L48: `onReport?: (postId: number) => void;` → replace `number` with branded type
- [ ] L49: `onBookmark?: (postId: number) => void;` → replace `number` with branded type
- [ ] L50: `onShare?: (postId: number) => void;` → replace `number` with branded type
- [ ] L51: `onCopyLink?: (postId: number) => void;` → replace `number` with branded type

## client/src/components/forum/bbcode/PostHeader.tsx
- [ ] L10: `postId: number;` → replace `number` with branded type

## client/src/components/forum/bbcode/QuickReplyBox.tsx
- [ ] L10: `threadId: number;` → replace `number` with branded type

## client/src/components/forum/sidebar/SidebarIntegrationExample.tsx
- [ ] L44: `export const ForumPageSidebar: React.FC<{ structureId: number; zoneSlug: string }> = ({` → replace `number` with branded type
- [ ] L54: `structureId: number;` → replace `number` with branded type

## client/src/components/gamification/leaderboard.tsx
- [ ] L101: `const toggleRowExpansion = (userId: number) => {` → replace `number` with branded type

## client/src/components/gamification/mission-dashboard.tsx
- [ ] L52: `onClaimReward: (missionId: number) => void;` → replace `number` with branded type

## client/src/components/notifications/MentionsNotifications.tsx
- [ ] L152: `const toggleMentionSelection = (mentionId: number) => {` → replace `number` with branded type

## client/src/components/platform-energy/recent-posts/recent-posts-feed.tsx
- [ ] L64: `const toggleExpand = (postId: number) => {` → replace `number` with branded type

## client/src/components/profile/CosmeticControlPanel.tsx
- [ ] L55: `mutationFn: async ({ inventoryId, equip }: { inventoryId: number; equip: boolean }) => {` → replace `number` with branded type
- [ ] L96: `const handleUnequip = (inventoryId: number) => {` → replace `number` with branded type

## client/src/components/profile/UserBadges.tsx
- [ ] L16: `onSelectBadge?: (badgeId: number) => void;` → replace `number` with branded type

## client/src/components/profile/UserTitles.tsx
- [ ] L16: `onSelectTitle?: (titleId: number) => void;` → replace `number` with branded type

## client/src/components/shoutbox/ShoutboxContainer.tsx
- [ ] L27: `userId: number;` → replace `number` with branded type

## client/src/components/shoutbox/shoutbox-widget.tsx
- [ ] L62: `groupId: number; // 1 = admin, 2 = moderator, 3 = regular user` → replace `number` with branded type
- [ ] L199: `mutationFn: async (messageId: number) => {` → replace `number` with branded type
- [ ] L221: `mutationFn: async ({ messageId, isPinned }: { messageId: number; isPinned: boolean }) => {` → replace `number` with branded type

## client/src/components/social/FriendsManager.tsx
- [ ] L180: `requestId: number;` → replace `number` with branded type

## client/src/components/ui/bookmark-button.tsx
- [ ] L12: `threadId: number;` → replace `number` with branded type

## client/src/components/ui/content-area.tsx
- [ ] L344: `export function ForumContentArea({ forumId, ...props }: ContentAreaProps & { forumId: number }) {` → replace `number` with branded type

## client/src/components/ui/reactions-bar.tsx
- [ ] L21: `postId: number;` → replace `number` with branded type

## client/src/contexts/ForumStructureContext.tsx
- [ ] L213: `getThreadContext: (structureId: number) => {` → replace `number` with branded type
- [ ] L247: `function makeMergedForum(api: ApiEntity, parentZoneId: number): MergedForum {` → replace `number` with branded type

## client/src/core/api.ts
- [ ] L141: `toUserId: number,` → replace `number` with branded type
- [ ] L146: `transactionId: number;` → replace `number` with branded type
- [ ] L178: `toUserId: number,` → replace `number` with branded type
- [ ] L185: `tipId: number;` → replace `number` with branded type
- [ ] L222: `transactionId: number;` → replace `number` with branded type
- [ ] L282: `vaultId: number;` → replace `number` with branded type
- [ ] L298: `async unlockVault(vaultId: number): Promise<{` → replace `number` with branded type

## client/src/features/admin/components/dashboard/RainAnalyticsCard.tsx
- [ ] L61: `userId: number;` → replace `number` with branded type

## client/src/features/admin/components/dashboard/TippingAnalyticsCard.tsx
- [ ] L65: `userId: number;` → replace `number` with branded type
- [ ] L72: `userId: number;` → replace `number` with branded type

## client/src/features/admin/services/sticker-api.service.ts
- [ ] L214: `): Promise<ApiResponse<{ stickerId: number; message: string }>> {` → replace `number` with branded type
- [ ] L215: `return apiRequest<ApiResponse<{ stickerId: number; message: string }>>({` → replace `number` with branded type
- [ ] L289: `): Promise<ApiResponse<{ packId: number; message: string }>> {` → replace `number` with branded type
- [ ] L290: `return apiRequest<ApiResponse<{ packId: number; message: string }>>({` → replace `number` with branded type
- [ ] L347: `stickerId: number,` → replace `number` with branded type

## client/src/features/forum/components/CreatePostForm.tsx
- [ ] L25: `threadId: number;` → replace `number` with branded type

## client/src/features/forum/components/LikeButton.tsx
- [ ] L6: `postId: number; // Retained for context, though not directly used in this simplified version` → replace `number` with branded type

## client/src/features/forum/components/ReactionTray.tsx
- [ ] L6: `postId: number; // postId might be used for keys or future data fetching within this component` → replace `number` with branded type

## client/src/features/forum/components/ReplyForm.tsx
- [ ] L16: `threadId: number;` → replace `number` with branded type

## client/src/features/forum/components/ThreadList.tsx
- [ ] L16: `forumId: number;` → replace `number` with branded type

## client/src/features/forum/hooks/useForumMutations.ts
- [ ] L35: `threadId: number;` → replace `number` with branded type
- [ ] L64: `contentId: number;` → replace `number` with branded type
- [ ] L91: `userId: number;` → replace `number` with branded type
- [ ] L93: `entityId: number;` → replace `number` with branded type
- [ ] L132: `userId: number;` → replace `number` with branded type
- [ ] L135: `entityId: number;` → replace `number` with branded type

## client/src/features/forum/hooks/useForumQueries.ts
- [ ] L100: `structureId: number;` → replace `number` with branded type
- [ ] L134: `export const useUpdateThread = (threadId: number | undefined) => {` → replace `number` with branded type
- [ ] L172: `mutationFn: ({ threadId, postId }: { threadId: number; postId?: number }) =>` → replace `number` with branded type
- [ ] L187: `mutationFn: (threadId: number) => forumApi.unsolveThread(threadId),` → replace `number` with branded type
- [ ] L201: `threadId: number | undefined,` → replace `number` with branded type
- [ ] L228: `export const useUpdatePost = (postId: number | undefined) => {` → replace `number` with branded type
- [ ] L262: `mutationFn: ({ postId, reactionType }: { postId: number; reactionType: 'like' | 'dislike' }) =>` → replace `number` with branded type
- [ ] L276: `mutate: (postId: number) => reactToPost.mutate({ postId, reactionType: 'like' })` → replace `number` with branded type
- [ ] L284: `mutate: (postId: number) => reactToPost.mutate({ postId, reactionType: 'dislike' })` → replace `number` with branded type
- [ ] L292: `mutationFn: ({ postId, amount }: { postId: number; amount: number }) =>` → replace `number` with branded type
- [ ] L354: `return useMutation<Tag, Error, { threadId: number; tagId: number }>({` → replace `number` with branded type
- [ ] L367: `return useMutation<void, Error, { threadId: number; tagId: number }>({` → replace `number` with branded type
- [ ] L418: `postId: number;` → replace `number` with branded type
- [ ] L441: `contentId: number;` → replace `number` with branded type

## client/src/features/forum/services/forumApi.ts
- [ ] L140: `structureId: number;` → replace `number` with branded type
- [ ] L155: `threadId: number,` → replace `number` with branded type
- [ ] L173: `deleteThread: async (threadId: number): Promise<{ success: true }> => {` → replace `number` with branded type
- [ ] L184: `solveThread: async (threadId: number, postId?: number): Promise<ThreadWithUser> => {` → replace `number` with branded type
- [ ] L193: `unsolveThread: async (threadId: number): Promise<ThreadWithUser> => {` → replace `number` with branded type
- [ ] L212: `addTagToThread: async (threadId: number, tagId: number): Promise<ForumTag> => {` → replace `number` with branded type
- [ ] L221: `removeTagFromThread: async (threadId: number, tagId: number): Promise<void> => {` → replace `number` with branded type
- [ ] L250: `threadId: number,` → replace `number` with branded type
- [ ] L289: `threadId: number;` → replace `number` with branded type
- [ ] L303: `postId: number,` → replace `number` with branded type
- [ ] L323: `deletePost: async (postId: number): Promise<{ success: true }> => {` → replace `number` with branded type
- [ ] L335: `postId: number,` → replace `number` with branded type
- [ ] L347: `postId: number,` → replace `number` with branded type
- [ ] L375: `bookmarkThread: async (threadId: number): Promise<{ success: true }> => {` → replace `number` with branded type
- [ ] L384: `removeBookmark: async (threadId: number): Promise<{ success: true }> => {` → replace `number` with branded type
- [ ] L437: `contentId: number;` → replace `number` with branded type
- [ ] L440: `}): Promise<{ success: true; message: string; reportId: number }> => {` → replace `number` with branded type
- [ ] L441: `const directResult = await apiRequest<{ success: true; message: string; reportId: number }>({` → replace `number` with branded type

## client/src/features/gamification/services/gamification-api.service.ts
- [ ] L34: `userId: number;` → replace `number` with branded type
- [ ] L77: `userId: number;` → replace `number` with branded type
- [ ] L78: `achievementId: number;` → replace `number` with branded type
- [ ] L107: `userId: number;` → replace `number` with branded type
- [ ] L108: `missionId: number;` → replace `number` with branded type
- [ ] L117: `userId: number;` → replace `number` with branded type
- [ ] L242: `async checkAndAwardAchievements(userId: number, actionType: string, metadata?: any) {` → replace `number` with branded type
- [ ] L298: `async claimMissionReward(missionId: number) {` → replace `number` with branded type
- [ ] L314: `async updateMissionProgress(userId: number, actionType: string, metadata?: any) {` → replace `number` with branded type

## client/src/features/users/services/referralsApi.ts
- [ ] L9: `userId: number;` → replace `number` with branded type
- [ ] L19: `userId: number;` → replace `number` with branded type

## client/src/features/users/services/usersApi.ts
- [ ] L32: `export async function getUserDetails(userId: number | string) {` → replace `number` with branded type

## client/src/hooks/preferences/useUserSettings.ts
- [ ] L20: `activeTitleId: number | null;` → replace `number` with branded type
- [ ] L21: `activeBadgeId: number | null;` → replace `number` with branded type
- [ ] L22: `activeFrameId: number | null;` → replace `number` with branded type
- [ ] L25: `userId: number;` → replace `number` with branded type
- [ ] L34: `userId: number;` → replace `number` with branded type

## client/src/hooks/use-content.ts
- [ ] L98: `export function useForumContent(forumId: number, initialTab: ContentTab = 'recent') {` → replace `number` with branded type

## client/src/hooks/use-gamification.tsx
- [ ] L64: `mutationFn: (missionId: number) => gamificationApi.claimMissionReward(missionId),` → replace `number` with branded type

## client/src/hooks/use-rain.ts
- [ ] L14: `transactionId: number;` → replace `number` with branded type
- [ ] L25: `fromUserId: number;` → replace `number` with branded type

## client/src/hooks/use-tip.ts
- [ ] L6: `toUserId: number;` → replace `number` with branded type
- [ ] L14: `tipId: number;` → replace `number` with branded type
- [ ] L21: `fromUserId: number;` → replace `number` with branded type
- [ ] L22: `toUserId: number;` → replace `number` with branded type

## client/src/hooks/useForumFilters.ts
- [ ] L161: `const toggleTag = useCallback((tagId: number) => {` → replace `number` with branded type

## client/src/hooks/useMissions.ts
- [ ] L28: `userId: number;` → replace `number` with branded type
- [ ] L29: `missionId: number;` → replace `number` with branded type
- [ ] L99: `mutationFn: async (missionId: number) => {` → replace `number` with branded type
- [ ] L104: `missionId: number` → replace `number` with branded type
- [ ] L204: `claimReward: (missionId: number) => claimRewardMutation.mutate(missionId),` → replace `number` with branded type

## client/src/hooks/useUserXP.ts
- [ ] L6: `userId: number;` → replace `number` with branded type

## client/src/hooks/useXP.ts
- [ ] L82: `equipTitle: (titleId: number) => void;` → replace `number` with branded type
- [ ] L138: `mutationFn: async (titleId: number) => {` → replace `number` with branded type
- [ ] L185: `equipTitle: (titleId: number) => equipTitle.mutate(titleId)` → replace `number` with branded type

## client/src/lib/api/achievements.ts
- [ ] L12: `achievementId: number;` → replace `number` with branded type

## client/src/lib/utils/animateNumber.ts
- [ ] L21: `let animationFrameId: number;` → replace `number` with branded type

## client/src/pages/admin/reports/index.tsx
- [ ] L75: `contentId: number;` → replace `number` with branded type
- [ ] L210: `mutationFn: async (data: { userId: number; reason: string; duration?: string }) => {` → replace `number` with branded type
- [ ] L227: `mutationFn: async (data: { contentType: string; contentId: number; reason: string }) => {` → replace `number` with branded type

## client/src/pages/admin/shop/index.tsx
- [ ] L65: `const handleDelete = (productId: number) => {` → replace `number` with branded type

## client/src/pages/admin/shoutbox.tsx
- [ ] L191: `mutationFn: async ({ roomId, updates }: { roomId: number; updates: any }) => {` → replace `number` with branded type
- [ ] L212: `mutationFn: async (roomId: number) => {` → replace `number` with branded type

## client/src/pages/admin/treasury.tsx
- [ ] L31: `settingId: number;` → replace `number` with branded type
- [ ] L44: `userId: number;` → replace `number` with branded type
- [ ] L51: `walletId: number;` → replace `number` with branded type
- [ ] L52: `fromUserId: number | null;` → replace `number` with branded type
- [ ] L53: `toUserId: number | null;` → replace `number` with branded type

## client/src/pages/admin/users/[userId].tsx
- [ ] L44: `const equipMutation = useMutation<any, Error, { inventoryId: number }>({` → replace `number` with branded type
- [ ] L60: `const unequipMutation = useMutation<any, Error, { inventoryId: number }>({` → replace `number` with branded type
- [ ] L83: `const grantItemMutation = useMutation<any, Error, { productId: number }>({` → replace `number` with branded type

## client/src/pages/admin/xp/user-adjustment.tsx
- [ ] L75: `userId: number;` → replace `number` with branded type
- [ ] L203: `const refetchUserInfo = async (userId: number) => {` → replace `number` with branded type

## client/src/pages/forum-rules.tsx
- [ ] L48: `userId: number;` → replace `number` with branded type
- [ ] L49: `ruleId: number;` → replace `number` with branded type
- [ ] L141: `const handleRuleAgreementChange = (ruleId: number, checked: boolean) => {` → replace `number` with branded type

## client/src/pages/mod/reports.tsx
- [ ] L60: `contentId: number;` → replace `number` with branded type
- [ ] L148: `async banUser(userId: string, data: { duration: string; reason: string; reportId: number }) {` → replace `number` with branded type
- [ ] L156: `async deleteContent(contentType: string, contentId: number, reason: string) {` → replace `number` with branded type
- [ ] L231: `contentId: number;` → replace `number` with branded type
- [ ] L317: `const handleQuickAction = (reportId: number, action: string) => {` → replace `number` with branded type

## client/src/pages/shop/avatar-frames.tsx
- [ ] L20: `productId: number;` → replace `number` with branded type
- [ ] L41: `mutationFn: (frameId: number) =>` → replace `number` with branded type
- [ ] L54: `mutationFn: (frameId: number) =>` → replace `number` with branded type
- [ ] L65: `const handleBuy = (frameId: number) => {` → replace `number` with branded type
- [ ] L69: `const handleEquip = (frameId: number) => {` → replace `number` with branded type

## client/src/pages/threads/BBCodeThreadPage.tsx
- [ ] L200: `const handleLike = (postId: number, hasLiked: boolean) => {` → replace `number` with branded type
- [ ] L204: `const handleReply = (postId: number) => {` → replace `number` with branded type
- [ ] L209: `const handleQuote = (postId: number) => {` → replace `number` with branded type
- [ ] L214: `const handleEdit = (postId: number) => {` → replace `number` with branded type
- [ ] L218: `const handleDelete = (postId: number) => {` → replace `number` with branded type
- [ ] L222: `const handleMarkSolution = (postId: number) => {` → replace `number` with branded type
- [ ] L226: `const handleTip = (postId: number) => {` → replace `number` with branded type
- [ ] L230: `const handleReport = (postId: number) => {` → replace `number` with branded type

## client/src/payments/ccpayment/deposit.ts
- [ ] L15: `userId: number;` → replace `number` with branded type

## client/src/payments/ccpayment/swap.ts
- [ ] L14: `userId: number;` → replace `number` with branded type

## client/src/payments/ccpayment/withdraw.ts
- [ ] L15: `userId: number;` → replace `number` with branded type
- [ ] L118: `userId: number,` → replace `number` with branded type

## client/src/payments/shared/index.ts
- [ ] L23: `userId: number;` → replace `number` with branded type

## client/src/types/canonical.types.ts
- [ ] L62: `parentZoneId: number;` → replace `number` with branded type
- [ ] L112: `parentForumId: number;` → replace `number` with branded type
- [ ] L151: `structureId: number; // Forum or subforum ID` → replace `number` with branded type
- [ ] L206: `threadId: number;` → replace `number` with branded type
- [ ] L366: `structureId: number; // Forum or subforum ID` → replace `number` with branded type
- [ ] L376: `threadId: number;` → replace `number` with branded type
- [ ] L399: `getThreadContext: (structureId: number) => {` → replace `number` with branded type

## client/src/types/inventory.ts
- [ ] L21: `productId: number;` → replace `number` with branded type
- [ ] L33: `productId: number;` → replace `number` with branded type

## client/src/types/notifications.ts
- [ ] L6: `userId: number;` → replace `number` with branded type

## client/src/types/payment.types.ts
- [ ] L20: `userId: number;` → replace `number` with branded type
- [ ] L39: `userId: number;` → replace `number` with branded type
- [ ] L56: `userId: number;` → replace `number` with branded type
- [ ] L90: `userId: number;` → replace `number` with branded type

## client/src/types/profile.ts
- [ ] L25: `activeFrameId: number | null;` → replace `number` with branded type
- [ ] L32: `activeTitleId: number | null;` → replace `number` with branded type
- [ ] L40: `activeBadgeId: number | null;` → replace `number` with branded type
- [ ] L65: `productId: number;` → replace `number` with branded type

## client/src/utils/forum-urls.ts
- [ ] L59: `export function getThreadUrlById(threadId: number): string {` → replace `number` with branded type

## scripts/ops/check-forum-config-sync.ts
- [ ] L135: `let expectedParentId: number | undefined;` → replace `number` with branded type

## scripts/seed/seed-all-comprehensive.ts
- [ ] L316: `const parentRows: { parentId: number | null }[] = await db` → replace `number` with branded type

## scripts/templates/transaction-domain-template.ts
- [ ] L265: `async getTransactionHistory(userId: number, params: TransactionQueryParams) {` → replace `number` with branded type
- [ ] L388: `async getTransactionById(userId: number, transactionId: number) {` → replace `number` with branded type
- [ ] L456: `async getTransactionStats(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {` → replace `number` with branded type
- [ ] L567: `userId: number,` → replace `number` with branded type

## scripts/templates/vault-domain-template.ts
- [ ] L253: `async getUserVaults(userId: number) {` → replace `number` with branded type
- [ ] L309: `userId: number,` → replace `number` with branded type
- [ ] L385: `async releaseVault(userId: number, vaultId: number) {` → replace `number` with branded type
- [ ] L477: `async getVaultHistory(userId: number, page: number = 1, limit: number = 10) {` → replace `number` with branded type
- [ ] L954: `userId: number,` → replace `number` with branded type

## scripts/testing/test-xp-system.ts
- [ ] L24: `let userId: number;` → replace `number` with branded type

## server/services/path-service.ts
- [ ] L68: `static async getUserPaths(userId: number): Promise<Array<UserPath & { path: XpPath }>> {` → replace `number` with branded type
- [ ] L103: `static async getUserPrimaryPath(userId: number): Promise<(UserPath & { path: XpPath }) | null> {` → replace `number` with branded type
- [ ] L143: `static async setUserPrimaryPath(userId: number, pathId: string): Promise<boolean> {` → replace `number` with branded type
- [ ] L196: `userId: number,` → replace `number` with branded type
- [ ] L308: `static async getUserPathRank(userId: number, pathId: string): Promise<number | null> {` → replace `number` with branded type

## server/services/tip-service-ccpayment.ts
- [ ] L31: `senderUserId: number,` → replace `number` with branded type
- [ ] L32: `recipientUserId: number,` → replace `number` with branded type
- [ ] L35: `transactionId: number;` → replace `number` with branded type
- [ ] L207: `senderUserId: number,` → replace `number` with branded type
- [ ] L208: `recipientUserId: number,` → replace `number` with branded type
- [ ] L211: `roomId: number,` → replace `number` with branded type
- [ ] L214: `transactionId: number;` → replace `number` with branded type
- [ ] L391: `private async checkCooldowns(userId: number, commandType: 'tip' | 'rain'): Promise<void> {` → replace `number` with branded type
- [ ] L440: `private async updateLastCommandTime(userId: number, commandType: 'tip' | 'rain'): Promise<void> {` → replace `number` with branded type

## server/services/xp-clout-service.ts
- [ ] L44: `async awardPoints(userId: number, actionKey: string, multiplier: number = 1): Promise<boolean> {` → replace `number` with branded type
- [ ] L95: `async checkLevelUp(userId: number): Promise<void> {` → replace `number` with branded type

## server/services/xp-level-service.ts
- [ ] L61: `userId: number,` → replace `number` with branded type
- [ ] L231: `userId: number,` → replace `number` with branded type
- [ ] L297: `userId: number,` → replace `number` with branded type
- [ ] L328: `private async distributeRewards(tx: any, userId: number, level: number): Promise<void> {` → replace `number` with branded type
- [ ] L416: `unlocks.titles.map((titleId: number) => ({` → replace `number` with branded type
- [ ] L430: `unlocks.badges.map((badgeId: number) => ({` → replace `number` with branded type
- [ ] L444: `unlocks.frames.map((frameId: number) => ({` → replace `number` with branded type
- [ ] L475: `async getUserXpInfo(userId: number): Promise<{` → replace `number` with branded type
- [ ] L556: `private async getUserXpMultiplier(userId: number, forumId?: number): Promise<number> {` → replace `number` with branded type

## server/src/core/audit/audit-logger.ts
- [ ] L157: `userId: number | undefined,` → replace `number` with branded type
- [ ] L189: `userId: number,` → replace `number` with branded type
- [ ] L219: `userId: number,` → replace `number` with branded type
- [ ] L274: `userId: number,` → replace `number` with branded type

## server/src/core/repository/interfaces.ts
- [ ] L39: `updateStats(categoryId: number): Promise<void>;` → replace `number` with branded type
- [ ] L45: `findByCategoryId(categoryId: number, options?: QueryOptions): Promise<PaginatedResult<Thread>>;` → replace `number` with branded type
- [ ] L46: `findByAuthorId(authorId: number, options?: QueryOptions): Promise<PaginatedResult<Thread>>;` → replace `number` with branded type
- [ ] L55: `findByThreadId(threadId: number, options?: QueryOptions): Promise<PaginatedResult<Post>>;` → replace `number` with branded type
- [ ] L56: `findByAuthorId(authorId: number, options?: QueryOptions): Promise<PaginatedResult<Post>>;` → replace `number` with branded type
- [ ] L57: `findReplies(parentPostId: number): Promise<Post[]>;` → replace `number` with branded type
- [ ] L65: `findByUserId(userId: number, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;` → replace `number` with branded type
- [ ] L68: `getTotalByUser(userId: number, type?: string): Promise<number>;` → replace `number` with branded type
- [ ] L69: `getBalanceByUser(userId: number): Promise<number>;` → replace `number` with branded type
- [ ] L74: `findByUserId(userId: number): Promise<any>;` → replace `number` with branded type
- [ ] L75: `awardXP(userId: number, amount: number, reason: string): Promise<any>;` → replace `number` with branded type
- [ ] L77: `getUserRank(userId: number): Promise<number>;` → replace `number` with branded type

## server/src/core/repository/repositories/transaction-repository.ts
- [ ] L32: `userId: number,` → replace `number` with branded type
- [ ] L141: `async getTotalByUser(userId: number, type?: string): Promise<number> {` → replace `number` with branded type
- [ ] L179: `async getBalanceByUser(userId: number): Promise<number> {` → replace `number` with branded type
- [ ] L272: `async getUserStats(userId: number): Promise<{` → replace `number` with branded type

## server/src/core/services/user.service.ts
- [ ] L70: `async getUserById(userId: number): Promise<UserProfile | null> {` → replace `number` with branded type
- [ ] L190: `async isActiveUser(userId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L208: `async updateLastActive(userId: number): Promise<void> {` → replace `number` with branded type

## server/src/domains/admin/admin.service.ts
- [ ] L19: `adminId: number,` → replace `number` with branded type
- [ ] L75: `async getUserById(userId: number) {` → replace `number` with branded type

## server/src/domains/admin/shared/admin-operation-utils.ts
- [ ] L97: `adminId: number,` → replace `number` with branded type
- [ ] L103: `adminId: number;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/airdrop/airdrop.service.ts
- [ ] L10: `adminId: number;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/analytics/engagement/rain-analytics.service.ts
- [ ] L29: `userId: number;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/analytics/engagement/tipping-analytics.service.ts
- [ ] L29: `userId: number;` → replace `number` with branded type
- [ ] L38: `userId: number;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/animation-packs/animation-packs.service.ts
- [ ] L26: `async contentsForPack(packId: number) {` → replace `number` with branded type
- [ ] L73: `private async syncItems(packId: number, mediaIds: number[]) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/backup-restore/backup.service.ts
- [ ] L51: `backupId: number;` → replace `number` with branded type
- [ ] L69: `): Promise<{ backupId: number; message: string }> {` → replace `number` with branded type
- [ ] L364: `private async executeBackup(backupId: number, filePath: string, options: CreateBackupInput) {` → replace `number` with branded type
- [ ] L480: `private async executePgDump(args: string[], outputPath: string, backupId: number): Promise<void> {` → replace `number` with branded type
- [ ] L535: `private updateProgress(backupId: number, percent: number, step: string) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/backup-restore/restore.service.ts
- [ ] L61: `async validateRestoreOperation(backupId: number) {` → replace `number` with branded type
- [ ] L310: `dbId: number,` → replace `number` with branded type

## server/src/domains/admin/sub-domains/database/query.service.ts
- [ ] L96: `userId: number;` → replace `number` with branded type
- [ ] L108: `async executeQuery(query: string, userId: number): Promise<QueryResult> {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/email-templates/email-templates.service.ts
- [ ] L306: `async getTemplateVersions(templateId: number) {` → replace `number` with branded type
- [ ] L325: `async restoreVersion(templateId: number, versionId: number, adminId: string) {` → replace `number` with branded type
- [ ] L365: `async getTemplateStats(templateId: number, days: number = 30) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/forum/forum.service.ts
- [ ] L435: `async moderateThread(threadId: number, data: ModerateThreadInput) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/referrals/referrals.service.ts
- [ ] L57: `userId: number;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/reports/reports.service.ts
- [ ] L27: `async function getContentPreview(type: string, contentId: number): Promise<string | null> {` → replace `number` with branded type
- [ ] L173: `async getReportById(reportId: number) {` → replace `number` with branded type
- [ ] L214: `reportId: number,` → replace `number` with branded type
- [ ] L216: `adminUserId: number,` → replace `number` with branded type
- [ ] L259: `async banUser(userIdToBan: number, input: BanUserInput, adminUserId: number) {` → replace `number` with branded type
- [ ] L321: `contentId: number,` → replace `number` with branded type
- [ ] L323: `adminUserId: number` → replace `number` with branded type
- [ ] L326: `let contentAuthorId: number | null = null;` → replace `number` with branded type

## server/src/domains/admin/sub-domains/treasury/treasury.service.ts
- [ ] L79: `async sendFromTreasury(input: TreasuryDepositInput, adminUserId: number) {` → replace `number` with branded type
- [ ] L136: `async recoverToTreasury(input: TreasuryWithdrawalInput, adminUserId: number) {` → replace `number` with branded type
- [ ] L192: `async massAirdrop(input: MassAirdropInput, adminUserId: number) {` → replace `number` with branded type
- [ ] L235: `userId: number;` → replace `number` with branded type
- [ ] L319: `async updateDgtEconomyParameters(input: TreasurySettingsUpdateInput, adminUserId: number) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/user-groups/user-groups.service.ts
- [ ] L48: `async getGroupById(groupId: number) {` → replace `number` with branded type
- [ ] L104: `async updateGroup(groupId: number, data: UserGroupInput) {` → replace `number` with branded type
- [ ] L139: `async deleteGroup(groupId: number) {` → replace `number` with branded type
- [ ] L181: `async getUsersInGroup(groupId: number, params: ListGroupUsersQueryInput) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/users/bulk-operations.service.ts
- [ ] L23: `errors: Array<{ userId: number; error: string }>;` → replace `number` with branded type
- [ ] L29: `adminId: number;` → replace `number` with branded type
- [ ] L36: `adminId: number;` → replace `number` with branded type
- [ ] L284: `adminId: number;` → replace `number` with branded type
- [ ] L378: `async getBulkOperationHistory(adminId: number, limit: number = 50) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/users/users.service.ts
- [ ] L124: `async getUserById(userId: number) {` → replace `number` with branded type
- [ ] L190: `async updateUser(userId: number, userData: Partial<typeof users.$inferInsert>) {` → replace `number` with branded type
- [ ] L309: `async deleteUser(userId: number) {` → replace `number` with branded type
- [ ] L349: `async banUser(userId: number, reason?: string) {` → replace `number` with branded type
- [ ] L400: `async unbanUser(userId: number) {` → replace `number` with branded type
- [ ] L450: `async changeUserRole(userId: number, newRole: string) {` → replace `number` with branded type

## server/src/domains/admin/sub-domains/xp/xp.service.ts
- [ ] L175: `async updateBadge(badgeId: number, badgeData: any) {` → replace `number` with branded type
- [ ] L185: `async deleteBadge(badgeId: number) {` → replace `number` with branded type
- [ ] L204: `async updateTitle(titleId: number, titleData: any) {` → replace `number` with branded type
- [ ] L214: `async deleteTitle(titleId: number) {` → replace `number` with branded type
- [ ] L222: `userId: number,` → replace `number` with branded type
- [ ] L226: `adminId: number` → replace `number` with branded type

## server/src/domains/auth/services/auth.service.ts
- [ ] L99: `export async function verifyEmailToken(token: string): Promise<{ userId: number } | false> {` → replace `number` with branded type
- [ ] L121: `userId: number,` → replace `number` with branded type

## server/src/domains/collectibles/stickers/stickers.service.ts
- [ ] L217: `): Promise<{ stickerId: number; message: string }> {` → replace `number` with branded type
- [ ] L505: `): Promise<{ packId: number; message: string }> {` → replace `number` with branded type
- [ ] L586: `private async updatePackStickerCount(packId: number): Promise<void> {` → replace `number` with branded type

## server/src/domains/cosmetics/avatarFrameStore.service.ts
- [ ] L13: `productId: number;` → replace `number` with branded type
- [ ] L38: `frameId: number` → replace `number` with branded type
- [ ] L41: `frameId: number;` → replace `number` with branded type

## server/src/domains/cosmetics/frameEquip.service.ts
- [ ] L8: `async userOwnsFrame(userId: string, frameId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L18: `async equipFrame(userId: string, frameId: number) {` → replace `number` with branded type
- [ ] L33: `async grantOwnership(userId: string, frameId: number, source: string = 'purchase') {` → replace `number` with branded type

## server/src/domains/dictionary/dictionary.service.ts
- [ ] L124: `static async moderate(entryId: number, status: 'approved' | 'rejected', approverId: string) {` → replace `number` with branded type
- [ ] L150: `static async toggleUpvote(entryId: number, userId: string) {` → replace `number` with branded type

## server/src/domains/economy/services/rewardService.ts
- [ ] L19: `export async function awardXShareReward(userId: number) {` → replace `number` with branded type
- [ ] L35: `export async function awardXReferralReward(userId: number) {` → replace `number` with branded type

## server/src/domains/engagement/airdrop/airdrop.service.ts
- [ ] L21: `adminUserId: number;` → replace `number` with branded type
- [ ] L37: `adminUserId: number;` → replace `number` with branded type
- [ ] L42: `transactionId: number;` → replace `number` with branded type
- [ ] L263: `adminUserId: number,` → replace `number` with branded type
- [ ] L266: `transactionId: number,` → replace `number` with branded type
- [ ] L267: `airdropId: number,` → replace `number` with branded type
- [ ] L414: `async getAirdropDetails(airdropId: number): Promise<any> {` → replace `number` with branded type

## server/src/domains/engagement/engagement.service.ts
- [ ] L36: `fromUserId: number,` → replace `number` with branded type
- [ ] L37: `toUserId: number,` → replace `number` with branded type
- [ ] L69: `fromUserId: number,` → replace `number` with branded type
- [ ] L98: `adminUserId: number,` → replace `number` with branded type
- [ ] L123: `async getUserEngagementStats(userId: number) {` → replace `number` with branded type

## server/src/domains/engagement/rain/rain.service.ts
- [ ] L52: `senderUserId: number,` → replace `number` with branded type
- [ ] L58: `transactionId: number;` → replace `number` with branded type
- [ ] L272: `senderUserId: number,` → replace `number` with branded type
- [ ] L276: `transactionId: number` → replace `number` with branded type
- [ ] L291: `private async getRandomActiveUsers(excludeUserId: number, count: number): Promise<number[]> {` → replace `number` with branded type
- [ ] L371: `private async checkCooldowns(userId: number, commandType: 'tip' | 'rain'): Promise<void> {` → replace `number` with branded type
- [ ] L466: `private async updateLastCommandTime(userId: number, commandType: 'tip' | 'rain'): Promise<void> {` → replace `number` with branded type
- [ ] L519: `async updateRainSettings(userId: number, settings: any) {` → replace `number` with branded type

## server/src/domains/engagement/tip/tip.service.ts
- [ ] L65: `fromUserId: number;` → replace `number` with branded type
- [ ] L66: `toUserId: number;` → replace `number` with branded type
- [ ] L79: `fromUserId: number;` → replace `number` with branded type
- [ ] L80: `toUserId: number;` → replace `number` with branded type
- [ ] L198: `fromUserId: number,` → replace `number` with branded type
- [ ] L199: `toUserId: number,` → replace `number` with branded type
- [ ] L292: `userId: number,` → replace `number` with branded type

## server/src/domains/engagement/vault/vault.service.ts
- [ ] L24: `userId: number;` → replace `number` with branded type
- [ ] L68: `let transactionId: number | null = null; // This will be lockTransactionId in vaults table` → replace `number` with branded type
- [ ] L143: `async unlockTokens(vaultLockId: number): Promise<any> {` → replace `number` with branded type
- [ ] L169: `let unlockTransactionId: number | null = null;` → replace `number` with branded type
- [ ] L273: `async getUserVaultLocks(userId: number): Promise<any[]> {` → replace `number` with branded type
- [ ] L297: `userId: number,` → replace `number` with branded type

## server/src/domains/feature-gates/feature-gates.service.ts
- [ ] L125: `async checkFeatureAccess(userId: number, featureId: string): Promise<UserFeatureAccess> {` → replace `number` with branded type
- [ ] L195: `async checkAllFeatureAccess(userId: number): Promise<UserFeatureAccess[]> {` → replace `number` with branded type

## server/src/domains/forum/forum.service.ts
- [ ] L42: `async function getAllDescendantLeafForumIds(startStructureId: number): Promise<number[]> {` → replace `number` with branded type
- [ ] L53: `{ id: number; parentId: number | null; type: string; children: number[] }` → replace `number` with branded type
- [ ] L181: `async getSubForumsByParentForumId(parentForumId: number): Promise<ForumStructureWithStats[]> {` → replace `number` with branded type
- [ ] L304: `async updateThreadSolvedStatus(params: { threadId: number; solvingPostId?: number | null }) {` → replace `number` with branded type

## server/src/domains/forum/services/category.service.ts
- [ ] L178: `async getCategoryStats(categoryId: number): Promise<{` → replace `number` with branded type

## server/src/domains/forum/services/config.service.ts
- [ ] L97: `parentId: number | null = null` → replace `number` with branded type

## server/src/domains/forum/services/permissions.service.ts
- [ ] L21: `userId: number;` → replace `number` with branded type
- [ ] L45: `export async function isPostOwner(userId: number, postId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L63: `export async function isThreadOwner(userId: number, threadId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L86: `export async function canEditPost(user: User, postId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L100: `export async function canDeletePost(user: User, postId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L114: `export async function canEditThread(user: User, threadId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L128: `export async function canDeleteThread(user: User, threadId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L142: `export async function canSolveThread(user: User, threadId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L156: `export async function canManageThreadTags(user: User, threadId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L170: `export async function canPostInForum(user: User, forumId: number): Promise<boolean> {` → replace `number` with branded type

## server/src/domains/forum/services/post.service.ts
- [ ] L18: `threadId: number;` → replace `number` with branded type
- [ ] L118: `async getPostById(postId: number): Promise<PostWithUser | null> {` → replace `number` with branded type
- [ ] L213: `async updatePost(postId: number, input: PostUpdateInput): Promise<PostWithUser> {` → replace `number` with branded type
- [ ] L247: `async deletePost(postId: number): Promise<void> {` → replace `number` with branded type
- [ ] L271: `async likePost(postId: number, userId: string): Promise<void> {` → replace `number` with branded type
- [ ] L316: `async unlikePost(postId: number, userId: string): Promise<void> {` → replace `number` with branded type
- [ ] L352: `async getPostReplies(parentPostId: number): Promise<PostWithUser[]> {` → replace `number` with branded type
- [ ] L385: `private async updateThreadStats(threadId: number): Promise<void> {` → replace `number` with branded type

## server/src/domains/forum/services/structure.service.ts
- [ ] L205: `async getStructureStats(structureId: number): Promise<{` → replace `number` with branded type

## server/src/domains/forum/services/thread.service.ts
- [ ] L58: `structureId: number;` → replace `number` with branded type
- [ ] L489: `async getThreadById(threadId: number): Promise<ThreadWithUserAndCategory | null> {` → replace `number` with branded type
- [ ] L765: `async incrementViewCount(threadId: number): Promise<void> {` → replace `number` with branded type
- [ ] L785: `async updatePostCount(threadId: number): Promise<void> {` → replace `number` with branded type
- [ ] L812: `threadId: number;` → replace `number` with branded type
- [ ] L846: `private async addTagsToThread(threadId: number, tagNames: string[]): Promise<void> {` → replace `number` with branded type
- [ ] L896: `private async getZoneInfo(structureId: number): Promise<{` → replace `number` with branded type
- [ ] L970: `private async getFirstPostExcerpt(threadId: number): Promise<string | null> {` → replace `number` with branded type
- [ ] L994: `): Promise<Array<{ threadId: number; excerpt: string | null }>> {` → replace `number` with branded type

## server/src/domains/forum/sub-domains/reports/reports.service.ts
- [ ] L12: `contentId: number;` → replace `number` with branded type

## server/src/domains/gamification/achievement.service.ts
- [ ] L48: `userId: number;` → replace `number` with branded type
- [ ] L49: `achievementId: number;` → replace `number` with branded type
- [ ] L118: `async getUserAchievementStats(userId: number): Promise<AchievementStats> {` → replace `number` with branded type
- [ ] L209: `userId: number,` → replace `number` with branded type
- [ ] L279: `userId: number,` → replace `number` with branded type
- [ ] L356: `async awardAchievement(userId: number, achievementId: number): Promise<void> {` → replace `number` with branded type
- [ ] L466: `userId: number,` → replace `number` with branded type
- [ ] L532: `private async countUserPosts(userId: number, timeFilter?: Date): Promise<number> {` → replace `number` with branded type
- [ ] L543: `private async countUserThreads(userId: number, timeFilter?: Date): Promise<number> {` → replace `number` with branded type
- [ ] L554: `private async sumUserXp(userId: number, timeFilter?: Date): Promise<number> {` → replace `number` with branded type
- [ ] L576: `private async calculateLoginStreak(userId: number): Promise<number> {` → replace `number` with branded type
- [ ] L582: `private async countUserTips(userId: number, timeFilter?: Date): Promise<number> {` → replace `number` with branded type
- [ ] L638: `userId: number;` → replace `number` with branded type

## server/src/domains/gamification/achievements/achievement-admin.service.ts
- [ ] L439: `achievementId: number,` → replace `number` with branded type
- [ ] L495: `achievementId: number,` → replace `number` with branded type

## server/src/domains/gamification/achievements/achievement-processor.service.ts
- [ ] L468: `achievementId: number` → replace `number` with branded type

## server/src/domains/gamification/analytics.service.ts
- [ ] L43: `achievementId: number;` → replace `number` with branded type
- [ ] L49: `achievementId: number;` → replace `number` with branded type
- [ ] L107: `userId: number;` → replace `number` with branded type

## server/src/domains/gamification/leveling.service.ts
- [ ] L46: `userId: number;` → replace `number` with branded type
- [ ] L70: `userId: number;` → replace `number` with branded type
- [ ] L154: `async getUserProgression(userId: number): Promise<UserProgression | null> {` → replace `number` with branded type
- [ ] L382: `userId: number,` → replace `number` with branded type

## server/src/domains/missions/missions.service.ts
- [ ] L15: `userId: number;` → replace `number` with branded type
- [ ] L142: `userId: number` → replace `number` with branded type
- [ ] L189: `userId: number,` → replace `number` with branded type
- [ ] L426: `userId: number,` → replace `number` with branded type
- [ ] L427: `missionId: number` → replace `number` with branded type

## server/src/domains/preferences/preferences.service.ts
- [ ] L28: `export const getAllPreferences = async (userId: number) => {` → replace `number` with branded type
- [ ] L84: `userId: number,` → replace `number` with branded type
- [ ] L141: `userId: number,` → replace `number` with branded type
- [ ] L215: `userId: number,` → replace `number` with branded type
- [ ] L281: `userId: number,` → replace `number` with branded type
- [ ] L344: `userId: number,` → replace `number` with branded type
- [ ] L390: `export const createDefaultPreferences = async (userId: number) => {` → replace `number` with branded type

## server/src/domains/profile/profile.service.ts
- [ ] L18: `userId: number; // User ID is a number in the database` → replace `number` with branded type
- [ ] L27: `export async function getUserProfile(userId: number) {` → replace `number` with branded type

## server/src/domains/profile/referrals.service.ts
- [ ] L15: `export async function getUserReferrals(userId: number) {` → replace `number` with branded type
- [ ] L42: `export async function getUserReferralLink(userId: number) {` → replace `number` with branded type

## server/src/domains/profile/signature.service.ts
- [ ] L13: `userId: number;` → replace `number` with branded type
- [ ] L21: `static async getUserSignature(userId: number) {` → replace `number` with branded type
- [ ] L117: `static async getUserSignatureItems(userId: number) {` → replace `number` with branded type
- [ ] L129: `static async purchaseSignatureItem(userId: number, itemId: number) {` → replace `number` with branded type
- [ ] L197: `static async activateSignatureItem(userId: number, itemId: number) {` → replace `number` with branded type

## server/src/domains/share/services/xShareService.ts
- [ ] L10: `userId: number;` → replace `number` with branded type

## server/src/domains/shoutbox/services/cache.service.ts
- [ ] L23: `userId: number | null;` → replace `number` with branded type
- [ ] L24: `roomId: number;` → replace `number` with branded type
- [ ] L38: `userId: number;` → replace `number` with branded type
- [ ] L70: `static async cacheMessages(roomId: number, messages: MessageCacheEntry[]): Promise<void> {` → replace `number` with branded type
- [ ] L83: `static getCachedMessages(roomId: number): MessageCacheEntry[] | null {` → replace `number` with branded type
- [ ] L97: `static invalidateMessages(roomId: number, messageId?: number): void {` → replace `number` with branded type
- [ ] L121: `static cacheUserSession(userId: number, session: UserSessionCache): void {` → replace `number` with branded type
- [ ] L129: `static getCachedUserSession(userId: number): UserSessionCache | null {` → replace `number` with branded type
- [ ] L134: `static updateUserLastSeen(userId: number): void {` → replace `number` with branded type
- [ ] L145: `static invalidateUserSession(userId: number): void {` → replace `number` with branded type
- [ ] L155: `userId: number` → replace `number` with branded type
- [ ] L162: `userId: number,` → replace `number` with branded type
- [ ] L178: `static cacheRoomConfig(roomId: number, config: any): void {` → replace `number` with branded type
- [ ] L186: `static getCachedRoomConfig(roomId: number): any | null {` → replace `number` with branded type
- [ ] L215: `static getCachedRoom(roomId: number): RoomCache | null {` → replace `number` with branded type
- [ ] L220: `static addUserToRoom(roomId: number, userId: number): void {` → replace `number` with branded type
- [ ] L231: `static removeUserFromRoom(roomId: number, userId: number): void {` → replace `number` with branded type
- [ ] L245: `static setTypingIndicator(roomId: number, userId: number, username: string): void {` → replace `number` with branded type
- [ ] L258: `static removeTypingIndicator(roomId: number, userId: number): void {` → replace `number` with branded type
- [ ] L269: `static getTypingIndicators(roomId: number): string[] {` → replace `number` with branded type
- [ ] L282: `private static cleanupTypingIndicators(roomId: number): void {` → replace `number` with branded type

## server/src/domains/shoutbox/services/history.service.ts
- [ ] L47: `userId: number | null;` → replace `number` with branded type
- [ ] L48: `roomId: number;` → replace `number` with branded type

## server/src/domains/shoutbox/services/performance.service.ts
- [ ] L40: `roomId: number;` → replace `number` with branded type
- [ ] L210: `userId: number;` → replace `number` with branded type
- [ ] L211: `roomId: number;` → replace `number` with branded type
- [ ] L278: `static async getActiveUsersInRoom(roomId: number): Promise<` → replace `number` with branded type

## server/src/domains/shoutbox/services/queue.service.ts
- [ ] L17: `userId: number;` → replace `number` with branded type
- [ ] L18: `roomId: number;` → replace `number` with branded type

## server/src/domains/shoutbox/services/room.service.ts
- [ ] L146: `roomId: number,` → replace `number` with branded type
- [ ] L254: `roomId: number,` → replace `number` with branded type
- [ ] L415: `static async getRoomStats(roomId: number): Promise<{` → replace `number` with branded type
- [ ] L490: `userId: number,` → replace `number` with branded type
- [ ] L491: `roomId: number` → replace `number` with branded type
- [ ] L554: `static async getUserIgnoreList(userId: number, roomId?: number): Promise<number[]> {` → replace `number` with branded type
- [ ] L581: `userId: number,` → replace `number` with branded type
- [ ] L582: `ignoredUserId: number,` → replace `number` with branded type
- [ ] L627: `userId: number,` → replace `number` with branded type
- [ ] L628: `ignoredUserId: number,` → replace `number` with branded type
- [ ] L659: `private static async createRoomConfig(roomId: number, roomData: CreateRoomData): Promise<void> {` → replace `number` with branded type
- [ ] L677: `roomId: number,` → replace `number` with branded type
- [ ] L726: `static async reorderRooms(roomOrders: { roomId: number; order: number }[]): Promise<{` → replace `number` with branded type

## server/src/domains/shoutbox/services/shoutbox.service.ts
- [ ] L29: `userId: number;` → replace `number` with branded type
- [ ] L31: `roomId: number;` → replace `number` with branded type
- [ ] L854: `private static async createSystemMessage(roomId: number, content: string): Promise<void> {` → replace `number` with branded type
- [ ] L870: `private static async getActiveRoomUsers(roomId: number): Promise<any[]> {` → replace `number` with branded type

## server/src/domains/shoutbox/shoutbox.routes.ts
- [ ] L35: `async function userHasRoomAccess(userId: number, roomId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L301: `let targetRoomId: number | null = roomId;` → replace `number` with branded type

## server/src/domains/social/follows.service.ts
- [ ] L277: `static async respondToFollowRequest(requestId: number, approve: boolean) {` → replace `number` with branded type

## server/src/domains/social/friends.service.ts
- [ ] L83: `static async respondToFriendRequest(requestId: number, response: 'accept' | 'decline' | 'block') {` → replace `number` with branded type

## server/src/domains/subscriptions/subscription.service.ts
- [ ] L42: `cosmeticId: number;` → replace `number` with branded type
- [ ] L187: `async cancelSubscription(userId: string, subscriptionId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L232: `async renewSubscription(subscriptionId: number): Promise<boolean> {` → replace `number` with branded type

## server/src/domains/wallet/ccpayment.service.ts
- [ ] L219: `async createCcPaymentWalletForUser(userId: number): Promise<string> {` → replace `number` with branded type

## server/src/domains/wallet/dgt.service.ts
- [ ] L43: `walletId: number;` → replace `number` with branded type
- [ ] L57: `transactionId: number;` → replace `number` with branded type

## server/src/domains/wallet/user-management.service.ts
- [ ] L132: `coinId: number;` → replace `number` with branded type

## server/src/domains/wallet/wallet.service.ts
- [ ] L40: `coinId: number;` → replace `number` with branded type
- [ ] L112: `coinId: number;` → replace `number` with branded type
- [ ] L143: `coinId: number;` → replace `number` with branded type
- [ ] L196: `coinId: number;` → replace `number` with branded type
- [ ] L246: `fromCoinId: number;` → replace `number` with branded type
- [ ] L247: `toCoinId: number;` → replace `number` with branded type
- [ ] L380: `transactionId: number;` → replace `number` with branded type
- [ ] L468: `coinId: number;` → replace `number` with branded type

## server/src/domains/xp/events/xp.events.ts
- [ ] L33: `userId: number,` → replace `number` with branded type
- [ ] L136: `userId: number,` → replace `number` with branded type
- [ ] L285: `userId: number,` → replace `number` with branded type

## server/src/domains/xp/xp.events.ts
- [ ] L13: `public userId: number,` → replace `number` with branded type
- [ ] L25: `public userId: number,` → replace `number` with branded type
- [ ] L37: `public userId: number,` → replace `number` with branded type

## server/src/domains/xp/xp.service.ts
- [ ] L44: `userId: number,` → replace `number` with branded type
- [ ] L153: `userId: number,` → replace `number` with branded type
- [ ] L154: `adminId: number,` → replace `number` with branded type
- [ ] L204: `async getUserXpInfo(userId: number) {` → replace `number` with branded type
- [ ] L261: `async awardXp(userId: number, action: XP_ACTION, metadata?: any) {` → replace `number` with branded type
- [ ] L274: `async awardXpWithContext(userId: number, action: XP_ACTION, metadata?: any, forumId?: number) {` → replace `number` with branded type
- [ ] L361: `private async checkActionLimits(userId: number, action: XP_ACTION): Promise<boolean> {` → replace `number` with branded type
- [ ] L428: `private async updateActionLimits(userId: number, action: XP_ACTION): Promise<void> {` → replace `number` with branded type
- [ ] L430: `// private async updateActionLimits(userId: number, action: XP_ACTION): Promise<void> {` → replace `number` with branded type
- [ ] L446: `userId: number,` → replace `number` with branded type
- [ ] L475: `userId: number,` → replace `number` with branded type
- [ ] L563: `private async getUserRoleMultiplier(userId: number): Promise<number> {` → replace `number` with branded type
- [ ] L585: `private async getForumMultiplier(forumId: number): Promise<number> {` → replace `number` with branded type

## server/src/middleware/mission-progress.ts
- [ ] L55: `userId: number,` → replace `number` with branded type

## server/storage.ts
- [ ] L89: `getUsersInGroup(groupId: number): Promise<User[]>;` → replace `number` with branded type
- [ ] L111: `getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]>;` → replace `number` with branded type
- [ ] L112: `agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void>;` → replace `number` with branded type
- [ ] L129: `createThread(thread: InsertThread & { userId: number }): Promise<Thread>;` → replace `number` with branded type
- [ ] L134: `getDraftsByUser(userId: number, structureId?: number): Promise<ThreadDraft[]>;` → replace `number` with branded type
- [ ] L142: `getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>>;` → replace `number` with branded type
- [ ] L145: `getPosts(threadId: number, limit?: number, offset?: number): Promise<PostWithUser[]>;` → replace `number` with branded type
- [ ] L147: `createPost(post: InsertPost & { userId: number; isFirstPost?: boolean }): Promise<Post>;` → replace `number` with branded type
- [ ] L148: `updatePost(id: number, postData: Partial<Post> & { editorId: number }): Promise<Post>;` → replace `number` with branded type
- [ ] L152: `addReaction(userId: number, postId: number, reaction: string): Promise<void>;` → replace `number` with branded type
- [ ] L153: `removeReaction(userId: number, postId: number, reaction: string): Promise<void>;` → replace `number` with branded type
- [ ] L156: `getNotifications(userId: number, limit?: number, offset?: number): Promise<Notification[]>;` → replace `number` with branded type
- [ ] L165: `getAvailableEmojisForUser(userId: number): Promise<EmojiWithAvailability[]>;` → replace `number` with branded type
- [ ] L166: `unlockEmojiForUser(userId: number, emojiId: number): Promise<void>;` → replace `number` with branded type
- [ ] L174: `purchaseProduct(userId: number, productId: number, quantity?: number): Promise<Order>;` → replace `number` with branded type
- [ ] L178: `userId: number` → replace `number` with branded type
- [ ] L188: `conversationId: number,` → replace `number` with branded type
- [ ] L193: `conversationId: number;` → replace `number` with branded type
- [ ] L194: `senderId: number;` → replace `number` with branded type
- [ ] L199: `markMessagesAsRead(conversationId: number, userId: number): Promise<void>;` → replace `number` with branded type
- [ ] L202: `addUserXp(userId: number, amount: number, path?: string): Promise<void>;` → replace `number` with branded type
- [ ] L203: `getUserPathXp(userId: number, path?: string): Promise<Record<string, number>>;` → replace `number` with branded type
- [ ] L204: `recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>>;` → replace `number` with branded type
- [ ] L207: `getUserInventory(userId: number): Promise<UserInventoryItem[]>;` → replace `number` with branded type
- [ ] L208: `checkUserOwnsProduct(userId: number, productId: number): Promise<boolean>;` → replace `number` with branded type
- [ ] L211: `userId: number,` → replace `number` with branded type
- [ ] L212: `productId: number,` → replace `number` with branded type
- [ ] L216: `userId: number;` → replace `number` with branded type
- [ ] L217: `productId: number;` → replace `number` with branded type
- [ ] L387: `async storeVerificationToken(userId: number, token: string): Promise<void> {` → replace `number` with branded type
- [ ] L695: `async createThread(thread: InsertThread & { userId: number }): Promise<Thread> {` → replace `number` with branded type
- [ ] L761: `async getDraftsByUser(userId: number, structureId?: number): Promise<ThreadDraft[]> {` → replace `number` with branded type
- [ ] L880: `async getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>> {` → replace `number` with branded type
- [ ] L909: `async getPosts(threadId: number, limit = 20, offset = 0): Promise<PostWithUser[]> {` → replace `number` with branded type
- [ ] L936: `async createPost(post: InsertPost & { userId: number; isFirstPost?: boolean }): Promise<Post> {` → replace `number` with branded type
- [ ] L968: `async updatePost(id: number, postData: Partial<Post> & { editorId: number }): Promise<Post> {` → replace `number` with branded type
- [ ] L1070: `async addReaction(userId: number, postId: number, reaction: string): Promise<void> {` → replace `number` with branded type
- [ ] L1108: `async removeReaction(userId: number, postId: number, reaction: string): Promise<void> {` → replace `number` with branded type
- [ ] L1167: `async getNotifications(userId: number, limit = 20, offset = 0): Promise<Notification[]> {` → replace `number` with branded type
- [ ] L1242: `async getAvailableEmojisForUser(userId: number): Promise<EmojiWithAvailability[]> {` → replace `number` with branded type
- [ ] L1286: `async unlockEmojiForUser(userId: number, emojiId: number): Promise<void> {` → replace `number` with branded type
- [ ] L1316: `async getUsersInGroup(groupId: number): Promise<User[]> {` → replace `number` with branded type
- [ ] L1397: `async getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]> {` → replace `number` with branded type
- [ ] L1405: `async agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void> {` → replace `number` with branded type
- [ ] L1667: `async purchaseProduct(userId: number, productId: number, quantity: number = 1): Promise<Order> {` → replace `number` with branded type
- [ ] L1795: `userId: number` → replace `number` with branded type
- [ ] L1905: `conversationId: number,` → replace `number` with branded type
- [ ] L1923: `conversationId: number;` → replace `number` with branded type
- [ ] L1924: `senderId: number;` → replace `number` with branded type
- [ ] L1997: `async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {` → replace `number` with branded type
- [ ] L2036: `async addUserXp(userId: number, amount: number, path?: string): Promise<void> {` → replace `number` with branded type
- [ ] L2123: `async getUserPathXp(userId: number, path?: string): Promise<Record<string, number>> {` → replace `number` with branded type
- [ ] L2144: `async recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>> {` → replace `number` with branded type
- [ ] L2203: `async getUserInventory(userId: number): Promise<UserInventoryItem[]> {` → replace `number` with branded type
- [ ] L2225: `async checkUserOwnsProduct(userId: number, productId: number): Promise<boolean> {` → replace `number` with branded type
- [ ] L2238: `let transactionId: number | null = null;` → replace `number` with branded type
- [ ] L2293: `userId: number,` → replace `number` with branded type
- [ ] L2294: `productId: number,` → replace `number` with branded type
- [ ] L2307: `userId: number` → replace `number` with branded type
- [ ] L2317: `userId: number;` → replace `number` with branded type
- [ ] L2318: `productId: number;` → replace `number` with branded type

## server/utils/dgt-wallet-integration.ts
- [ ] L74: `userId: number;` → replace `number` with branded type
- [ ] L163: `userId: number;` → replace `number` with branded type
- [ ] L220: `static async getUserDgtPurchaseHistory(userId: number, limit = 20, offset = 0) {` → replace `number` with branded type

## server/utils/path-utils.ts
- [ ] L24: `categoryId: number,` → replace `number` with branded type

## server/utils/platform-energy.ts
- [ ] L193: `export async function featureThread(threadId: number, userId: number, expiresAt?: Date) {` → replace `number` with branded type
- [ ] L206: `export async function unfeatureThread(threadId: number) {` → replace `number` with branded type

## server/utils/wallet-utils.ts
- [ ] L47: `transactionId: number,` → replace `number` with branded type
- [ ] L114: `transactionId: number,` → replace `number` with branded type

## server/utils/walletEngine.ts
- [ ] L41: `fromUserId: number;` → replace `number` with branded type
- [ ] L42: `toUserId: number;` → replace `number` with branded type
- [ ] L59: `static async getUserWallet(userId: number): Promise<UserWallet | null> {` → replace `number` with branded type
- [ ] L101: `userId: number,` → replace `number` with branded type
- [ ] L140: `static async getDgtUnlockById(unlockId: number): Promise<DgtUnlock | null> {` → replace `number` with branded type
- [ ] L162: `userId: number` → replace `number` with branded type
- [ ] L193: `static async purchaseDgtUnlock(userId: number, unlockId: number): Promise<DgtPurchaseResult> {` → replace `number` with branded type
- [ ] L541: `userId: number,` → replace `number` with branded type
- [ ] L622: `userId: number,` → replace `number` with branded type

## shared/fixtures/utilities/scenario-generator.ts
- [ ] L511: `private generateWhaleTransactions(whaleId: number): any[] {` → replace `number` with branded type
- [ ] L522: `private generateWhaleTips(whaleId: number, userIds: number[]): any[] {` → replace `number` with branded type
- [ ] L552: `private generateOnboardingProgression(userId: number): any[] {` → replace `number` with branded type
- [ ] L587: `private generateSettingsChanges(adminId: number): any[] {` → replace `number` with branded type
- [ ] L623: `private generateMarketReactionData(users: any[], threadId: number): any {` → replace `number` with branded type

## shared/fixtures/utilities/test-helpers.ts
- [ ] L259: `generateRealisticPosts(threadId: number, userIds: number[], count: number = 10): any[] {` → replace `number` with branded type
- [ ] L315: `private generateAdminActions(adminId: number, users: any[]): any[] {` → replace `number` with branded type

## shared/lib/emoji/unlockEmojiPack.ts
- [ ] L6: `userId: number;` → replace `number` with branded type
- [ ] L7: `emojiPackId: number;` → replace `number` with branded type

## shared/lib/mentions/createMentionsIndex.ts
- [ ] L10: `sourceId: number;` → replace `number` with branded type

## shared/lib/moderation/applyModerationAction.ts
- [ ] L14: `moderatorId: number;` → replace `number` with branded type
- [ ] L16: `targetId: number;` → replace `number` with branded type

## shared/path-config.ts
- [ ] L107: `export function getPathForCategory(categoryId: number): string | undefined {` → replace `number` with branded type

