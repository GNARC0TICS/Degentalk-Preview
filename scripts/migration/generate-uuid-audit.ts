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