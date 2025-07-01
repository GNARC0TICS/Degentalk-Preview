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