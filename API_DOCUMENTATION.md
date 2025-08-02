# DegenTalk Landing - API Documentation

## Overview

This document provides detailed API documentation for all components, hooks, utilities, and configuration modules in the DegenTalk Landing project..

## Table of Contents

1. [Component APIs](#component-apis)
2. [Hook APIs](#hook-apis)
3. [Utility Functions](#utility-functions)
4. [Configuration APIs](#configuration-apis)
5. [Context APIs](#context-apis)

---

## Component APIs

### UI Components

#### Button Component
**Location**: `components/ui/button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

// Usage
<Button variant="default" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

**Props**:
- `variant`: Visual style of the button
- `size`: Size preset for the button
- `asChild`: Render as a child component (for composition)
- All standard HTML button attributes

#### Card Component
**Location**: `components/ui/card.tsx`

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

#### Alert Component
**Location**: `components/ui/alert.tsx`

```typescript
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// Usage
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong!</AlertDescription>
</Alert>
```

#### Carousel Component
**Location**: `components/ui/carousel.tsx`

```typescript
interface CarouselProps {
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

interface CarouselOptions {
  align?: 'start' | 'center' | 'end'
  loop?: boolean
  skipSnaps?: boolean
  duration?: number
}

// Usage
<Carousel opts={{ loop: true }}>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### Layout Components

#### HeroSection Component
**Location**: `components/layout/hero-section.tsx`

```typescript
interface HeroSectionProps {
  title?: string
  subtitle?: string
  showCTA?: boolean
  className?: string
}

// Usage
<HeroSection 
  title="Welcome to DegenTalk"
  subtitle="The ultimate crypto community"
  showCTA={true}
/>
```

#### AnnouncementTicker Component
**Location**: `components/layout/announcement-ticker.tsx`

```typescript
interface AnnouncementTickerProps {
  quotes?: string[]
  interval?: number
  className?: string
}

// Usage
<AnnouncementTicker 
  quotes={announcementQuotes}
  interval={5000}
/>
```

### Common Components

#### LoadingCard Component
**Location**: `components/common/LoadingCard.tsx`

```typescript
interface LoadingCardProps {
  message?: string
  showSpinner?: boolean
  className?: string
}

// Usage
<LoadingCard message="Loading content..." showSpinner={true} />
```

#### StandardErrorDisplay Component
**Location**: `components/common/StandardErrorDisplay.tsx`

```typescript
interface StandardErrorDisplayProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}

// Usage
<StandardErrorDisplay 
  title="Error"
  message="Failed to load data"
  onRetry={handleRetry}
  showRetry={true}
/>
```

#### BackToHomeButton Component
**Location**: `components/common/BackToHomeButton.tsx`

```typescript
interface BackToHomeButtonProps {
  className?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

// Usage
<BackToHomeButton variant="outline" size="sm" />
```

---

## Hook APIs

### useMediaQuery Hook
**Location**: `hooks/useMediaQuery.ts`

```typescript
function useMediaQuery(query: string): boolean

// Usage
const isMobile = useMediaQuery('(max-width: 768px)')
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
```

**Parameters**:
- `query`: Media query string

**Returns**: Boolean indicating if the media query matches

### useSearchParams Hook
**Location**: `hooks/useSearchParams.ts`

```typescript
function useSearchParams(): {
  searchParams: URLSearchParams
  setSearchParams: (params: URLSearchParams | Record<string, string>) => void
}

// Usage
const { searchParams, setSearchParams } = useSearchParams()
const page = searchParams.get('page')
setSearchParams({ page: '2' })
```

### useAuth Hook
**Location**: `hooks/use-auth.tsx`

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
}

function useAuth(): AuthContextType

// Usage
const { user, loading, login, logout } = useAuth()
```

### useToast Hook
**Location**: `hooks/use-toast.ts`

```typescript
interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastAction
  variant?: 'default' | 'destructive'
}

interface ToastAction {
  label: string
  onClick: () => void
}

function useToast(): {
  toast: (props: Omit<Toast, 'id'>) => void
  toasts: Toast[]
  dismiss: (toastId?: string) => void
}

// Usage
const { toast } = useToast()
toast({
  title: "Success",
  description: "Operation completed successfully",
  variant: "default"
})
```

---

## Utility Functions

### Class Name Utilities
**Location**: `lib/utils.ts`

```typescript
function cn(...inputs: ClassValue[]): string

// Usage
const className = cn(
  "base-class",
  condition && "conditional-class",
  { "object-class": true },
  ["array", "of", "classes"]
)
```

### Animation Utilities
**Location**: `lib/utils/animateNumber.ts`

```typescript
function animateNumber(
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing?: (t: number) => number
): () => void

// Usage
const cleanup = animateNumber(0, 100, 1000, (value) => {
  setCounter(Math.floor(value))
})
```

### Slug Generation
**Location**: `lib/utils/generateSlug.ts`

```typescript
function generateSlug(text: string): string

// Usage
const slug = generateSlug("Hello World!") // "hello-world"
```

### Category Utilities
**Location**: `lib/utils/category.ts`

```typescript
interface CategoryInfo {
  name: string
  slug: string
  color: string
  icon?: string
}

function getCategoryInfo(categorySlug: string): CategoryInfo | undefined
function getAllCategories(): CategoryInfo[]

// Usage
const category = getCategoryInfo('trading')
const allCategories = getAllCategories()
```

### Email Service
**Location**: `lib/email.ts`

```typescript
interface EmailParams {
  name: string
  email: string
  message: string
}

async function sendEmail(params: EmailParams): Promise<EmailResponse>

// Usage
await sendEmail({
  name: "John Doe",
  email: "john@example.com",
  message: "Hello from DegenTalk!"
})
```

### Analytics
**Location**: `lib/analytics.ts`

```typescript
function trackEvent(eventName: string, properties?: Record<string, any>): void
function trackPageView(url: string): void
function identifyUser(userId: string, traits?: Record<string, any>): void

// Usage
trackEvent('button_clicked', { button: 'cta' })
trackPageView('/about')
identifyUser('user123', { plan: 'premium' })
```

### Logger
**Location**: `lib/logger.ts`

```typescript
interface Logger {
  debug(message: string, data?: any): void
  info(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(message: string, error?: Error, data?: any): void
}

const logger: Logger

// Usage
logger.info('User logged in', { userId: '123' })
logger.error('Failed to load data', error, { endpoint: '/api/data' })
```

---

## Configuration APIs

### Theme Configuration
**Location**: `config/theme.config.ts`

```typescript
interface Theme {
  colors: ColorSystem
  typography: TypographySystem
  spacing: SpacingScale
  animation: AnimationSystem
  components: ComponentTokens
  breakpoints: Breakpoints
  zIndex: ZIndexScale
}

function getCSSVariable(path: string): string

// Usage
import theme from '@/config/theme.config'
const primaryColor = theme.colors.brand.primary
const spacing = theme.spacing[4]
```

### Brand Configuration
**Location**: `config/brand.config.ts`

```typescript
interface BrandConfig {
  colors: BrandColors
  animation: AnimationPatterns
  loading: LoadingStates
  error: ErrorStates
  stats: StatsDisplay
  cards: CardVariants
  typography: TypographyScale
  spacing: SpacingSystem
}

// Usage
import { brandConfig } from '@/config/brand.config'
const cardStyles = brandConfig.cards.default
```

### Navigation Configuration
**Location**: `config/navigation.ts`

```typescript
interface NavigationItem {
  name: string
  href: string
  icon?: string
  external?: boolean
}

interface NavigationConfig {
  main: NavigationItem[]
  footer: {
    product: NavigationItem[]
    community: NavigationItem[]
    legal: NavigationItem[]
  }
}

// Usage
import { navigation } from '@/config/navigation'
const mainNav = navigation.main
```

### Feature Flags
**Location**: `config/featureFlags.ts`

```typescript
interface FeatureFlags {
  enableNewUI: boolean
  enableBetaFeatures: boolean
  enableAnalytics: boolean
  maintenanceMode: boolean
}

function isFeatureEnabled(feature: keyof FeatureFlags): boolean

// Usage
if (isFeatureEnabled('enableNewUI')) {
  // Show new UI
}
```

---

## Context APIs

### UI Config Context
**Location**: `contexts/UIConfigContext.tsx`

```typescript
interface UIConfig {
  theme: 'light' | 'dark' | 'system'
  density: 'comfortable' | 'compact'
  animations: boolean
  reducedMotion: boolean
}

interface UIConfigContextType {
  config: UIConfig
  updateConfig: (updates: Partial<UIConfig>) => void
  resetConfig: () => void
}

// Usage
const { config, updateConfig } = useUIConfig()
updateConfig({ theme: 'dark' })
```

### Providers
**Location**: `app/providers.tsx`

```typescript
interface ProvidersProps {
  children: React.ReactNode
}

// Wraps the app with all necessary providers:
// - AuthProvider
// - UIConfigProvider
// - ToastProvider
// - Analytics
```

---

## Type Definitions

### Common Types

```typescript
// Component size variants
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Component variants
type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'

// Responsive values
type ResponsiveValue<T> = T | { sm?: T; md?: T; lg?: T; xl?: T }

// Class name values
type ClassValue = string | number | boolean | undefined | null | ClassValue[]

// API Response types
interface ApiResponse<T> {
  data?: T
  error?: string
  status: 'success' | 'error'
}
```

---

## Migration Guides

### From React Router to Next.js

The project includes compatibility layers for React Router:

```typescript
// Old (React Router)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/about')

// New (Next.js)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/about')
```

### Component Migration

All components are preserved from the original React app with minimal changes:

```typescript
// Components remain the same
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Only page wrappers changed
// Old: components/pages/home.tsx
// New: app/page.tsx (wrapper) + components/pages/home.tsx (unchanged)
```

---

## Best Practices

### Component Development
1. Use TypeScript interfaces for all props
2. Provide default props where appropriate
3. Include JSDoc comments for complex props
4. Export types alongside components
5. Use composition over configuration

### Hook Development
1. Prefix with 'use'
2. Return consistent API shapes
3. Handle cleanup in useEffect
4. Memoize expensive computations
5. Document side effects

### Configuration Management
1. Use const assertions for type safety
2. Export types alongside configs
3. Provide getter functions for nested values
4. Use environment variables for secrets
5. Document all configuration options

---

Last Updated: ${new Date().toISOString().split('T')[0]}