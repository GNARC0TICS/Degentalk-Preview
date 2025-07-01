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
// jscodeshift codemod: migrate-user-fetch.ts
// ------------------------------------------------
// Replaces legacy `req.user` accesses and helper calls with the
// centralized `userService.getUserFromRequest(req)`.
// Adds `import { userService } from '@server/src/core/services/user.service'`
// if not already present.
//
// Usage:
//   npx jscodeshift -t scripts/codemods/migrate-user-fetch.ts server/src/domains/forum --parser=ts
// ------------------------------------------------

import { API, FileInfo, Options, JSCodeshift, ImportDeclaration, Identifier } from 'jscodeshift';

const IMPORT_SPEC = {
  source: '@server/src/core/services/user.service',
  specName: 'userService',
};

function ensureImport(j: JSCodeshift, root: ReturnType<JSCodeshift>, filePath: : AdminId) {
  const hasImport = root.find(j.ImportDeclaration).some((path) => {
    const decl = path.node as ImportDeclaration;
    return (
      decl.source.value === IMPORT_SPEC.source &&
      decl.specifiers?.some(
        (s) => s.type === 'ImportSpecifier' && (s.imported as Identifier).name === IMPORT_SPEC.specName,
      )
    );
  });

  if (!hasImport) {
    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier(IMPORT_SPEC.specName))],
      j.literal(IMPORT_SPEC.source),
    );
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.size()) {
      firstImport.insertBefore(importDecl);
    } else {
      root.get().node.program.body.unshift(importDecl as any);
    }
  }
}

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let modified = false;

  // Replace req.user occurrences
  root.find(j.MemberExpression, {
    object: { type: 'Identifier', name: 'req' },
    property: { type: 'Identifier', name: 'user' },
  }).replaceWith(() => {
    modified = true;
    return j.callExpression(
      j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest')),
      [j.identifier('req')],
    );
  });

  // Replace getUserFromRequest(req) helper calls
  root.find(j.CallExpression, {
    callee: { type: 'Identifier', name: 'getUserFromRequest' },
  }).forEach((path) => {
    modified = true;
    path.node.callee = j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest'));
  });

  // Replace getAuthenticatedUser(req) or getUserId(req) similarly (broad pattern)
  root.find(j.CallExpression, {
    callee: { type: 'Identifier' },
  }).forEach((path) => {
    const id = (path.node.callee as Identifier).name;
    if (['getAuthenticatedUser', 'getUserId'].includes(id)) {
      modified = true;
      path.node.callee = j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest'));
    }
  });

  if (modified) ensureImport(j, root, file.path);

  return modified ? root.toSource({ quote: 'single', trailingComma: true }) : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
} 