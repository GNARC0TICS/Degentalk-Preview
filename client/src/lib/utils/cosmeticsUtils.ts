interface UserInventoryItem {
  id: string | number;
  productId: string | number;
  userId: string | number;
  equipped: boolean;
  quantity: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product: {
    id: string | number;
    name: string;
    pluginReward?: {
      type: string;
      value: any;
      // other potential fields like duration, intensity etc.
    };
    // other product fields
  };
}

interface AppliedCosmetics {
  usernameColor?: string;
  userTitle?: string;
  avatarFrameUrl?: string;
  emojiMap: Record<string, string>;
  unlockedFeatures: string[];
}

/**
 * Process user inventory and extract equipped cosmetic effects
 * @param inventory - Array of user inventory items with product details
 * @returns Object containing all active cosmetic effects
 */
export function applyPluginRewards(inventory: UserInventoryItem[]): AppliedCosmetics {
  // Initialize result with defaults
  const result: AppliedCosmetics = {
    emojiMap: {},
    unlockedFeatures: []
  };

  // Filter to only equipped items
  const equippedItems = inventory.filter(item => item.equipped);

  // Process each equipped item
  for (const item of equippedItems) {
    const pluginReward = item.product?.pluginReward;
    
    if (!pluginReward || !pluginReward.type) {
      continue;
    }

    // Apply effects based on type
    switch (pluginReward.type) {
      case 'usernameColor':
        // Last equipped username color wins
        result.usernameColor = pluginReward.value;
        break;

      case 'userTitle':
        // Last equipped title wins
        result.userTitle = pluginReward.value;
        break;

      case 'avatarFrame':
        // Last equipped frame wins
        result.avatarFrameUrl = pluginReward.value;
        break;

      case 'emojiPack':
        // Merge emoji packs (multiple packs can be active)
        if (typeof pluginReward.value === 'object' && pluginReward.value !== null) {
          Object.assign(result.emojiMap, pluginReward.value);
        }
        break;

      case 'featureUnlock':
        // Add to unlocked features array
        if (typeof pluginReward.value === 'string') {
          result.unlockedFeatures.push(pluginReward.value);
        }
        break;

      // Add more cosmetic types as needed
      default:
        console.warn(`Unknown cosmetic type: ${pluginReward.type}`);
    }
  }

  return result;
}

/**
 * Check if a specific feature is unlocked
 * @param inventory - User inventory items
 * @param featureName - Name of the feature to check
 * @returns Boolean indicating if feature is unlocked
 */
export function isFeatureUnlocked(inventory: UserInventoryItem[], featureName: string): boolean {
  const cosmetics = applyPluginRewards(inventory);
  return cosmetics.unlockedFeatures.includes(featureName);
}

/**
 * Get the rarity color class for a given rarity
 * @param rarity - Rarity level (common, uncommon, rare, epic, legendary)
 * @returns Tailwind CSS classes for the rarity color
 */
export function getRarityColorClass(rarity: string): string {
  switch (rarity?.toLowerCase()) {
    case 'legendary':
      return 'text-yellow-500 border-yellow-500';
    case 'epic':
      return 'text-purple-500 border-purple-500';
    case 'rare':
      return 'text-blue-500 border-blue-500';
    case 'uncommon':
      return 'text-green-500 border-green-500';
    case 'common':
    default:
      return 'text-gray-500 border-gray-500';
  }
}

/**
 * Replace emoji codes in text with emoji images
 * @param text - Text containing emoji codes like :custom_smile:
 * @param emojiMap - Map of emoji codes to image URLs
 * @returns React elements with text and emoji images
 */
export function renderTextWithCustomEmojis(text: string, emojiMap: Record<string, string>): (string | JSX.Element)[] {
  const emojiRegex = /:([a-zA-Z0-9_\-]+):/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = emojiRegex.exec(text)) !== null) {
    // Add text before emoji
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const emojiCode = match[1];
    const emojiUrl = emojiMap[emojiCode];

    if (emojiUrl) {
      // Add emoji image
      parts.push(
        <img
          key={`emoji-${match.index}`}
          src={emojiUrl}
          alt={`:${emojiCode}:`}
          className="inline-block w-5 h-5 mx-1 align-text-bottom"
          style={{ verticalAlign: 'middle' }}
        />
      );
    } else {
      // Keep original text if emoji not found
      parts.push(match[0]);
    }

    lastIndex = emojiRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
} 