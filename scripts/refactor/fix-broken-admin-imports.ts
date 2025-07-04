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