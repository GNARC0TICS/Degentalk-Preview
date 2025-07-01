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
// jscodeshift codemod: wrap-with-asyncHandler.ts
// ------------------------------------------------
// Wraps any inline Express route handler functions that are **not** already
// wrapped in asyncHandler(). This speeds up migration to the new unified error
// handling utilities.
//
// Usage (from repo root):
//   npx jscodeshift -t scripts/codemods/wrap-with-asyncHandler.ts server/src
//
// What it does:
//   router.get('/path', (req, res) => { ... })
//     -> router.get('/path', asyncHandler((req, res) => { ... }))
//
//   router.post('/x', validateBody, (req, res) => { ... })
//     -> router.post('/x', validateBody, asyncHandler((req, res) => { ... }))
//
// It purposely **does not** add an import statement for asyncHandler because
// path resolution differs across domains (some files import from '../../core/errors',
// others from '../../admin.middleware', etc.). You can run a follow-up codemod
// or manual sweep to consolidate imports after this transform.
// -----------------------------------------------------------------------------

import { API, FileInfo, Options, JSCodeshift, ArrowFunctionExpression, FunctionExpression, CallExpression } from 'jscodeshift';

const ROUTER_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'all']);

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  let modified = false;

  // Helper: check if node is router.<verb>(...)
  const isRouterCall = (node: CallExpression): boolean => {
    if (node.callee.type !== 'MemberExpression') return false;
    const prop = node.callee.property;
    if (prop.type !== 'Identifier') return false;
    return ROUTER_METHODS.has(prop.name);
  };

  root.find(j.CallExpression).forEach((path) => {
    const node = path.node;
    if (!isRouterCall(node)) return;

    // Iterate over arguments AFTER the route path (arg[0] is usually : AdminId/regex)
    node.arguments.forEach((arg, idx) => {
      // Skip first argument (path) – but only if it is a Literal/TemplateLiteral/RegExp
      if (idx === 0) return;

      // Already wrapped?
      if (arg.type === 'CallExpression' && arg.callee.type === 'Identifier' && arg.callee.name === 'asyncHandler') {
        return;
      }

      // Only wrap inline arrow or function expressions
      if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
        const wrapped = j.callExpression(j.identifier('asyncHandler'), [arg as ArrowFunctionExpression | FunctionExpression]);
        node.arguments[idx] = wrapped;
        modified = true;
      }
    });
  });

  return modified ? root.toSource({ quote: 'single', trailingComma: true }) : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
} 