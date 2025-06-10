import React from 'react';
import Lottie from 'lottie-react';
import { Lock } from 'lucide-react';
import { cosmeticsConfig, EmojiDefinition, StickerDefinition } from '@/config/cosmetics.config';

interface EmojiStickerRendererProps {
    item: EmojiDefinition | StickerDefinition;
    isUnlocked: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    showLockOverlay?: boolean;
}

/**
 * Centralized renderer for emojis and stickers that supports:
 * - .lottie animations
 * - .webp/.gif/.png static images
 * - Unlock state management
 * - Lock overlay for locked items
 */
export function EmojiStickerRenderer({
    item,
    isUnlocked,
    size = 'md',
    className = '',
    onClick,
    showLockOverlay = true,
}: EmojiStickerRendererProps) {
    // Size configurations
    const sizeMap = {
        sm: { width: 20, height: 20, container: 'w-5 h-5' },
        md: { width: 32, height: 32, container: 'w-8 h-8' },
        lg: { width: 48, height: 48, container: 'w-12 h-12' },
    };

    const { width, height, container } = sizeMap[size];

    // Handle click with unlock check
    const handleClick = () => {
        if (!isUnlocked && showLockOverlay) {
            return; // Don't allow interaction with locked items
        }
        onClick?.();
    };

    // Render the media based on type
    const renderMedia = () => {
        switch (item.mediaType) {
            case 'lottie':
                // For Lottie animations, use the main src as animation data
                // In production, you'd fetch this JSON data
                return (
                    <div className={`${container} flex items-center justify-center`}>
                        <Lottie
                            animationData={item.src} // In real implementation, this would be fetched JSON
                            loop={true}
                            style={{ width, height }}
                            className="max-w-full max-h-full"
                        />
                    </div>
                );

            case 'static':
            case 'webp':
            case 'gif':
            default:
                return (
                    <div className={`${container} flex items-center justify-center`}>
                        <img
                            src={item.src}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                            style={{ width, height }}
                            loading="lazy"
                        />
                    </div>
                );
        }
    };

    return (
        <div
            className={`relative inline-block ${className} ${onClick ? 'cursor-pointer' : ''
                } ${!isUnlocked && showLockOverlay ? 'opacity-50' : ''}`}
            onClick={handleClick}
            title={isUnlocked ? item.name : `Locked: ${item.name}`}
        >
            {renderMedia()}

            {/* Lock overlay for locked items */}
            {!isUnlocked && showLockOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                    <Lock className="w-3 h-3 text-white" />
                </div>
            )}
        </div>
    );
}

/**
 * Emoji-specific renderer with emoji config lookup
 */
export function EmojiRenderer({
    emojiId,
    isUnlocked,
    size = 'md',
    className = '',
    onClick,
    showLockOverlay = true,
}: {
    emojiId: string;
    isUnlocked: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    showLockOverlay?: boolean;
}) {
    const emoji = cosmeticsConfig.emojis[emojiId];

    if (!emoji) {
        console.warn(`Emoji with ID "${emojiId}" not found in config`);
        return null;
    }

    return (
        <EmojiStickerRenderer
            item={emoji}
            isUnlocked={isUnlocked}
            size={size}
            className={className}
            onClick={onClick}
            showLockOverlay={showLockOverlay}
        />
    );
}

/**
 * Sticker-specific renderer with sticker config lookup
 */
export function StickerRenderer({
    stickerId,
    isUnlocked,
    size = 'lg', // Stickers are typically larger
    className = '',
    onClick,
    showLockOverlay = true,
}: {
    stickerId: string;
    isUnlocked: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    showLockOverlay?: boolean;
}) {
    const sticker = cosmeticsConfig.stickers[stickerId];

    if (!sticker) {
        console.warn(`Sticker with ID "${stickerId}" not found in config`);
        return null;
    }

    return (
        <EmojiStickerRenderer
            item={sticker}
            isUnlocked={isUnlocked}
            size={size}
            className={className}
            onClick={onClick}
            showLockOverlay={showLockOverlay}
        />
    );
}

/**
 * Utility to get emoji/sticker by code
 */
export function findEmojiByCode(code: string): EmojiDefinition | null {
    return Object.values(cosmeticsConfig.emojis).find(emoji => emoji.code === code) || null;
}

export function findStickerByCode(code: string): StickerDefinition | null {
    return Object.values(cosmeticsConfig.stickers).find(sticker => sticker.code === code) || null;
}

/**
 * Parse text for emoji codes and replace with rendered emojis
 * This would be used in text processing for inline emoji rendering
 */
export function parseEmojiCodes(
    text: string,
    hasUnlockedItem: (itemId: string, type: 'emoji' | 'sticker') => boolean
): React.ReactNode[] {
    const emojiRegex = /:([a-zA-Z0-9_]+):/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = emojiRegex.exec(text)) !== null) {
        // Add text before emoji
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const emojiCode = `:${match[1]}:`;
        const emoji = findEmojiByCode(emojiCode);

        if (emoji) {
            const isUnlocked = hasUnlockedItem(emoji.id, 'emoji');
            parts.push(
                <EmojiRenderer
                    key={`${emoji.id}-${match.index}`}
                    emojiId={emoji.id}
                    isUnlocked={isUnlocked}
                    size="sm"
                    className="inline-block mx-1"
                />
            );
        } else {
            // Keep original text if emoji not found
            parts.push(match[0]);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
} 