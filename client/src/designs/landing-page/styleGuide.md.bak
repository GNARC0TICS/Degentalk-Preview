# Style Guide: Degentalk™ Pre-Launch Landing Page

## 1. Introduction
This style guide outlines the visual and branding elements for the Degentalk™ Pre-Launch Landing Page. It aims to maintain consistency with the main Degentalk™ application's aesthetic, primarily drawing inspiration from `client/src/pages/home.tsx` and its associated styles.

## 2. Color Palette
*(Based on `home.tsx` and common dark theme patterns)*

- **Primary Background:** `#000000` (black) - `bg-black`
- **Primary Text:** `#FFFFFF` (white) - `text-white`
- **Secondary/Muted Text:** `#A1A1AA` (zinc-400) - `text-zinc-400`
- **Card Backgrounds:** `rgba(24, 24, 27, 0.5)` (zinc-900 with 50% opacity, or similar dark gray) - `bg-zinc-900/50` or `bg-zinc-900`
- **Card Borders:** `#3F3F46` (zinc-800) - `border-zinc-800`
- **Accent Color 1 (Example):** `#10B981` (emerald-500) - `text-emerald-500` (seen with icons)
- **Button Primary (Example):** Determine from existing primary button styles in the app. If none, suggest a vibrant accent.
- **Error/Alert Text:** `#F87171` (red-400) - `text-red-400`

## 3. Typography
*(Assuming Tailwind CSS defaults unless specified. Font family is likely set globally in `index.css` or Tailwind config)*

- **Headings (e.g., Hero, Section Titles):**
    - Font: (Inherited from global styles)
    - Weight: `font-bold`
    - Size: `text-2xl` (for section titles, e.g., "Primary Zones" in `home.tsx`), `text-4xl` or `text-5xl` for Hero headline (to be defined).
- **Body Text:**
    - Font: (Inherited from global styles)
    - Weight: `font-normal` (default)
    - Size: `text-base` (default)
- **Secondary/Muted Text:**
    - Color: `text-zinc-400`
    - Size: `text-sm` or `text-base`

## 4. Spacing System
- Consistent with Tailwind CSS spacing scale (e.g., `py-6`, `sm:py-8`, `md:py-12`, `gap-4`, `sm:gap-6`, `md:gap-8` as seen in `home.tsx`).
- Maintain responsive padding and margins.

## 5. Iconography
- **Primary Libraries:**
    - `lucide-react`
    - `Heroicons` (`@heroicons/react/24/outline`)
- **Style:** Clean, modern, outline-style where appropriate.
- **Usage:** For feature highlights, navigation cues, and calls to action.

## 6. Components Styling (Inspired by `home.tsx`)

### 6.1. Buttons
- **Primary CTA Button:**
    - Background: (To be defined, should be an accent color)
    - Text: `text-white` (or contrasting color)
    - Padding: Consistent with existing `Button` component.
    - Hover/Focus States: Define clear visual feedback.
- **Ghost/Secondary Button:**
    - Example from `home.tsx`: `variant="ghost"` `text-zinc-400 hover:text-white`

### 6.2. Cards (for Feature Highlights)
- Background: `bg-zinc-900` or `bg-zinc-900/50`
- Border: `1px solid border-zinc-800`
- Corner Radius: `rounded-lg` or `rounded-xl`
- Padding: Consistent with `CardContent` and `CardHeader` from `home.tsx`.

### 6.3. Input Fields (for Email Subscription)
- Background: Dark, contrasting with page background (e.g., `bg-zinc-800` or similar).
- Border: `border-zinc-700` or similar.
- Text Color: `text-white`.
- Placeholder Text Color: `text-zinc-500`.
- Focus State: Clear outline or border color change.

### 6.4. Hero Section
- Refer to the existing `HeroSection` component for styling cues.
- Typically involves large typography, a strong visual (background image or graphic), and a clear CTA.

### 6.5. Footer
- Refer to the existing `SiteFooter` component.
- Typically subdued text colors, minimal layout.

## 7. Imagery & Visuals
- **Hero Background:** If used, should be high-quality and align with the Degentalk™ brand (e.g., abstract tech, community visuals).
- **Feature Icons:** Clean and easily understandable.

## 8. Accessibility Notes
- **Contrast Ratios:** Ensure sufficient contrast between text and background colors, especially for CTA buttons and important information (WCAG AA minimum).
- **Focus Indicators:** All interactive elements (buttons, inputs) must have clear focus indicators.
- **Responsive Text:** Ensure text scales appropriately on different screen sizes.
- **Semantic HTML:** Use appropriate HTML5 tags for structure.

## 9. Layout
- **Overall:** Single-column or section-based flow, guiding the user downwards.
- **Responsiveness:** Mobile-first approach, ensuring the page looks good and functions well on all device sizes.
- **Grid:** Utilize Tailwind CSS grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) for feature highlights if appropriate.
