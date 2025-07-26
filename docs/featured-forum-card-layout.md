# Featured Forum Card Layout Guide

## Overview
The Featured Forum Card uses a 3x3 CSS Grid layout to accommodate central artwork while positioning UI elements in the corners and sides.

## Grid Layout Structure

```
+------------------+------------------+------------------+
|   Top Left       |   Top Center     |   Top Right      |
| (XP Boost Badge) |   (Reserved)     | (Hot/Premium)    |
+------------------+------------------+------------------+
|  Middle Left     |  Middle Center   |  Middle Right    |
| (Forum Info)     |   (Reserved)     |    (Empty)       |
+------------------+------------------+------------------+
|  Bottom Left     |  Bottom Center   |  Bottom Right    |
|   (Stats)        |   (Reserved)     | (Activity/Rank)  |
+------------------+------------------+------------------+
```

## Zone Descriptions

### Reserved Zones (Center Column)
- **Top Center**: Reserved for artwork title/logo
- **Middle Center**: Reserved for main CTA button from artwork
- **Bottom Center**: Reserved for additional artwork elements

### Active Zones

#### Top Left
- XP Boost Badge (when applicable)

#### Top Right
- Hot/Trending badge
- Premium indicator

#### Middle Left
- Forum icon
- Forum name
- Contained in semi-transparent backdrop

#### Bottom Left
- Active users count
- Total threads count
- Compact stats display

#### Bottom Right
- Today's posts indicator
- Trending rank badge

## Design Principles

1. **Clear Center Channel**: The entire center column is kept clear for artwork
2. **Corner Balance**: UI elements are distributed to corners for visual balance
3. **Backdrop Containers**: Stats and info use semi-transparent backdrops for readability
4. **Hover State**: Enter button appears centered on hover (overlay)
5. **Responsive**: Grid adapts to different screen sizes

## Implementation Details

- Uses CSS Grid: `grid-cols-3 grid-rows-3`
- Aspect ratio: 9:4 (72:32)
- Gradient overlays on edges for text readability
- Z-index layering for proper element stacking