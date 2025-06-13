import { CustomEmoji } from '../schema/forum/customEmojis';

export interface EmojiWithAvailability extends CustomEmoji {
  isAvailable: boolean;
  unlockRequirement?: string;
} 