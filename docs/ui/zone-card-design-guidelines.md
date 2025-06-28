---
title: zone card design guidelines
status: STABLE
updated: 2025-06-28
---

# Zone Card Design Guidelines

## Overview
The ZoneCard component is a core UI element that represents Primary Zones in Degentalk's forum structure. Unlike regular category cards, Zone Cards are specialized, visually distinct elements that represent canonical forum destinations rather than expandable categories.

## Component Purpose
- Visually represent Primary Zones with distinct branding
- Provide clear navigation to single-forum destinations
- Support dynamic theming and visual states
- Indicate special zone features (XP boosts, events, etc.)

## Props Interface

```typescript
interface ZoneCardProps {
  // Core data
  id: string | number;
  name: string;
  slug: string;
  description: string;
  
  // Visual customization
  icon?: string;                // Emoji or icon identifier
  colorTheme?: string;          // Theme key (e.g., 'pit', 'casino', etc.)
  
  // Stats and metadata
  threadCount?: number;
  postCount?: number;
  activeUsersCount?: number;    // Current users browsing
  
  // Special states
  hasXpBoost?: boolean;         // If zone has XP boost active
  boostMultiplier?: number;     // XP multiplier if applicable
  isEventActive?: boolean;      // If zone has special event
  eventData?: {                 // Event metadata if applicable
    name: string;
    endsAt: Date;
  };
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';  // For future loot-style styling
  
  // Component behavior
  className?: string;           // For custom styling
  onClick?: () => void;         // Optional click handler
}
```

## Visual Design Guidelines

### Base Card Structure
- **Dimensions**: Responsive, minimum height 180px on desktop, full width on mobile
- **Shape**: Rounded corners (use Tailwind `rounded-lg` or similar)
- **Layout**: Flexible grid with emphasis on zone name and icon
- **Content Organization**:
  - Top: Icon + Zone Name
  - Middle: Description
  - Bottom: Stats (threads, posts, active users)
  - Special indicators (XP boost, events) should be positioned prominently

### Theme Implementation

Each zone should have a distinct visual identity through its `colorTheme` property:

#### Base Implementation Example
```tsx
// Example colorTheme CSS implementation
<div className={`zone-card zone-theme-${colorTheme || 'default'}`}>
  {/* Card content */}
</div>
```

#### Theme-Specific Styling

Define CSS classes for each theme in a dedicated stylesheet:

```css
/* Zone themes */
.zone-theme-pit {
  background: linear-gradient(135deg, #2a0101 0%, #500101 100%);
  border-color: #ff5151;
}

.zone-theme-mission {
  background: linear-gradient(135deg, #012a1c 0%, #015036 100%);
  border-color: #51ffb0;
}

.zone-theme-casino {
  background: linear-gradient(135deg, #2a0127 0%, #500142 100%);
  border-color: #ff51eb;
}

.zone-theme-briefing {
  background: linear-gradient(135deg, #01182a 0%, #012c50 100%);
  border-color: #51a2ff;
}

.zone-theme-archive {
  background: linear-gradient(135deg, #272a01 0%, #504901 100%);
  border-color: #ffeb51;
}
```

### Special State Styling

#### XP Boost Indicator
- Visual cue: Pulse glow effect on card border
- Color: Green/emerald to indicate XP gain
- Badge or pill showing multiplier (e.g., "2x XP")

```tsx
// Example XP boost styling
{hasXpBoost && (
  <div className="absolute top-2 right-2">
    <Badge className="bg-emerald-500 animate-pulse-glow">
      {boostMultiplier}x XP
    </Badge>
  </div>
)}
```

#### Event Active Indicator
- Distinct banner or ribbon across card corner
- Timer showing event time remaining if applicable
- Higher visual contrast compared to the base card

#### Rarity Styling (Future Implementation)
For loot-style rarity differentiation:
- **Common**: Subtle, neutral styling
- **Uncommon**: Light glow effect
- **Rare**: Medium glow effect + subtle animation
- **Epic**: Strong glow effect + animated border
- **Legendary**: Premium visual effects (particles, strong animation)

### Hover & Interactive States

#### Hover State
- Subtle scale transform (1.02-1.05x)
- Increased border brightness
- Optional light elevation (shadow)

```css
.zone-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.zone-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  border-color: var(--highlight-color);
}
```

#### Active/Clicked State
- Slight scale reduction (0.98x)
- Brief flash effect or other visual feedback

### Icon Implementation

Icons can be implemented in multiple ways:
1. **Emoji**: Simple text emoji (e.g., "🔥" for The Pit)
2. **SVG Icons**: Custom SVG icons from icon library
3. **Component Icons**: Lucide React or similar icon components

Example implementation:
```tsx
// Icon rendering logic
const renderIcon = () => {
  // If icon is an emoji (starts with a character that could be emoji)
  if (icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(icon)) {
    return <span className="text-3xl mr-2">{icon}</span>;
  }
  
  // If icon is a known component name
  const IconComponent = iconMap[icon as keyof typeof iconMap];
  if (IconComponent) {
    return <IconComponent className="h-6 w-6 mr-2" />;
  }
  
  // Fallback
  return <FolderIcon className="h-6 w-6 mr-2" />;
};
```

## Responsive Behavior

The ZoneCard should adapt across different screen sizes:

### Desktop
- Display in grid layout (3-4 cards per row)
- Full visual treatments and animations
- Mouse hover effects

### Tablet
- 2 cards per row
- Slightly simplified animations

### Mobile
- Single column layout (full width)
- Reduced height
- Touch-optimized interactions
- Simplified visual effects for performance

## Accessibility Considerations

- Ensure sufficient color contrast between text and background
- Include proper ARIA attributes for interactive elements
- Ensure all interactive elements are keyboard accessible
- Provide focus states that are visually distinct

## Usage Examples

### Basic Zone Card
```tsx
<ZoneCard
  id="the-pit"
  name="The Pit"
  slug="the-pit"
  description="Raw, unfiltered degenerate discussion. No rules, just rage."
  icon="🔥"
  colorTheme="pit"
  threadCount={1250}
  postCount={8923}
/>
```

### Zone Card with XP Boost
```tsx
<ZoneCard
  id="mission-control"
  name="Mission Control"
  slug="mission-control"
  description="Strategic alpha and high-value discussion."
  icon="🎯"
  colorTheme="mission"
  threadCount={750}
  postCount={4200}
  hasXpBoost={true}
  boostMultiplier={2.5}
/>
```

### Zone Card with Active Event
```tsx
<ZoneCard
  id="casino-floor"
  name="The Casino Floor"
  slug="casino-floor"
  description="Trading strategies and market plays."
  icon="🎰"
  colorTheme="casino"
  threadCount={980}
  postCount={5432}
  isEventActive={true}
  eventData={{
    name: "Prediction Tournament",
    endsAt: new Date("2025-06-01T00:00:00Z")
  }}
/>
```

## Integration Notes
- Zone Cards should be used on the homepage in a dedicated "Primary Zones" section
- They can also be featured in sidebar navigation with simplified styling
- Consider adding zone-specific header styling when viewing a zone's content 