# Animation Fix Guide for Degentalk

## Problem Summary

All animations (Framer Motion and React Rough Notation) are appearing instantly without smooth transitions due to global CSS rules that disable animations.

## Root Causes

1. **System-level `prefers-reduced-motion` preference**
   - Located in `/src/index.css` lines 680-694
   - Disables ALL animations when the OS/browser has "reduce motion" enabled
   - Uses `!important` which overrides component-level animation settings

2. **App-level motion preferences**
   - The `accessibility-enhancements.tsx` component can add `reduce-motion` class to body
   - When active, sets animation/transition duration to 0.01ms
   - Multiple CSS files enforce this: `accessibility.css`, `content-feed.css`

3. **Global animation overrides**
   - CSS selectors like `*` with `!important` flags
   - Affects Framer Motion's inline styles
   - Affects React Rough Notation's SVG animations

## Quick Fixes

### 1. Check System Settings
- **macOS**: System Preferences → Accessibility → Display → Reduce motion (should be OFF)
- **Windows**: Settings → Ease of Access → Display → Show animations (should be ON)
- **Browser**: Check if any extensions are forcing reduced motion

### 2. Check Diagnostic Component
The diagnostic component added to the layout will show:
- System `prefers-reduced-motion` status
- Body classes that might disable animations
- Computed animation/transition durations

### 3. Temporary Override (Development)
Add the `force-animation` class to components that must animate:

```tsx
// For Framer Motion
<motion.div className="force-animation" ...>

// For React Rough Notation
<div className="force-animation">
  <RoughNotation ...>
</div>
```

### 4. Permanent Solutions

#### Option A: Respect User Preferences (Recommended)
Keep the current system but ensure animations work when preferences allow:

1. Check that no accessibility classes are being added unintentionally
2. Use the diagnostic component to verify settings
3. Add exceptions for critical animations using `:not()` selectors

#### Option B: Override for Specific Pages
Create a custom hook to temporarily enable animations:

```tsx
function useForceAnimations() {
  useEffect(() => {
    document.body.classList.add('enable-animations');
    return () => {
      document.body.classList.remove('enable-animations');
    };
  }, []);
}
```

Then add CSS:
```css
body.enable-animations * {
  animation: unset !important;
  transition: unset !important;
}
```

#### Option C: Remove Global Overrides (Not Recommended)
Comment out the animation-disabling rules in:
- `/src/index.css` lines 680-703
- `/src/styles/accessibility.css` lines 67-74

This would ignore user accessibility preferences.

## Testing Animations

1. Run the development server: `pnpm dev`
2. Check the diagnostic panel in the bottom-left corner
3. Navigate to pages with animations (About, Contact, Shop)
4. Animations should work if:
   - System reduced motion is OFF
   - No `reduce-motion` or `no-motion` classes on body
   - Computed durations show actual time values (not 0s or 0.001s)

## Long-term Solution

1. Create a motion preferences context that respects user settings
2. Use CSS custom properties for animation durations
3. Allow users to override system settings within the app
4. Document which animations are essential vs decorative

## Files Modified

1. `/src/index.css` - Added `.force-animation` exception
2. `/src/layouts/RootLayout.tsx` - Added diagnostic component
3. `/src/components/debug/AnimationDiagnostic.tsx` - Created diagnostic tool

## Cleanup

After fixing the issue:
1. Remove the diagnostic component from RootLayout
2. Delete `/src/components/debug/AnimationDiagnostic.tsx`
3. Document the chosen solution in the codebase