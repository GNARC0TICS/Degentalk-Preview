export interface ShopItem {
    id: string;
    label: string;
    cost: number;
    type: 'vanity' | 'functional';
    description?: string;
    gatedByLevel?: number;
    rarity?: 'common' | 'rare' | 'epic' | 'mythic' | 'legendary';
    isLimited?: boolean;
}
export declare const shopItems: ShopItem[];
//# sourceMappingURL=shop-items.d.ts.map