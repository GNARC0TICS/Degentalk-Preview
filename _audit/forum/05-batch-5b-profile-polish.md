### 🔧 Profile Polish: Visual + Accessibility Fixes (From UX Audit 2025-06-15)

- [x] Compress `ProfileBackground` banner height to max `30vh` on desktop.
- [ ] Make `StatCard` grid responsive using `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`. (Skipped: StatCard.tsx not found)
- [x] Add `aria-label` to icon-only buttons (Follow, Whisper, Tip, Share). (Reviewed: Profile action buttons have text; other instances have labels)
- [x] Fix WCAG contrast for color-only rarity badges (e.g. amber 400 on amber 900). (Improved mythic rarity contrast in getRarityColor)
