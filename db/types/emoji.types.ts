import type { CustomEmoji } from '../schema/forum/customEmojis';
import type { CustomEmojiId } from './id.types';

export interface EmojiWithAvailability extends CustomEmoji {
	isAvailable: boolean;
	unlockRequirement?: string;
}

// Export the alias for backwards compatibility
export type EmojiId = CustomEmojiId;
