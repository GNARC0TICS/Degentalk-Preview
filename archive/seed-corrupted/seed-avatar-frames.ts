import type { HeatEventId } from 'import { randomUUID } from "crypto";
@db/types';
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
#!/usr/bin/env tsx
/**
 * Seed Avatar Frames
 * 
 * This script populates the avatar_frames table with default frames
 * and adds them to the shop products table for purchase.
 */

import { db } from '../../db';
import { avatarFrames, products } from '../../db/schema';
import { eq } from 'drizzle-orm';
import chalk from 'chalk';

const defaultFrames = [
  // Common Frames
  {
    name: 'Basic Bronze Frame',
    imageUrl: '/assets/frames/bronze-frame.svg',
    rarity: 'common',
    animated: false,
    shopData: {
      description: 'A simple bronze frame to get you started.',
      priceDGT: 100,
      priceUSDT: 1,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Silver Elegance',
    imageUrl: '/assets/frames/silver-frame.svg',
    rarity: 'common',
    animated: false,
    shopData: {
      description: 'A sleek silver frame with a polished finish.',
      priceDGT: 250,
      priceUSDT: 2.5,
      category: 'avatar_frames'
    }
  },
  
  // Rare Frames
  {
    name: 'Gold Prestige',
    imageUrl: '/assets/frames/gold-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'Show your wealth with this luxurious gold frame.',
      priceDGT: 1000,
      priceUSDT: 10,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Electric Blue',
    imageUrl: '/assets/frames/electric-blue-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'A vibrant electric blue frame that catches the eye.',
      priceDGT: 750,
      priceUSDT: 7.5,
      category: 'avatar_frames'
    }
  },
  {
    name: 'Cyber Circuit',
    imageUrl: '/assets/frames/cyber-circuit-frame.svg',
    rarity: 'rare',
    animated: false,
    shopData: {
      description: 'A futuristic frame with circuit board patterns.',
      priceDGT: 800,
      priceUSDT: 8,
      category: 'avatar_frames'
    }
  },
  
  // Epic Frames
  {
    name: 'Diamond Crown',
    imageUrl: '/assets/frames/diamond-crown-frame.svg',
    rarity: 'epic',
    animated: false,
    shopData: {
      description: 'A majestic crown frame adorned with diamonds.',
      priceDGT: 2500,
      priceUSDT: 25,
      category: 'avatar_frames'
    }
  },
  
  // Special/Event Frames
  {
    name: 'OG Beta Frame',
    imageUrl: '/assets/frames/og-beta-frame.svg',
    rarity: 'legendary',
    animated: false,
    shopData: {
      description: 'Exclusive frame for beta testers - not for sale.',
      priceDGT: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
      priceUSDT: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
      category: 'avatar_frames',
      isSpecial: true
    }
  }
];

async function seedAvatarFrames() {
  console.log(chalk.blue('🖼️  Seeding avatar frames...'));
  
  try {
    // Check if frames already exist
    const existingFrames = await db.select().from(avatarFrames);
    
    if (existingFrames.length > 0) {
      console.log(chalk.yellow(`⚠️  Avatar frames table already has ${existingFrames.length} frames. Skipping seed.`));
      return;
    }
    
    // Insert frames
    const insertedFrames = [];
    
    for (const frame of defaultFrames) {
      const [insertedFrame] = await db.insert(avatarFrames).values({
        name: frame.name,
        imageUrl: frame.imageUrl,
        rarity: frame.rarity,
        animated: frame.animated
      }).returning();
      
      insertedFrames.push(insertedFrame);
      console.log(chalk.green(`✅ Created frame: ${frame.name}`));
      
      // Add to shop if it has pricing
      if (frame.shopData.priceDGT !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null && frame.shopData.priceUSDT !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null) {
        const slug = frame.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        await db.insert(products).values({
          name: frame.name,
          slug: slug,
          description: frame.shopData.description,
          price: frame.shopData.priceUSDT,
          pointsPrice: frame.shopData.priceDGT,
          status: 'published',
          isDeleted: false,
          pluginReward: JSON.: AdminIdify({
            type: 'avatar_frame',
            frameId: insertedFrame.id,
            rarity: frame.rarity
          }),
          stockLimit: frame.shopData.isLimited ? 100 : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
          promotionLabel: frame.shopData.isLimited ? 'LIMITED EDITION' : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
          isDigital: true,
          stock: 999 // Digital items have unlimited stock
        });
        
        console.log(chalk.green(`  └─ Added to shop for ${frame.shopData.priceDGT} DGT / $${frame.shopData.priceUSDT} USDT`));
      }
    }
    
    console.log(chalk.blue(`\n✨ Successfully seeded ${insertedFrames.length} avatar frames!`));
    
    // Display summary
    const summary = {
      common: insertedFrames.filter(f => f.rarity === 'common').length,
      rare: insertedFrames.filter(f => f.rarity === 'rare').length,
      epic: insertedFrames.filter(f => f.rarity === 'epic').length,
      legendary: insertedFrames.filter(f => f.rarity === 'legendary').length,
      animated: insertedFrames.filter(f => f.animated).length
    };
    
    console.log(chalk.cyan('\n📊 Summary:'));
    console.log(chalk.cyan(`  Common: ${summary.common}`));
    console.log(chalk.cyan(`  Rare: ${summary.rare}`));
    console.log(chalk.cyan(`  Epic: ${summary.epic}`));
    console.log(chalk.cyan(`  Legendary: ${summary.legendary}`));
    console.log(chalk.cyan(`  Animated: ${summary.animated}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error seeding avatar frames:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAvatarFrames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedAvatarFrames };