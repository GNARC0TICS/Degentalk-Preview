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
#!/usr/bin/env ts-node
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import chalk from 'chalk';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const DRY = argv.dry || false;

const WORKSPACE_ROOT = process.cwd();

// Load aliases from id.types.ts automatically
const idTypesPath = path.resolve('db/types/id.types.ts');
const idTypesSrc = fs.readFileSync(idTypesPath, 'utf-8');
const aliasRegex = /export\s+type\s+(\w+Id)\s*=\s*Id<[^>]+>/g;
const aliasNames: : AdminId[] = [];
let m: RegExpExecArray | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
while ((m = aliasRegex.exec(idTypesSrc))) {
  aliasNames.push(m[1]);
}

// Build mapping from variable suffix to type name
const suffixMap = new Map<: AdminId, : AdminId>();
for (const alias of aliasNames) {
  suffixMap.set(alias.charAt(0).toLowerCase() + alias.slice(1), alias); // userId -> UserId
  // add plural? not necessary
}

// Prepare glob for ts and tsx
const targetFiles = await glob('{client,server,shared,scripts}/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**']
});

let filesTouched = 0;
let typesReplaced = 0;

for (const filePath of targetFiles) {
  const src = fs.readFileSync(filePath, 'utf-8');
  let modified = src;

  for (const [varName, typeName] of suffixMap) {
    // Pattern 1: variable/property type annotation
    const pattern = new RegExp(`(\b${varName})\s*:\s*number(?![A-Za-z])`, 'g');
    modified = modified.replace(pattern, `$1: ${typeName}`);

    // Pattern 2: union with : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
    const patternNull = new RegExp(`(\b${varName})\s*:\s*number\s*\|\s*: AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null`, 'g');
    modified = modified.replace(patternNull, `$1: ${typeName} | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null`);

    // Pattern 3: union with : AdminId
    const patternStr = new RegExp(`(\b${varName})\s*:\s*number\s*\|\s*: AdminId`, 'g');
    modified = modified.replace(patternStr, `$1: ${typeName}`); // assume we want just the branded type
  }

  if (modified !== src) {
    filesTouched++;
    if (!DRY) {
      // Ensure import statement present
      let importsAdded = false;
      for (const [, typeName] of suffixMap) {
        if (modified.includes(`: ${typeName}`) && !src.includes(` ${typeName}`)) {
          // naive insertion at first import block
          const importLine = `import type { ${typeName} } from '@db/types';`;
          if (!modified.includes(importLine)) {
            modified = importLine + '\n' + modified;
            importsAdded = true;
          }
        }
      }
      fs.writeFileSync(filePath, modified);
    } else {
      // dry run just count
      const matches = (modified.match(/: \w+Id/g) || []).length - (src.match(/: \w+Id/g) || []).length;
      typesReplaced += matches;
    }
  }
}

if (DRY) {
  console.log(chalk.blue(`Dry run complete – ${filesTouched} files would be modified, ~${typesReplaced} type replacements.`));
  console.log('Run again without --dry to apply changes.');
} else {
  console.log(chalk.green(`Codemod applied. ${filesTouched} files updated.`));
} 