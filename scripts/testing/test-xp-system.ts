import type { HeatEventId } from '@shared/types';
import type { ActionId } from '@shared/types';
import type { AuditLogId } from '@shared/types';
import type { EventId } from '@shared/types';
import type { PrefixId } from '@shared/types';
import type { MessageId } from '@shared/types';
import type { FollowRequestId } from '@shared/types';
import type { FriendRequestId } from '@shared/types';
import type { NotificationId } from '@shared/types';
import type { UnlockId } from '@shared/types';
import type { StoreItemId } from '@shared/types';
import type { OrderId } from '@shared/types';
import type { QuoteId } from '@shared/types';
import type { ReplyId } from '@shared/types';
import type { DraftId } from '@shared/types';
import type { IpLogId } from '@shared/types';
import type { ModActionId } from '@shared/types';
import type { SessionId } from '@shared/types';
import type { BanId } from '@shared/types';
import type { VerificationTokenId } from '@shared/types';
import type { SignatureItemId } from '@shared/types';
import type { ContentId } from '@shared/types';
import type { RequestId } from '@shared/types';
import type { ZoneId } from '@shared/types';
import type { WhaleId } from '@shared/types';
import type { VaultLockId } from '@shared/types';
import type { VaultId } from '@shared/types';
import type { UnlockTransactionId } from '@shared/types';
import type { TipId } from '@shared/types';
import type { TemplateId } from '@shared/types';
import type { TagId } from '@shared/types';
import type { SubscriptionId } from '@shared/types';
import type { StickerId } from '@shared/types';
import type { SettingId } from '@shared/types';
import type { RuleId } from '@shared/types';
import type { ParentZoneId } from '@shared/types';
import type { ParentForumId } from '@shared/types';
import type { PackId } from '@shared/types';
import type { ModeratorId } from '@shared/types';
import type { MentionId } from '@shared/types';
import type { ItemId } from '@shared/types';
import type { InventoryId } from '@shared/types';
import type { GroupId } from '@shared/types';
import type { ForumId } from '@shared/types';
import type { EntryId } from '@shared/types';
import type { EntityId } from '@shared/types';
import type { EmojiPackId } from '@shared/types';
import type { EditorId } from '@shared/types';
import type { CosmeticId } from '@shared/types';
import type { AuthorId } from '@shared/types';
import type { CoinId } from '@shared/types';
import type { CategoryId } from '@shared/types';
import type { BackupId } from '@shared/types';
import type { AnimationFrameId } from '@shared/types';
import type { AirdropId } from '@shared/types';
import type { AdminUserId } from '@shared/types';
import type { RoomId } from '@shared/types';
import type { ConversationId } from '@shared/types';
import type { ReportId } from '@shared/types';
import type { ReporterId } from '@shared/types';
import type { AdminId } from '@shared/types';
import { db } from '@db';
import { users, levels, userTitles, userBadges } from '../shared/schema';
import { xpLevelService, XP_ACTIONS } from '../server/services/xp-level-service';
import { eq } from 'drizzle-orm';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Test the XP system with a test user
 */
async function testXpSystem() {
  console.log('🧪 Starting XP System Test');
  
  try {
    // Step 1: Check if test user exists or create one
    const testUser = await db.select()
      .from(users)
      .where(eq(users.username, 'xp_test_user'))
      .limit(1);
    
    let userId: number;
    
    if (testUser.length === 0) {
      console.log('Creating test user...');
      const [newUser] = await db.insert(users)
        .values({
          username: 'xp_test_user',
          email: 'xp_test@example.com',
          password: 'test_hash',
          xp: 0,
          level: 1,
          clout: 0,
          dgtPoints: 0,
          dgtWalletBalance: 1000 * 1000000,
          role: 'user'
        })
        .returning({ id: users.id });
        
      userId = newUser.id;
      console.log(`Created test user with ID ${userId}`);
    } else {
      userId = testUser[0].id;
      console.log(`Using existing test user with ID ${userId}`);
      
      // Reset XP for testing
      await db.update(users)
        .set({ xp: 0, level: 1, dailyXpGained: 0, lastXpGainDate: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null })
        .where(eq(users.id, userId));
        
      // Clear any existing unlocked titles/badges
      await db.delete(userTitles).where(eq(userTitles.userId, userId));
      await db.delete(userBadges).where(eq(userBadges.userId, userId));
      
      console.log('Reset user XP and unlocked rewards');
    }
    
    // Step 2: Get initial state
    let userInfo = await xpLevelService.getUserXpInfo(userId);
    console.log('Initial state:', userInfo);
    
    // Step 3: Award XP for various actions
    console.log('\nAwarding XP for POST_CREATED...');
    for (let i = 0; i < 5; i++) {
      await xpLevelService.awardXp(userId, XP_ACTIONS.POST_CREATED);
    }
    userInfo = await xpLevelService.getUserXpInfo(userId);
    console.log('After 5 posts:', userInfo);
    
    console.log('\nAwarding XP for REPLY_CREATED...');
    for (let i = 0; i < 10; i++) {
      await xpLevelService.awardXp(userId, XP_ACTIONS.REPLY_CREATED);
    }
    userInfo = await xpLevelService.getUserXpInfo(userId);
    console.log('After 10 replies:', userInfo);
    
    console.log('\nAwarding XP for LIKE_REACTION_RECEIVED...');
    for (let i = 0; i < 20; i++) {
      await xpLevelService.awardXp(userId, XP_ACTIONS.LIKE_REACTION_RECEIVED);
    }
    userInfo = await xpLevelService.getUserXpInfo(userId);
    console.log('After 20 likes received:', userInfo);
    
    console.log('\nAwarding XP for TIP_RECEIVED...');
    for (let i = 0; i < 3; i++) {
      await xpLevelService.awardXp(userId, XP_ACTIONS.TIP_RECEIVED, { amount: 10 });
    }
    userInfo = await xpLevelService.getUserXpInfo(userId);
    console.log('After 3 tips received (10 DGT each):', userInfo);
    
    // Step 4: Check unlocked titles and badges
    const titles = await db.select({
      titleId: userTitles.titleId,
      titleName: levels.name,
      awardedAt: userTitles.awardedAt
    })
    .from(userTitles)
    .innerJoin(levels, eq(userTitles.titleId, levels.rewardTitleId))
    .where(eq(userTitles.userId, userId))
    .orderBy(userTitles.awardedAt);
    
    console.log('\nUnlocked Titles:');
    if (titles.length === 0) {
      console.log('No titles unlocked yet');
    } else {
      titles.forEach(title => {
        console.log(`- ${title.titleName} (ID: ${title.titleId}, Awarded: ${title.awardedAt})`);
      });
    }
    
    const badges = await db.select({
      badgeId: userBadges.badgeId,
      awardedAt: userBadges.awardedAt
    })
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .orderBy(userBadges.awardedAt);
    
    console.log('\nUnlocked Badges:');
    if (badges.length === 0) {
      console.log('No badges unlocked yet');
    } else {
      badges.forEach(badge => {
        console.log(`- Badge ID: ${badge.badgeId}, Awarded: ${badge.awardedAt})`);
      });
    }
    
    console.log('\n✅ XP System Test Completed Successfully');
  } catch (error) {
    console.error('❌ Error testing XP system:', error);
    throw error;
  }
}

// Run the test if this script is executed directly (ES Module version)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  testXpSystem()
    .then(() => {
      console.log('XP system test completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('XP system test failed:', error);
      process.exit(1);
    });
}

export { testXpSystem }; 