/**
 * Messaging Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { chatRooms } from './chatRooms';
import { conversationParticipants } from './conversationParticipants';
import { conversations } from './conversations';
import { directMessages } from './directMessages';
import { messageReads } from './messageReads';
import { messages } from './messages';
import { onlineUsers } from './onlineUsers';
import { shoutboxMessages } from './shoutboxMessages';
import { users } from '../user/users';
export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id]
  }),
  onlineUsers: many(onlineUsers),
  shoutboxMessages: many(shoutboxMessages),
}));
export const onlineUsersRelations = relations(onlineUsers, ({ one, many }) => ({
  room: one(chatRooms, {
    fields: [onlineUsers.roomId],
    references: [chatRooms.id]
  }),
}));
export const shoutboxMessagesRelations = relations(shoutboxMessages, ({ one, many }) => ({
  room: one(chatRooms, {
    fields: [shoutboxMessages.roomId],
    references: [chatRooms.id]
  }),
}));
