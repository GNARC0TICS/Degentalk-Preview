# Next.js Migration Plan for DegenTalk Landing Page

## Overview
This migration plan outlines a safe, incremental approach to migrate the existing Vite + React landing page to Next.js while preserving ALL existing components without modifications.

## Current Architecture Analysis

### 1. Project Structure
```
client/
├── src/
│   ├── components/     # UI components (100+ files)
│   ├── config/         # Configuration files
│   ├── constants/      # Constants and routes
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Layout components
│   ├── lib/           # Utilities and libraries
│   ├── pages/         # Page components
│   ├── providers/     # React providers
│   ├── schemas/       # Validation schemas
│   ├── stores/        # State management
│   ├── styles/        # CSS files
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies
```

### 2. Routing Implementation
- **Current**: React Router v7 with createBrowserRouter
- **Routes**: 
  - `/` - Home page
  - `/about` - About page
  - `/contact` - Contact page
  - `/legal/privacy` - Privacy policy
  - `/legal/terms` - Terms of service

### 3. Import Aliases
- `@/` → `src/`
- `@shared/` → `../shared/`

### 4. Dependencies Analysis
- **UI Framework**: Radix UI components
- **Styling**: Tailwind CSS with custom configuration
- **Animations**: Framer Motion, GSAP, Lottie
- **Analytics**: Vercel Analytics
- **Email**: EmailJS

### 5. Build Configuration
- **Target**: ES2015
- **Port**: 5173
- **Manual chunks**: vendor, ui, utils
- **No minification in development**

## Migration Strategy

### Phase 1: Next.js Setup (Zero Component Changes)

#### 1.1 Create Next.js Wrapper Structure
```bash
# New structure alongside existing
client-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout wrapper
│   ├── page.tsx           # Home page wrapper
│   ├── about/
│   │   └── page.tsx       # About page wrapper
│   ├── contact/
│   │   └── page.tsx       # Contact page wrapper
│   └── legal/
│       ├── privacy/
│       │   └── page.tsx   # Privacy page wrapper
│       └── terms/
│           └── page.tsx   # Terms page wrapper
├── next.config.js         # Next.js configuration
├── package.json           # Next.js dependencies
└── tsconfig.json          # TypeScript config for Next.js
```

#### 1.2 Next.js Configuration
```javascript
// next.config.js
module.exports = {
  transpilePackages: ['@degentalk/client'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../client/src'),
      '@shared': path.resolve(__dirname, '../shared')
    };
    return config;
  },
  images: {
    domains: ['localhost'],
    unoptimized: true // Initially disable optimization
  }
};
```

#### 1.3 Wrapper Components
Each Next.js page will be a thin wrapper around existing components:

```typescript
// app/page.tsx
import HomePage from '@/pages/home';

export default function Page() {
  return <HomePage />;
}
```

### Phase 2: Incremental Migration

#### 2.1 Static Assets
1. Copy `public/` contents to Next.js `public/`
2. Maintain identical structure
3. No changes to asset references

#### 2.2 Styles
1. Copy all CSS files to Next.js
2. Import global styles in `app/layout.tsx`
3. Preserve all Tailwind configurations

#### 2.3 Layout System
```typescript
// app/layout.tsx
import '@/index.css';
import '@/styles/animations.css';
import { UIConfigProvider } from '@/contexts/UIConfigContext';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UIConfigProvider>
          {children}
          <Analytics />
        </UIConfigProvider>
      </body>
    </html>
  );
}
```

### Phase 3: Feature Parity

#### 3.1 Client-Side Features
- Wrap all pages in client components initially
- Preserve all existing hooks and state management
- Maintain React Router patterns temporarily

#### 3.2 Environment Variables
- Map Vite's `import.meta.env` to Next.js `process.env`
- Create compatibility layer if needed

#### 3.3 Analytics & Third-Party Scripts
- Move Google Analytics initialization to Next.js Script component
- Preserve Vercel Analytics integration

### Phase 4: Testing & Validation

#### 4.1 Side-by-Side Testing
1. Run both Vite and Next.js versions simultaneously
2. Compare visual output
3. Validate all interactive features
4. Check performance metrics

#### 4.2 Migration Checklist
- [ ] All routes accessible
- [ ] Styles rendered correctly
- [ ] Animations working
- [ ] Forms functional
- [ ] Analytics tracking
- [ ] SEO metadata present
- [ ] No console errors
- [ ] Performance acceptable

### Phase 5: Optimization (Post-Migration)

Only after successful migration:
1. Enable Next.js Image optimization
2. Implement ISR/SSG where beneficial
3. Optimize bundle splitting
4. Add API routes if needed

## Implementation Timeline

### Week 1: Setup & Basic Migration
- Day 1-2: Next.js project setup
- Day 3-4: Create wrapper pages
- Day 5: Migrate styles and assets

### Week 2: Feature Parity
- Day 1-2: Test all interactive features
- Day 3-4: Fix compatibility issues
- Day 5: Performance testing

### Week 3: Validation & Deployment
- Day 1-2: Side-by-side comparison
- Day 3-4: Fix remaining issues
- Day 5: Deployment preparation

## Risk Mitigation

### 1. Zero Component Modification Policy
- All existing components remain untouched
- Only wrapper files created in Next.js
- Original Vite app remains functional

### 2. Incremental Approach
- Each phase independently testable
- Rollback possible at any stage
- No breaking changes to existing code

### 3. Compatibility Layer
- Create adapters for environment variables
- Maintain import alias compatibility
- Preserve all existing patterns

## Success Criteria

1. **Functional Parity**: All features work identically
2. **Visual Parity**: No visual differences
3. **Performance**: Load time ≤ current Vite app
4. **Zero Regressions**: No broken functionality
5. **Maintainability**: Clear migration path for future updates

## Next Steps

1. Create `client-next/` directory structure
2. Initialize Next.js project with TypeScript
3. Configure build tools and aliases
4. Create first wrapper page (home)
5. Validate approach before proceeding

## Notes

- This plan prioritizes safety over optimization
- Performance improvements come after successful migration
- Original Vite app remains the fallback throughout
- Each phase has clear rollback procedures