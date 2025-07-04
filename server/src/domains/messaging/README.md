# Messaging Domain Architecture

## Overview

The messaging domain handles private user-to-user communications with a security-first transformation layer that ensures data is properly sanitized and role-appropriate before being sent to clients.

## Architecture Components

### 1. Types (`types/index.ts`)
- **PublicMessage**: Minimal message data for basic display
- **AuthenticatedMessage**: Includes user permissions and context
- **ModerationMessage**: Full data access for admins/moderators
- **ConversationSummary**: Lightweight conversation list view
- **AuthenticatedConversation**: Enhanced conversation with permissions
- **MessageThread**: Paginated message collections

### 2. Transformer (`transformers/message.transformer.ts`)
The MessageTransformer class provides role-based data transformation:

```typescript
// Public view - strips sensitive data
MessageTransformer.toPublicMessage(dbMessage)

// Authenticated view - adds permissions
MessageTransformer.toAuthenticatedMessage(dbMessage, requestingUser)

// Moderation view - full access
MessageTransformer.toModerationMessage(dbMessage)
```

### 3. Service Layer (`message.service.ts`)
Business logic separated from routes:
- `getConversations()`: Fetch user conversations with unread counts
- `getMessageThread()`: Get messages between two users
- `sendMessage()`: Create new messages with validation
- `markMessagesAsRead()`: Update read status
- `deleteConversation()`: Soft delete entire conversations
- `editMessage()`: Edit messages within time limit
- `deleteMessage()`: Delete individual messages

### 4. Routes (`message.routes.ts`)
RESTful API endpoints:
- `GET /conversations`: List all user conversations
- `GET /conversation/:userId`: Get messages with specific user
- `POST /send`: Send new message
- `POST /mark-read/:userId`: Mark messages as read
- `DELETE /conversation/:userId`: Delete conversation
- `GET /unread-count`: Get total unread messages
- `PUT /message/:messageId`: Edit a message
- `DELETE /message/:messageId`: Delete a message
- `GET /admin/messages`: Admin moderation view

## Security Features

### 1. Permission Checking
- Users can only view their own messages
- Edit/delete permissions time-limited
- Admin/moderator overrides available

### 2. Data Sanitization
- IP addresses hashed for privacy
- Internal fields stripped from responses
- Sensitive data never exposed to clients

### 3. Input Validation
- Zod schemas for all inputs
- Message length limits enforced
- Recipient validation before sending

## Integration Points

### 1. Database Schema
- Uses `messages` table for storage
- Foreign keys to `users` table
- Soft delete support

### 2. Type System
- Branded types for IDs (MessageId, UserId)
- Shared types from `@shared/types`
- Frontend-safe type definitions

### 3. Middleware Integration
- Works with `transform-response` middleware
- Automatic ID transformation
- Consistent API response format

## Usage Example

```typescript
// In a route handler
const conversations = await MessageService.getConversations(userId);
const transformed = MessageTransformer.toConversationList(
  conversations,
  currentUser,
  'authenticated'
);
res.json(transformed);
```

## Differences from Shoutbox

While shoutbox messages are public chat room messages, this messaging system handles:
- Private 1-on-1 conversations
- Read receipts and unread counts
- Message editing with time limits
- Conversation management
- User blocking (planned)

## Future Enhancements

1. **Blocking System**: Prevent messages from blocked users
2. **Reporting System**: Flag inappropriate messages
3. **Attachments**: Support for images/files
4. **Real-time Updates**: WebSocket integration
5. **Message Search**: Full-text search capabilities
6. **Encryption**: End-to-end encryption option