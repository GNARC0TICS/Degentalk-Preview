# Custom Icons Directory

This directory contains custom Lucide-style SVG icons for DegenTalk.

## Icon Guidelines

- **Size**: All icons should be 24x24 pixels
- **Stroke**: 2px stroke width (matching Lucide)
- **Style**: Outline style, no fills
- **Color**: Icons should be monochrome (currentColor)
- **Naming**: PascalCase (e.g., `DegenCoin.tsx`, `XpBoost.tsx`)

## Adding New Icons

1. Place your SVG file in this directory
2. Convert to React component:
   ```tsx
   export const DegenCoin = (props: React.SVGProps<SVGSVGElement>) => (
     <svg
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
       {...props}
     >
       {/* SVG paths here */}
     </svg>
   );
   ```
3. Export from `index.ts`

## Usage

```tsx
import { DegenCoin } from '@/components/icons';

<DegenCoin className="w-6 h-6 text-emerald-500" />
```