# Forum Design System

## Typography Scale (Standardized)

### Headers
- Page titles: `text-xl font-bold` (was text-2xl)
- Section headers: `text-base font-semibold` (was text-lg)
- Card titles: `text-sm font-medium`
- Subsection headers: `text-xs font-semibold`

### Body Text
- Primary content: `text-sm`
- Secondary content: `text-xs`
- Metadata/timestamps: `text-xs text-zinc-400`
- Helper text: `text-xs text-zinc-500`

### Compact Layout
- Card titles: `text-sm`
- All other text: `text-xs`

## Spacing System

### Page Layout
- Container padding: `py-8`
- Section spacing: `space-y-6`
- Grid gaps: `gap-6` for main sections, `gap-4` for cards

### Components
- Card padding: `p-4` (compact) or `p-6` (comfortable)
- Button sizes: `size="sm"` for actions
- Icon sizes: `w-4 h-4` for inline, `w-3 h-3` for compact

## Color System

### Background Hierarchy
- Page background: default (inherit)
- Primary cards: `bg-zinc-900/50`
- Secondary cards: `bg-zinc-900/30`
- Hover states: `hover:bg-zinc-800/50`
- Borders: `border-zinc-800`

### Text Colors
- Primary text: `text-white` or `text-zinc-100`
- Secondary text: `text-zinc-400`
- Muted text: `text-zinc-500`
- Links: `text-emerald-400 hover:text-emerald-300`

## Component Patterns

### Theme Toggle
- Position: Top-right of page header
- Style: `bg-zinc-900/50 rounded-lg px-3 py-2 border border-zinc-800`
- Icons: Monitor (modern) and Layout (classic)

### Breadcrumbs
- Modern: Inline with ChevronRight separators
- Classic: MyBBBreadcrumb component with traditional styling

### Forum Lists
- Modern: Table layout with hover effects
- Classic: MyBB-style with category headers

### Online Users
- Always show avatars with online indicators
- Use comma-separated text list below avatars
- Unified component: OnlineUsersDisplay

## Responsive Design

### Breakpoints
- Mobile: Default
- Tablet: `md:` prefix
- Desktop: `lg:` prefix
- Wide: `xl:` prefix

### Grid Layouts
- Forums grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Main content + sidebar: `grid-cols-1 xl:grid-cols-[1fr_300px]`