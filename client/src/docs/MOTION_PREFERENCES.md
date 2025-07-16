# Motion Preferences System

## Overview
DegenTalk implements a comprehensive motion preference system that respects user accessibility needs while allowing specific animations (like the announcement ticker) to continue functioning.

## How It Works

### 1. Motion Detection
The system checks for motion preferences in this order:
1. **OS Level**: Checks `prefers-reduced-motion` media query
2. **User Preference**: Checks localStorage for `motion-enabled` key
3. **Default**: If OS has reduced motion, animations are disabled by default

### 2. Implementation
- **MotionContext** (`/client/src/contexts/MotionContext.tsx`): Manages motion state
- **CSS Classes**: `.no-motion` class applied to `<body>` when motion is disabled
- **Animation Control**: CSS rules in `/client/src/index.css` (lines 662-685)

### 3. CSS Rules

```css
/* When OS prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *:not(.announcement-ticker-content),
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

/* When app motion is disabled via .no-motion class */
body.no-motion *:not(.announcement-ticker-content),
body.no-motion *::before,
body.no-motion *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
```

## Exceptions
The following components are exempt from motion restrictions:
- `.announcement-ticker-content` - Always animates for important announcements

## Usage

### Check Motion State
```typescript
import { useMotion } from '@/contexts/MotionContext';

function MyComponent() {
  const { isMotionEnabled, toggleMotion } = useMotion();
  
  return (
    <div className={isMotionEnabled ? 'animate-slide-in' : ''}>
      {/* Component content */}
    </div>
  );
}
```

### Add New Exception
To exempt a component from motion restrictions, add it to the `:not()` selector:
```css
body.no-motion *:not(.announcement-ticker-content):not(.your-component-class)
```

## User Control
Users can control motion preferences via:
1. OS accessibility settings
2. Future: Settings page toggle (to be implemented)
3. Browser DevTools: `localStorage.setItem('motion-enabled', 'true')`

## Testing
1. **Enable reduced motion**: OS Settings → Accessibility → Display → Reduce motion
2. **Toggle in app**: Open DevTools console and run:
   ```javascript
   localStorage.setItem('motion-enabled', 'false'); // Disable
   localStorage.setItem('motion-enabled', 'true');  // Enable
   location.reload(); // Refresh to apply
   ```

## Important Notes
- Always respect user preferences for accessibility
- Test animations with reduced motion enabled
- Consider providing alternative feedback for disabled animations
- Document any new animation exceptions clearly