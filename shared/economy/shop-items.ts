export interface ShopItem {
  id: string;
  label: string;
  cost: number; // Cost in DGT
  type: 'vanity' | 'functional';
  description?: string;
  gatedByLevel?: number; // Min user level required
  rarity?: 'common' | 'rare' | 'epic' | 'mythic' | 'legendary';
  isLimited?: boolean; // Limited-edition item (seasonal / one-off)
}

// Canonical Degen Shop catalogue (see XP-DGT Source-of-Truth)
export const shopItems: ShopItem[] = [
  {
    id: 'signature_enable',
    label: 'Enable Signature',
    cost: 10,
    type: 'functional'
  },
  {
    id: 'custom_color',
    label: 'Custom Username Color',
    cost: 20,
    type: 'vanity'
  },
  {
    id: 'animated_sig',
    label: 'Animated Signature',
    cost: 75,
    type: 'vanity',
    rarity: 'rare'
  },
  {
    id: 'gradient_username',
    label: 'Gradient Username',
    cost: 150,
    type: 'vanity',
    rarity: 'epic'
  },
  {
    id: 'animated_flair',
    label: 'Animated Flair Trail',
    cost: 200,
    type: 'vanity',
    rarity: 'epic'
  },
  {
    id: 'font_pack',
    label: 'Custom Font Pack',
    cost: 250,
    type: 'vanity',
    rarity: 'mythic'
  },
  {
    id: 'theme_skin',
    label: 'Legendary Theme Skin',
    cost: 500,
    type: 'vanity',
    rarity: 'legendary',
    isLimited: true
  }
] as const; 