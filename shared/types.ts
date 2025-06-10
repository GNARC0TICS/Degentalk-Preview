import { CustomEmoji, ForumCategory, Post, Thread, User } from '@schema';

// Extended types with additional fields from joins
export interface ThreadWithUser extends Thread {
	user: User;
	postCount: number;
	lastPost?: Post;
}

export interface PostWithUser extends Post {
	user: User;
}

export interface ForumCategoryWithStats extends ForumCategory {
	threadCount: number;
	postCount: number;
	lastThread?: ThreadWithUser;
	parentId: number | null;
	pluginData: Record<string, any>;
	minXp: number;
	type: string;
	colorTheme: string | null;
	icon: string;
	isHidden: boolean;
	canHaveThreads: boolean;
	childForums?: ForumCategoryWithStats[];
}

// User plugin data structure
export interface UserPluginData {
<<<<<<< HEAD
	// Paths XP and multipliers
	paths?: Record<string, number>;
	pathMultipliers?: Record<string, number>;

	// Emoji unlocks
	unlockedEmojis?: number[]; // Array of unlocked emoji IDs

	// Other plugin data as needed for future extensions
	[key: string]: any;
=======
  // Paths XP and multipliers
  paths?: Record<string, number>;
  pathMultipliers?: Record<string, number>;

  // Emoji and sticker unlocks
  unlockedEmojis?: string[]; // Array of unlocked emoji IDs (now strings to match config)
  unlockedStickers?: string[]; // Array of unlocked sticker IDs
  equippedFlairEmoji?: string; // Currently equipped flair emoji ID

  // Other plugin data as needed for future extensions
  [key: string]: any;
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
}

// Type for editor content with rich text
export interface RichTextContent {
	type: string; // 'paragraph', 'heading', etc.
	children: Array<{
		text?: string;
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		code?: boolean;
		color?: string;
		size?: string;
		[key: string]: any;
	}>;
}

// Emoji with availability info for a specific user
export interface EmojiWithAvailability extends CustomEmoji {
	isAvailable: boolean; // Whether user has unlocked this emoji
	unlockRequirement?: string; // Human-readable text explaining unlock requirements
}

// Define a minimal user type for embedding in other interfaces
interface EmbeddedUser {
	id: number;
	username: string;
	avatarUrl: string | null;
	activeAvatarUrl?: string | null; // Make optional if not always present
	level?: number;
	role?: string;
	createdAt?: Date; // Ensure Date type
	clout?: number;
}

/**
 * Types for thread and post entities to avoid circular references
 * These are used when we need to reference these types without causing circular dependencies
 */

export interface ThreadWithUserAndCategory {
	id: number;
	uuid: string;
	title: string;
	slug: string;
	categoryId: number;
	userId: number;
	prefixId: number | null;
	isSticky: boolean;
	isLocked: boolean;
	isHidden: boolean;
	isFeatured: boolean;
	viewCount: number;
	postCount: number;
	firstPostLikeCount: number;
	lastPostAt: Date | null; // Changed to Date
	createdAt: Date; // Changed to Date
	updatedAt: Date; // Changed to Date
	isSolved: boolean;
	solvingPostId: number | null;
	user: EmbeddedUser; // Add user property
	hotScore: number; // Add hotScore property
	category?: {
		id: number;
		name: string;
		slug: string;
		description: string | null;
	};
	tags?: ThreadTag[];
	prefix?: {
		id: number;
		name: string;
		color: string | null;
	};
}

export interface PostWithUser {
	id: number;
	uuid: string;
	threadId: number;
	userId: number;
	replyToPostId: number | null;
	content: string;
	likeCount: number;
	tipCount: number;
	totalTips: number;
	isFirstPost: boolean;
	createdAt: Date; // Changed to Date
	updatedAt: Date; // Changed to Date
	// user property will be inherited if defined in base Post type via relations
}

export interface ThreadTag {
	id: number;
	name: string;
	slug: string;
	threadCount?: number;
}

export interface ThreadPrefix {
	id: number;
	name: string;
	color: string | null;
	isActive: boolean;
	position: number;
	categoryId: number | null;
	createdAt: string;
}
