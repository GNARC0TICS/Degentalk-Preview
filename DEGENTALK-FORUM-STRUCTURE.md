# DegenTalk Forum Structure (2025)

## Three-Level Hierarchy

### 1. Zones
- **Type:** `'zone'`
- **Purpose:** High-level, thematic groupings for branding, navigation, and user discovery
- **Special Type:** **Primary Zones** (see below)
- **Notes:**
  - Zones do not contain threads or posts directly
  - They group categories and/or forums for navigation and UI structure
  - Used for carousel or grid displays at the top of /forums and on the homepage

### 2. Categories
- **Type:** `'category'`
- **Purpose:** Organizational layer within or outside zones
- **Notes:**
  - Categories group forums to improve organization and user navigation
  - Categories can exist inside zones or independently ("General Forums")
  - No threads or posts are made directly in categories

### 3. Forums
- **Type:** `'forum'`
- **Purpose:** The primary unit of content
- **Notes:**
  - All threads and posts are created in forums only (never in zones or categories)
  - Forums can exist inside categories, directly inside zones, or as general forums
  - All posting rules, XP multipliers, tipping flags, and access control are defined at the forum level

---

## 🚨 Primary Zones — Feature-Rich, Gamified Staff Areas

### What is a Primary Zone?
Primary Zones are not just themed groupings; they are special, staff-driven, feature-rich superzones.

**Purpose:**
- Serve as "main events" or flagship areas of the platform (casino floor, high-stakes arena, alpha-leaks, dev hub, etc.)
- Each primary zone comes with custom components, extra features, and staff-driven content/curation
- More gamified: custom XP rules, unique events, special quests, leaderboard widgets, zone-specific rewards

### Key Differences from General Forums

| Aspect | Primary Zone | General Forum |
|--------|--------------|---------------|
| **Location** | Top-level, visually prominent (carousel/grid) | Listed below carousel |
| **Content** | Staff/OG curated, possibly restricted posting | Open, community-driven |
| **Features** | Custom components/widgets, quests, leaderboards, special XP/tip mechanics, live events | Standard threads/posts, regular XP/tipping |
| **Gamification** | Enhanced: Zone-wide stats, unique rewards, roles, custom badges | Normal forum XP/tips |
| **Configurability** | Feature flags per zone, staff tools, component overrides | Standard config only |

### Primary Zone Features

```typescript
{
  slug: "casino",
  name: "Casino Zone",
  type: "zone",
  isPrimary: true,
  staffOnly: true,
  customComponents: ["LiveOddsWidget", "CasinoLeaderboard"],
  xpMultiplier: 2,
  features: ["quests", "airdrop", "zoneShop", "leaderboard"],
  xpChallenges: [
    {
      id: "first-bet",
      name: "First Bet",
      description: "Place your first prediction",
      xpReward: 100
    }
  ],
  zoneBadges: [
    {
      id: "high-roller",
      name: "High Roller",
      icon: "💰",
      requirement: "Win 10 predictions in a row"
    }
  ]
}
```

### Implementation Details

1. **Custom Components**: Each zone can register React components for unique UI
   - Live odds tickers
   - Zone-specific leaderboards
   - Event countdown timers
   - Special interaction widgets

2. **Gamification Systems**:
   - Zone-specific XP multipliers and challenges
   - Unique achievements and badges
   - Special airdrops and rewards
   - Zone shops for cosmetics/boosts

3. **Staff Management**:
   - Control posting permissions (staff-only threads, community replies)
   - Featured posts and pinned content
   - Zone-wide events and competitions
   - Custom moderation rules

---

## General Forums / Non-Zone Forums

- Forums and categories can exist outside of zones—these are called "General Forums"
- General Forums appear below the zone carousel on the /forums page
- All logic and business rules (posting, XP, tipping, permissions) are applied equally to both zoned and general forums

---

## Source of Truth and Config

**Canonical structure is defined by:**
- Database table: `forum_categories`
- Config file: `forumMap.config.ts`

**Frontend navigation and display are powered by:**
- `@home.tsx` (homepage displays zones + general forums)
- `@HierarchicalZoneNav.tsx` (navigation shows all zones, categories, and general forums)
- `/forums` (lists zones via carousel/grid; general forums beneath)

All logic is config-driven: Any changes to zones/categories/forums in config or DB are immediately reflected throughout the platform, without code changes.

---

## Summary Table

| Level | Type | Can have threads? | Appears in? | Notes |
|-------|------|-------------------|-------------|-------|
| Zone | `'zone'` | No | Carousel/grid, nav, homepage | Thematic/visual grouping only |
| Category | `'category'` | No | Nested in zone or general | Organizes forums |
| Forum | `'forum'` | Yes | All thread/post UIs | All posting logic/config here |

---

## User Experience Flow

1. User lands on `/forums` or homepage:
   - Sees Primary Zones in a prominent carousel/grid at the top
   - Sees General Forums listed below
2. Can browse into a zone → category → forum; or access a general forum directly
3. Creating or viewing threads/posts always happens inside a forum (never directly in a zone/category)
4. Primary Zones offer enhanced experiences with custom UI and gamification
5. Admins and config maintainers can add/remove/restructure zones, categories, forums via config or admin tools

---

## Core Rules

- **Only forums hold threads and posts**
- **Zones are for organization and experience enhancement**
- **Categories are optional organizational units**
- **Primary Zones are feature-rich, staff-curated experiences**
- **Config and DB are always the source of truth**
- **General forums are first-class—business logic applies equally to all forums**

---

## Developer Guidelines

When developing or reviewing code:
- Always enforce this structure—no threads outside forums
- No config outside the canonical map
- Never hardcode forum/category/zone relationships
- Check if a zone is "primary" for enhanced features
- Primary zones should use enhanced UX, custom components, and modular features 