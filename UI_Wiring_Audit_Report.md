# UI Wiring Audit Report

Generated: {current_date}

## Overview

This report details the findings of a UI audit and codebase review of the ForumFusion frontend. It aims to identify wiring issues, stale files, incomplete features, and UI blind spots.

## 1. Pages Audit

_List of all pages under `/client/src/pages` and their status (wired, in use, stubbed, complete, missing from router)._

### 1.1 General Pages

- **`client/src/pages/home.tsx`**: Wired as `/` (via `HomePage`). Appears in use.
- **`client/src/pages/forums/index.tsx`**: Wired as `/forum` (via `ForumsPage`). Appears in use.
- **`client/src/pages/forums/[forum_slug].tsx`**: Wired as `/forums/:slug` (via `ForumBySlugPage`). Dynamic route, appears in use.
- **`client/src/pages/threads/create.tsx`**: Wired as `/threads/create` (via `CreateThreadPage`). Appears in use.
- **`client/src/pages/threads/[thread_slug].tsx`**: Wired as `/threads/:id` (via `ThreadPage`). Dynamic route, appears in use. (_Note: path uses `:id` but file is `[thread_slug].tsx`, potential mismatch or wouter flexibility_).
- **`client/src/pages/shop.tsx`**: Wired as `/shop` (via `ShopPage`). Appears in use.
- **`client/src/pages/shop/dgt-purchase.tsx`**: Wired as `/shop/dgt-purchase` (via `DgtPurchasePage`). Appears in use.
- **`client/src/pages/shop/purchase-success.tsx`**: Wired as `/shop/purchase-success` (via `PurchaseSuccessPage`). Appears in use.
- **`client/src/pages/leaderboard.tsx`**: Wired as `/leaderboard` (via `LeaderboardPage`). Appears in use.
- **`client/src/pages/wallet.tsx`**: Wired as `/wallet` (via `WalletPage`). Appears in use.
- **`client/src/pages/profile/[username].tsx`**: Wired as `/profile/:username?` (via `ProfilePage`). Dynamic optional route, appears in use.
- **`client/src/pages/whispers.tsx`**: Wired as `/whispers` (via `WhispersPage`). Appears in use.
- **`client/src/pages/settings/index.tsx`**: Wired as `/settings` (via `SettingsPage`). Appears in use.
- **`client/src/pages/auth.tsx`**: Wired as `/auth` (via `AuthPage`). Appears in use.
- **`client/src/pages/not-found.tsx`**: Wired as fallback route (via `NotFoundPage`). Appears in use.
- **`client/src/pages/auth-page.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/forum-rules.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/profile-page.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Potentially superseded by `profile/[username].tsx`?)
- **`client/src/pages/thread-page.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Potentially superseded by `threads/[thread_slug].tsx` or `threads/[id].tsx`?)
- **`client/src/pages/zones/index.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/categories/[slug].tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/forum/[slug].tsx`**: **NOT FOUND IN ROUTER**. File exists. (Potentially superseded by `forums/[forum_slug].tsx`?)
- **`client/src/pages/missions/index.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/profile/xp-demo.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/profile/xp.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/tags/[tagSlug].tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/threads/[id].tsx`**: File exists, used in router as `/threads/:id` (for `ThreadPage` which is `threads/[thread_slug].tsx`). Potential naming conflict/confusion.
- **`client/src/pages/topics/[topic_slug].tsx`**: **NOT FOUND IN ROUTER**. File exists.

### 1.2 Admin Pages (`client/src/pages/admin/`)

- **`client/src/pages/admin/index.tsx`**: Wired as `/admin` (via `AdminDashboardPage`). Appears in use.
- **`client/src/pages/admin/users.tsx`**: Wired as `/admin/users` (via `AdminUsersPage`). Appears in use.
- **`client/src/pages/admin/threads.tsx`**: Wired as `/admin/threads` (via `AdminThreadsPage`). Appears in use.
- **`client/src/pages/admin/treasury.tsx`**: Wired as `/admin/treasury` (via `AdminTreasuryPage`). Appears in use.
- **`client/src/pages/admin/wallets/index.tsx`**: Wired as `/admin/wallets` (via `AdminWalletsPage`). Appears in use.
- **`client/src/pages/admin/transactions/index.tsx`**: Wired as `/admin/transactions` (via `AdminTransactionsPage`). Appears in use.
- **`client/src/pages/admin/stats/index.tsx`**: Wired as `/admin/stats` (via `AdminStatsPage`). Appears in use.
- **`client/src/pages/admin/reports/index.tsx`**: Wired as `/admin/reports` (via `AdminReportsPage`). Appears in use. (Router uses `AdminReportsPage` from `../../pages/admin/reports`, `directory-tree` shows an `index.tsx` in this folder, assuming it's the one)
- **`client/src/pages/admin/announcements/index.tsx`**: Wired as `/admin/announcements` (via `AdminAnnouncementsPage`). Appears in use.
- **`client/src/pages/admin/categories.tsx`**: Wired as `/admin/categories` (via `AdminCategoriesPage`). Appears in use.
- **`client/src/pages/admin/prefixes.tsx`**: Wired as `/admin/prefixes` (via `AdminPrefixesPage`). Appears in use.
- **`client/src/pages/admin/platform-settings.tsx`**: Wired as `/admin/platform-settings` (via `PlatformSettingsPage`). Appears in use.
- **`client/src/pages/admin/dgt-packages.tsx`**: Wired as `/admin/dgt-packages` (via `AdminDgtPackagesPage`). Appears in use.
- **`client/src/pages/admin/tip-rain-settings.tsx`**: Wired as `/admin/tip-rain-settings` (via `TipRainSettingsPage`). Appears in use.
- **`client/src/pages/admin/cooldowns.tsx`**: Wired as `/admin/cooldowns` (via `CooldownSettingsPage`). Appears in use.
- **`client/src/pages/admin/emojis.tsx`**: Wired as `/admin/emojis` (via `AdminEmojisPage`, lazy-loaded). Appears in use.
- **`client/src/pages/admin/user-groups.tsx`**: Wired as `/admin/user-groups` (via `AdminUserGroupsPage`, lazy-loaded). Appears in use.
- **`client/src/pages/admin/admin-layout.tsx`**: Is a layout component, not a page. Used by admin routes.
- **`client/src/pages/admin/badges.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Rule `admin-structure.mdc` mentions `client/src/pages/admin/xp/badges.tsx`, but this is at `admin/badges.tsx`)
- **`client/src/pages/admin/edit-user.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Rule `admin-structure.mdc` doesn't explicitly list an edit user page, but `client/src/constants/routes.ts` has `ADMIN_USER_EDIT: (id: string | number) => \`/admin/users/${id}\``, suggesting a page like this should exist and be routed).
- **`client/src/pages/admin/levels.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Rule `admin-structure.mdc` mentions `client/src/pages/admin/xp/levels.tsx`)
- **`client/src/pages/admin/tags.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/admin/xp-settings.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Rule `admin-structure.mdc` mentions `client/src/pages/admin/xp/settings.tsx`)
- **`client/src/pages/admin/airdrop.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/admin/announcements/create.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/admin/announcements/edit.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/admin/features/index.tsx`**: **NOT FOUND IN ROUTER**. File exists.
- **`client/src/pages/admin/missions/index.tsx`**: **NOT FOUND IN ROUTER**. File exists. (General page at `client/src/pages/missions/index.tsx` also not routed).
- **`client/src/pages/admin/xp/adjust.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Mentioned in `admin-structure.mdc`)
- **`client/src/pages/admin/xp/badges.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Mentioned in `admin-structure.mdc`)
- **`client/src/pages/admin/xp/levels.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Mentioned in `admin-structure.mdc`)
- **`client/src/pages/admin/xp/settings.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Mentioned in `admin-structure.mdc`)
- **`client/src/pages/admin/xp/titles.tsx`**: **NOT FOUND IN ROUTER**. File exists. (Mentioned in `admin-structure.mdc`)

### 1.3 Mod Pages (`client/src/pages/mod/`)

- **`client/src/pages/mod/index.tsx`**: Wired as `/mod` (via `ModDashboardPage`). Appears in use.
- **`client/src/pages/mod/shoutbox.tsx`**: Wired as `/mod/shoutbox` (via `ModShoutboxPage`). Appears in use.
- **`client/src/pages/mod/users.tsx`**: Wired as `/mod/users` (via `ModUsersPage`). Appears in use.

### 1.4 Summary of Unrouted Pages

- `client/src/pages/auth-page.tsx`
- `client/src/pages/forum-rules.tsx`
- `client/src/pages/profile-page.tsx`
- `client/src/pages/thread-page.tsx`
- `client/src/pages/zones/index.tsx`
- `client/src/pages/categories/[slug].tsx`
- `client/src/pages/forum/[slug].tsx`
- `client/src/pages/missions/index.tsx`
- `client/src/pages/profile/xp-demo.tsx`
- `client/src/pages/profile/xp.tsx`
- `client/src/pages/tags/[tagSlug].tsx`
- `client/src/pages/topics/[topic_slug].tsx`
- `client/src/pages/admin/badges.tsx`
- `client/src/pages/admin/edit-user.tsx` (but route constant exists)
- `client/src/pages/admin/levels.tsx`
- `client/src/pages/admin/tags.tsx`
- `client/src/pages/admin/xp-settings.tsx`
- `client/src/pages/admin/airdrop.tsx`
- `client/src/pages/admin/announcements/create.tsx`
- `client/src/pages/admin/announcements/edit.tsx`
- `client/src/pages/admin/features/index.tsx`
- `client/src/pages/admin/missions/index.tsx`
- `client/src/pages/admin/xp/adjust.tsx`
- `client/src/pages/admin/xp/badges.tsx`
- `client/src/pages/admin/xp/levels.tsx`
- `client/src/pages/admin/xp/settings.tsx`
- `client/src/pages/admin/xp/titles.tsx`

## 2. Component Audit

_List of key components (reused or central to UX) and their status (missing props, dead imports, conflicting comments, styling issues, duplication)._

### 2.1 UI Components (`client/src/components/ui/`)

- **`client/src/components/ui/button.tsx` (`Button`)**: Standard button component with variants. Appears functional and well-structured. Uses `cva` for class variance. No immediate issues noted.
- **`client/src/components/ui/dialog.tsx` (`Dialog`, `DialogTrigger`, etc.)**: Provides modal dialog functionality. Based on Radix UI. Appears standard. No immediate issues noted.
- **`client/src/components/ui/form.tsx` (`Form`, `FormField`, `FormItem`, etc.)**: Provides form handling components and a `useForm` hook (re-exporting from `react-hook-form`). Standard setup for building forms. No immediate issues noted.
- **`client/src/components/ui/toast.tsx` (`Toast`, `ToastTitle`, etc.) & `client/src/hooks/use-toast.ts` (`useToast` hook)**:

  - Functionality: `toast.tsx` provides UI components for toast notifications, appearing to use the `sonner` library. `useToast.ts` provides the `useToast` hook.
  - **CRITICAL ISSUE**: `client/src/hooks/use-toast.ts` is a **mock implementation**. It only logs to the console and does not trigger visual toasts. It also does not provide a `ToastProvider`.
  - Discrepancy: The `toast.tsx` (visual component) seems ready, but the `useToast` hook that would trigger it is a placeholder.
  - Impact: Toast notifications are currently **non-functional** in the application.
  - **Action Needed**: Implement a functional `useToast` hook and `ToastProvider`, integrate them with the `sonner` components, and wrap the application with the provider to enable global toast notifications. (Note: `sonner` is an external library imported directly by `toast.tsx`, not a component defined within `client/src/components/ui/`).

- **`client/src/components/ui/input.tsx` (`Input`, `inputVariants`)**:

  - Functionality: Provides a highly styled input component with variants (`default`, `wallet`, `error`, `success`), sizes, optional icons, error message display, and password visibility toggle.
  - Structure: Uses `cva` for `inputVariants` (exported) and has its own internal styling for the main input element. Seems robust.
  - Accessibility: Includes `aria-invalid`, `aria-describedby` for errors, and `aria-label` for password toggle.
  - Status: Appears complete and functional. No immediate wiring issues noted.

- **`client/src/components/ui/label.tsx` (`Label`)**:

  - Functionality: Provides an accessible label component, wrapping `@radix-ui/react-label`.
  - Structure: Uses `cva` for base styling and peer-disabled states.
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/select.tsx` (Select, SelectGroup, SelectValue, etc.)**:

  - Functionality: Provides a comprehensive suite of components for creating accessible select dropdowns, wrapping `@radix-ui/react-select`.
  - Structure: Composable parts (`SelectTrigger`, `SelectContent`, `SelectItem`, etc.) following Radix UI patterns. Includes scroll buttons and separator.
  - Styling: Well-styled with focus, disabled, and open/close animation states. Uses `lucide-react` icons.
  - Status: Appears complete and functional. Foundational UI component.

- **`client/src/components/ui/textarea.tsx` (`Textarea`, `textareaVariants`)**:

  - Functionality: Provides a styled textarea component with variants (`default`, `post`, `comment`, `error` influencing min-height), sizes, error message display, and an optional character count feature (with color-coded feedback near max length).
  - Structure: Uses `cva` for variants which are correctly applied. Manages internal state for character count.
  - Accessibility: Includes `aria-invalid` and `aria-describedby` for errors.
  - Status: Appears complete and functional. No immediate wiring issues noted.

- **`client/src/components/ui/avatar.tsx` (`Avatar`, `AvatarImage`, `AvatarFallback`)**:

  - Functionality: Provides an accessible avatar component system, wrapping `@radix-ui/react-avatar`.
  - Structure: Composable parts (`AvatarImage` for the image, `AvatarFallback` for when the image is unavailable) within an `Avatar` root.
  - Styling: Basic styling for shape, size, and fallback appearance.
  - Status: Appears complete and functional. Standard UI component for user representations.

- **`client/src/components/ui/card.tsx` (`CardHeader`, `CardTitle`, etc.)**:

  - Functionality: Provides components to structure content within a card layout (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
  - **CRITICAL ISSUE**: The main `Card` root component (which provides the overall card styling and container) is defined within `card.tsx` but is **NOT EXPORTED**. This makes it impossible to use the intended card structure as designed.
  - Impact: Consumers cannot use the `Card` wrapper, limiting the utility of the exported `CardHeader`, `CardContent`, etc., which expect to be nested within such a `Card` container.
  - Recommendation: Export the `Card` component from `client/src/components/ui/card.tsx`.

- **`client/src/components/ui/dropdown-menu.tsx` (DropdownMenu, DropdownMenuTrigger, etc.)**:

  - Functionality: Provides an extensive suite of components for creating highly customizable and accessible dropdown menus, wrapping `@radix-ui/react-dropdown-menu`.
  - Structure: Composable parts supporting sub-menus, checkbox items, radio items, labels, separators, and shortcuts. Follows Radix UI patterns.
  - Styling: Well-styled with focus, disabled, open/close animation states, and `inset` options. Uses `lucide-react` icons.
  - Status: Appears complete and functional. Versatile UI component system.

- **`client/src/components/ui/badge.tsx` (`Badge`, `badgeVariants`)**:

  - Functionality: Displays a badge or tag with several predefined visual styles.
  - Variants: `default`, `secondary`, `destructive`, `outline`, `success`.
  - Structure: Simple `div` component styled using `cva`.
  - Status: Appears complete and functional. Standard UI utility.

- **`client/src/components/ui/table.tsx` (`Table`, `TableHeader`, etc.)**:

  - Functionality: Provides a suite of components (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`) to construct styled HTML tables.
  - Structure: Wrappers around standard HTML table elements. The main `Table` component includes `overflow-x-auto` for responsiveness.
  - Styling: Basic styling for borders, hover states, and checkbox-related padding.
  - Status: Appears complete and functional. Standard UI component for tabular data.

- **`client/src/components/ui/skeleton.tsx` (`Skeleton`)**:

  - Functionality: Displays a pulsating placeholder for loading content.
  - Structure: A simple `div` element with `animate-pulse` and background styling.
  - Status: Appears complete and functional. Standard UI utility for loading states.

- **`client/src/components/ui/tabs.tsx` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`)**:

  - Functionality: Provides components for building accessible tabbed interfaces, wrapping `@radix-ui/react-tabs`.
  - Structure: Composable parts (`TabsList` for triggers, `TabsTrigger` for individual tabs, `TabsContent` for associated panels). Follows Radix UI patterns.
  - Styling: Well-styled with active/inactive states, focus, and disabled styles.
  - Status: Appears complete and functional. Foundational UI component.

- **`client/src/components/ui/toggle.tsx` (`Toggle`, `toggleVariants`)**:

  - Functionality: Provides a two-state toggle button component with `default` and `outline` variants, and `default`, `sm`, `lg` sizes. Wraps `@radix-ui/react-toggle`.
  - Structure: Styled using `cva` for variants, correctly applies styles for various states (on, hover, focus, disabled).
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/tooltip.tsx` (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`)**:

  - Functionality: Provides components for building accessible tooltips, wrapping `@radix-ui/react-tooltip`.
  - Structure: Composable parts (`TooltipTrigger` for the interactive element, `TooltipContent` for the tooltip text) within a `Tooltip` root.
  - Styling: Well-styled with border, background, text, shadow, and entrance/exit animations.
  - Integration: Requires `TooltipProvider` to be wrapped high in the component tree (e.g., `_app.tsx` or `SiteLayoutWrapper`) for global tooltip functionality.
  - Status: Appears complete and functional. Foundational UI component.

- **`client/src/components/ui/toggle-group.tsx` (`ToggleGroup`, `ToggleGroupItem`)**:

  - Functionality: Provides components for a group of toggle buttons (functioning as radio or checkbox groups), wrapping `@radix-ui/react-toggle-group`. Reuses `toggleVariants` for consistent styling.
  - Structure: Uses `ToggleGroupContext` to pass `variant` and `size` to children, simplifying prop drilling.
  - Styling: Inherits styles from `toggle.tsx` and applies group-specific layout.
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/separator.tsx` (`Separator`)**:

  - Functionality: Provides a visually and semantically appropriate separator line, wrapping `@radix-ui/react-separator`. Supports `horizontal` (default) and `vertical` orientations.
  - Structure: A simple component with basic styling for background and size based on orientation.
  - Status: Appears complete and functional. Standard UI utility.

- **`client/src/components/ui/sheet.tsx` (Sheet, SheetPortal, SheetOverlay, etc.)**:

  - Functionality: Provides a comprehensive system for building accessible side panels/drawers, wrapping `@radix-ui/react-dialog` primitives.
  - Side Variants: Supports `top`, `bottom`, `left`, `right` for slide-in/out animations and positioning. Default is `right`.
  - Structure: Composable parts (`SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, etc.) with a built-in close button.
  - Styling: Well-styled with overlay, shadow, background, and animations.
  - Status: Appears complete and functional. Versatile UI component.

- **`client/src/components/ui/slider.tsx` (`Slider`)**:

  - Functionality: Provides an accessible range slider component, wrapping `@radix-ui/react-slider`.
  - Structure: Composed of a track, range (filled portion), and a draggable thumb.
  - Styling: Well-styled for visual feedback, focus, and disabled states.
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/switch.tsx` (`Switch`)**:

  - Functionality: Provides an accessible toggle switch component, wrapping `@radix-ui/react-switch`.
  - Structure: Composed of a root container and a sliding thumb. Includes animations for checked/unchecked states.
  - Styling: Well-styled for visual feedback, focus, and disabled states.
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/collapsible.tsx` (`Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`)**:

  - Functionality: Provides components for creating collapsible sections of content, re-exporting directly from `@radix-ui/react-collapsible`.
  - Structure: Barebones wrappers around Radix UI primitives.
  - Styling: This component **does not provide any intrinsic styling**. It relies entirely on default Radix UI styles or external CSS classes applied by consumers.
  - Status: Functional for its purpose, but styling is external. No immediate wiring issues noted.

- **`client/src/components/ui/accordion.tsx` (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`)**:

  - Functionality: Provides components for creating vertically stacked collapsible sections of content, wrapping `@radix-ui/react-accordion`.
  - Structure: Composable parts for items, triggers (with rotating icon), and content (with collapse/expand animations).
  - Styling: Well-styled with borders, hover effects, icon rotation, and smooth animations.
  - Status: Appears complete and functional. Standard UI component for organizing content.

- **`client/src/components/ui/scroll-area.tsx` (`ScrollArea`, `ScrollBar`)**:

  - Functionality: Provides a customizable scroll area with custom styled scrollbars, wrapping `@radix-ui/react-scroll-area`.
  - Structure: Composed of a root, viewport, scrollbar (with thumb), and corner (for intersection).
  - Styling: Custom styling for the scrollbar track and thumb for both vertical and horizontal orientations.
  - Status: Appears complete and functional. Standard UI component for custom scrolling.

- **`client/src/components/ui/progress.tsx` (`Progress`)**:

  - Functionality: Displays a progress bar, wrapping `@radix-ui/react-progress`.
  - Structure: Composed of a track and an indicator that animates based on the `value` prop.
  - Styling: Simple styling for track and indicator with a transition for progress updates.
  - Status: Appears complete and functional. Standard UI component.

- **`client/src/components/ui/resizable.tsx` (`ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`)**:

  - Functionality: Provides components for creating resizable panel layouts, wrapping `react-resizable-panels`.
  - Structure: Composed of a group, individual panels, and a draggable handle (with optional visual grip).
  - Styling: Well-styled for handle appearance, focus states, and directional resizing.
  - Status: Appears complete and functional. Versatile UI component for complex layouts.

- **`client/src/components/ui/radio-group.tsx` (`RadioGroup`, `RadioGroupItem`)**:

  - Functionality: Provides components for creating accessible radio button groups, wrapping `@radix-ui/react-radio-group`.
  - Structure: Composed of a group container and individual radio items (with a circular indicator).
  - Styling: Well-styled for appearance, focus, and disabled states, and the selected indicator.
  - Status: Appears complete and functional. Standard UI component for single-choice inputs.

- **`client/src/components/ui/hover-card.tsx` (`HoverCard`, `HoverCardTrigger`, `HoverCardContent`)**:

  - Functionality: Provides components for displaying accessible rich popovers on hover, wrapping `@radix-ui/react-hover-card`.
  - Structure: Composed of a root, trigger, and content.
  - Styling: Well-styled with border, background, shadow, and entrance/exit animations. Supports alignment and side offset.
  - Status: Appears complete and functional. Standard UI component for contextual information on hover.

- **`client/src/components/ui/calendar.tsx` (`Calendar`)**:

  - Functionality: Provides a highly customizable calendar UI for date selection, wrapping `react-day-picker`.
  - Structure: Extensively styled through `classNames` and custom icons to match the project's design system.
  - Styling: Comprehensive styling for all calendar elements and states (selected, today, range, disabled).
  - Status: Appears complete and functional. Ready for use in date pickers or as a standalone calendar.

- **`client/src/components/ui/command.tsx` (`Command`, `CommandDialog`, `CommandInput`, etc.)**:

  - Functionality: Provides a comprehensive system for building command palettes or searchable interfaces, based on the `cmdk` library.
  - Structure: Composed of various parts for search input, list display, grouping, items, and shortcuts. Integrates with `Dialog` component.
  - Styling: Extensively styled for appearance, focus, selected, and disabled states.
  - Status: Appears complete and functional. Powerful UI component for search and command workflows.

- **`client/src/components/ui/context-menu.tsx` (ContextMenu, ContextMenuTrigger, etc.)**:

  - Functionality: Provides an extensive suite of components for creating highly customizable and accessible context menus (right-click menus), wrapping `@radix-ui/react-context-menu`.
  - Structure: Composable parts supporting sub-menus, checkbox items, radio items, labels, separators, and shortcuts. Similar to `dropdown-menu.tsx`.
  - Styling: Well-styled with focus, open/close animation states, and `inset` options. Uses `lucide-react` icons.
  - Status: Appears complete and functional. Powerful UI component for context-sensitive actions.

- **`client/src/components/ui/popover.tsx` (`Popover`, `PopoverTrigger`, `PopoverContent`)**:

  - Functionality: Provides components for displaying accessible popovers (small overlay content), wrapping `@radix-ui/react-popover`.
  - Structure: Composed of a root, trigger, and content.
  - Styling: Well-styled with border, background, shadow, and entrance/exit animations. Supports alignment and side offset.
  - Status: Appears complete and functional. Standard UI component for displaying supplementary content.

- **`client/src/components/ui/checkbox.tsx` (`Checkbox`)**:

  - Functionality: Provides an accessible checkbox component, wrapping `@radix-ui/react-checkbox`.
  - Structure: Composed of a root checkbox element and a checkmark indicator (using `lucide-react` icon).
  - Styling: Well-styled for appearance, focus, disabled states, and `checked` state.
  - Status: Appears complete and functional. Standard UI component for multi-choice inputs.

- **`client/src/components/ui/pagination.tsx` (`Pagination`, `PaginationContent`, etc.)**:

  - Functionality: Provides a robust system for rendering paginated content, handling dynamic page numbers with ellipses, and including navigation buttons. Supports item-based or page-based total calculations.
  - Structure: Composed of a main `Pagination` component and granular primitives for highly custom layouts.
  - Styling: Well-styled with clear active states and navigation controls.
  - Status: Appears complete and functional. Essential UI component for lists.

- **`client/src/components/ui/aspect-ratio.tsx` (`AspectRatio`)**:

  - Functionality: Maintains the aspect ratio of its content, wrapping `@radix-ui/react-aspect-ratio`.
  - Structure: A simple re-export of the Radix UI primitive.
  - Styling: This component **does not provide any intrinsic styling**; it relies on external CSS for appearance.
  - Status: Functional for its purpose. No immediate wiring issues noted.

- **`client/src/components/ui/carousel.tsx` (`Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`)**:

  - Functionality: Provides a highly customizable and accessible carousel for displaying horizontal or vertical content, based on `embla-carousel-react`.
  - Structure: Composed of a root carousel, content wrapper, individual items, and styled navigation buttons. Uses `CarouselContext` for prop drilling.
  - Styling: Extensively styled for layout, spacing, navigation positioning, and includes keyboard navigation.
  - Status: Appears complete and functional. Powerful UI component for scrollable content.

- **`client/src/components/ui/alert-dialog.tsx` (`AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, etc.)**:

  - Functionality: Provides a modal alert dialog system for critical user interactions, wrapping `@radix-ui/react-alert-dialog`.
  - Structure: Composable parts for title, description, and action/cancel buttons. Integrates `buttonVariants` for styling actions.
  - Styling: Well-styled with overlay, animations, positioning, and shadow.
  - Status: Appears complete and functional. Crucial UI component for confirmation flows.

- **`client/src/components/ui/alert.tsx` (`Alert`, `AlertTitle`, `AlertDescription`)**:

  - Functionality: Provides a component for displaying inline alert messages to the user.
  - Variants: `default` and `destructive` (for errors/warnings).
  - Structure: Composed of a root `Alert` container, title, and description. Handles automatic padding for icons.
  - Styling: Well-styled with borders, backgrounds, and text colors based on variant. Includes `role="alert"` for accessibility.
  - Status: Appears complete and functional. Standard UI component for informative messages.

- **`client/src/components/ui/animated-logo.tsx` (`AnimatedLogo`)**:

  - Functionality: Displays an SVG logo with a shimmering animation effect.
  - Structure: Uses SVG `linearGradient` and `animateTransform` for the animation, overlaid on an image (`/images/Dgen.PNG`).
  - Styling: Self-contained SVG animation and supports external `className` for further styling.
  - Status: Appears complete and functional. Decorative UI component.

- **`client/src/components/ui/bookmark-button.tsx` (`BookmarkButton`)**:

  - Functionality: Provides a button to bookmark/unbookmark threads, with visual feedback and API integration.
  - Dependencies: Relies on `useMutation` (react-query), `lucide-react` (icon), `apiRequest`, `useAuth`, and `useToast`.
  - **CRITICAL WIRING ISSUES**:
    - The "Sign In" link within the `useToast` prompt points to `/login`, which is **unrouted**. The actual authentication page is `/auth`.
    - Relies on the **mock `useToast` hook**, meaning toast notifications are not visually displayed.
  - Impact: Users will encounter broken links and non-functional feedback for bookmarking actions.
  - Recommendation: Fix the `/login` route to point to `/auth`, and implement a functional `useToast` as previously noted.

- **`client/src/components/ui/breadcrumb.tsx` (`Breadcrumb`, `BreadcrumbList`, etc.)**:

  - Functionality: Provides a comprehensive system for accessible hierarchical navigation paths.
  - Structure: Composed of root `nav`, ordered list, items, links, current page indicator, separators, and ellipsis.
  - Styling: Well-styled for layout, text, hover effects, and icon sizing. Extensive ARIA attributes for accessibility.
  - Status: Appears complete and functional. Foundational UI component for navigation.

- **`client/src/components/ui/candlestick-menu.tsx` (`ChartMenu`)**:
  - Functionality: An animated button that transforms from a hamburger menu to various candlestick chart patterns.
  - Dependencies: React hooks. **Critically relies on external CSS for all animations and visual transformations.**
  - Structure: Renders multiple `span` elements (`line`, `wick`) which are styled by external CSS classes for the animation.
  - Styling: Purely CSS-driven animations (e.g., `is-active`, `pattern-three-inside-up`).
  - **CRITICAL WIRING ISSUE**: Without the corresponding CSS definitions, this component will not display the intended animations or transformations.
  - Impact: The component is visually broken without its external stylesheet.
  - Recommendation: Ensure the necessary CSS (likely global or imported elsewhere) is present and correctly applied for this component to function as designed.

_To be audited next: `chart.tsx`, `drawer.tsx`, `error-display.tsx`, etc._

### 2.2 Layout Components (`client/src/components/layout/`)

- **`client/src/pages/admin/admin-layout.tsx` (`AdminLayout`)**:
  - Imports: `AdminSidebar` from `@/components/admin/admin-sidebar`.
  - Navigation: Contains hardcoded `adminLinks`. Several links point to unrouted pages (e.g., `/admin/xp-settings`, `/admin/levels`, `/admin/badges`). Sidebar will display non-functional links.
  - Permissions: Uses mocked admin permissions. Auth integration may be placeholder/incomplete.
  - Features: Search input and notification bell appear to be placeholders (hardcoded notification count).
  - Overall: Follows `admin-structure.mdc` pattern. No major visual or import issues noted.
- **`client/src/components/mod/mod-layout.tsx` (`ModLayout`)**:
  - Imports: `ModSidebar` from `./mod-sidebar`.
  - Navigation: Dynamically generates breadcrumbs.
  - User Display: Avatar fallback is a placeholder (`// Mock user placeholder`).
  - Overall: Appears well-structured.
- **`client/src/components/layout/site-header.tsx` (`SiteHeader`)**:
  - Auth: Uses `useAuthWrapper()` but falls back to a `mockUser` in development. Logout is conditional.
  - Navigation: Main navigation links seem correct and point to routed pages.
  - Features: Desktop search and notification bell are present; functionality likely pending or placeholder (hardcoded notification count).
  - Wallet: Integrates `WalletSheet` from `@/components/economy/wallet/WalletSheet`.
  - Admin/Mod Links: Conditional links to `/admin` and `/mod` based on user roles.
  - Auth Buttons:
    - "Sign Up" button links to `/forum` (`ForumsPage`). This might be a specific UX choice or a placeholder for a dedicated sign-up page.
    - "Log In" button links to `/login`. This route is not explicitly defined in `App.tsx`. `client/src/pages/auth.tsx` (at `/auth`) or the unrouted `client/src/pages/auth-page.tsx` might be intended handlers.

### 2.3 Navigation Components (`client/src/components/navigation/`)

- **`client/src/components/admin/admin-sidebar.tsx` (`AdminSidebar`)**:
  - Source of Links: Receives links via props from `AdminLayout`. The issues with unrouted pages originate in `AdminLayout`'s `adminLinks` array.
  - Functionality: Supports collapsible state and expandable submenus. Behaves correctly based on provided props.
  - Overall: Component itself seems fine; data it receives is problematic.
- **`client/src/components/mod/mod-sidebar.tsx` (`ModSidebar`)**:
  - Links: Hardcoded using `Accordion`.
  - Unrouted/Missing Pages: Contains several links to pages not in the router AND for which page files do not exist under `client/src/pages/mod/`:
    - `/mod/activity`
    - `/mod/threads`
    - `/mod/reports`
    - `/mod/announcements`
    - `/mod/settings`
  - Overall: Significant number of dead links due to missing target pages and routes.
- **`client/src/components/navigation/mobile-nav-bar.tsx` (`MobileNavBar`)**:
  - Links: Uses `NavItem`. `defaultItems` array links to `/`, `/forum`, `/shop`, `/leaderboard`, `/wallet`, and `/profile/:username` (dynamic).
  - Status: All default links appear to correspond to existing, routed pages. Conditional display for Wallet/Profile based on auth.
  - Overall: Appears correctly wired.
- **`client/src/components/navigation/nav-item.tsx` (`NavItem`)**:
  - Type: Presentational component.
  - Status: Functionality and correctness depend on props from parent. No inherent wiring issues. Styling seems robust.

### 2.4 Feature Components (`client/src/features/**/components/`)

### 2.5 Domain-Specific Components (e.g., `client/src/components/forum/`, `client/src/components/shop/`)

## 3. Features to Wire Up

_Identify features or admin tools that exist in `/features` or `/pages/admin` but aren't yet functional (or lack backend support), or core functionalities like notifications that are missing._

- **Toast Notifications**:

  - The `useToast` hook (`client/src/hooks/use-toast.ts`) is a mock implementation and only logs to console.
  - The visual `Toast` components in `client/src/components/ui/toast.tsx` (using `sonner`) are not connected to this mock hook.
  - A `ToastProvider` is not implemented or wrapped around the application in `client/src/pages/_app.tsx`.
  - **Action Needed**: Implement a functional `useToast` hook and `ToastProvider`, integrate them with the `sonner` components, and wrap the application with the provider to enable global toast notifications.

- **Tooltip Functionality**:

  - The `TooltipProvider` from `client/src/components/ui/tooltip.tsx` is **not implemented or wrapped** around the application in `client/src/pages/_app.tsx`.
  - Impact: Tooltips will not display globally or function correctly.
  - **Action Needed**: Wrap the application with `TooltipProvider` (e.g., in `client/src/pages/_app.tsx` or `SiteLayoutWrapper`) to enable global tooltip functionality.

- **Avatar Stack Component**:

  - **Observation**: A dedicated `AvatarStack` component (e.g., in `client/src/components/ui/` or `client/src/components/users/`) is currently missing.
  - Impact: Displaying multiple user avatars in a compact, stacked manner (e.g., for member lists, participants in a thread) requires custom implementation each time or a more complex approach.
  - **Action Needed**: Consider implementing a reusable `AvatarStack` component for a cleaner and more consistent display of multiple user avatars in member lists and other areas.

- **Pagination Integration**:

  - **Observation**: The `Pagination` component (`client/src/components/ui/pagination.tsx`) is a robust and functional UI component.
  - **Implementation Suggestion**: This component is highly beneficial for displaying long lists of items in various forum features. Consider implementing it in:
    - **Forum Threads Lists**: For `/forums/:slug` and similar pages.
    - **User Profile Lists**: For displaying a user's posts, threads, or other paginated content.
    - **Search Results**: To paginate results from forum search queries.
    - **Admin Tables**: For managing long lists of users, reports, or transactions.
  - **Action Needed**: Integrate `Pagination` into existing or future features that display paginated content to improve UX and performance.

- **Alert Dialog Integration**:

  - **Observation**: The `AlertDialog` component (`client/src/components/ui/alert-dialog.tsx`) is a robust and functional UI component.
  - **Implementation Suggestion**: This component is critical for confirming sensitive or irreversible actions across the application. Consider implementing it in:
    - **Content Deletion**: Confirming deletion of forum posts, threads, or user comments.
    - **Administrative Actions**: Confirming user bans, mutes, or other sensitive moderator/admin actions.
    - **Wallet Transactions**: Before initiating critical or irreversible wallet operations.
    - **User Account Actions**: Confirming account deletion or significant setting changes.
  - **Action Needed**: Integrate `AlertDialog` into any feature requiring explicit user confirmation for critical actions.

- **Alert Message Integration**:

  - **Observation**: The `Alert` component (`client/src/components/ui/alert.tsx`) is a robust and functional UI component.
  - **Implementation Suggestion**: This component is useful for displaying non-blocking informational, success, or error messages across the application. Consider implementing it in:
    - **Form Feedback**: Displaying success/error messages after form submissions (e.g., creating a thread, updating profile).
    - **Page-Level Announcements**: Banners for site-wide notices or temporary information.
    - **Validation Feedback**: General validation errors not tied to a specific input field.
    - **Feature-Specific Notifications**: Informing users about events or changes within a particular feature area.
  - **Action Needed**: Integrate `Alert` into relevant sections requiring contextual feedback or announcements.

- **Bookmark Button Integration**:

  - **Observation**: The `BookmarkButton` component (`client/src/components/ui/bookmark-button.tsx`) is a functional UI component designed for bookmarking threads.
  - **Implementation Suggestion**: This component should be integrated into areas where users might want to save content for later. Consider implementing it in:
    - **Thread List Items**: Add the button to each `ThreadCard` or similar component displayed in forum lists.
    - **Individual Thread Pages**: Prominently display the button on the `client/src/pages/threads/[thread_slug].tsx` page.
  - **Action Needed**: Integrate `BookmarkButton` into thread-displaying components to enable bookmarking functionality.

- **Breadcrumb Navigation Integration**:
  - **Observation**: The `Breadcrumb` component (`client/src/components/ui/breadcrumb.tsx`) is a robust and functional UI component for hierarchical navigation.
  - **Implementation Suggestion**: This component is ideal for improving user orientation on pages with deep content structures. Consider implementing it in:
    - **Forum Pages**: Displaying navigation paths like "Home > Forum Name > Category Name > Thread Title".
    - **Admin Sub-Pages**: Providing a clear trail for administrative tasks (e.g., "Admin > Users > Edit User").
    - **Profile Sections**: If user profiles have sub-sections.
  - **Action Needed**: Integrate `Breadcrumb` into pages with clear hierarchical structures to enhance user navigation and context.

### 3.1 Core Features (`client/src/features/`)

### 3.2 Admin Features/Panels (`client/src/pages/admin/`)

- **Admin XP Management**:

  - Pages exist for `adjust.tsx`, `badges.tsx`, `levels.tsx`, `settings.tsx`, `titles.tsx` under `client/src/pages/admin/xp/`.
  - Rule `admin-structure.mdc` also lists these:
    - `client/src/pages/admin/xp/adjust.tsx`
    - `client/src/pages/admin/xp/badges.tsx`
    - `client/src/pages/admin/xp/titles.tsx`
    - `client/src/pages/admin/xp/levels.tsx`
    - `client/src/pages/admin/xp/settings.tsx`
  - **Issue**: None of these XP-related admin pages are currently wired into the router (see Section 1.4).
  - **Action Needed**: Add routes for these pages in `client/src/core/router.tsx` and ensure they are linked from the `AdminLayout`'s navigation (currently `adminLinks` in `client/src/pages/admin/admin-layout.tsx` has dead links for these). Verify backend API support for these functionalities.

- **Admin Badges Management (Non-XP)**:

  - Page: `client/src/pages/admin/badges.tsx` exists.
  - **Issue**: Not wired into the router. `admin-structure.mdc` mentions `client/src/pages/admin/xp/badges.tsx`, but this is a separate top-level `badges.tsx`. It's unclear if this is a duplicate, an old version, or intended for a different type of badge.
  - **Action Needed**: Clarify the purpose of `client/src/pages/admin/badges.tsx`. If it's needed, route it and link it. If it's redundant with `client/src/pages/admin/xp/badges.tsx`, consider removing it.

- **Admin User Editing**:

  - Page: `client/src/pages/admin/edit-user.tsx` exists.
  - Route Constant: `client/src/constants/routes.ts` defines `ADMIN_USER_EDIT: (id: string | number) => \`/admin/users/${id}\``.
  - **Issue**: The page is not wired into the router despite a route constant suggesting its intended use.
  - **Action Needed**: Add a dynamic route (e.g., `/admin/users/:userId/edit`) in `client/src/core/router.tsx` that maps to this page. Ensure admin user lists link to this page for individual user editing.

- **Admin Tags Management**:

  - Page: `client/src/pages/admin/tags.tsx` exists.
  - **Issue**: Not wired into the router.
  - **Action Needed**: Determine if this is for forum tags or other types of tags. Add a route and link from admin navigation if required.

- **Admin Airdrop Feature**:

  - Page: `client/src/pages/admin/airdrop.tsx` exists.
  - **Issue**: Not wired into the router.
  - **Action Needed**: Add a route and link from admin navigation. Verify backend support for airdrop functionality.

- **Admin Announcements Create/Edit**:

  - Pages: `client/src/pages/admin/announcements/create.tsx` and `client/src/pages/admin/announcements/edit.tsx` exist.
  - **Issue**: Not wired into the router. The existing `/admin/announcements` page (wired to `AdminAnnouncementsPage` from `client/src/pages/admin/announcements/index.tsx`) likely lists announcements; these pages would be for managing individual announcements.
  - **Action Needed**: Add routes (e.g., `/admin/announcements/create` and `/admin/announcements/:announcementId/edit`) and link them from the main admin announcements page.

- **Admin Features Management**:

  - Page: `client/src/pages/admin/features/index.tsx` exists.
  - **Issue**: Not wired into the router. The purpose of this "features" admin panel is unclear from the filename alone (could be feature flags, or managing platform features).
  - **Action Needed**: Determine its purpose, add a route, and link from admin navigation if necessary.

- **Admin Missions Management**:
  - Page: `client/src/pages/admin/missions/index.tsx` exists.
  - **Issue**: Not wired into the router. A general user-facing missions page (`client/src/pages/missions/index.tsx`) also exists and is unrouted.
  - **Action Needed**: Add routes for both admin and user-facing mission pages if they are intended features. Link the admin missions page from the admin navigation.

### 3.3 Mod Features/Panels (`client/src/pages/mod/`)

- **Moderator Sidebar Dead Links**:
  - Component: `client/src/components/mod/mod-sidebar.tsx`
  - **Issue**: Contains hardcoded links in an `Accordion` to several pages that are neither routed nor have existing page files:
    - `/mod/activity`
    - `/mod/threads`
    - `/mod/reports`
    - `/mod/announcements`
    - `/mod/settings`
  - **Action Needed**: For each link, either create the corresponding page component and route, or remove the link from the `ModSidebar`.

## 4. Routing Gaps & Navigation Issues

### 4.1 Unrouted Pages (Summary from Section 1.4)

A significant number of page components exist in the codebase but are not accessible via the router (`client/src/core/router.tsx`). These need to be reviewed, and either routed or removed if obsolete.

**General Pages:**

- `client/src/pages/auth-page.tsx`
- `client/src/pages/forum-rules.tsx`
- `client/src/pages/profile-page.tsx` (Potentially superseded by `profile/[username].tsx`)
- `client/src/pages/thread-page.tsx` (Potentially superseded by `threads/[thread_slug].tsx`)
- `client/src/pages/zones/index.tsx`
- `client/src/pages/categories/[slug].tsx`
- `client/src/pages/forum/[slug].tsx` (Potentially superseded by `forums/[forum_slug].tsx`)
- `client/src/pages/missions/index.tsx`
- `client/src/pages/profile/xp-demo.tsx`
- `client/src/pages/profile/xp.tsx`
- `client/src/pages/tags/[tagSlug].tsx`
- `client/src/pages/topics/[topic_slug].tsx`

**Admin Pages (also listed in 3.2):**

- `client/src/pages/admin/badges.tsx`
- `client/src/pages/admin/edit-user.tsx` (Route constant exists: `ADMIN_USER_EDIT`)
- `client/src/pages/admin/levels.tsx`
- `client/src/pages/admin/tags.tsx`
- `client/src/pages/admin/xp-settings.tsx`
- `client/src/pages/admin/airdrop.tsx`
- `client/src/pages/admin/announcements/create.tsx`
- `client/src/pages/admin/announcements/edit.tsx`
- `client/src/pages/admin/features/index.tsx`
- `client/src/pages/admin/missions/index.tsx`
- `client/src/pages/admin/xp/adjust.tsx`
- `client/src/pages/admin/xp/badges.tsx`
- `client/src/pages/admin/xp/levels.tsx`
- `client/src/pages/admin/xp/settings.tsx`
- `client/src/pages/admin/xp/titles.tsx`

**Action Needed**: Systematically review each unrouted page. Decide if it's: 1. **Needed**: Add a route in `client/src/core/router.tsx` and ensure it's linked from relevant navigation components or other pages. 2. **Obsolete/Superseded**: Delete the file to reduce codebase clutter. 3. **Work-in-Progress**: Keep, but ensure it's tracked for future routing.

### 4.2 Incorrect Navigation Links

- **`client/src/components/ui/bookmark-button.tsx`**:

  - "Sign In" link within toast message points to `/login` (unrouted).
  - **Action**: Change `/login` to `/auth`.

- **`client/src/components/layout/site-header.tsx`**:

  - "Log In" button links to `/login` (unrouted).
  - "Sign Up" button links to `/forum`. This might be intentional but should be confirmed if a dedicated sign-up flow/page is desired.
  - **Action**: Change `/login` to `/auth`. Clarify the desired destination for the "Sign Up" button.

- **`client/src/pages/admin/admin-layout.tsx`**:

  - `adminLinks` array contains multiple links to unrouted admin pages (XP settings, levels, badges, etc.).
  - **Action**: Align links with routed admin pages. Once XP admin pages are routed, update these links.

- **`client/src/components/mod/mod-sidebar.tsx`**:
  - Contains multiple dead links to unrouted and non-existent mod pages.
  - **Action**: Remove dead links or implement the target pages and routes.

## 5. Stale/Duplicated Files & Confusions

- **`client/src/pages/admin/badges.tsx` vs `client/src/pages/admin/xp/badges.tsx`**: Potential duplication or unclear distinction. Needs clarification.
- **`client/src/pages/threads/[thread_slug].tsx` vs `client/src/pages/threads/[id].tsx`**: The router uses `threads/:id` to point to `ThreadPage` which is defined in `threads/[thread_slug].tsx`. The file `client/src/pages/threads/[id].tsx` also exists. This is confusing.
  - **Action**: Clarify which file is the correct one for `/threads/:id` (or `/threads/:slug`). If `threads/[id].tsx` is unused or a duplicate, remove it. Ensure router consistency.
- **Potentially Superseded Pages**:
  - `profile-page.tsx` by `profile/[username].tsx`
  - `thread-page.tsx` by `threads/[thread_slug].tsx`
  - `forum/[slug].tsx` by `forums/[forum_slug].tsx`
  - **Action**: Confirm and remove superseded files if they are no longer needed.

## 6. Components Audit (Continued - Feature Specific)

### 6.1 Admin Components (`client/src/features/admin/components/` and `client/src/components/admin/`)

- **`client/src/components/admin/admin-sidebar.tsx` (`AdminSidebar`)**:

  - Status: Functionally seems fine, but it receives `adminLinks` from `AdminLayout` which contains dead links.
  - **Action**: The issues lie with the data (`adminLinks`) provided by `AdminLayout`, not the sidebar component itself.

- **`client/src/features/admin/components/dashboard/admin-stats-cards.tsx`**:

  - Purpose: Displays various statistics cards for the admin dashboard.
  - Dependencies: `apiRequest`, `useQuery`, various UI components (`Card`, `Skeleton`, icons).
  - API Calls: Fetches data from `/api/admin/stats/overview`, `/api/admin/stats/users`, `/api/admin/stats/threads`, `/api/admin/stats/dgt`.
  - Status: Appears to be a functional component for displaying stats. Assumes backend endpoints are operational.
  - No immediate wiring issues noted within the component itself, but relies on `apiRequest` and query client setup.

- **`client/src/features/admin/components/dashboard/recent-registrations-widget.tsx`**:

  - Purpose: Shows a list of recently registered users.
  - Dependencies: `apiRequest`, `useQuery`, `Avatar`, `Table`, `Badge`, `Button`.
  - API Call: Fetches data from `/api/admin/users/recent`.
  - Links: Usernames link to `/admin/users/:userId` (this route should lead to an "edit user" or "view user" page, which is `client/src/pages/admin/edit-user.tsx` but currently unrouted).
  - Status: Appears functional.
  - **Action Needed**: Ensure the `/admin/users/:userId` route is implemented and correctly links to the user detail/edit page.

- **`client/src/features/admin/components/dashboard/platform-health-widget.tsx`**:
  - Purpose: Displays platform health metrics (CPU, memory, disk, DB status).
  - Dependencies: `apiRequest`, `useQuery`, `Progress` component, icons.
  - API Call: Fetches data from `/api/admin/platform/health`.
  - Status: Appears functional, assuming the backend endpoint provides the necessary data.
  - No immediate wiring issues noted.

_(Further auditing of other admin components under `client/src/features/admin/components/` would follow a similar pattern: check purpose, dependencies, API calls, internal links, and overall status.)_

### 6.2 Forum Feature Components (`client/src/features/forum/components/`)

- **`client/src/features/forum/components/canonical-zone-grid.tsx` (`CanonicalZoneGrid`)**:

  - Purpose: Displays primary forum zones/categories as prominent cards.
  - Dependencies: `useForumStructure` hook, `ForumCategoryCard`.
  - Status: Appears to be functional and uses the central `useForumStructure` hook as per `update-history.mdc` (2025-01-27 entry).
  - No immediate wiring issues noted.

- **`client/src/features/forum/components/forum-category-card.tsx` (`ForumCategoryCard`)**:

  - Purpose: Displays a single forum category with its details.
  - Dependencies: `Link` (wouter), UI components (`Card`, `Badge`), icons.
  - Props: `category` (type `ForumCategoryWithStats`).
  - Links: Links to `/forum/:slug` (maps to `client/src/pages/forums/[forum_slug].tsx`).
  - Status: Appears functional.
  - No immediate wiring issues noted.

- **`client/src/features/forum/components/sidebar-navigation.tsx` (`SidebarNavigation`)**:

  - Purpose: Provides sidebar navigation for secondary forum zones/categories.
  - Dependencies: `useForumStructure` hook, `Link` (wouter), UI components (`Accordion`).
  - Status: Appears functional and uses `useForumStructure` hook.
  - No immediate wiring issues noted.

- **`client/src/features/forum/components/thread-post-form.tsx` (`ThreadPostForm`)**:
  - Purpose: Form for creating new threads or posts.
  - Dependencies: `RichTextEditor`, `TagInput`, `Button`, `Form` components, `useForm` (react-hook-form), `zodResolver`, `apiRequest`, `useParams`, `useRouter` (wouter), `useToast`.
  - API Calls: Posts to `/api/forum/threads` (for new threads) or `/api/forum/threads/:threadId/posts` (for replies).
  - Issues:
    - Relies on the **mock `useToast` hook**. Feedback for successful/failed submissions will not be visual.
  - **Action Needed**: Implement functional `useToast`.

_(Further auditing of other forum feature components would follow a similar pattern.)_

### 6.3 Wallet Feature Components (`client/src/features/wallet/components/`)

- **`client/src/features/wallet/components/wallet-overview.tsx` (`WalletOverview`)**:

  - Purpose: Displays current DGT balance and transaction history.
  - Dependencies: `useWallet` hook, `apiRequest`, `useQuery`, `Button`, `Table`, `Skeleton`, `WalletSheet`.
  - API Calls: Fetches balance from `/api/wallet/balance`, transactions from `/api/wallet/transactions`.
  - Status: Appears functional, relying on `useWallet` hook and `apiRequest`.
  - No immediate wiring issues noted within the component.

- **`client/src/components/economy/wallet/WalletSheet.tsx` (`WalletSheet`)**:
  - Purpose: A sheet/drawer component to display wallet actions (deposit, withdraw, transfer).
  - Dependencies: `Sheet` components, `Tabs`, `Button`, `Input`, `useAuth`, `useWallet`, `apiRequest`, `useToast`.
  - API Calls: `/api/wallet/deposit`, `/api/wallet/withdraw`, `/api/wallet/transfer`.
  - Issues:
    - Relies on the **mock `useToast` hook**. Feedback for transactions will not be visual.
  - **Action Needed**: Implement functional `useToast`.

## 7. Final Checklist: Priority Wiring & Fixes

This list summarizes the most critical items requiring attention to improve UI functionality and completeness.

1.  **Implement Functional `useToast` and `ToastProvider`**:

    - **Affected Components**: `BookmarkButton`, `ThreadPostForm`, `WalletSheet`, and any other component currently using the mock `useToast`.
    - **Reason**: Critical for user feedback on actions (success, errors). Currently non-functional.

2.  **Implement `TooltipProvider`**:

    - **Location**: Wrap the application (e.g., in `client/src/pages/_app.tsx` or `SiteLayoutWrapper`).
    - **Reason**: Global tooltips are currently non-functional.

3.  **Export `Card` Component**:

    - **File**: `client/src/components/ui/card.tsx`.
    - **Reason**: The main `Card` wrapper is not exported, making the `CardHeader`, `CardContent`, etc., difficult to use as intended.

4.  **Resolve Unrouted Admin Pages**:

    - **Pages**: All admin pages listed in Section 1.4 and 3.2 (especially XP management, user editing, announcements create/edit, airdrop, features, missions).
    - **Action**: Add routes in `client/src/core/router.tsx`, link from `AdminLayout` sidebar.
    - **Reason**: Core admin functionalities are inaccessible.

5.  **Fix Incorrect Navigation Links**:

    - `BookmarkButton`: `/login` -> `/auth`.
    - `SiteHeader`: `/login` -> `/auth`. Confirm `/forum` for Sign Up.
    - `AdminLayout`: Update `adminLinks` to point to routed pages.
    - `ModSidebar`: Remove dead links or implement target pages/routes.
    - **Reason**: Broken navigation leads to dead ends and user frustration.

6.  **Resolve `candlestick-menu.tsx` CSS Dependency**:

    - **File**: `client/src/components/ui/candlestick-menu.tsx`.
    - **Action**: Ensure the required external CSS for animations is correctly linked and loaded.
    - **Reason**: Component is visually broken without its styles.

7.  **Clarify and Route/Remove Stale/Duplicate Pages**:

    - `client/src/pages/admin/badges.tsx` vs `client/src/pages/admin/xp/badges.tsx`.
    - `client/src/pages/threads/[thread_slug].tsx` vs `client/src/pages/threads/[id].tsx`.
    - Other potentially superseded pages (profile, thread, forum).
    - All other unrouted general pages (Section 1.4).
    - **Reason**: Reduces codebase clutter and confusion, ensures all necessary pages are accessible.

8.  **Integrate UI Components**:

    - `Pagination`: In forum lists, profiles, search results, admin tables.
    - `AlertDialog`: For confirmation of destructive actions (content deletion, admin actions, wallet transactions).
    - `Alert`: For form feedback, page-level announcements, validation errors.
    - `BookmarkButton`: In thread lists and individual thread pages.
    - `Breadcrumb`: In forum pages, admin sub-pages, profile sections.
    - **Reason**: Enhances UX by providing standard UI patterns and functionalities.

9.  **Consider Implementing `AvatarStack` Component**:
    - **Reason**: Useful for displaying multiple user avatars consistently.

## 8. Opportunities for Innovation & Gamified Forum Enhancements

Based on the audit, here are some areas where gamification and innovative features could be more deeply integrated or enhanced:

- **Admin XP Dashboard**:

  - Beyond just adjusting XP, the admin XP settings pages (`client/src/pages/admin/xp/*`) could be unified into a more comprehensive dashboard.
  - This dashboard could visualize XP distribution, level progression rates, popular XP-earning actions, and allow for fine-tuning of the entire XP economy.
  - **Modular Component Idea**: A `XPAnalyticsCard` showing specific XP metrics, reusable across different admin views.

- **User-Facing XP & Badges Visibility**:

  - While `client/src/pages/profile/[username].tsx` likely shows user XP/badges, ensure these elements are modular and can be easily integrated elsewhere (e.g., mini-profiles on forum posts, leaderboards).
  - The unrouted `client/src/pages/profile/xp-demo.tsx` and `client/src/pages/profile/xp.tsx` might contain ideas or components that could be repurposed for better user-facing display of gamification elements.
  - **Innovation**: Interactive XP history or upcoming level rewards directly on the profile.

- **Mission System Integration**:

  - The unrouted `client/src/pages/missions/index.tsx` and `client/src/pages/admin/missions/index.tsx` suggest a planned mission system.
  - **Gamification**: Missions could be dynamically generated or tied to specific forum activities (e.g., "Post in 3 different categories today," "Receive 5 upvotes on a thread").
  - **UI**: A dedicated `MissionsOverview` component that users can easily access, perhaps from the `SiteHeader` or sidebar, showing active, completed, and available missions with progress bars and rewards.

- **Tagging System Enhancements**:

  - The unrouted `client/src/pages/admin/tags.tsx` and `client/src/pages/tags/[tagSlug].tsx` point to a tagging system.
  - **Gamification**: Users could earn XP for applying relevant tags, or "expert" status for specific tags based on their contributions to tagged content.
  - **UI**: More prominent display of tags on threads, tag clouds, and potentially user profiles showing tags they frequently interact with or are experts in.

- **"Zones" and "Topics" as Navigational or Content Hubs**:

  - Unrouted pages `client/src/pages/zones/index.tsx` and `client/src/pages/topics/[topic_slug].tsx`.
  - **Innovation**: "Zones" could be gamified interest areas where users unlock content or features by participating. "Topics" could be dynamic, curated collections of content that users can subscribe to or that highlight trending discussions, potentially with their own leaderboards or contribution rewards.

- **Interactive Leaderboards**:

  - `client/src/pages/leaderboard.tsx` is wired.
  - **Enhancement**: Beyond simple lists, leaderboards could be filterable (weekly, monthly, all-time, by category/tag), and clicking a user could show a mini-profile or their recent contributions that put them on the leaderboard.
  - **Modular Component**: `LeaderboardEntryCard` for consistent display.

- **Community Challenges/Events**:

  - Not directly visible from file names, but a natural extension of gamification.
  - **Innovation**: Timed community-wide challenges (e.g., "Help 10 new users this week," " collectively create 100 new threads in X category") with shared goals and rewards.
  - **UI**: A dedicated `CommunityEventTracker` component.

- **Dynamic Content based on User Progress/Role**:
  - Leverage feature gates (`client/src/components/ui/feature-gate.tsx`) more extensively.
  - **Gamification**: Unlock special forum sections, UI themes, or avatar customization options as users level up or complete certain achievements/missions.

This concludes the audit based on the provided information and files. The key next step is to prioritize the "Final Checklist" items to address the most critical wiring and functionality gaps.
