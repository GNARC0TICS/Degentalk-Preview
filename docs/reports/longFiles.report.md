# Long Files Report

This report tracks files over 800 lines that should be considered for refactoring.

## Files Over 800 Lines (11 total)

### Critical - Over 1000 Lines

1. **client/src/pages/admin/announcements/index.tsx** (1,227 lines)

   - Admin announcements management page
   - Complex form handling and state management
   - Consider breaking into components and hooks

2. **client/src/pages/admin/social-config.tsx** (1,094 lines)
   - Social configuration management
   - Multiple form sections and validation
   - Good candidate for feature-based components

### High Priority - 900-1000 Lines

3. **client/src/pages/admin/xp/adjust.tsx** (886 lines)

   - XP adjustment functionality
   - Complex user lookup and adjustment logic
   - Consider extracting hooks and validation

4. **client/src/pages/admin/clout/grants.tsx** (881 lines)

   - Clout grants management
   - Multiple modals and state management
   - Could benefit from component extraction

5. **client/src/components/shoutbox/shoutbox-widget.tsx** (876 lines)
   - Main shoutbox chat component
   - Real-time messaging and state
   - Consider message components and hooks

### Medium Priority - 800-900 Lines

6. **client/src/pages/admin/categories.tsx** (862 lines)

   - Forum categories management
   - CRUD operations and validation
   - Extractable form components

7. **client/src/pages/admin/emojis.tsx** (840 lines)

   - Emoji management interface
   - File upload and preview logic
   - Consider emoji components

8. **client/src/components/admin/clout/AchievementsSection.tsx** (837 lines)

   - Achievements management section
   - Complex form and table logic
   - Extract achievement components

9. **client/src/pages/admin/reports/index.tsx** (831 lines)

   - Reports management page
   - Data tables and filtering
   - Extract report components

10. **client/src/pages/mod/users.tsx** (825 lines)

    - Moderator user management
    - User actions and moderation tools
    - Extract moderation components

11. **client/src/pages/admin/xp/titles.tsx** (816 lines)
    - XP titles management
    - Title CRUD and assignment
    - Extract title components

## Refactoring Recommendations

### Immediate Action (1000+ lines)

- **announcements/index.tsx**: Extract announcement form, list, and modal components
- **social-config.tsx**: Break into feature sections (Discord, Twitter, etc.)

### Next Phase (850+ lines)

- **xp/adjust.tsx**: Extract user search, adjustment forms, and validation hooks
- **clout/grants.tsx**: Extract grant modals, list components, and grant logic
- **shoutbox-widget.tsx**: Extract message components, input handling, and connection logic

### Long-term (800-850 lines)

- Focus on extracting reusable form components
- Create shared modal and table components
- Extract business logic into custom hooks

## File Size Guidelines

- **Components**: Target 200-400 lines
- **Pages**: Target 300-600 lines
- **Hooks**: Target 50-150 lines
- **Services**: Target 100-300 lines

## Progress Tracking

- [ ] announcements/index.tsx refactored
- [ ] social-config.tsx refactored
- [ ] xp/adjust.tsx refactored
- [ ] clout/grants.tsx refactored
- [ ] shoutbox-widget.tsx refactored
- [ ] categories.tsx refactored
- [ ] emojis.tsx refactored
- [ ] AchievementsSection.tsx refactored
- [ ] reports/index.tsx refactored
- [ ] mod/users.tsx refactored
- [ ] xp/titles.tsx refactored

## Notes

These files contain significant business logic and should be refactored incrementally to maintain functionality while improving maintainability. Priority should be given to files over 1000 lines first.

---

_Report generated: 2025-06-27_
_Total project files analyzed: TypeScript/JSX files in client/src and server/src_
