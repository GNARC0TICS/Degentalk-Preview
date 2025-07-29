/**
 * Title Utilities
 * Shared utilities for title validation, CSS generation, and business logic
 */
/**
 * Validates if a title meets its unlock requirements for a user
 */
export function validateTitleUnlock(title, userLevel, userRoleIds, userAchievements) {
    if (!title.unlockRequirements) {
        return { canUnlock: true };
    }
    const req = title.unlockRequirements;
    // Check level requirement
    if (req.level && userLevel < req.level) {
        return {
            canUnlock: false,
            reason: `Requires level ${req.level} (current: ${userLevel})`
        };
    }
    // Check role requirement
    if (req.roleIds && req.roleIds.length > 0) {
        const hasRequiredRole = req.roleIds.some(roleId => userRoleIds.includes(roleId));
        if (!hasRequiredRole) {
            return {
                canUnlock: false,
                reason: 'Requires specific role'
            };
        }
    }
    // Check achievement requirement
    if (req.achievementIds && req.achievementIds.length > 0) {
        const hasAllAchievements = req.achievementIds.every(achId => userAchievements.includes(achId));
        if (!hasAllAchievements) {
            return {
                canUnlock: false,
                reason: 'Missing required achievements'
            };
        }
    }
    // TODO: Implement custom condition evaluation
    if (req.customCondition) {
        // For now, return false for custom conditions
        return {
            canUnlock: false,
            reason: 'Custom unlock condition not met'
        };
    }
    return { canUnlock: true };
}
/**
 * Gets the display priority for title sorting
 */
export function getTitlePriority(title) {
    const rarityPriority = {
        'common': 10,
        'uncommon': 20,
        'rare': 30,
        'epic': 40,
        'legendary': 50,
        'mythic': 60
    };
    const categoryPriority = {
        'special': 1000, // Highest priority
        'event': 900,
        'mythic': 800,
        'legendary': 700,
        'achievement': 600,
        'role': 500,
        'shop': 400,
        'level': 300 // Lowest priority
    };
    const rarity = title.rarity;
    const category = title.category;
    return (categoryPriority[category] || 0) + (rarityPriority[rarity] || 0) + (title.sortOrder || 0);
}
/**
 * Generates CSS styles for a title
 */
export function generateTitleStyles(title) {
    const styles = {};
    // Typography
    if (title.fontFamily)
        styles.fontFamily = title.fontFamily;
    if (title.fontSize)
        styles.fontSize = `${title.fontSize}px`;
    if (title.fontWeight)
        styles.fontWeight = title.fontWeight;
    // Colors
    if (title.textColor)
        styles.color = title.textColor;
    if (title.backgroundColor)
        styles.backgroundColor = title.backgroundColor;
    // Border
    if (title.borderColor || title.borderWidth || title.borderStyle) {
        const width = title.borderWidth || 1;
        const style = title.borderStyle || 'solid';
        const color = title.borderColor || 'transparent';
        styles.border = `${width}px ${style} ${color}`;
    }
    if (title.borderRadius)
        styles.borderRadius = `${title.borderRadius}px`;
    // Gradient background
    if (title.gradientStart && title.gradientEnd) {
        const direction = title.gradientDirection || 'to right';
        styles.backgroundImage = `linear-gradient(${direction}, ${title.gradientStart}, ${title.gradientEnd})`;
    }
    // Glow effect
    if (title.glowColor && title.glowIntensity) {
        styles.boxShadow = `0 0 ${title.glowIntensity}px ${title.glowColor}`;
    }
    // Text shadow
    if (title.shadowColor) {
        const blur = title.shadowBlur || 2;
        const offsetX = title.shadowOffsetX || 0;
        const offsetY = title.shadowOffsetY || 0;
        styles.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${title.shadowColor}`;
    }
    // Animation
    if (title.animation) {
        const duration = title.animationDuration || 2;
        styles.animation = `${title.animation} ${duration}s infinite`;
    }
    return styles;
}
/**
 * Gets CSS classes for a title based on rarity and effects
 */
export function getTitleClasses(title) {
    const classes = ['user-title'];
    // Map predefined styles to CSS classes
    const predefinedStyles = {
        'paper': 'paper',
        'bronze': 'bronze',
        'silver': 'silver',
        'gold': 'gold',
        'platinum': 'platinum',
        'diamond': 'diamond',
        'mod': 'mod',
        'whale': 'whale'
    };
    // Check if this is a predefined style
    const styleName = title.name?.toLowerCase().replace(/[^a-z]/g, '');
    if (styleName && predefinedStyles[styleName]) {
        classes.push(predefinedStyles[styleName]);
    }
    else {
        // Use custom styling for database-driven titles
        classes.push('custom');
    }
    // Add effect classes
    if (title.effects) {
        title.effects.forEach(effect => {
            if (['glow', 'shimmer', 'pulse'].includes(effect)) {
                classes.push(effect);
            }
        });
    }
    // Add clickable class if needed
    // This will be added by the component based on props
    return classes.join(' ');
}
/**
 * Gets the rarity color for a title
 */
export function getRarityColor(rarity) {
    const colors = {
        'common': '#9CA3AF', // zinc-400
        'uncommon': '#10B981', // emerald-500
        'rare': '#3B82F6', // blue-500
        'epic': '#8B5CF6', // violet-500
        'legendary': '#F59E0B', // amber-500
        'mythic': '#EF4444' // red-500
    };
    return colors[rarity] || colors.common;
}
/**
 * Formats a title for display
 */
export function formatTitleDisplay(title) {
    const displayText = title.name.toUpperCase();
    if (title.emoji) {
        return `${title.emoji} ${displayText}`;
    }
    return displayText;
}
/**
 * Checks if a title can be purchased
 */
export function canPurchaseTitle(title, userCurrency) {
    if (!title.isShopItem || !title.shopPrice || !title.shopCurrency) {
        return false;
    }
    const userAmount = userCurrency[title.shopCurrency] || 0;
    return userAmount >= title.shopPrice;
}
/**
 * Migration helper: Converts legacy title format to new format
 */
export function migrateLegacyTitle(legacyTitle) {
    return {
        name: legacyTitle.name || legacyTitle.title,
        description: legacyTitle.description,
        iconUrl: legacyTitle.iconUrl || legacyTitle.icon,
        emoji: legacyTitle.icon, // Assume icon is emoji if no iconUrl
        rarity: legacyTitle.rarity || 'common',
        category: legacyTitle.category || 'level',
        unlockType: legacyTitle.unlockType || 'level',
        isShopItem: legacyTitle.isShopItem || false,
        shopPrice: legacyTitle.shopPrice || legacyTitle.price,
        shopCurrency: legacyTitle.shopCurrency || 'DGT',
        isActive: true,
        sortOrder: 0
    };
}
