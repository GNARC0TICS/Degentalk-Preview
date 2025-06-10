# DegenTalk Shop System Docs

"Welcome to the only store where Cope is a common item and Exit Liquidity is a flex."

---

## 📚 Table of Contents
1.  Overview
2.  Rarity Tiers
3.  Item Types
4.  `plugin_reward` Format
5.  Inventory & Equipping
6.  Admin Panel Integration
7.  Unlock & Drop Mechanics (Conceptual)
8.  Future Ideas (Conceptual)

---

## 1. Overview

The DegenTalk Shop allows users to purchase cosmetics, XP boosters, perks, and potential 1/1 mythic items using DGT (Degen Tokens). Items are tied to rarity tiers and offer equippable functionality or passive effects. The system is designed to enhance user engagement and provide a way to showcase status and achievements within the forum.

---

## 2. Rarity Tiers

The DegenTalk Shop uses the following rarity ladder (v2.0 - No Copium Edition):

| Tier | Name             | Tooltip / Flavor Text                     | Max Supply         |
|------|------------------|-------------------------------------------|--------------------|
| 🟫    | Cope             | "Whatever helps you sleep at night."      | ∞ (Unlimited)      |
| 🟨    | Normie           | "Still bullish on CNBC signals."          | ∞ (Unlimited)      |
| 🟪    | Bagholder        | "Rugged, delisted, and still checking the chart." | Variable           |
| 🔵    | Max Bidder       | "No bankroll management. Just vibes."     | Variable           |
| 🟧    | High Roller      | "Hits 100x or vanishes into legend."      | 10–50 (Low)        |
| 🟥    | Exit Liquidity   | "You became the market."                  | 1-10 (Ultra Low)   |

**Mythic Tier (Exit Liquidity) Design Notes:**
*   Ultra-exclusive, intended as 1/1 or very limited (e.g., 1/10).
*   Flavor: This isn't the prize — it's the price.
*   Potential Effects:
    *   Causes other users' tooltips/UI elements to reference the owner's wallet/profile.
    *   Unlocks an exclusive chat channel or forum section (e.g., "The Top").
    *   Auto-applies a unique, highly visible title or profile effect (e.g., 🏁 Final Buyer).

---

## 3. Item Types

The shop can feature a variety of item types, primarily managed through the `plugin_reward` field. Current and planned item types include:

*   **Username Color**: Modifies the color of a user's displayed name.
    *   `pluginReward.type`: `"usernameColor"`
*   **User Title**: Displays a custom title next to or under a user's name.
    *   `pluginReward.type`: `"userTitle"`
*   **Avatar Frame**: Adds a cosmetic frame around a user's avatar.
    *   `pluginReward.type`: `"avatarFrame"`
*   **Emoji Pack**: Unlocks a set of custom emojis for use in posts and messages.
    *   `pluginReward.type`: `"emojiPack"`
*   **Feature Unlock**: Grants access to specific platform features (e.g., custom signature fonts, advanced post formatting).
    *   `pluginReward.type`: `"featureUnlock"`
*   **XP Boosters**: Temporarily increases the rate at which a user earns XP. (Conceptual)
*   **Access Passes**: Grants access to gated forums or private groups. (Conceptual)

---

## 4. `plugin_reward` Format

Each shop item (`products` table) contains a `plugin_reward` JSON field that defines its specific effect(s) and parameters. The client-side `applyPluginRewards()` utility interprets this JSON to render the cosmetics.

**General Structure:**
```json
{
  "type": "cosmetic_type_identifier",
  "value": "specific_value_for_the_type",
  // Additional properties specific to the type
  "name": "Display Name of Cosmetic Effect",
  "description": "Brief description of what it does"
}
```

**Examples:**

*   **Username Color:**
    ```json
    {
      "type": "usernameColor",
      "value": "#FF5733", // Hex color code
      "name": "Fiery Orange Username",
      "description": "Makes your username appear fiery orange."
    }
    ```
*   **User Title:**
    ```json
    {
      "type": "userTitle",
      "value": "OG Degen",
      "name": "OG Degen Title",
      "description": "Displays 'OG Degen' next to your username."
    }
    ```
*   **Avatar Frame:**
    ```json
    {
      "type": "avatarFrame",
      "value": "/frames/legendary-flame-frame.webp", // URL to the frame image asset
      "name": "Legendary Flame Frame",
      "description": "Surrounds your avatar with legendary flames."
    }
    ```
*   **Emoji Pack:**
    ```json
    {
      "type": "emojiPack",
      "value": {
        "degen_stonks": "/emojis/degen_stonks.gif",
        "moon_lambo": "/emojis/moon_lambo.png"
      },
      "name": "Degen Emoji Pack",
      "description": "Unlocks the Degen Stonks and Moon Lambo emojis."
    }
    ```
*   **Feature Unlock:**
    ```json
    {
      "type": "featureUnlock",
      "value": "animatedSignatures", // Identifier for the feature being unlocked
      "name": "Animated Signatures",
      "description": "Allows you to use animated GIFs in your forum signature."
    }
    ```

The `type` field is crucial as it dictates how the `value` and other properties are interpreted by the `applyPluginRewards()` function and client-side components.

---

## 5. Inventory & Equipping

*   **Storage**: Purchased or granted items are stored in the `userInventory` table, linking `userId`, `productId`, and tracking `equipped` status (boolean) and `quantity`.
*   **Equipping Logic**:
    *   Users can typically equip one item per "slot" or `pluginReward.type`. For example, a user can have one `usernameColor`, one `userTitle`, and one `avatarFrame` equipped simultaneously.
    *   When a new item is equipped, any existing item of the same `pluginReward.type` for that user is automatically unequipped. This is handled server-side in `inventory.admin.controller.ts` (`/api/admin/user-inventory/:userId/equip/:inventoryId`).
*   **Admin Control**: Administrators can view user inventories, grant items, and potentially revoke/burn items via the admin panel (`/admin/users/:userId`).

---

## 6. Admin Panel Integration

The primary admin interface for the shop system is located under `/admin/shop` and `/admin/users/`.

*   **Shop Management (`/admin/shop`):**
    *   **View Items (`/admin/shop` - `AdminShopListPage`):** Lists all products with their name, price, rarity, status, and stock.
    *   **Create/Edit Item (`/admin/shop/edit` or `/admin/shop/edit/[productId]` - `AdminShopItemEditPage`):**
        *   Allows creation of new shop items or modification of existing ones.
        *   Fields: Name, Description, Price (DGT), Points Price (optional), Stock Limit, Rarity, Status, Plugin Reward (JSON).
        *   Submission: `POST /api/admin/shop-management/products` (for new) or `PUT /api/admin/shop-management/products/:productId` (for existing).
*   **User Inventory Management (`/admin/users/[userId]` - `AdminUserInventoryPage` - *Planned*):**
    *   View a specific user's inventory, showing item names, and their equipped status.
    *   Buttons to equip/unequip items for the user (calls `/api/admin/user-inventory/:userId/equip/:inventoryId` and `/unequip/:inventoryId`).
    *   Section to grant new items to the user from a dropdown of available products (calls `POST /api/admin/user-inventory/:userId/grant`).

---

## 7. Unlock & Drop Mechanics (Conceptual - Future Enhancements)

While the MVP focuses on direct purchase and admin granting, future enhancements could include:

*   **Rarity-based Drop Pools**: Lootbox-style mechanics where users can purchase a "mystery item" that draws from a pool based on rarity probabilities.
*   **Achievement-Unlocked Items**: Specific items automatically granted or unlocked in the shop upon reaching milestones (e.g., "Reach Level 20 to unlock the 'Seasoned Degen' title").
*   **Timed Events & Shop Rotations**: Limited-time items or shop categories that rotate periodically.
*   **Forum Rain Drops**: Admins or automated systems could randomly "drop" items to active users in a thread or across the forum.

---

## 8. Future Ideas (Conceptual)

Further ideas to expand the shop and cosmetics system:

*   **Shopfront Animations**: Dynamic visual elements in the shop based on item rarity or featured items.
*   **Cosmetic Previews**: Allow users to preview how a cosmetic would look on their profile/posts before purchasing.
*   **Vault Tab**: A section in user profiles to display all owned cosmetics, not just equipped ones, and perhaps a history of rare/mythic items owned.
*   **Forum-wide Mythic Tracker**: A leaderboard or special page showcasing who currently owns the ultra-rare Mythic items like "Exit Liquidity."
*   **User-to-User Gifting/Trading/Auction System**: Allow users to interact with each other regarding owned items.
*   **Weekly Rotating Black Market**: A special section of the shop with unique or discounted items that change weekly.
*   **Crafting/Combining**: Allow users to combine multiple lower-tier items to craft a higher-tier one. 