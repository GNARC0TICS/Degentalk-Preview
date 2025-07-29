/**
 * Shop Items Configuration
 * Central configuration for all default shop items that are always available
 * Following the config-first architecture pattern
 */
export interface BaseShopItem {
    id: string;
    name: string;
    price: number;
    type: 'usernameColor' | 'avatarFrame' | 'userTitle';
    rarity: 'common' | 'rare' | 'epic' | 'mythic' | 'legendary';
    description?: string;
    isAlwaysAvailable: boolean;
}
export interface UsernameColorItem extends BaseShopItem {
    type: 'usernameColor';
    hex: string;
}
export interface AvatarFrameItem extends BaseShopItem {
    type: 'avatarFrame';
    cssClass: string;
}
export interface UserTitleItem extends BaseShopItem {
    type: 'userTitle';
    titleText: string;
}
export type ShopItem = UsernameColorItem | AvatarFrameItem | UserTitleItem;
/**
 * Default shop items that are always available
 * These items populate the shop UI and are seeded into the database
 */
export declare const defaultShopItems: ShopItem[];
/**
 * Shop categories for organizing items
 */
export declare const shopCategories: {
    readonly cosmetics: {
        readonly id: "cosmetics";
        readonly name: "Cosmetics";
        readonly description: "Customize your appearance";
        readonly subcategories: {
            readonly usernameColors: {
                readonly id: "username-colors";
                readonly name: "Username Colors";
                readonly type: "usernameColor";
            };
            readonly avatarFrames: {
                readonly id: "avatar-frames";
                readonly name: "Avatar Frames";
                readonly type: "avatarFrame";
            };
            readonly userTitles: {
                readonly id: "user-titles";
                readonly name: "User Titles";
                readonly type: "userTitle";
            };
        };
    };
};
/**
 * Helper function to get items by type
 */
export declare function getItemsByType<T extends ShopItem['type']>(type: T): Extract<ShopItem, {
    type: T;
}>[];
/**
 * Helper function to get item by ID
 */
export declare function getItemById(id: string): ShopItem | undefined;
/**
 * Type guards for item types
 */
export declare function isUsernameColorItem(item: ShopItem): item is UsernameColorItem;
export declare function isAvatarFrameItem(item: ShopItem): item is AvatarFrameItem;
export declare function isUserTitleItem(item: ShopItem): item is UserTitleItem;
