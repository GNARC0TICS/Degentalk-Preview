export type MentionType = 'thread' | 'post' | 'shoutbox' | 'whisper';

export interface MentionRecord {
	id: number;
	mentionedUserId: string;
	mentioningUserId: string;
	type: MentionType;
	threadId?: string;
	postId?: string;
	messageId?: string;
	mentionText: string;
	context?: string;
	isRead: boolean;
	isNotified: boolean;
	createdAt: Date;
	readAt?: Date;
}

export interface UserMentionPreferences {
	id: number;
	userId: string;
	emailNotifications: boolean;
	pushNotifications: boolean;
	allowThreadMentions: boolean;
	allowPostMentions: boolean;
	allowShoutboxMentions: boolean;
	allowWhisperMentions: boolean;
	onlyFriendsMention: boolean;
	onlyFollowersMention: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface MentionUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	role?: string | null;
	level?: number | null;
}

export interface ProcessMentionsRequest {
	content: string;
	mentioningUserId: string;
	type: MentionType;
	threadId?: string;
	postId?: string;
	messageId?: string;
	context?: string;
}
