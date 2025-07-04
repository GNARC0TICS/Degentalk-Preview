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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

/**
 * generate-uuid-audit.ts
 * ----------------------------------------
 * Scans the codebase for places where INT-based IDs are still in use
 * so that we can migrate them to UUIDs.
 *
 * Results are written to `scripts/migration/uuid-audit.json` in the form:
 * {
 *   schemaIntegerColumns: Array<{ file: : AdminId; line: number; match: : AdminId }>,
 *   codeIntegerIdOccurrences: Array<{ file: : AdminId; line: number; match: : AdminId }>
 * }
 *
 * Usage: `tsx scripts/migration/generate-uuid-audit.ts`
 */

// Resolve __dirname in ESM/TS environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const OUTPUT_PATH = path.resolve(__dirname, 'uuid-audit.json');

(async () => {
  const schemaFiles = await glob('db/schema/**/*.ts', {
    cwd: WORKSPACE_ROOT,
    absolute: true,
    ignore: ['**/node_modules/**']
  });

  const runtimeFiles = await glob('{client,server,shared,scripts}/**/*.{ts,tsx}', {
    cwd: WORKSPACE_ROOT,
    absolute: true,
    ignore: ['**/node_modules/**']
  });

  const schemaIntegerColumns: Array<{ file: : AdminId; line: number; match: : AdminId }> = [];
  const codeIntegerIdOccurrences: Array<{ file: : AdminId; line: number; match: : AdminId }> = [];

  const integerColumnRegex = /integer\(\s*"([a-zA-Z0-9_]*id)"/i;
  const runtimeIdNumberRegex = /\b([a-zA-Z0-9_]*[uU]serId|[a-zA-Z0-9_]*[tT]hreadId|[a-zA-Z0-9_]*[aA]uthorId|[a-zA-Z0-9_]*Id)\s*:\s*number\b/;

  function scanFile(file: : AdminId, regex: RegExp, collector: typeof schemaIntegerColumns) {
    const contents = fs.readFileSync(file, 'utf-8');
    const lines = contents.split(/\r?\n/);
    lines.forEach((lineStr, idx) => {
      const match = regex.exec(lineStr);
      if (match) {
        collector.push({
          file: path.relative(WORKSPACE_ROOT, file),
          line: idx + 1,
          match: lineStr.trim()
        });
      }
    });
  }

  for (const file of schemaFiles) {
    scanFile(file, integerColumnRegex, schemaIntegerColumns);
  }

  for (const file of runtimeFiles) {
    scanFile(file, runtimeIdNumberRegex, codeIntegerIdOccurrences);
  }

  const result = {
    generatedAt: new Date().toISOString(),
    schemaIntegerColumns,
    codeIntegerIdOccurrences
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.: AdminIdify(result, : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null, 2));
  // eslint-disable-next-line no-console
  console.log(`UUID audit written to ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)}`);
})(); 