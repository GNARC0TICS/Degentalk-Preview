import type { HeatEventId } from '@db/types';
import type { ActionId } from '@db/types';
import type { AuditLogId } from '@db/types';
import type { EventId } from '@db/types';
import type { PrefixId } from '@db/types';
import type { MessageId } from '@db/types';
import type { FollowRequestId } from '@db/types';
import type { FriendRequestId } from '@db/types';
import type { NotificationId } from '@db/types';
import type { UnlockId } from '@db/types';
import type { StoreItemId } from '@db/types';
import type { OrderId } from '@db/types';
import type { QuoteId } from '@db/types';
import type { ReplyId } from '@db/types';
import type { DraftId } from '@db/types';
import type { IpLogId } from '@db/types';
import type { ModActionId } from '@db/types';
import type { SessionId } from '@db/types';
import type { BanId } from '@db/types';
import type { VerificationTokenId } from '@db/types';
import type { SignatureItemId } from '@db/types';
import type { ContentId } from '@db/types';
import type { RequestId } from '@db/types';
import type { ZoneId } from '@db/types';
import type { WhaleId } from '@db/types';
import type { VaultLockId } from '@db/types';
import type { VaultId } from '@db/types';
import type { UnlockTransactionId } from '@db/types';
import type { TipId } from '@db/types';
import type { TemplateId } from '@db/types';
import type { TagId } from '@db/types';
import type { SubscriptionId } from '@db/types';
import type { StickerId } from '@db/types';
import type { SettingId } from '@db/types';
import type { RuleId } from '@db/types';
import type { ParentZoneId } from '@db/types';
import type { ParentForumId } from '@db/types';
import type { PackId } from '@db/types';
import type { ModeratorId } from '@db/types';
import type { MentionId } from '@db/types';
import type { ItemId } from '@db/types';
import type { InventoryId } from '@db/types';
import type { GroupId } from '@db/types';
import type { ForumId } from '@db/types';
import type { EntryId } from '@db/types';
import type { EntityId } from '@db/types';
import type { EmojiPackId } from '@db/types';
import type { EditorId } from '@db/types';
import type { CosmeticId } from '@db/types';
import type { AuthorId } from '@db/types';
import type { CoinId } from '@db/types';
import type { CategoryId } from '@db/types';
import type { BackupId } from '@db/types';
import type { AnimationFrameId } from '@db/types';
import type { AirdropId } from '@db/types';
import type { AdminUserId } from '@db/types';
import type { RoomId } from '@db/types';
import type { ConversationId } from '@db/types';
import type { ReportId } from '@db/types';
import type { ReporterId } from '@db/types';
import type { AdminId } from '@db/types';
/**
 * Seed data for username colors
 * Organized by rarity tier with progressive pricing
 */

export interface UsernameColorProduct {
  name: : AdminId;
  description: : AdminId;
  price: number; // DGT price
  pointsPrice?: number; // Optional points price
  stockLimit: number | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null; // : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null = unlimited
  status: 'published' | 'draft' | 'archived';
  pluginReward: {
    type: 'usernameColor';
    value: : AdminId; // Hex color
    rarity: : AdminId;
    label: : AdminId;
  };
  metadata: {
    rarity: : AdminId;
    visual?: : AdminId; // Optional visual description
  };
}

export const USERNAME_COLOR_PRODUCTS: UsernameColorProduct[] = [
  // 🟫 COPE TIER - Basic muted colors
  {
    name: "Gray Username",
    description: "A subtle gray color for those who keep it low-key",
    price: 100,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#A0A0A0',
      rarity: 'cope',
      label: 'Gray (Cope)'
    },
    metadata: {
      rarity: 'cope',
      visual: 'muted'
    }
  },
  {
    name: "Slate Username",
    description: "A darker slate gray for the understated",
    price: 100,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#64748B',
      rarity: 'cope',
      label: 'Slate (Cope)'
    },
    metadata: {
      rarity: 'cope',
      visual: 'muted'
    }
  },
  {
    name: "Stone Username",
    description: "Neutral stone color - whatever helps you sleep at night",
    price: 100,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#78716C',
      rarity: 'cope',
      label: 'Stone (Cope)'
    },
    metadata: {
      rarity: 'cope',
      visual: 'muted'
    }
  },

  // 🟨 NORMIE TIER - Basic material colors
  {
    name: "Green Username",
    description: "Classic green - still bullish on CNBC signals",
    price: 250,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#4CAF50',
      rarity: 'normie',
      label: 'Green (Normie)'
    },
    metadata: {
      rarity: 'normie',
      visual: 'basic'
    }
  },
  {
    name: "Blue Username",
    description: "Standard blue for the everyday trader",
    price: 250,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#1976D2',
      rarity: 'normie',
      label: 'Blue (Normie)'
    },
    metadata: {
      rarity: 'normie',
      visual: 'basic'
    }
  },
  {
    name: "Orange Username",
    description: "Warm orange for those who follow the herd",
    price: 250,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#F57C00',
      rarity: 'normie',
      label: 'Orange (Normie)'
    },
    metadata: {
      rarity: 'normie',
      visual: 'basic'
    }
  },

  // 🟪 BAGHOLDER TIER - Soft neon accents
  {
    name: "Yellow Glow Username",
    description: "Soft yellow glow - still checking the chart",
    price: 500,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#FFD54F',
      rarity: 'bagholder',
      label: 'Yellow Glow (Bagholder)'
    },
    metadata: {
      rarity: 'bagholder',
      visual: 'soft-neon'
    }
  },
  {
    name: "Purple Haze Username",
    description: "Mystical purple for eternal HODLers",
    price: 500,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#9575CD',
      rarity: 'bagholder',
      label: 'Purple Haze (Bagholder)'
    },
    metadata: {
      rarity: 'bagholder',
      visual: 'soft-neon'
    }
  },
  {
    name: "Teal Wave Username",
    description: "Oceanic teal - riding waves to zero",
    price: 500,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#4DB6AC',
      rarity: 'bagholder',
      label: 'Teal Wave (Bagholder)'
    },
    metadata: {
      rarity: 'bagholder',
      visual: 'soft-neon'
    }
  },

  // 🔵 MAX BIDDER TIER - Bold brights
  {
    name: "Crimson Rush Username",
    description: "Bold red - no bankroll management, just vibes",
    price: 1000,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#F44336',
      rarity: 'max_bidder',
      label: 'Crimson Rush (Max Bidder)'
    },
    metadata: {
      rarity: 'max_bidder',
      visual: 'bold'
    }
  },
  {
    name: "Cyan Lightning Username",
    description: "Electric cyan for maximum visibility",
    price: 1000,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#00E5FF',
      rarity: 'max_bidder',
      label: 'Cyan Lightning (Max Bidder)'
    },
    metadata: {
      rarity: 'max_bidder',
      visual: 'bold'
    }
  },
  {
    name: "Pink Power Username",
    description: "Hot pink - betting it all on every hand",
    price: 1000,
    stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#FF4081',
      rarity: 'max_bidder',
      label: 'Pink Power (Max Bidder)'
    },
    metadata: {
      rarity: 'max_bidder',
      visual: 'bold'
    }
  },

  // 🟧 HIGH ROLLER TIER - Premium golds and rare colors
  {
    name: "Pure Gold Username",
    description: "Prestigious gold - hits 100x or vanishes into legend",
    price: 2500,
    stockLimit: 50,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#FFEB3B',
      rarity: 'high_roller',
      label: 'Pure Gold (High Roller)'
    },
    metadata: {
      rarity: 'high_roller',
      visual: 'premium'
    }
  },
  {
    name: "Lime Elite Username",
    description: "Radioactive lime - for the truly degen",
    price: 2500,
    stockLimit: 50,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#C6FF00',
      rarity: 'high_roller',
      label: 'Lime Elite (High Roller)'
    },
    metadata: {
      rarity: 'high_roller',
      visual: 'premium'
    }
  },
  {
    name: "Amber Royale Username",
    description: "Deep amber - the color of expensive mistakes",
    price: 2500,
    stockLimit: 50,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: '#FF6F00',
      rarity: 'high_roller',
      label: 'Amber Royale (High Roller)'
    },
    metadata: {
      rarity: 'high_roller',
      visual: 'premium'
    }
  },

  // 🟥 EXIT LIQUIDITY TIER - Mythic animated/gradient (placeholder for now)
  {
    name: "Rainbow Shimmer Username",
    description: "Animated rainbow gradient - you became the market",
    price: 10000,
    stockLimit: 10,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: 'rainbow-shimmer', // Special value to be handled by frontend
      rarity: 'exit_liquidity',
      label: 'Rainbow Shimmer (Exit Liquidity)'
    },
    metadata: {
      rarity: 'exit_liquidity',
      visual: 'animated-gradient'
    }
  },
  {
    name: "Void Pulse Username",
    description: "Pulsating void black with red undertones - the final form",
    price: 10000,
    stockLimit: 5,
    status: 'published',
    pluginReward: {
      type: 'usernameColor',
      value: 'void-pulse', // Special value to be handled by frontend
      rarity: 'exit_liquidity',
      label: 'Void Pulse (Exit Liquidity)'
    },
    metadata: {
      rarity: 'exit_liquidity',
      visual: 'animated-pulse'
    }
  }
];

// Helper function to seed username colors
export async function seedUsernameColors(db: any) {
  console.log('🎨 Seeding username colors...');
  
  for (const colorProduct of USERNAME_COLOR_PRODUCTS) {
    try {
      await db.insert('products').values({
        name: colorProduct.name,
        description: colorProduct.description,
        price: colorProduct.price,
        pointsPrice: colorProduct.pointsPrice,
        stockLimit: colorProduct.stockLimit,
        status: colorProduct.status,
        pluginReward: JSON.: AdminIdify(colorProduct.pluginReward),
        metadata: JSON.: AdminIdify(colorProduct.metadata),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Created: ${colorProduct.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${colorProduct.name}:`, error);
    }
  }
  
  console.log('🎨 Username colors seeding complete!');
}

// Export for use in main seed script
export default seedUsernameColors; 