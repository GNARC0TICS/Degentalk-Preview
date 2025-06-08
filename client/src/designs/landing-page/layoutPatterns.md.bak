# Layout Patterns: Degentalk™ Pre-Launch Landing Page

## 1. Introduction
This document outlines the layout patterns for the Degentalk™ Pre-Launch Landing Page. It ensures a consistent and responsive structure, drawing inspiration from modern landing page best practices and the existing Degentalk™ application's feel.

## 2. Overall Page Structure
The landing page will primarily use a single-column, section-based flow to guide users linearly from the initial introduction to the call to action.

```mermaid
graph TD
    A[Page Container (Full Width, Dark Background)] --> B(Header/Minimal Navigation);
    A --> C(Hero Section);
    A --> D(Feature Highlights Section);
    A --> E(Email Subscription CTA Section);
    A --> F(Optional: Benefits/Why Subscribe Section);
    A --> G(Footer);

    subgraph PageContainer
        direction TB
        B
        C
        D
        E
        F
        G
    end
```

## 3. Section Blueprints

### 3.1. Header/Minimal Navigation
- **Layout:** Full-width, typically fixed or sticky at the top.
- **Content:** Logo aligned to the left. Optional: A single "Features" anchor link aligned to the right.
- **Responsiveness:** Logo may scale down on smaller screens. Navigation links might collapse into a hamburger menu if more than one link is present (though unlikely for this minimal version).
- **Styling:** Clean, unobtrusive, consistent with the dark theme.

### 3.2. Hero Section
- **Layout:** Full-width, often full-viewport height or a significant portion of it.
- **Content:** Centered or left-aligned text (Headline, Sub-headline). CTA button prominently displayed.
- **Background:** Can be a solid color, gradient, or image/video.
- **Responsiveness:** Text sizes adjust. Layout may stack vertically on mobile.
- **Inspiration:** `HeroSection` component from `client/src/pages/home.tsx`.

### 3.3. Feature Highlights Section
- **Layout:** Full-width section containing a grid or a series of stacked content blocks.
    - **Grid Option:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (similar to `CanonicalZoneGrid` structure in `home.tsx` but for features).
    - **Stacked Option:** Full-width content blocks for each feature, alternating text alignment or visual elements.
- **Content (per feature):** Icon, Feature Title, Short Description.
- **Styling:** Each feature block presented in a `Card` (see `styleGuide.md`).
- **Responsiveness:** Grid columns stack on smaller screens.

### 3.4. Email Subscription CTA Section
- **Layout:** Full-width section, clearly demarcated.
- **Content:** Centered headline, descriptive text, email input field, and submit button.
- **Input/Button Layout:** Typically inline on wider screens, stack vertically on smaller screens.
- **Responsiveness:** Ensure form elements are easily tappable on mobile.

### 3.5. Optional: Benefits/Why Subscribe Section
- **Layout:** Full-width section.
- **Content:** Headline, followed by a list (bullet points) or short paragraphs.
- **Responsiveness:** Text flows and remains readable.

### 3.6. Footer
- **Layout:** Full-width, at the bottom of the page.
- **Content:** Copyright, minimal links (e.g., social media icons, privacy/terms placeholders).
- **Styling:** Subdued, consistent with `SiteFooter` from `home.tsx`.
- **Responsiveness:** Links may stack or re-center on mobile.

## 4. Grid System & Breakpoints
- **Grid:** Utilize Tailwind CSS's built-in responsive grid system (e.g., `sm:`, `md:`, `lg:`, `xl:` prefixes).
- **Breakpoints:** Standard Tailwind CSS breakpoints:
    - `sm`: 640px
    - `md`: 768px
    - `lg`: 1024px
    - `xl`: 1280px
    - `2xl`: 1536px
- **Container:** Use `container mx-auto px-3 sm:px-4` for main content areas within sections to provide consistent padding and centering, as seen in `home.tsx`.

## 5. Visual Hierarchy & Gestalt Principles
- **Hierarchy:**
    - Hero headline should be the most prominent text element.
    - Section titles clearly demarcate different content areas.
    - CTA buttons should stand out.
- **Proximity:** Group related elements (e.g., feature icon, title, and description).
- **Similarity:** Use consistent styling for similar elements (e.g., all feature cards look alike).
- **Whitespace:** Employ ample whitespace to improve readability and reduce clutter.

## 6. Responsive Design Strategy
- **Mobile-First:** Design and build for mobile screens first, then scale up and adapt for larger screens.
- **Fluid Layouts:** Use relative units and flexible containers where possible.
- **Image Optimization:** Ensure images are optimized for different screen sizes.
- **Navigation:** For more complex navigation (not anticipated for this landing page), consider mobile-friendly patterns like hamburger menus.
