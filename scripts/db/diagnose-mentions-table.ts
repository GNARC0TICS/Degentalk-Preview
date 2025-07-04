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
#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment variables from env.local
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), 'env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

async function diagnoseMentionsTable() {
	console.log('🔍 Diagnosing mentions table structure...\n');

	try {
		// Check table structure
		const tableInfo = await sql`
			SELECT 
				column_name,
				data_type,
				is_: AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | nullable,
				column_default
			FROM information_schema.columns 
			WHERE table_name = 'mentions' 
			AND table_schema = 'public'
			ORDER BY ordinal_position;
		`;

		console.log('📊 Current mentions table structure:');
		console.table(tableInfo);

		// Check foreign key constraints
		const constraints = await sql`
			SELECT 
				tc.constraint_name,
				tc.constraint_type,
				kcu.column_name,
				ccu.table_name AS foreign_table_name,
				ccu.column_name AS foreign_column_name
			FROM information_schema.table_constraints AS tc
			JOIN information_schema.key_column_usage AS kcu
				ON tc.constraint_name = kcu.constraint_name
			LEFT JOIN information_schema.constraint_column_usage AS ccu
				ON ccu.constraint_name = tc.constraint_name
			WHERE tc.table_name = 'mentions'
			AND tc.table_schema = 'public';
		`;

		console.log('\n🔗 Current constraints:');
		console.table(constraints);

		// Sample some data to see current thread_id values
		const sampleData = await sql`
			SELECT 
				id,
				thread_id,
				pg_typeof(thread_id) as thread_id_type,
				post_id,
				mention_text
			FROM mentions 
			LIMIT 10;
		`;

		console.log('\n📋 Sample data (first 10 rows):');
		console.table(sampleData);

		// Check for non-integer thread_id values
		const nonIntegerCheck = await sql`
			SELECT 
				COUNT(*) as total_rows,
				COUNT(thread_id) as non_: AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null_thread_ids,
				COUNT(CASE WHEN thread_id ~ '^[0-9]+$' THEN 1 END) as numeric_thread_ids,
				COUNT(CASE WHEN thread_id IS NOT NULL AND thread_id !~ '^[0-9]+$' THEN 1 END) as non_numeric_thread_ids
			FROM mentions;
		`;

		console.log('\n🔢 Thread ID data analysis:');
		console.table(nonIntegerCheck);

		// Check if there are any threads table references
		const threadsCheck = await sql`
			SELECT 
				m.thread_id,
				t.thread_id as threads_table_id,
				CASE WHEN t.thread_id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as thread_exists
			FROM mentions m
			LEFT JOIN threads t ON m.thread_id::text = t.thread_id::text
			WHERE m.thread_id IS NOT NULL
			LIMIT 10;
		`;

		console.log('\n🔍 Thread ID reference check:');
		console.table(threadsCheck);

	} catch (error) {
		console.error('❌ Error diagnosing mentions table:', error);
	} finally {
		// Neon HTTP client doesn't require explicit cleanup
		console.log('✅ Diagnosis complete');
	}
}

diagnoseMentionsTable();