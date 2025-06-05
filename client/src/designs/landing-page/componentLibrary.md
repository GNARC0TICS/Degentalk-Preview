# Component Library: Degentalk Pre-Launch Landing Page

## 1. Introduction
This document outlines the key UI components to be used or adapted for the Degentalk Pre-Launch Landing Page. Many of these components will be drawn from the existing Degentalk application's library (`@/components/ui/` and feature-specific components) to ensure visual consistency.

## 2. Core Reusable Components (from existing app)

### 2.1. `HeroSection`
- **Source:** `@/components/layout/hero-section.tsx` (or similar path if it exists)
- **Adaptation for Landing Page:**
    - **Content:** Update with landing page specific headline, sub-headline, and potentially a primary CTA (email subscription button).
    - **Visuals:** May require different background imagery or styling to suit a pre-launch context.
- **Props to Consider:** `title`, `subtitle`, `backgroundImageUrl`, `ctaButtonText`, `ctaButtonLink` (or `onCtaClick`).

### 2.2. `SiteFooter`
- **Source:** `@/components/layout/site-footer.tsx` (or similar)
- **Adaptation for Landing Page:**
    - **Content:** Ensure links are relevant for a pre-launch page (e.g., social media, placeholder for terms/privacy). May be simpler than the app's main footer.
- **Props to Consider:** `copyrightText`, `linksArray`.

### 2.3. `Button`
- **Source:** `@/components/ui/button.tsx`
- **Usage:**
    - Primary CTA (Email Subscription).
    - Secondary links/actions if any.
- **Variants to Use:**
    - Default/Primary variant for the main email subscription CTA.
    - `variant="ghost"` for less prominent links (as seen in `home.tsx`).
- **Styling:** Adhere to `styleGuide.md` for colors and states.

### 2.4. `Card`, `CardHeader`, `CardTitle`, `CardContent`
- **Source:** `@/components/ui/card.tsx`
- **Usage:** For displaying feature highlights.
- **Styling:** Adhere to `styleGuide.md` (e.g., `bg-zinc-900`, `border-zinc-800`).

### 2.5. Icons
- **Source:** `lucide-react`, `@heroicons/react/24/outline`
- **Usage:** Within feature highlight cards, alongside CTAs, or in the header/footer.
- **Examples from `home.tsx`:** `ArrowRight`, `FolderOpen`, `ChevronRightIcon`, `ChatBubbleBottomCenterTextIcon`, `HandThumbUpIcon`.

### 2.6. `AnnouncementTicker` (Optional)
- **Source:** `@/components/layout/announcement-ticker.tsx`
- **Usage:** Could be adapted to display "Coming Soon!" messages or cycle through key launch USPs.
- **Consideration:** May be too dynamic for a simple landing page; evaluate if it adds value.

## 3. New or Adapted Components for Landing Page

### 3.1. Minimal Navigation Bar
- **Purpose:** Display logo and potentially an anchor link to "Features".
- **Structure:**
    ```html
    <nav class="flex justify-between items-center p-4">
      <img src="/logo.png" alt="Degentalk Logo" class="h-8" />
      <!-- Optional: <a href="#features">Features</a> -->
    </nav>
    ```
- **Styling:** Clean, dark theme consistent.

### 3.2. Feature Highlight Card
- **Purpose:** To showcase a single key feature.
- **Structure (based on `Card` component):**
    ```html
    <Card>
      <CardHeader>
        <!-- Icon here -->
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Short feature description.</p>
      </CardContent>
    </Card>
    ```
- **Styling:** As per `styleGuide.md`.

### 3.3. Email Subscription Form
- **Purpose:** Capture user emails.
- **Structure:**
    ```html
    <form class="flex flex-col sm:flex-row gap-2">
      <input type="email" placeholder="Enter your email" required class="input-style" />
      <Button type="submit">Subscribe</Button>
    </form>
    <p class="text-xs text-zinc-500 mt-2">We respect your privacy. No spam.</p>
    ```
- **Components:**
    - `input type="email"`: Needs styling from `styleGuide.md`.
    - `Button`: Use existing primary button component.
- **Interaction:** Basic form validation (HTML5 `required`, `type="email"`). Submission handling to be defined (likely calls an API or integrates with a service).

## 4. Emphasis Patterns & States
- **Hover States:** Apply to buttons and any interactive links, consistent with existing app patterns (e.g., `hover:text-white` for ghost buttons).
- **Focus States:** Ensure clear focus outlines for all interactive elements (buttons, input fields) for accessibility, as per `styleGuide.md`.
- **Shadows/Gradients:** Generally, the theme is flat and modern based on `home.tsx`. If shadows or gradients are used, they should be subtle and consistent.

## 5. Accessibility (ARIA Roles & Keyboard Interactions)
- **Buttons & Links:** Should be natively keyboard accessible.
- **Forms:**
    - Inputs should have associated `<label>` elements (can be visually hidden if design requires).
    - Use `aria-describedby` for any help text or error messages related to form fields.
- **Modals (if any, unlikely for this landing page):** Follow ARIA patterns for modals (focus trapping, `aria-modal="true"`).
