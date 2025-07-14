import type { HeatEventId } from '../shared/types/ids';
import type { ActionId } from '../shared/types/ids';
import type { AuditLogId } from '../shared/types/ids';
import type { EventId } from '../shared/types/ids';
import type { PrefixId } from '../shared/types/ids';
import type { MessageId } from '../shared/types/ids';
import type { FollowRequestId } from '../shared/types/ids';
import type { FriendRequestId } from '../shared/types/ids';
import type { NotificationId } from '../shared/types/ids';
import type { UnlockId } from '../shared/types/ids';
import type { StoreItemId } from '../shared/types/ids';
import type { OrderId } from '../shared/types/ids';
import type { QuoteId } from '../shared/types/ids';
import type { ReplyId } from '../shared/types/ids';
import type { DraftId } from '../shared/types/ids';
import type { IpLogId } from '../shared/types/ids';
import type { ModActionId } from '../shared/types/ids';
import type { SessionId } from '../shared/types/ids';
import type { BanId } from '../shared/types/ids';
import type { VerificationTokenId } from '../shared/types/ids';
import type { SignatureItemId } from '../shared/types/ids';
import type { ContentId } from '../shared/types/ids';
import type { RequestId } from '../shared/types/ids';
import type { ZoneId } from '../shared/types/ids';
import type { WhaleId } from '../shared/types/ids';
import type { VaultLockId } from '../shared/types/ids';
import type { VaultId } from '../shared/types/ids';
import type { UnlockTransactionId } from '../shared/types/ids';
import type { TipId } from '../shared/types/ids';
import type { TemplateId } from '../shared/types/ids';
import type { TagId } from '../shared/types/ids';
import type { SubscriptionId } from '../shared/types/ids';
import type { StickerId } from '../shared/types/ids';
import type { SettingId } from '../shared/types/ids';
import type { RuleId } from '../shared/types/ids';
import type { ParentZoneId } from '../shared/types/ids';
import type { ParentForumId } from '../shared/types/ids';
import type { PackId } from '../shared/types/ids';
import type { ModeratorId } from '../shared/types/ids';
import type { MentionId } from '../shared/types/ids';
import type { ItemId } from '../shared/types/ids';
import type { InventoryId } from '../shared/types/ids';
import type { GroupId } from '../shared/types/ids';
import type { ForumId } from '../shared/types/ids';
import type { EntryId } from '../shared/types/ids';
import type { EntityId } from '../shared/types/ids';
import type { EmojiPackId } from '../shared/types/ids';
import type { EditorId } from '../shared/types/ids';
import type { CosmeticId } from '../shared/types/ids';
import type { AuthorId } from '../shared/types/ids';
import type { CoinId } from '../shared/types/ids';
import type { CategoryId } from '../shared/types/ids';
import type { BackupId } from '../shared/types/ids';
import type { AnimationFrameId } from '../shared/types/ids';
import type { AirdropId } from '../shared/types/ids';
import type { AdminUserId } from '../shared/types/ids';
import type { RoomId } from '../shared/types/ids';
import type { ConversationId } from '../shared/types/ids';
import type { ReportId } from '../shared/types/ids';
import type { ReporterId } from '../shared/types/ids';
import type { AdminId } from '../shared/types/ids';
/**
 * Forum Relationship Fixing Script
 * 
 * This script verifies and fixes parent-child relationships between
 * forum categories and their child forums in the database. It's particularly
 * focused on ensuring category containers like "Forum HQ" have their child
 * forums properly linked through parentId.
 */

import { db } from '../db';
import { forumCategories } from './utils/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

// Expected relationships based on canonical structure
const EXPECTED_RELATIONSHIPS = [
  {
    parent: { id: 6, name: "Market Moves", slug: "market-moves" },
    children: [
      { id: 7, name: "Signals & TA", slug: "signals-ta" },
      { id: 8, name: "Moonshots", slug: "moonshots" },
      { id: 9, name: "Red Flags", slug: "red-flags" },
    ]
  },
  {
    parent: { id: 10, name: "Alpha & Leaks", slug: "alpha-leaks" },
    children: [
      { id: 11, name: "Token Intel", slug: "token-intel" },
      { id: 12, name: "Pre-sales & Whitelists", slug: "presales-whitelists" },
      { id: 13, name: "Screenshots & Leaks", slug: "screenshots-leaks" },
    ]
  },
  {
    parent: { id: 14, name: "Casino & DeGen", slug: "casino-degen" },
    children: [
      { id: 15, name: "Limbo & Dice", slug: "limbo-dice" },
      { id: 16, name: "Mines & Keno", slug: "mines-keno" },
      { id: 17, name: "Rage Logs", slug: "rage-logs" },
    ]
  },
  {
    parent: { id: 18, name: "Builder's Terminal", slug: "builders-terminal" },
    children: [
      { id: 19, name: "Dev Diaries", slug: "dev-diaries" },
      { id: 20, name: "Code & Snippets", slug: "code-snippets" },
      { id: 21, name: "Tool Drops", slug: "tool-drops" },
    ]
  },
  {
    parent: { id: 22, name: "Airdrops & Quests", slug: "airdrops-quests" },
    children: [
      { id: 23, name: "Quests & Tasks", slug: "quests-tasks" },
      { id: 24, name: "Claim Links", slug: "claim-links" },
      { id: 25, name: "Referral Events", slug: "referral-events" },
    ]
  },
  {
    parent: { id: 26, name: "Web3 Culture & News", slug: "web3-culture-news" },
    children: [
      { id: 27, name: "General News", slug: "general-news" },
      { id: 28, name: "Memes & Satire", slug: "memes-satire" },
      { id: 29, name: "Chain Fights", slug: "chain-fights" },
    ]
  },
  {
    parent: { id: 30, name: "Beginner's Portal", slug: "beginners-portal" },
    children: [
      { id: 31, name: "Getting Started", slug: "getting-started" },
      { id: 32, name: "Terminology", slug: "terminology" },
      { id: 33, name: "Wallets & Safety", slug: "wallets-safety" },
    ]
  },
  {
    parent: { id: 34, name: "Shill & Promote", slug: "shill-promote" },
    children: [
      { id: 35, name: "Token Shills", slug: "token-shills" },
      { id: 36, name: "Casino Referrals", slug: "casino-referrals" },
      { id: 37, name: "Self-Promo", slug: "self-promo" },
    ]
  },
  {
    parent: { id: 38, name: "Marketplace", slug: "marketplace" },
    children: [
      { id: 39, name: "Buy & Sell", slug: "buy-sell" },
      { id: 40, name: "Services", slug: "services" },
      { id: 41, name: "Free Stuff", slug: "free-stuff" },
    ]
  },
  {
    parent: { id: 42, name: "Forum HQ", slug: "forum-hq" },
    children: [
      { id: 43, name: "Announcements", slug: "announcements" },
      { id: 44, name: "Suggestions", slug: "suggestions" },
      { id: 45, name: "Bug Reports", slug: "bug-reports" },
    ]
  }
];

async function analyzeForumRelationships() {
  console.log('Analyzing forum relationships...');
  
  // Get all categories
  const allCategories = await db.select().from(forumCategories);
  console.log(`Found ${allCategories.length} total forum entities`);
  
  // Count by type
  const primaryZones = allCategories.filter(c => c.isZone);
  const categories = allCategories.filter(c => !c.isZone && !c.parentId);
  const childForums = allCategories.filter(c => c.parentId);
  
  console.log(`\nCurrent structure:`);
  console.log(`- ${primaryZones.length} primary zones`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${childForums.length} child forums`);
  
  // Check expected relationships
  console.log('\nVerifying parent-child relationships:');
  const issues = [];
  
  for (const relationship of EXPECTED_RELATIONSHIPS) {
    const parent = allCategories.find(c => c.id === relationship.parent.id);
    
    if (!parent) {
      issues.push(`Parent "${relationship.parent.name}" (ID: ${relationship.parent.id}) not found in database`);
      continue;
    }
    
    console.log(`\nChecking parent: ${parent.name} (ID: ${parent.id})`);
    
    for (const expectedChild of relationship.children) {
      const child = allCategories.find(c => c.id === expectedChild.id);
      
      if (!child) {
        issues.push(`Child "${expectedChild.name}" (ID: ${expectedChild.id}) not found in database`);
        continue;
      }
      
      if (child.parentId !== parent.id) {
        const currentParentId = child.parentId;
        const currentParent = currentParentId 
          ? allCategories.find(c => c.id === currentParentId) 
          : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
          
        issues.push(
          `Child "${child.name}" (ID: ${child.id}) has incorrect parentId: ` + 
          `${currentParentId || ': AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null'} (${currentParent?.name || 'none'}), ` +
          `should be ${parent.id} (${parent.name})`
        );
      } else {
        console.log(`✓ Child "${child.name}" (ID: ${child.id}) has correct parentId: ${parent.id}`);
      }
    }
  }
  
  if (issues.length === 0) {
    console.log('\n✅ All parent-child relationships are correct!');
    return { needsFixes: false, issues: [] };
  } else {
    console.log('\n❌ Found issues with forum relationships:');
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    return { needsFixes: true, issues };
  }
}

async function fixForumRelationships() {
  console.log('\nFixing forum relationships...');
  
  let fixCount = 0;
  
  for (const relationship of EXPECTED_RELATIONSHIPS) {
    const parent = await db.select()
      .from(forumCategories)
      .where(eq(forumCategories.id, relationship.parent.id))
      .limit(1);
      
    if (parent.length === 0) {
      console.log(`⚠️ Parent ${relationship.parent.name} (ID: ${relationship.parent.id}) not found, skipping`);
      continue;
    }
    
    for (const expectedChild of relationship.children) {
      // Find the child forum
      const child = await db.select()
        .from(forumCategories)
        .where(eq(forumCategories.id, expectedChild.id))
        .limit(1);
        
      if (child.length === 0) {
        console.log(`⚠️ Child ${expectedChild.name} (ID: ${expectedChild.id}) not found, skipping`);
        continue;
      }
      
      // Check if fix needed
      if (child[0].parentId !== relationship.parent.id) {
        console.log(`Fixing child "${child[0].name}" (ID: ${child[0].id})`);
        console.log(`  Current parentId: ${child[0].parentId || ': AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null'}`);
        console.log(`  Setting parentId to: ${relationship.parent.id} (${relationship.parent.name})`);
        
        // Update the parentId
        await db.update(forumCategories)
          .set({ parentId: relationship.parent.id })
          .where(eq(forumCategories.id, child[0].id));
          
        fixCount++;
      }
    }
  }
  
  return fixCount;
}

async function main() {
  try {
    console.log('Forum Relationship Fixing Script\n');
    
    // First analyze the current state
    const { needsFixes, issues } = await analyzeForumRelationships();
    
    // If issues found, fix them
    if (needsFixes) {
      const fixCount = await fixForumRelationships();
      console.log(`\n✅ Fixed ${fixCount} parent-child relationships`);
      
      // Verify fixes worked
      console.log('\nVerifying fixes...');
      const { needsFixes: stillNeedsFixes } = await analyzeForumRelationships();
      
      if (stillNeedsFixes) {
        console.log('\n⚠️ Some issues could not be fixed automatically.');
        console.log('Please check the database manually.');
      } else {
        console.log('\n✅ All parent-child relationships are now correct!');
      }
    }
    
    console.log('\nScript completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running fix-forum-relationships script:', error);
    process.exit(1);
  }
}

main(); 