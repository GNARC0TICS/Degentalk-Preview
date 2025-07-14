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
import { promises as fs } from 'fs';
import path from 'path';
import glob from 'fast-glob';

/**
 * This maintenance script scans all admin page source files and fixes common malformed
 * import patterns left by early scaffolding (empty imports, missing braces, etc.).
 *
 * Patterns addressed:
 * 1. "import {  } from 'pkg';"  ➜  removed (record the pkg for following fix)
 * 2. "import { useQuery, useMutation ;" (missing `} from 'pkg'`)  ➜  fixed
 *    using the nearest preceding empty-import path OR prompts if not found.
 * 3. "import { React, { useState } from 'react';"  ➜  "import React, { useState } from 'react';"
 * 4. Any line starting with `import` that is missing a `from` section is removed.
 */
async function run() {
  const files = await glob('client/src/pages/admin/**/*.tsx', { absolute: true });
  for (const file of files) {
    let source = await fs.readFile(file, 'utf8');
    const lines = source.split(/\r?\n/);
    const newLines: : AdminId[] = [];
    let pendingPath: : AdminId | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null = : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 1. Remove empty import rows and record path
      const emptyImportMatch = line.match(/import\s+\{\s*\}\s+from\s+['"]([^'"]+)['"];?/);
      if (emptyImportMatch) {
        pendingPath = emptyImportMatch[1];
        continue; // skip this line entirely
      }

      // 2. Fix missing brace + path
      const brokenNamedImport = line.match(/import\s+\{([^}]*);?\s*$/);
      if (brokenNamedImport && pendingPath) {
        const names = brokenNamedImport[1].trim().replace(/,$/, '');
        line = `import { ${names} } from '${pendingPath}';`;
        pendingPath = : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
      } else if (brokenNamedImport) {
        // no path known – drop the line and warn
        console.warn(`[fix-broken-admin-imports] Dropped ambiguous import in ${file}: ${line}`);
        continue;
      }

      // 3. Fix React import with double braces
      line = line.replace(/import\s+\{\s*React,\s*\{([^}]+)\}\s+from\s+'react';?/,
                          (_, inner) => `import React, { ${inner.trim()} } from 'react';`);

      // 4. Remove import lines lacking 'from' keyword (very likely broken)
      if (/^import\s+[^'";]+;?$/.test(line) && !line.includes(' from ')) {
        console.warn(`[fix-broken-admin-imports] Removed stray import in ${file}: ${line}`);
        continue;
      }

      newLines.push(line);
    }

    const updated = newLines.join('\n');
    if (updated !== source) {
      await fs.writeFile(file, updated, 'utf8');
      console.log(`[fix-broken-admin-imports] Patched ${path.relative(process.cwd(), file)}`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 