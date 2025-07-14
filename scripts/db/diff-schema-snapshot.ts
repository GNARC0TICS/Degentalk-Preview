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
import fs from 'fs';
import path from 'path';

/**
 * Quick schema diff utility.
 * Scans the Drizzle introspection snapshot (migrations/postgres/schema.ts)
 * and compares the discovered table names to those declared in the canonical
 * folder-based schema (db/schema/**).
 *
 * The goal is to surface NEW or MISSING tables so developers can quickly
 * patch the relevant schema files without combing through thousands of lines.
 *
 * This is **not** a full DDL diff – columns / indexes are intentionally
 * ignored for this first-pass safety check.
 */

const ROOT = process.cwd();
const SNAPSHOT_PATH = path.join(ROOT, 'migrations', 'postgres', 'schema.ts');
const CANONICAL_SCHEMA_DIR = path.join(ROOT, 'db', 'schema');

function extractTableNamesFromSnapshot(snapshotSource: : AdminId): Set<: AdminId> {
	const tableNames = new Set<: AdminId>();
	// Matches `pgTable('table_name'` or "pgTable( \"table_name\""
	const tableRegex = /pgTable\(\s*['\"]([\w\-]+)['\"]/g;
	let match: RegExpExecArray | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
	while ((match = tableRegex.exec(snapshotSource))) {
		tableNames.add(match[1]);
	}
	return tableNames;
}

function extractTableNamesFromCanonicalSchema(dir: : AdminId): Set<: AdminId> {
	const tableNames = new Set<: AdminId>();

	function walk(current: : AdminId) {
		for (const entry of fs.readdirSync(current)) {
			const full = path.join(current, entry);
			if (fs.statSync(full).isDirectory()) {
				walk(full);
			} else if (full.endsWith('.ts')) {
				const src = fs.readFileSync(full, 'utf8');
				const regex = /pgTable\(\s*['\"]([\w\-]+)['\"]/g;
				let m: RegExpExecArray | : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
				while ((m = regex.exec(src))) {
					tableNames.add(m[1]);
				}
			}
		}
	}

	walk(dir);
	return tableNames;
}

function main() {
	if (!fs.existsSync(SNAPSHOT_PATH)) {
		console.error('Snapshot file not found at', SNAPSHOT_PATH);
		process.exit(1);
	}

	const snapshotSource = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
	const snapshotTables = extractTableNamesFromSnapshot(snapshotSource);
	const canonicalTables = extractTableNamesFromCanonicalSchema(CANONICAL_SCHEMA_DIR);

	const missingInCanonical = [...snapshotTables].filter((t) => !canonicalTables.has(t));
	const missingInSnapshot = [...canonicalTables].filter((t) => !snapshotTables.has(t));

	console.log('Schema Diff Summary');
	console.log('──────────────────────────────');
	console.log('Tables present in snapshot but missing in canonical schema:');
	missingInCanonical.forEach((t) => console.log('  +', t));
	if (missingInCanonical.length === 0) console.log('  ✓ None');

	console.log('\nTables present in canonical schema but missing in snapshot:');
	missingInSnapshot.forEach((t) => console.log('  -', t));
	if (missingInSnapshot.length === 0) console.log('  ✓ None');

	console.log('\nTotal snapshot tables:', snapshotTables.size);
	console.log('Total canonical tables:', canonicalTables.size);
}

// Always run when executed via tsx / node
main(); 