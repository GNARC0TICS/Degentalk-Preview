# Forum Route Map

_This document provides a visual and tabular sitemap of all forum and zone routes for Degentalk._

---

## 1. Visual Sitemap

```
/forums
  ↳ /forum/market-moves
  ↳ /forum/airdrops-and-quests
  ↳ /mission-control
  ↳ /the-pit
  ↳ /the-vault
  ↳ /briefing-room/suggestions
  // ...more
```

## 2. Route Table

| Route                        | Type         | Config/Zone Key      | Renderer/Layout         | Renderer Example         | Access Control |
|------------------------------|-------------|---------------------|------------------------|-------------------------|---------------|
| /forums                      | Index       | -                   | ForumsIndexPage        | <ForumsIndexPage />     | all           |
| /forum/market-moves          | General     | market-moves        | GeneralZoneLayout      | <GeneralZoneLayout />   | all           |
| /mission-control             | Primary     | mission-control     | PrimaryZoneLayout      | <PrimaryZoneLayout />   | admin/mod     |
| /the-pit                     | Primary     | the-pit             | PrimaryZoneLayout      | <PrimaryZoneLayout />   | all           |
| /the-vault                   | Primary     | the-vault           | PrimaryZoneLayout      | <PrimaryZoneLayout />   | gated         |
| /briefing-room/suggestions   | Primary     | briefing-room       | PrimaryZoneLayout      | <PrimaryZoneLayout />   | mod/admin     |
| ...                          | ...         | ...                 | ...                    | ...                    | ...           |

## 3. Reserved Slugs & Notes
- List of all reserved slugs (cannot be used for usernames, etc.)
- Notes on access control, dynamic rendering, and future expansion

---

_This document will be updated as new zones/routes are added or migrated._ 