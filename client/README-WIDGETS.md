# Widget System

This project supports an optional sidebar/main **Widget System** that lets users add, move and remove mini-components (widgets) at runtime.

## Enabling / Disabling

Toggle the flag in `client/src/config/featureFlags.ts`:

```ts
export const ENABLE_WIDGETS = true; // flip to false to turn everything off
```

• When **false**: `ResponsiveLayoutWrapper` renders its children in a simple full-width column, no sidebars, no SlotRenderer, no widget code executed.
• When **true**: the full dynamic layout, sidebars, WidgetGallery, drag-and-drop etc. are active.

No other changes are needed—this flag is checked at runtime.

## Adding a New Widget

1. Create your component (e.g. `MyWidget.tsx`).
2. Add an entry in `client/src/config/widgetRegistry.ts` with metadata & dynamic import.
3. It immediately becomes available in the _Add Widget_ gallery.

### Slot-aware Variants _(NEW)_

Widgets automatically receive a `slotId` prop (e.g. `sidebar/right`, `main/top`).
If your widget can render in more than one style, expose a **`variant`** prop and
let `WidgetFrame` decide which value to pass:

```tsx
export default function HotThreads({ variant = 'widget' }: { variant: 'widget' | 'feed' }) {
  return variant === 'feed' ? <CompactList /> : <CardLayout />;
}
```

`WidgetFrame` currently sets:
* `variant="feed"` for any widget located in an **`main/*`** slot.
* `variant="widget"` in sidebars.

No additional wiring is needed—moving the widget triggers the correct variant.

## Dev-Tips

• Use `npm run kill-ports` then `npm run dev` for a clean startup.
• If Vite shows _failed to resolve import_ overlays, the registry path or export name is wrong—fix and restart.
