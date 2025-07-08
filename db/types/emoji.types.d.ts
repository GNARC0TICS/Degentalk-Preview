import type { CustomEmoji } from '../schema/forum/customEmojis';
import type { EmojiId as CustomEmojiId } from '@shared/types/ids';
export interface EmojiWithAvailability extends CustomEmoji {
    isAvailable: boolean;
    unlockRequirement?: string;
}
export type EmojiId = CustomEmojiId;
//# sourceMappingURL=emoji.types.d.ts.map