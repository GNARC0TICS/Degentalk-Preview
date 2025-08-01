# DegenTalk Landing - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📁 Project Structure at a Glance

```
degentalk-landing/
├── app/                 # Next.js pages (App Router)
├── components/          # React components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Hero, Header, etc.)
│   ├── common/         # Shared components
│   └── sections/       # Page sections
├── config/             # All configuration files
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── styles/             # Global CSS files
└── public/             # Static assets
```

## 🎨 Component Quick Reference

### Most Used UI Components

```tsx
// Button
import { Button } from '@/components/ui/button'
<Button variant="default" size="lg">Click Me</Button>

// Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Alert
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>

// Skeleton (Loading)
import { Skeleton } from '@/components/ui/skeleton'
<Skeleton className="w-full h-12" />
```

### Layout Components

```tsx
// Hero Section
import { HeroSection } from '@/components/layout/hero-section'
<HeroSection title="Welcome" subtitle="Subtitle" showCTA={true} />

// Loading Card
import { LoadingCard } from '@/components/common/LoadingCard'
<LoadingCard message="Loading..." />

// Error Display
import { StandardErrorDisplay } from '@/components/common/StandardErrorDisplay'
<StandardErrorDisplay title="Error" message="Failed" onRetry={handleRetry} />
```

## 🪝 Hooks Quick Reference

```tsx
// Media Query
import { useMediaQuery } from '@/hooks/useMediaQuery'
const isMobile = useMediaQuery('(max-width: 768px)')

// Toast Notifications
import { useToast } from '@/hooks/use-toast'
const { toast } = useToast()
toast({ title: "Success", description: "Done!" })

// Search Params
import { useSearchParams } from '@/hooks/useSearchParams'
const { searchParams, setSearchParams } = useSearchParams()
```

## 🎨 Theme & Styling

### Color Palette Quick Access

```scss
// Brand Colors
$primary: #10b981      // Emerald
$secondary: #fb923c    // Orange
$accent: #dc2626      // Red

// Semantic Colors
$success: #10b981
$warning: #f59e0b
$error: #ef4444
$info: #3b82f6

// Backgrounds (OLED optimized)
$bg-primary: #000000
$bg-card: #0d0d0d
$bg-elevated: #1a1a1a
```

### Common Tailwind Classes

```tsx
// Cards
className="bg-zinc-900/70 border border-zinc-700/50 hover:bg-zinc-900/90"

// Text
className="text-white"        // Primary text
className="text-zinc-400"     // Secondary text
className="text-emerald-400"  // Accent text

// Spacing
className="p-4 space-y-4"     // Padding + vertical spacing
className="gap-4"             // Flexbox/grid gap

// Animation
className="transition-all hover:scale-105"
className="animate-pulse"
```

## 🛠️ Utility Functions

```tsx
// Class Names Helper
import { cn } from '@/lib/utils'
const className = cn("base-class", condition && "conditional-class")

// Animate Number
import { animateNumber } from '@/lib/utils/animateNumber'
animateNumber(0, 100, 1000, (value) => setValue(value))

// Generate Slug
import { generateSlug } from '@/lib/utils/generateSlug'
const slug = generateSlug("Hello World") // "hello-world"
```

## 📧 Email Integration

```tsx
import { sendEmail } from '@/lib/email'

await sendEmail({
  name: "John Doe",
  email: "john@example.com",
  message: "Hello!"
})
```

## 📊 Analytics

```tsx
import { trackEvent, trackPageView } from '@/lib/analytics'

trackEvent('button_clicked', { button: 'cta' })
trackPageView('/about')
```

## ⚙️ Configuration Files

### Theme Config
```tsx
import theme from '@/config/theme.config'
// Access: theme.colors.brand.primary
```

### Brand Config
```tsx
import { brandConfig } from '@/config/brand.config'
// Access: brandConfig.cards.default
```

### Navigation
```tsx
import { navigation } from '@/config/navigation'
// Access: navigation.main
```

### Feature Flags
```tsx
import { isFeatureEnabled } from '@/config/featureFlags'
if (isFeatureEnabled('enableNewUI')) { /* ... */ }
```

## 🔧 Environment Variables

```bash
# Required for production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# EmailJS (for contact form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 📱 Responsive Breakpoints

```scss
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

## 🚨 Common Patterns

### Loading State
```tsx
if (loading) {
  return <LoadingCard message="Loading data..." />
}
```

### Error Handling
```tsx
if (error) {
  return (
    <StandardErrorDisplay 
      title="Error"
      message={error.message}
      onRetry={refetch}
    />
  )
}
```

### Protected Routes
```tsx
const { user } = useAuth()
if (!user) {
  router.push('/login')
  return null
}
```

### Form Submission
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    await sendEmail(formData)
    toast({ title: "Success", description: "Email sent!" })
  } catch (error) {
    toast({ 
      title: "Error", 
      description: "Failed to send",
      variant: "destructive" 
    })
  } finally {
    setLoading(false)
  }
}
```

## 🎯 TypeScript Tips

### Component Props
```tsx
interface ComponentProps {
  title: string
  subtitle?: string  // Optional
  onClick: () => void
  children: React.ReactNode
}
```

### API Response Types
```tsx
interface ApiResponse<T> {
  data?: T
  error?: string
  status: 'success' | 'error'
}
```

### Event Handlers
```tsx
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // Handle click
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Handle input change
}
```

## 🐛 Debugging Tips

```tsx
// Enable verbose logging
console.log('Component rendered:', { props, state })

// Check media queries
console.log('Is mobile:', window.matchMedia('(max-width: 768px)').matches)

// Inspect theme
console.log('Theme colors:', theme.colors)

// Check environment
console.log('Environment:', process.env.NODE_ENV)
```

## 📚 Useful Commands

```bash
# Clear Next.js cache
rm -rf .next

# Check bundle size
npm run build && npm run analyze

# Update all dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

## 🔗 Important Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Pro Tip**: Use VSCode with the following extensions for the best experience:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript React code snippets

Last Updated: ${new Date().toISOString().split('T')[0]}