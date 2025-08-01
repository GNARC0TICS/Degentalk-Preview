# DegenTalk Landing Page - Project Documentation

## Project Overview

DegenTalk Landing Page is a modern Next.js 14 application built with a focus on performance, accessibility, and user experience. This landing page serves as the primary entry point for users to discover and join the DegenTalk community platform.

### Key Features
- **Next.js App Router**: Server-side rendering with modern routing capabilities
- **TypeScript**: Full type safety throughout the codebase
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI components
- **Framer Motion**: Advanced animations and micro-interactions
- **SEO Optimized**: Built-in SEO support with Next SEO
- **Performance Focused**: Optimized loading with code splitting and lazy loading

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [Component Library](#component-library)
6. [Configuration](#configuration)
7. [Development Guide](#development-guide)
8. [Deployment](#deployment)

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                  Next.js App Router              │
├─────────────────────────────────────────────────┤
│                    Pages Layer                   │
│         (app/page.tsx, app/about/page.tsx)      │
├─────────────────────────────────────────────────┤
│                 Components Layer                 │
│     (UI Components, Layout, Common, Sections)   │
├─────────────────────────────────────────────────┤
│              Configuration Layer                 │
│        (Theme, Brand, Navigation, Features)     │
├─────────────────────────────────────────────────┤
│                 Utilities Layer                  │
│         (Hooks, Helpers, Analytics, Email)      │
└─────────────────────────────────────────────────┘
```

### Design Principles
- **Component-Based**: Reusable, composable UI components
- **Type-Safe**: TypeScript throughout with strict mode enabled
- **Accessible**: WCAG AA compliant with Radix UI primitives
- **Performance**: Optimized bundle size and lazy loading
- **Responsive**: Mobile-first design approach

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.0
- **UI Components**: Radix UI
- **Animation**: Framer Motion 11.18.2, GSAP 3.13.0
- **Email**: EmailJS 4.4.1

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **PostCSS**: With Autoprefixer

### Key Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.0",
  "@radix-ui/*": "Various UI primitives",
  "framer-motion": "^11.18.2",
  "@vercel/analytics": "^1.5.0"
}
```

## Project Structure

### Directory Layout
```
degentalk-landing/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   └── legal/               # Legal pages (privacy, terms)
├── components/              # React components
│   ├── common/              # Shared components
│   ├── ui/                  # Base UI components
│   ├── layout/              # Layout components
│   ├── sections/            # Page sections
│   ├── landing/             # Landing-specific components
│   ├── header/              # Header components
│   ├── footer/              # Footer components
│   └── icons/               # Icon system
├── config/                  # Configuration files
│   ├── theme.config.ts      # Theme tokens
│   ├── brand.config.ts      # Brand design system
│   ├── navigation.ts        # Navigation structure
│   └── featureFlags.ts      # Feature toggles
├── styles/                  # Global styles
│   ├── globals.css          # Global CSS
│   ├── typography.css       # Typography system
│   └── animations.css       # Animation classes
├── lib/                     # Utilities
│   ├── utils.ts             # Helper functions
│   ├── analytics.ts         # Analytics integration
│   └── email.ts             # Email functionality
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
    ├── banners/             # Banner images
    └── images/              # Other images
```

### Key Files
- `next.config.js`: Next.js configuration with security headers
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts

## Design System

### Color System
The application uses a carefully crafted color palette optimized for dark mode and OLED displays:

#### Brand Colors
- **Primary**: Emerald Green (`#10b981`)
- **Secondary**: Orange (`#fb923c`)
- **Accent**: Red (`#dc2626`)

#### Semantic Colors
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`
- **Info**: `#3b82f6`

#### Surface Colors
- **Background**: Pure black (`#000000`) for OLED optimization
- **Card**: `#0d0d0d`
- **Elevated**: `#1a1a1a`
- **Borders**: Various shades of zinc

### Typography System
```typescript
{
  fonts: {
    sans: "Inter",
    display: "Orbitron",
    mono: "JetBrains Mono",
    game: "Press Start 2P"
  }
}
```

### Spacing Scale
Follows a consistent spacing scale from `0` to `144` (36rem).

### Animation System
- **Durations**: instant (0ms) to slowest (1000ms)
- **Easing**: Custom cubic-bezier functions
- **Hover Effects**: Scale and translate transforms
- **Stagger Animations**: For list items

## Component Library

### UI Components (`/components/ui/`)
Base UI components built on Radix UI primitives:
- **Alert**: Notification component
- **Button**: Various button styles and sizes
- **Card**: Content container with hover effects
- **Carousel**: Image/content carousel
- **Dropdown Menu**: Accessible dropdown menus
- **Sheet**: Slide-out panels
- **Skeleton**: Loading placeholders

### Layout Components (`/components/layout/`)
- **HeroSection**: Landing page hero
- **AnnouncementTicker**: Rotating announcements
- **BrowseTopicsLink**: Call-to-action link
- **HeroCTAButton**: Primary action buttons

### Common Components (`/components/common/`)
- **BackToHomeButton**: Navigation helper
- **Breadcrumb**: Page navigation
- **LoadingCard**: Loading states
- **StandardErrorDisplay**: Error handling

### Section Components (`/components/sections/`)
- **EmailSignup**: Newsletter subscription
- **FAQ**: Frequently asked questions
- **StrategyMeetsCommunity**: Feature section

## Configuration

### Theme Configuration (`config/theme.config.ts`)
Centralized theme tokens including:
- Color palette with WCAG AA compliance
- Typography scale and font families
- Spacing and sizing scales
- Animation timings and easings
- Component-specific tokens

### Brand Configuration (`config/brand.config.ts`)
Design system tokens extracted from successful components:
- Primary color schemes
- Animation patterns
- Loading states
- Error handling
- Card systems

### Navigation Configuration (`config/navigation.ts`)
Site navigation structure with:
- Main navigation items
- Footer links
- Legal pages
- External links

### Feature Flags (`config/featureFlags.ts`)
Toggle features on/off for:
- A/B testing
- Progressive rollouts
- Development features

## Development Guide

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

### Development Workflow
1. Components are developed in isolation
2. TypeScript ensures type safety
3. Tailwind utilities handle styling
4. Radix UI provides accessibility

### Code Style Guidelines
- Use TypeScript strict mode
- Follow React best practices
- Implement proper error boundaries
- Ensure components are accessible
- Optimize for performance

### Testing Approach
- Component testing with React Testing Library
- Accessibility testing with axe-core
- Performance testing with Lighthouse
- Visual regression testing

## Deployment

### Build Process
```bash
npm run build
```
Creates an optimized production build with:
- Code splitting
- Image optimization
- CSS minification
- JavaScript bundling

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### Production Optimization
- Automatic code splitting
- Image optimization with Next.js Image
- Font optimization
- CSS purging with Tailwind
- Security headers configured

### Deployment Platforms
Optimized for deployment on:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

## API Documentation

### Page Components

#### Home Page (`app/page.tsx`)
The main landing page showcasing:
- Hero section with CTA
- Feature highlights
- Community statistics
- Email signup

#### About Page (`app/about/page.tsx`)
Information about DegenTalk:
- Mission and vision
- Community values
- Team information

#### Contact Page (`app/contact/page.tsx`)
Contact form with:
- Email integration via EmailJS
- Form validation
- Success/error states

### Component API

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

#### Card Component
```typescript
interface CardProps {
  className?: string
  children: React.ReactNode
}
```

### Hooks

#### useMediaQuery
```typescript
function useMediaQuery(query: string): boolean
```
Responsive design helper hook.

#### useSearchParams
```typescript
function useSearchParams(): URLSearchParams
```
Next.js compatible search params hook.

#### useAuth
```typescript
function useAuth(): AuthContextType
```
Authentication state management.

## Performance Considerations

### Optimization Strategies
- Lazy loading for below-fold content
- Image optimization with next/image
- Code splitting at route level
- CSS purging for minimal bundle
- Font subsetting and preloading

### Metrics Targets
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

## Security

### Implemented Measures
- Security headers in next.config.js
- XSS protection
- Content Security Policy
- HTTPS enforcement
- Input sanitization

### Best Practices
- No sensitive data in client code
- Environment variables for secrets
- Regular dependency updates
- Security audits with npm audit

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and update content
- Monitor analytics and performance
- Check accessibility compliance
- Update documentation

### Monitoring
- Vercel Analytics integration
- Error tracking setup
- Performance monitoring
- User feedback collection

---

Last Updated: ${new Date().toISOString().split('T')[0]}