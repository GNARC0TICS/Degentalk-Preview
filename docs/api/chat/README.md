# Chat System API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | msg | message |
| 🔓 | public | | auth | authentication |
| 🔒 | auth required | | mod | moderator |
| ⚠️ | admin/mod only | | ws | WebSocket |

## Overview

Real-time chat system w/ shoutbox, rooms, WebSocket integration & comprehensive moderation features.

**Base Path:** `/api/shoutbox` | `/api/chat`

## Chat Rooms

### Get Available Rooms
```http
GET /api/shoutbox/rooms
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "general",
        "name": "General Chat",
        "description": "General discussion for all topics",
        "accessLevel": "public",
        "userCount": 45,
        "messageCount": 1234,
        "isActive": true,
        "settings": {
          "slowMode": false,
          "slowModeDelay": 0,
          "maxMessageLength": 500,
          "allowImages": true,
          "allowMentions": true
        }
      },
      {
        "id": "trading",
        "name": "Trading Floor",
        "description": "Real-time trading discussions",
        "accessLevel": "registered",
        "userCount": 23,
        "messageCount": 567,
        "isActive": true,
        "settings": {
          "slowMode": true,
          "slowModeDelay": 30,
          "maxMessageLength": 300,
          "allowImages": false,
          "allowMentions": true
        }
      },
      {
        "id": "vip",
        "name": "VIP Lounge",
        "description": "Exclusive chat for VIP members",
        "accessLevel": "level_10",
        "userCount": 8,
        "messageCount": 89,
        "isActive": true,
        "requirements": {
          "minLevel": 10,
          "vipStatus": true
        }
      }
    ]
  }
}
```

### Get Room Details
```http
GET /api/shoutbox/rooms/:roomId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "general",
      "name": "General Chat",
      "description": "General discussion for all topics",
      "accessLevel": "public",
      "createdAt": "2024-01-01T00:00:00Z",
      "settings": {
        "slowMode": false,
        "slowModeDelay": 0,
        "maxMessageLength": 500,
        "allowImages": true,
        "allowMentions": true,
        "autoModeration": true
      },
      "stats": {
        "totalMessages": 15420,
        "activeUsers": 45,
        "peakUsers": 234,
        "averageMessagesPerDay": 500
      },
      "permissions": {
        "canPost": true,
        "canMention": true,
        "canPin": false,
        "canModerate": false
      }
    }
  }
}
```

## Message Management

### Get Messages
```http
GET /api/shoutbox/messages
```

**Query Parameters:**
```
room=general        # Room ID (required)
limit=50           # Messages per page (max 100)
before=msg_abc123  # Get messages before this ID
after=msg_def456   # Get messages after this ID
includeDeleted=false  # Include deleted messages (mod only)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_abc123",
        "content": "GM crypto fam! 🚀",
        "author": {
          "id": 123,
          "username": "cryptoking",
          "displayName": "Crypto King",
          "level": 15,
          "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
          "badges": ["whale", "og"],
          "isOnline": true
        },
        "room": "general",
        "type": "message",
        "mentions": [],
        "reactions": {
          "🚀": {
            "count": 5,
            "users": ["trader99", "moonboy", "hodler"],
            "hasReacted": false
          },
          "💎": {
            "count": 2,
            "users": ["diamondhands", "cryptoking"],
            "hasReacted": true
          }
        },
        "isPinned": false,
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2025-01-01T12:00:00Z",
        "editedAt": null
      },
      {
        "id": "msg_def456",
        "content": "Hey @cryptoking, what's your take on the latest BTC move?",
        "author": {
          "id": 456,
          "username": "trader99",
          "level": 8,
          "avatar": "https://cdn.degentalk.com/avatars/456.jpg",
          "isOnline": false,
          "lastSeen": "2025-01-01T11:45:00Z"
        },
        "room": "general",
        "type": "message",
        "mentions": [
          {
            "userId": 123,
            "username": "cryptoking",
            "startPos": 4,
            "endPos": 15
          }
        ],
        "replyTo": {
          "messageId": "msg_abc123",
          "snippet": "GM crypto fam! 🚀"
        },
        "reactions": {},
        "isPinned": false,
        "isEdited": false,
        "createdAt": "2025-01-01T12:01:00Z"
      }
    ]
  },
  "pagination": {
    "hasMore": true,
    "nextCursor": "msg_ghi789",
    "previousCursor": "msg_abc123"
  },
  "room": {
    "id": "general",
    "name": "General Chat",
    "activeUsers": 45
  }
}
```

### Send Message 🔒
```http
POST /api/shoutbox/messages
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "content": "Just bought more Bitcoin! 📈",
  "room": "general",
  "replyTo": "msg_abc123",
  "mentions": ["@trader99"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_new123",
      "content": "Just bought more Bitcoin! 📈",
      "author": {
        "id": 123,
        "username": "cryptoking",
        "level": 15,
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg"
      },
      "room": "general",
      "mentions": [
        {
          "userId": 456,
          "username": "trader99",
          "notified": true
        }
      ],
      "replyTo": {
        "messageId": "msg_abc123",
        "author": "cryptoking",
        "snippet": "GM crypto fam! 🚀"
      },
      "createdAt": "2025-01-01T12:05:00Z"
    },
    "xpAwarded": 2,
    "dgtAwarded": 0.20,
    "cooldownRemaining": 10
  }
}
```

**Rate Limiting:**
- **General users:** 10-second cooldown between messages
- **VIP users:** 5-second cooldown
- **Moderators:** No cooldown

### Edit Message 🔒
```http
PATCH /api/shoutbox/messages/:messageId
```

**Body:**
```json
{
  "content": "Just bought more Bitcoin! 📈 (corrected typo)"
}
```

**Permissions:** Message author (within 5 minutes) or moderator

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_new123",
      "content": "Just bought more Bitcoin! 📈 (corrected typo)",
      "isEdited": true,
      "editedAt": "2025-01-01T12:10:00Z",
      "editHistory": [
        {
          "content": "Just bought more Bitcoin! 📈",
          "editedAt": "2025-01-01T12:05:00Z"
        }
      ]
    }
  }
}
```

### Delete Message 🔒
```http
DELETE /api/shoutbox/messages/:messageId
```

**Permissions:** Message author (within 1 minute) or moderator

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_new123",
    "deleted": true,
    "deletedAt": "2025-01-01T12:11:00Z",
    "deletedBy": "cryptoking"
  }
}
```

## Message Reactions

### Add Reaction 🔒
```http
POST /api/shoutbox/messages/:messageId/reactions
```

**Body:**
```json
{
  "emoji": "🚀"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "emoji": "🚀",
    "added": true,
    "totalCount": 6,
    "userReacted": true
  }
}
```

### Remove Reaction 🔒
```http
DELETE /api/shoutbox/messages/:messageId/reactions/:emoji
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "emoji": "🚀",
    "removed": true,
    "totalCount": 5,
    "userReacted": false
  }
}
```

## Moderation Features ⚠️

### Pin/Unpin Message
```http
PATCH /api/shoutbox/messages/:messageId/pin
PATCH /api/shoutbox/messages/:messageId/unpin
```

**Permissions:** Moderator+

**Body (pin):**
```json
{
  "reason": "Important announcement",
  "duration": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "pinned": true,
    "pinnedAt": "2025-01-01T12:00:00Z",
    "pinnedBy": "moderator_username",
    "expiresAt": "2025-01-01T13:00:00Z"
  }
}
```

### Moderate Message
```http
PATCH /api/shoutbox/messages/:messageId/moderate
```

**Body:**
```json
{
  "action": "hide",
  "reason": "Inappropriate content",
  "notifyUser": true,
  "duration": 3600
}
```

**Actions:** `hide`, `delete`, `warn`, `timeout`

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_abc123",
    "action": "hide",
    "reason": "Inappropriate content",
    "moderatedBy": "mod_username",
    "moderatedAt": "2025-01-01T12:00:00Z",
    "userNotified": true
  }
}
```

### User Timeout
```http
POST /api/shoutbox/users/:userId/timeout
```

**Body:**
```json
{
  "duration": 3600,
  "reason": "Spam violation",
  "room": "general"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "timeoutUntil": "2025-01-01T13:00:00Z",
    "reason": "Spam violation",
    "room": "general",
    "canAppeal": true
  }
}
```

## WebSocket Integration

### Connection
```javascript
const ws = new WebSocket('wss://degentalk.com/ws');

// Authentication after connection
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_session_token'
}));

// Join room
ws.send(JSON.stringify({
  type: 'join_room',
  room: 'general'
}));
```

### Event Types

#### New Message
```javascript
{
  "type": "new_message",
  "data": {
    "message": {
      "id": "msg_abc123",
      "content": "Hello world!",
      "author": {
        "id": 123,
        "username": "cryptoking"
      },
      "room": "general",
      "createdAt": "2025-01-01T12:00:00Z"
    }
  }
}
```

#### Message Updated
```javascript
{
  "type": "message_updated",
  "data": {
    "messageId": "msg_abc123",
    "content": "Hello world! (edited)",
    "isEdited": true,
    "editedAt": "2025-01-01T12:05:00Z"
  }
}
```

#### Message Deleted
```javascript
{
  "type": "message_deleted",
  "data": {
    "messageId": "msg_abc123",
    "deletedAt": "2025-01-01T12:10:00Z",
    "deletedBy": "moderator"
  }
}
```

#### User Joined/Left
```javascript
{
  "type": "user_joined",
  "data": {
    "user": {
      "id": 456,
      "username": "trader99",
      "level": 8
    },
    "room": "general",
    "userCount": 46
  }
}
```

#### Reaction Added
```javascript
{
  "type": "reaction_added",
  "data": {
    "messageId": "msg_abc123",
    "emoji": "🚀",
    "userId": 123,
    "username": "cryptoking",
    "totalCount": 6
  }
}
```

#### Typing Indicator
```javascript
{
  "type": "user_typing",
  "data": {
    "userId": 123,
    "username": "cryptoking",
    "room": "general",
    "isTyping": true
  }
}
```

### Client Events

#### Send Message
```javascript
ws.send(JSON.stringify({
  type: 'send_message',
  data: {
    content: 'Hello everyone!',
    room: 'general',
    replyTo: 'msg_abc123'
  }
}));
```

#### Start/Stop Typing
```javascript
ws.send(JSON.stringify({
  type: 'typing',
  data: {
    room: 'general',
    isTyping: true
  }
}));
```

#### Join/Leave Room
```javascript
ws.send(JSON.stringify({
  type: 'join_room',
  data: {
    room: 'trading'
  }
}));

ws.send(JSON.stringify({
  type: 'leave_room',
  data: {
    room: 'general'
  }
}));
```

## User Presence

### Get Online Users
```http
GET /api/shoutbox/rooms/:roomId/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "username": "cryptoking",
        "displayName": "Crypto King",
        "level": 15,
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
        "badges": ["whale", "og"],
        "isOnline": true,
        "lastSeen": "2025-01-01T12:00:00Z",
        "status": "active"
      }
    ],
    "totalCount": 45,
    "room": "general"
  }
}
```

### Update User Status 🔒
```http
PATCH /api/shoutbox/status
```

**Body:**
```json
{
  "status": "away",
  "customMessage": "Trading the dip"
}
```

**Statuses:** `active`, `away`, `busy`, `invisible`

## Chat Statistics

### Get Room Statistics
```http
GET /api/shoutbox/rooms/:roomId/stats
```

**Query Parameters:**
```
period=24h          # Time period: 1h|24h|7d|30d
includeUsers=true   # Include user stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "general",
      "name": "General Chat"
    },
    "period": {
      "start": "2024-12-31T12:00:00Z",
      "end": "2025-01-01T12:00:00Z"
    },
    "messages": {
      "total": 1250,
      "hourlyAverage": 52.0,
      "peakHour": "2025-01-01T09:00:00Z",
      "peakCount": 145
    },
    "users": {
      "unique": 234,
      "peak": 67,
      "average": 42.5,
      "newJoins": 12
    },
    "activity": {
      "mostActiveUsers": [
        {
          "id": 123,
          "username": "cryptoking",
          "messageCount": 45
        }
      ],
      "popularEmojis": [
        {
          "emoji": "🚀",
          "count": 89
        }
      ]
    }
  }
}
```

### Get User Chat Statistics 🔒
```http
GET /api/shoutbox/users/:userId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking"
    },
    "stats": {
      "totalMessages": 1234,
      "totalReactions": 567,
      "averageMessagesPerDay": 15.5,
      "favoriteEmojis": ["🚀", "💎", "📈"],
      "mostActiveRooms": [
        {
          "room": "general",
          "messageCount": 890
        },
        {
          "room": "trading",
          "messageCount": 344
        }
      ],
      "streaks": {
        "currentDaily": 5,
        "longestDaily": 23
      }
    },
    "achievements": [
      {
        "id": "chatter",
        "name": "Chatter",
        "description": "Send 1000 messages"
      }
    ]
  }
}
```

## Rate Limiting & Security

### Rate Limits
- **Message sending:** 10-second cooldown (general users)
- **Reactions:** 60 per minute per user
- **Room joins:** 10 per minute per user
- **Status updates:** 5 per minute per user

### Content Filtering
- **Profanity filter** with customizable word lists
- **Spam detection** via pattern recognition
- **Link validation** prevents malicious URLs
- **Image moderation** (future feature)

### Security Features
- **Session validation** for all WebSocket connections
- **Rate limiting** prevents chat flooding
- **Auto-moderation** flags inappropriate content
- **IP tracking** for ban enforcement

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `CHAT_001` | Room not found | Invalid room ID |
| `CHAT_002` | Access denied | Insufficient permissions |
| `CHAT_003` | Message too long | Exceeds character limit |
| `CHAT_004` | User timeout active | Cannot post while timed out |
| `CHAT_005` | Cooldown active | Message sent too quickly |
| `CHAT_006` | Room is locked | Room temporarily unavailable |
| `CHAT_007` | Invalid emoji | Emoji not supported |
| `CHAT_008` | Message not found | Invalid message ID |

## Integration Examples

### React Hook
```typescript
import { useChat } from '@/hooks/use-chat';

function ChatComponent() {
  const {
    messages,
    sendMessage,
    onlineUsers,
    isConnected,
    currentRoom
  } = useChat('general');

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div>
      <MessageList messages={messages} />
      <OnlineUserList users={onlineUsers} />
      <MessageInput onSend={handleSend} />
      <ConnectionStatus connected={isConnected} />
    </div>
  );
}
```

### WebSocket Client
```typescript
class ChatClient {
  private ws: WebSocket;

  connect() {
    this.ws = new WebSocket('wss://degentalk.com/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }

  sendMessage(content: string, room: string) {
    this.ws.send(JSON.stringify({
      type: 'send_message',
      data: { content, room }
    }));
  }

  joinRoom(room: string) {
    this.ws.send(JSON.stringify({
      type: 'join_room',
      data: { room }
    }));
  }
}
```

---

**📚 Documentation:** `/docs/api/chat/README.md`

**Related:**
- [WebSocket Events](../webhooks/websocket.md)
- [Moderation Tools](../admin/moderation.md)
- [User Management](../admin/users.md)