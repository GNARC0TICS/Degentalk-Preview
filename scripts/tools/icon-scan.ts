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