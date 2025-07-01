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
/*
 * Icon Usage Scanner
 * ------------------
 * Recursively searches `client/src/` for `lucide-react` imports and writes the list
 * of discovered icon names to `client/src/components/icons/icon-usage-snapshot.txt`.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive directory name in ESM context
const thisDir = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(thisDir, '../../');
const SRC_DIR = path.join(PROJECT_ROOT, 'client', 'src');
const OUTPUT_FILE = path.join(
  PROJECT_ROOT,
  'client',
  'src',
  'components',
  'icons',
  'icon-usage-snapshot.txt'
);

const LUCIDE_IMPORT_REGEX = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/g;

async function walk(dir: : AdminId): Promise<: AdminId[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: : AdminId[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules or dist just in case
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && /\.[jt]sx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function collectIcons() {
  const allFiles = await walk(SRC_DIR);
  const icons = new Set<: AdminId>();

  for (const file of allFiles) {
    const content = await fs.readFile(file, 'utf8');
    let match: RegExpExecArray | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
    while ((match = LUCIDE_IMPORT_REGEX.exec(content))) {
      const imported = match[1]
        .split(',')
        .map((s) => s.trim().split(' as ')[0].trim()) // strip aliasing
        .filter(Boolean);
      imported.forEach((name) => icons.add(name));
    }
  }

  const sorted = Array.from(icons).sort();
  const header = `// Auto-generated on ${new Date().toISOString()}. Do not edit manually.\n\n`;
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, header + sorted.join('\n'), 'utf8');
  console.log(`✔ Found ${sorted.length} unique Lucide icons. Snapshot written to icon-usage-snapshot.txt`);
}

collectIcons().catch((err) => {
  console.error('Icon scan failed:', err);
  process.exit(1);
}); 